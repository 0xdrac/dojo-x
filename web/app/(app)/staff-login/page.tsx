'use client';
import { useEffect, useState } from 'react';
import { DojoAPI } from '@/lib/api';
import { useShell } from '@/components/Shell';

const field: React.CSSProperties = { width: '100%', height: 56, padding: '0 16px', background: '#141414', border: '1px solid #2E2E2E', color: '#F5F5F5', font: '600 18px/1 var(--mono)', letterSpacing: '.08em', outline: 'none' };
const label: React.CSSProperties = { font: '700 11px/1 var(--mono)', letterSpacing: '.2em', color: '#9A9A9A', marginBottom: 10, display: 'block' };

export default function StaffLogin() {
  const { go } = useShell();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (location.hash === '#logout') { await DojoAPI.logout(); history.replaceState(null, '', '/staff-login'); return; }
      const r = await DojoAPI.staffMe();
      if (r.ok) go(r.staff.role === 'coach' ? '/coach-app' : '/admin');
    })();
  }, [go]);

  const digits = phone.replace(/\D/g, '');
  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (!/^[6-9]\d{9}$/.test(digits)) return setErr('Enter a 10-digit mobile number.');
    setBusy(true); const r = await DojoAPI.staffLogin(digits); setBusy(false);
    if (!r.ok) return setErr(r.error!);
    setStep('code');
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (code.length !== 6) return setErr('Enter all 6 digits.');
    setBusy(true); const r = await DojoAPI.staffLogin(digits, code); setBusy(false);
    if (!r.ok) { setCode(''); return setErr(r.error!); }
    go(r.staff.role === 'coach' ? '/coach-app' : '/admin');
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={step === 'phone' ? sendCode : verify} style={{ width: '100%', maxWidth: 420 }}>
        <div className="mono" style={{ font: '500 12px/1 var(--mono)', letterSpacing: '.24em', color: '#F5F5F5', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ width: 28, height: 2, background: 'var(--red)' }} />STAFF
        </div>
        <h1 className="anton" style={{ margin: 0, fontSize: 'clamp(48px,9vw,72px)', lineHeight: .9, color: '#F5F5F5' }}>Staff<br />sign in<span className="red">.</span></h1>
        <p style={{ margin: '18px 0 28px', fontSize: 15, lineHeight: 1.6, color: '#9A9A9A' }}>
          {step === 'phone' ? 'Owners, coaches and front desk. Use the mobile number registered with the academy.' : `Enter the 6-digit code sent to +91 ${digits.slice(0, 5)} ${digits.slice(5)}.`}
        </p>
        {step === 'phone' ? (
          <label><span style={label}>MOBILE NUMBER</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="90000 00001" style={field} /></label>
        ) : (
          <label><span style={label}>ONE-TIME CODE</span>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" style={{ ...field, letterSpacing: '.5em' }} autoFocus /></label>
        )}
        {err && <div role="alert" style={{ marginTop: 12, font: '600 13px/1.4 var(--sans)', color: 'oklch(0.75 0.17 35)' }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, width: '100%', height: 56, background: 'var(--red)', border: 0, color: '#F5F5F5', font: '800 14px/1 var(--sans)', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)' }}>
          {busy ? 'One moment' : step === 'phone' ? 'Send code →' : 'Sign in →'}
        </button>
        {step === 'code' && <button type="button" onClick={() => { setStep('phone'); setCode(''); setErr(''); }} style={{ marginTop: 14, background: 'none', border: 0, color: '#9A9A9A', font: '600 13px/1 var(--sans)', cursor: 'pointer' }}>← Use a different number</button>}
        <p className="mono" style={{ marginTop: 28, font: '500 11px/1.7 var(--mono)', letterSpacing: '.08em', color: '#9A9A9A' }}>
          DEMO CODE: ANY 6 DIGITS<br />PLACEHOLDER STAFF · OWNER 90000 00001 · COACH 90000 00002 · FRONT DESK 90000 00003
        </p>
      </form>
    </main>
  );
}
