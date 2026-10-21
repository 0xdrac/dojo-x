'use client';
import dynamic from 'next/dynamic';
import PublicGate from '@/components/PublicGate';
import { firebaseEnabled } from '@/lib/firebase';

// The screens read window/DOM state on mount, so they render on the client only.
const Screen = dynamic(() => import('@/screens/Login'), { ssr: false });
// Real sign-in (mobile number + 6-digit PIN, WhatsApp code to set it) when NEXT_PUBLIC_AUTH_MODE=pin; otherwise the demo OTP screen.
const PhoneLogin = dynamic(() => import('@/components/PhoneLogin'), { ssr: false });
// Google / emailed-link sign-in when the Firebase variables are set.
const EmailLogin = dynamic(() => import('@/components/EmailLogin'), { ssr: false });
export default function Page() {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === 'pin') return <PhoneLogin />;
  return firebaseEnabled() ? <EmailLogin /> : <PublicGate><Screen /></PublicGate>;
}
