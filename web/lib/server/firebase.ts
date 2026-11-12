import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from "jose";

/** Phone sign-in via Firebase is on when the project id is configured. Then the demo OTP is off. */
export const firebaseProject = () => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
export const firebaseMode = () => !!firebaseProject();

const remote = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"), { cacheMaxAge: 6 * 3600_000, cooldownDuration: 30_000 });

/** Verifies a Firebase ID token (signature, issuer, audience, expiry) and returns the verified email address it proves. */
export async function verifyFirebaseEmail(idToken: unknown): Promise<{ email?: string; error?: string }> {
  const project = firebaseProject();
  if (!project || typeof idToken !== "string") return { error: "Sign-in isn’t available right now." };
  try {
    const keys = process.env.FIREBASE_JWKS_JSON && (process.env.NODE_ENV !== "production" || process.env.DOJO_LOCAL_PROD === "1") ? createLocalJWKSet(JSON.parse(process.env.FIREBASE_JWKS_JSON)) : remote;
    const { payload } = await jwtVerify(idToken, keys, { issuer: `https://securetoken.google.com/${project}`, audience: project });
    if ((payload as any).firebase?.sign_in_provider !== "google.com") return { error: "Please sign in with Google." };
    const email = String(payload.email || "").trim().toLowerCase();
    if (!email || payload.email_verified !== true) return { error: "That email isn’t verified." };
    return { email };
  } catch { return { error: "That sign-in didn’t work. Please try again." }; }
}
