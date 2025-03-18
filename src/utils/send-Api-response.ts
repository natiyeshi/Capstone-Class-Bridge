import { Response } from "express";
import { ApiResponse } from "../types";

type SendApiResponse<T> = {
  res: Response;
  statusCode: number;
  success: boolean;
  message: string;
  result: T | null;
};

const sendApiResponse = <T>({
  res,
  statusCode,
  success,
  message,
  result,
}: SendApiResponse<T>) => {
  return res.status(statusCode).json({
    success,
    message,
    result,
  } satisfies ApiResponse<T>);
};

export default sendApiResponse;
