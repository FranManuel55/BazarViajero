'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName: string;
  productPrice: string;
  className?: string;
  variant?: 'icon' | 'full';
}

const WHATSAPP_NUMBER = '542612478784';

export function WhatsAppButton({ productName, productPrice, className = '', variant = 'icon' }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `Hola! Me interesa el producto: ${productName} (${productPrice}). ¿Está disponible?`
  );
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 hover:bg-green-600 transition-all shadow-md ${className}`}
        title="Pedir por WhatsApp"
      >
        <MessageCircle size={18} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-green-600 hover:scale-105 transition-all shadow-md ${className}`}
    >
      <MessageCircle size={18} />
      Pedir por WhatsApp
    </a>
  );
}
