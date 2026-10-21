import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from "jose";

/** Phone sign-in via Firebase is on when the project id is configured. Then the demo OTP is off. */
export const firebaseProject = () => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
export const firebaseMode = () => !!firebaseProject();

const remote = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

/** Verifies a Firebase ID token (signature, issuer, audience, expiry) and returns the 10-digit Indian mobile number it proves. */
export async function verifyFirebasePhone(idToken: unknown): Promise<{ phone?: string; error?: string }> {
  const project = firebaseProject();
  if (!project || typeof idToken !== "string") return { error: "Sign-in isn’t available right now." };
  try {
    const keys = process.env.FIREBASE_JWKS_JSON && process.env.NODE_ENV !== "production" ? createLocalJWKSet(JSON.parse(process.env.FIREBASE_JWKS_JSON)) : remote;
    const { payload } = await jwtVerify(idToken, keys, { issuer: `https://securetoken.google.com/${project}`, audience: project });
    const num = String(payload.phone_number || "");
    if (!/^\+91[6-9]\d{9}$/.test(num)) return { error: "Please sign in with an Indian mobile number." };
    return { phone: num.slice(3) };
  } catch { return { error: "We couldn’t verify that code. Please try again." }; }
}
