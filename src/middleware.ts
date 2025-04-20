import type { NextRequest } from "next/server";
import { updateSession } from "./lib/middleware";

export async function middleware(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // fallback safety
};
