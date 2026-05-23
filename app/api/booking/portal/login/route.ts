import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const supa = await supabaseServer();
  const { error } = await supa.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error) {
    return NextResponse.json({ error: "Wrong email or password. Try the reset link below." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
