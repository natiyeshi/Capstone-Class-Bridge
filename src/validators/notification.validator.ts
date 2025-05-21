import { z } from "zod";

export const CreateNotificationSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  message: z.string().min(1, "Message is required"),
  link: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

export const UpdateNotificationSchema = z.object({
  topic: z.string().min(1, "Topic is required").optional(),
  message: z.string().min(1, "Message is required").optional(),
  link: z.string().optional(),
});

export const GetNotificationSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;
export type GetNotificationInput = z.infer<typeof GetNotificationSchema>; 