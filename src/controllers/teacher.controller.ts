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

// getTeachersByIdController


export const getTeachersByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
  .queryParamIDValidator("Teacher ID not provided or invalid.")
  .safeParse(req.params);

  const teacher = await db.teacher.findUnique({
    where : { id: queryParamValidation.data!.id },
    include:{
        user: true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Teacher retrived successfully",
    result: teacher,
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
         gender: bodyValidation.data.gender,
         dateOfBirth: bodyValidation.data.dateOfBirth,
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


 
 export const deleteTeacherController = asyncWrapper(async (req, res) => {
      const queryParamValidation = queryValidator
               .queryParamIDValidator("Message ID not provided or invalid.")
               .safeParse(req.params);
             
       const teacher = await db.teacher.delete({
               where: { id: queryParamValidation.data!.id },
       });
                 
      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Teacher Deleted successfully",
        result: teacher,
      });
    });

export const getRelatedUsersController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Teacher ID not provided or invalid.")
    .safeParse(req.params);
  
  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  // Find all sections and subjects for this teacher
  const teacherSections = await db.teacherSectionSubject.findMany({
    where: {
      teacherId: queryParamValidation.data.id
    },
    include: {
      section: {
        include: {
          students: {
            include: {
              parent: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Get director information
  const director = await db.director.findMany({
    where:{
      userId : {
        not: null,
      }
    },
    include: {
      user: true
    }
  });

  interface RelatedUsers {
    parents: Array<{
      id: string;
      user: any;
    }>;
    director: {
      id: string;
      user: any;
    }[] | null;
  }

  // Extract unique parents
  const relatedUsers = teacherSections.reduce<RelatedUsers>((acc, tss) => {
    if (!tss.section) return acc;
    
    tss.section.students.forEach(student => {
      // Add parent if not already in accumulator
      if (student.parent && !acc.parents.some(p => p.id === student.parent.id)) {
        acc.parents.push(student.parent);
      }
    });
    return acc;
  }, { parents: [], director: null });

  // Add director information
  if (director) {
    relatedUsers.director = director;
  }

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Related users retrieved successfully",
    result: relatedUsers
  });
});
