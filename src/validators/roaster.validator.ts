import { z } from "zod";

export const RoasterSchema = z.object({

  sectionId: z.string({
    required_error: "Section ID is required",
  }),

});
