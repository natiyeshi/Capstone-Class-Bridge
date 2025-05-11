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
  const existingUser = await db.user.findUnique({ where : { id }});
  if (!existingUser) throw RouteError.BadRequest("Invalid email or password");
  
  if (existingUser.role === "UNKNOWN")
    throw RouteError.BadRequest("Please wait while admin defines your role.");
  
  let isActivated = null

  let detail = null;

    if (existingUser.role === "TEACHER") {
      const teacher = await db.teacher.findFirst({
        where: { userId: existingUser.id },
      });
      if (!teacher) throw RouteError.BadRequest("You are not a teacher.");
      detail = teacher;
      isActivated = teacher.isActivated;
    } else if (existingUser.role === "PARENT") {
      const parent = await db.parent.findFirst({
        where: { userId: existingUser.id },
      });
      if (!parent) throw RouteError.BadRequest("You are not a parent.");
      detail = parent;
      isActivated = parent.isActivated;
    } else if (existingUser.role === "DIRECTOR") {
      const director = await db.director.findFirst({
        where: { userId: existingUser.id },
      });
      if (!director) throw RouteError.BadRequest("You are not an director.");
      detail = director;
      isActivated = true;
    }
  
  
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrived successfully",
    result: { user: existingUser, roleId : detail?.id, isActivated },
  });
});


export const updateUser = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("User ID not provided or invalid.")
    .safeParse(req.params);

  if(!queryParamValidation.success) {
    throw RouteError.BadRequest("Invalid ID format.");
  }
    
  const id = queryParamValidation.data.id;
  if (!id) throw RouteError.BadRequest("User Not Found!");

  const { firstName, lastName, phoneNumber,gender,dateOfBirth,profile } = req.body;


  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw RouteError.BadRequest("User not found.");
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
      gender: gender ? gender : user.gender,
      dateOfBirth: dateOfBirth ? dateOfBirth : user.dateOfBirth,
      profile: profile ? profile : user.profile,
    },
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

  const { firstName, lastName, phoneNumber,gender,dateOfBirth,profile } = req.body;

  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    throw RouteError.BadRequest("User not found.");
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
      gender: gender ? gender : user.gender,
      dateOfBirth: dateOfBirth ? dateOfBirth : user.dateOfBirth,
      profile: profile ? profile : user.profile,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User updated successfully",
    result: updatedUser,
  });
});



 export const deleteUserController = asyncWrapper(async (req, res) => {
      const queryParamValidation = queryValidator
               .queryParamIDValidator("Message ID not provided or invalid.")
               .safeParse(req.params);
             
       const user = await db.user.delete({
               where: { id: queryParamValidation.data!.id },
       });
                 
      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "User Deleted successfully",
        result: user,
      });
    });


    
    export const getUserById = asyncWrapper(async (req, res) => {
      const queryParamValidation = queryValidator
      .queryParamIDValidator("User ID not provided or invalid.")
      .safeParse(req.params);
    
      const user = await db.user.findUnique({
        where : { id: queryParamValidation.data!.id },
      });
      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "User retrived successfully",
        result: user,
      });
    });