/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Cloud,
  Loader2,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  CloudUpload,
  AlertCircle,
  Tag,
  FolderPlus,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { applyWatermarkToImage } from '../utils/watermark';
import {
  uploadImageToFirebaseStorage,
  StorageUploadProgress,
} from '../services/storageService';
import { CategoryItem } from '../services/categoriesService';

export interface Product {
  id: number;
  name: string;
  category: string;
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
  categories: CategoryItem[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onSaveCategory: (category: { id?: string; name: string; description?: string }) => Promise<void>;
  onUpdateCategory: (categoryId: string, oldName: string, newName: string, newDesc?: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
}

const CORRECT_ADMIN_PIN = '19923006';

export function AdminProductManager({
  isOpen,
  onClose,
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
  onResetDefaults,
  onSaveCategory,
  onUpdateCategory,
  onDeleteCategory,
}: AdminProductManagerProps) {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tab state: 'products' | 'categories'
  const [adminTab, setAdminTab] = useState<'products' | 'categories'>('products');

  // Product Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(() => {
    return categories[0]?.name || 'Collares';
  });
  const [price, setPrice] = useState<string>('450');
  const [hasPrice, setHasPrice] = useState(true);
  const [desc, setDesc] = useState('');
  const [material, setMaterial] = useState('Chapa de oro 14k hipoalergénico');
  const [tag, setTag] = useState('Nuevo');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick category inline creator in product form
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [isQuickAddingCategory, setIsQuickAddingCategory] = useState(false);

