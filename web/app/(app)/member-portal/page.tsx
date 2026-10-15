'use client';
import dynamic from 'next/dynamic';
import PublicGate from '@/components/PublicGate';

// The screen reads window/DOM state on mount, so it renders on the client only.
const Screen = dynamic(() => import('@/screens/MemberPortal'), { ssr: false });
export default function Page() { return <PublicGate><Screen /></PublicGate>; }
