'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Plus, Package, Search, Edit2, Trash2, X,
  Check, AlertTriangle, Eye, EyeOff, ChevronLeft, ChevronRight, Home,
  Image as ImageIcon, Save, Loader2, RefreshCw, Star, Filter, Tags
} from 'lucide-react';
import Link from 'next/link';
import { toDirectImageUrl } from '@/lib/image-utils';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  category: string;
  featured: number | null;
  active: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Stats {
  total: number;
  active: number;
  featured: number;
}

const MAX_FEATURED = 6;

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, featured: 0 });

  // Dynamic categories
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingFeatured, setTogglingFeatured] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    featured: false,
    active: true,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/products/stats');
      const data = await res.json();
      setStats({ total: data.total || 0, active: data.active || 0, featured: data.featured || 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setDynamicCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        active: 'false',
      });
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (filterCategory) {
        params.set('category', filterCategory);
      }

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterCategory]);

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchCategories();
  }, [fetchProducts, fetchStats, fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  // If any mutator returns 401, the cookie expired — bounce to login.
  const handleAuthFailure = useCallback(() => {
    router.replace('/admin/login');
    router.refresh();
  }, [router]);

  const toggleFeatured = async (product: Product) => {
    const willBeFeatured = product.featured !== 1;

    if (willBeFeatured && stats.featured >= MAX_FEATURED) {
      showToast(`Máximo ${MAX_FEATURED} productos destacados permitidos`, 'error');
      return;
    }

    setTogglingFeatured(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: willBeFeatured }),
      });

      if (res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (res.ok) {
        setProducts(prev =>
          prev.map(p =>
            p.id === product.id ? { ...p, featured: willBeFeatured ? 1 : 0 } : p
          )
        );
        setStats(prev => ({
          ...prev,
          featured: willBeFeatured ? prev.featured + 1 : prev.featured - 1,
        }));
        showToast(
          willBeFeatured ? 'Producto destacado' : 'Producto quitado de destacados',
          'success'
        );
      } else {
        showToast('Error al actualizar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setTogglingFeatured(null);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: dynamicCategories[0] || '',
      featured: false,
      active: true,
    });
    setShowModal(true);
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setAddingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.status === 401) { handleAuthFailure(); return; }

      if (res.ok) {
        showToast(`Categoría "${trimmed}" creada`, 'success');
        setNewCategoryName('');
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al crear categoría', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    setDeletingCategory(name);
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.status === 401) { handleAuthFailure(); return; }

      if (res.ok) {
        showToast(`Categoría "${name}" eliminada`, 'success');
        setCategoryDeleteConfirm(null);
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al eliminar categoría', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setDeletingCategory(null);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      category: product.category,
      featured: product.featured === 1,
      active: product.active === 1,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      showToast('Nombre, precio y categoría son obligatorios', 'error');
      return;
    }

    if (formData.featured) {
      const isAlreadyFeatured = editingProduct?.featured === 1;
      if (!isAlreadyFeatured && stats.featured >= MAX_FEATURED) {
        showToast(`Máximo ${MAX_FEATURED} productos destacados permitidos`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (res.ok) {
        showToast(
          editingProduct ? 'Producto actualizado' : 'Producto creado',
          'success'
        );
        setShowModal(false);
        fetchProducts();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al guardar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

      if (res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (res.ok) {
        showToast('Producto eliminado', 'success');
        setDeleteConfirm(null);
        fetchProducts();
        fetchStats();
      } else {
        showToast('Error al eliminar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    fetchStats();
    fetchCategories();
    showToast('Datos actualizados', 'success');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-brand-mauve flex items-center justify-center">
                <span className="text-white font-serif text-sm font-bold">BV</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-800 text-sm">Admin Panel</h1>
                <p className="text-xs text-gray-400">El Bazar Viajero</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-brand-mauve transition-colors flex items-center gap-1"
              >
                <Home size={14} /> Sitio
              </Link>
              <Link
                href="/catalogo"
                className="text-xs text-gray-500 hover:text-brand-mauve transition-colors flex items-center gap-1"
              >
                <Package size={14} /> Catálogo
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 ml-2"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-blush/30 flex items-center justify-center">
                <Package size={22} className="text-brand-mauve" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Productos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Eye size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
                <p className="text-sm text-gray-500">Activos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Star size={22} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.featured} / {MAX_FEATURED}</p>
                <p className="text-sm text-gray-500">Destacados (Inicio)</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Tags size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Categorías</h2>
              <p className="text-xs text-gray-400">Gestioná las categorías de tus productos</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {dynamicCategories.map((cat) => (
              <div
                key={cat}
                className="group flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 transition-all hover:border-gray-300"
              >
                <span>{cat}</span>
                {categoryDeleteConfirm === cat ? (
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={deletingCategory === cat}
                      className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Confirmar eliminación"
                    >
                      {deletingCategory === cat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    </button>
                    <button
                      onClick={() => setCategoryDeleteConfirm(null)}
                      className="p-0.5 text-gray-400 hover:bg-gray-100 rounded transition-all"
                      title="Cancelar"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCategoryDeleteConfirm(cat)}
                    className="p-0.5 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar categoría"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            {dynamicCategories.length === 0 && (
              <p className="text-sm text-gray-400 italic">No hay categorías. Creá la primera.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
              placeholder="Nueva categoría..."
              className="flex-1 max-w-xs px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm bg-white"
            />
            <button
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategoryName.trim()}
              className="flex items-center gap-1.5 bg-brand-mauve text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-mauve/90 transition-all disabled:opacity-50"
            >
              {addingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Agregar
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm bg-white"
              />
            </div>

            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm bg-white appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">Todas las categorías</option>
                {dynamicCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
            >
              <RefreshCw size={14} />
              Refrescar
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-brand-mauve text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-mauve/90 transition-all shadow-sm"
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 size={32} className="animate-spin mx-auto mb-3" />
              <p className="text-sm">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay productos</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || filterCategory
                  ? 'No se encontraron productos con esos filtros'
                  : 'Creá tu primer producto'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                    <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                    <th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Dest.</th>
                    <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={toDirectImageUrl(product.image) || ''}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px] md:hidden">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{product.category}</span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="font-semibold text-brand-mauve text-sm">{product.price}</span>
                      </td>
                      <td className="py-3 px-5 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {product.active ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.active ? 'Activo' : 'Oculto'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center hidden sm:table-cell">
                        <button
                          onClick={() => toggleFeatured(product)}
                          disabled={togglingFeatured === product.id}
                          className={`p-1.5 rounded-lg transition-all ${
                            product.featured
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                          } disabled:opacity-50`}
                          title={
                            product.featured
                              ? 'Quitar de destacados'
                              : stats.featured >= MAX_FEATURED
                                ? `Máximo ${MAX_FEATURED} destacados`
                                : 'Marcar como destacado'
                          }
                        >
                          {togglingFeatured === product.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Star size={16} className={product.featured ? 'fill-yellow-400' : ''} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-400 hover:text-brand-mauve hover:bg-brand-blush/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                          {deleteConfirm === product.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deleting}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Confirmar"
                              >
                                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                title="Cancelar"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Mostrando {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalProducts)} de {totalProducts}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600 px-3">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="font-semibold text-gray-800">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                {formData.image && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={toDirectImageUrl(formData.image) || ''}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm"
                    placeholder="Ej: Set de Té Artesanal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm resize-none"
                    rows={3}
                    placeholder="Descripción del producto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Precio *
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm"
                      placeholder="$12.000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm bg-white"
                    >
                      {dynamicCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL de imagen (Google Drive, Unsplash, etc.)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-mauve focus:outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-brand-mauve focus:ring-brand-mauve"
                    />
                    <span className="text-sm text-gray-700">Activo (visible)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-mauve text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-mauve/90 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
