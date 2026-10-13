/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { Product } from './AdminProductManager';

interface JewelryCloseUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  initialIndex?: number;
  onAddToCart: (id: number) => void;
  onOrderWhatsApp: (product: Product) => void;
}

export function JewelryCloseUpModal({
  isOpen,
  onClose,
  product,
  initialIndex = 0,
  onAddToCart,
  onOrderWhatsApp,
}: JewelryCloseUpModalProps) {
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.img
      ? [product.img]
      : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1.8);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync index if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1.8);
    setPanOffset({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  // Handle keyboard navigation (Escape to close, Arrows to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(3.5, z + 0.3));
      } else if (e.key === '-') {
        setZoom((z) => Math.max(1, z - 0.3));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  const activeImage = images[currentIndex] || product.img;

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, Math.round((z + 0.4) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Math.round((z - 0.4) * 10) / 10));
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse move pan for desktop
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoom <= 1) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

      // Range limit pan
      const maxPan = (zoom - 1) * 220;
      setPanOffset({
        x: -relativeX * maxPan,
        y: -relativeY * maxPan,
      });
    },
    [zoom]
  );

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const maxPan = (zoom - 1) * 280;

    setPanOffset({
      x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.initialPanX + deltaX)),
      y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.initialPanY + deltaY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fade-in select-none text-white overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div className="p-3 sm:p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between gap-3 border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9b722d] to-[#e4c079] text-[#2b1803] font-serif-luxury font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-white/30">
            B
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-serif-luxury font-medium text-white/95 truncate">
                {product.name}
              </h3>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#f1cb7a] bg-[#3a2c14]/80 px-2 py-0.5 rounded-full border border-[#896426] shrink-0">
                Galería de Fotos
              </span>
            </div>
            <p className="text-[10px] text-white/60 truncate">
              Foto {currentIndex + 1} de {images.length} · Fotos oficiales de alta calidad
            </p>
          </div>
        </div>

        {/* Zoom Controls & Close Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Level Badges */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-xs p-1 rounded-xl border border-white/10">
            {[1, 1.5, 2, 2.8].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setZoom(lvl);
                  if (lvl === 1) setPanOffset({ x: 0, y: 0 });
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  Math.abs(zoom - lvl) < 0.2
                    ? 'bg-[#d6a545] text-[#291705] shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {lvl}x
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white/10 backdrop-blur-xs rounded-xl p-0.5 border border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Reducir zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-[#f1cb7a] min-w-[32px] text-center">
              {zoom.toFixed(1)}x
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3.5}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Aumentar zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors border-l border-white/10 ml-0.5"
                title="Restablecer tamaño normal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20"
            title="Cerrar lupa (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Magnifier Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-crosshair px-4 py-2"
      >
        {/* Navigation Arrows for Previous / Next Image */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/25 shadow-lg backdrop-blur-xs transition-transform active:scale-95"
              title="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/25 shadow-lg backdrop-blur-xs transition-transform active:scale-95"
              title="Siguiente foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* The Scaled and Panned Image Canvas */}
        <div
          className="relative max-w-full max-h-[72vh] flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            cursor: zoom > 1 ? 'grab' : 'zoom-in',
          }}
          onClick={() => {
            if (zoom === 1) setZoom(2);
            else if (zoom >= 2) setZoom(1);
          }}
        >
          <img
            src={activeImage}
            alt={product.name}
            className="max-w-[85vw] max-h-[68vh] sm:max-h-[74vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none pointer-events-none"
            draggable={false}
          />

          {/* Watermark badge only on local bundled catalog photos that do not have a baked watermark */}
          {!activeImage.startsWith('data:') && !activeImage.startsWith('http') && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs flex items-center gap-1.5 pointer-events-none select-none border border-white/20">
              <span className="w-3.5 h-3.5 rounded-full bg-white text-[#b58a42] text-[8px] font-bold font-serif-luxury flex items-center justify-center">B</span>
              <span className="text-[9px] tracking-wider font-semibold text-white/95 uppercase">Bianca Joyería</span>
            </div>
          )}
        </div>

        {/* Helper Hint Pill */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-xs text-[10px] text-white/80 border border-white/15 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#f1cb7a]" />
            <span>
              {zoom > 1
                ? 'Mueve el cursor o arrastra para recorrer la imagen'
                : 'Toca o haz clic para ampliar'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Thumbnails Strip + Quick Buy Actions */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-black/95 to-transparent border-t border-white/10 shrink-0 space-y-3 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Thumbnails of available product photos */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin">
            {images.map((imgUrl, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoom(1.8);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    isSelected
                      ? 'border-[#e4c079] ring-2 ring-[#e4c079]/50 scale-105 shadow-md'
                      : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Ángulo ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 text-[8px] font-bold bg-black/70 px-1 text-white/90 rounded-tl">
                    {idx === 0 ? '★' : idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product details & quick actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="text-right hidden sm:block pr-2 border-r border-white/15">
              <span className="text-[10px] text-[#e4c079] font-medium block">
                {product.category}
              </span>
              {product.price && (
                <span className="text-sm font-bold text-white">
                  ${product.price} MXN
                </span>
              )}
            </div>

            <button
              onClick={() => {
                onAddToCart(product.id);
                onClose();
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/20"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>+ Agregar a selección</span>
            </button>

            <button
              onClick={() => {
                onOrderWhatsApp(product);
                onClose();
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Pedir por WhatsApp ↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
