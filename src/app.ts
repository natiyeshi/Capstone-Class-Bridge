import express from "express";
import morgan from "morgan";
import cors from "cors";

import routes from "./routes";
import middlewares from "./middleware";
import Auth from "./middleware/auth";

const app = express();

// Registering middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(middlewares.limiter);

// Registring routes
app.use("/api/v1/auth", routes.authRoute);
app.use("/api/v1/users", routes.userRoute);
app.use("/api/v1/teacher", Auth.authenticationMiddleWare,routes.teacherRoute);
app.use("/api/v1/parent",Auth.authenticationMiddleWare, routes.parentRoute);
app.use("/api/v1/director",Auth.authenticationMiddleWare, routes.directorRoute);
app.use("/api/v1/subject",Auth.authenticationMiddleWare, routes.subjectRoute);
app.use("/api/v1/gradeLevel",Auth.authenticationMiddleWare, routes.gradeLevelRoute);
app.use("/api/v1/section",Auth.authenticationMiddleWare, routes.sectionRoute);
app.use("/api/v1/student",Auth.authenticationMiddleWare, routes.studentRoute);
app.use("/api/v1/calendar",Auth.authenticationMiddleWare, routes.calendarRoute);
app.use("/api/v1/attendance",Auth.authenticationMiddleWare, routes.attendanceRoute);
app.use("/api/v1/announcement",Auth.authenticationMiddleWare, routes.announcementRoute);
app.use("/api/v1/result",Auth.authenticationMiddleWare, routes.resultRouter);
app.use("/api/v1/collective-result",Auth.authenticationMiddleWare, routes.collectiveResultRouter);
app.use("/api/v1/message", Auth.authenticationMiddleWare,routes.messageRouter);
app.use("/api/v1/section-message", Auth.authenticationMiddleWare,routes.sectionMessageRouter);
app.use('/api/v1/roster',Auth.authenticationMiddleWare, routes.rosterRouter);
app.use('/api/v1/grade-level-message',Auth.authenticationMiddleWare, routes.gradeLevelMessageRouter);
app.use('/api/v1/notification',Auth.authenticationMiddleWare, routes.notificationRouter);

// Route error handling middleware
app.use(middlewares.routeErrorHandlingMiddleware);

export default app;
