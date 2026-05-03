import { NextResponse } from 'next/server';
import { client } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Create table if not exists
    await client.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        image TEXT,
        category TEXT NOT NULL,
        featured INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )
    `);

    // Check if we already have data
    const existing = await client.execute('SELECT COUNT(*) as count FROM products');
    const count = existing.rows[0].count as number;

    if (count > 0) {
      return NextResponse.json({
        message: `La base de datos ya tiene ${count} productos. Seed omitido.`,
        seeded: false,
      });
    }

    // Seed initial products
    const seedProducts = [
      {
        name: 'Set de Té Artesanal',
        description: 'Hermoso set de té con tetera de cerámica pintada a mano, ideal para disfrutar una tarde de relax.',
        price: '$12.000',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop',
        category: 'Cocina',
        featured: 1,
      },
      {
        name: 'Bowl de Cerámica',
        description: 'Bowl de cerámica hecho a mano con diseño minimalista, perfecto para ensaladas y cereales.',
        price: '$8.500',
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
        category: 'Cocina',
        featured: 1,
      },
      {
        name: 'Vela Aromática Artesanal',
        description: 'Vela de soja con aceites esenciales, aroma lavanda. Duración aproximada de 40 horas.',
        price: '$5.500',
        image: 'https://images.unsplash.com/photo-1602607434864-2e6877e29895?w=600&h=600&fit=crop',
        category: 'Ropa',
        featured: 1,
      },
      {
        name: 'Maceta de Ratán',
        description: 'Maceta artesanal tejida en ratán natural, perfecta para plantas de interior.',
        price: '$9.000',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop',
        category: 'Ropa',
        featured: 0,
      },
      {
        name: 'Set de Cuencos Japoneses',
        description: 'Cuencos de porcelana estilo japonés para arroz, con acabado artesanal único.',
        price: '$11.000',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
        category: 'Cocina',
        featured: 1,
      },
      {
        name: 'Bandeja de Madera',
        description: 'Bandeja de madera de olivo con acabado natural, ideal para servir y decorar.',
        price: '$14.500',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
        category: 'Cocina',
        featured: 0,
      },
      {
        name: 'Jarrón de Cerámica',
        description: 'Jarrón artesanal con pintura tradicional, pieza decorativa única para tu hogar.',
        price: '$16.000',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
        category: 'Ropa',
        featured: 1,
      },
      {
        name: 'Servilletero de Bambú',
        description: 'Servilletero de bambú sostenible y ecológico, acabado natural.',
        price: '$4.500',
        image: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=600&h=600&fit=crop',
        category: 'Cocina',
        featured: 0,
      },
      {
        name: 'Espejo Redondo',
        description: 'Espejo decorativo con marco de mimbre natural, perfecto para hall de entrada.',
        price: '$22.000',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop',
        category: 'Ropa',
        featured: 1,
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con switches Cherry MX e iluminación RGB personalizable.',
        price: '$45.000',
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop',
        category: 'Electrónica',
        featured: 1,
      },
      {
        name: 'Auriculares Bluetooth',
        description: 'Auriculares inalámbricos con cancelación de ruido activa y 30h de batería.',
        price: '$35.000',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        category: 'Electrónica',
        featured: 0,
      },
      {
        name: 'Cuaderno de Cuero',
        description: 'Cuaderno artesanal con tapa de cuero genuino, 200 páginas de papel ecológico.',
        price: '$8.000',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
        category: 'Librería',
        featured: 1,
      },
      {
        name: 'Set de Lápices de Colores',
        description: 'Set profesional de 48 lápices de colores con estuche de lona enrollable.',
        price: '$12.500',
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop',
        category: 'Librería',
        featured: 0,
      },
      {
        name: 'Mate de Calabaza con Virola',
        description: 'Mate de calabaza artesanal con virola de alpaca y bombilla incluida.',
        price: '$7.500',
        image: 'https://images.unsplash.com/photo-1585400882220-f3e4e4c5d0f8?w=600&h=600&fit=crop',
        category: 'Comida',
        featured: 1,
      },
      {
        name: 'Tabla de Fiambres Premium',
        description: 'Tabla de madera nativa para fiambres y quesos, con accesorios incluidos.',
        price: '$18.000',
        image: 'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=600&h=600&fit=crop',
        category: 'Comida',
        featured: 0,
      },
    ];

    for (const product of seedProducts) {
      await client.execute({
        sql: `INSERT INTO products (name, description, price, image, category, featured, active, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        args: [
          product.name,
          product.description,
          product.price,
          product.image,
          product.category,
          product.featured,
        ],
      });
    }

    return NextResponse.json({
      message: `Se insertaron ${seedProducts.length} productos exitosamente.`,
      seeded: true,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Error al hacer seed de la base de datos', details: String(error) },
      { status: 500 }
    );
  }
}
