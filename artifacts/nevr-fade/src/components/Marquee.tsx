export default function Marquee() {
  const text = "PREMIUM · MINIMAL · BOLD · TIMELESS · NEVR FADE · BUILT DIFFERENT · ";
  
  return (
    <div className="w-full bg-accent py-4 overflow-hidden border-y border-primary/10">
      <div className="marquee-container">
        <div className="marquee-content">
          <span className="font-heading text-primary text-2xl md:text-3xl tracking-[0.3em] whitespace-nowrap">{text}</span>
        </div>
        <div className="marquee-content">
          <span className="font-heading text-primary text-2xl md:text-3xl tracking-[0.3em] whitespace-nowrap">{text}</span>
        </div>
      </div>
    </div>
  );
}
