import { ZodError } from "zod";

const zodFormattedError = (error: ZodError) => {
  return error.errors.map((error) => ({
    field: error.path[0],
    message: error.message,
  }));
};

export default zodFormattedError;
