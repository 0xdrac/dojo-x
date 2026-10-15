import re, sys, json, html as H
from html.parser import HTMLParser

SRC = '/home/claude/repo/project/'
OUT = '/home/claude/repo/web/screens/'

ROUTES = {'Home':'/','Programs':'/programs','Schedule':'/schedule','Coaches':'/coaches','Pricing':'/pricing','Gallery':'/gallery',
 'About':'/about','Contact':'/contact','FAQs':'/faqs','Blog':'/blog','Article':'/article','Discipline':'/discipline','Login':'/login',
 'Free Trial':'/free-trial','Member Portal':'/member-portal','Checkout':'/checkout','Invoice':'/invoice','Admin':'/admin','Coach App':'/coach-app'}
def maproutes(s):
    return re.sub(r'([A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)?)\.dc\.html', lambda m: ROUTES.get(m.group(1), m.group(0)), s)

ATTR = {'class':'className','for':'htmlFor','tabindex':'tabIndex','colspan':'colSpan','maxlength':'maxLength','inputmode':'inputMode',
 'autocomplete':'autoComplete','autocapitalize':'autoCapitalize','spellcheck':'spellCheck','novalidate':'noValidate','autofocus':'autoFocus',
 'stroke-width':'strokeWidth','stroke-linejoin':'strokeLinejoin','stroke-linecap':'strokeLinecap','fill-rule':'fillRule','clip-rule':'clipRule',
 'viewbox':'viewBox','readonly':'readOnly','rows':'rows'}
VOID = {'br','input','img','hr','meta','link','path','circle','rect','line','polyline','polygon','source'}
BOOL = {'disabled','checked','readonly','required','multiple','selected','hidden','autofocus','novalidate'}

def esc_text(t):
    return t.replace('{','{"{"}').replace('}','{"}"}')

