"use client";
import { useShell } from "./Shell";

type P = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };
/** Anchor that plays the crimson slash transition for internal links and in-page jumps. */
export default function TLink({ href, onClick, ...rest }: P) {
  const { go } = useShell();
  const internal = href.startsWith("/") || href.startsWith("#");
  return (
    <a href={href} {...rest} onClick={(e) => {
      onClick?.(e);
      if (!internal || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault(); go(href);
    }} />
  );
}
