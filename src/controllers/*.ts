import { Hono } from "hono";
import user from "./user";
import game from "./game";

const api = new Hono();

api.route("/user", user).route("/game", game);

export default api;
