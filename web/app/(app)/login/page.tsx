'use client';
import dynamic from 'next/dynamic';

// Sign-in is Google. New members then finish sign-up (profile, waiver, family) on the same page.
const GoogleLogin = dynamic(() => import('@/components/GoogleLogin'), { ssr: false });
export default function Page() { return <GoogleLogin />; }
