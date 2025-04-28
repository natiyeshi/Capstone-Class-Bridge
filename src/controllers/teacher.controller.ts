import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Teacher } from "@prisma/client";
import { authValidator } from "../validators";
import queryValidator from "../validators/query.validator";

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
         role : "TEACHER",
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


  export const activateTeacherController = asyncWrapper(async (req, res) => {
    const { password } = req.body;
    const id = req.user?._id ?? null;
    
    if (!id) throw RouteError.BadRequest("User not found.");
    
    const existingUser = await db.user.findUnique({
      where: { id },
    });
  
    if (!existingUser) throw RouteError.BadRequest("User doesn't exist in use.");
    
    const existingTeacher = await db.teacher.findFirst({
      where: { userId : id },
    });

    if(existingTeacher?.isActivated) throw RouteError.BadRequest("Teacher already activated.");
    
    const hashedPassword = await passwordCrypt.hashPassword(
      password
    );
  
    const teacher = await db.teacher.updateMany({
      where: { userId : id },
      data: {
        isActivated: true,
      },
    });

    const user = await db.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  
    const { password : a, ...userDto } = user;

   return sendApiResponse({
     res,
     statusCode: StatusCodes.OK,
     success: true,
     message: "Teacher Activated  successfully",
     result: userDto,
   });
 });
