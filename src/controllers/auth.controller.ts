import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Parent } from "@prisma/client";

export const signUpControllerParent = asyncWrapper(async (req, res) => {
  const users = await db.user.findMany();
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrived successfully",
    result: users,
  });
});
