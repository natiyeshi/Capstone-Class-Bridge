import { Router } from "express";
import {greetingController} from "../controllers/hello.controller";

const helloRouter = Router();

helloRouter.get("/", greetingController);

export default helloRouter;
