import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, zodErrorFmt } from "../libs";
import { createAttendanceSchema } from "../validators/attendance.validator";
import queryValidator from "../validators/query.validator";


export const getAttendanceController = asyncWrapper(async (req, res) => {
    const attendance = await db.attendance.findMany({
      include:{
        student : {
            include : {
                user : true,}
        },
        section : true,
       }
    });
    return sendApiResponse({
      res,  
      statusCode: StatusCodes.OK,
      success: true,
      message: "Attendance retrived successfully",
      result: attendance,
    });
  });

  
export const getAttendanceByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Attendance ID not provided or invalid.")
        .safeParse(req.params);
      
        if (!queryParamValidation.success)
          throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
          );
        
      const attendance = await db.attendance.findFirst({
        where:{
          id: queryParamValidation.data.id,
        },
        include:{
            section : true,
          },
      });


      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Attendance retrived successfully",
        result: attendance,
      });
    });


    
export const deleteAttendanceController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Attendance ID not provided or invalid.")
        .safeParse(req.params);
    const attendance = await db.attendance.delete({
      where:{
        id: queryParamValidation.data!.id,
       }
    });
    return sendApiResponse({
      res,  
      statusCode: StatusCodes.OK,
      success: true,
      message: "Attendance deleted successfully",
      result: attendance,
    });
  });


export const createAttendanceController = asyncWrapper(async (req, res) => {
  const bodyValidation = createAttendanceSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );
  }

  const { date, status, studentId, sectionId } = bodyValidation.data;

    const userExists = await db.student.findUnique({
        where: { id: studentId },
    });

    if (!userExists) {
        throw RouteError.BadRequest("Student does not exist");
    }
    const sectionExists = await db.section.findUnique({
        where: { id: sectionId },
    });

    if (!sectionExists) {
        throw RouteError.BadRequest("Section does not exist");
    }

    const checkDuplicate = await db.attendance.findFirst({
        where: {
            studentId: studentId,
            date: date,
        },
    });

    if (checkDuplicate) {
        throw RouteError.BadRequest("Attendance Already Registered!");
    }


  const attendance = await db.attendance.create({
    data: {
      date,
      status,
      studentId,
      sectionId,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Attendance created successfully",
    result: attendance,
  });
});
