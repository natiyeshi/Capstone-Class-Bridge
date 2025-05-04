import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import { createCalendarSchema } from "../validators/calendar.validator";
import queryValidator from "../validators/query.validator";


export const getCalendarController = asyncWrapper(async (req, res) => {
  const calendars = await db.calendar.findMany({
    include: {
      createdBy: {
        include: {
          user: true
        }
      }
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Calendar retrieved successfully",
    result: calendars,
  });
});


export const getCalendarByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Calendar ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const calendar = await db.calendar.findFirst({
    where: {
      id: queryParamValidation.data.id,
    },
    include: {
      createdBy: {
        include: {
          user: true,
        }
      },
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Calendar retrived successfully",
    result: calendar,
  });
});



export const deleteCalendarController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Calendar ID not provided or invalid.")
    .safeParse(req.params);
  const calendar = await db.calendar.delete({
    where: {
      id: queryParamValidation.data!.id,
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Calendar deleted successfully",
    result: calendar,
  });
});


export const createCalendarController = asyncWrapper(async (req, res) => {
  const bodyValidation = createCalendarSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { title, description, startDate, endDate, directorId } = bodyValidation.data;

  const userExists = await db.director.findUnique({
    where: { id: directorId },
  });

  if (!userExists) {
    throw RouteError.BadRequest("Director does not exist");
  }

  const calendar = await db.calendar.create({
    data: {
      title,
      description,
      startDate,
      endDate,
      createdBy: {
        connect: { id: directorId }
      }
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Calendar created successfully",
    result: calendar,
  });
});

export const updateCalendarController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Calendar ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const bodyValidation = createCalendarSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { title, description, startDate, endDate, directorId } = bodyValidation.data;

  // Check if director exists
  const directorExists = await db.director.findUnique({
    where: { id: directorId },
  });

  if (!directorExists) {
    throw RouteError.BadRequest("Director does not exist");
  }

  // Check if calendar exists
  const calendarExists = await db.calendar.findUnique({
    where: { id: queryParamValidation.data.id },
  });

  if (!calendarExists) {
    throw RouteError.BadRequest("Calendar does not exist");
  }

  const updatedCalendar = await db.calendar.update({
    where: {
      id: queryParamValidation.data.id,
    },
    data: {
      title,
      description,
      startDate,
      endDate,
      createdBy: {
        connect: { id: directorId }
      }
    },
    include: {
      createdBy: {
        include: {
          user: true
        }
      }
    }
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Calendar updated successfully",
    result: updatedCalendar,
  });
});
