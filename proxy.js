import { NextResponse } from "next/server";

export function proxy(request) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    const isAuthPath = pathname.startsWith("/auth");
    const isProtectedPath = pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    if (isProtectedPath) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        return NextResponse.next();
    }

    if (isAuthPath) {
        if (token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
