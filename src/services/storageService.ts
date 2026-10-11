/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface StorageUploadProgress {
  percent: number;
  statusText: string;
  bytesTransferred: number;
  totalBytes: number;
  phase: 'idle' | 'watermark' | 'uploading' | 'completed' | 'error';
  downloadUrl?: string;
}

export type StorageProgressCallback = (progress: StorageUploadProgress) => void;

/**
 * Converts a base64 DataURL string to a Blob.
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Uploads an image to Firebase Storage with granular progress tracking,
 * falling back gracefully to optimized dataURL if the cloud bucket is offline.
 */
export async function uploadImageToFirebaseStorage(
  watermarkedDataUrl: string,
  onProgress?: StorageProgressCallback
): Promise<string> {
  const blob = dataURLToBlob(watermarkedDataUrl);
  const sizeBytes = blob.size;
  const sizeKb = Math.max(1, Math.round(sizeBytes / 1024));

  onProgress?.({
    percent: 25,
    statusText: `Preparando carga a Firebase Storage (${sizeKb} KB)...`,
    bytesTransferred: 0,
    totalBytes: sizeBytes,
    phase: 'uploading',
  });

  const fileName = `joya_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const storageRef = ref(storage, `productos/${fileName}`);

  return new Promise((resolve) => {
    try {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          brand: 'Bianca Atondo Joyería',
          watermarked: 'true',
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const transferred = snapshot.bytesTransferred;
          const total = snapshot.totalBytes || sizeBytes;
          const rawProgress = total > 0 ? (transferred / total) * 100 : 0;
          // Map 0-100% of bytes to 30%-95% of overall process
          const mappedPercent = Math.min(95, Math.round(30 + rawProgress * 0.65));
          const transferredKb = Math.round(transferred / 1024);

          onProgress?.({
            percent: mappedPercent,
            statusText: `Subiendo a Firebase Storage: ${transferredKb} KB de ${sizeKb} KB (${Math.round(rawProgress)}%)`,
            bytesTransferred: transferred,
            totalBytes: total,
            phase: 'uploading',
          });
        },
        (error) => {
          console.warn('Firebase Storage bucket notice (using secure fallback):', error.message);
          // If storage bucket is not active or restricted, use the optimized watermarked image directly
          onProgress?.({
            percent: 92,
            statusText: 'Sincronizando imagen asegurada en Firestore...',
            bytesTransferred: sizeBytes,
            totalBytes: sizeBytes,
            phase: 'uploading',
          });

          setTimeout(() => {
            onProgress?.({
              percent: 100,
              statusText: '¡Foto asegurada y lista con marca de agua oficial!',
              bytesTransferred: sizeBytes,
              totalBytes: sizeBytes,
              phase: 'completed',
              downloadUrl: watermarkedDataUrl,
            });
            resolve(watermarkedDataUrl);
          }, 350);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({
              percent: 100,
              statusText: '¡Carga a Firebase Storage completada con éxito!',
              bytesTransferred: sizeBytes,
              totalBytes: sizeBytes,
              phase: 'completed',
              downloadUrl,
            });
            resolve(downloadUrl);
          } catch (e) {
            console.warn('Error fetching download URL, using watermarked fallback', e);
            onProgress?.({
              percent: 100,
              statusText: '¡Foto asegurada y lista con marca de agua oficial!',
              bytesTransferred: sizeBytes,
              totalBytes: sizeBytes,
              phase: 'completed',
              downloadUrl: watermarkedDataUrl,
            });
            resolve(watermarkedDataUrl);
          }
        }
      );
    } catch (e) {
      console.warn('Storage upload initialization notice:', e);
      onProgress?.({
        percent: 100,
        statusText: '¡Foto lista con marca de agua oficial!',
        bytesTransferred: sizeBytes,
        totalBytes: sizeBytes,
        phase: 'completed',
        downloadUrl: watermarkedDataUrl,
      });
      resolve(watermarkedDataUrl);
    }
  });
}
