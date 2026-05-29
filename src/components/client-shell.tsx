"use client";

import Navbar from "@/components/navbar";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-20">{children}</div>
    </>
  );
}
