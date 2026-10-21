'use client';
import dynamic from 'next/dynamic';
import { prefetchPortal } from '@/lib/api';

// The screen reads window/DOM state on mount, so it renders on the client only.
// Its data requests start right now, in parallel with downloading the screen's code.
const Screen = dynamic(() => import('@/screens/MemberPortal'), { ssr: false });
if (typeof window !== 'undefined') prefetchPortal();
export default function Page() { return <Screen />; }
