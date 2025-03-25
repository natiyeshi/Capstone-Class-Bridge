import { StatusCodes } from "http-status-codes";

interface RouteErrorConfig {
  message: string;
  statusCode?: number;
  result?: any;
}
export default class RouteError extends Error {
  public statusCode: number;
  public result: any;

  constructor({
    message,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    result = null,
  }: RouteErrorConfig) {
    super(message);
    this.statusCode = statusCode;
    this.result = result;
    this.name = this.constructor.name; // Automatically set the error name
    Error.captureStackTrace(this, this.constructor); // Retain stack trace
  }

  // Static Methods for Specific Error Types
  static BadRequest(message: string, result: any = null): RouteError {
    return new RouteError({
      message,
      statusCode: StatusCodes.BAD_REQUEST,
      result,
    });
  }

  static Unauthorized(message: string, result: any = null): RouteError {
    return new RouteError({
      message,
      statusCode: StatusCodes.UNAUTHORIZED,
      result,
    });
  }

  static Forbidden(message: string, result: any = null): RouteError {
    return new RouteError({
      message,
      statusCode: StatusCodes.FORBIDDEN,
      result,
    });
  }

  static NotFound(message: string, result: any = null): RouteError {
    return new RouteError({
      message,
      statusCode: StatusCodes.NOT_FOUND,
      result,
    });
  }

  static InternalServerError(message: string, result: any = null): RouteError {
    return new RouteError({
      message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      result,
    });
  }
}
