'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, MapPin, Phone, MessageCircle, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { ProductCard, type ProductData } from '@/components/ProductCard';

const reviews = [
  {
    id: 1,
    name: 'María González',
    rating: 5,
    text: 'Excelente atención y productos de excelente calidad. Me encantó el set de té que compré, exactamente como en las fotos. ¡Recomendado!',
    date: 'hace 2 semanas'
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    rating: 5,
    text: 'Encontré piezas únicas que no veo en otros lugares. La atención es impecable y los productos son de primera calidad.',
    date: 'hace 1 mes'
  },
  {
    id: 3,
    name: 'Ana Martínez',
    rating: 5,
    text: 'Todo hermoso, el packaging es divino. Productos importados de muy buena calidad. Ya hice mi segunda compra.',
    date: 'hace 1 mes'
  },
  {
    id: 4,
    name: 'Javier López',
    rating: 4,
    text: 'Muy buena variedad de productos. La atención por WhatsApp es excelente, responden rápido.',
    date: 'hace 2 meses'
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured products from API
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=6');
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchFeatured();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center">
              <span className="text-brand-mauve font-serif text-xl font-bold">BV</span>
            </div>
            <span className="font-serif text-2xl font-semibold text-brand-mauve hidden sm:block">El Bazar Viajero</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-gray-700 hover:text-brand-mauve transition-colors">Inicio</a>
            <a href="#nosotros" className="text-gray-700 hover:text-brand-mauve transition-colors">Nosotros</a>
            <a href="#productos" className="text-gray-700 hover:text-brand-mauve transition-colors">Productos</a>
            <Link href="/catalogo" className="text-gray-700 hover:text-brand-mauve transition-colors font-medium">Catálogo</Link>
            <a href="#reseñas" className="text-gray-700 hover:text-brand-mauve transition-colors">Reseñas</a>
            <a href="#contacto" className="text-gray-700 hover:text-brand-mauve transition-colors">Contacto</a>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-brand-mauve"
          >
            {isMenuOpen ? <X size={24} /> : <div className="space-y-1.5"><span className="block w-6 h-0.5 bg-current"></span><span className="block w-6 h-0.5 bg-current"></span><span className="block w-6 h-0.5 bg-current"></span></div>}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="flex flex-col p-4 gap-4">
                <a href="#inicio" className="text-gray-700 py-2" onClick={() => setIsMenuOpen(false)}>Inicio</a>
                <a href="#nosotros" className="text-gray-700 py-2" onClick={() => setIsMenuOpen(false)}>Nosotros</a>
                <a href="#productos" className="text-gray-700 py-2" onClick={() => setIsMenuOpen(false)}>Productos</a>
                <Link href="/catalogo" className="text-brand-mauve font-medium py-2" onClick={() => setIsMenuOpen(false)}>Catálogo Completo</Link>
                <a href="#reseñas" className="text-gray-700 py-2" onClick={() => setIsMenuOpen(false)}>Reseñas</a>
                <a href="#contacto" className="text-gray-700 py-2" onClick={() => setIsMenuOpen(false)}>Contacto</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-brand-blush/20 to-brand-mauve/10"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-brand-blush/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-mauve/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full backdrop-blur-sm">
              <ShoppingBag size={18} className="text-brand-mauve" />
              <span className="text-sm text-gray-600">Productos importados únicos</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-brand-mauve mb-6 leading-tight">
              El Bazar Viajero
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Descubrí piezas únicas y artesanales de diferentes partes del mundo.
              Cada producto cuenta una historia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2">
                Ver Catálogo
                <ChevronDown size={20} />
              </Link>
              <a
                href="https://wa.me/542612478784?text=Hola!%20Vi%20sus%20productos%20por%20la%20web%20y%20quiero%20más%20información."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Consultar
              </a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="animate-bounce">
              <ChevronDown size={32} className="text-brand-mauve" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-mauve mb-4">
              Sobre Nosotros
            </h2>
            <div className="w-24 h-1 bg-brand-blush mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=750&fit=crop"
                    alt="Tienda de productos importados"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-brand-cream p-6 rounded-2xl shadow-xl">
                  <p className="font-serif text-4xl font-bold text-brand-mauve">500+</p>
                  <p className="text-gray-600">Productos únicos</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="font-serif text-2xl font-semibold text-gray-800">
                Traemos el mundo a tu hogar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                En <strong>El Bazar Viajero</strong>, seleccionamos cuidadosamente productos artesanales
                de diferentes países, buscando siempre piezas únicas que brinden magia y personalidad
                a tu hogar.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nuestra colección incluye cerámicas hechas a mano, textiles, decoraciones y artículos de
                decoración que no encontrarás en otro lugar.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blush/30 flex items-center justify-center">
                    <MapPin className="text-brand-mauve" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Local en Mendoza</p>
                    <p className="text-sm text-gray-600">Atención presencial</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blush/30 flex items-center justify-center">
                    <MessageCircle className="text-brand-mauve" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">WhatsApp</p>
                    <p className="text-sm text-gray-600">Respuesta inmediata</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section - Now from Database */}
      <section id="productos" className="section-padding bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-mauve mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una selección de nuestros productos más populares
            </p>
          </motion.div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-7 bg-gray-200 rounded w-24" />
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="text-brand-blush mx-auto mb-4" />
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          )}

          {/* CTA to full catalog */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/catalogo"
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              <ShoppingBag size={20} />
              Ver catálogo completo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reseñas" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-mauve mb-4">
              Reseñas de Clientes
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">4.9 de 5 estrellas</span>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-brand-cream p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  &quot;{review.text}&quot;
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{review.name}</span>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 p-8 bg-gradient-to-r from-brand-blush/20 to-brand-mauve/20 rounded-2xl"
          >
            <p className="text-gray-700 text-lg">
              <MapPin className="inline mr-2 text-brand-mauve" size={20} />
              Visitanos en nuestro local en Godoy Cruz 1124, Guaymallén, Mendoza
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-brand-cream relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-brand-mauve text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blush/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                ¿Querés conocer más?
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto font-light">
                Escribinos por WhatsApp y te ayudamos a encontrar el producto perfecto para vos
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/542612478784?text=Hola!%20Me%20gustaría%20recibir%20asesoramiento%20personalizado."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-brand-cream text-brand-mauve px-8 py-4 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all"
                >
                  <MessageCircle size={24} />
                  Escribinos al WhatsApp
                </a>
                <a
                  href="tel:+542612478784"
                  className="inline-flex items-center justify-center gap-3 border border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone size={24} />
                  Llamar ahora
                </a>
              </div>

              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 backdrop-blur-sm">
                  <MapPin size={18} />
                  <span>Godoy Cruz 1124, Guaymallén, Mendoza</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 backdrop-blur-sm">
                  <Phone size={18} />
                  <span>+54 261 247-8784</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section id="ubicacion" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-mauve mb-4">
              Cómo llegar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visitanos en nuestro local en Mendoza, Argentina
            </p>
            <div className="w-24 h-1 bg-brand-blush mx-auto mt-4"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-brand-blush/30"
          >
            <iframe
              title="Ubicación El Bazar Viajero"
              src="https://maps.google.com/maps?q=-32.8891552,-68.8173496&hl=es&z=17&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <a
              href="https://www.google.com/maps/place/El+Bazar+viajero/@-32.8891552,-68.8173496,17z/data=!3m1!4b1!4m6!3m5!1s0x967e0f002daf6c81:0x90d721b5047e9c10!8m2!3d-32.8891552!4d-68.8173496!16s%2Fg%2F11vzg5j66b"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <MapPin size={20} />
              Abrir en Google Maps
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-mauve text-brand-cream py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center">
                  <span className="text-brand-mauve font-serif font-bold">BV</span>
                </div>
                <span className="font-serif text-xl font-semibold">El Bazar Viajero</span>
              </div>
              <p className="text-brand-cream/80 text-sm">
                Productos importados únicos y artesanales para tu hogar
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-brand-cream">Links Rápidos</h4>
              <ul className="space-y-2 text-brand-cream/80">
                <li><a href="#inicio" className="hover:text-brand-blush transition-colors">Inicio</a></li>
                <li><Link href="/catalogo" className="hover:text-brand-blush transition-colors">Catálogo</Link></li>
                <li><a href="#contacto" className="hover:text-brand-blush transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-brand-cream">Contacto</h4>
              <ul className="space-y-2 text-brand-cream/80">
                <li className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  <a href="https://wa.me/542612478784?text=Hola!%20Quería%20hacer%20una%20consulta%20general." className="hover:text-brand-blush transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>+54 261 247-8784</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Mendoza, Argentina</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-cream/20 pt-8 text-center text-brand-cream/60 text-sm">
            <p>© 2024 El Bazar Viajero. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/542612478784?text=Hola!%20Necesito%20ayuda%20para%20encontrar%20el%20producto%20perfecto."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
      >
        <MessageCircle size={28} className="text-white" />
      </a>
    </main>
  );
}