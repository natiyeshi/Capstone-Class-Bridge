import { Router } from "express";
import middleware from "../middleware";
import {
  createRoasterController,
  deleteAllRoasterController,
  getRoasterBySectionController,
  getRoasterByStudentController,
  getRoasterController
} from "../controllers/roaster.controller"
import Auth from "../middleware/auth"
const router = Router();

router.post("/", 
  // Auth.authenticationMiddleWare, 
  // Auth.checkRoleMiddleware(['DIRECTOR']), 
  createRoasterController
);

router.get("/", 
  // Auth.authenticationMiddleWare, 
  // Auth.checkRoleMiddleware(['DIRECTOR']), 
  getRoasterController
);


router.get("/section/:id", 
  // Auth.authenticationMiddleWare, 
  // Auth.checkRoleMiddleware(['DIRECTOR']), 
  getRoasterBySectionController
);


router.get("/student/:id", 
  // Auth.authenticationMiddleWare, 
  // Auth.checkRoleMiddleware(['DIRECTOR']), 
  getRoasterByStudentController
);


router.delete("/", 
  // Auth.authenticationMiddleWare, 
  // Auth.checkRoleMiddleware(['DIRECTOR']), 
  deleteAllRoasterController
);
export default router;
