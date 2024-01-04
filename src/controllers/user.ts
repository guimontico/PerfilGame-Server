import { Hono } from "hono";
import { supabase } from "../db";

const user = new Hono();

user.get("/", async (c) => {
  const { data: user, error } = await supabase.from("profile").select("*");
  if (error) {
    console.log("error:", error);
    return c.json(error);
  }
  return c.json(user);
});

export default user;
