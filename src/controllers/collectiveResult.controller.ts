import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { CollectiveResult, Result } from "@prisma/client";
import { CollectiveResultSchema } from "../validators/collective.validator";
import queryValidator from "../validators/query.validator";

export const getCollectiveResultsController = asyncWrapper(async (req, res) => {
  const users = await db.collectiveResult.findMany({
    include:{
        student: {
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
    message: "CollectiveResults retrived successfully",
    result: users,
  });
});


export const getCollectiveResultsForAStudentController = asyncWrapper(async (req, res) => {
  const users = await db.collectiveResult.findMany({
    include:{
        student: {
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
    message: "CollectiveResults retrived successfully",
    result: users,
  });
});



export const createCollectiveResultsController = asyncWrapper(async (req, res) => {
   
   const queryParamValidation = queryValidator
        .queryParamIDValidator("Student ID not provided or invalid.")
        .safeParse(req.params);
  
    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
                
    const bodyValidation = CollectiveResultSchema.safeParse(req.body);
        
    if (!bodyValidation.success)
        throw RouteError.BadRequest(
        zodErrorFmt(bodyValidation.error)[0].message,
        zodErrorFmt(bodyValidation.error)
        );

    // Check if student exists and get their section ID
    const student = await db.student.findFirst({
        where: { 
            id: queryParamValidation.data.id,
        },
        include: {
            section: true
        }
    });

    if (!student)
        throw RouteError.NotFound("Student not found.");

    if (!student.section)
        throw RouteError.BadRequest("Student is not assigned to any section.");
            
    const studentResults = await db.result.findMany({
        where: { 
            studentId: queryParamValidation.data.id,
        },
    });

    if (!studentResults.length)
        throw RouteError.BadRequest("No results found for this student.");

    // Calculate total score as average of all results
    const totalScore = studentResults.reduce((sum, result) => {
        const resultScore = (result.test1 ?? 0) + 
                          (result.test2 ?? 0) + 
                          (result.final ?? 0) + 
                          (result.mid ?? 0) + 
                          (result.quiz ?? 0) + 
                          (result.assignment ?? 0);
        return sum + resultScore;
    }, 0) / studentResults.length;

    const studentCollectiveResult = await db.collectiveResult.findFirst({
        where: { 
            studentId: queryParamValidation.data.id,
        },
    });
    
    let collectiveResult = null;

    if(!studentCollectiveResult){
        collectiveResult = await db.collectiveResult.create({
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: student.sectionId,
                feedback: bodyValidation.data.feedback,
                conduct: bodyValidation.data.conduct,
                totalScore,
            },
        });
    } else {
        collectiveResult = await db.collectiveResult.update({
            where: {
                studentId: queryParamValidation.data.id,
            },
            data: {
                studentId: queryParamValidation.data.id,
                sectionId: student.sectionId,
                feedback: bodyValidation.data.feedback,
                conduct: bodyValidation.data.conduct,
                totalScore,
            },
        });
    }
    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "CollectiveResult updated successfully",
        result: collectiveResult,
    });    
});


  
export const getCollectiveResultByIdController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
      .queryParamIDValidator("CollectiveResult ID not provided or invalid.")
      .safeParse(req.params);
    
      if (!queryParamValidation.success)
        throw RouteError.BadRequest(
          zodErrorFmt(queryParamValidation.error)[0].message,
          zodErrorFmt(queryParamValidation.error)
        );
      
    const collectiveresult = await db.collectiveResult.findFirst({
      where:{
        id: queryParamValidation.data.id,
      },
      include:{
        student : {
          include : {
            user : true,
          }
        },
      }
    });
    return sendApiResponse({
      res,
      statusCode: StatusCodes.OK,
      success: true,
      message: "CollectiveResult retrived successfully",
      result: collectiveresult,
    });
  });

export const getCollectiveResultByStudentIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("Student ID not provided or invalid.")
    .safeParse(req.params);
  
  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );
  
  const collectiveResult = await db.collectiveResult.findUnique({
    where: {
      studentId: queryParamValidation.data.id,
    },
    include: {
      result : true,
      student: {
        include: {
          user: true,
        }
      },
    }
  });

  if (!collectiveResult)
    throw RouteError.NotFound("Collective result not found for this student.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Collective result retrieved successfully",
    result: collectiveResult,
  });
});

  
//   export const deleteCollectiveResultController = asyncWrapper(async (req, res) => {
//       const queryParamValidation = queryValidator
//           .queryParamIDValidator("CollectiveResult ID not provided or invalid.")
//           .safeParse(req.params);
//       const collectiveresult = await db.collectiveresult.delete({
//         where:{
//           id: queryParamValidation.data!.id,
//          }
//       });
//       return sendApiResponse({
//         res,  
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "CollectiveResult deleted successfully",
//         result: collectiveresult,
//       });
//     });

export const createSectionCollectiveResultsController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Section ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    // Get all students in the section
    const students = await db.student.findMany({
        where: {
            sectionId: queryParamValidation.data.id
        },
        include: {
            Result: {
                include: {
                    subject: true
                }
            }
        }
    });

    if (students.length === 0)
        throw RouteError.BadRequest("No students found in this section");

    // Create or update collective results for each student
    const collectiveResults = await Promise.all(
        students.map(async (student) => {
            // Calculate total score and average
            const results = student.Result;
            const totalScore = results.reduce((sum: number, result: Result) => {
                const score = (result.test1 || 0) + (result.test2 || 0) + 
                            (result.mid || 0) + (result.final || 0) + 
                            (result.assignment || 0) + (result.quiz || 0);
                return sum + score;
            }, 0);

            // Calculate average by dividing total score by number of subjects
            const average = results.length > 0 ? totalScore / results.length : 0;

            // Create or update collective result
            return db.collectiveResult.upsert({
                where: {
                    studentId: student.id
                },
                create: {
                    studentId: student.id,
                    sectionId: queryParamValidation.data.id,
                    totalScore,
                    average,
                    isAvailable: true
                },
                update: {
                    totalScore,
                    average,
                    isAvailable: true
                }
            });
        })
    );

    // Sort students by average score and assign ranks
    const sortedResults = collectiveResults
        .sort((a, b) => (b.average || 0) - (a.average || 0))
        .map((result, index) => ({
            ...result,
            rank: index + 1
        }));

    // Update ranks in database
    await Promise.all(
        sortedResults.map(result =>
            db.collectiveResult.update({
                where: { id: result.id },
                data: { rank: result.rank }
            })
        )
    );

    return sendApiResponse({
        res,
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Collective results created successfully with averages",
        result: sortedResults
    });
});

export const getCollectiveResultsBySectionController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("Section ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const collectiveResults = await db.collectiveResult.findMany({
        where: {
            sectionId: queryParamValidation.data.id
        },
        include: {
            student: {
                include: {
                    user: true
                }
            }
        },
        orderBy: {
            rank: 'asc'
        }
    });

    if (collectiveResults.length === 0)
        throw RouteError.NotFound("No collective results found for this section.");

    return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collective results retrieved successfully",
        result: collectiveResults
    });
});

export const updateCollectiveResultFeedbackController = asyncWrapper(async (req, res) => {
    const queryParamValidation = queryValidator
        .queryParamIDValidator("CollectiveResult ID not provided or invalid.")
        .safeParse(req.params);

    if (!queryParamValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(queryParamValidation.error)[0].message,
            zodErrorFmt(queryParamValidation.error)
        );

    const bodyValidation = CollectiveResultSchema.pick({
        feedback: true,
        conduct: true
    }).safeParse(req.body);

    if (!bodyValidation.success)
        throw RouteError.BadRequest(
            zodErrorFmt(bodyValidation.error)[0].message,
            zodErrorFmt(bodyValidation.error)
        );

    const collectiveResult = await db.collectiveResult.findUnique({
        where: {
            id: queryParamValidation.data.id
        }
    });

    if (!collectiveResult)
      return sendApiResponse({
        res,
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collective result feedback updated successfully",
        result: null,
    });

    const updatedResult = await db.collectiveResult.update({
        where: {
            id: queryParamValidation.data.id
        },
        data: {
            feedback: bodyValidation.data.feedback,
            conduct: bodyValidation.data.conduct
        },
        include: {
            student: {
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
        message: "Collective result feedback updated successfully",
        result: updatedResult
    });
});