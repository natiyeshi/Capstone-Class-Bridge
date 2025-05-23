import jwt from "jsonwebtoken";
import { asyncWrapper, RouteError } from "../utils";
import { ENV } from "../config";

const authenticationMiddleWare = asyncWrapper(async (req, _, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader)
    throw  RouteError.Unauthorized("You are't authenticated");
  const token = authorizationHeader.split(" ")[1];

  if (!token || !token.trim())
    throw  RouteError.BadRequest(
      "Token not provided in autherization header."
    );

  const payload = jwt.verify(token, ENV.JWT_SECRET) as {
    userId: string;
    role: string;
  };

  const { userId,role } = payload;
  req.user = { _id: userId, role : role } as any;
  next();
});

export default { authenticationMiddleWare };
