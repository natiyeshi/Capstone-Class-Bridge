import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Subject } from "@prisma/client";
import {SubjectValidator} from "../validators/subject.validator";
import queryValidator from "../validators/query.validator";

export const getSubjectsController = asyncWrapper(async (req, res) => {
  const subjects = await db.subject.findMany();
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subjects retrived successfully",
    result: subjects,
  });
});


export const getSubjectByIdController = asyncWrapper(async (req, res) => {
 const queryParamValidation = queryValidator
     .queryParamIDValidator("Subject ID not provided or invalid.")
     .safeParse(req.params);
   
     if (!queryParamValidation.success)
       throw RouteError.BadRequest(
         zodErrorFmt(queryParamValidation.error)[0].message,
         zodErrorFmt(queryParamValidation.error)
       );
     
   const subject = await db.subject.findFirst({
     where:{
       id: queryParamValidation.data.id,
     },
    
   });
   return sendApiResponse({
     res,
     statusCode: StatusCodes.OK,
     success: true,
     message: "Subject retrived successfully",
     result: subject,
   });
});




export const createSubjectController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = SubjectValidator.safeParse(req.body);
       
    if (!bodyValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
        );

    const existingSubject = await db.subject.findFirst({
        where: { name: bodyValidation.data.name },
    });
    
    if (existingSubject) throw RouteError.BadRequest("Subject already in use.");
    
    const subject = await db.subject.create({
        data : {
            name : bodyValidation.data.name,
        }
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Subject created successfully",
      result: subject,
    });
  });

