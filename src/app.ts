import express from "express";
import morgan from "morgan";
import cors from "cors";

import routes from "./routes";
import middlewares from "./middleware";

const app = express();

// Registering middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(middlewares.limiter);

// Registring routes
app.use("/api/v1/auth", routes.authRoute);
app.use("/api/v1/users", routes.userRoute);
app.use("/api/v1/teacher", routes.teacherRoute);
app.use("/api/v1/parent", routes.parentRoute);
app.use("/api/v1/director", routes.directorRoute);
app.use("/api/v1/subject", routes.subjectRoute);
app.use("/api/v1/gradeLevel", routes.gradeLevelRoute);
app.use("/api/v1/section", routes.sectionRoute);
app.use("/api/v1/student", routes.studentRoute);
app.use("/api/v1/calendar", routes.calendarRoute);
app.use("/api/v1/attendance", routes.attendanceRoute);
app.use("/api/v1/announcement", routes.announcementRoute);
app.use("/api/v1/result", routes.resultRouter);
app.use("/api/v1/collective-result", routes.collectiveResultRouter);
app.use("/api/v1/message", routes.messageRouter);
app.use("/api/v1/section-message", routes.sectionMessageRouter);

// Route error handling middleware
app.use(middlewares.routeErrorHandlingMiddleware);

export default app;
