import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { SectionMessage } from "@prisma/client";
import { SectionMessageSchema, GetSectionMessageSchema } from "../validators/sectionMessage.validator";
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
        sectionId: bodyValidation.data.sectionId
      },
      include:{
        sender:true,
        section:true
      }
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "SectionMessage retrieved successfully",
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
    
    // Check if the sender exists in the database
    const sender = await db.user.findFirst({
        where: {
            id: bodyValidation.data.senderId,
        }
    });

    if (!sender)
        throw RouteError.BadRequest("Sender doesn't exist");

    const sectionmessageData: SectionMessage = await db.sectionMessage.create({
        data: {
            content: bodyValidation.data.content,
            sectionId: bodyValidation.data.sectionId,
            senderId: sender?.id,
            images: bodyValidation.data.images
        }
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
   
    if(!queryParamValidation.success){
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );
    }

    const sectionmessage = await db.sectionMessage.delete({
        where: { id: queryParamValidation.data!.id },
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "SectionMessage deleted successfully",
        result: sectionmessage,
    });
});

export const updateSectionMessageController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Section Message ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const bodyValidation = SectionMessageSchema.safeParse(req.body);

    if (!bodyValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
        );

    // Check if message exists
    const messageExists = await db.sectionMessage.findUnique({
        where: { id: queryParamValidation.data.id }
    });

    if (!messageExists)
        throw RouteError.BadRequest("Message does not exist");

    // Check if sender exists
    const sender = await db.user.findFirst({
        where: { id: bodyValidation.data.senderId }
    });

    if (!sender)
        throw RouteError.BadRequest("Sender doesn't exist");

    const updatedMessage = await db.sectionMessage.update({
        where: { id: queryParamValidation.data.id },
        data: {
            content: bodyValidation.data.content,
            sectionId: bodyValidation.data.sectionId,
            senderId: sender.id,
            images: bodyValidation.data.images
        },
        include: {
            sender: true,
            section: true
        }
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Section message updated successfully",
        result: updatedMessage
    });
});

// New controller to get section messages by section id (from req.params)
export const getSectionMessageBySectionIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Section ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
       );

    const sectionmessages = await db.sectionMessage.findMany({
        where: { sectionId: queryParamValidation.data.id },
        include: { sender: true, section: true }
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Section messages retrieved successfully by section id",
        result: sectionmessages,
    });
});