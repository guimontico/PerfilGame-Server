import { Context, Hono } from "hono";
import { client } from "../db";
import { env } from "bun";

const db = client;
const game = new Hono();

game.post("/:userId", async (c: Context) => {
  const { userId } = c.req.param();
  const { category, context, difficulty } = await c.req.json();

  const games = await db.game.findMany({
    where: {
      userId: Number(userId),
      category: category,
    },
  });
  if (!!games) {
    console.log("user Games:", games.map((game) => game.name).join(", "));
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

    console.log("promptText:", promptText);
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
        // const gameResult = result["choices"][0]["message"]["content"];

        const newGame = await db.game.create({
          data: {
            name: !!result.name ? result.name : "no name",
            userId: Number(userId),
            category: category,
            difficulty: difficulty,
            context: context,
          },
        });
        return c.json(result);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
});

export default game;
