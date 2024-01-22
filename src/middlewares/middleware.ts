import { MiddlewareHandler } from "hono";
import { decode, verify } from "hono/jwt";

import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

const authenticate = async (jwtToken: string, secret: string) => {
  let authorized = false;
  let payload;
  try {
    authorized = await verify(jwtToken, secret);
    const decoded = decode(jwtToken);
    payload = decoded.payload;
  } catch (e) {}
  return { authorized, payload };
};

export const authenticateUser: MiddlewareHandler = async (c, next) => {
  const credentials = c.req.header("Authorization");
  if (!credentials) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please send JWT token");
  }

  const parts = credentials.split(/\s+/);
  if (parts.length !== 2) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token invalid");
  }

  const jwtToken = parts[1];
  console.log("jwtToken:", jwtToken);
  const { authorized, payload } = await authenticate(
    jwtToken,
    process.env.JWT_SECRET ?? ""
  );
  console.log("payload:", process.env.JWT_SECRET);
  if (!authorized || !payload) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }

  c.set("payload", payload);
  await next();
};
