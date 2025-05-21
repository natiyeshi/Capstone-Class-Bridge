import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Director } from "@prisma/client";
import { authValidator } from "../validators";

export const getDirectorsController = asyncWrapper(async (req, res) => {
  const users = await db.director.findMany({
    include:{
        user: true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Directors retrived successfully",
    result: users,
  });
});

export const createDirectorController = asyncWrapper(async (req, res) => {
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
         role : "DIRECTOR",
       },
     });
   
     const { password, ...userDto } = user;

    const director = await db.director.create({
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
      message: "Director created successfully",
      result: director,
    });
  });

export const getRelatedUsersController = asyncWrapper(async (req, res) => {
  const id = req.user?._id ?? null;
  const users = await db.user.findMany({
    where : {
      role : {
        notIn : ["UNKNOWN","STUDENT"]
      }
    },
    include: {
      Director: true,
      Parent: true,
      Teacher: true,
      Student: true
    }
  });

  const usersWithRoles = users.map(user => {
    const roleData: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string | null;
      roleSpecificId: string | null;
    } = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roleSpecificId: null
    };

    switch (user.role) {
      case 'DIRECTOR':
        roleData.roleSpecificId = user.Director?.[0]?.id ?? null;
        break;
      case 'PARENT':
        roleData.roleSpecificId = user.Parent?.[0]?.id ?? null;
        break;
      case 'TEACHER':
        roleData.roleSpecificId = user.Teacher?.[0]?.id ?? null;
        break;
    }

    return roleData;
  });

  const l = usersWithRoles.filter(d => d.id != id)

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users with role-specific information retrieved successfully",
    result: l,
  });
});


