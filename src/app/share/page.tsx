"use client";

import { Suspense } from "react";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import ShareContent from "./share-content";

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-6">
          <SciFiLoader text="正在装配你的 AI Agent Passport..." />
        </main>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
