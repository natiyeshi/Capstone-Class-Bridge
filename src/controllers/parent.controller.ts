import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Parent } from "@prisma/client";
import { authValidator } from "../validators";
import queryValidator from "../validators/query.validator";

export const getParentsController = asyncWrapper(async (req, res) => {
  const users = await db.parent.findMany({
    include:{
        user: true,
        students: {
            include: {
                user: true,
            }
        },
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Parents retrived successfully",
    result: users,
  });
});

export const deleteParentController = asyncWrapper(async (req, res) => {
     const queryParamValidation = queryValidator
              .queryParamIDValidator("Parent ID not provided or invalid.")
              .safeParse(req.params);
            
      const parent = await db.parent.delete({
              where: { id: queryParamValidation.data!.id },
      });
                
     return sendApiResponse({
       res,
       statusCode: StatusCodes.OK,
       success: true,
       message: "Parent Deleted successfully",
       result: parent,
     });
   });


   
export const getParentByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
           .queryParamIDValidator("Parent ID not provided or invalid.")
           .safeParse(req.params);
         
   const parent = await db.parent.findFirst({
           where: { id: queryParamValidation.data!.id },
           include:{
            user: true,
            students: {
                include: {
                    user: true,
                }
            },
        }
   });
             
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Parent retrived successfully",
    result: parent,
  });
});

export const createParentController = asyncWrapper(async (req, res) => {
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
         gender: bodyValidation.data.gender,
         dateOfBirth: bodyValidation.data.dateOfBirth,
         role : "PARENT",

       },
     });
   
     const { password, ...userDto } = user;

    const parent = await db.parent.create({
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
      message: "Parent created successfully",
      result: parent,
    });
  });


  export const activateParentController = asyncWrapper(async (req, res) => {
      const { password } = req.body;
      const id = req.user?._id ?? null;
      
      if (!id) throw RouteError.BadRequest("User not found.");
      
      const existingUser = await db.user.findUnique({
        where: { id },
      });
    
      if (!existingUser) throw RouteError.BadRequest("User doesn't exist in use.");
    
      const existingParent = await db.parent.findFirst({
        where: { userId : id },
      });
  
      if(existingParent?.isActivated) throw RouteError.BadRequest("Parent already activated.");
      
      const hashedPassword = await passwordCrypt.hashPassword(
        password
      );
    
      const parent = await db.parent.updateMany({
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
       message: "Parent Activated  successfully",
       result: userDto,
     });
   });
 

export const addStudentToParentController = asyncWrapper(async (req, res) => {
    const bodyValidation = Array.isArray(req.body) && req.body.every(item => typeof item === "string")
      ? req.body
      : (() => { throw RouteError.BadRequest("Request body must be an array of student id."); })();
    const queryParamValidation = queryValidator
      .queryParamIDValidator("Parent ID not provided or invalid.")
      .safeParse(req.params);
    
    
      const pr = await db.parent.findUnique({
        where: { id : queryParamValidation.data!.id  },
      });
    
      if (!pr) throw RouteError.BadRequest("Parent does not exist.");
    
      const parent = await db.parent.update({
        where: { id: queryParamValidation.data!.id },
        data: {
          students: {
        connect: bodyValidation.map(studentId => ({ id: studentId })),
          },
        },
        include: {
          students: true,
        },
      });
 
     return sendApiResponse({
       res,
       statusCode: StatusCodes.OK,
       success: true,
       message: "children added successfully successfully",
       result: parent,
     });
   });