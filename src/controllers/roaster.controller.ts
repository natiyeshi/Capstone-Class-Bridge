import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Result } from "@prisma/client";
import { RoasterSchema } from "../validators/roaster.validator";
import queryValidator from "../validators/query.validator";

export const getRoasterController = asyncWrapper(async (req, res) => {
  const users = await db.roaster.findMany({
    include:{
        section:true,
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Roaster retrived successfully",
    result: users,
  });
});





export const createRoasterController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = RoasterSchema.safeParse(req.body);
        
        if (!bodyValidation.success)
            throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
            );
        
        const sectionExist = await db.roaster.findFirst({
            where: { sectionId : bodyValidation.data.sectionId },
        });

        const collectiveResults = await db.collectiveResult.findMany({
            where: { sectionId : bodyValidation.data.sectionId },
        });

        if(!collectiveResults) 
            throw RouteError.BadRequest(
            "No Collection Result Found in this section"
            );;
        
        if (!sectionExist) {
            const result = await db.roaster.create({
                data: {
                    sectionId: bodyValidation.data.sectionId,
                    collectiveResult: {
                        create: collectiveResults?.map((d) => ({
                            id: d.id,
                        })),
                    },
                },
            });

            return sendApiResponse({
                res,
                statusCode: StatusCodes.OK,
                success: true,
                message: "Roaster created successfully",
                result: result,
              });
            
        } else {
            const result = await db.roaster.update({
                where : {
                    sectionId : bodyValidation.data.sectionId,
                },
                data: {
                    sectionId: bodyValidation.data.sectionId,
                    collectiveResult: {
                        create: collectiveResults?.map((d) => ({
                            id: d.id,
                        })),
                    },
                },
            });

            return sendApiResponse({
                res,
                statusCode: StatusCodes.OK,
                success: true,
                message: "Roaster created successfully",
                result: result,
              });
        }
   
  });


  
  export const getRoasterByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
      .queryParamIDValidator("Roaster ID not provided or invalid.")
      .safeParse(req.params);
    
      if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
      
    const roaster = await db.roaster.findFirst({
      where:{
        id: queryParamValidation.data.id,
      },
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "roaster retrived successfully",
      result: roaster,
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