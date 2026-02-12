import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[Auth Callback] URL:", request.url);
  console.log("[Auth Callback] Code present:", !!code);
  console.log("[Auth Callback] Error:", error, errorDescription);

  // Handle OAuth provider errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    const errorParams = new URLSearchParams({
      error: error,
      ...(errorDescription && { description: errorDescription }),
    });
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?${errorParams}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    console.log("[Auth Callback] Exchange result:", {
      user: data?.user?.email,
      error: exchangeError?.message,
    });

    if (!exchangeError) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    console.error("Code exchange error:", exchangeError.message);
    const errorParams = new URLSearchParams({
      error: "code_exchange_failed",
      description: exchangeError.message,
    });
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?${errorParams}`,
    );
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
