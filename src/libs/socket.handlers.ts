import { Server, Socket } from "socket.io";
import { db, zodErrorFmt } from "../libs";
import { MessageSchema } from "../validators/message.validator";
import { sectionSendData, sendData } from "../server";
import { SectionMessageSchema } from "../validators/sectionMessage.validator";

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
        createdAt: 'desc',
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
    const sentiment = sentimentData.sentiment;
    
    if (sentiment.label === "negative" || sentiment.score < 0) {
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
      include: { sender: true, section: true }
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
    const gradeLevel = await db.gradeLevel.findFirst({
      where: { id: gradeLevelId },
      include: { Section: true }
    });

    if (!gradeLevel) {
      socket.emit("grade_level_all_messages_response", {
        success: false,
        error: "Grade level not found",
        data: null,
        sectionId: gradeLevelId
      } as sectionSendData);
      return;
    }

    const sectionIds = gradeLevel.Section.map(section => section.id);
    const gradeLevelMessages = await db.sectionMessage.findMany({
      where: { sectionId: { in: sectionIds } },
      include: {
        sender: true,
        section: { include: { gradeLevel: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    socket.emit("grade_level_all_messages_response", {
      success: true,
      data: gradeLevelMessages,
      sectionId: gradeLevelId,
      error: null
    } as sectionSendData);
  } catch (error) {
    console.error("Error fetching grade level messages:", error);
    socket.emit("grade_level_all_messages_response", {
      success: false,
      error: "Failed to fetch grade level messages",
      sectionId: gradeLevelId,
      data: null
    } as sectionSendData);
  }
};

export const handleGradeLevelSendMessage = async (io: Server, data: any) => {
  console.log("Grade Level Message received", data);
  const bodyValidation = SectionMessageSchema.safeParse(data);
  
  if (!bodyValidation.success) {
    io.emit("grade_level_receive_message", {
      success: false,
      data: null,
      error: zodErrorFmt(bodyValidation.error)[0].message,
      sectionId: data?.sectionId ?? ""
    } as sectionSendData);
    return;
  }

  try {
    // Verify the section belongs to a grade level
    const section = await db.section.findFirst({
      where: { id: bodyValidation.data.sectionId },
      include: { gradeLevel: true }
    });

    if (!section) {
      io.emit("grade_level_receive_message", {
        success: false,
        data: null,
        error: "Section not found",
        sectionId: bodyValidation.data.sectionId
      } as sectionSendData);
      return;
    }

    const sender = await db.user.findFirst({
      where: { id: bodyValidation.data.senderId }
    });

    if (!sender) {
      io.emit("grade_level_receive_message", {
        success: false,
        data: null,
        error: "Sender doesn't exist",
        sectionId: bodyValidation.data.sectionId
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
      io.emit("grade_level_receive_message", {
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
      io.emit("grade_level_receive_message", {
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
      include: {
        sender: true,
        section: { include: { gradeLevel: true } }
      }
    });

    io.emit("grade_level_receive_message", {
      success: true,
      sectionId: bodyValidation.data.sectionId,
      data: sectionMessageData,
      error: null
    } as sectionSendData);
  } catch (error) {
    console.error("Error sending grade level message:", error);
    io.emit("grade_level_receive_message", {
      success: false,
      sectionId: data?.sectionId ?? "",
      data: null,
      error: "Failed to send grade level message"
    } as sectionSendData);
  }
};