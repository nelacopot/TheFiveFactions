import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const destination = new URL("/register/confirmed", request.url);

  if (!tokenHash || (type !== "email" && type !== "signup")) {
    destination.searchParams.set("status", "invalid");
    return NextResponse.redirect(destination);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  destination.searchParams.set("status", error ? "invalid" : "success");
  return NextResponse.redirect(destination);
}
