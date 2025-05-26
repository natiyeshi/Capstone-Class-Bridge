import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Result } from "@prisma/client";
import { RoasterSchema } from "../validators/roaster.validator";
import queryValidator from "../validators/query.validator";

export const getRoasterController = asyncWrapper(async (req, res) => {
  const users = await db.roaster.findMany({
    include:{
        section:true,
        subjects: true,
        student : { 
            include :{
                user : true
            }
        }
    }
  });
  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Roaster retrived successfully",
    result: users,
  });
});

export const getRoasterBySectionController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Section ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const roaster = await db.roaster.findMany({
    where: { 
      sectionId: queryParamValidation.data.id 
    },
    include: {
      section: true,
      subjects : true,
      student: {
        include: {
          user: true
        }
      }
    }
  });

  if (!roaster) 
    throw RouteError.NotFound("Roaster not found for this section.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK, 
    success: true,
    message: "Roaster retrieved successfully",
    result: roaster
  });
});

export const getRoasterByStudentController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Student ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const roaster = await db.roaster.findMany({
    where: { 
      studentId: queryParamValidation.data.id 
    },
    include: {
      section: true,
      subjects: true,
      student: {
        include: {
          user: true
        }
      }
    }
  });

  if (!roaster) 
    throw RouteError.NotFound("Roaster not found for this student.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true, 
    message: "Roaster retrieved successfully",
    result: roaster
  });
});


export const createRoasterController = asyncWrapper(async (req, res) => {
    // const { semesterNumber } = req.body;
    let semesterNumber = 1
    // const setting = await db.settings.findFirst()
    // if(!setting){
    //     await db.settings.create()
    // }

    if (!semesterNumber || typeof semesterNumber !== 'number') {
        throw RouteError.BadRequest("Semester number is required and must be a number");
    }

    // Get all students with their sections and results
    const students = await db.student.findMany({
        where: {
            sectionId: { not: null } // Only get students who are assigned to sections
        },
        include: {
            section: true,
            Result: {
                include: {
                    subject: true
                }
            }
        }
    });

    if (students.length === 0) {
        throw RouteError.BadRequest("No students found in any section");
    }

    // Check if rosters already exist for this semester
    const existingRosters = await db.roaster.findMany({
        where: {
            semesterNumber: semesterNumber
        }
    });
    
    if (existingRosters.length > 0) {
        semesterNumber = existingRosters[0].semesterNumber
    }

    // Group students by section for better organization
    const studentsBySection = students.reduce((acc, student) => {
        if (student.section) {
            if (!acc[student.section.id]) {
                acc[student.section.id] = [];
            }
            acc[student.section.id].push(student);
        }
        return acc;
    }, {} as Record<string, typeof students>);

    // Create rosters for each section's students
    const allRosters = [];
    for (const [sectionId, sectionStudents] of Object.entries(studentsBySection)) {
        // Create rosters for students in this section
        const sectionRosters = await Promise.all(
            sectionStudents.map(async (student,ind) => {
                // Calculate average from student's results
                const results = student.Result;
                console.log("1.",results,ind)
                const rs : any = {}
                const total = results.length == 0 ? 0 : results.reduce((sum, result) => {
                    const test1Score = (result.test1 || 0)// 10%
                    const test2Score = (result.test2 || 0)// 10%
                    const midScore = (result.mid || 0) // 15%
                    const finalScore = (result.final || 0) // 40%
                    const assignmentScore = (result.assignment || 0)// 10%
                    const quizScore = (result.quiz || 0) // 5%
                    const t = test1Score + test2Score + midScore + finalScore + assignmentScore + quizScore;
                    rs[result?.subject?.id ?? ""] = t
                    return sum + t;
                }, 0);
                console.log("2.",total,ind)
                console.log("rs-",rs)
                const average = results.length > 0 
                    ? total / results.length 
                    : 0;
                

                // Create the roaster
                return db.roaster.create({
                    data: {
                        studentId: student.id,
                        sectionId: sectionId,
                        semesterNumber: semesterNumber,
                        average: average,
                        rank: 0, // Will be updated after all rosters are created
                        subjects: {
                            create: results.map(result => ({
                                subjectName: result.subject?.name || 'Unknown Subject',
                                subjectResult: rs[ result.subject?.id ?? ""]
                            }))
                        }
                    },
                    include: {
                        subjects: true
                    }
                });
            })
        );
        allRosters.push(...sectionRosters);

        // Update ranks for this section
        const sortedSectionRosters = [...sectionRosters].sort((a, b) => b.average - a.average);
        await Promise.all(
            sortedSectionRosters.map((roster, index) => 
                db.roaster.update({
                    where: { id: roster.id },
                    data: { rank: index + 1 }
                })
            )
        );
    }

    // Get the final rosters with updated ranks
    const finalRosters = await db.roaster.findMany({
        where: {
            semesterNumber: semesterNumber
        },
        include: {
            student: {
                include: {
                    user: true
                }
            },
            section: true,
            subjects: true
        },
        orderBy: [
            { sectionId: 'asc' },
            { rank: 'asc' }
        ]
    });

    await db.result.deleteMany({})
    await db.collectiveResult.deleteMany({})

    return sendApiResponse({
        res,
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Rosters created successfully for all sections",
        result: finalRosters
    });
});
  

export const deleteAllRoasterController = asyncWrapper(async (req, res) => {

  // First delete all associated RoasterSubjects
  await db.roasterSubject.deleteMany({
  });

  // Then delete the Roaster
  const deletedRoaster = await db.roaster.deleteMany({});

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK, 
    success: true,
    message: "Roaster and associated subjects deleted successfully",
    result: deletedRoaster
  });
});

  // export const getRoasterByIdController = asyncWrapper(async (req, res) => {
  //   const queryParamValidation = queryValidator
  //     .queryParamIDValidator("Roaster ID not provided or invalid.")
  //     .safeParse(req.params);
    
  //     if (!queryParamValidation.success)
  //       throw RouteError.BadRequest(
  //         zodErrorFmt(queryParamValidation.error)[0].message,
  //         zodErrorFmt(queryParamValidation.error)
  //       );
      
  //   const roaster = await db.roaster.findFirst({
  //     where:{
  //       id: queryParamValidation.data.id,
  //     },
  //   });
  //   return sendApiResponse({
  //     res,
  //     statusCode: StatusCodes.OK,
  //     success: true,
  //     message: "roaster retrived successfully",
  //     result: roaster,
  //   });
  // });


  
  // export const deleteResultController = asyncWrapper(async (req, res) => {
  //     const queryParamValidation = queryValidator
  //         .queryParamIDValidator("Result ID not provided or invalid.")
  //         .safeParse(req.params);
  //     const result = await db.result.delete({
  //       where:{
  //         id: queryParamValidation.data!.id,
  //        }
  //     });
  //     return sendApiResponse({
  //       res,  
  //       statusCode: StatusCodes.OK,
  //       success: true,
  //       message: "Result deleted successfully",
  //       result: result,
  //     });
  //   });