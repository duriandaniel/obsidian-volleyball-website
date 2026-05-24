import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSimpleAdminCookie, tokenForPassword, verifyPassword } from "@/lib/admin/simple-auth";

const Body = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin password not configured" }, { status: 500 });
  }

  if (!verifyPassword(body.password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  await setSimpleAdminCookie(tokenForPassword(body.password));
  return NextResponse.json({ redirect: "/admin" });
}
