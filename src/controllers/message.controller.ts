import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Message } from "@prisma/client";
import { MessageSchema,GetMessageSchema } from "../validators/message.validator";
import queryValidator from "../validators/query.validator";

export const getMessageController = asyncWrapper(async (req, res) => {
    const bodyValidation = GetMessageSchema.safeParse(req.body);
   
    if (!bodyValidation.success)
      throw RouteError.BadRequest(
        zodErrorFmt(bodyValidation.error)[0].message,
        zodErrorFmt(bodyValidation.error)
      );

    const messages = await db.message.findMany({
      where: {
        OR: [
          { receiverId: bodyValidation.data.receiverId, senderId: bodyValidation.data.senderId,  },
          { receiverId: bodyValidation.data.senderId, senderId: bodyValidation.data.receiverId, }
        ],
      },
      include: {
        receiver: true,
        sender: true,
      }
    });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Message retrived successfully",
    result: messages,
  });
});


export const createMessageController = asyncWrapper(async (req, res) => {
   const bodyValidation = MessageSchema.safeParse(req.body);
   
     if (!bodyValidation.success)
       throw RouteError.BadRequest(
         zodErrorFmt(bodyValidation.error)[0].message,
         zodErrorFmt(bodyValidation.error)
       );

    const messageData: Message = await db.message.create({
        data: {
            ...bodyValidation.data,
        },
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Message created successfully",
        result: messageData,
    });
  
  });

// get response - api/v1/message/:id

export const deleteMessageController = asyncWrapper(async (req, res) => {
    
    const queryParamValidation = queryValidator
          .queryParamIDValidator("Message ID not provided or invalid.")
          .safeParse(req.params);
   

    const message = await db.message.delete({
        where: { id: queryParamValidation.data!.id },
    });


    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Message deleted successfully",
        result : message,
    });
});