class Conv(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=False)
        self.name = name
        self.out = []
        self.stack = []      # (kind, tag)
        self.loopvars = ['$index']
        self.skip = 0        # inside helmet/script
        self.in_style = None
        self.header = False
        self.footer = False

    # path -> expression
    def R(self, path):
        path = path.strip()
        if path in ('true','false','null','undefined'): return path
        parts = path.split('.')
        head = parts[0]
        base = head if head in self.loopvars else 'v.' + head
        return base + ''.join('?.' + p if re.match(r'^[A-Za-z_$][\w$]*$', p) else '?.[%s]' % json.dumps(p) for p in parts[1:])

    def tpl(self, s):
        """string possibly with {{x}} -> JS expr (template literal or JSON string)"""
        s = maproutes(H.unescape(s))
        if '{{' not in s:
            return json.dumps(s, ensure_ascii=False)
        parts = re.split(r'\{\{([\s\S]+?)\}\}', s)
        lit = ''
        for i, p in enumerate(parts):
            if i & 1: lit += '${' + self.R(p) + ' ?? ""}'
            else: lit += p.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
        return '`' + lit + '`'

    def attrs_jsx(self, tag, attrs):
        props = []; hov = []
        has_cls = None
        for k, val in attrs:
            lk = k.lower()
            if lk.startswith('hint-') or lk in ('sc-name',) : continue
            if lk.startswith('style-'):
                hov.append((lk[6:], val or '')); continue
            if lk == 'ref':
                m = re.match(r'^\s*\{\{(.+?)\}\}\s*$', val or ''); props.append('ref={%s}' % self.R(m.group(1))); continue
            if lk == 'style':
                if '{{' in (val or ''):
                    props.append('style={css(%s)}' % self.tpl(val))
                else:
                    props.append('style={css(%s)}' % json.dumps(H.unescape(val or ''), ensure_ascii=False))
                continue
            name = ATTR.get(lk, k)
            if lk.startswith('on') and len(lk) > 2:
                ev = 'on' + lk[2].upper() + lk[3:]
                # keep original camel if present
                ev = k if re.match(r'^on[A-Z]', k) else ev
                if ev == 'onInput' and tag in ('input','textarea','select'): ev = 'onChange'
                m = re.match(r'^\s*\{\{(.+?)\}\}\s*$', val or '')
                props.append('%s={%s}' % (ev, self.R(m.group(1)) if m else 'undefined')); continue
            if lk in ('width','height') and tag in ('svg',):
                pass
            if val is None:
                props.append('%s' % name); continue
            whole = re.match(r'^\s*\{\{([\s\S]+?)\}\}\s*$', val)
            if whole:
                e = self.R(whole.group(1))
                if lk == 'value': e = '(%s ?? "")' % e
                elif lk == 'checked': e = '(%s ?? false)' % e
                props.append('%s={%s}' % (name, e))
            else:
                props.append('%s={%s}' % (name, self.tpl(val)))
        if hov:
            cls = ' '.join('${pc(%s,%s)}' % (json.dumps(p), self.tpl(c)) for p, c in hov)
            # merge with existing className
            existing = [p for p in props if p.startswith('className=')]
            if existing:
                props.remove(existing[0])
                props.append('className={[%s, %s].filter(Boolean).join(" ")}' % (existing[0][len('className={'):-1], ', '.join('pc(%s,%s)' % (json.dumps(p), self.tpl(c)) for p, c in hov)))
            else:
                props.append('className={[%s].join(" ")}' % ', '.join('pc(%s,%s)' % (json.dumps(p), self.tpl(c)) for p, c in hov))
        return (' ' + ' '.join(props)) if props else ''

    def handle_starttag(self, tag, attrs, selfclose=False):
        tag = tag.lower()
        if self.skip:
            if tag in ('helmet','script'): self.skip += 1
            return
        if tag in ('helmet','script'):
            self.skip = 1; self.stack.append(('skip', tag)); return
        if tag == 'style':
            self.in_style = []; return
        d = dict(attrs)
        if tag == 'dc-import':
            n = d.get('name')
            if n == 'SiteHeader': self.header = True
            if n == 'SiteFooter':
                self.footer = True
                pr = []
                for k, val in attrs:
                    if k in ('name','hint-size') or k.startswith('hint-'): continue
                    kk = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
                    mm = re.match(r'^\s*\{\{(.+?)\}\}\s*$', val or '')
                    pr.append('%s={%s}' % (kk, self.R(mm.group(1)) if mm else json.dumps(val)))
                self.out.append('<SiteFooter %s />' % ' '.join(pr))
            self.stack.append(('imp', tag)); return
        if tag == 'sc-if':
            m = re.match(r'^\s*\{\{(.+?)\}\}\s*$', d.get('value',''))
            self.out.append('{(%s) && (<>' % self.R(m.group(1)))
            self.stack.append(('if', tag)); return
        if tag == 'sc-for':
            m = re.match(r'^\s*\{\{(.+?)\}\}\s*$', d.get('list',''))
            var = d.get('as','item')
            self.out.append('{(%s || []).map((%s, $index) => (<React.Fragment key={$index}>' % (self.R(m.group(1)), var))
            self.loopvars.append(var)
            self.stack.append(('for', var)); return
        if tag == 'image-slot':
            ph = d.get('placeholder','')
            self.out.append('<Slot ph={%s} />' % self.tpl(ph))
            self.stack.append(('slot', tag)); return
        jt = tag
        a = self.attrs_jsx(tag, attrs)
        if tag in VOID or selfclose:
            self.out.append('<%s%s />' % (jt, a))
            return
        self.out.append('<%s%s>' % (jt, a))
        self.stack.append(('el', tag))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs, selfclose=True)
        if self.stack and self.stack[-1][0] in ('imp','slot') and not self.skip:
            self.stack.pop()

    def handle_endtag(self, tag):
        tag = tag.lower()
        if self.skip:
            if tag in ('helmet','script'):
                self.skip -= 1
                if self.skip == 0: self.stack.pop()
            return
        if tag == 'style' and self.in_style is not None:
            txt = ''.join(self.in_style); self.in_style = None
            self.out.append('<style dangerouslySetInnerHTML={{__html: %s}} />' % json.dumps(txt)); return
        if tag in VOID:
            return
        if not self.stack: return
        kind, t = self.stack.pop()
        if kind == 'if': self.out.append('</>)}')
        elif kind == 'for':
            self.loopvars.pop(); self.out.append('</React.Fragment>))}')
        elif kind in ('imp','slot','void'): pass
        elif kind == 'el': self.out.append('</%s>' % t)

    def handle_data(self, data):
        if self.skip: return
        if self.in_style is not None: self.in_style.append(data); return
        if not data.strip() and '\n' in data: return
        parts = re.split(r'\{\{([\s\S]+?)\}\}', data)
        o = ''
        for i, p in enumerate(parts):
            if i & 1: o += '{%s}' % self.R(p)
            else: o += esc_text(p).replace('<','&lt;')
        self.out.append(o)
    def handle_entityref(self, name):
        if self.skip: return
        if self.in_style is not None: self.in_style.append('&%s;' % name); return
        self.out.append('&%s;' % name)
    def handle_charref(self, name):
        if self.skip: return
        self.out.append('&#%s;' % name)
    def handle_comment(self, data): pass

