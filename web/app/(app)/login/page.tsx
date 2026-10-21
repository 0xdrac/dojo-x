'use client';
import dynamic from 'next/dynamic';
import PublicGate from '@/components/PublicGate';

// The screens read window/DOM state on mount, so they render on the client only.
const Screen = dynamic(() => import('@/screens/Login'), { ssr: false });
// Real sign-in (mobile number + 6-digit PIN, WhatsApp code to set it) when NEXT_PUBLIC_AUTH_MODE=pin; otherwise the demo OTP screen.
const PhoneLogin = dynamic(() => import('@/components/PhoneLogin'), { ssr: false });
export default function Page() { return process.env.NEXT_PUBLIC_AUTH_MODE === 'pin' ? <PhoneLogin /> : <PublicGate><Screen /></PublicGate>; }
