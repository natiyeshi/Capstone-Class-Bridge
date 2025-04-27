import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Section } from "@prisma/client";
import {CreateSectionSchema} from "../validators/section.validator";
import queryValidator from "../validators/query.validator";

export const getSectionController = asyncWrapper(async (req, res) => {
  const section = await db.section.findMany({
    include:{
      students : {
        include : {
          user : true,
        }
      },
      gradeLevel : true,
      homeRoom : {
        include : {
          user : true,
        }
      }
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Section retrived successfully",
    result: section,
  });
});


export const getSectionByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Section ID not provided or invalid.")
    .safeParse(req.params);
  
    if (!queryParamValidation.success)
      throw RouteError.BadRequest(
        zodErrorFmt(queryParamValidation.error)[0].message,
        zodErrorFmt(queryParamValidation.error)
      );
    
  const section = await db.section.findFirst({
    where:{
      id: queryParamValidation.data.id,
    },
    include:{
      students : {
        include : {
          user : true,
        }
      },
      gradeLevel : true,
      homeRoom : {
        include : {
          user : true,
        }
      }
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Section retrived successfully",
    result: section,
  });
});





export const createSectionController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = CreateSectionSchema.safeParse(req.body);
    console.log("first ")

    if (!bodyValidation.success){
        throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
        );}


    
    const gradeLevelId = await db.gradeLevel.findFirst({
      where: { id : bodyValidation.data.gradeLevelId },
    });
  
    if (!gradeLevelId) throw RouteError.BadRequest("Grade Level doesn't exist.");

    const existingSection = await db.section.findFirst({
        where: { name: bodyValidation.data.name, gradeLevelId: bodyValidation.data.gradeLevelId },
    });
    
    if (existingSection) throw RouteError.BadRequest("Section with this grade level is already in use.");
  

    
    if(bodyValidation.data.homeRoom){
      const teacherExists = await db.teacher.findFirst({
        where: { id : bodyValidation.data.homeRoom },
      });
    
      if (!teacherExists) throw RouteError.BadRequest("Home Room Id doesn't exist.");
    }
    const students = bodyValidation.data.students ?? []

    const validStudents = await db.student.findMany({
      where: { id: { in: students } },
      select: { id: true },
    });

    const validStudentIds = validStudents.map(student => student.id);

    const invalidStudents = students.filter(id => !validStudentIds.includes(id));

    if (invalidStudents.length > 0) {
        throw RouteError.BadRequest(`Invalid student IDs: ${invalidStudents.join(", ")}`);
    }
    console.log("not working")

    const studentsList :string[] = bodyValidation.data.students ?? []
    const section = await db.section.create({
      data: {
        name : bodyValidation.data.name,
        gradeLevelId: bodyValidation.data.gradeLevelId,
        teacherId: bodyValidation.data.homeRoom,
        students: {
        connect: studentsList.map(studentId => ({ id: studentId })),
        },
      },
      include: {
        gradeLevel: true,
        students: {
        include: {
          user: true,
        },
        },
      },
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Section created successfully",
      result: section,
    });
  });


  export const addStudentOnSectionController = asyncWrapper(async (req, res) => {
    
    const bodyValidation = Array.isArray(req.body) && req.body.every(item => typeof item === "string") 
      ? req.body 
      : (() => { 
        throw RouteError.BadRequest("Request body must be an array of strings."); 
      })();
    const queryParamValidation = queryValidator
      .queryParamIDValidator("Section ID not provided or invalid.")
      .safeParse(req.params);

    if (!queryParamValidation.success)
      throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
      );

    const existingSection = await db.section.findUnique({
      where: { id: queryParamValidation.data.id },
    });

    if (!existingSection)
      throw RouteError.NotFound("Section not found with the provided ID.");

    const students = bodyValidation ?? [];

    const validStudents = await db.student.findMany({
      where: { id: { in: students } },
      select: { id: true },
    });

    const validStudentIds = validStudents.map(student => student.id);

    const invalidStudents = students.filter(id => !validStudentIds.includes(id));

    if (invalidStudents.length > 0) {
      throw RouteError.BadRequest(`Invalid student IDs: ${invalidStudents.join(", ")}`);
    }

    const updatedSection = await db.section.update({
      where: { id: queryParamValidation.data.id },
      data: {
      students: {
        connect: validStudentIds.map(studentId => ({ id: studentId })),
      },
      },
      include: {
      students: {
        include: {
        user: true,
        },
      },
      },
    });

    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "Students added to section successfully",
      result: updatedSection,
    });
    
  });
