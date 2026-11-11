import Image from "next/image";

export function FactionsLogo({ size = 38 }: { size?: number }) {
  return (
    <Image
      src="/artwork/factions-logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      sizes={`${size}px`}
      className="shrink-0"
    />
  );
}
