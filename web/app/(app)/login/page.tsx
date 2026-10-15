'use client';
import dynamic from 'next/dynamic';

// The screen reads window/DOM state on mount, so it renders on the client only.
const Screen = dynamic(() => import('@/screens/Login'), { ssr: false });
export default function Page() { return <Screen />; }
