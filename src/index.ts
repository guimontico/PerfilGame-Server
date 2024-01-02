import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import api from "./controllers/*";

const app = new Hono();

app
  .use("*", logger())
  .use("*", prettyJSON())
  .use("*", cors())
  .route("/api", api);

export default app;
