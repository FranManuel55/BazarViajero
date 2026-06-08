'use client';

import { motion } from 'framer-motion';
import { WhatsAppButton } from './WhatsAppButton';
import { toDirectImageUrl } from '@/lib/image-utils';

export interface ProductData {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  category: string;
  featured: number | null;
  active: number | null;
}

interface ProductCardProps {
  product: ProductData;
  variant?: 'compact' | 'full' | 'list';
  index?: number;
}

function ProductBadge({ featured }: { featured: number | null }) {
  if (featured === 1) {
    return (
      <span className="px-3 py-1 bg-brand-blush text-brand-mauve rounded-full text-xs font-semibold shadow-sm">
        Más Vendido
      </span>
    );
  }
  return null;
}

export function ProductCard({ product, variant = 'compact', index = 0 }: ProductCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop';
  const imageUrl = toDirectImageUrl(product.image) || fallbackImage;

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="card-product group flex flex-row"
      >
        <div className="relative w-40 sm:w-56 flex-shrink-0 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute top-3 left-3">
            <ProductBadge featured={product.featured} />
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1 min-w-0">
          <span className="text-xs font-bold tracking-wide text-brand-mauve uppercase mb-1">
            {product.category}
          </span>
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-1.5 truncate">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-brand-mauve">
              {product.price}
            </span>
            <WhatsAppButton
              productName={product.name}
              productPrice={product.price}
              variant="icon"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="card-product group flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute top-3 left-3">
            <ProductBadge featured={product.featured} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs font-bold tracking-wide text-brand-mauve uppercase mb-1.5">
            {product.category}
          </span>
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-1.5">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-brand-mauve">
              {product.price}
            </span>
            <WhatsAppButton
              productName={product.name}
              productPrice={product.price}
              variant="icon"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact variant (for landing page)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card-product group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-brand-mauve">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-brand-mauve">
            {product.price}
          </span>
          <WhatsAppButton
            productName={product.name}
            productPrice={product.price}
            variant="icon"
          />
        </div>
      </div>
    </motion.div>
  );
}
