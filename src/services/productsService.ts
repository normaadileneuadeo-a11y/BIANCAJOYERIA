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
  getDocFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/AdminProductManager';

export const PRODUCTS_COLLECTION = 'products';

/**
 * Tests direct connection to Firestore by reading from the server.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, PRODUCTS_COLLECTION, '__ping_probe__'));
    return true;
  } catch (error: any) {
    if (error?.code === 'not-found' || error?.message?.includes('not found')) {
      return true;
    }
    return false;
  }
}

/**
 * Listens to real-time updates for products in Firestore.
 */
export function subscribeToProducts(
  initialFallback: Product[],
  onUpdate: (products: Product[]) => void
): () => void {
  const productsCol = collection(db, PRODUCTS_COLLECTION);

  const unsubscribe = onSnapshot(
    productsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // If Firestore collection is empty, seed with initial defaults cleanly
        try {
          for (const item of initialFallback) {
            const fallbackImages =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : item.img
                ? [item.img]
                : [];

            const cleanedSeed: Record<string, any> = {
              id: Number(item.id),
              name: (item.name || '').trim(),
              category: (item.category || 'Collares').trim(),
              desc: (item.desc || '').trim(),
              material: (item.material || 'Chapa de oro 14k').trim(),
              tag: (item.tag || 'Nuevo').trim(),
              img: item.img || fallbackImages[0] || '',
              images: fallbackImages,
              price: typeof item.price === 'number' && item.price > 0 ? item.price : null,
              updatedAt: Date.now(),
            };
            await setDoc(doc(db, PRODUCTS_COLLECTION, String(item.id)), cleanedSeed);
          }
        } catch (e) {
          console.error('Error seeding initial products in Firestore:', e);
        }
        onUpdate(initialFallback);
      } else {
        const cloudProducts: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const numericPrice =
            typeof data.price === 'number' && !isNaN(data.price) && data.price > 0
              ? Number(data.price)
              : undefined;

          const imagesList: string[] =
            Array.isArray(data.images) && data.images.length > 0
              ? data.images.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
              : data.img
              ? [data.img]
              : [];

          return {
            id: Number(data.id) || Number(docSnap.id),
            name: data.name || '',
            category: data.category || 'Collares',
            price: numericPrice,
            desc: data.desc || '',
            material: data.material || '',
            tag: data.tag || 'Nuevo',
            img: data.img || imagesList[0] || '',
            images: imagesList,
          } as Product;
        });

        // Sort by id descending (newest first)
        cloudProducts.sort((a, b) => b.id - a.id);
        onUpdate(cloudProducts);
      }
    },
    (error) => {
      console.error('Firestore products listener error:', error);
      // Fallback to local cache if network is unavailable
      onUpdate(initialFallback);
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a product cleanly in Firestore without undefined fields.
 * Guarantees support for multiple product images and detail close-ups.
 */
export async function saveProductToCloud(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(product.id));

    const cleanedImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images.filter((url) => typeof url === 'string' && url.trim().length > 0)
        : product.img
        ? [product.img]
        : [];

    const mainImg = product.img || cleanedImages[0] || '';

    // Ensure all fields are explicitly clean and serializable (Firestore rejects undefined)
    const cleanedPayload: Record<string, any> = {
      id: Number(product.id),
      name: String(product.name || '').trim(),
      category: String(product.category || 'Collares').trim(),
      desc: String(product.desc || '').trim(),
      material: String(product.material || 'Chapa de oro 14k').trim(),
      tag: String(product.tag || 'Nuevo').trim(),
      img: String(mainImg),
      images: cleanedImages,
      updatedAt: Date.now(),
    };

    if (typeof product.price === 'number' && !isNaN(product.price) && product.price > 0) {
      cleanedPayload.price = product.price;
    } else {
      cleanedPayload.price = null;
    }

    await setDoc(docRef, cleanedPayload, { merge: true });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProductFromCloud(productId: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(productId));
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
}

/**
 * Resets Firestore catalog back to initial defaults with multiple images.
 */
export async function resetCloudProductsToDefaults(defaultProducts: Product[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, d.id));
    }
    for (const item of defaultProducts) {
      const fallbackImages =
        Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : item.img
          ? [item.img]
          : [];

      const cleanedItem: Record<string, any> = {
        id: Number(item.id),
        name: (item.name || '').trim(),
        category: (item.category || 'Collares').trim(),
        desc: (item.desc || '').trim(),
        material: (item.material || 'Chapa de oro 14k').trim(),
        tag: (item.tag || 'Nuevo').trim(),
        img: item.img || fallbackImages[0] || '',
        images: fallbackImages,
        price: typeof item.price === 'number' && item.price > 0 ? item.price : null,
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, PRODUCTS_COLLECTION, String(item.id)), cleanedItem);
    }
  } catch (error) {
    console.error('Error resetting products in Firestore:', error);
    throw error;
  }
}
