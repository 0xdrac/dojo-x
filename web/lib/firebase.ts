/**
 * Phone sign-in with Firebase Authentication. Active only when the NEXT_PUBLIC_FIREBASE_* variables are set;
 * otherwise the site keeps its demo OTP. Firebase sends the SMS and checks the code; our server then checks Firebase's signed token.
 */
import type { ConfirmationResult } from "firebase/auth";

export const firebaseEnabled = () => !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

let confirmation: ConfirmationResult | null = null;
let verifier: any = null;

async function getAuth() {
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const app = getApps()[0] ?? initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const auth = getAuth(app); auth.languageCode = "en";
  return auth;
}

const friendly = (e: any) => {
  const c = String(e?.code || "");
  if (c.includes("too-many-requests")) return "Too many attempts. Please wait a few minutes and try again.";
  if (c.includes("invalid-phone-number")) return "That mobile number doesn’t look right.";
  if (c.includes("invalid-verification-code")) return "That code doesn’t match. Check it and try again.";
  if (c.includes("code-expired")) return "That code has expired. Request a new one.";
  if (c.includes("captcha")) return "Couldn’t verify you’re human. Refresh the page and try again.";
  return "Couldn’t send the code right now. Please try again.";
};

/** Sends the SMS code to +91<phone10>. */
export async function sendFirebaseCode(phone10: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await getAuth(), { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");
    if (!verifier) {
      let el = document.getElementById("dx-recaptcha");
      if (!el) { el = document.createElement("div"); el.id = "dx-recaptcha"; document.body.appendChild(el); }
      verifier = new RecaptchaVerifier(auth, el, { size: "invisible" });
    }
    confirmation = await signInWithPhoneNumber(auth, "+91" + phone10, verifier);
    return { ok: true };
  } catch (e: any) {
    try { verifier?.clear(); } catch {} verifier = null;
    return { ok: false, error: friendly(e) };
  }
}

/** Checks the code the member typed and returns Firebase's signed ID token. */
export async function confirmFirebaseCode(code: string): Promise<{ ok: boolean; idToken?: string; error?: string }> {
  try {
    if (!confirmation) return { ok: false, error: "Request a new code first." };
    const cred = await confirmation.confirm(code);
    return { ok: true, idToken: await cred.user.getIdToken() };
  } catch (e: any) { return { ok: false, error: friendly(e) }; }
}
