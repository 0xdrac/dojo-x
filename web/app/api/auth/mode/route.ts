import { json } from "@/lib/server/util";

/** Whether sign-in is set up on this deployment: open /api/auth/mode on the live site. */
export async function GET() {
  const f = { projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID };
  return json({ login: f.projectId && f.apiKey ? "Google + email link" : "NOT SET UP: add the NEXT_PUBLIC_FIREBASE_* variables", firebase: f, build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null });
}
