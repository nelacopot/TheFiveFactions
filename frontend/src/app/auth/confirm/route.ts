import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const destination = new URL("/register/confirmed", request.url);
  const emailChangeDestination = new URL("/account/profile", request.url);

  if (!tokenHash || (type !== "email" && type !== "signup" && type !== "email_change")) {
    if (type === "email_change") {
      emailChangeDestination.searchParams.set("emailStatus", "invalid");
      return NextResponse.redirect(emailChangeDestination);
    }
    destination.searchParams.set("status", "invalid");
    return NextResponse.redirect(destination);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    if (type === "email_change") {
      emailChangeDestination.searchParams.set("emailStatus", "invalid");
      return NextResponse.redirect(emailChangeDestination);
    }
    destination.searchParams.set("status", "invalid");
    return NextResponse.redirect(destination);
  }

  if (type === "email_change") {
    emailChangeDestination.searchParams.set("emailStatus", "confirmed");
    return NextResponse.redirect(emailChangeDestination);
  }

  const accountUrl = new URL("/account", request.url);
  accountUrl.searchParams.set("confirmed", "1");
  return NextResponse.redirect(accountUrl);
}
