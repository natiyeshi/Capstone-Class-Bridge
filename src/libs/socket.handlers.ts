import { Server, Socket } from "socket.io";
import { db, zodErrorFmt } from "../libs";
import { MessageSchema } from "../validators/message.validator";
import { sectionSendData, sendData, gradeLevelSendData} from "../server";
import { SectionMessageSchema } from "../validators/sectionMessage.validator";
import { gradeLevelMessageValidator } from "../validators/gradeLevelMessage.validator";
import { sendSMS } from "../services/sms.service";

// Direct Message Handlers
export const handleAllMessages = async (socket: Socket, data: any) => {
  console.log("Socket: All message fetch");
  try {
    const messages = await db.message.findMany({
      where: {
        OR: [
          { receiverId: data.receiverId, senderId: data.senderId },
          { receiverId: data.senderId, senderId: data.receiverId }
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

    socket.emit("all_messages_response", {
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    socket.emit("all_messages_response", {
      success: false,
      error: "Failed to fetch messages"
    });
  }
};

export const handleSendMessage = async (io: Server, data: any) => {
  console.log("Message Received ", data);
  const bodyValidation = MessageSchema.safeParse(data);
  
  if (!bodyValidation.success) {
    const response: sendData = {
      success: false,
      senderId: data.senderId,
      receiverId: data.receiverId,
      data: null,
      error: zodErrorFmt(bodyValidation.error)[0].message,
    };      
    io.emit("receive_message", response);
    return;
  }

  try {
    console.log("Sentiment Analysis Pending...")
    // Perform sentiment analysis
    const sentimentResponse = await fetch('https://sentiment-analysis-m66p.onrender.com/api/v1/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { text: bodyValidation.data.content } })
    });

    if (!sentimentResponse.ok) {
      
      io.emit("receive_message", {
        success: false,
        senderId: data.senderId,
        receiverId: data.receiverId,
        data: null,
        error: "Sentiment analysis service failed"
      } as sendData);
      return;
    }

    const sentimentData = await sentimentResponse.json();
    console.log("Sentiment Analysis Arrived!")

    const sentiment = sentimentData.sentiment;
    
    if (sentiment.label === "negative" || sentiment.score < 0) {
      
      await db.user.update({
        where : {
          id : data.senderId,
        },
        data : {
          curseNumber : {
            increment: 1
          }
        }
      })
      
      io.emit("receive_message", {
        success: false,
        senderId: data.senderId,
        receiverId: data.receiverId,
        data: null,
        error: "Message contains negative sentiment and cannot be sent."
      } as sendData);

      

      return;
    }

    const messageData = await db.message.create({
      data: { ...bodyValidation.data },
      include: { sender: true, receiver: true }
    });

    const sender = await db.user.findUnique({
      where: {
        id: bodyValidation.data.senderId,
      },
    });

    await db.notification.create({
        data: {
          topic: "New Message",
          message: `${sender?.firstName} sent you a message`,
          user: {
            connect: {
              id: bodyValidation.data.receiverId
            }
          }
        }
      });
    
      await sendSMS(bodyValidation.data.content)

    io.emit("receive_message", {
      success: true,
      senderId: data.senderId,
      receiverId: data.receiverId,
      data: messageData
    } as sendData);
  } catch (error) {
    console.error("Error sending message:", error);
    io.emit("receive_message", {
      success: false,
      senderId: data.senderId,
      receiverId: data.receiverId,
      data: null,
      error: "Failed to send message"
    } as sendData);
  }
};

// Section Message Handlers
export const handleSectionAllMessages = async (socket: Socket, sectionId: string) => {
  console.log("Socket Message retrieved emitter");
  try {
    const sectionMessages = await db.sectionMessage.findMany({
      where: { sectionId },
      include: { sender: true, section: true },
      orderBy: {
        createdAt: 'asc',
      },
    });

    socket.emit("section_all_messages_response", {
      success: true,
      data: sectionMessages,
      sectionId,
      error: null
    } as sectionSendData);
  } catch (error) {
    console.error("Error fetching section messages:", error);
    socket.emit("section_all_messages_response", {
      success: false,
      error: "Failed to fetch messages",
      sectionId,
      data: null
    } as sectionSendData);
  }
};

export const handleSectionSendMessage = async (io: Server, data: any) => {
  console.log("Socket Message received", data);
  const bodyValidation = SectionMessageSchema.safeParse(data);
  
  if (!bodyValidation.success) {
    io.emit("section_receive_message", {
      success: false,
      data: null,
      error: zodErrorFmt(bodyValidation.error)[0].message,
      sectionId: data?.sectionId ?? ""
    } as sectionSendData);
    return;
  }

  try {
    const sender = await db.user.findFirst({
      where: { id: bodyValidation.data.senderId }
    });

    if (!sender) {
      io.emit("section_receive_message", {
        success: false,
        data: null,
        error: "Sender doesn't exist",
        sectionId: data?.sectionId ?? ""
      } as sectionSendData);
      return;
    }

    // Perform sentiment analysis
    const sentimentResponse = await fetch('https://sentiment-analysis-m66p.onrender.com/api/v1/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { text: bodyValidation.data.content } })
    });

    if (!sentimentResponse.ok) {
      io.emit("section_receive_message", {
        success: false,
        sectionId: bodyValidation.data.sectionId,
        data: null,
        error: "Sentiment analysis service failed"
      } as sectionSendData);
      return;
    }

    const sentimentData = await sentimentResponse.json();
    const sentiment = sentimentData.sentiment;

    if (sentiment.label === "negative" || sentiment.score < 0) {
      io.emit("section_receive_message", {
        success: false,
        sectionId: bodyValidation.data.sectionId,
        data: null,
        error: "Message contains negative sentiment and cannot be sent."
      } as sectionSendData);
      return;
    }

    const sectionMessageData = await db.sectionMessage.create({
      data: {
        content: bodyValidation.data.content,
        sectionId: bodyValidation.data.sectionId,
        senderId: sender.id,
        images: bodyValidation.data.images
      },
      include: { sender: true }
    });

    // Get all users in the section
    const sectionUsers = await db.user.findMany({
    });

    // Create notification for each user in the section
    for (const user of sectionUsers) {
      await db.notification.create({
        data: {
          topic: "Section Message",
          message: `${sender?.firstName} sent a message to your section`,
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });
    }

    await sendSMS(bodyValidation.data.content)


    io.emit("section_receive_message", {
      success: true,
      sectionId: bodyValidation.data.sectionId,
      data: sectionMessageData,
      error: null
    } as sectionSendData);
  } catch (error) {
    console.error("Error sending section message:", error);
    io.emit("section_receive_message", {
      success: false,
      sectionId: data?.sectionId ?? "",
      data: null,
      error: "Failed to send section message"
    } as sectionSendData);
  }
};

// Grade Level Message Handlers
export const handleGradeLevelAllMessages = async (socket: Socket, gradeLevelId: string) => {
  console.log("Grade Level Messages retrieved emitter");
  try {
   

    if (!gradeLevelId) {
      socket.emit("grade_level_all_messages_response", {
        success: false,
        error: "No Grade Level id provided!",
        data: null,
        gradeLevelId: gradeLevelId
      } as gradeLevelSendData);
      return;
    }

    const gradeLevel = await db.gradeLevel.findFirst({
      where: {
        id: gradeLevelId,
      },
      include: {
        subjectList: true,
        Section: true
      },
      
    });

    if (!gradeLevel) {
      socket.emit("grade_level_all_messages_response", {
        success: false,
        error: "Grade level not found",
        data: null,
        gradeLevelId: gradeLevelId
      } as gradeLevelSendData);
      return;
    }

    const gradeLevelMessages = await db.gradeLevelMessage.findMany({
      where: { gradeLevelId:gradeLevelId },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    socket.emit("grade_level_all_messages_response", {
      success: true,
      data: gradeLevelMessages,
      gradeLevelId: gradeLevelId,
      error: null
    } as gradeLevelSendData);
  } catch (error) {
    console.error("Error fetching grade level messages:", error);
    socket.emit("grade_level_all_messages_response", {
      success: false,
      error: "Failed to fetch grade level messages",
      gradeLevelId: gradeLevelId,
      data: null
    } as gradeLevelSendData);
  }
};

export const handleGradeLevelSendMessage = async (io: Server, data: any) => {
  console.log("Grade Level Message received", data);
  const bodyValidation = gradeLevelMessageValidator.gradeLevelMessageSchema.safeParse(data);
  
  if (!bodyValidation.success) {
    io.emit("grade_level_receive_message", {
      success: false,
      data: null,
      error: zodErrorFmt(bodyValidation.error)[0].message,
      gradeLevelId: data?.sectionId ?? ""
    } as gradeLevelSendData);
    return;
  }

  try {
    const gradeLevel = await db.gradeLevel.findUnique({
      where: { id: bodyValidation.data.gradeLevelId },
    });

    if (!gradeLevel) {
      io.emit("grade_level_receive_message", {
        success: false,
        data: null,
        error: "Grade level not found",
        gradeLevelId: bodyValidation.data.gradeLevelId
      } as gradeLevelSendData);
      return;
    }

    const sender = await db.user.findUnique({
      where: { id: bodyValidation.data.senderId }
    });

    if (!sender) {
      io.emit("grade_level_receive_message", {
        success: false,
        data: null,
        error: "Sender not found",
        gradeLevelId: bodyValidation.data.gradeLevelId
      } as gradeLevelSendData);
      return;
    }

    // Perform sentiment analysis
    const sentimentResponse = await fetch('https://sentiment-analysis-m66p.onrender.com/api/v1/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { text: bodyValidation.data.content } })
    });

    if (!sentimentResponse.ok) {
      io.emit("grade_level_receive_message", {
        success: false,
        gradeLevelId: bodyValidation.data.gradeLevelId,
        data: null,
        error: "Sentiment analysis service failed"
      } as gradeLevelSendData);
      return;
    }

    const sentimentData = await sentimentResponse.json();
    const sentiment = sentimentData.sentiment;

    if (sentiment.label === "negative" || sentiment.score < 0) {
      io.emit("grade_level_receive_message", {
        success: false,
        gradeLevelId: bodyValidation.data.gradeLevelId,
        data: null,
        error: "Message contains negative sentiment and cannot be sent."
      } as gradeLevelSendData);
      return;
    }

    const message = await db.gradeLevelMessage.create({
      data: {
        content: bodyValidation.data.content,
        image: bodyValidation.data.image,
        gradeLevelId: bodyValidation.data.gradeLevelId,
        senderId: bodyValidation.data.senderId,
        createdAt: new Date(),
      },
      include: {
        sender: true,
        gradeLevel: true,
      },
    });

    const gradeLevelUsers = await db.user.findMany({
    });

    // Create notification for each user in the section
    for (const user of gradeLevelUsers) {
      await db.notification.create({
        data: {
          topic: "Grade Message",
          message: `${sender?.firstName} sent a message to your chat`,
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });
    }

    await sendSMS(bodyValidation.data.content)

    io.emit("grade_level_receive_message", {
      success: true,
      gradeLevelId: bodyValidation.data.gradeLevelId,
      data: message,
      error: null
    } as gradeLevelSendData);
  } catch (error) {
    console.error("Error sending grade level message:", error);
    io.emit("grade_level_receive_message", {
      success: false,
      gradeLevelId: data?.gradeLevelId ?? "",
      data: null,
      error: "Failed to send grade level message"
    } as gradeLevelSendData);
  }
};

export const handleSeenMessage = async (io: Server,socket : any, data: any) => {
  try {
    const message = await db.message.updateMany({
      where: {
        receiverId : data.userId,
        senderId : data.senderId,
      },
      data: {
        seen: true
      },
    });
    console.error("Message seened!!",message);
    handleAllMessages(socket,data)
  } catch (error) {
    console.error("Error marking message as seen:", error);
  }
};

