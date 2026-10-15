(function () {
  const D = {};
  D.hue = { mma: 15, boxing: 75, kickboxing: 50, muaythai: 300, karate: 100, gymnastics: 235, yoga: 165 };
  D.color = k => `oklch(0.74 0.12 ${D.hue[k]})`;
  D.fmt = v => '₹' + Math.round(v).toLocaleString('en-IN');
  D.order = ['mma', 'boxing', 'kickboxing', 'muaythai', 'karate', 'gymnastics', 'yoga'];

  D.disciplines = {
    mma: {
      name: 'MMA', full: 'Mixed Martial Arts', price: 4999, sessions: '5×/week', intensity: 5, contact: 'Full', ages: 'Teens · Adults',
      h1: ['The complete', 'fight game.'], ghost: 'MMA',
      one: 'Strike, wrestle, submit. The complete fight game.',
      intro: 'Striking, wrestling and Brazilian jiu-jitsu, stitched into one system. Learn to stay standing, take it down, or finish it on the mat, coached by people who have done it under the lights.',
      learn: [['Striking', 'Boxing and Muay Thai basics adapted for 4oz gloves and the cage.'], ['Wrestling', 'Takedowns, sprawls and cage work. Control where the fight happens.'], ['Ground game', 'BJJ positions, escapes and submissions, gi-free.'], ['Fight IQ', 'Transitions, ring craft, and game plans you can actually run.']],
      levels: [['Beginner', 'No experience needed. Fundamentals of stance, movement, basic takedowns and positions.', 'Just show up'], ['Intermediate', 'Live drilling, positional sparring and chain wrestling.', '6+ months · coach approval'], ['Advanced', 'Hard sparring, fight camps and amateur competition prep.', 'Fight team invite']],
      agegroups: [['Teens', '13–17', 'Technique-first, no head contact sparring'], ['Adults', '18+', 'All levels, morning and evening batches']],
      coaches: ['arjun', 'vikram'],
      faqs: [['Do I need to be fit to start?', 'No. Fundamentals classes scale to you. Most members start out of shape; fitness is a side effect.'], ['Will I have to spar?', 'Never in your first months. Sparring is opt-in and starts light, with headgear and coach supervision.'], ['What gear do I need?', 'Shorts, a rash guard or T-shirt, and a mouthguard. Gloves and shin guards can be borrowed for your trial.']]
    },
    boxing: {
      name: 'Boxing', full: 'Boxing', price: 4999, sessions: '6×/week', intensity: 4, contact: 'Upper body', ages: 'Teens · Adults',
      h1: ['Hands that', 'hit hard.'], ghost: 'BOX',
      one: 'Footwork, head movement, and hands that hit hard.',
      intro: 'Old-school fundamentals with modern conditioning. Jab, move, slip and counter, building rounds of pad work into real ring confidence.',
      learn: [['Footwork', 'Angles, distance and balance. Where you stand decides everything.'], ['Combinations', 'Punch in sequences that flow, from the 1-2 to body-head setups.'], ['Defense', 'Slips, rolls, parries and the high guard. Get hit less.'], ['Conditioning', 'Rounds-based work that builds the gas tank for three-minute rounds.']],
      levels: [['Beginner', 'Stance, guard, the six basic punches and bag work.', 'Just show up'], ['Intermediate', 'Partner drills, defensive reads and controlled sparring.', '4+ months'], ['Advanced', 'Hard sparring and amateur bout preparation.', 'Coach invite']],
      agegroups: [['Teens', '13–17', 'Technique and fitness, light contact only'], ['Adults', '18+', 'Conditioning and skills batches daily']],
      coaches: ['rahul'],
      faqs: [['Is boxing good for weight loss?', 'Few workouts burn more. Expect 600–800 kcal per class, and you learn a skill while doing it.'], ['Do you provide gloves?', 'Trial gloves are provided. Members usually buy 12–16oz gloves and hand wraps, which the front desk can order.'], ['Can women join?', 'Yes. About 40% of our boxing members are women. Women-only batches run Tue and Thu at 11 AM.']]
    },
    kickboxing: {
      name: 'Kickboxing', full: 'Kickboxing', price: 4999, sessions: '4×/week', intensity: 4, contact: 'Full (light)', ages: 'Teens · Adults',
      h1: ['Punch. Kick.', 'Repeat.'], ghost: 'KICK',
      one: 'Punches and kicks in high-tempo rounds.',
      intro: 'Boxing hands with powerful kicks, delivered in fast rounds that leave you soaked and smiling. The best way in for most beginners.',
      learn: [['Kicks', 'Roundhouse, teep, switch kick. Hip turn and balance.'], ['Hands', 'Boxing combinations that set up the kick.'], ['Rhythm', 'Flowing combos on pads with a partner.'], ['Engine', 'Interval rounds for cardio and leg strength.']],
      levels: [['Beginner', 'Stance, basic strikes, pad partner etiquette.', 'Just show up'], ['Intermediate', 'Longer combos, checks and counters, light sparring.', '4+ months'], ['Advanced', 'Technical sparring and inter-club bouts.', 'Coach invite']],
      agegroups: [['Teens', '13–17', 'Mon, Wed, Fri evenings'], ['Adults', '18+', 'Evening and weekend batches']],
      coaches: ['kavya', 'arjun'],
      faqs: [['Kickboxing or Muay Thai?', 'Kickboxing is punches and kicks above the waist-line rules; Muay Thai adds elbows, knees and the clinch. Start either way, as they share 70% of the basics.'], ['Is it safe for knees?', 'Coaches teach pivoting from day one. Tell us about old injuries and we will modify drills.'], ['What should I wear?', 'Shorts and a T-shirt. Training is barefoot on mats.']]
    },
    muaythai: {
      name: 'Muay Thai', full: 'Muay Thai', price: 4999, sessions: '6×/week', intensity: 5, contact: 'Full', ages: 'Teens · Adults',
      h1: ['The art of', 'eight limbs.'], ghost: 'THAI',
      one: 'The art of eight limbs. Elbows, knees, clinch.',
      intro: "Thailand's national sport, taught the traditional way: punches, kicks, elbows, knees and the clinch, built on rhythm, balance and respect.",
      learn: [['Eight weapons', 'Fists, elbows, knees and shins, each with its own range.'], ['The clinch', 'Neck control, off-balancing and knees in close.'], ['Teeps & checks', 'Manage distance and defend low kicks.'], ['Wai Kru', 'Tradition and ring etiquette, for those who want it.']],
      levels: [['Beginner', 'Stance, teep, roundhouse, basic clinch entries.', 'Just show up'], ['Intermediate', 'Clinch lab, elbows, technical sparring.', '6+ months'], ['Advanced', 'Fight team and inter-club fight cards.', 'Kru invite']],
      agegroups: [['Teens', '13–17', 'No elbows in sparring until 16'], ['Adults', '18+', 'Daily evening batches']],
      coaches: ['kavya'],
      faqs: [['Do I need shin guards?', 'Only for partner drills and sparring. We lend them for trials.'], ['Is the clinch only for advanced members?', 'Basic clinch entries are taught from week one; live clinch work starts at intermediate level.'], ['Can I train for a fight?', 'Yes. The fight team runs 8-week camps before each card, by invite.']]
    },
    karate: {
      name: 'Karate', full: 'Kyokushin Karate', price: 4999, sessions: '4×/week', intensity: 3, contact: 'Controlled', ages: 'Kids · Teens · Adults',
      h1: ['Earn your', 'belt.'], ghost: 'KARATE', belts: true,
      one: 'Kyokushin-based. Discipline earned belt by belt.',
      intro: 'A full-contact karate tradition built on kihon, kata and kumite. Kids learn focus and confidence; adults find discipline. Every belt is earned at a formal grading.',
      learn: [['Kihon', 'The basics: stances, blocks, punches and kicks, done thousands of times.'], ['Kata', 'Forms that build memory, balance and power.'], ['Kumite', 'Controlled sparring with respect and courage.'], ['Dojo kun', 'Courtesy, perseverance and self-control.']],
      levels: [['Beginner', 'White to orange belt. Etiquette, stances and the first kata.', 'Just show up'], ['Intermediate', 'Green to purple. Combinations, kata Pinan series, light kumite.', 'Orange belt'], ['Advanced', 'Brown and black belt candidates. Full kumite, teaching juniors.', 'Purple belt']],
      agegroups: [['Kids', '5–12', 'Little Warriors · Mon/Wed/Fri 4:30 PM'], ['Teens', '13–17', 'Mon/Wed/Fri 6:30 PM'], ['Adults', '18+', 'Mon/Wed/Fri 6:30 PM']],
      coaches: ['meera'],
      faqs: [['How often are gradings?', 'Every quarter: March, June, September and December. The next one is on 14 Dec 2026.'], ['What is the minimum age?', '5 years. Little Warriors classes are 45 minutes with a 1:8 coach ratio.'], ['Is the grading fee included?', 'Grading fees (₹1,200–₹2,500 by belt) are separate and include the certificate and new belt.']]
    },
    gymnastics: {
      name: 'Gymnastics', full: 'Gymnastics', price: 4999, sessions: '4×/week', intensity: 3, contact: 'None', ages: 'Kids · Adults', calm: true,
      h1: ['Body control,', 'mastered.'], ghost: 'FLOW',
      one: 'Strength, flexibility and body control for all ages.',
      intro: 'Floor, rings and bars, taught progressively and safely. Kids build coordination for every other sport; adults unlock handstands, mobility and real strength.',
      learn: [['Foundations', 'Rolls, bridges, cartwheels, and how to fall safely.'], ['Strength', 'Holds and progressions on rings and parallettes.'], ['Mobility', 'Splits, pancakes and shoulder flexibility.'], ['Skills', 'Handstands, kip-ups and beginner tumbling.']],
      levels: [['Beginner', 'Body awareness, basic shapes and safe landings.', 'Just show up'], ['Intermediate', 'Handstand holds, rings, linked floor skills.', '6+ months'], ['Advanced', 'Tumbling passes and competition routines.', 'Coach invite']],
      agegroups: [['Kids', '5–12', 'Tue/Thu/Sat 4:30 PM'], ['Adults', '18+', 'Mobility & gymnastics, Tue/Fri 8:30 AM']],
      coaches: ['tanvi'],
      faqs: [['Is it safe for small children?', 'Yes. Kids train on sprung floors with crash mats and a 1:8 coach ratio.'], ['Can adults really start gymnastics?', 'Absolutely. Our adult class focuses on mobility and strength progressions, not competition.'], ['What should kids wear?', 'Fitted T-shirt and shorts or leggings. Bare feet, hair tied back.']]
    },
    yoga: {
      name: 'Yoga', full: 'Yoga', price: 2599, sessions: '7×/week', intensity: 2, contact: 'None', ages: 'Teens · Adults', calm: true,
      h1: ['Breathe.', 'Reset.'], ghost: 'BREATHE',
      one: 'Mobility, breath and recovery. Your reset button.',
      intro: 'Hatha and vinyasa in a quiet studio away from the fight floor. Fighters use it to recover; everyone else, to slow down. Morning and late-evening batches.',
      learn: [['Asana', 'Postures that open hips, hamstrings and shoulders.'], ['Pranayama', 'Breathwork for calm, focus and better recovery.'], ['Mobility', 'Joint health that keeps you training for decades.'], ['Stillness', 'Guided relaxation and short meditation.']],
      levels: [['Beginner', 'Slow flow with props, every pose explained.', 'Just show up'], ['Intermediate', 'Longer holds, sun salutation flows, inversions prep.', '3+ months'], ['Advanced', 'Arm balances, inversions, extended pranayama.', 'Teacher guidance']],
      agegroups: [['Teens', '13–17', 'Weekend slow flow'], ['Adults', '18+', 'Daily sunrise and 8 PM batches']],
      coaches: ['ananya'],
      faqs: [['Do I need my own mat?', 'Studio mats, blocks and straps are provided and sanitised after every class.'], ['Is yoga included with fight memberships?', 'Add it to any combo at the combo discount. Most fighters do.'], ['I am not flexible. Can I join?', 'That is exactly why to join. Beginner classes use props for every pose.']]
    }
  };

  D.coaches = {
    arjun: { first: 'Arjun', nick: 'The Hammer', last: 'Rathore', role: 'Founder · Head Coach', disc: ['mma', 'kickboxing'], rec: [14, 3, 0], weight: '77 KG · WELTER', stance: 'Orthodox', rank: 'BJJ Brown Belt', years: '16 yrs', bars: [['Striking', 88], ['Grappling', 94], ['Cardio', 91]], bio: 'Arjun fought professionally across India and Southeast Asia from 2009 to 2019, retiring 14–3. He opened Dojo X in a 600 sq ft basement in 2013 and has since cornered over 40 pro debuts.', creds: ['BJJ Brown Belt, under Prof. Leandro Silva', 'Former MFN Welterweight contender', 'IMMAF Level 2 Coach', 'First Aid & CPR certified'] },
    kavya: { first: 'Kavya', nick: 'Viper', last: 'Menon', role: 'Lead · Muay Thai', disc: ['muaythai', 'kickboxing'], rec: [22, 4, 1], weight: '52 KG · FLY', stance: 'Southpaw', rank: 'Kru · Level 3', years: '11 yrs', bars: [['Striking', 95], ['Clinch', 90], ['Cardio', 93]], bio: 'Two-time national Muay Thai champion who spent four years training in Chiang Mai. Known for a brutal teep and the most demanding pad rounds in the building.', creds: ['2× National Muay Thai Champion (51 kg)', 'Kru Level 3, World Muaythai Council', 'Trained 4 years in Chiang Mai, Thailand', 'Women’s self-defence instructor'] },
    rahul: { first: 'Rahul', nick: 'Iron', last: 'Sandhu', role: 'Lead · Boxing', disc: ['boxing'], rec: [31, 6, 0], weight: '81 KG · LT HEAVY', stance: 'Orthodox', rank: 'NIS Certified', years: '12 yrs', bars: [['Power', 93], ['Footwork', 86], ['Defense', 90]], bio: 'A decorated amateur from Bhiwani, Rahul boxed for the state team for six years before coaching. He builds boxers from the feet up.', creds: ['NIS Diploma in Boxing Coaching', 'State gold medallist, Haryana (3×)', 'AIBA 1-Star Coach', 'Strength & conditioning, NSCA-CPT'] },
    meera: { first: 'Meera', nick: 'Sensei', last: 'Desai', role: 'Chief Instructor · Karate', disc: ['karate'], rec: null, weight: '—', stance: 'Orthodox', rank: '4th Dan Black Belt', years: '20 yrs', bars: [['Kata', 96], ['Kumite', 88], ['Teaching', 98]], bio: 'Sensei Meera has trained Kyokushin since age 9 and has graded more than 500 students. Her Little Warriors programme is the reason half our members started.', creds: ['4th Dan, Kyokushin Karate', 'National kumite silver medallist', 'Child safeguarding certified', 'Grading examiner, North India region'] },
    tanvi: { first: 'Tanvi', nick: 'Flip', last: 'Joshi', role: 'Lead · Gymnastics', disc: ['gymnastics'], rec: null, weight: '—', stance: '—', rank: 'FIG Level 1 Coach', years: '9 yrs', bars: [['Strength', 90], ['Mobility', 97], ['Teaching', 94]], bio: 'Former national-level artistic gymnast who now coaches kids and adults. Patient, precise and big on safe progressions.', creds: ['Former national artistic gymnast', 'FIG Level 1 Coaching certificate', 'Kids movement specialist', 'First Aid & CPR certified'] },
    ananya: { first: 'Ananya', nick: 'Calm', last: 'Iyer', role: 'Lead · Yoga', disc: ['yoga'], rec: null, weight: '—', stance: '—', rank: 'E-RYT 500', years: '10 yrs', bars: [['Mobility', 98], ['Breathwork', 95], ['Teaching', 96]], bio: 'Trained in Rishikesh and Mysuru, Ananya teaches slow, precise classes that fighters swear by for recovery.', creds: ['E-RYT 500, Yoga Alliance', 'Trained in Rishikesh & Mysuru', 'Yoga for athletes specialist', 'Prenatal yoga certified'] },
    vikram: { first: 'Vikram', nick: 'Anaconda', last: 'Chauhan', role: 'Coach · MMA Grappling', disc: ['mma'], rec: [9, 2, 0], weight: '84 KG · MIDDLE', stance: 'Southpaw', rank: 'BJJ Purple Belt', years: '7 yrs', bars: [['Wrestling', 92], ['Grappling', 90], ['Cardio', 89]], bio: 'A former national freestyle wrestler turned MMA fighter. Vikram runs the wrestling and ground-game blocks of the MMA programme.', creds: ['National freestyle wrestling bronze', 'BJJ Purple Belt', 'IMMAF Level 1 Coach', 'S&C Level 2'] }
  };
  D.coachOrder = ['arjun', 'kavya', 'rahul', 'meera', 'vikram', 'tanvi', 'ananya'];

  D.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  D.daysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const C = [];
  const add = (d, t, dur, disc, title, coach, level, age, cap, booked) => C.push({ id: C.length + 1, d, t, dur, disc, title, coach, level, age, cap, booked });
  const b = (arr, d) => arr[d % arr.length];
  for (let d = 0; d < 6; d++) {
    add(d, '06:00', 60, 'yoga', 'Sunrise Flow', 'ananya', 'All levels', 'Adults', 20, b([14, 9, 18, 11, 16, 7], d));
    add(d, '07:15', 60, d % 2 ? 'boxing' : 'mma', d % 2 ? 'Boxing Conditioning' : 'MMA Fundamentals', d % 2 ? 'rahul' : 'arjun', 'Beginner', 'Adults', 24, b([20, 22, 17, 24, 15, 12], d));
    if (d === 1 || d === 4) add(d, '08:30', 60, 'gymnastics', 'Adult Mobility & Gymnastics', 'tanvi', 'All levels', 'Adults', 14, b([9, 13], d));
    if (d % 2 === 0) add(d, '16:30', 45, 'karate', 'Little Warriors Karate', 'meera', 'Beginner', 'Kids', 16, b([15, 12, 16], d / 2));
    else add(d, '16:30', 60, 'gymnastics', 'Kids Gymnastics', 'tanvi', 'Beginner', 'Kids', 16, b([14, 10, 16], (d - 1) / 2));
    add(d, '17:30', 60, d % 2 ? 'boxing' : 'kickboxing', d % 2 ? 'Teen Boxing' : 'Teen Kickboxing', d % 2 ? 'rahul' : 'kavya', 'Beginner', 'Teens', 20, b([12, 17, 19, 8, 14, 20], d));
    add(d, '18:30', 75, 'muaythai', d < 3 ? 'Muay Thai Fundamentals' : 'Muay Thai Clinch Lab', 'kavya', d < 3 ? 'Beginner' : 'Intermediate', 'Adults', 20, b([16, 18, 11, 19, 20, 14], d));
    if (d % 2 === 0) add(d, '18:30', 60, 'karate', 'Karate · Teens & Adults', 'meera', 'Intermediate', 'Teens', 18, b([10, 13, 9], d / 2));
    add(d, '19:45', 75, b(['mma', 'kickboxing', 'mma', 'boxing', 'mma', 'kickboxing'], d), b(['MMA Fundamentals', 'Kickboxing Rounds', 'MMA Wrestling Block', 'Boxing Technical', 'MMA Striking', 'Kickboxing Rounds'], d), b(['arjun', 'kavya', 'vikram', 'rahul', 'arjun', 'kavya'], d), b(['Beginner', 'All levels', 'Intermediate', 'Intermediate', 'Beginner', 'All levels'], d), 'Adults', 24, b([22, 24, 15, 18, 23, 16], d));
    if (d === 0 || d === 2 || d === 4) add(d, '21:00', 75, 'mma', 'Fight Team', 'arjun', 'Advanced', 'Adults', 14, b([12, 14, 9], d / 2));
    add(d, '21:00', 60, 'yoga', 'Night Recovery Yoga', 'ananya', 'All levels', 'Adults', 18, b([6, 11, 8, 12, 5, 9], d));
  }
  add(6, '08:00', 90, 'mma', 'Open Mat', 'vikram', 'All levels', 'Adults', 30, 18);
  add(6, '09:00', 75, 'yoga', 'Sunday Slow Flow', 'ananya', 'All levels', 'Adults', 22, 21);
  add(6, '10:30', 60, 'karate', 'Grading Prep', 'meera', 'All levels', 'Kids', 20, 17);
  D.classes = C;
  D.time12 = t => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };

  D.belts = [['White', '#EDEDED', 0, '#0D0D0D'], ['Yellow', '#E5C34A', 3, '#0D0D0D'], ['Orange', '#E07B2E', 6, '#0D0D0D'], ['Green', '#3E9B5A', 10, '#F5F5F5'], ['Blue', '#2F6FC0', 14, '#F5F5F5'], ['Purple', '#7B4FB5', 20, '#F5F5F5'], ['Brown', '#7A4A2A', 28, '#F5F5F5'], ['Black', '#0D0D0D', 42, '#F5F5F5']];

  // Pricing model: flat per-discipline plans; Yoga is monthly only.
  D.plans = {
    monthly: { m: 1, p: 4999, l: 'Monthly', short: '1 MO' },
    quarterly: { m: 3, p: 11999, l: 'Quarterly', short: '3 MO' },
    half: { m: 6, p: 19999, l: '6 months', short: '6 MO' },
    annual: { m: 12, p: 29999, l: 'Annual', short: '12 MO' }
  };
  D.planOrder = ['monthly', 'quarterly', 'half', 'annual'];
  D.yogaPrice = 2599;
  D.planSave = k => Math.round((1 - D.plans[k].p / (D.plans.monthly.p * D.plans[k].m)) * 100);
  D.fromPrice = k => k === 'yoga' ? D.yogaPrice : Math.round(D.plans.annual.p / 12);
  D.peopleOff = n => n >= 2 ? 0.10 : 0.05;
  D.coupons = {
    DOJOX10: { type: 'pct', v: 10, label: '10% off' },
    WELCOME500: { type: 'flat', v: 500, label: '₹500 off' },
    FIGHTNIGHT15: { type: 'pct', v: 15, label: '15% off' },
    DIWALI25: { expired: '5 Nov 2025' }
  };
  D.checkCoupon = code => {
    const c = D.coupons[(code || '').trim().toUpperCase()];
    if (!code || !code.trim()) return { status: 'empty' };
    if (!c) return { status: 'invalid' };
    if (c.expired) return { status: 'expired', on: c.expired };
    return { status: 'ok', code: code.trim().toUpperCase(), ...c };
  };
  // quote: per-person plan × people, minus people discount, minus coupon
  D.quote = (sel, dur, people, coupon) => {
    people = people || 1;
    const fight = sel.filter(k => k !== 'yoga'), yoga = sel.includes('yoga');
    const pk = fight.length ? dur : 'monthly', pl = D.plans[pk];
    const fightCycle = fight.length * pl.p, yogaM = yoga ? D.yogaPrice : 0;
    const perPerson = fightCycle + yogaM;
    const gross = perPerson * people, pd = D.peopleOff(people), peopleOff = Math.round(gross * pd);
    const afterPeople = gross - peopleOff;
    const couponOff = coupon && coupon.status === 'ok' ? (coupon.type === 'pct' ? Math.round(afterPeople * coupon.v / 100) : Math.min(coupon.v, afterPeople)) : 0;
    const sub = afterPeople - couponOff, gst = 0;
    const listMonthly = fight.length * D.plans.monthly.p + yogaM;
    const effMonthly = Math.round((fightCycle / pl.m + yogaM) * (1 - pd));
    return { fight, yoga, pk, pl, fightCycle, yogaM, perPerson, people, gross, pd, peopleOff, couponOff, sub, gst, total: sub + gst, cgst: Math.round(gst / 2), listMonthly, effMonthly, yearSave: Math.max(0, (listMonthly - effMonthly) * 12) };
  };

  window.DOJO = D;
})();
