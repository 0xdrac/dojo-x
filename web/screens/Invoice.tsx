// @ts-nocheck
/* eslint-disable */
'use client';
// Ported from project/Invoice.dc.html. HAND-EDITED: loads the real order when opened as /invoice?o=<id> (scripts/convert.py skips this file).
import React from 'react';
import '@/lib/bootstrap';
import { DCLogic } from '@/lib/dc';
import { css, pc } from '@/lib/css';
import Slot from '@/components/Slot';
import SiteFooter from './SiteFooter';

class Screen extends DCLogic {
  static defaultProps = {};
  state = { ok: false };
  componentDidMount() {
    const o = new URLSearchParams(location.search).get('o');
    if (!o) return this.setState({ ok: true });
    DojoAPI.getOrder(o).then(r => r.ok ? this.setState({ ok: true, ord: r }) : DojoMotion.go('/login'));
  }
  words(n) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'], b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = x => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
    const three = x => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + two(x % 100);
    let out = []; const l = Math.floor(n / 100000), t = Math.floor(n / 1000) % 100, r = n % 1000;
    if (l) out.push(two(l) + ' Lakh'); if (t) out.push(two(t) + ' Thousand'); if (r) out.push(three(r));
    return 'Rupees ' + out.join(' ') + ' only';
  }
  renderVals() {
    const D = window.DOJO, u = new URLSearchParams(location.search);
    const base = { print: () => window.print() };
    if (!D) return base;
    const ord = this.state.ord, O = ord && ord.order;
    const sel = O ? O.disciplines : (u.get('d') || 'mma,muaythai').split(','), dur = O ? O.duration : u.get('dur') || 'half', people = O ? O.people : +(u.get('p') || 1);
    const cc = O ? (O.coupon_code ? { status: 'ok', code: O.coupon_code, type: 'flat', v: O.discount_coupon, label: '₹' + O.discount_coupon + ' off' } : null) : (u.get('c') ? D.checkCoupon(u.get('c')) : null), coupon = cc && cc.status === 'ok' ? cc : null;
    const q = D.quote(sel, dur, people, coupon), f = D.fmt;
    const rows = [];
    q.fight.forEach(k => rows.push({ d: `${D.disciplines[k].full} · ${q.pl.l} membership`, q: people, r: f(q.pl.p), a: f(q.pl.p * people), c: '#1A1A1A' }));
    if (q.yoga) rows.push({ d: 'Yoga · Monthly membership', q: people, r: f(q.yogaM), a: f(q.yogaM * people), c: '#1A1A1A' });
    rows.push({ d: `Member discount (${Math.round(q.pd * 100)}%)`, q: '', r: '', a: '−' + f(q.peopleOff), c: '#1F7A3A' });
    if (coupon) rows.push({ d: `Coupon ${coupon.code} (${coupon.label})`, q: '', r: '', a: '−' + f(q.couponOff), c: '#1F7A3A' });
    if (O && O.amount !== q.total) { const d = O.amount - q.total; rows.push({ d: 'Adjustment', q: '', r: '', a: (d < 0 ? '−' : '+') + f(Math.abs(d)), c: '#1A1A1A' }); }
    const start = O ? new Date(O.paid_at || O.created_at) : new Date('2026-10-15'), end = new Date(start.getTime() + (q.fight.length ? q.pl.m : 1) * 30.4 * 864e5), fd = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const g = u.get('g');
    return Object.assign(base, {
      txnRef: O ? (O.razorpay_payment_id ? 'Razorpay ref ' + O.razorpay_payment_id : 'Front desk receipt') : 'Txn ref 88412011', inv: O ? (O.invoice_no || '—') : 'DX/2026-27/0' + (1240 + sel.length), date: O ? fd(start) : '15 Oct 2026', name: O ? ord.members.map(x => x.name).join(' + ') : u.get('n') || 'Aarav Sharma', phone: O ? (ord.phone ? ord.phone.slice(0, 5) + ' ' + ord.phone.slice(5) : '') : u.get('ph') || '98450 21734', method: O ? (O.source === 'desk' ? 'Front desk · ' + (O.method || 'cash') : 'Razorpay · ' + (O.method || 'online')) : u.get('m') || 'UPI · aarav@okhdfc',
      period: `${fd(start)} – ${fd(end)}`, rows,
      tot: [{ k: 'Subtotal', v: f(q.gross) }, { k: 'Discounts', v: '−' + f(q.peopleOff + q.couponOff) }],
      total: f(O ? O.amount : q.total), words: this.words(O ? O.amount : q.total)
    });
  }
}

