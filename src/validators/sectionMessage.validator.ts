import { z } from "zod";

export const SectionMessageSchema = z.object({

    content: z.string({
    }).nullable().optional(),

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
