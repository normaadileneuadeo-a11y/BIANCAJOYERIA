/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  X,
  Plus,
  Minus,
  MessageCircle,
  ExternalLink,
  Gift,
  Sparkles,
  ShieldCheck,
  Check,
  Share2,
  QrCode,
  UserPlus,
  ChevronRight,
  Gem,
  ArrowLeft,
  Copy,
  SlidersHorizontal,
} from 'lucide-react';

import heroImg from './assets/images/hero_jewelry_showcase_1791672703497.jpg';
import collarImg from './assets/images/product_collar_corazon_1791672717702.jpg';
import anillosImg from './assets/images/product_anillos_minimalistas_1791672744420.jpg';
import pulseraImg from './assets/images/product_pulsera_eslabones_1791672752809.jpg';
import aretesImg from './assets/images/product_aretes_delicados_1791672761293.jpg';
import packagingImg from './assets/images/packaging_box_unboxing_1791673252742.jpg';
import nfcStandImg from './assets/images/nfc_stand_display_1791673274611.jpg';
import { PinkGlitterCanvas } from './components/PinkGlitterCanvas';
import { RealQRCode } from './components/RealQRCode';
import { AdminProductManager, Product } from './components/AdminProductManager';
import {
  subscribeToProducts,
  saveProductToCloud,
  deleteProductFromCloud,
  resetCloudProductsToDefaults,
} from './services/productsService';

const WHATSAPP_NUMBER = '526871349604';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Collar corazón dorado',
    category: 'Collares',
    price: 380,
    desc: 'Un detalle delicado para todos los días con dije en forma de corazón pulido y cadena de 45 cm.',
    material: 'Chapa de oro 14k con recubrimiento protector hipoalergénico',
    tag: 'Favorito',
    img: collarImg,
  },
  {
    id: 2,
    name: 'Anillos de estilo minimalista',
    category: 'Anillos',
    price: 420,
    desc: 'Juego de argollas finas apilables con sutiles incrustaciones para combinar libremente.',
    material: 'Baño de oro 14k y micro-circonias de alta pureza',
    tag: 'Para combinar',
    img: anillosImg,
  },
  {
    id: 3,
    name: 'Pulsera de eslabones clásicos',
    category: 'Pulseras',
    price: 350,
    desc: 'Eslabones pulidos con caída suave y broche perico seguro para elevar cualquier atuendo.',
    material: 'Aleación dorada premium de larga duración',
    tag: 'Clásico',
    img: pulseraImg,
  },
  {
    id: 4,
    name: 'Aretes delicados huggies',
    category: 'Aretes',
    price: 290,
    desc: 'Pequeñas arracadas con micro-circonias frontales, ultraligeras y confortables.',
    material: 'Poste hipoalergénico libre de níquel con chapa dorada',
    tag: 'Esencial',
    img: aretesImg,
  },
  {
    id: 5,
    name: 'Collar medallón para regalar',
    category: 'Collares',
    price: 450,
    desc: 'Una sorpresa bonita para alguien especial. Medallón artesanal con estuche de obsequio.',
    material: 'Baño de oro 14k resistente y duradero',
    tag: 'Regalo',
    img: heroImg,
  },
  {
    id: 6,
    name: 'Anillo dorado elegante pavé',
    category: 'Anillos',
    price: 390,
    desc: 'Diseño versátil para ocasiones especiales con aro finamente esculpido y brillo sutil.',
    material: 'Chapa de oro 14k con acabado pulido espejo',
    tag: 'Elegante',
    img: anillosImg,
  },
  {
    id: 7,
    name: 'Pulsera satélite para diario',
    category: 'Pulseras',
    price: 340,
    desc: 'Cadena sutil con esferas pulidas, perfecta para llevar sola o combinada con reloj.',
    material: 'Acero con chapa de oro 14k resistente al uso cotidiano',
    tag: 'Versátil',
    img: pulseraImg,
  },
  {
    id: 8,
    name: 'Aretes para ocasión especial',
    category: 'Aretes',
    price: 320,
    desc: 'El complemento perfecto para eventos y regalos memorables con destellos cálidos.',
    material: 'Diseño liviano hipoalergénico con acabado dorado fino',
    tag: 'Especial',
    img: aretesImg,
  },
];

const CATEGORY_TILES = [
  {
    name: 'COLLARES',
    category: 'Collares' as const,
    img: collarImg,
    subtitle: 'Dijes y cadenas delicadas',
  },
  {
    name: 'ANILLOS',
    category: 'Anillos' as const,
    img: anillosImg,
    subtitle: 'Argollas finas y ajustables',
  },
  {
    name: 'PULSERAS',
    category: 'Pulseras' as const,
    img: pulseraImg,
    subtitle: 'Eslabones y satélites',
  },
  {
    name: 'ARETES',
    category: 'Aretes' as const,
    img: aretesImg,
    subtitle: 'Huggies y colgantes sutiles',
  },
];

function playLuxuryChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.7);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1567.98, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio error if user hasn't interacted
  }
}

function triggerHaptic(pattern: number | number[] = [15, 25, 15]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored
    }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'nfc-home' | 'catalogo' | 'empaque'>('nfc-home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNFCStandModal, setShowNFCStandModal] = useState(false);
  const [topBannerVisible, setTopBannerVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [glitterTrigger, setGlitterTrigger] = useState<number>(1);

  // Products state (persisted locally in localStorage, 0 tokens spent!)
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bianca_atondo_products_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Form states in cart
  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Quiero consultar entrega');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    triggerHaptic([30, 20]);
    // Welcome pink glitter burst
    setGlitterTrigger((prev) => prev + 1);

    // Real-time synchronization from Cloud Firestore
    const unsubscribe = subscribeToProducts(INITIAL_PRODUCTS, (updated) => {
      setProducts(updated);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProductCloud = async (prod: Product) => {
    await saveProductToCloud(prod);
    showToast(`"${prod.name}" sincronizada en la nube mundial ☁️`);
  };

  const handleDeleteProductCloud = async (id: number) => {
    await deleteProductFromCloud(id);
    showToast('Pieza eliminada de la nube 🗑️');
  };

  const handleResetDefaultsCloud = async () => {
    await resetCloudProductsToDefaults(INITIAL_PRODUCTS);
    showToast('Colección original restablecida en la nube ✨');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    triggerHaptic(15);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const estimatedTotal = useMemo(() => {
    return Object.keys(cart).reduce((sum, idStr) => {
      const id = Number(idStr);
      const prod = products.find((p) => p.id === id);
      const qty = cart[id] || 0;
      return sum + (prod?.price ? prod.price * qty : 0);
    }, 0);
  }, [cart, products]);

  const addToCart = (productId: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    playLuxuryChime();
    triggerHaptic([20, 20]);
    const prod = products.find((p) => p.id === productId);
    showToast(`"${prod?.name || 'Joya'}" agregada a tu selección ♡`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      const copy = { ...prev };
      if (next <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = next;
      }
      return copy;
    });
    triggerHaptic(10);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const nextState = !prev[productId];
      if (nextState) {
        playLuxuryChime();
        showToast('Guardado en tus favoritos ♡');
      }
      return { ...prev, [productId]: nextState };
    });
  };

  const triggerSparkles = () => {
    playLuxuryChime();
    triggerHaptic([30, 40, 20]);
    setGlitterTrigger((prev) => prev + 1);
  };

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        (selectedCategory === 'Para regalar' && (item.tag === 'Regalo' || item.tag === 'Favorito')) ||
        item.category === selectedCategory;

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.desc.toLowerCase().includes(term) ||
        item.material.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const handleCategoryCardClick = (cat: 'Collares' | 'Anillos' | 'Pulseras' | 'Aretes') => {
    setSelectedCategory(cat);
    setActiveTab('catalogo');
    playLuxuryChime();
    triggerHaptic([20, 20]);
    showToast(`Mostrando colección de ${cat} ✨`);
  };

  const handleSendOrder = () => {
    const itemIds = Object.keys(cart)
      .map(Number)
      .filter((id) => (cart[id] || 0) > 0);

    if (itemIds.length === 0) {
      showToast('Selecciona al menos una joya primero');
      return;
    }

    const itemsList = itemIds
      .map((id) => {
        const prod = products.find((p) => p.id === id);
        const priceStr = prod?.price ? `— $${prod.price} MXN c/u` : '— Precio por confirmar';
        return `• ${prod?.name || 'Joya'} (${prod?.category}) — Cantidad: ${cart[id]} ${priceStr}`;
      })
      .join('\n');

    const totalText = estimatedTotal > 0 ? `\n💰 Total estimado: $${estimatedTotal.toLocaleString('es-MX')} MXN` : '';

    const message = `Hola Bianca ✨ Vi su catálogo digital y quiero consultar disponibilidad para:\n\n${itemsList}${totalText}\n\n👤 Mi nombre: ${customerName.trim() || 'No especificado'}\n📦 Entrega: ${deliveryMethod}\n📝 Nota: ${orderNotes.trim() || 'Ninguna'}\n\n¿Me podrías confirmar existencias y coordinar la compra, por favor?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleDirectWhatsApp = () => {
    playLuxuryChime();
    triggerHaptic([20, 20]);
    const message = `Hola Bianca ✨ Vi su catálogo digital y me gustaría conocer precios y piezas disponibles de su joyería.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    triggerHaptic(15);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bianca Atondo Peñuelas | Joyería',
          text: 'Descubre las piezas exclusivas de Bianca Atondo Joyería ♡ Consulta por WhatsApp.',
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace copiado al portapapeles 📋');
    }
  };

  const downloadVCard = () => {
    triggerHaptic([20, 20]);
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Bianca Atondo Peñuelas - Joyería
ORG:Bianca Atondo Joyería
TEL;TYPE=CELL,VOICE:+526871349604
NOTE:Joyería que se siente, se lleva y se ama ♡ Detalles que hacen brillar tu historia.
URL:https://www.instagram.com/bianca.atondo.joyeria/
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bianca_Atondo_Joyeria.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Contacto guardado para tu celular ✨');
  };

  return (
    <div className="min-h-screen bg-[#faf5f8] text-[#342431] flex flex-col antialiased selection:bg-[#ebd0df] selection:text-[#532644]">
      {/* Pink Glitter Particle Engine ('BRILLANTINAS ROSAS') */}
      <PinkGlitterCanvas triggerCount={glitterTrigger} />

      {/* Real Top Announcement Bar */}
      {topBannerVisible && (
        <div className="bg-gradient-to-r from-[#44273d] via-[#5c3554] to-[#44273d] text-white py-2 px-4 text-xs shadow-md border-b border-[#734b6b]/40">
          <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[#f4c2dc] text-xs">♡</span>
              <p className="font-medium text-[11px] sm:text-xs tracking-wide truncate">
                Joyería Fina Bianca Atondo · Envíos y entregas personales
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerSparkles}
                className="px-2.5 py-0.5 rounded-full bg-[#f4c2dc]/30 hover:bg-[#f4c2dc]/45 text-[#fde4f1] text-[10px] font-semibold tracking-wide border border-[#f4c2dc]/40 transition-colors inline-flex items-center gap-1 active:scale-95"
                title="Activar brillantinas rosas"
              >
                <Sparkles className="w-3 h-3 text-[#ffd54f]" />
                <span>Brillar ✨</span>
              </button>
              <button
                onClick={() => setTopBannerVisible(false)}
                className="text-[#eed3e4] hover:text-white p-1"
                aria-label="Cerrar aviso superior"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Container */}
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-[#faf5f8]/95 backdrop-blur-md border-b border-[#f0dde7] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab !== 'nfc-home' && (
              <button
                onClick={() => setActiveTab('nfc-home')}
                className="w-8 h-8 rounded-full bg-white border border-[#edd5e4] flex items-center justify-center text-[#7e5d77] hover:text-[#b05286]"
                aria-label="Volver a la portada"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white border border-[#d8b571] flex items-center justify-center font-serif-luxury text-base font-bold text-[#b58a42] shadow-xs">
                B
              </span>
              <div>
                <div className="font-serif-luxury text-sm font-semibold tracking-wider text-[#352132] leading-tight uppercase">
                  Bianca Atondo
                </div>
                <div className="text-[9px] tracking-widest text-[#ba5489] font-medium uppercase leading-tight">
                  Joyería Fina
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Cargar Joya, QR, Compartir, Selección) */}
          <div className="flex items-center gap-2">
            {/* Admin trigger button: Subir Joyas con Marca de Agua */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-2.5 py-1.5 rounded-full bg-white border border-[#eed7e6] text-[#863760] text-xs font-semibold hover:bg-[#faedf4] transition-colors inline-flex items-center gap-1 shadow-2xs active:scale-95"
              title="Cargar productos reales con precio y marca de agua oficial"
            >
              <Plus className="w-3.5 h-3.5 text-[#ba5489]" />
              <span className="hidden sm:inline">Cargar Joya</span>
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="w-8 h-8 rounded-full bg-white border border-[#eed7e6] text-[#795d73] flex items-center justify-center hover:text-[#b05286]"
              title="Ver código QR para compartir"
              aria-label="Ver código QR"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white border border-[#eed7e6] text-[#795d73] flex items-center justify-center hover:text-[#b05286]"
              title="Compartir con una amiga"
              aria-label="Compartir catálogo"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-2.5 py-1.5 rounded-full bg-[#ba5489] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#a84779] transition-colors"
              aria-label={`Ver selección (${totalCartCount})`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {totalCartCount > 0 && (
                <span className="text-[11px] font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 pb-28 px-4 pt-4 space-y-6">
          {/* TAB 1: NFC HOME - The Exact Mobile Screen */}
          {activeTab === 'nfc-home' && (
            <div className="space-y-6 animate-fade-in">
              {/* Brand Centerpiece / Emblem */}
              <div className="text-center pt-2 pb-1 relative">
                <button
                  type="button"
                  onClick={triggerSparkles}
                  className="relative w-28 h-28 mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform group"
                  title="Toca el monograma para activar brillantinas rosas ✨"
                  aria-label="Toca el monograma para activar brillantinas rosas"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#fadfe9] via-[#f5e3fc] to-[#fce4ee] opacity-70 blur-md group-hover:opacity-100 transition-opacity" />
                  
                  {/* Orbiting Ring Ellipse */}
                  <div className="absolute w-24 h-12 rounded-[50%] border-[2px] border-[#cbb3d9] rotate-[-25deg] pointer-events-none group-hover:rotate-[-20deg] transition-transform" />
                  <div className="absolute w-24 h-12 rounded-[50%] border-[1.5px] border-[#dfb672] rotate-[-25deg] translate-x-0.5 translate-y-0.5 pointer-events-none" />

                  {/* Sparkle Star ✦ */}
                  <div className="absolute top-2 right-3 text-[#d19c3c] animate-pulse">
                    <Sparkles className="w-5 h-5 fill-[#ecc577]" />
                  </div>

                  {/* Small Heart ♡ */}
                  <div className="absolute bottom-4 right-4 text-[#ba5489]">
                    <Heart className="w-4 h-4 fill-[#e59fc4] text-[#ba5489]" />
                  </div>

                  {/* Golden 'B' Monogram */}
                  <div className="relative z-10 font-serif-luxury text-6xl font-bold tracking-tight text-[#b58a42] drop-shadow-sm select-none">
                    <span className="gold-gradient-text">B</span>
                  </div>
                </button>

                {/* Brand Name Typography */}
                <div className="mt-1 space-y-0.5">
                  <h1 className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.22em] font-semibold text-[#8b3b68] uppercase">
                    BIANCA
                  </h1>
                  <p className="font-script-luxury text-3xl sm:text-4xl text-[#5e3a57] -mt-1 font-normal">
                    Atondo Peñuelas
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.3em] font-semibold text-[#ba5489] uppercase mt-0.5">
                    <span>♡</span>
                    <span>JOYERÍA</span>
                    <span>♡</span>
                  </div>
                  <p className="text-xs text-[#826a7e] font-serif-luxury italic mt-1.5">
                    Detalles que hacen brillar tu historia ♡
                  </p>
                </div>
              </div>

              {/* Physical Stand Card Banner */}
              <div className="p-3.5 bg-gradient-to-r from-[#fef5f9] via-[#f7eaf4] to-[#fef5f9] rounded-2xl border border-[#eed4e4] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e6cadc] flex items-center justify-center text-[#ba5489] shadow-2xs shrink-0">
                    <Gem className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#863760] block leading-tight">
                      Catálogo Exclusivo en Tu Celular
                    </span>
                    <span className="text-[10px] text-[#7f667c] leading-tight block mt-0.5">
                      Consulta existencias y cotiza directo por WhatsApp
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowNFCStandModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#eed0e2] text-[10px] font-semibold text-[#964273] hover:bg-[#faedf4] whitespace-nowrap shadow-2xs"
                >
                  Ver atril ↗
                </button>
              </div>

              {/* THE 4 CATEGORY SHOWCASE CARDS (2x2 Grid) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a44c7c]">
                    Colección Exclusiva
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory('Todos');
                      setActiveTab('catalogo');
                    }}
                    className="text-[11px] text-[#ba5489] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    Ver todo ({products.length}) <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {CATEGORY_TILES.map((tile) => (
                    <button
                      key={tile.name}
                      onClick={() => handleCategoryCardClick(tile.category)}
                      className="group bg-white rounded-2xl border border-[#eed7e6] overflow-hidden text-left shadow-xs hover:shadow-md hover:border-[#dfb8d2] transition-all duration-200 active:scale-[0.98] flex flex-col"
                    >
                      <div className="relative aspect-square w-full bg-[#faedf4] overflow-hidden">
                        <img
                          src={tile.img}
                          alt={tile.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* Watermark overlay */}
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/45 backdrop-blur-xs flex items-center gap-1 pointer-events-none select-none border border-white/20">
                          <span className="w-2.5 h-2.5 rounded-full bg-white text-[#b58a42] text-[6px] font-bold font-serif-luxury flex items-center justify-center">B</span>
                          <span className="text-[7px] tracking-wider font-semibold text-white/95 uppercase">Bianca</span>
                        </div>
                      </div>
                      <div className="p-3 text-center bg-white flex flex-col items-center justify-center">
                        <span className="font-serif-luxury text-sm sm:text-base font-semibold tracking-wider text-[#3c2539] uppercase group-hover:text-[#ba5489] transition-colors">
                          {tile.name}
                        </span>
                        <span className="text-[10px] text-[#937b90] mt-0.5">
                          {tile.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Romantic Quote */}
              <div className="text-center py-4 px-6 bg-white rounded-2xl border border-[#eed8e6] shadow-xs space-y-1">
                <p className="font-serif-luxury italic text-[#4a2e45] text-base sm:text-lg">
                  “Hechas para acompañar cada momento especial. ♡”
                </p>
                <p className="text-[10px] tracking-widest uppercase font-semibold text-[#b58a42]">
                  Acabados en Chapa de Oro 14k & Acero Fino
                </p>
              </div>

              {/* Direct Primary Action: Consultar por WhatsApp */}
              <div className="space-y-2">
                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full py-4 px-5 rounded-2xl bg-[#9e3a6a] hover:bg-[#8d325d] text-white text-sm font-semibold tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Consultar por WhatsApp</span>
                </button>
                <p className="text-[10px] text-center text-[#8e768b]">
                  Atención personalizada directa con Bianca Atondo · Envíos y entregas inmediatas
                </p>
              </div>

              {/* 4 Brand Pillars / Trust Props */}
              <div className="p-4 bg-white rounded-2xl border border-[#eed8e6] space-y-3">
                <div className="text-center pb-2 border-b border-[#f6e5ef]">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8b3b68]">
                    ¿Por qué elegir Bianca Joyería?
                  </span>
                  <p className="font-serif-luxury italic text-sm text-[#50374b] mt-0.5">
                    “Más que joyería, son momentos ♡”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#fdf8fa]">
                    <span className="w-7 h-7 rounded-full bg-[#fde9f2] text-[#ba5489] flex items-center justify-center shrink-0">
                      <Gem className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-[#3e273b] block leading-tight">
                        Piezas únicas
                      </span>
                      <span className="text-[9px] text-[#856c82] leading-tight block mt-0.5">
                        Detalles seleccionados
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#fdf8fa]">
                    <span className="w-7 h-7 rounded-full bg-[#fde9f2] text-[#ba5489] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-[#3e273b] block leading-tight">
                        Alta calidad
                      </span>
                      <span className="text-[9px] text-[#856c82] leading-tight block mt-0.5">
                        Hipoalergénico y duradero
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#fdf8fa]">
                    <span className="w-7 h-7 rounded-full bg-[#fde9f2] text-[#ba5489] flex items-center justify-center shrink-0">
                      <Gift className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-[#3e273b] block leading-tight">
                        Para regalar
                      </span>
                      <span className="text-[9px] text-[#856c82] leading-tight block mt-0.5">
                        Empaque listo y tarjeta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#fdf8fa]">
                    <span className="w-7 h-7 rounded-full bg-[#fde9f2] text-[#ba5489] flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-[#3e273b] block leading-tight">
                        Exclusividad
                      </span>
                      <span className="text-[9px] text-[#856c82] leading-tight block mt-0.5">
                        Diseños con brillo propio
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Card Download */}
              <div className="p-4 bg-gradient-to-br from-[#faf0f5] to-[#f4e9f7] rounded-2xl border border-[#eed0e2] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#40273c] block">
                    Guarda nuestro contacto en tu móvil
                  </span>
                  <span className="text-[10px] text-[#7f667d] block">
                    Agrega a Bianca en tu agenda con 1 solo toque
                  </span>
                </div>
                <button
                  onClick={downloadVCard}
                  className="px-3.5 py-2 rounded-xl bg-white text-[#964273] border border-[#e6cadc] text-xs font-semibold hover:bg-[#faedf4] transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>

              {/* Enseña a una amiga o amigo (Código QR) */}
              <div className="p-4 bg-white rounded-2xl border border-[#eed0e2] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#faedf4] text-[#ba5489] flex items-center justify-center shrink-0 border border-[#f3d9e8]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-[#3d2439] block truncate">
                      Enseña a una amiga o amigo
                    </span>
                    <span className="text-[10px] text-[#836a80] block truncate">
                      Muestra este QR para que lo escanee con su celular
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Ver QR</span>
                </button>
              </div>

              {/* Instagram & Social Proof */}
              <div className="text-center py-2 space-y-2">
                <p className="text-xs text-[#7e677c]">
                  Síguenos en Instagram para ver nuevos lanzamientos
                </p>
                <a
                  href="https://www.instagram.com/bianca.atondo.joyeria/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e9d1e0] text-xs font-semibold text-[#8b3b68] hover:bg-[#fcf5f9] shadow-2xs"
                >
                  <span>@bianca.atondo.joyeria</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: FULL INTERACTIVE CATALOG */}
          {activeTab === 'catalogo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif-luxury text-2xl text-[#392437] font-medium">
                    Catálogo de Joyería
                  </h2>
                  <p className="text-[11px] text-[#866d82]">
                    Selecciona tus piezas para consultar disponibilidad y precio
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#faedf4] text-[#ba5489] border border-[#f0d0e3] text-xs font-semibold hover:bg-[#ba5489] hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cargar Joya</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8094]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar collar, anillo, pulsera…"
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#ecd5e2] rounded-xl text-xs text-[#352332] placeholder-[#9a8094] focus:outline-none focus:border-[#ba5489]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9a8094] hover:text-[#352332]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['Todos', 'Collares', 'Anillos', 'Pulseras', 'Aretes', 'Para regalar'].map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        triggerHaptic(10);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-[#ba5489] text-white shadow-xs'
                          : 'bg-white text-[#735a70] border border-[#ebd6e4] hover:bg-[#faedf4]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                  const inCartCount = cart[product.id] || 0;
                  const isFav = !!favorites[product.id];

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#eed8e6] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                    >
                      {/* Image with Official Watermark */}
                      <div className="relative aspect-[4/3.8] bg-[#fbf4f8]">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-semibold uppercase tracking-wider text-[#986629] bg-white/95 px-1.5 py-0.5 rounded-md border border-[#e9d6be]">
                          {product.tag}
                        </span>
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${
                            isFav ? 'bg-[#ba5489] text-white' : 'bg-white/90 text-[#8e6884]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        {/* Watermark badge on photo */}
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/45 backdrop-blur-xs flex items-center gap-1 pointer-events-none select-none border border-white/20">
                          <span className="w-2.5 h-2.5 rounded-full bg-white text-[#b58a42] text-[6px] font-bold font-serif-luxury flex items-center justify-center">B</span>
                          <span className="text-[7px] tracking-wider font-semibold text-white/95 uppercase">Bianca Joyería</span>
                        </div>

                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="absolute inset-x-2 bottom-8 py-1 bg-[#3f273b]/80 backdrop-blur-xs text-white text-[10px] rounded-lg text-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          Ver detalles
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[#b35185] block">
                            {product.category}
                          </span>
                          <h3 className="font-serif-luxury text-sm font-medium text-[#382335] leading-snug line-clamp-1 mt-0.5">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-[#7c6577] line-clamp-2 mt-1 leading-relaxed">
                            {product.desc}
                          </p>
                        </div>

                        {/* Bottom Price & Add Action */}
                        <div className="mt-3 pt-2 border-t border-[#f7eaf2] flex items-center justify-between">
                          <div>
                            {product.price ? (
                              <span className="text-xs font-bold text-[#b58a42] block">
                                ${product.price} MXN
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#8b5f7e] block">
                                Consultar
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {inCartCount > 0 && (
                              <span className="text-xs font-bold text-[#ba5489]">
                                {inCartCount}
                              </span>
                            )}
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-7 h-7 rounded-full bg-[#faedf4] text-[#ba5489] hover:bg-[#ba5489] hover:text-white flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
                              aria-label={`Agregar ${product.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGING & GIFT UNBOXING */}
          {activeTab === 'empaque' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a44c7c]">
                  Experiencia de Regalo
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#382236] font-medium mt-1">
                  Empaque & Presentación
                </h2>
                <p className="text-xs text-[#735c71] mt-1 max-w-sm mx-auto">
                  Cada pieza de Bianca Atondo se entrega con dedicación, lista para crear una emoción inolvidable.
                </p>
              </div>

              {/* Packaging Photo */}
              <div className="rounded-3xl overflow-hidden border border-[#eed7e6] shadow-md bg-white">
                <img
                  src={packagingImg}
                  alt="Estuche de regalo rosa y lila Bianca Joyería"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#9a4b76] font-semibold">
                    <Sparkles className="w-4 h-4 text-[#b58a42]" />
                    <span>Incluido en cada compra especial</span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#392437] font-medium">
                    Estuche de Terciopelo Rosa & Tarjeta Dedicatoria
                  </h3>
                  <p className="text-xs text-[#6e586d] leading-relaxed">
                    Nuestras cajas en tonos rosa y lila cuentan con interior de suave terciopelo para proteger el brillo de tu joya. Además, incluimos una tarjeta con el mensaje de agradecimiento:
                  </p>
                  <blockquote className="p-3 bg-[#fdf8fa] rounded-xl border-l-2 border-[#ba5489] text-xs font-serif-luxury italic text-[#4f354a]">
                    “Gracias por ser parte de esta historia ♡”
                  </blockquote>
                </div>
              </div>

              {/* Order Gift Consultation CTA */}
              <div className="p-5 bg-gradient-to-r from-[#fbf0f6] to-[#f6ecf8] rounded-2xl border border-[#ecd2e3] space-y-3">
                <h4 className="font-serif-luxury text-lg text-[#3b2438] font-medium">
                  ¿Deseas personalizar tu regalo con un nombre o mensaje?
                </h4>
                <p className="text-xs text-[#715c6f] leading-relaxed">
                  Podemos agregar una dedicatoria escrita a mano y envoltorio con lazo para aniversario, cumpleaños o fecha especial.
                </p>
                <button
                  onClick={() => {
                    const msg = `Hola Bianca ✨ Vi su empaque de regalo en el catálogo móvil y me gustaría consultar por una pieza para regalar con dedicatoria especial.`;
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3 rounded-xl bg-[#ba5489] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-[#a84779]"
                >
                  <Gift className="w-4 h-4" />
                  <span>Consultar regalo por WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf5f8]/95 backdrop-blur-md border-t border-[#f0dde7] py-2 px-4">
          <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
            <button
              onClick={() => {
                setActiveTab('nfc-home');
                triggerHaptic(10);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                activeTab === 'nfc-home'
                  ? 'text-[#ba5489] font-bold'
                  : 'text-[#7e677b] hover:text-[#ba5489]'
              }`}
            >
              <Gem className="w-5 h-5" />
              <span className="text-[10px] mt-1">Inicio</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('catalogo');
                triggerHaptic(10);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                activeTab === 'catalogo'
                  ? 'text-[#ba5489] font-bold'
                  : 'text-[#7e677b] hover:text-[#ba5489]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] mt-1">Colección</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('empaque');
                triggerHaptic(10);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                activeTab === 'empaque'
                  ? 'text-[#ba5489] font-bold'
                  : 'text-[#7e677b] hover:text-[#ba5489]'
              }`}
            >
              <Gift className="w-5 h-5" />
              <span className="text-[10px] mt-1">Empaque</span>
            </button>

            <button
              onClick={() => {
                setIsCartOpen(true);
                triggerHaptic(15);
              }}
              className="flex flex-col items-center justify-center py-1 rounded-xl text-[#7e677b] hover:text-[#ba5489] relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#ba5489] text-white text-[9px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">Selección</span>
            </button>
          </div>
        </nav>
      </div>

      {/* MODAL 1: CART & WHATSAPP QUOTATION DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div
            className="w-full sm:max-w-md bg-[#fdf9fb] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#eed7e5] overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-1 bg-[#dec7d6] rounded-full mx-auto my-2.5 sm:hidden" />

            <div className="p-4 sm:p-5 border-b border-[#f1dce8] flex items-center justify-between bg-white">
              <div>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#392437] font-medium">
                  Tu Selección ♡
                </h3>
                <p className="text-[10px] text-[#866d81]">
                  Confirma disponibilidad y precios directamente por WhatsApp
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#faedf4] text-[#7d5d76] flex items-center justify-center hover:bg-[#edd2e3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {totalCartCount === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[#f8eaf2] text-[#ba5489] mx-auto flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-serif-luxury text-lg text-[#3b2539]">
                    Aún no has agregado piezas
                  </p>
                  <p className="text-xs text-[#7e677b] mt-1 max-w-xs mx-auto">
                    Toca las categorías o el botón (+) en el catálogo para armar tu consulta.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {Object.keys(cart)
                      .map(Number)
                      .filter((id) => (cart[id] || 0) > 0)
                      .map((id) => {
                        const product = products.find((p) => p.id === id);
                        if (!product) return null;
                        const qty = cart[id];

                        return (
                          <div
                            key={id}
                            className="p-2.5 bg-white rounded-xl border border-[#f2dfec] flex items-center justify-between gap-2.5 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={product.img}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#f7edf3]"
                              />
                              <div className="truncate">
                                <h4 className="text-xs font-semibold text-[#3b2739] truncate">
                                  {product.name}
                                </h4>
                                <span className="text-[10px] text-[#91798d] block">
                                  {product.price ? `$${product.price} MXN c/u` : 'Precio a confirmar'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 bg-[#faf2f7] px-2 py-0.5 rounded-full border border-[#f0dde9]">
                              <button
                                onClick={() => updateQuantity(id, -1)}
                                className="w-5 h-5 rounded-full bg-white text-[#7d5f77] flex items-center justify-center shadow-xs"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-bold text-[#3d283b] w-4 text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(id, 1)}
                                className="w-5 h-5 rounded-full bg-white text-[#7d5f77] flex items-center justify-center shadow-xs"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Estimated total if prices exist */}
                  {estimatedTotal > 0 && (
                    <div className="p-3 bg-[#fdf5f9] rounded-xl border border-[#eed2e2] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#5d3b55]">Total estimado:</span>
                      <span className="font-bold text-[#b58a42] text-sm">${estimatedTotal.toLocaleString('es-MX')} MXN</span>
                    </div>
                  )}

                  {/* Customer Information for WhatsApp Quote */}
                  <div className="space-y-2.5 pt-3 border-t border-[#f2dfec]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#986a8b] block">
                      Tus Datos de Consulta
                    </span>

                    <div>
                      <label className="text-[10px] text-[#796276] block mb-0.5">
                        Tu nombre (opcional)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej. Sofía Hernández"
                        className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#796276] block mb-0.5">
                        Preferencia de entrega
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                      >
                        <option value="Quiero consultar entrega">Quiero consultar entrega</option>
                        <option value="Recoger en punto de entrega">Recoger en punto de entrega</option>
                        <option value="Consultar envío a domicilio">Consultar envío a domicilio</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#796276] block mb-0.5">
                        Nota (talla, dedicatoria o color)
                      </label>
                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Ej. ¿Tienen disponible para entrega esta semana?"
                        className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {totalCartCount > 0 && (
              <div className="p-4 bg-white border-t border-[#f1dce8]">
                <button
                  onClick={handleSendOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#9e3a6a] hover:bg-[#8d325d] text-white text-xs font-semibold tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar selección por WhatsApp ↗</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: PRODUCT QUICK VIEW */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#eed7e5] overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative aspect-square bg-[#faf1f6]">
              <img
                src={selectedProduct.img}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#7d5d76] flex items-center justify-center shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-[#986629] bg-white/90 px-2 py-0.5 rounded-md border border-[#e9d6be]">
                {selectedProduct.tag}
              </span>

              {/* Watermark badge on modal photo */}
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs flex items-center gap-1.5 pointer-events-none select-none border border-white/20">
                <span className="w-3.5 h-3.5 rounded-full bg-white text-[#b58a42] text-[8px] font-bold font-serif-luxury flex items-center justify-center">B</span>
                <span className="text-[9px] tracking-wider font-semibold text-white/95 uppercase">Bianca Joyería</span>
              </div>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b35185]">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-serif-luxury text-xl font-medium text-[#352132] mt-0.5">
                    {selectedProduct.name}
                  </h3>
                </div>
                {selectedProduct.price && (
                  <span className="text-base font-bold text-[#b58a42]">
                    ${selectedProduct.price} MXN
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6f576b] leading-relaxed">
                {selectedProduct.desc}
              </p>

              <div className="p-3 bg-[#fdf9fb] rounded-xl border border-[#f3e1ed]">
                <span className="text-[10px] font-semibold text-[#8e5c80] block">
                  Materiales:
                </span>
                <p className="text-[11px] text-[#5f495c] mt-0.5 leading-relaxed">
                  {selectedProduct.material}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    addToCart(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#faedf4] text-[#ba5489] text-xs font-semibold hover:bg-[#ba5489] hover:text-white transition-colors"
                >
                  + Agregar a selección
                </button>
                <button
                  onClick={() => {
                    const priceNote = selectedProduct.price ? ` ($${selectedProduct.price} MXN)` : '';
                    const msg = `Hola Bianca ✨ Vi la pieza "${selectedProduct.name}" (${selectedProduct.category})${priceNote} en su catálogo. ¿Me confirmas existencias para compra?`;
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a54476] transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Consultar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QR CODE MODAL FOR SHARING IN-STORE */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-[#eed7e5]">
            <div className="flex justify-between items-center pb-1 border-b border-[#f6e9f1]">
              <div className="text-left">
                <span className="text-xs font-semibold text-[#8b3b68] uppercase tracking-wider block">
                  Enseña a una amiga o amigo ♡
                </span>
                <span className="text-[10px] text-[#8e768b]">
                  Escaneo instantáneo con cámara
                </span>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full bg-[#faedf4] text-[#7d5d76] flex items-center justify-center hover:bg-[#ebd0df] transition-colors"
                aria-label="Cerrar modal QR"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 100% Real Scannable QR Code */}
            <div className="py-2 flex flex-col items-center justify-center">
              <RealQRCode size={200} />
              <p className="text-[11px] font-medium text-[#50374c] mt-3">
                📸 Apunta la cámara de tu iPhone o Android hacia este código
              </p>
              <p className="text-[10px] text-[#876e83] max-w-xs mt-0.5">
                Se abrirá el catálogo digital de Bianca Joyería automáticamente sin instalar aplicaciones.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1 border-t border-[#f4e2ed]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Enlace copiado al portapapeles 📋');
                }}
                className="w-full py-2.5 rounded-xl bg-[#faedf4] text-[#ba5489] text-xs font-semibold hover:bg-[#ba5489] hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar enlace del catálogo
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartir por WhatsApp / Mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PHYSICAL NFC ACRYLIC STAND INFO */}
      {showNFCStandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eed7e5]">
            <div className="relative aspect-[4/3] bg-[#faf0f5]">
              <img
                src={nfcStandImg}
                alt="Atril expositor NFC para tienda"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowNFCStandModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#7d5d76] flex items-center justify-center shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <span className="text-[10px] uppercase font-semibold text-[#b58a42] tracking-wider block">
                Expositor Físico en Tienda / Eventos
              </span>
              <h3 className="font-serif-luxury text-xl font-medium text-[#382236]">
                Atril con Chip NFC Integrado
              </h3>
              <ul className="text-xs text-[#6e586d] space-y-1.5 leading-relaxed">
                <li>• <strong>En iPhone:</strong> Acerca la parte superior del teléfono al atril o tarjeta para abrir el catálogo.</li>
                <li>• <strong>En Android:</strong> Acerca el centro trasero del teléfono con NFC activo para ver las piezas al instante.</li>
              </ul>
              <button
                onClick={() => setShowNFCStandModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors"
              >
                Entendido, explorar joyas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADMIN PRODUCT MANAGER (Upload real products with watermark and prices to Cloud) */}
      <AdminProductManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onSaveProduct={handleSaveProductCloud}
        onDeleteProduct={handleDeleteProductCloud}
        onResetDefaults={handleResetDefaultsCloud}
      />

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#3a2336] text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xl border border-[#643f5b] flex items-center gap-2 animate-bounce-subtle"
        >
          <Check className="w-3.5 h-3.5 text-[#e5a7c9]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
