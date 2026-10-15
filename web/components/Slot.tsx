/** Placeholder for a photo. Pass `src` once real images exist (drop files in /public/images). */
export default function Slot({ ph, src }: { ph: string; src?: string }) {
  return (
    <div className="slot">
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={ph} /> : <span>{ph}</span>}
    </div>
  );
}