Screen.prototype.renderTemplate = function (v) {
  return (<><div style={css("min-height:100vh;padding:clamp(12px,3vw,40px) clamp(8px,3vw,24px)")}><div data-noprint={""} style={css("max-width:794px;margin:0 auto 16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center")}><a href={"/member-portal#pay"} style={css("display:flex;align-items:center;height:44px;padding:0 14px;border:1px solid #444444;color:#F5F5F5;font:700 13px/1 Manrope,sans-serif")}>← Back</a><button onClick={v.print} style={css("height:44px;padding:0 18px;background:#C8102E;border:0;color:#F5F5F5;font:800 12px/1 Manrope,sans-serif;letter-spacing:.1em;cursor:pointer")}>DOWNLOAD PDF</button></div><div data-sheet={""} style={css("max-width:794px;margin:0 auto;background:#FFFFFF;color:#1A1A1A;padding:clamp(20px,5vw,56px);box-shadow:0 20px 60px rgba(0,0,0,.4)")}><div style={css("display:flex;flex-wrap:wrap;justify-content:space-between;gap:20px;padding-bottom:24px;border-bottom:3px solid #0D0D0D")}><div><div style={css("font-family:Anton,Impact,sans-serif;font-size:44px;line-height:1;color:#0D0D0D")}>DOJO<span style={css("color:#C8102E")}>X</span></div><div style={css("margin-top:10px;font-size:12px;line-height:1.6;color:#444444")}>Dojo X Martial Arts Academy<br />Sai Complex, Plot No. 510, Maharaja Agarsain Marg<br />Sector 12, Vasundhara, Ghaziabad, UP 201012</div></div><div style={css("text-align:right")}><div style={css("font-family:Anton,Impact,sans-serif;font-size:32px;line-height:1;text-transform:uppercase;color:#0D0D0D")}>Receipt</div><div style={css("margin-top:10px;font:500 12px/1.8 'JetBrains Mono',monospace;color:#444444")}>{v.inv}<br />{v.date}</div><div style={css("display:inline-block;margin-top:8px;padding:5px 8px;border:1.5px solid #1F7A3A;font:700 11px/1 'JetBrains Mono',monospace;letter-spacing:.12em;color:#1F7A3A")}>PAID</div></div></div><div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px;padding:24px 0")}><div><div style={css("font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.16em;color:#777777;margin-bottom:8px")}>BILLED TO</div><div style={css("font:800 15px/1.4 Manrope,sans-serif")}>{v.name}</div><div style={css("font-size:12px;line-height:1.6;color:#444444")}>+91 {v.phone}</div></div><div><div style={css("font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.16em;color:#777777;margin-bottom:8px")}>PAYMENT</div><div style={css("font-size:12px;line-height:1.6;color:#444444")}>{v.method}<br />{v.txnRef} · {v.date}<br />Membership period: {v.period}</div></div></div><div style={css("overflow-x:auto")}><table style={css("width:100%;min-width:520px;border-collapse:collapse;font-size:13px")}><thead><tr style={css("background:#0D0D0D;color:#F5F5F5")}><th style={css("padding:10px;text-align:left;font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.12em")}>DESCRIPTION</th><th style={css("padding:10px;text-align:right;font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.12em")}>QTY</th><th style={css("padding:10px;text-align:right;font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.12em")}>RATE</th><th style={css("padding:10px;text-align:right;font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.12em")}>AMOUNT</th></tr></thead><tbody>{(v.rows || []).map((r, $index) => (<React.Fragment key={$index}><tr style={css("border-bottom:1px solid #E5E5E5")}><td style={css(`padding:12px 10px;color:${r?.c ?? ""}`)}>{r?.d}</td><td style={css("padding:12px 10px;text-align:right;font-family:'JetBrains Mono',monospace")}>{r?.q}</td><td style={css("padding:12px 10px;text-align:right;font-family:'JetBrains Mono',monospace")}>{r?.r}</td><td style={css(`padding:12px 10px;text-align:right;font-family:'JetBrains Mono',monospace;color:${r?.c ?? ""}`)}>{r?.a}</td></tr></React.Fragment>))}</tbody></table></div><div style={css("display:flex;justify-content:flex-end;margin-top:16px")}><div style={css("width:100%;max-width:320px;display:flex;flex-direction:column;gap:8px;font-size:13px")}>{(v.tot || []).map((t, $index) => (<React.Fragment key={$index}><div style={css("display:flex;justify-content:space-between;gap:12px;color:#444444")}><span>{t?.k}</span><span style={css("font-family:'JetBrains Mono',monospace;color:#1A1A1A")}>{t?.v}</span></div></React.Fragment>))}<div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-top:10px;border-top:2px solid #0D0D0D")}><span style={css("font:800 14px Manrope,sans-serif")}>Total paid</span><span style={css("font-family:Anton,Impact,sans-serif;font-size:30px;color:#0D0D0D")}>{v.total}</span></div><div style={css("font-size:11px;line-height:1.5;color:#777777;text-align:right")}>{v.words}</div></div></div><div style={css("margin-top:36px;padding-top:16px;border-top:1px solid #E5E5E5;display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;font-size:11px;line-height:1.6;color:#777777")}><span>Computer-generated receipt, no signature required.<br />Questions? hello@dojox.in · +91 98450 21734</span><span style={css("font:700 10px/1.6 'JetBrains Mono',monospace;letter-spacing:.12em;color:#C8102E")}>TRAIN HARD · STAY HUMBLE</span></div></div></div></>);
};

export default Screen;
