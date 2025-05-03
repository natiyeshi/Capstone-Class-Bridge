import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Result } from "@prisma/client";
import { CreateResultSchema } from "../validators/result.validator";
import queryValidator from "../validators/query.validator";

export const getResultsController = asyncWrapper(async (req, res) => {
  const users = await db.result.findMany({
    include:{
        student: {
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
    message: "Results retrived successfully",
    result: users,
  });
});

export const getStudentResultsController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
  .queryParamIDValidator("Student ID not provided or invalid.")
  .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  
  const users = await db.result.findUnique({
    where : { studentId : queryParamValidation.data.id },
    include:{
        student: {
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
    message: "Results retrived successfully",
    result: users,
  });
});


export const getStudentsResultsController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
  .queryParamIDValidator("Section ID not provided or invalid.")
  .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  
  const users = await db.result.findMany({
    where : { sectionId : queryParamValidation.data.id },
    include:{
        student: {
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
    message: "Results retrived successfully",
    result: users,
  });
});


const isCh = (a: any, b : any) => {
    return a === undefined || a === null ? b : a; 
}


export const updateResultsController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = CreateResultSchema.safeParse(req.body);
        
        if (!bodyValidation.success)
            throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
            );
        
        const existingResult = await db.result.findFirst({
            where: { studentId : bodyValidation.data.studentId },
        });
        
        if (!existingResult) {
            const result = await db.result.create({
                data: {
                    test1: bodyValidation.data.test1,
                    test2: bodyValidation.data.test2,
                    mid: bodyValidation.data.mid,
                    final: bodyValidation.data.final,
                    assignment: bodyValidation.data.assignment,
                    quiz: bodyValidation.data.quiz,
                    teacherId: bodyValidation.data.teacherId,
                    studentId: bodyValidation.data.studentId,
                    sectionId: bodyValidation.data.sectionId,
                    subjectId: bodyValidation.data.subjectId,
                },
            });

            return sendApiResponse({
                res,
                statusCode: StatusCodes.OK,
                success: true,
                message: "Results created successfully",
                result: result,
              });
            
        }

        const user = await db.result.findUnique({
            where: { studentId: bodyValidation.data.studentId },
          });
        
        const result = await db.result.update({
            where: { studentId: bodyValidation.data.studentId },
            data: {
                test1: isCh(bodyValidation.data.test1,user?.test1),
                test2: isCh(bodyValidation.data.test2,user?.test2),
                mid:  isCh(bodyValidation.data.mid,user?.mid),
                final: isCh(bodyValidation.data.final,user?.final),
                assignment: isCh(bodyValidation.data.assignment,user?.assignment),
                quiz: isCh(bodyValidation.data.quiz,user?.quiz),
            },
        });
        
        return sendApiResponse({
            res,
            statusCode: StatusCodes.OK,
            success: true,
            message: "Result updated successfully",
            result: result,
        });    
   
  });


  
  export const getResultByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
      .queryParamIDValidator("Result ID not provided or invalid.")
      .safeParse(req.params);
    
      if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
      
    const result = await db.result.findFirst({
      where:{
        id: queryParamValidation.data.id,
      },
      include:{
        student : {
          include : {
            user : true,
          }
        },
        subject : true,}
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Result retrived successfully",
      result: result,
    });
  });


  
  export const deleteResultController = asyncWrapper(async (req, res) => {
      const queryParamValidation = queryValidator
          .queryParamIDValidator("Result ID not provided or invalid.")
          .safeParse(req.params);
      const result = await db.result.delete({
        where:{
          id: queryParamValidation.data!.id,
         }
      });
      return sendApiResponse({
        res,  
        statusCode: StatusCodes.OK,
        success: true,
        message: "Result deleted successfully",
        result: result,
      });
    });