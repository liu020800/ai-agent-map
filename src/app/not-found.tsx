"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-8xl font-bold text-white"
      >
        404
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-neutral-400"
      >
        你要找的页面不存在或已移动。
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/"
          className="btn-lusion-outline inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Home className="h-4 w-4" /> 返回首页
        </Link>
      </motion.div>
    </main>
  );
}
