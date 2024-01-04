import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import api from "./controllers/*";

const app = new Hono();

app.use("*", logger()).use("*", prettyJSON()).route("/api", api);

export default app;
