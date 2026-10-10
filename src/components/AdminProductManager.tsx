/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Camera,
  Cloud,
  Loader2,
} from 'lucide-react';
import { applyWatermarkToImage } from '../utils/watermark';

export interface Product {
  id: number;
  name: string;
  category: 'Collares' | 'Anillos' | 'Pulseras' | 'Aretes';
  price?: number;
  desc: string;
  material: string;
  tag: string;
  img: string;
}

interface AdminProductManagerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

export function AdminProductManager({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  onResetDefaults,
}: AdminProductManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Collares' | 'Anillos' | 'Pulseras' | 'Aretes'>('Collares');
  const [price, setPrice] = useState<string>('450');
  const [hasPrice, setHasPrice] = useState(true);
  const [desc, setDesc] = useState('');
  const [material, setMaterial] = useState('Chapa de oro 14k hipoalergénico');
  const [tag, setTag] = useState('Nuevo');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setErrorMsg(null);
      // Auto-stamp watermark
      const watermarked = await applyWatermarkToImage(file);
      setImagePreview(watermarked);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo procesar la foto. Prueba con otra imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price !== undefined ? String(p.price) : '');
    setHasPrice(p.price !== undefined && p.price > 0);
    setDesc(p.desc);
    setMaterial(p.material);
    setTag(p.tag);
    setImagePreview(p.img);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Collares');
    setPrice('450');
    setHasPrice(true);
    setDesc('');
    setMaterial('Chapa de oro 14k hipoalergénico');
    setTag('Nuevo');
    setImagePreview('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la joya es obligatorio.');
      return;
    }
    if (!imagePreview) {
      setErrorMsg('Por favor selecciona una foto para la joya.');
      return;
    }

    const numericPrice = hasPrice && price ? parseFloat(price) : undefined;
    const prodId = editingId !== null ? editingId : Date.now();

    const productPayload: Product = {
      id: prodId,
      name: name.trim(),
      category,
      price: numericPrice,
      desc: desc.trim() || 'Pieza exclusiva de alta joyería.',
      material: material.trim() || 'Chapa de oro 14k',
      tag: tag.trim() || 'Nuevo',
      img: imagePreview,
    };

    try {
      setIsSavingToCloud(true);
      setErrorMsg(null);
      await onSaveProduct(productPayload);
      handleResetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al guardar en la nube. Revisa tu conexión a internet.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Segura que deseas eliminar esta pieza de la base de datos en la nube?')) {
      try {
        setIsSavingToCloud(true);
        await onDeleteProduct(id);
        if (editingId === id) handleResetForm();
      } catch (err) {
        console.error(err);
        alert('Error al eliminar de la nube.');
      } finally {
        setIsSavingToCloud(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#eed7e5] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#f0dce7] bg-[#fdf9fb] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#ba5489] text-white flex items-center justify-center font-serif-luxury font-bold text-sm">
                B
              </span>
              <h2 className="font-serif-luxury text-xl sm:text-2xl text-[#392437] font-medium">
                Catálogo Global en la Nube
              </h2>
            </div>
            <p className="text-[11px] text-[#846b7f] mt-0.5 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Base de datos en tiempo real: Cualquier cambio es visible en cualquier celular del mundo.</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8eaf2] text-[#7d5d76] flex items-center justify-center hover:bg-[#edd2e3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#faf4f8] border border-[#eed9e7] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1dce9]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a04e79] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                {editingId ? 'Editar Pieza en la Nube' : 'Cargar Joya a la Nube (con Marca de Agua)'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[11px] text-[#95547b] hover:underline"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-[#fee2e2] text-[#991b1b] rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Photo Uploader with Auto-Watermark */}
            <div>
              <label className="text-xs font-semibold text-[#4b3347] block mb-1.5">
                Foto de la Joya (Estampa Automáticamente la Marca de Agua Oficial)
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-44 h-44 rounded-2xl border-2 border-dashed border-[#e3bfd5] bg-white hover:bg-[#fdf9fc] cursor-pointer flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group shadow-xs transition-colors shrink-0"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Vista previa con marca de agua"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium rounded-xl">
                        Cambiar foto 📷
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#fceaf3] text-[#ba5489] flex items-center justify-center mb-2">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[#8b3b68]">Subir foto</span>
                      <span className="text-[10px] text-[#9a8094] mt-0.5">
                        Toma una foto o elige de tu galería
                      </span>
                    </>
                  )}
                  {isProcessingImage && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs font-semibold text-[#ba5489]">
                      Estampando marca de agua…
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex-1 space-y-2 text-xs text-[#715c6f] leading-relaxed">
                  <div className="p-3 bg-white rounded-xl border border-[#f0dde9]">
                    <span className="font-semibold text-[#8b3b68] block mb-1">
                      ✨ Marca de Agua Oficial Automática:
                    </span>
                    <p className="text-[11px]">
                      Al seleccionar cualquier foto desde tu celular o computadora, el sistema le estampa automáticamente el sello de <strong>Bianca Atondo Joyería</strong> en la esquina inferior y la sincroniza en la base de datos en la nube.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields: Name, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                  Nombre de la Joya *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Collar Corazón Esmeralda"
                  className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product['category'])}
                  className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                >
                  <option value="Collares">Collares</option>
                  <option value="Anillos">Anillos</option>
                  <option value="Pulseras">Pulseras</option>
                  <option value="Aretes">Aretes</option>
                </select>
              </div>
            </div>

            {/* Price & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#50374b]">
                    Precio en Pesos ($ MXN)
                  </label>
                  <label className="text-[10px] text-[#866d81] flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPrice}
                      onChange={(e) => setHasPrice(e.target.checked)}
                      className="rounded accent-[#ba5489]"
                    />
                    Tiene precio fijo
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9e7d95]">
                    $
                  </span>
                  <input
                    type="number"
                    disabled={!hasPrice}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={hasPrice ? '350' : 'Precio bajo consulta'}
                    className={`w-full pl-7 pr-12 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489] ${
                      !hasPrice ? 'opacity-50 bg-gray-50' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#9e7d95]">
                    MXN
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                  Etiqueta / Distintivo
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Favorito">Favorito</option>
                  <option value="Clásico">Clásico</option>
                  <option value="Elegante">Elegante</option>
                  <option value="Esencial">Esencial</option>
                  <option value="Regalo">Regalo</option>
                  <option value="Para combinar">Para combinar</option>
                  <option value="Versátil">Versátil</option>
                </select>
              </div>
            </div>

            {/* Materials and Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                  Materiales
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ej. Chapa de oro 14k con circonias"
                  className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                  Descripción breve
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ej. Detalle delicado para uso diario."
                  className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessingImage || isSavingToCloud}
                className="w-full py-3 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSavingToCloud ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en la nube mundial…</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>{editingId ? 'Actualizar en la Nube' : 'Publicar en la Nube Mundial'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Current Products List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8b3b68]">
                Joyas Sincronizadas ({products.length})
              </span>
              <button
                onClick={async () => {
                  if (window.confirm('¿Restablecer el catálogo de la nube a la colección inicial?')) {
                    setIsSavingToCloud(true);
                    await onResetDefaults();
                    setIsSavingToCloud(false);
                  }
                }}
                disabled={isSavingToCloud}
                className="text-[10px] text-[#97587f] hover:underline flex items-center gap-1"
                title="Restaura la colección inicial en la nube"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer colección inicial
              </button>
            </div>

            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-white rounded-2xl border border-[#eedce7] flex items-center justify-between gap-3 shadow-2xs hover:border-[#dfb8d2] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#f8ebf3]">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#3b2739] truncate">{p.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#faf0f5] text-[#964273] font-semibold border border-[#eed2e2]">
                          {p.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#866d81] mt-0.5">
                        {p.price ? (
                          <span className="font-bold text-[#b58a42]">${p.price} MXN</span>
                        ) : (
                          <span>Precio por confirmar</span>
                        )}
                        <span className="mx-1.5">·</span>
                        <span>{p.tag}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="p-1.5 rounded-lg text-[#7c5f76] hover:bg-[#faedf4] hover:text-[#ba5489]"
                      title="Editar pieza"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-[#991b1b] hover:bg-[#fee2e2]"
                      title="Eliminar pieza"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fdf9fb] border-t border-[#f0dce7] flex items-center justify-between text-xs text-[#826a7e]">
          <span className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Base de datos en la nube (Firestore) conectada.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#ba5489] text-white font-semibold hover:bg-[#a84779] transition-colors"
          >
            Listo, volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
