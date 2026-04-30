import User from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DB from "@/lib/db";

export async function POST(request) {
    try {
        await DB();
        const body = await request.json();
        
        if (!body || !body.username || !body.password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const { username, password } = body;

        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username.trim(),
            password: hashedPassword
        });
        await newUser.save();

        const payload = {
            id: newUser._id.toString(),
            username: newUser.username,
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
        
        const response = NextResponse.json({ message: "User registered successfully" }, { status: 201 });
        
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ 
            error: error.message || "Internal Server Error" 
        }, { status: 500 });
    }
}