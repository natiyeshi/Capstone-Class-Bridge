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

const checkRoleMiddleware = (allowedRoles: string[]) => {
  return asyncWrapper(async (req : any, _, next) => {
    if (!req.user) {
      throw RouteError.Unauthorized("Authentication required");
    }

    const userRole = req.user?.role ?? null;
    
    if (!allowedRoles.includes(userRole)) {
      throw RouteError.Forbidden("You don't have permission to access this resource");
    }

    next();
  });
};

// Update the export to include both middleware functions
export default { 
  authenticationMiddleWare,
  checkRoleMiddleware 
};