def convert(fname, outname, cls='Screen'):
    s = open(SRC + fname, encoding='utf-8').read()
    tpl = re.search(r'<x-dc>(.*)</x-dc>', s, re.S).group(1)
    sm = re.search(r'<script type="text/x-dc" data-dc-script([^>]*)>(.*?)</script>\s*</body>', s, re.S)
    script = sm.group(2)
    pm = re.search(r'data-props="([^"]*)"', sm.group(1))
    defaults = {}
    if pm:
        try:
            pj = json.loads(H.unescape(pm.group(1)))
            for k, v in pj.items():
                if not k.startswith('$') and isinstance(v, dict) and 'default' in v: defaults[k] = v['default']
        except Exception as e: print('props parse fail', fname, e)
    c = Conv(fname)
    c.feed(tpl); c.close()
    body = ''.join(c.out)
    script = maproutes(script)
    script = re.sub(r"location\.href\s*=\s*(`[^`]*`|'[^']*'|\"[^\"]*\")", r'DojoMotion.go(\1)', script)
    script = script.replace('class Component extends DCLogic {', 'class %s extends DCLogic {\n  static defaultProps = %s;' % (cls, json.dumps(defaults)), 1)
    footimp = "" if outname == "SiteFooter" else "import SiteFooter from './SiteFooter';"
    code = f"""// @ts-nocheck
/* eslint-disable */
'use client';
// Ported from project/{fname} by scripts/convert (template -> JSX, logic kept as-is).
import React from 'react';
import '@/lib/bootstrap';
import {{ DCLogic }} from '@/lib/dc';
import {{ css, pc }} from '@/lib/css';
import Slot from '@/components/Slot';
{footimp}

{script.strip()}

{cls}.prototype.renderTemplate = function (v) {{
  return (<>{body}</>);
}};

export default {cls};
"""
    open(OUT + outname + '.tsx', 'w', encoding='utf-8').write(code)
    return c.header, c.footer

if __name__ == '__main__':
    pages = [('About.dc.html','About'),('Programs.dc.html','Programs'),('Article.dc.html','Article'),('Blog.dc.html','Blog'),
      ('Schedule.dc.html','Schedule'),('Contact.dc.html','Contact'),('FAQs.dc.html','FAQs'),('Checkout.dc.html','Checkout'),
      ('Discipline.dc.html','Discipline'),('Admin.dc.html','Admin'),('Pricing.dc.html','Pricing'),('Free Trial.dc.html','FreeTrial'),
      ('Coaches.dc.html','Coaches'),('Gallery.dc.html','Gallery'),('Coach App.dc.html','CoachApp'),('Member Portal.dc.html','MemberPortal'),
      ('Login.dc.html','Login'),('Invoice.dc.html','Invoice'),('SiteFooter.dc.html','SiteFooter')]
    info = {}
    for f, o in pages:
        try:
            if 'HAND-EDITED' in open(OUT + o + '.tsx', encoding='utf-8').read(400):
                print('skip (hand-edited):', o); continue
        except FileNotFoundError: pass
        info[o] = convert(f, o)
    print(json.dumps(info))
