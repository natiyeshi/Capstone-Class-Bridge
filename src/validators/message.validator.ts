import { z } from "zod";

export const MessageSchema = z.object({

  content: z.string({
    required_error: "Content is required",
  }).nullable(),

  senderId: z.string({
    required_error: "Sender ID is required",
  }),

  receiverId: z.string({
    required_error: "Receiver ID is required",
  }),

  images: z.array(z.string()).optional().default([]),

});



export const GetMessageSchema = z.object({

  senderId: z.string({
    required_error: "Sender ID is required",
  }),

  receiverId: z.string({
    required_error: "Receiver ID is required",
  }),

});
