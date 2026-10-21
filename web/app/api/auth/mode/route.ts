import { json } from "@/lib/server/util";

/** Which sign-in this deployment is using, so a wrong setup is easy to spot: open /api/auth/mode on the live site. */
export async function GET() {
  const pin = process.env.NEXT_PUBLIC_AUTH_MODE === "pin", firebase = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return json({
    login: pin ? "mobile + PIN" : firebase ? "Google + email link" : "DEMO (any 6 digits works, not safe)",
    firebase: { projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
    authModeVariable: process.env.NEXT_PUBLIC_AUTH_MODE || null,
    build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
