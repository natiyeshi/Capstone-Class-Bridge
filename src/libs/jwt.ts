import jwt from "jsonwebtoken";
import { COOKIE_EXPIRATION, ENV } from "../config";

const signToken = (payload: Object) => {
  const secret = ENV.JWT_SECRET;
  if (!secret)
    throw new Error("Secret not found in environment for JWT signing");
  return jwt.sign(payload, secret, { expiresIn: COOKIE_EXPIRATION.getTime() });
};

const isValidToken = <T>(token: string) => {
  const secret = ENV.JWT_SECRET;
  if (!secret)
    throw new Error("Secret not found in environment for JWT verification");
  return jwt.verify(token, secret) as T;
};

export default {
  signToken,
  isValidToken,
};
