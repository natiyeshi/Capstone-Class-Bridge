import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import { gradeLevelMessageValidator } from "../validators/gradeLevelMessage.validator";
import queryValidator from "../validators/query.validator";

export const createGradeLevelMessageController = asyncWrapper(async (req, res) => {
  const bodyValidation = gradeLevelMessageValidator.gradeLevelMessageSchema.safeParse(req.body);

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const gradeLevel = await db.gradeLevel.findUnique({
    where: { id: bodyValidation.data.gradeLevelId },
  });

  if (!gradeLevel) throw RouteError.NotFound("Grade level not found.");

  const message = await db.gradeLevelMessage.create({
    data: {
      content: bodyValidation.data.content,
      image: bodyValidation.data.image,
      gradeLevelId: bodyValidation.data.gradeLevelId,
      senderId: req.user?._id,
      createdAt: new Date(),
    },
    include: {
      sender: true,
      gradeLevel: true,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Grade level message created successfully",
    result: message,
  });
});

export const getGradeLevelMessagesController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Grade level ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const messages = await db.gradeLevelMessage.findMany({
    where: {
      gradeLevelId: queryParamValidation.data.id,
    },
    include: {
      sender: true,
      gradeLevel: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade level messages retrieved successfully",
    result: messages,
  });
});

export const updateGradeLevelMessageController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Message ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const bodyValidation = gradeLevelMessageValidator.gradeLevelMessageUpdateSchema.safeParse(req.body);

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const message = await db.gradeLevelMessage.findUnique({
    where: { id: queryParamValidation.data.id },
  });

  if (!message) throw RouteError.NotFound("Message not found.");

  if (message.senderId !== req.user?._id)
    throw RouteError.Forbidden("You are not authorized to update this message.");

  const updatedMessage = await db.gradeLevelMessage.update({
    where: { id: queryParamValidation.data.id },
    data: {
      content: bodyValidation.data.content,
      image: bodyValidation.data.image,
    },
    include: {
      sender: true,
      gradeLevel: true,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade level message updated successfully",
    result: updatedMessage,
  });
});

export const deleteGradeLevelMessageController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Message ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const message = await db.gradeLevelMessage.findUnique({
    where: { id: queryParamValidation.data.id },
  });

  if (!message) throw RouteError.NotFound("Message not found.");

  if (message.senderId !== req.user?._id)
    throw RouteError.Forbidden("You are not authorized to delete this message.");

  await db.gradeLevelMessage.delete({
    where: { id: queryParamValidation.data.id },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade level message deleted successfully",
    result : null,
  });
});

export const getGradeLevelUsersController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Grade level ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  // Find all sections in the grade level
  const sections = await db.section.findMany({
    where: {
      gradeLevelId: queryParamValidation.data.id,
    },
  });

  // Get all students in these sections
  const students = await db.student.findMany({
    where: {
      sectionId: {
        in: sections.map(section => section.id),
      },
    },
    include: {
      parent: {
        include: {
          user: true,
        },
      },
    },
  });

  // Get all teachers from teacherSectionSubject for these sections
  const teacherSectionSubjects = await db.teacherSectionSubject.findMany({
    where: {
      sectionId: {
        in: sections.map(section => section.id),
      },
    },
    include: {
      teacher: true,
    },
  });

  // Get all directors
  const directors = await db.director.findMany({
    include: {
      user: true,
    },
  });

  // Extract unique parents, teachers, and directors
  const parents = [...new Set(students.map(student => student.parent))].filter(Boolean);
  const teachers = [...new Set(teacherSectionSubjects.map(tss => tss.teacher))].filter(Boolean);
  const directorsList = directors.map(director => director.user).filter(Boolean);

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade level users retrieved successfully",
    result: {
      parents,
      teachers,
      directors: directorsList,
    },
  });
}); 


