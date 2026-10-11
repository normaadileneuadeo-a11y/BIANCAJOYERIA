/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  order?: number;
  createdAt?: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'collares', name: 'Collares', description: 'Dijes y cadenas delicadas', order: 1 },
  { id: 'anillos', name: 'Anillos', description: 'Argollas finas y ajustables', order: 2 },
  { id: 'pulseras', name: 'Pulseras', description: 'Eslabones y satélites', order: 3 },
  { id: 'aretes', name: 'Aretes', description: 'Huggies y colgantes sutiles', order: 4 },
];

const CATEGORIES_COLLECTION = 'categories';

function generateCategorySlug(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || `cat_${Date.now()}`;
}

/**
 * Subscribes to real-time custom categories from Firestore.
 * Automatically seeds default categories (Collares, Anillos, Pulseras, Aretes)
 * if Firestore collection is empty so administrators and customers have a complete base.
 */
export function subscribeToCategories(
  fallback: CategoryItem[],
  onUpdate: (categories: CategoryItem[]) => void
): () => void {
  const colRef = collection(db, CATEGORIES_COLLECTION);

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const cat of fallback) {
            await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), {
              ...cat,
              createdAt: cat.createdAt || new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('[Firestore Error - Seeding Categories]:', e);
        }
        onUpdate(fallback);
      } else {
        const cloudCategories: CategoryItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || d.id,
            description: data.description || '',
            order: typeof data.order === 'number' ? data.order : 99,
            createdAt: data.createdAt,
          };
        });

        // Sort by order ascending, then alphabetical by name
        cloudCategories.sort((a, b) => {
          const ordA = a.order ?? 99;
          const ordB = b.order ?? 99;
          if (ordA !== ordB) return ordA - ordB;
          return a.name.localeCompare(b.name, 'es');
        });

        onUpdate(cloudCategories);
      }
    },
    (error) => {
      console.warn('[Firestore] Error subscribing to categories, using fallback:', error);
      onUpdate(fallback);
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a category in Firestore.
 */
export async function saveCategoryToCloud(
  category: { id?: string; name: string; description?: string; order?: number }
): Promise<CategoryItem> {
  const trimmedName = category.name.trim();
  const catId = category.id?.trim() || generateCategorySlug(trimmedName);
  const payload: CategoryItem = {
    id: catId,
    name: trimmedName,
    description: category.description?.trim() || '',
    order: category.order ?? Date.now(),
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, CATEGORIES_COLLECTION, catId);
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

/**
 * Updates a category and optionally renames all matching products in Firestore.
 */
export async function updateCategoryNameInCloud(
  categoryId: string,
  oldName: string,
  newName: string,
  newDescription?: string
): Promise<void> {
  const trimmedNewName = newName.trim();
  if (!trimmedNewName) throw new Error('El nombre de la categoría no puede estar vacío');

  // 1. Update the category document
  const catDocRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  await updateDoc(catDocRef, {
    name: trimmedNewName,
    description: newDescription !== undefined ? newDescription.trim() : '',
  });

  // 2. If name changed, synchronize existing products that have the old category name
  if (oldName.trim().toLowerCase() !== trimmedNewName.toLowerCase()) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category', '==', oldName.trim()));
      const snap = await getDocs(q);
      const updates = snap.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { category: trimmedNewName })
      );
      await Promise.all(updates);
    } catch (e) {
      console.warn('Could not auto-migrate existing products to new category name:', e);
    }
  }
}

/**
 * Deletes a category from Firestore.
 */
export async function deleteCategoryFromCloud(categoryId: string): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  await deleteDoc(docRef);
}
