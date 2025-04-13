import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { SectionMessage } from "@prisma/client";
import { SectionMessageSchema,GetSectionMessageSchema } from "../validators/sectionMessage.validator";
import queryValidator from "../validators/query.validator";

export const getSectionMessageController = asyncWrapper(async (req, res) => {
    const bodyValidation = GetSectionMessageSchema.safeParse(req.body);
   
    if (!bodyValidation.success)
      throw RouteError.BadRequest(
        zodErrorFmt(bodyValidation.error)[0].message,
        zodErrorFmt(bodyValidation.error)
      );

    const sectionmessages = await db.sectionMessage.findMany({
      where: {
        sectionId : bodyValidation.data.sectionId
      },
    });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "SectionMessage retrived successfully",
    result: sectionmessages,
  });
});


export const createSectionMessageController = asyncWrapper(async (req, res) => {
   const bodyValidation = SectionMessageSchema.safeParse(req.body);
   
     if (!bodyValidation.success)
       throw RouteError.BadRequest(
         zodErrorFmt(bodyValidation.error)[0].message,
         zodErrorFmt(bodyValidation.error)
       );
    
    // Check if the sectionId exists in the database
    const sender = await db.user.findFirst({
        where : {
            id : bodyValidation.data.senderId,
        }
    })

    if (!sender)
        throw RouteError.BadRequest(
         "sender doesn't exist"
        );


    const sectionmessageData: SectionMessage = await db.sectionMessage.create({
        data: {
            // ...bodyValidation.data,
            content : bodyValidation.data.content,
            sectionId : bodyValidation.data.sectionId,
            userId: sender.id, // Ensure senderId is undefined if not provided
        },
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "SectionMessage created successfully",
        result: sectionmessageData,
    });
  
  });

// get response - api/v1/sectionmessage/:id

export const deleteSectionMessageController = asyncWrapper(async (req, res) => {
    
    const queryParamValidation = queryValidator
          .queryParamIDValidator("Section Message ID not provided or invalid.")
          .safeParse(req.params);
   

    const sectionmessage = await db.sectionMessage.delete({
        where: { id: queryParamValidation.data!.id },
    });


    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "SectionMessage deleted successfully",
        result : sectionmessage,
    });
});