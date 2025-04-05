import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import { createAnnouncementSchema } from "../validators/announcement.validator";
import queryValidator from "../validators/query.validator";


export const getAnnouncementController = asyncWrapper(async (req, res) => {
    const announcement = await db.announcement.findMany({
      include:{
       
       }
    });
    return sendApiResponse({
      res,  
      statusCode: StatusCodes.OK,
      success: true,
      message: "Announcement retrived successfully",
      result: announcement,
    });
  });

  
export const getAnnouncementByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Announcement ID not provided or invalid.")
        .safeParse(req.params);
      
        if (!queryParamValidation.success)
          throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
          );
        
      const announcement = await db.announcement.findFirst({
        where:{
          id: queryParamValidation.data.id,
        },
        include:{
          },
      });


      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Announcement retrived successfully",
        result: announcement,
      });
    });


    
export const deleteAnnouncementController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Announcement ID not provided or invalid.")
        .safeParse(req.params);
    const announcement = await db.announcement.delete({
      where:{
        id: queryParamValidation.data!.id,
       }
    });
    return sendApiResponse({
      res,  
      statusCode: StatusCodes.OK,
      success: true,
      message: "Announcement deleted successfully",
      result: announcement,
    });
  });


export const createAnnouncementController = asyncWrapper(async (req, res) => {
  const bodyValidation = createAnnouncementSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { topic, description, image, directorId } = bodyValidation.data;

    const userExists = await db.director.findUnique({
        where: { id: directorId },
    });

    if (!userExists) {
        throw RouteError.BadRequest("director does not exist");
    }
   

  const announcement = await db.announcement.create({
    data: {
        topic,
        description,
        image,
        directorId
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Announcement created successfully",
    result: announcement,
  });
});
