import { z } from "zod";

export const createAnnouncementSchema = z.object({
  topic: z.string({ message : "Topic is required"}).min(1, "Topic is required"), // Ensures the topic is not empty
  description: z.string({ message : "Description Must be string!"}).optional(), // Description is optional
  image: z.string({ message : "Invalid image URL"}).url("Invalid image URL").optional().nullable(), // Ensures the image URL is a valid URL (if provided)
  directorId: z.string({ message : "Director ID is required"}).min(1, "Director ID is required"), // Ensures a valid director ID is provided
});

