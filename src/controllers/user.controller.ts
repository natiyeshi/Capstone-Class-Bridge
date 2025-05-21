import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { User } from "@prisma/client";
import queryValidator from "../validators/query.validator";
import { sendVerificationOTP, verifyOTP } from '../services/sms.service';
import { z } from 'zod';

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

// Validation schema for phone verification
const verifyPhoneSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits")
});

export const sendVerificationOTPController = asyncWrapper(async (req, res) => {
  const id = req.user?._id ?? null;
  if (!id) throw RouteError.BadRequest("User not found");

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw RouteError.BadRequest("User not found");
  }

  if (!user.phoneNumber) {
    throw RouteError.BadRequest("Phone number not set. Please update your profile with a phone number first.");
  }

  if (user.isPhoneVerified) {
    throw RouteError.BadRequest("Phone number is already verified");
  }

  const result = await sendVerificationOTP(user.phoneNumber);
  
  if (!result.success) {
    throw RouteError.BadRequest(result.error || "Failed to send verification code");
  }

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Verification code sent successfully",
    result: {
      message: "A verification code has been sent to your phone number"
    }
  });
});

export const verifyPhoneNumberController = asyncWrapper(async (req, res) => {
  const id = req.user?._id ?? null;
  if (!id) throw RouteError.BadRequest("User not found");

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw RouteError.BadRequest("User not found");
  }

  if (!user.phoneNumber) {
    throw RouteError.BadRequest("Phone number not set");
  }

  if (user.isPhoneVerified) {
    throw RouteError.BadRequest("Phone number is already verified");
  }

  const bodyValidation = verifyPhoneSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { code } = bodyValidation.data;

  const result = await verifyOTP(user.phoneNumber, code);
  
  if (!result.success) {
    throw RouteError.BadRequest(result.error || "Invalid verification code");
  }

  // Update user's phone verification status
  const updatedUser = await db.user.update({
    where: { id },
    data: { isPhoneVerified: true }
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Phone number verified successfully",
    result: {
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        isPhoneVerified: updatedUser.isPhoneVerified
      }
    }
  });
});