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
    // const unreadMessages = messages.filter(m => !m.seen && m.receiverId === bodyValidation.data.receiverId);
    // if (unreadMessages.length > 0) {
    //     await db.message.updateMany({
    //         where: {
    //             id: { in: unreadMessages.map(m => m.id) }
    //         },
    //         data: { seen: true }
    //     });

    //     // Notify sender that their messages were seen via socket
    //     unreadMessages.forEach(message => {
    //         socketService.emitMessageSeen(message);
    //     });
    // }

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

    // Perform sentiment analysis
    try {
        const sentimentResponse = await fetch('https://sentiment-analysis-m66p.onrender.com/api/v1/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    text: bodyValidation.data.content
                }
            })
        });

        if (!sentimentResponse.ok) {
            throw new Error('Sentiment analysis service failed');
        }

        const sentimentData = await sentimentResponse.json();
        const sentiment = sentimentData.sentiment;
        
        // Check if sentiment is negative
        if (sentiment.label === "negative" || sentiment.score < 0) {
            throw RouteError.BadRequest(
                "Message contains negative sentiment and cannot be sent"
            );
        }
    } catch (error) {
        if (error instanceof RouteError) {
            throw error;
        }
        // If sentiment analysis service fails, log the error but allow the message to be sent
        console.error('Sentiment analysis failed:', error);
    }

    const messageData = await db.message.create({
        data: {
            ...bodyValidation.data,
        },
        include: {
            sender: true,
            receiver: true
        }
    });

    const receiver = await db.user.findUnique({
        where: {
            id: bodyValidation.data.receiverId
        }
    });

    await db.notification.create({
        data: {
          topic: "New Message",
          message: `${receiver?.firstName} sent you a message`,
          user: {
            connect: {
              id: bodyValidation.data.receiverId
            }
          }
        }
      });

      

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


