'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { ProductCard, type ProductData } from '@/components/ProductCard';
import Link from 'next/link';

interface CategoryCount {
  category: string;
  count: number;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

const ALL = 'Todos los productos';

function parsePrice(price: string): number {
  const num = parseFloat(price.replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(num) ? num : 0;
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [totalAll, setTotalAll] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const PRODUCTS_PER_PAGE = 12;

  // Fetch categories with counts (once)
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategoryCounts(data.counts || []);
        setTotalAll(data.total || 0);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
      });

      if (activeCategory !== ALL) {
        params.set('category', activeCategory);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price-desc':
        return arr.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      case 'newest':
        return arr.sort((a, b) => b.id - a.id);
      case 'featured':
      default:
        return arr.sort((a, b) => (b.featured ?? 0) - (a.featured ?? 0));
    }
  }, [products, sortBy]);

  const sidebarCategories = useMemo(() => {
    return [{ category: ALL, count: totalAll }, ...categoryCounts];
  }, [categoryCounts, totalAll]);

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Destacados';

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Top Nav */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-brand-blush flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-brand-mauve font-serif text-lg font-bold">
                  BV
                </span>
              </div>
              <span className="font-serif text-xl font-semibold text-brand-mauve hidden sm:block">
                El Bazar Viajero
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-mauve transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Volver al Inicio</span>
              </Link>
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 text-brand-mauve rounded-full hover:bg-brand-blush/20 transition-colors"
                aria-label="Abrir filtros"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-mauve">
            Nuestro Catálogo
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Explorá nuestra colección de productos únicos
          </p>
        </motion.div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <SidebarContent
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={sidebarCategories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            </div>
          </aside>

          {/* Sidebar - Mobile drawer */}
          <AnimatePresence>
            {showMobileSidebar && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileSidebar(false)}
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                  className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-lg font-bold text-brand-mauve">
                      Filtros
                    </h2>
                    <button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-2 rounded-full hover:bg-gray-100"
                      aria-label="Cerrar filtros"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                  <SidebarContent
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categories={sidebarCategories}
                    activeCategory={activeCategory}
                    setActiveCategory={(c) => {
                      setActiveCategory(c);
                      setShowMobileSidebar(false);
                    }}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-brand-mauve">
                  {totalProducts}
                </span>{' '}
                {totalProducts === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>

              <div className="flex items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                    className="flex items-center justify-between gap-2 min-w-[180px] px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-brand-blush transition-colors"
                  >
                    <span>{sortLabel}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${
                        sortOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-30"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSortBy(opt.value);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              sortBy === opt.value
                                ? 'bg-brand-blush/30 text-brand-mauve font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-white border border-gray-200 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Vista en grilla"
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-brand-mauve text-white'
                        : 'text-gray-500 hover:text-brand-mauve'
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="Vista en lista"
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'list'
                        ? 'bg-brand-mauve text-white'
                        : 'text-gray-500 hover:text-brand-mauve'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
                  >
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'aspect-square bg-gray-200'
                          : 'h-40 bg-gray-200'
                      }
                    />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-brand-blush/30 rounded-full flex items-center justify-center">
                  <ShoppingBag size={40} className="text-brand-mauve" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-gray-700 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-6">
                  Intentá con otra categoría o término de búsqueda
                </p>
                <button
                  onClick={() => {
                    setActiveCategory(ALL);
                    setSearchQuery('');
                  }}
                  className="btn-primary"
                >
                  Ver todos los productos
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="full"
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
              >
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="list"
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} className="text-brand-mauve" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-brand-mauve text-white shadow-lg shadow-brand-mauve/25'
                            : 'bg-white text-gray-600 hover:bg-brand-blush/30 shadow-sm'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === 2 && currentPage > 3) {
                    return (
                      <span key="dots-start" className="text-gray-400 px-1">
                        ···
                      </span>
                    );
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 2) {
                    return (
                      <span key="dots-end" className="text-gray-400 px-1">
                        ···
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} className="text-brand-mauve" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/542612478784?text=Hola!%20Necesito%20ayuda%20para%20encontrar%20el%20producto%20perfecto."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
      >
        <MessageCircle size={24} className="text-white" />
      </a>
    </main>
  );
}

interface SidebarContentProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  categories: CategoryCount[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
}

function SidebarContent({
  searchQuery,
  setSearchQuery,
  categories,
  activeCategory,
  setActiveCategory,
}: SidebarContentProps) {
  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-9 py-3 rounded-full bg-white border border-gray-200 focus:border-brand-blush focus:ring-2 focus:ring-brand-blush/30 focus:outline-none transition-all text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-3 px-1">
          Categorías
        </h3>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.category;
            return (
              <li key={cat.category}>
                <button
                  onClick={() => setActiveCategory(cat.category)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-blush/40 text-brand-mauve font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{cat.category}</span>
                  <span
                    className={`text-xs ml-2 ${
                      isActive ? 'text-brand-mauve' : 'text-gray-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
