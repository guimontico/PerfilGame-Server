import { Hono } from "hono";

const user = new Hono();

user.get("/", (c) => c.text("Hello Hono!"));

export default user;
