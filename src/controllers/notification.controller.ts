import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import queryValidator from "../validators/query.validator";
import { z } from "zod";

// Validation schema for notification creation
const createNotificationSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  message: z.string().min(1, "Message is required"),
  link: z.string().optional(),
  userId: z.string().optional()
});

export const getNotificationsController = asyncWrapper(async (req, res) => {
  const notifications = await db.notification.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notifications retrieved successfully",
    result: notifications,
  });
});

export const getNotificationByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Notification ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  }

  const notification = await db.notification.findFirst({
    where: {
        OR: [
            { id: queryParamValidation.data.id },
            { userId: null as any }
        ]
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!notification) {
    throw RouteError.NotFound("Notification not found");
  }

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification retrieved successfully",
    result: notification,
  });
});

export const createNotificationController = asyncWrapper(async (req, res) => {
  const bodyValidation = createNotificationSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { topic, message, link, userId } = bodyValidation.data;

  // If userId is provided, verify the user exists
  if (userId) {
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw RouteError.BadRequest("User does not exist");
    }
  }

  const notification = await db.notification.create({
    data: {
      topic,
      message,
      link,
      userId
    } as any,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Notification created successfully",
    result: notification,
  });
});

export const updateNotificationController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Notification ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  }

  const bodyValidation = createNotificationSchema.partial().safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { topic, message, link, userId } = bodyValidation.data;

  // Check if notification exists
  const notificationExists = await db.notification.findUnique({
    where: { id: queryParamValidation.data.id },
  });

  if (!notificationExists) {
    throw RouteError.NotFound("Notification not found");
  }

  // If userId is provided, verify the user exists
  if (userId) {
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw RouteError.BadRequest("User does not exist");
    }
  }

  const notification = await db.notification.update({
    where: {
      id: queryParamValidation.data.id,
    },
    data: {
      topic,
      message,
      link,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification updated successfully",
    result: notification,
  });
});

export const deleteNotificationController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Notification ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  }

  // Check if notification exists
  const notificationExists = await db.notification.findUnique({
    where: { id: queryParamValidation.data.id },
  });

  if (!notificationExists) {
    throw RouteError.NotFound("Notification not found");
  }

  const notification = await db.notification.delete({
    where: {
      id: queryParamValidation.data.id,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification deleted successfully",
    result: notification,
  });
}); 