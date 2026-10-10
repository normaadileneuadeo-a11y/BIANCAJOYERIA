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

const PRODUCTS_COLLECTION = 'products';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Firestore Error - ${operationType} on ${path}]:`, errMessage);
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode.');
    }
    return false;
  }
}

/**
 * Subscribes to real-time products updates from Firestore.
 * Automatically seeds the database if empty so customers worldwide see the initial collection immediately.
 */
export function subscribeToProducts(
  initialFallback: Product[],
  onUpdate: (products: Product[]) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // First-time cloud seed: save initial catalog to Firestore
        try {
          for (const item of initialFallback) {
            await setDoc(doc(db, PRODUCTS_COLLECTION, String(item.id)), item);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, PRODUCTS_COLLECTION);
        }
        onUpdate(initialFallback);
      } else {
        const cloudProducts: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: Number(data.id) || Number(docSnap.id),
            name: data.name,
            category: data.category,
            price: data.price ? Number(data.price) : undefined,
            desc: data.desc || '',
            material: data.material || '',
            tag: data.tag || 'Nuevo',
            img: data.img,
          } as Product;
        });

        // Sort by id descending (newest first)
        cloudProducts.sort((a, b) => b.id - a.id);
        onUpdate(cloudProducts);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
      // Fallback to local cache if network is unavailable
      onUpdate(initialFallback);
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a product in Firestore (visible instantly worldwide).
 */
export async function saveProductToCloud(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(product.id));
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
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
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
    throw error;
  }
}

/**
 * Resets Firestore catalog back to initial defaults.
 */
export async function resetCloudProductsToDefaults(defaultProducts: Product[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, d.id));
    }
    for (const item of defaultProducts) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, String(item.id)), item);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
    throw error;
  }
}
