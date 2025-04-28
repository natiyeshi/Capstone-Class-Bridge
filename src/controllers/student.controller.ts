import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Student } from "@prisma/client";
import { authValidator } from "../validators";
import queryValidator from "../validators/query.validator";

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


export const getStudentByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
  .queryParamIDValidator("Student ID not provided or invalid.")
  .safeParse(req.params);

  const student = await db.student.findUnique({
    where : { id: queryParamValidation.data!.id },
    include:{
        user: true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Student retrived successfully",
    result: student,
  });
});

export const updateStudentController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
       .queryParamIDValidator("Student ID not provided or invalid.")
       .safeParse(req.params);

  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) throw RouteError.NotFound("First Name and Last Name should be provided not found.");

  const student = await db.student.findUnique({
    where: { id: queryParamValidation.data!.id },
    include: { user: true },
  });

  if (!student) throw RouteError.NotFound("Student not found.");

  const updatedUser = await db.user.update({
    where: { id: student.userId! },
    data: {
      firstName: firstName,
      lastName: lastName,
    },
  });

  const { password, ...userDto } = updatedUser;

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Student updated successfully",
    result: userDto,
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


export const deleteStudentController = asyncWrapper(async (req, res) => {
     const queryParamValidation = queryValidator
              .queryParamIDValidator("Message ID not provided or invalid.")
              .safeParse(req.params);
            
      const student = await db.student.delete({
              where: { id: queryParamValidation.data!.id },
      });
                
     return sendApiResponse({
       res,
       statusCode: StatusCodes.OK,
       success: true,
       message: "Student Deleted successfully",
       result: student,
     });
   });
