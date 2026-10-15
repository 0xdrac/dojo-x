'use client';
import { useEffect } from 'react';

// Staff now sign in on the main login page. Old links and bookmarks land here and are forwarded.
export default function StaffLoginRedirect() {
  useEffect(() => { location.replace('/login' + location.hash); }, []);
  return null;
}
