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
  Lock,
  SlidersHorizontal,
  Instagram,
  Sparkle,
} from 'lucide-react';

import heroImg from './assets/images/hero_jewelry_showcase_1791672703497.jpg';
import collarImg from './assets/images/product_collar_corazon_1791672717702.jpg';
import anillosImg from './assets/images/product_anillos_minimalistas_1791672744420.jpg';
import pulseraImg from './assets/images/product_pulsera_eslabones_1791672752809.jpg';
import aretesImg from './assets/images/product_aretes_delicados_1791672761293.jpg';
import packagingImg from './assets/images/packaging_box_unboxing_1791673252742.jpg';
import nfcStandImg from './assets/images/nfc_stand_display_1791673274611.jpg';
import nfcModelNeckImg from './assets/images/nfc_model_neck_1791678965592.jpg';
import nfcBottomJewelryImg from './assets/images/nfc_bottom_jewelry_1791678981253.jpg';
import { PinkGlitterCanvas } from './components/PinkGlitterCanvas';
import { RealQRCode } from './components/RealQRCode';
import { AdminProductManager, Product } from './components/AdminProductManager';
import {
  subscribeToProducts,
  saveProductToCloud,
  deleteProductFromCloud,
  resetCloudProductsToDefaults,
} from './services/productsService';
import {
  CategoryItem,
  DEFAULT_CATEGORIES,
  subscribeToCategories,
  saveCategoryToCloud,
  updateCategoryNameInCloud,
  deleteCategoryFromCloud,
} from './services/categoriesService';
import {
  buildExactWhatsAppMessage,
  saveOrderToCloud,
  generateOrderFolio,
  OrderItem,
  WHATSAPP_NUMBER,
} from './services/ordersService';

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
  const [showStoryModal, setShowStoryModal] = useState(false);
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

  // Custom Categories state (persisted in Firestore)
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  // Form states in cart for exact WhatsApp order
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Consultar envío a domicilio');
  const [orderNotes, setOrderNotes] = useState('');
  const [showOrderPreview, setShowOrderPreview] = useState(false);

  useEffect(() => {
    triggerHaptic([30, 20]);
    // Welcome pink glitter burst
    setGlitterTrigger((prev) => prev + 1);

    // Real-time synchronization from Cloud Firestore
    const unsubscribeProducts = subscribeToProducts(INITIAL_PRODUCTS, (updated) => {
      setProducts(updated);
    });

    const unsubscribeCategories = subscribeToCategories(DEFAULT_CATEGORIES, (updatedCategories) => {
      setCategories(updatedCategories);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
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

  const handleSaveCategoryCloud = async (cat: { id?: string; name: string; description?: string }) => {
    await saveCategoryToCloud(cat);
    showToast(`Categoría "${cat.name}" guardada en la nube ✨`);
  };

  const handleUpdateCategoryCloud = async (
    id: string,
    oldName: string,
    newName: string,
    newDesc?: string
  ) => {
    await updateCategoryNameInCloud(id, oldName, newName, newDesc);
    showToast(`Categoría "${newName}" actualizada en la nube ✨`);
  };

  const handleDeleteCategoryCloud = async (id: string) => {
    await deleteCategoryFromCloud(id);
    showToast('Categoría eliminada de la nube 🗑️');
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
        item.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.desc.toLowerCase().includes(term) ||
        item.material.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const handleCategoryCardClick = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('catalogo');
    playLuxuryChime();
    triggerHaptic([20, 20]);
    showToast(`Mostrando colección de ${cat} ✨`);
  };

  const currentCartOrderItems: OrderItem[] = useMemo(() => {
    return Object.keys(cart)
      .map(Number)
      .filter((id) => (cart[id] || 0) > 0)
      .map((id) => {
        const prod = products.find((p) => p.id === id);
        const qty = cart[id] || 1;
        const price = prod?.price;
        const subtotal = price ? price * qty : undefined;
        return {
          id,
          name: prod?.name || 'Joya',
          category: prod?.category || 'Joyería',
          material: prod?.material || 'Chapa de oro 14k',
          tag: prod?.tag || 'Exclusivo',
          price,
          qty,
          subtotal,
          img: prod?.img,
        };
      });
  }, [cart, products]);

  const handleSendOrder = () => {
    if (currentCartOrderItems.length === 0) {
      showToast('Selecciona al menos una joya primero');
      return;
    }

    const folio = generateOrderFolio();

    const message = buildExactWhatsAppMessage({
      folio,
      customerName,
      customerPhone,
      deliveryMethod,
      orderNotes,
      items: currentCartOrderItems,
      totalItems: totalCartCount,
      totalAmount: estimatedTotal,
    });

    // Save cloud backup in Firestore
    saveOrderToCloud({
      folio,
      customerName: customerName.trim() || 'Cliente de Catálogo Digital',
      customerPhone,
      deliveryMethod,
      orderNotes,
      items: currentCartOrderItems,
      totalItems: totalCartCount,
      totalAmount: estimatedTotal,
      createdAt: new Date().toISOString(),
      status: 'pendiente',
    });

    playLuxuryChime();
    triggerHaptic([30, 40, 20]);
    showToast(`¡Pedido #${folio} preparado con éxito! Abriendo WhatsApp 💬`);

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleOrderSingleProduct = (prod: Product) => {
    const folio = generateOrderFolio();
    const item: OrderItem = {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      material: prod.material,
      tag: prod.tag,
      price: prod.price,
      qty: 1,
      subtotal: prod.price,
      img: prod.img,
    };

    const message = buildExactWhatsAppMessage({
      folio,
      customerName: customerName.trim() || 'Cliente de Catálogo Digital',
      customerPhone,
      deliveryMethod: 'Quiero coordinar entrega directa',
      orderNotes: `Interés directo en comprar la pieza "${prod.name}"`,
      items: [item],
      totalItems: 1,
      totalAmount: prod.price || 0,
    });

    saveOrderToCloud({
      folio,
      customerName: customerName.trim() || 'Cliente de Catálogo Digital',
      customerPhone,
      deliveryMethod: 'Quiero coordinar entrega directa',
      orderNotes: `Interés directo en comprar la pieza "${prod.name}"`,
      items: [item],
      totalItems: 1,
      totalAmount: prod.price || 0,
      createdAt: new Date().toISOString(),
      status: 'pendiente',
    });

    playLuxuryChime();
    triggerHaptic([20, 30]);
    showToast(`¡Pedido #${folio} de "${prod.name}" listo! Abriendo WhatsApp ✨`);

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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
            {/* Admin trigger button: Subir Joyas con Marca de Agua (Protegido por PIN) */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-2.5 py-1.5 rounded-full bg-white border border-[#eed7e6] text-[#863760] text-xs font-semibold hover:bg-[#faedf4] transition-colors inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Administrar catálogo (Requiere PIN 19923006)"
            >
              <Lock className="w-3 h-3 text-[#ba5489]" />
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
          {/* TAB 1: NFC HOME - The Exact Mobile Screen matching NFC Tap reference */}
          {activeTab === 'nfc-home' && (
            <div className="relative -mx-4 -mt-4 px-4 pt-4 pb-6 overflow-hidden animate-fade-in bg-gradient-to-b from-[#fef5f9] via-[#fdf2f7] to-[#faedf4]">
              {/* Soft decorative background accents */}
              <div className="absolute top-0 left-0 w-44 h-44 rounded-full bg-gradient-to-br from-[#f8d7e9] via-[#ecd8f3] to-transparent opacity-60 blur-2xl pointer-events-none" />
              <div className="absolute top-80 right-0 w-60 h-60 rounded-full bg-gradient-to-tl from-[#fce2ee] via-[#f7d9ec] to-transparent opacity-70 blur-3xl pointer-events-none" />

              {/* Top Section: Monogram Logo & Right Jewelry Model Photo */}
              <div className="relative pt-2 pb-3">
                {/* Dainty hearts & gold sparkles in background */}
                <div className="absolute top-2 left-6 text-[#e89dbd] opacity-75">
                  <Heart className="w-4 h-4 fill-none stroke-current" />
                </div>
                <div className="absolute top-24 left-4 text-[#dfb26b] opacity-70 animate-pulse">
                  <Sparkle className="w-3.5 h-3.5 fill-[#ecc577]" />
                </div>
                <div className="absolute top-36 left-2 text-[#e89dbd] opacity-60">
                  <Heart className="w-3.5 h-3.5 fill-none stroke-current" />
                </div>
                <div className="absolute top-52 right-6 text-[#dfb26b] opacity-80">
                  <Sparkle className="w-4 h-4 fill-[#ecc577]" />
                </div>
                <div className="absolute top-4 right-14 text-[#e89dbd] opacity-70">
                  <Heart className="w-3 h-3 fill-none stroke-current" />
                </div>

                {/* Right Floating Model Photo (masked luxury organic cutout) */}
                <div className="absolute -top-1 -right-4 w-40 sm:w-48 h-56 sm:h-64 pointer-events-none select-none z-0">
                  <div className="w-full h-full relative">
                    <img
                      src={nfcModelNeckImg}
                      alt="Modelo luciendo joyería fina Bianca Atondo"
                      className="w-full h-full object-cover rounded-bl-[50px] opacity-90 drop-shadow-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#fdf3f8]/40 to-[#fdf3f8]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fdf2f7] via-transparent to-transparent" />
                  </div>
                </div>

                {/* Brand Centerpiece Emblem & Monogram */}
                <div className="relative z-10 text-center max-w-[270px] sm:max-w-xs mx-auto pt-2">
                  <button
                    type="button"
                    onClick={triggerSparkles}
                    className="relative w-24 h-24 mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform group"
                    title="Toca el monograma para activar brillantinas rosas ✨"
                    aria-label="Toca el monograma de Bianca Atondo para activar destellos"
                  >
                    {/* Soft ambient glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#fadfe9] via-[#f5e3fc] to-[#fce4ee] opacity-80 blur-md group-hover:opacity-100 transition-opacity" />

                    {/* Orbiting Ring Ellipse */}
                    <div className="absolute w-20 h-10 rounded-[50%] border-[2px] border-[#cbb3d9] rotate-[-25deg] pointer-events-none group-hover:rotate-[-20deg] transition-transform" />
                    <div className="absolute w-20 h-10 rounded-[50%] border-[1.5px] border-[#dfb672] rotate-[-25deg] translate-x-0.5 translate-y-0.5 pointer-events-none" />

                    {/* Sparkle Star ✦ */}
                    <div className="absolute top-1 right-2 text-[#d19c3c] animate-pulse">
                      <Sparkles className="w-4 h-4 fill-[#ecc577]" />
                    </div>

                    {/* Small Heart ♡ */}
                    <div className="absolute bottom-2 right-2 text-[#ba5489]">
                      <Heart className="w-3.5 h-3.5 fill-[#e59fc4] text-[#ba5489]" />
                    </div>

                    {/* Golden 'B' Monogram */}
                    <div className="relative z-10 font-serif-luxury text-6xl font-bold tracking-tight text-[#b58a42] drop-shadow-xs select-none">
                      <span className="gold-gradient-text">B</span>
                    </div>
                  </button>

                  {/* Brand Typography */}
                  <div className="mt-1 space-y-0.5">
                    <h1 className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.22em] font-semibold text-[#8b3b68] uppercase">
                      BIANCA
                    </h1>
                    <p className="font-script-luxury text-3xl sm:text-4xl text-[#5e3a57] -mt-1 font-normal tracking-wide">
                      <span className="text-4xl sm:text-5xl font-medium inline-block align-baseline">A</span>tondo Peñuelas
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] tracking-[0.35em] font-semibold text-[#ba5489] uppercase mt-0.5">
                      <span className="text-[10px]">♡</span>
                      <span>JOYERÍA</span>
                      <span className="text-[10px]">♡</span>
                    </div>
                  </div>
                </div>

                {/* Welcome Greeting Banner */}
                <div className="relative z-10 text-center mt-5 space-y-1">
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#963c6c] tracking-wide">
                    ¡Bienvenida!
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#553b51] font-medium max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
                    Gracias por acercar tu celular.<br />
                    Elige una opción para comenzar
                  </p>
                  <div className="text-center pt-0.5 text-[#ba5489]">
                    <span className="text-xs">♡</span>
                  </div>
                </div>
              </div>

              {/* THE 4 PILLARS / ACTION BUTTONS (Exact replica of the scanned screen) */}
              <div className="relative z-10 space-y-3.5 max-w-md mx-auto pt-1">
                {/* CARD 1: Entrar a Instagram */}
                <a
                  href="https://www.instagram.com/bianca.atondo.joyeria/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic(15)}
                  className="luxury-glass-card rounded-2xl p-4 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
                        <Instagram className="w-7 h-7 text-[#d62976]" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#541e3a] group-hover:text-[#963c6c] transition-colors leading-tight">
                        Entrar a Instagram
                      </h3>
                      <p className="text-xs text-[#7c6276] leading-snug mt-0.5">
                        Síguenos y descubre más de nuestras joyas
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#c98db1] group-hover:text-[#ba5489] group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>

                {/* CARD 2: Contactar por WhatsApp */}
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="w-full text-left luxury-glass-card rounded-2xl p-4 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-[#eafaf1] border border-[#a7f3d0] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-xs">
                        <MessageCircle className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#541e3a] group-hover:text-[#963c6c] transition-colors leading-tight">
                        Contactar por WhatsApp
                      </h3>
                      <p className="text-xs text-[#7c6276] leading-snug mt-0.5">
                        Escríbenos directamente para preguntas y pedidos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#c98db1] group-hover:text-[#ba5489] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* CARD 3: Ver productos (Catálogo Completo) */}
                <button
                  type="button"
                  onClick={() => {
                    playLuxuryChime();
                    triggerHaptic([20, 20]);
                    setSelectedCategory('Todos');
                    setActiveTab('catalogo');
                  }}
                  className="w-full text-left luxury-glass-card rounded-2xl p-4 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-[#fdf5f9] border border-[#f1d3e4] p-0.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={collarImg}
                        alt="Collar corazón dorado"
                        className="w-11 h-11 object-cover rounded-xl"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#541e3a] group-hover:text-[#963c6c] transition-colors leading-tight">
                        Ver productos
                      </h3>
                      <p className="text-xs text-[#7c6276] leading-snug mt-0.5">
                        Explora nuestro catálogo y elige tus piezas favoritas
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#c98db1] group-hover:text-[#ba5489] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* CARD 4: Presentación de Bianca Atondo Joyería */}
                <button
                  type="button"
                  onClick={() => {
                    playLuxuryChime();
                    triggerHaptic(15);
                    setShowStoryModal(true);
                  }}
                  className="w-full text-left luxury-glass-card rounded-2xl p-4 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-[#faedf4] border border-[#ecd0e1] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-serif-luxury font-bold text-xl text-[#b58a42] shadow-2xs">
                        B
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#541e3a] group-hover:text-[#963c6c] transition-colors leading-tight">
                        Presentación de Bianca Atondo Joyería
                      </h3>
                      <p className="text-xs text-[#7c6276] leading-snug mt-0.5">
                        Conoce nuestra historia, valores y compromiso
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#c98db1] group-hover:text-[#ba5489] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>

              {/* Bottom Decorative Artwork & Quote (Matching Reference) */}
              <div className="relative pt-6 pb-4 text-center">
                <div className="relative max-w-sm mx-auto">
                  {/* Decorative Jewelry Banner Image */}
                  <div className="relative w-full h-32 rounded-3xl overflow-hidden shadow-xs border border-[#eed4e4]/80">
                    <img
                      src={nfcBottomJewelryImg}
                      alt="Joyería fina en satín rosa"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fef5f9]/85 via-transparent to-transparent" />
                  </div>

                  {/* Script text over artwork */}
                  <div className="mt-3 space-y-1">
                    <p className="font-script-luxury text-3xl sm:text-4xl text-[#783e60] leading-none">
                      Detalles que hacen brillar tu historia
                    </p>
                    <div className="flex items-center justify-center gap-3 text-[#c4779e] pt-1">
                      <span className="w-8 h-[1px] bg-[#e6b3cb]" />
                      <span className="text-xs">♡</span>
                      <span className="w-8 h-[1px] bg-[#e6b3cb]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle quick tools pill under image */}
              <div className="flex items-center justify-center gap-2 pt-1 pb-2">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-[#edd5e4] text-[#863760] text-[11px] font-semibold hover:bg-white inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3 h-3 text-[#ba5489]" />
                  <span>Compartir con QR</span>
                </button>
                <button
                  onClick={downloadVCard}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-[#edd5e4] text-[#863760] text-[11px] font-semibold hover:bg-white inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <UserPlus className="w-3 h-3 text-[#ba5489]" />
                  <span>Guardar contacto</span>
                </button>
              </div>

              {/* Footer Copyright Strip matching image */}
              <div className="-mx-4 -mb-6 mt-4 py-3 bg-[#e89dbd]/80 backdrop-blur-xs text-center border-t border-[#df8eaf]">
                <div className="flex items-center justify-center gap-1.5 text-white text-[11px] font-medium tracking-wide">
                  <Heart className="w-3 h-3 fill-white" />
                  <span>© 2025 Bianca Atondo Joyería</span>
                </div>
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
                    className="px-2.5 py-1.5 rounded-xl bg-[#faedf4] text-[#ba5489] border border-[#f0d0e3] text-xs font-semibold hover:bg-[#ba5489] hover:text-white transition-colors inline-flex items-center gap-1.5"
                    title="Administrar catálogo con PIN (19923006)"
                  >
                    <Lock className="w-3 h-3" />
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
                {['Todos', ...categories.map((c) => c.name), 'Para regalar'].map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
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
                    {currentCartOrderItems.map((item) => {
                      const subtotalFormatted = item.subtotal
                        ? `$${item.subtotal.toLocaleString('es-MX')} MXN`
                        : 'A cotizar';

                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-white rounded-2xl border border-[#f2dfec] flex items-center justify-between gap-3 shadow-2xs hover:border-[#e7c7dc] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#f7edf3] border border-[#f0dce8]"
                            />
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] uppercase font-bold text-[#ba5489] bg-[#fdf2f8] px-1.5 py-0.5 rounded-md border border-[#f9dbe9]">
                                  {item.category}
                                </span>
                                <span className="text-[9px] text-[#93788f]">
                                  {item.tag}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-[#3b2739] truncate mt-0.5">
                                {item.name}
                              </h4>
                              <div className="text-[11px] text-[#84677f] flex items-center gap-1 mt-0.5">
                                <span>{item.price ? `$${item.price} c/u` : 'Precio a confirmar'}</span>
                                <span>·</span>
                                <span className="font-bold text-[#b58a42]">Subtotal: {subtotalFormatted}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 bg-[#faf2f7] px-2 py-1 rounded-full border border-[#f0dde9]">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded-full bg-white text-[#7d5f77] flex items-center justify-center shadow-xs hover:bg-[#faedf4]"
                              title="Disminuir cantidad"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-bold text-[#3d283b] w-4 text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded-full bg-white text-[#7d5f77] flex items-center justify-center shadow-xs hover:bg-[#faedf4]"
                              title="Aumentar cantidad"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Exact Total Breakdown */}
                  <div className="p-3.5 bg-gradient-to-br from-[#fdf5f9] to-[#faf0f6] rounded-2xl border border-[#eed2e2] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#715c6f]">
                      <span>Piezas solicitadas:</span>
                      <span className="font-semibold font-mono text-[#3e273b]">
                        {totalCartCount} {totalCartCount === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#f0d8e6] text-xs">
                      <span className="font-bold text-[#442c41] uppercase tracking-wider text-[11px]">
                        Total Exacto a Pagar:
                      </span>
                      <span className="font-bold text-[#b58a42] text-base">
                        ${estimatedTotal.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  </div>

                  {/* Customer Information for WhatsApp Quote */}
                  <div className="space-y-3 pt-3 border-t border-[#f2dfec]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#98537b] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#ba5489]" />
                        <span>Datos para tu Pedido Oficial</span>
                      </span>
                      <span className="text-[10px] text-[#16a34a] font-semibold bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                        WhatsApp Oficial
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-[#573d52] block mb-1">
                          Tu nombre completo *
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
                        <label className="text-[10px] font-semibold text-[#573d52] block mb-1">
                          Teléfono de contacto (opcional)
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ej. 687 123 4567"
                          className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[#573d52] block mb-1">
                        Modalidad de entrega
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                      >
                        <option value="Envío a domicilio">Envío a domicilio</option>
                        <option value="Recoger en punto de entrega local">Recoger en punto de entrega local</option>
                        <option value="Entrega personalizada">Entrega personalizada</option>
                        <option value="Para regalo (incluir empaque especial de terciopelo y dedicatoria)">Para regalo (incluir empaque especial y dedicatoria)</option>
                        <option value="Quiero consultar disponibilidad primero">Quiero consultar disponibilidad primero</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[#573d52] block mb-1">
                        Especificaciones (talla de anillo, dedicatoria o dudas)
                      </label>
                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Ej. Talla 7 para los anillos, o dedicatoria para tarjeta de regalo."
                        className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                      />
                    </div>

                    {/* WhatsApp Message Preview Toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOrderPreview(!showOrderPreview)}
                        className="text-[11px] text-[#ba5489] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{showOrderPreview ? 'Ocultar vista previa del mensaje' : 'Ver formato exacto del pedido para WhatsApp'}</span>
                        <span className="text-[10px]">{showOrderPreview ? '▲' : '▼'}</span>
                      </button>

                      {showOrderPreview && (
                        <div className="mt-2 p-3 bg-white rounded-xl border border-[#ecd2e1] text-[11px] font-mono text-[#432d40] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto shadow-inner bg-[#fffdfd]">
                          {buildExactWhatsAppMessage({
                            folio: 'BA-PREVIEW',
                            customerName: customerName || 'Nombre del cliente',
                            customerPhone,
                            deliveryMethod,
                            orderNotes,
                            items: currentCartOrderItems,
                            totalItems: totalCartCount,
                            totalAmount: estimatedTotal,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {totalCartCount > 0 && (
              <div className="p-4 bg-white border-t border-[#f1dce8] space-y-2">
                <button
                  onClick={handleSendOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enviar Pedido Exacto por WhatsApp ↗</span>
                </button>
                <p className="text-[10px] text-center text-[#856b81] leading-relaxed">
                  Se enviará automáticamente a Bianca el folio, lista de piezas, cantidades, precios y datos de entrega.
                </p>
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
                    handleOrderSingleProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  Comprar por WhatsApp ↗
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

      {/* MODAL 4B: PRESENTACIÓN DE BIANCA ATONDO JOYERÍA (Historia, valores y compromiso) */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eed7e5] max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header with Luxury Brand Banner */}
            <div className="relative p-5 pb-4 bg-gradient-to-br from-[#fef5f9] via-[#f9e9f3] to-[#faeaf4] border-b border-[#f1dce9] text-center">
              <button
                onClick={() => setShowStoryModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#7d5d76] flex items-center justify-center shadow-xs hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-white border border-[#eed3e3] mx-auto flex items-center justify-center shadow-xs">
                <span className="font-serif-luxury font-bold text-3xl gold-gradient-text">
                  B
                </span>
              </div>

              <h3 className="font-serif-luxury text-2xl font-semibold text-[#8b3b68] uppercase tracking-[0.2em] mt-2">
                BIANCA
              </h3>
              <p className="font-script-luxury text-3xl text-[#5e3a57] -mt-1 tracking-wide">
                <span className="text-4xl font-medium inline-block align-baseline">A</span>tondo Peñuelas
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[9px] tracking-[0.3em] font-semibold text-[#ba5489] uppercase mt-0.5">
                <span>♡</span>
                <span>JOYERÍA</span>
                <span>♡</span>
              </div>
            </div>

            {/* Story, Values & Commitment Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#5f445b] leading-relaxed">
              <div className="text-center p-3 rounded-2xl bg-[#fdf5f9] border border-[#f3d9e8]">
                <p className="font-script-luxury text-2xl text-[#8e3a6a]">
                  “Detalles que hacen brillar tu historia ♡”
                </p>
                <p className="text-[10px] text-[#785973] mt-1 font-medium">
                  Creaciones pensadas para acompañar tus instantes más memorables.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif-luxury text-base font-bold text-[#8b3b68] uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfb26b]" />
                  <span>Nuestra Historia</span>
                </h4>
                <p className="text-[#6d5169]">
                  Bianca Atondo Joyería nace de la pasión por transformar el brillo sutil de los metales preciosos en piezas cotidianas llenas de significado. Cada diseño es seleccionado cuidadosamente para resaltar la elegancia auténtica de quien lo porta.
                </p>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#f4e4ee]">
                <h4 className="font-serif-luxury text-base font-bold text-[#8b3b68] uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#ba5489]" />
                  <span>Nuestros Valores</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#faf2f7] border border-[#f0dae8]">
                    <strong className="text-[#863760] block font-semibold">Exclusividad</strong>
                    <span className="text-[#7c6377]">Diseños finos y atemporales con acabados de primera.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#faf2f7] border border-[#f0dae8]">
                    <strong className="text-[#863760] block font-semibold">Calidad Real</strong>
                    <span className="text-[#7c6377]">Chapa de oro 14k y materiales hipoalergénicos duraderos.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#faf2f7] border border-[#f0dae8]">
                    <strong className="text-[#863760] block font-semibold">Empaque Especial</strong>
                    <span className="text-[#7c6377]">Cajas y estuches listos para regalar o autoregalarse.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#faf2f7] border border-[#f0dae8]">
                    <strong className="text-[#863760] block font-semibold">Trato Personal</strong>
                    <span className="text-[#7c6377]">Atención directa de Bianca para orientarte y asesorarte.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-[#f4e4ee]">
                <h4 className="font-serif-luxury text-base font-bold text-[#8b3b68] uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Nuestro Compromiso</span>
                </h4>
                <p className="text-[#6d5169]">
                  Te garantizamos piezas revisadas detalle a detalle, atención transparente sobre existencias y coordinación rápida de entregas personales y envíos seguros.
                </p>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStoryModal(false);
                    setSelectedCategory('Todos');
                    setActiveTab('catalogo');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#9e3a6a] hover:bg-[#8d325d] text-white text-xs font-semibold tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explorar el Catálogo de Joyas ↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStoryModal(false);
                    handleDirectWhatsApp();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold tracking-wider shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Escribirle a Bianca por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADMIN PRODUCT MANAGER (Upload real products with watermark, prices & custom categories to Cloud) */}
      <AdminProductManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        onSaveProduct={handleSaveProductCloud}
        onDeleteProduct={handleDeleteProductCloud}
        onResetDefaults={handleResetDefaultsCloud}
        onSaveCategory={handleSaveCategoryCloud}
        onUpdateCategory={handleUpdateCategoryCloud}
        onDeleteCategory={handleDeleteCategoryCloud}
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
