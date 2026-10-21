'use client';
import dynamic from 'next/dynamic';
import PublicGate from '@/components/PublicGate';
import { firebaseEnabled } from '@/lib/firebase';

// The screens read window/DOM state on mount, so they render on the client only.
const Screen = dynamic(() => import('@/screens/Login'), { ssr: false });
// Real sign-in (email link) when Firebase is configured; otherwise the demo phone + OTP screen.
const EmailLogin = dynamic(() => import('@/components/EmailLogin'), { ssr: false });
export default function Page() { return firebaseEnabled() ? <EmailLogin /> : <PublicGate><Screen /></PublicGate>; }
