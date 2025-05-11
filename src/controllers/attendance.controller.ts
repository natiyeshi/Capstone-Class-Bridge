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

export const getAttendanceByDateController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Section ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    throw RouteError.BadRequest("Date parameter is required and must be a string");
  }

  // Parse the date string to a Date object
  const attendanceDate = new Date(date);
  
  // Validate if the date is valid
  if (isNaN(attendanceDate.getTime())) {
    throw RouteError.BadRequest("Invalid date format");
  }

  // Set the time to start of day
  attendanceDate.setHours(0, 0, 0, 0);
  
  // Set the time to end of day for the next day
  const nextDay = new Date(attendanceDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const attendance = await db.attendance.findMany({
    where: {
      sectionId: queryParamValidation.data.id,
      date: {
        gte: attendanceDate,
        lt: nextDay,
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      section: {
        include: {
          gradeLevel: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Attendance records retrieved successfully",
    result: attendance,
  });
});

export const getStudentAttendanceController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Student ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const attendance = await db.attendance.findMany({
    where: {
      studentId: queryParamValidation.data.id,
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      section: {
        include: {
          gradeLevel: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Student attendance records retrieved successfully",
    result: attendance,
  });
});

// Updated controller to get today's attendance (by sectionId) for every student (with an extra attendance attribute (filled or null))
export const getTodayAttendanceController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Section ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const sectionId = queryParamValidation.data.id;

    // Compute today's date (midnight) and now (for a range query)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // 1. Fetch all students (via a join on section) for the given section (using sectionId)
    const students = await db.student.findMany({
        where: { sectionId },
        include: { user: true } // (or any other student details you want)
    });

    // 2. (Simulate a "left join" by querying attendance separately and merging the results.)
    // Query attendance (using a date range) for today (for every student in the section) and (if filled) include the status (or null if not filled)
    const attendances = await db.attendance.findMany({
        where: {
            sectionId,
            date: { gte: today, lte: now }
        },
        include: { student: { include: { user: true } } } // (or any other student details you want)
    });

    // 3. Merge (or "left join") the attendances (so that every student (from students) has an extra "attendance" attribute (filled or null) for today's attendance.)
    const studentsWithAttendance = students.map(student => {
        const attendanceRecord = attendances.find(a => a.studentId === student.id);
        return { ...student, attendance: attendanceRecord || null };
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Today's attendance (by section) retrieved successfully (with an extra attendance attribute (filled or null) for every student).",
        result: studentsWithAttendance
    });
});

// New controller to get attendance history (by student id) (ordered by date descending)
export const getStudentAttendanceHistoryController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Student ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const studentId = queryParamValidation.data.id;

    const attendanceHistory = await db.attendance.findMany({
        where: { studentId },
        include: {
            student: { include: { user: true } },
            section: { include: { gradeLevel: true } }
        },
        orderBy: { date: "desc" }
    });

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Student attendance history retrieved successfully",
        result: attendanceHistory
    });
});


