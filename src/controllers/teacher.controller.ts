import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Teacher } from "@prisma/client";
import { authValidator } from "../validators";

export const getTeachersController = asyncWrapper(async (req, res) => {
  const users = await db.teacher.findMany({
    include:{
        user: true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Teachers retrived successfully",
    result: users,
  });
});

export const createTeacherController = asyncWrapper(async (req, res) => {
   const bodyValidation = authValidator.signUpSchema.safeParse(req.body);
   
     if (!bodyValidation.success)
       throw RouteError.BadRequest(
         zodErrorFmt(bodyValidation.error)[0].message,
         zodErrorFmt(bodyValidation.error)
       );
   
     const existingUser = await db.user.findUnique({
       where: { email: bodyValidation.data.email },
     });
   
     if (existingUser) throw RouteError.BadRequest("Email already in use.");
   
     const hashedPassword = await passwordCrypt.hashPassword(
       bodyValidation.data.password
     );
   
     const user = await db.user.create({
       data: {
         firstName: bodyValidation.data.firstName,
         lastName: bodyValidation.data.lastName,
         email: bodyValidation.data.email,
         phoneNumber: bodyValidation.data.phoneNumber,
         password: hashedPassword,
       },
     });
   
     const { password, ...userDto } = user;

    const teacher = await db.teacher.create({
        data : {
            userId : user.id,
        },
        include : {
            user : true,
        }
     })

    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Teacher created successfully",
      result: teacher,
    });
  });
