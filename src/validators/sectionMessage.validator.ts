import { z } from "zod";

export const SectionMessageSchema = z.object({

    content: z.string({
        required_error: "Content is required",
    }),

    sectionId: z.string({
        required_error: "Section ID is required",
    }),

    senderId: z.string({
        required_error: "Sender ID is required",
    }),

    images: z.array(z.string()).optional().default([]),

});



export const GetSectionMessageSchema = z.object({

  sectionId: z.string({
    required_error: "Section ID is required",
  }),

  

});
