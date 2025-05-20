import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import { MessageSchema, GetMessageSchema } from "../validators/message.validator";
import queryValidator from "../validators/query.validator";
import { socketService } from "../services/socket.service";

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
          { receiverId: bodyValidation.data.receiverId, senderId: bodyValidation.data.senderId },
          { receiverId: bodyValidation.data.senderId, senderId: bodyValidation.data.receiverId }
        ],
      },
      include: {
        receiver: true,
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as seen when retrieved and notify via socket
    const unreadMessages = messages.filter(m => !m.seen && m.receiverId === bodyValidation.data.receiverId);
    if (unreadMessages.length > 0) {
        await db.message.updateMany({
            where: {
                id: { in: unreadMessages.map(m => m.id) }
            },
            data: { seen: true }
        });

        // Notify sender that their messages were seen via socket
        unreadMessages.forEach(message => {
            socketService.emitMessageSeen(message);
        });
    }

    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Messages retrieved successfully",
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

    const messageData = await db.message.create({
        data: {
            ...bodyValidation.data,
        },
        include: {
            sender: true,
            receiver: true
        }
    });

    // Emit the new message via socket service
    socketService.emitNewMessage(messageData);

    return sendApiResponse({
        res,
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Message created successfully",
        result: messageData,
    });
});

export const getUnreadMessagesController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("User ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const unreadMessages = await db.message.findMany({
        where: {
            receiverId: queryParamValidation.data.id,
            seen: false
        },
        include: {
            sender: true,
            receiver: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Unread messages retrieved successfully",
        result: unreadMessages
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



export const seenMessageController = asyncWrapper(async (req, res) => {
    
  const queryParamValidation = queryValidator
        .queryParamIDValidator("Message ID not provided or invalid.")
        .safeParse(req.params);
 

  const message = await db.message.update({
      where: { id: queryParamValidation.data!.id },
      data : {
        seen : true
      }
  });


  return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Message seened successfully",
      result : message,
  });
});


