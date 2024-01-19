import { Context, Hono } from "hono";
import { supabase } from "../db";
import { env } from "bun";
import { authenticateUser } from "../middlewares/middleware";

const game = new Hono();

game.post("/", authenticateUser, async (c: Context) => {
  const { id } = await c.get("payload");
  const { category, context, difficulty } = await c.req.json();

  let { data: games, error } = await supabase
    .from("game")
    .select("*")
    .eq("userId", id);

  if (error) {
    console.log("error2:", error);
  }

  if (!!games) {
    const promptText = `
    Generate JSON with this rules:
     - must be in ${category} category of things,
     - must be ${difficulty} for people to guess,
     - don't repeat those: ${games.map((game) => game.name).join(", ")},
     - hints must be in brazilian portuguese, 
     - the guess must have this contexts: ${context.join(", ")} 
     - have 20 hints with out the name in the hint
     - the hints must be randonly easy, medium and hard hints
     - return the full name of the thing
     - have this JSON format: { 'name': '', 'hints': [{'id': number, 'hint': string] }`;

    const payload = {
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for a guess game.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
          ],
        },
      ],
      max_tokens: 800,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json().then((data) => {
        const gameResult = JSON.parse(data["choices"][0]["message"]["content"]);
        return gameResult;
      });
      if (!!result) {
        await supabase.from("game").insert([
          {
            name: !!result.name ? result.name : "no name",
            userId: id,
            category: category,
            difficulty: difficulty,
            context: context,
          },
        ]);

        return c.json(result);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
});

export default game;