// export const createSectionController = asyncWrapper(async (req, res) => {
    
//     const bodyValidation = SectionSchema.safeParse(req.body);
       
//     if (!bodyValidation.success)
//         throw RouteError.BadRequest(
//             zodErrorFmt(bodyValidation.error)[0].message,
//             zodErrorFmt(bodyValidation.error)
//         );


//     const existingSection = await db.section.findFirst({
//         where: { level: bodyValidation.data.level },
//     });
    
//     if (existingSection) throw RouteError.BadRequest("Section already in use.");
    
//     const validStudents = await db.student.findMany({
//       where: { id: { in: bodyValidation.data.studentList } },
//       select: { id: true },
//     });

//     const validStudentIds = validStudents.map(student => student.id);

//     const invalidStudents = bodyValidation.data.studentList.filter(id => !validStudentIds.includes(id));

//     if (invalidStudents.length > 0) {
//         throw RouteError.BadRequest(`Invalid student IDs: ${invalidStudents.join(", ")}`);
//     }

//     const section = await db.section.create({
//         data : {
//             level : bodyValidation.data.level,
//             studentList: {
//                 connect: bodyValidation.data.studentList.map((studentId: string) => ({ id: studentId })),
//             },
//         },
//         include : {
//           studentList : true
//         }
//     });
//     return sendApiResponse({
//       res,
//       statusCode: StatusCodes.OK,
//       success: true,
//       message: "Section created successfully",
//       result: section,
//     });
//   });


  
// export const deleteSectionController = asyncWrapper(async (req, res) => {
//   const queryParamValidation = queryValidator
//     .queryParamIDValidator("Grade Level ID not provided or invalid.")
//     .safeParse(req.params);

//   if (!queryParamValidation.success)
//     throw RouteError.BadRequest(
//       zodErrorFmt(queryParamValidation.error)[0].message,
//       zodErrorFmt(queryParamValidation.error)
//     );

//   const existingsection = await db.section.findUnique({
//     where: {
//       id: queryParamValidation.data.id,
//     }
//   });

//   if (!existingsection)
//     throw RouteError.NotFound("Grade Level not found with the provided ID.");

//   await db.section.delete({
//     where: {
//       id: queryParamValidation.data.id,
//     },
//   });

//   return sendApiResponse({
//     res,
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: "Grade Level deleted successfully.",
//     result: null,
//   });
// });


// export const updatesectionController = asyncWrapper(async (req, res) => {
//   const queryParamValidation = queryValidator
//     .queryParamIDValidator("section ID not provided or invalid.")
//     .safeParse(req.params);
 

//   if (!queryParamValidation.success)
//     throw RouteError.BadRequest(
//       zodErrorFmt(queryParamValidation.error)[0].message,
//       zodErrorFmt(queryParamValidation.error)
//     );
//     const bodyValidation = SectionSchema.safeParse(
//       req.body
//     );

//   if (!bodyValidation.success)
//     throw RouteError.BadRequest(
//       zodErrorFmt(bodyValidation.error)[0].message,
//       zodErrorFmt(bodyValidation.error)
//     );

//   const existingsection = await db.section.findUnique({
//     where: {
//       id: queryParamValidation.data.id,
//     },
    
//   });

//   if (!existingsection)
//     throw RouteError.NotFound("section not found with the provided ID.");
  
//   const validStudents = await db.student.findMany({
//     where: { id: { in: bodyValidation.data.studentList } },
//     select: { id: true },
//   });
//   const validStudentIds = validStudents.map(student => student.id);
//   const invalidStudents = bodyValidation.data.studentList.filter(id => !validStudentIds.includes(id));
//   if (invalidStudents.length > 0) {
//       throw RouteError.BadRequest(`Invalid student IDs: ${invalidStudents.join(", ")}`);
//   }
//   const updatedSection = await db.section.update({
//     where: {
//       id: queryParamValidation.data.id,
//     },
//     data : {
//       level : bodyValidation.data.level,
//       studentList: {
//           connect: bodyValidation.data.studentList.map((studentId: string) => ({ id: studentId })),
//       },
//     },
//    });

//   return sendApiResponse({
//     res,
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: "section updated successfully.",
//     result: updatedSection,
//   });
// });


