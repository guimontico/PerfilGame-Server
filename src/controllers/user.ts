import { Context, Hono } from "hono";
import { supabase } from "../db";
import { authenticateUser } from "../middlewares/middleware";

const user = new Hono();

user.get("/", authenticateUser, async (c: Context) => {
  const { id } = c.get("payload");
  const { data: user, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.log("error:", error);
    return c.json(error);
  }
  return c.json(user);
});

export default user;
