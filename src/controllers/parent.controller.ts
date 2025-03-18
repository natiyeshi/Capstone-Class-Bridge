import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Parent } from "@prisma/client";

export const getParentsController = asyncWrapper(async (req, res) => {
  const Parents = await db.parent.findMany();
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Parents retrived successfully",
    result: Parents,
  });
});
