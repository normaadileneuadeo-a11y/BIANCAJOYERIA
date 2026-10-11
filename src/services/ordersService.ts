/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/AdminProductManager';

export interface OrderItem {
  id: number;
  name: string;
  category: string;
  material: string;
  tag: string;
  price?: number;
  qty: number;
  subtotal?: number;
  img?: string;
}

export interface OrderPayload {
  folio: string;
  customerName: string;
  customerPhone?: string;
  deliveryMethod: string;
  orderNotes: string;
  items: OrderItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  status: 'pendiente' | 'confirmado';
}

export const WHATSAPP_NUMBER = '526871349604';

/**
 * Generates an easy-to-read unique order folio for Bianca and the client.
 */
export function generateOrderFolio(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `BA-${randomSuffix}`;
}

/**
 * Builds the exact, rich WhatsApp order message with complete item breakdown.
 */
export function buildExactWhatsAppMessage(params: {
  folio: string;
  customerName: string;
  customerPhone?: string;
  deliveryMethod: string;
  orderNotes: string;
  items: OrderItem[];
  totalItems: number;
  totalAmount: number;
}): string {
  const {
    folio,
    customerName,
    customerPhone,
    deliveryMethod,
    orderNotes,
    items,
    totalItems,
    totalAmount,
  } = params;

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━';

  const itemsList = items
    .map((item, idx) => {
      const priceUnitStr = item.price
        ? `$${item.price.toLocaleString('es-MX')} MXN`
        : 'Por confirmar';
      const subtotalStr = item.subtotal
        ? `$${item.subtotal.toLocaleString('es-MX')} MXN`
        : 'Por confirmar';

      return (
        `${idx + 1}️⃣ *${item.name.toUpperCase()}*\n` +
        `   • Categoría: ${item.category}\n` +
        `   • Material: ${item.material || 'Chapa de oro 14k'}\n` +
        `   • Cantidad exacta: *${item.qty} ${item.qty === 1 ? 'pieza' : 'piezas'}*\n` +
        `   • Precio unitario: ${priceUnitStr}\n` +
        `   • Subtotal pieza: *${subtotalStr}*\n` +
        `   • Distintivo: ${item.tag || 'Exclusivo'}`
      );
    })
    .join('\n\n');

  const totalFormatted =
    totalAmount > 0
      ? `*$${totalAmount.toLocaleString('es-MX')} MXN*`
      : 'A confirmar con Bianca';

  const message =
    `✨ *PEDIDO OFICIAL · BIANCA ATONDO JOYERÍA* ✨\n` +
    `${divider}\n` +
    `📋 *Folio de Pedido:* #${folio}\n` +
    `🗓️ *Fecha:* ${dateStr} a las ${timeStr}\n\n` +
    `👤 *DATOS DEL CLIENTE / COMPRADOR(A):*\n` +
    `• *Nombre:* ${customerName.trim() || 'Cliente de Catálogo Digital'}\n` +
    (customerPhone?.trim() ? `• *Teléfono:* ${customerPhone.trim()}\n` : '') +
    `• *Modalidad de Entrega:* ${deliveryMethod}\n` +
    `• *Notas especiales / Talla:* ${orderNotes.trim() || 'Sin notas adicionales'}\n\n` +
    `🛍️ *DETALLE EXACTO DE PRODUCTOS A COMPRAR (${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}):*\n` +
    `${divider}\n` +
    `${itemsList}\n` +
    `${divider}\n\n` +
    `💰 *TOTAL EXACTO A PAGAR:* ${totalFormatted}\n\n` +
    `✨ *Hola Bianca:* Confirmo mi interés en comprar exactamente estas piezas de su joyería. ¿Me podrías proporcionar los datos para transferencia / pago y coordinar los detalles de entrega, por favor? ¡Muchas gracias!`;

  return message;
}

/**
 * Saves the exact order to Firestore to keep an auditable cloud backup.
 */
export async function saveOrderToCloud(order: OrderPayload): Promise<void> {
  try {
    const orderDocRef = doc(db, 'orders', order.folio);
    await setDoc(orderDocRef, {
      ...order,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not save order backup to Firestore:', error);
    // Non-blocking for WhatsApp redirection
  }
}