  // Category Manager Tab states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string>('');
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormDesc, setCategoryFormDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryFilterInAdmin, setCategoryFilterInAdmin] = useState<string>('Todos');

  // Firebase Storage visual progress state
  const [uploadProgress, setUploadProgress] = useState<StorageUploadProgress>({
    percent: 0,
    statusText: '',
    bytesTransferred: 0,
    totalBytes: 0,
    phase: 'idle',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showTempSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Count products per category
  const productCountPerCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      const catKey = p.category.toLowerCase().trim();
      counts[catKey] = (counts[catKey] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Filtered products inside admin view
  const adminFilteredProducts = useMemo(() => {
    if (categoryFilterInAdmin === 'Todos') return products;
    return products.filter(
      (p) => p.category.toLowerCase().trim() === categoryFilterInAdmin.toLowerCase().trim()
    );
  }, [products, categoryFilterInAdmin]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === CORRECT_ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError(false);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setErrorMsg(null);

      // Step 1: Initialize watermark phase
      setUploadProgress({
        percent: 15,
        statusText: '1/3 Estampando marca de agua oficial Bianca Atondo...',
        bytesTransferred: 0,
        totalBytes: file.size,
        phase: 'watermark',
      });

      // Auto-stamp watermark
      const watermarked = await applyWatermarkToImage(file);
      setImagePreview(watermarked);

      // Step 2 & 3: Upload to Firebase Storage with live progress updates
      setUploadProgress((prev) => ({
        ...prev,
        percent: 25,
        statusText: '2/3 Conectando con Firebase Storage...',
        phase: 'uploading',
      }));

      const storageUrl = await uploadImageToFirebaseStorage(watermarked, (prog) => {
        setUploadProgress(prog);
      });

      // Save the finalized permanent cloud URL
      setImagePreview(storageUrl);
    } catch (err) {
      console.error('Error during image watermarking or storage upload:', err);
      setUploadProgress({
        percent: 0,
        statusText: 'Error en la carga de imagen',
        bytesTransferred: 0,
        totalBytes: 0,
        phase: 'error',
      });
      setErrorMsg('No se pudo procesar o subir la foto. Prueba con otra imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price !== undefined ? String(p.price) : '');
    setHasPrice(p.price !== undefined && p.price > 0);
    setDesc(p.desc);
    setMaterial(p.material);
    setTag(p.tag);
    setImagePreview(p.img);
    setAdminTab('products');
    setUploadProgress({
      percent: 100,
      statusText: 'Imagen sincronizada en la nube',
      bytesTransferred: 0,
      totalBytes: 0,
      phase: 'completed',
      downloadUrl: p.img,
    });
  };

  const handleResetProductForm = () => {
    setEditingId(null);
    setName('');
    setCategory(categories[0]?.name || 'Collares');
    setPrice('450');
    setHasPrice(true);
    setDesc('');
    setMaterial('Chapa de oro 14k hipoalergénico');
    setTag('Nuevo');
    setImagePreview('');
    setErrorMsg(null);
    setShowQuickAddCategory(false);
    setQuickCategoryName('');
    setUploadProgress({
      percent: 0,
      statusText: '',
      bytesTransferred: 0,
      totalBytes: 0,
      phase: 'idle',
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!name.trim()) {
      setErrorMsg('El nombre de la joya es obligatorio.');
      return;
    }
    if (!imagePreview) {
      setErrorMsg('Por favor selecciona una foto para la joya.');
      return;
    }
    if (uploadProgress.phase === 'uploading' || uploadProgress.phase === 'watermark') {
      setErrorMsg('Por favor espera a que termine de cargarse la imagen a Firebase Storage.');
      return;
    }

    const numericPrice = hasPrice && price ? parseFloat(price) : undefined;
    const prodId = editingId !== null ? editingId : Date.now();

    const productPayload: Product = {
      id: prodId,
      name: name.trim(),
      category: category.trim() || 'Collares',
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
      showTempSuccess(
        editingId ? `Joya "${productPayload.name}" actualizada en la nube` : `Nueva joya publicada en la nube`
      );
      handleResetProductForm();
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al guardar en la nube. Revisa tu conexión a internet.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!isAuthenticated) return;
    if (window.confirm('¿Segura que deseas eliminar esta pieza de la base de datos en la nube?')) {
      try {
        setIsSavingToCloud(true);
        await onDeleteProduct(id);
        showTempSuccess('Pieza eliminada de la nube correctamente');
      } catch (err) {
        console.error(err);
        setErrorMsg('Error al eliminar de Firestore.');
      } finally {
        setIsSavingToCloud(false);
      }
    }
  };

  // Quick add category inline from product form
  const handleQuickAddCategory = async () => {
    const trimmed = quickCategoryName.trim();
    if (!trimmed) return;

    try {
      setIsQuickAddingCategory(true);
      await onSaveCategory({ name: trimmed });
      setCategory(trimmed);
      setQuickCategoryName('');
      setShowQuickAddCategory(false);
      showTempSuccess(`Categoría "${trimmed}" creada y seleccionada`);
    } catch (err) {
      console.error('Error adding category:', err);
      setErrorMsg('No se pudo crear la categoría en la nube.');
    } finally {
      setIsQuickAddingCategory(false);
    }
  };

  // Category Manager Tab handlers
  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryOldName(cat.name);
    setCategoryFormName(cat.name);
    setCategoryFormDesc(cat.description || '');
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryOldName('');
    setCategoryFormName('');
    setCategoryFormDesc('');
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryFormName.trim();
    if (!trimmedName) {
      setErrorMsg('El nombre de la categoría es requerido.');
      return;
    }

    try {
      setIsSavingCategory(true);
      setErrorMsg(null);

      if (editingCategoryId) {
        // Update existing category
        await onUpdateCategory(
          editingCategoryId,
          editingCategoryOldName,
          trimmedName,
          categoryFormDesc.trim()
        );
        showTempSuccess(`Categoría "${trimmedName}" actualizada y sincronizada en el catálogo`);
        handleCancelEditCategory();
      } else {
        // Create new category
        await onSaveCategory({
          name: trimmedName,
          description: categoryFormDesc.trim(),
        });
        showTempSuccess(`Nueva categoría "${trimmedName}" creada en la nube mundial`);
        setCategoryFormName('');
        setCategoryFormDesc('');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setErrorMsg('Error al guardar la categoría en Firestore.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    const count = productCountPerCategory[cat.name.toLowerCase().trim()] || 0;
    let message = `¿Deseas eliminar la categoría "${cat.name}" de la nube?`;
    if (count > 0) {
      message = `Atención: Esta categoría tiene ${count} joya(s) asociada(s). Si la eliminas, las joyas seguirán existiendo pero no tendrán esta categoría en los filtros. ¿Eliminarla de todos modos?`;
    }

    if (window.confirm(message)) {
      try {
        setIsSavingCategory(true);
        await onDeleteCategory(cat.id);
        showTempSuccess(`Categoría "${cat.name}" eliminada`);
        if (editingCategoryId === cat.id) {
          handleCancelEditCategory();
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setErrorMsg('Error al eliminar la categoría en Firestore.');
      } finally {
        setIsSavingCategory(false);
      }
    }
  };

  // If Not Authenticated: Prompt for PIN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
        <div
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#eed7e5] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#f0dce7] bg-[#fdf9fb] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#fceaf3] text-[#ba5489] flex items-center justify-center shadow-xs border border-[#f5d5e7]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg text-[#392437] font-semibold leading-tight">
                  Acceso de Administración
                </h3>
                <p className="text-[10px] text-[#866d81]">
                  Bianca Atondo Joyería · Panel Seguro
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f8eaf2] text-[#7d5d76] flex items-center justify-center hover:bg-[#edd2e3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleVerifyPin} className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fde9f2] text-[#ba5489] mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#523b4e] font-medium">
                Ingresa tu PIN de seguridad para gestionar joyas y categorías
              </p>
            </div>

            <div className="space-y-1.5">
              <input
                type="password"
                inputMode="numeric"
                maxLength={10}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Ingresa tu PIN (19923006)"
                autoFocus
                className={`w-full text-center tracking-widest text-lg py-3 px-4 bg-[#fdf8fa] border rounded-2xl font-mono text-[#392437] focus:outline-none transition-colors ${
                  pinError
                    ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                    : 'border-[#ecd5e3] focus:border-[#ba5489]'
                }`}
              />
              {pinError && (
                <p className="text-[11px] text-red-600 text-center font-medium">
                  PIN incorrecto. Consulta con la administración.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If Authenticated: Show Full Product and Category Manager
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-5 animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#eed7e5] overflow-hidden flex flex-col max-h-[94vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#f0dce7] bg-[#fdf9fb] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#ba5489] text-white flex items-center justify-center font-serif-luxury font-bold text-sm shadow-xs">
                B
              </span>
              <h2 className="font-serif-luxury text-xl sm:text-2xl text-[#392437] font-medium">
                Panel de Control en la Nube
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[9px] font-bold uppercase tracking-wider border border-[#bbf7d0] shrink-0">
                PIN Activo
              </span>
            </div>
            <p className="text-[11px] text-[#846b7f] mt-0.5 flex items-center gap-1.5 truncate">
              <Cloud className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
              <span>Sincronizado con Google Firebase: catálogo y categorías en tiempo real sin editar código.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#eed0e2] text-[11px] font-semibold text-[#8b3b68] hover:bg-[#faedf4] transition-colors shadow-2xs"
              title="Cerrar sesión administrativa"
            >
              Bloquear 🔒
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f8eaf2] text-[#7d5d76] flex items-center justify-center hover:bg-[#edd2e3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 bg-[#fdf9fb] border-b border-[#f3dfee]">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              adminTab === 'products'
                ? 'bg-[#ba5489] text-white shadow-xs'
                : 'bg-white text-[#735a70] border border-[#ebd6e4] hover:bg-[#faedf4]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Joyas y Catálogo</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                adminTab === 'products' ? 'bg-white/20 text-white' : 'bg-[#faedf4] text-[#ba5489]'
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              adminTab === 'categories'
                ? 'bg-[#ba5489] text-white shadow-xs'
                : 'bg-white text-[#735a70] border border-[#ebd6e4] hover:bg-[#faedf4]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorías Personalizadas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                adminTab === 'categories' ? 'bg-white/20 text-white' : 'bg-[#faedf4] text-[#ba5489]'
              }`}
            >
              {categories.length}
            </span>
          </button>
        </div>

        {/* Global Toast Message in Admin */}
        {successToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: PRODUCTS & INVENTORY */}
        {adminTab === 'products' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Product Form */}
            <form onSubmit={handleProductSubmit} className="p-4 rounded-2xl bg-[#faf4f8] border border-[#eed9e7] space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1dce9]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a04e79] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {editingId ? 'Editar Joya en la Nube' : 'Cargar Joya a la Nube (con Marca de Agua)'}
                </span>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetProductForm}
                    className="text-[11px] text-[#95547b] hover:underline"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {/* Photo Uploader with Auto-Watermark and Firebase Storage Visual Progress Bar */}
              <div>
                <label className="text-xs font-semibold text-[#4b3347] block mb-1.5">
                  Foto de la Joya (Estampa Automáticamente la Marca de Agua Oficial Bianca Atondo y Carga a Firebase Storage)
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
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
                          Cambiar Foto
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-full bg-[#fde9f2] text-[#ba5489] flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                          <CloudUpload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#4b3548] block">
                          Toca para subir foto
                        </span>
                        <span className="text-[10px] text-[#866f82] block">
                          Marca de agua Bianca Atondo oficial incluida
                        </span>
                      </div>
                    )}

                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-1.5 p-2 text-[#ba5489]">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[11px] font-semibold text-center">
                          {uploadProgress.phase === 'watermark'
                            ? 'Estampando marca…'
                            : `Subiendo ${uploadProgress.percent}%…`}
                        </span>
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

                  <div className="flex-1 w-full space-y-2 text-xs text-[#715c6f] leading-relaxed">
                    <div className="p-3 bg-white rounded-xl border border-[#f0dde9]">
                      <span className="font-semibold text-[#8b3b68] block mb-1">
                        ✨ Marca de Agua Oficial y Almacenamiento en la Nube:
                      </span>
                      <p className="text-[11px]">
                        Al seleccionar cualquier foto, el sistema le estampa automáticamente el sello de <strong>Bianca Atondo Joyería</strong> y la transfiere directamente a <strong>Firebase Storage</strong> para que se cargue a máxima velocidad en cualquier celular del mundo.
                      </p>
                    </div>

                    {/* VISUAL PROGRESS BAR FOR FIREBASE STORAGE */}
                    {uploadProgress.phase !== 'idle' && (
                      <div className="p-3.5 bg-gradient-to-br from-[#fdf6fa] to-[#f9edf5] rounded-xl border border-[#ecd2e2] shadow-xs space-y-2.5 animate-fade-in">
                        {/* Header with Title and Percentage */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {uploadProgress.phase === 'completed' ? (
                              <div className="w-6 h-6 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center shrink-0 shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : uploadProgress.phase === 'error' ? (
                              <div className="w-6 h-6 rounded-full bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#fae2f0] text-[#ba5489] flex items-center justify-center shrink-0">
                                <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-bold text-[#392437] block leading-tight">
                                {uploadProgress.phase === 'completed'
                                  ? 'Carga a Firebase Storage Completada'
                                  : uploadProgress.phase === 'watermark'
                                  ? 'Estampando Marca de Agua Oficial'
                                  : uploadProgress.phase === 'error'
                                  ? 'Error en la Carga'
                                  : 'Subiendo a Firebase Storage'}
                              </span>
                              <span className="text-[10px] text-[#866e81]">
                                {uploadProgress.phase === 'completed'
                                  ? 'Foto optimizada y lista para visualización global'
                                  : 'Transfiriendo bytes a los servidores en la nube de Google Firebase'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`font-mono text-sm font-bold ${
                                uploadProgress.phase === 'completed'
                                  ? 'text-[#15803d]'
                                  : 'text-[#ba5489]'
                              }`}
                            >
                              {uploadProgress.percent}%
                            </span>
                          </div>
                        </div>

                        {/* The Animated Progress Bar Track */}
                        <div className="relative w-full h-2.5 bg-[#eedae7] rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ease-out relative ${
                              uploadProgress.phase === 'completed'
                                ? 'bg-gradient-to-r from-[#10b981] to-[#059669]'
                                : uploadProgress.phase === 'error'
                                ? 'bg-red-500'
                                : 'bg-gradient-to-r from-[#ba5489] via-[#e284b3] to-[#b58a42]'
                            }`}
                            style={{ width: `${Math.max(6, uploadProgress.percent)}%` }}
                          >
                            {(uploadProgress.phase === 'uploading' || uploadProgress.phase === 'watermark') && (
                              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* Status Text and Byte Metric */}
                        <div className="flex items-center justify-between text-[11px] text-[#715c6f] pt-0.5">
                          <span className="font-medium truncate pr-2 text-[#4c3547]">
                            {uploadProgress.statusText || 'Procesando archivo...'}
                          </span>
                          {uploadProgress.totalBytes > 0 && (
                            <span className="shrink-0 text-[10px] font-mono text-[#91768b] bg-white px-2 py-0.5 rounded-md border border-[#edd7e6]">
                              {uploadProgress.bytesTransferred > 0
                                ? `${Math.round(uploadProgress.bytesTransferred / 1024)} KB / ${Math.round(uploadProgress.totalBytes / 1024)} KB`
                                : `${Math.round(uploadProgress.totalBytes / 1024)} KB`}
                            </span>
                          )}
                        </div>

                        {/* Three Step Indicator Badges */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                          <div
                            className={`p-1.5 rounded-lg border text-center transition-colors flex items-center justify-center gap-1 ${
                              uploadProgress.percent >= 20
                                ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d] font-semibold'
                                : 'bg-white border-[#f0dce8] text-[#977f93]'
                            }`}
                          >
                            {uploadProgress.percent >= 20 ? '✓' : '1.'} Marca de Agua
                          </div>
                          <div
                            className={`p-1.5 rounded-lg border text-center transition-colors flex items-center justify-center gap-1 ${
                              uploadProgress.phase === 'completed' || uploadProgress.percent >= 95
                                ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d] font-semibold'
                                : uploadProgress.phase === 'uploading'
                                ? 'bg-[#fce8f3] border-[#f4c2de] text-[#a03c73] font-semibold animate-pulse'
                                : 'bg-white border-[#f0dce8] text-[#977f93]'
                            }`}
                          >
                            {uploadProgress.phase === 'completed' || uploadProgress.percent >= 95
                              ? '✓'
                              : '2.'}{' '}
                            Firebase Storage
                          </div>
                          <div
                            className={`p-1.5 rounded-lg border text-center transition-colors flex items-center justify-center gap-1 ${
                              uploadProgress.phase === 'completed'
                                ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d] font-semibold'
                                : 'bg-white border-[#f0dce8] text-[#977f93]'
                            }`}
                          >
                            {uploadProgress.phase === 'completed' ? '✓' : '3.'} Nube Lista
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fields: Name, Category (with dynamic options and quick add) */}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#50374b]">
                      Categoría Personalizada *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCategory(!showQuickAddCategory)}
                      className="text-[10px] text-[#ba5489] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showQuickAddCategory ? 'Cerrar' : '+ Crear nueva'}</span>
                    </button>
                  </div>

                  {!showQuickAddCategory ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      {/* If editing a product with a legacy category not in the list, keep it visible */}
                      {category && !categories.some((c) => c.name.toLowerCase() === category.toLowerCase()) && (
                        <option value={category}>{category}</option>
                      )}
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#eed0e2]">
                      <input
                        type="text"
                        value={quickCategoryName}
                        onChange={(e) => setQuickCategoryName(e.target.value)}
                        placeholder="Ej. Tobilleras, Dijes..."
                        className="flex-1 px-2 py-1 text-xs text-[#392437] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddCategory}
                        disabled={!quickCategoryName.trim() || isQuickAddingCategory}
                        className="px-2.5 py-1 bg-[#ba5489] text-white text-[11px] font-semibold rounded-lg hover:bg-[#a84779] disabled:opacity-50 flex items-center gap-1"
                      >
                        {isQuickAddingCategory ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Guardar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Tag */}
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
                      value={hasPrice ? price : ''}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={hasPrice ? '450' : 'Precio por confirmar'}
                      disabled={!hasPrice}
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
                  disabled={
                    isProcessingImage ||
                    isSavingToCloud ||
                    uploadProgress.phase === 'uploading' ||
                    uploadProgress.phase === 'watermark'
                  }
                  className="w-full py-3 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSavingToCloud ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando pieza en Firestore…</span>
                    </>
                  ) : uploadProgress.phase === 'uploading' || uploadProgress.phase === 'watermark' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo foto a Firebase Storage ({uploadProgress.percent}%)…</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8b3b68]">
                    Joyas en la Nube ({products.length})
                  </span>
                  {categoryFilterInAdmin !== 'Todos' && (
                    <span className="text-[10px] text-[#846b7f]">
                      · Filtradas por "{categoryFilterInAdmin}" ({adminFilteredProducts.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Filter Chips inside Admin */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] scrollbar-none py-0.5">
                    <button
                      onClick={() => setCategoryFilterInAdmin('Todos')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                        categoryFilterInAdmin === 'Todos'
                          ? 'bg-[#ba5489] text-white'
                          : 'bg-white text-[#7b6177] border border-[#ecd5e3]'
                      }`}
                    >
                      Todos
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategoryFilterInAdmin(c.name)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                          categoryFilterInAdmin === c.name
                            ? 'bg-[#ba5489] text-white'
                            : 'bg-white text-[#7b6177] border border-[#ecd5e3]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={async () => {
                      if (window.confirm('¿Restablecer el catálogo de la nube a la colección inicial?')) {
                        setIsSavingToCloud(true);
                        await onResetDefaults();
                        setIsSavingToCloud(false);
                      }
                    }}
                    disabled={isSavingToCloud}
                    className="text-[10px] text-[#97587f] hover:underline flex items-center gap-1 shrink-0 ml-1"
                    title="Restaura la colección inicial en la nube"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restablecer
                  </button>
                </div>
              </div>

              {adminFilteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#e6c9dc] space-y-1">
                  <p className="text-xs text-[#6e586c] font-medium">
                    No hay joyas registradas en esta categoría.
                  </p>
                  <p className="text-[10px] text-[#9a8296]">
                    Usa el formulario superior para agregar piezas a "{categoryFilterInAdmin}".
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {adminFilteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-white rounded-2xl border border-[#eedce7] flex items-center justify-between gap-3 shadow-2xs hover:border-[#dfb8d2] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#f8ebf3]">
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                          {p.img.startsWith('http') && (
                            <div
                              className="absolute bottom-0 right-0 bg-[#ba5489] text-white p-0.5 rounded-tl-md text-[8px]"
                              title="Alojado en Firebase Storage"
                            >
                              <Cloud className="w-2.5 h-2.5" />
                            </div>
                          )}
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
                          onClick={() => handleStartEditProduct(p)}
                          className="p-1.5 rounded-lg text-[#7c5f76] hover:bg-[#faedf4] hover:text-[#ba5489]"
                          title="Editar pieza"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-[#991b1b] hover:bg-[#fee2e2]"
                          title="Eliminar pieza"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM CATEGORIES MANAGEMENT */}
        {adminTab === 'categories' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Informational Banner */}
            <div className="p-3.5 bg-gradient-to-br from-[#fbf2f7] to-[#f6e8f2] rounded-2xl border border-[#edd3e4] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-[#ba5489] flex items-center justify-center shrink-0 border border-[#f0d4e5] shadow-2xs">
                <Tag className="w-4 h-4" />
              </div>
              <div className="text-xs text-[#52384e] space-y-0.5">
                <span className="font-semibold block text-[#3f253b]">
                  Gestor de Categorías Dinámicas de Bianca Atondo
                </span>
                <p className="text-[11px] text-[#7d657a] leading-relaxed">
                  Crea, renombra o elimina categorías a tu gusto. Todas las categorías guardadas aquí se reflejan de inmediato en los filtros de la tienda en los celulares de tus clientes, permitiendo que tu catálogo crezca sin tocar código.
                </p>
              </div>
            </div>

            {/* Category Create/Edit Form */}
            <form
              onSubmit={handleCategoryFormSubmit}
              className="p-4 rounded-2xl bg-[#faf4f8] border border-[#eed9e7] space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#f1dce9]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a04e79] flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5" />
                  {editingCategoryId ? `Editar Categoría: "${editingCategoryOldName}"` : 'Crear Nueva Categoría'}
                </span>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={handleCancelEditCategory}
                    className="text-[11px] text-[#95547b] hover:underline"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {editingCategoryId && (
                <div className="p-2.5 bg-[#fef3c7] border border-[#fde68a] text-[#92400e] rounded-xl text-[11px]">
                  💡 <strong>Actualización inteligente:</strong> Si modificas el nombre de esta categoría, todas las joyas que pertenecen actualmente a "{editingCategoryOldName}" se actualizarán automáticamente en la base de datos de Firestore.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="Ej. Tobilleras, Dijes, Sets Nupciales, Relojes…"
                    className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#50374b] block mb-1">
                    Descripción o Subtítulo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={categoryFormDesc}
                    onChange={(e) => setCategoryFormDesc(e.target.value)}
                    placeholder="Ej. Cadenas finas para tobillo con chapa de oro"
                    className="w-full px-3 py-2 bg-white border border-[#edd7e6] rounded-xl text-xs text-[#392437] focus:outline-none focus:border-[#ba5489]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="flex-1 py-2.5 rounded-xl bg-[#ba5489] text-white text-xs font-semibold hover:bg-[#a84779] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSavingCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sincronizando categoría en la nube…</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>
                        {editingCategoryId
                          ? 'Guardar Cambios de Categoría ☁️'
                          : 'Guardar Categoría en la Nube ☁️'}
                      </span>
                    </>
                  )}
                </button>

                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={handleCancelEditCategory}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#edd7e6] text-xs font-semibold text-[#7d5d76] hover:bg-[#faedf4]"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* List of Active Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b3b68]">
                  Categorías en el Catálogo ({categories.length})
                </span>
                <span className="text-[10px] text-[#866d81]">
                  Disponibles en el menú de clientes y al cargar joyas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const jewelCount = productCountPerCategory[cat.name.toLowerCase().trim()] || 0;
                  const isCurrentEditing = editingCategoryId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 bg-white rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                        isCurrentEditing
                          ? 'border-[#ba5489] ring-2 ring-[#ba5489]/20 bg-[#fdf8fa]'
                          : 'border-[#eedce7] hover:border-[#dfb8d2]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[#3b2739]">
                              {cat.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#faedf4] text-[#964273] text-[10px] font-bold border border-[#eed0e2]">
                              {jewelCount} {jewelCount === 1 ? 'joya' : 'joyas'}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-[#7d657a] line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(cat)}
                            className="p-1.5 rounded-lg text-[#7c5f76] hover:bg-[#faedf4] hover:text-[#ba5489] transition-colors"
                            title="Editar nombre y descripción"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg text-[#991b1b] hover:bg-[#fee2e2] transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#f6e9f1] flex items-center justify-between text-[10px] text-[#947d90]">
                        <span className="flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-[#3b82f6]" />
                          <span>Activa en Firestore</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(cat.name);
                            setAdminTab('products');
                          }}
                          className="text-[#ba5489] font-medium hover:underline"
                        >
                          + Agregar joya aquí →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#fdf9fb] border-t border-[#f0dce7] flex items-center justify-between text-xs text-[#826a7e]">
          <span className="flex items-center gap-1.5 truncate pr-2">
            <Cloud className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
            <span className="truncate">Colección y categorías conectadas a la nube mundial.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#ba5489] text-white font-semibold hover:bg-[#a84779] transition-colors shrink-0 shadow-xs"
          >
            Listo, volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
