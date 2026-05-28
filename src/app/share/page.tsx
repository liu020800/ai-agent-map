"use client";

import { Suspense } from "react";
import ShareContent from "./share-content";

export default function SharePage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          加载中...
        </div>
      </main>
    }>
      <ShareContent />
    </Suspense>
  );
}
