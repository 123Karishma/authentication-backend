import { Router } from "express";
import { Createuser, loginUser ,getprofile, logoutUser} from "../controller/User.js";
import authMiddleware from "../middleware/authMiddleware.ts";


const router = Router();

// Public routes
router.post("/createuser", Createuser);
router.post("/", loginUser);

router.get("/profile/:id", authMiddleware, getprofile);

router.post("/logout", authMiddleware, logoutUser);


export default router;