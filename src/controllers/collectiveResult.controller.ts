import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { CollectiveResult } from "@prisma/client";
import { CollectiveResultSchema } from "../validators/collective.validator";
import queryValidator from "../validators/query.validator";

export const getCollectiveResultsController = asyncWrapper(async (req, res) => {
  const users = await db.collectiveResult.findMany({
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
    message: "CollectiveResults retrived successfully",
    result: users,
  });
});



export const createCollectiveResultsController = asyncWrapper(async (req, res) => {
   
   const queryParamValidation = queryValidator
        .queryParamIDValidator("Student ID not provided or invalid.")
        .safeParse(req.params);
  
    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
                
    const bodyValidation = CollectiveResultSchema.safeParse(req.body);
        
    if (!bodyValidation.success)
        throw RouteError.BadRequest(
        zodErrorFmt(bodyValidation.error)[0].message,
        zodErrorFmt(bodyValidation.error)
        );

    // Check if student exists and get their section ID
    const student = await db.student.findFirst({
        where: { 
            id: queryParamValidation.data.id,
        },
        include: {
            section: true
        }
    });

    if (!student)
        throw RouteError.NotFound("Student not found.");

    if (!student.section)
        throw RouteError.BadRequest("Student is not assigned to any section.");
            
    const studentResults = await db.result.findMany({
        where: { 
            studentId: queryParamValidation.data.id,
        },
    });

    if (!studentResults.length)
        throw RouteError.BadRequest("No results found for this student.");

    // Calculate total score as average of all results
    const totalScore = studentResults.reduce((sum, result) => {
        const resultScore = (result.test1 ?? 0) + 
                          (result.test2 ?? 0) + 
                          (result.final ?? 0) + 
                          (result.mid ?? 0) + 
                          (result.quiz ?? 0) + 
                          (result.assignment ?? 0);
        return sum + resultScore;
    }, 0) / studentResults.length;

    const studentCollectiveResult = await db.collectiveResult.findFirst({
        where: { 
            studentId: queryParamValidation.data.id,
        },
    });
    
    let collectiveResult = null;

    if(!studentCollectiveResult){
        collectiveResult = await db.collectiveResult.create({
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: student.sectionId,
                feedback: bodyValidation.data.feedback,
                conduct: bodyValidation.data.conduct,
                totalScore,
            },
        });
    } else {
        collectiveResult = await db.collectiveResult.update({
            where: {
                studentId: queryParamValidation.data.id,
            },
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: student.sectionId,
                feedback: bodyValidation.data.feedback,
                conduct: bodyValidation.data.conduct,
                totalScore,
            },
        });
    }
    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "CollectiveResult updated successfully",
        result: collectiveResult,
    });    
});


  
export const getCollectiveResultByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
      .queryParamIDValidator("CollectiveResult ID not provided or invalid.")
      .safeParse(req.params);
    
      if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
      
    const collectiveresult = await db.collectiveResult.findFirst({
      where:{
        id: queryParamValidation.data.id,
      },
      include:{
        student : {
          include : {
            user : true,
          }
        },
      }
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "CollectiveResult retrived successfully",
      result: collectiveresult,
    });
  });

export const getCollectiveResultByStudentIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Student ID not provided or invalid.")
    .safeParse(req.params);
  
  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  
  const collectiveResult = await db.collectiveResult.findUnique({
    where: {
      studentId: queryParamValidation.data.id,
    },
    include: {
      student: {
        include: {
          user: true,
        }
      },
    }
  });

  if (!collectiveResult)
    throw RouteError.NotFound("Collective result not found for this student.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Collective result retrieved successfully",
    result: collectiveResult,
  });
});

  
//   export const deleteCollectiveResultController = asyncWrapper(async (req, res) => {
//       const queryParamValidation = queryValidator
//           .queryParamIDValidator("CollectiveResult ID not provided or invalid.")
//           .safeParse(req.params);
//       const collectiveresult = await db.collectiveresult.delete({
//         where:{
//           id: queryParamValidation.data!.id,
//          }
//       });
//       return sendApiResponse({
//         res,  
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "CollectiveResult deleted successfully",
//         result: collectiveresult,
//       });
//     });