"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function LocalQrCode({
  value,
  size = 96,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#05060a",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch(() => {
        if (active) setSrc("");
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) {
    return <div className={className} style={{ width: size, height: size }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Data URL generated client-side; next/image has no benefit here.
    <img src={src} alt="QR Code" width={size} height={size} className={className} />
  );
}
