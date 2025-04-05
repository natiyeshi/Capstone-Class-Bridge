import * as z from "zod";

export const queryParamIDValidator = (
  message = "Query param ID not provided or invalid."
) => {
  return z.object({
    id: z
      .string({
        message,
      })
      .min(1, { message }),
  });
};

export const lastDaysQueryValidator = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1, { message: "Days must be a positive integer." })
    .optional(),
});

export const paginationsQueryValidator = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: "Page must be a positive integer." })
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, { message: "Limit must be a positive integer." })
    .optional(),
});


export default {
  queryParamIDValidator,
  paginationsQueryValidator,
  lastDaysQueryValidator
}