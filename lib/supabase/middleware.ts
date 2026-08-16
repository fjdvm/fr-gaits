import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isProtectedRoute = url.pathname.startsWith("/dashboard") || url.pathname === "/pending-approval";
  const isAuthRoute = url.pathname === "/login" || url.pathname === "/signup" || url.pathname === "/";

  if (!user) {
    if (isProtectedRoute) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const role = user.user_metadata?.role || "student";
  const approvalStatus = user.user_metadata?.approval_status || "approved";

  if (role === "instructor" && approvalStatus === "pending") {
    if (url.pathname !== "/pending-approval") {
      url.pathname = "/pending-approval";
      return NextResponse.redirect(url);
    }
  } else {
    if (url.pathname === "/pending-approval") {
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith("/dashboard/")) {
      const expectedPrefix = `/dashboard/${role}`;
      if (!url.pathname.startsWith(expectedPrefix)) {
        url.pathname = expectedPrefix;
        return NextResponse.redirect(url);
      }
    }
  }

  if (isAuthRoute) {
    if (role === "instructor" && approvalStatus === "pending") {
      url.pathname = "/pending-approval";
    } else {
      url.pathname = `/dashboard/${role}`;
    }
    return NextResponse.redirect(url);
  }

  return response;
}
