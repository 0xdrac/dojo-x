'use client';
import dynamic from 'next/dynamic';

// Sign-in is Google or an emailed link. New members then finish sign-up (profile, waiver, family) on the same page.
const EmailLogin = dynamic(() => import('@/components/EmailLogin'), { ssr: false });
export default function Page() { return <EmailLogin />; }
