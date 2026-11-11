import Image from "next/image";

const artwork: Record<string, { src: string; alt: string }> = {
  Altruism: { src: "/artwork/PENUP_20261110_141149.png", alt: "Dlani, ki varujeta srce" },
  Grit: { src: "/artwork/PENUP_20261110_141850.png", alt: "Stisnjena pest" },
  Harmony: { src: "/artwork/PENUP_20261110_142146.png", alt: "Lotosov cvet" },
  Verity: { src: "/artwork/PENUP_20261110_142519.png", alt: "Tehtnica" },
  Intellect: { src: "/artwork/PENUP_20261110_142919.png", alt: "Možgani" },
};

export function FactionIcon({ name, size = 84 }: { name: string; size?: number }) {
  const item = artwork[name];
  if (!item) return null;

  return (
    <span className="faction-icon" style={{ width: size, height: size }}>
      <Image src={item.src} alt={item.alt} width={1080} height={1080} sizes={`${size}px`} />
    </span>
  );
}
