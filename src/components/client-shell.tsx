"use client";

import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("@/components/particle-background"), { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ParticleBackground />
      {children}
    </>
  );
}
