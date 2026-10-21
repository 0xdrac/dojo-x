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
  if (c.includes("account-exists-with-different-credential")) return "This email is already registered another way. Use the email link instead.";
  if (c.includes("network-request-failed")) return "Network problem. Check your connection and try again.";
  if (c.includes("invalid-email")) return "That email address doesn’t look right.";
  if (c.includes("invalid-action-code") || c.includes("expired-action-code")) return "That link has expired or was already used. Request a new one.";
  if (c.includes("invalid-verification-code")) return "That code doesn’t match. Check it and try again.";
  if (c.includes("code-expired")) return "That code has expired. Request a new one.";
  if (c.includes("captcha")) return "Couldn’t verify you’re human. Refresh the page and try again.";
  if (c.includes("billing-not-enabled")) return "Email sign-in isn’t set up in Firebase yet. [auth/billing-not-enabled]";
  if (c.includes("unauthorized-domain")) return "This website isn’t allowed to use Firebase sign-in yet. [auth/unauthorized-domain]";
  if (c.includes("operation-not-allowed")) return "Email-link sign-in is switched off in Firebase. [auth/operation-not-allowed]";
  if (c.includes("quota-exceeded")) return "Too many emails were requested today. Try again later. [auth/quota-exceeded]";
  return `Couldn’t send the sign-in link right now. Please try again. [${c || String(e?.message || "unknown").slice(0, 60)}]`;
};

const LS = "dx-signin-email";
const rem = (v?: string) => { try { v ? localStorage.setItem(LS, v) : localStorage.removeItem(LS); } catch {} };
const recall = () => { try { return localStorage.getItem(LS) || ""; } catch { return ""; } };

/** Emails a one-tap sign-in link. */
export async function sendEmailLink(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await getAuth(), { sendSignInLinkToEmail } = await import("firebase/auth");
    await sendSignInLinkToEmail(auth, email, { url: location.origin + "/login", handleCodeInApp: true });
    rem(email); return { ok: true };
  } catch (e: any) { console.error("[firebase] send link failed", e); return { ok: false, error: friendly(e) }; }
}

/** True when the current page was opened from a sign-in email. */
export async function isEmailLink(): Promise<boolean> {
  try { const auth = await getAuth(), { isSignInWithEmailLink } = await import("firebase/auth"); return isSignInWithEmailLink(auth, location.href); } catch { return false; }
}
export const rememberedEmail = recall;

/** Finishes sign-in from the emailed link and returns Firebase's signed ID token. */
export async function completeEmailLink(email: string): Promise<{ ok: boolean; idToken?: string; error?: string }> {
  try {
    const auth = await getAuth(), { signInWithEmailLink } = await import("firebase/auth");
    const cred = await signInWithEmailLink(auth, email, location.href); rem();
    return { ok: true, idToken: await cred.user.getIdToken() };
  } catch (e: any) { return { ok: false, error: friendly(e) }; }
}

/** Google sign-in: a popup, or a full-page redirect where popups are blocked (some phone browsers). */
export async function signInWithGoogle(): Promise<{ ok: boolean; idToken?: string; redirecting?: boolean; error?: string }> {
  try {
    const auth = await getAuth(), { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
    const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" });
    try {
      const cred = await signInWithPopup(auth, provider);
      return { ok: true, idToken: await cred.user.getIdToken() };
    } catch (e: any) {
      const c = String(e?.code || "");
      if (c.includes("popup-closed-by-user") || c.includes("cancelled-popup-request")) return { ok: false };
      if (c.includes("popup-blocked") || c.includes("operation-not-supported")) { try { sessionStorage.setItem("dx-g-redirect", "1"); } catch {} await signInWithRedirect(auth, provider); return { ok: true, redirecting: true }; }
      throw e;
    }
  } catch (e: any) { console.error("[firebase] google sign-in failed", e); return { ok: false, error: friendly(e) }; }
}

/** After a Google redirect sign-in, picks up the result when the page loads again. */
export async function googleRedirectResult(): Promise<{ idToken?: string; error?: string } | null> {
  try {
    if (sessionStorage.getItem("dx-g-redirect") !== "1") return null;
    sessionStorage.removeItem("dx-g-redirect");
    const auth = await getAuth(), { getRedirectResult } = await import("firebase/auth");
    const cred = await Promise.race([getRedirectResult(auth), new Promise<null>((r) => setTimeout(() => r(null), 8000))]);
    return cred ? { idToken: await cred.user.getIdToken() } : null;
  } catch (e: any) { return { error: friendly(e) }; }
}
