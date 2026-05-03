import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, like, and, or, sql, desc } from 'drizzle-orm';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured');
    const activeOnly = searchParams.get('active') !== 'false';

    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(products.active, 1));
    }

    if (category && category !== 'Todos') {
      conditions.push(eq(products.category, category));
    }

    if (featured === 'true') {
      conditions.push(eq(products.featured, 1));
    }

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereClause);

    const total = countResult[0].count;

    // Get paginated results
    const offset = (page - 1) * limit;
    const items = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      products: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, image, category, featured, active } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Nombre, precio y categoría son obligatorios' },
        { status: 400 }
      );
    }

    const newProduct = await db.insert(products).values({
      name,
      description: description || '',
      price,
      image: image || '',
      category,
      featured: featured ? 1 : 0,
      active: active !== false ? 1 : 0,
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
