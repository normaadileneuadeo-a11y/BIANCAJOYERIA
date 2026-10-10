/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface RealQRCodeProps {
  url?: string;
  size?: number;
}

export function RealQRCode({ url, size = 220 }: RealQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://bianca-joyeria.com');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(targetUrl, {
      width: size * 2, // 2x for sharp retina rendering
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#352132', // Elegant dark plum tone
        light: '#ffffff', // Pure white background for 100% scannability
      },
    })
      .then((res) => {
        if (isMounted) {
          setDataUrl(res);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUrl, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-white rounded-2xl flex items-center justify-center text-xs text-[#a44c7c] p-4 text-center"
      >
        Error al generar código QR.
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-[#faf1f6] rounded-2xl flex items-center justify-center animate-pulse"
      >
        <span className="text-xs text-[#9d7d95]">Generando código QR…</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block bg-white p-3 rounded-2xl shadow-sm border border-[#edd7e6]">
      <img
        src={dataUrl}
        alt={`Código QR para escanear y abrir: ${targetUrl}`}
        width={size}
        height={size}
        className="rounded-xl block select-none mx-auto"
      />
      {/* Central Monogram Emblem overlay in center (subtle, transparent border) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-white border-2 border-[#d8b571] flex items-center justify-center shadow-md">
          <span className="font-serif-luxury font-bold text-[#b58a42] text-sm leading-none">
            B
          </span>
        </div>
      </div>
    </div>
  );
}
