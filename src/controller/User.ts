import prisma from "../config/db.ts";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { Request, Response } from "express";

export const Createuser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        // Check whether email already exists
        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }

        const hashedPassword = await argon2.hash(password);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });


        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};


export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: "All fields are required"
        })
    }
    const notExists = await prisma.user.findUnique({
        where: { email }
    })
    if (!notExists) {
        return res.status(400).json({
            error: "Email does not exist"
        })
    }
    const isMatch = await argon2.verify(notExists.password, password);
    if (!isMatch) {
        return res.status(400).json({
            error: "invalid password"
        })
    }
    const payload = {
        id: notExists.id,
        email: notExists.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string,);

    res.cookie("token", token, {
        httpOnly: true,
    });


    return res.status(200).json({
        message: "Login successful",
        user: {
            id: notExists.id,
            email: notExists.email,
        },
    });

}

export const getprofile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as jwt.JwtPayload).id;

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};


export const logoutUser=async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        path: "/",
    });
    return res.status(200).json({
        message: "Logout successful"
    });
}