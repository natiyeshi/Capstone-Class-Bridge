import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Student } from "@prisma/client";
import { authValidator } from "../validators";

export const getStudentsController = asyncWrapper(async (req, res) => {
  const users = await db.student.findMany({
    include:{
        user: true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Students retrived successfully",
    result: users,
  });
});

export const createStudentController = asyncWrapper(async (req, res) => {
   const bodyValidation = authValidator.signUpStudentSchema.safeParse(req.body);
   
     if (!bodyValidation.success)
       throw RouteError.BadRequest(
         zodErrorFmt(bodyValidation.error)[0].message,
         zodErrorFmt(bodyValidation.error)
       );
   
     const existingUser = await db.user.findUnique({
       where: { email: bodyValidation.data.email },
     });
   
     if (existingUser) throw RouteError.BadRequest("Email already in use.");
   
     const existingParent = await db.parent.findUnique({
        where: { id: bodyValidation.data.parentId },
      });
    
      if (!existingParent) throw RouteError.BadRequest("Parent doesn't exist.");
    
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
         role : "STUDENT",

       },
     });
   
     const { password, ...userDto } = user;

    const student = await db.student.create({
        data : {
            userId : user.id,
            parentId : bodyValidation.data.parentId,
        },
        include : {
            user : true,
        }
     })

    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Student created successfully",
      result: student,
    });
  });
