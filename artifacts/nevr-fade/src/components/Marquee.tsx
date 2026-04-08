export default function Marquee() {
  const text = "PREMIUM · MINIMAL · BOLD · TIMELESS · NEVR FADE · BUILT DIFFERENT · QUALITY OVER EVERYTHING · ";
  
  return (
    <div className="w-full bg-accent py-4 overflow-hidden border-y border-primary/10">
      <div className="flex w-[200%] animate-marquee">
        <div className="w-1/2 flex justify-around whitespace-nowrap">
          <span className="font-heading text-primary text-2xl tracking-[0.2em]">{text}</span>
          <span className="font-heading text-primary text-2xl tracking-[0.2em]">{text}</span>
        </div>
        <div className="w-1/2 flex justify-around whitespace-nowrap">
          <span className="font-heading text-primary text-2xl tracking-[0.2em]">{text}</span>
          <span className="font-heading text-primary text-2xl tracking-[0.2em]">{text}</span>
        </div>
      </div>
    </div>
  );
}
