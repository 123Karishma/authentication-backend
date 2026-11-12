
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



async function authMiddleware(req: Request,
    res: Response,
    next: NextFunction) {
    const authHeader = req.cookies.token;  // req.headers["authorization"];
    console.log("authHeader =", authHeader);

    // token exists or not
    if (!authHeader) {

        return res.redirect("/")
    }


    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET as string);

        // store decoded user
        req.user = decoded;
        next();
    }

    catch (error) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
}



export default authMiddleware;
