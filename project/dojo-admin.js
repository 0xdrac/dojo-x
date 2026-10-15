(function () {
  const A = {};
  let seed = 42; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280; const pick = a => a[Math.floor(r() * a.length)];
  const FN = ['Aarav', 'Diya', 'Neha', 'Rohan', 'Ishaan', 'Kabir', 'Ananya', 'Saanvi', 'Vihaan', 'Aditi', 'Arjun', 'Meher', 'Kunal', 'Riya', 'Siddharth', 'Tara', 'Yash', 'Pooja', 'Dev', 'Nikita', 'Harsh', 'Simran', 'Aryan', 'Kavya', 'Manav', 'Sneha', 'Varun', 'Ira', 'Rahul', 'Zoya', 'Parth', 'Avni'];
  const LN = ['Sharma', 'Gupta', 'Verma', 'Singh', 'Agarwal', 'Chauhan', 'Malhotra', 'Bansal', 'Mehta', 'Kapoor', 'Jain', 'Rawat', 'Tyagi', 'Saxena', 'Arora', 'Goel'];
  const DS = [['mma'], ['muaythai'], ['boxing'], ['kickboxing'], ['karate'], ['yoga'], ['gymnastics'], ['mma', 'muaythai'], ['boxing', 'yoga'], ['karate'], ['muaythai', 'boxing'], ['yoga']];
  const DUR = ['monthly', 'quarterly', 'half', 'annual'];
  A.members = FN.map((f, i) => {
    const disc = i === 0 ? ['mma', 'muaythai'] : i === 1 ? ['karate'] : i === 2 ? ['yoga'] : pick(DS);
    const dur = disc.length === 1 && disc[0] === 'yoga' ? 'monthly' : i === 0 ? 'half' : i === 1 ? 'quarterly' : pick(DUR);
    const days = i === 0 ? 28 : i === 1 ? 4 : i === 2 ? 25 : Math.floor(r() * 120) - 12;
    const status = i === 2 ? 'frozen' : days < 0 ? 'lapsed' : days <= 7 ? 'expiring' : 'active';
    const kid = disc[0] === 'karate' || disc[0] === 'gymnastics' ? r() < .6 : false;
    const ph = '9' + String(Math.floor(r() * 1e9)).padStart(9, '0');
    return { id: 'DX-' + (24 + (i % 3)) + '-' + String(187 + i * 13).padStart(4, '0'), name: f + ' ' + (i < 3 ? 'Sharma' : pick(LN)), first: f, phone: ph.slice(0, 5) + ' ' + ph.slice(5), disc, dur, days, status, kid, mode: r() < .55 ? 'auto' : 'manual', last: Math.floor(r() * 9), visits: Math.floor(r() * 18) + 2, since: pick(['Jan 2024', 'Jun 2024', 'Nov 2024', 'Mar 2025', 'Aug 2025', 'Feb 2026', 'Jul 2026']) };
  });
  A.revenue = [['May', 412000], ['Jun', 386000], ['Jul', 451000], ['Aug', 438000], ['Sep', 497000], ['Oct', 268400]];
  A.target = 520000;
  A.today = { collected: 38420, checkins: 64, trials: 5, newJoins: 2 };
  A.trials = [['Ritika Bansal', 'Muay Thai', 'Today 6:30 PM', 'Booked'], ['Sameer Khan', 'MMA', 'Today 7:00 PM', 'Booked'], ['Aanya (8 yrs)', 'Karate', 'Fri 4:30 PM', 'Booked'], ['Vikas Rana', 'Boxing', 'Yesterday', 'Attended · follow up'], ['Mehak Goel', 'Yoga', 'Mon', 'No-show']];
  A.coupons = [
    { code: 'DOJOX10', type: 'pct', v: 10, uses: 84, cap: 200, until: '31 Dec 2026', status: 'active', scope: 'All plans', rev: 412000 },
    { code: 'WELCOME500', type: 'flat', v: 500, uses: 37, cap: 0, until: '—', status: 'active', scope: 'First plan only', rev: 198000 },
    { code: 'FIGHTNIGHT15', type: 'pct', v: 15, uses: 12, cap: 50, until: '30 Nov 2026', status: 'active', scope: '6 & 12 month plans', rev: 241000 },
    { code: 'MONSOON20', type: 'pct', v: 20, uses: 50, cap: 50, until: '31 Aug 2026', status: 'used up', scope: 'Quarterly+', rev: 287000 },
    { code: 'DIWALI25', type: 'pct', v: 25, uses: 61, cap: 100, until: '5 Nov 2025', status: 'expired', scope: 'All plans', rev: 356000 }
  ];
  window.DXA = A;
})();
