import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { GradeLevel } from "@prisma/client";
import {GradeLevelSchema, updateGradeLevelSchema} from "../validators/gradeLeve.validator";
import queryValidator from "../validators/query.validator";

export const getGradeLevelController = asyncWrapper(async (req, res) => {
  const gradelevel = await db.gradeLevel.findMany({
    include : {
      subjectList : true,
      Section : true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade Level retrived successfully",
    result: gradelevel,
  });
});


export const getGradeLevelByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Grade Level ID not provided or invalid.")
    .safeParse(req.params);
  
    if (!queryParamValidation.success)
      throw RouteError.BadRequest(
        zodErrorFmt(queryParamValidation.error)[0].message,
        zodErrorFmt(queryParamValidation.error)
      );
    
  const gradelevel = await db.gradeLevel.findFirst({
    where:{
      id: queryParamValidation.data.id,
    },
    include : {
      subjectList : true
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade Level retrived successfully",
    result: gradelevel,
  });
});


export const createGradeLevelController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = GradeLevelSchema.safeParse(req.body);
       
    if (!bodyValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
        );


    const existingGradeLevel = await db.gradeLevel.findFirst({
        where: { level: bodyValidation.data.level },
    });
    
    if (existingGradeLevel) throw RouteError.BadRequest("GradeLevel already in use.");
    
    const validSubjects = await db.subject.findMany({
      where: { id: { in: bodyValidation.data.subjectList } },
      select: { id: true },
    });

    const validSubjectIds = validSubjects.map(subject => subject.id);

    const invalidSubjects = bodyValidation.data.subjectList.filter(id => !validSubjectIds.includes(id));

    if (invalidSubjects.length > 0) {
        throw RouteError.BadRequest(`Invalid subject IDs: ${invalidSubjects.join(", ")}`);
    }

    const gradelevel = await db.gradeLevel.create({
        data : {
            level : bodyValidation.data.level,
            subjectList: {
                connect: bodyValidation.data.subjectList.map((subjectId: string) => ({ id: subjectId })),
            },
        },
        include : {
          subjectList : true
        }
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "GradeLevel created successfully",
      result: gradelevel,
    });
  });


  
export const deleteGradeLevelController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Grade Level ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const existinggradeLevel = await db.gradeLevel.findUnique({
    where: {
      id: queryParamValidation.data.id,
    }
  });

  if (!existinggradeLevel)
    throw RouteError.NotFound("Grade Level not found with the provided ID.");

  await db.gradeLevel.delete({
    where: {
      id: queryParamValidation.data.id,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Grade Level deleted successfully.",
    result: null,
  });
});


export const updategradeLevelController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("gradeLevel ID not provided or invalid.")
    .safeParse(req.params);
 

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
    
    const bodyValidation = GradeLevelSchema.safeParse(
      req.body
    );

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existinggradeLevel = await db.gradeLevel.findUnique({
    where: {
      id: queryParamValidation.data.id,
    },
    
  });

  if (!existinggradeLevel)
    throw RouteError.NotFound("gradeLevel not found with the provided ID.");
  
  const validSubjects = await db.subject.findMany({
    where: { id: { in: bodyValidation.data.subjectList } },
    select: { id: true },
  });
  const validSubjectIds = validSubjects.map(subject => subject.id);
  const invalidSubjects = bodyValidation.data.subjectList.filter(id => !validSubjectIds.includes(id));
  if (invalidSubjects.length > 0) {
      throw RouteError.BadRequest(`Invalid subject IDs: ${invalidSubjects.join(", ")}`);
  }
  const updatedGradeLevel = await db.gradeLevel.update({
    where: {
      id: queryParamValidation.data.id,
    },
    data : {
      level : bodyValidation.data.level,
      subjectList: {
          connect: bodyValidation.data.subjectList.map((subjectId: string) => ({ id: subjectId })),
      },
    },
   });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "gradeLevel updated successfully.",
    result: updatedGradeLevel,
  });
});


