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

            
        
            const studentResult = await db.result.findFirst({
              where: { 
                  studentId : queryParamValidation.data.id,
                  },
            });

            if (!studentResult)
              throw RouteError.BadRequest(
              "Student Result not found.",
              );

        
        const totalScore = (studentResult.test1 ?? 0) + (studentResult.test2 ?? 0) + (studentResult.final ?? 0) + (studentResult.mid ?? 0) + (studentResult.quiz ?? 0) + (studentResult.assignment ?? 0)  
            

        const studentCollectiveResult = await db.collectiveResult.findFirst({
          where: { 
              studentId : queryParamValidation.data.id,
              },
        });
        
        let collectiveResult = null

        if(!studentCollectiveResult){
        
          collectiveResult = await db.collectiveResult.create({
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: bodyValidation.data.sectionId,
                feedback: bodyValidation.data.feedback,
                conduct: bodyValidation.data.conduct,
                totalScore,
            },
          });

        } else {

           collectiveResult = await db.collectiveResult.update({
            where : {
              studentId : queryParamValidation.data.id,
            },
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: bodyValidation.data.sectionId,
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