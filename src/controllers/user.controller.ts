import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { User } from "@prisma/client";

export const getUsersController = asyncWrapper(async (req, res) => {
  const users = await db.user.findMany();
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrived successfully",
    result: users,
  });
});


export const getMe = asyncWrapper(async (req, res) => {
  const id = req.user?._id ?? null;
  if (!id) throw RouteError.BadRequest("User Not Found!");
  const users = await db.user.findUnique({ where : { id }});
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrived successfully",
    result: users,
  });
});
