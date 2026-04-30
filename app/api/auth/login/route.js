import User from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DB from "@/lib/db";

export async function POST(request) {
    await DB();
    try {
        const { username, password } = await request.json();
        
        const user = await User.findOne({ username: username.trim() });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        
        const payload = {
            id: user._id.toString(),
            username: user.username,
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
        
        const response = NextResponse.json({ 
            message: "Login successful",
            user: { id: user._id, username: user.username }
        });
        
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}