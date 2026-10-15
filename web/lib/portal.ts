/* eslint-disable */
// @ts-nocheck
// Ported from project/dojo-portal.js
  const P: any = {};
  P.today = { d: 3, date: 15, label: 'Thu 15 Oct 2026' };
  P.members = {
    aarav: {
      id: 'aarav', name: 'Aarav Sharma', first: 'Aarav', init: 'AS', rel: 'You · Account owner', age: 29, phone: '+91 98450 21734', email: 'aarav.sharma@gmail.com', dob: '14 Mar 1997', gender: 'Male', memberId: 'DX-24-0187', since: 'Jan 2024',
      emergency: { name: 'Neha Sharma', rel: 'Spouse', phone: '+91 99107 33482' },
      plan: { disc: ['mma', 'muaythai'], dur: 'half', start: '12 May 2026', end: '12 Nov 2026', daysLeft: 28, totalDays: 184, mode: 'auto', via: 'UPI Autopay · aarav@okhdfc', status: 'active', next: '₹37,998 on 12 Nov' },
      streak: 12, best: 19, belt: null, bookings: 4, waiver: { signed: '8 Jan 2024', by: 'Aarav Sharma', type: 'Drawn' }
    },
    diya: {
      id: 'diya', name: 'Diya Sharma', first: 'Diya', init: 'DS', rel: 'Daughter · 9 yrs', age: 9, phone: '— (uses parent)', email: '—', dob: '2 Jul 2017', gender: 'Female', memberId: 'DX-24-0188', since: 'Jan 2024',
      emergency: { name: 'Aarav Sharma', rel: 'Father', phone: '+91 98450 21734' },
      plan: { disc: ['karate'], dur: 'quarterly', start: '19 Jul 2026', end: '19 Oct 2026', daysLeft: 4, totalDays: 92, mode: 'manual', via: 'Pay each cycle', status: 'expiring', next: '₹10,799 due by 19 Oct' },
      streak: 3, best: 8, bookings: 0,
      belt: { cur: 2, progress: 0.72, grading: 'Sun 14 Dec 2026', classes: [31, 36], req: [['Kihon: all Orange syllabus', true], ['Kata: Pinan Sono Ichi', true], ['Kumite: 3 rounds, controlled', false], ['Attendance: 36 classes since last grading', false]] },
      waiver: { signed: '8 Jan 2024', by: 'Aarav Sharma (guardian)', type: 'Typed' }
    },
    neha: {
      id: 'neha', name: 'Neha Sharma', first: 'Neha', init: 'NS', rel: 'Spouse', age: 31, phone: '+91 99107 33482', email: 'neha.s@outlook.com', dob: '22 Sep 1995', gender: 'Female', memberId: 'DX-25-0412', since: 'Mar 2025',
      emergency: { name: 'Aarav Sharma', rel: 'Spouse', phone: '+91 98450 21734' },
      plan: { disc: ['yoga'], dur: 'monthly', start: '2 Oct 2026', end: '9 Nov 2026', daysLeft: 25, totalDays: 31, mode: 'auto', via: 'UPI Autopay · neha@ybl', status: 'frozen', frozen: '12 – 18 Oct', next: 'Paused until 19 Oct' },
      streak: 0, best: 11, belt: null, bookings: 2, waiver: { signed: '3 Mar 2025', by: 'Neha Sharma', type: 'Drawn' }
    }
  };
  P.order = ['aarav', 'diya', 'neha'];
  P.current = () => { try { return P.members[localStorage.getItem('dx-member')] ? localStorage.getItem('dx-member') : 'aarav'; } catch (e) { return 'aarav'; } };
  P.set = id => { try { localStorage.setItem('dx-member', id); } catch (e) {} window.dispatchEvent(new CustomEvent('dx-member', { detail: id })); };
  P.on = cb => { const h = () => cb(P.current()); window.addEventListener('dx-member', h); window.addEventListener('storage', h); return () => { window.removeEventListener('dx-member', h); window.removeEventListener('storage', h); }; };

  // deterministic attendance: 16 weeks × 7 days, 0..2
  P.heat = id => {
    let s = { aarav: 7, diya: 3, neha: 11 }[id] || 1; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const rate = { aarav: .62, diya: .4, neha: .45 }[id];
    return Array.from({ length: 16 * 7 }, (_, i) => { if (id === 'neha' && i >= 103 && i <= 109) return -1; const v = r(); return v < rate ? (v < rate * .25 ? 2 : 1) : 0; });
  };
  P.stats = {
    aarav: { month: 14, hours: 17.5, last: 11, fav: 'Muay Thai', split: [['muaythai', 8], ['mma', 6]] },
    diya: { month: 9, hours: 6.8, last: 10, fav: 'Karate', split: [['karate', 9]] },
    neha: { month: 5, hours: 5.0, last: 12, fav: 'Yoga', split: [['yoga', 5]] }
  };
  P.payments = {
    aarav: [
      ['DX/2026-27/00412', '12 May 2026', '6-month · MMA + Muay Thai', 37998, 'Paid', 'UPI Autopay'],
      ['DX/2026-27/00118', '12 Apr 2026', 'Coupon refund · WELCOME500', -500, 'Refunded', 'UPI'],
      ['DX/2025-26/02290', '12 Jan 2026', 'Quarterly · MMA + Muay Thai', 22798, 'Paid', 'UPI Autopay'],
      ['DX/2025-26/02287', '12 Jan 2026', 'Quarterly · MMA + Muay Thai', 22798, 'Failed', 'UPI Autopay'],
      ['DX/2025-26/01564', '12 Oct 2025', 'Quarterly · MMA + Muay Thai', 22798, 'Paid', 'Card ••4821']
    ],
    diya: [['DX/2026-27/00733', '19 Jul 2026', 'Quarterly · Kids Karate', 11399, 'Paid', 'UPI'], ['DX/2026-27/00001', '19 Apr 2026', 'Quarterly · Kids Karate', 11399, 'Paid', 'Netbanking']],
    neha: [['DX/2026-27/01102', '2 Oct 2026', 'Monthly · Yoga', 2469, 'Pending', 'UPI Autopay'], ['DX/2026-27/00954', '2 Sep 2026', 'Monthly · Yoga', 2469, 'Paid', 'UPI Autopay']]
  };
  P.announcements = [
    ['EVENT', 'Fight Night 10 · Sat 22 Nov', 'Members get early-bird tickets at ₹499 until 31 Oct.', 'NEW'],
    ['GRADING', 'Karate grading · Sun 14 Dec', 'Register by 30 Nov at the front desk or in Progress.', ''],
    ['TIMINGS', 'Diwali hours · 8–9 Nov closed', 'Regular schedule resumes Mon 10 Nov, 6 AM.', '']
  ];
  export default P;
