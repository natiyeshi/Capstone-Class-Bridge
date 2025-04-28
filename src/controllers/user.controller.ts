import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { User } from "@prisma/client";
import queryValidator from "../validators/query.validator";

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


export const updateUser = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Teacher ID not provided or invalid.")
    .safeParse(req.params);

  if(!queryParamValidation.success) {
    throw RouteError.BadRequest("Invalid ID format.");
  }
    
  const id = queryParamValidation.data.id;
  if (!id) throw RouteError.BadRequest("User Not Found!");

  const { firstName, lastName, phoneNumber } = req.body;

  if (!firstName || !lastName || !phoneNumber) {
    throw RouteError.BadRequest("Missing required fields: firstName, lastName, or phoneNumber");
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: { firstName, lastName, phoneNumber },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User updated successfully",
    result: updatedUser,
  });
});

export const updateMe = asyncWrapper(async (req, res) => {
  const id = req.user?._id ?? null;
  if (!id) throw RouteError.BadRequest("User Not Found!");

  const { firstName, lastName, phoneNumber } = req.body;

  if (!firstName || !lastName || !phoneNumber) {
    throw RouteError.BadRequest("Missing required fields: firstName, lastName, or phoneNumber");
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: { firstName, lastName, phoneNumber },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User updated successfully",
    result: updatedUser,
  });
});
