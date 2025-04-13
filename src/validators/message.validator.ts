import { z } from "zod";

export const MessageSchema = z.object({

  content: z.string({
    required_error: "Content is required",
  }),

  senderId: z.string({
    required_error: "Sender ID is required",
  }),

  receiverId: z.string({
    required_error: "Receiver ID is required",
  }),

});



export const GetMessageSchema = z.object({

  senderId: z.string({
    required_error: "Sender ID is required",
  }),

  receiverId: z.string({
    required_error: "Receiver ID is required",
  }),

});
