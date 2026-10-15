import TLink from "./TLink";

export default function Btn({ href, children, light, shine = true, flex = "1 1 230px", h }:
  { href: string; children: React.ReactNode; light?: boolean; shine?: boolean; flex?: string; h?: number }) {
  return (
    <TLink href={href} className={"btn" + (light ? " light" : "")} style={{ flex, ...(h ? ({ "--bh": h + "px" } as React.CSSProperties) : {}) }}>
      <span className="in"><span className="fill" />{shine && <span className="shine" data-shine="" />}
        <span className="lbl">{children}</span><span className="arr">→</span></span>
    </TLink>
  );
}
