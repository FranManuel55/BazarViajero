import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { sql, eq } from 'drizzle-orm';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/categories
 * Returns all categories with product counts.
 */
export async function GET() {
  try {
    // Get all categories from the categories table
    const allCategories = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(categories.name);

    // Get product counts per category (active products only)
    const productCounts = await db
      .select({
        category: products.category,
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(eq(products.active, 1))
      .groupBy(products.category);

    const countMap = new Map(
      productCounts.map((r) => [r.category, Number(r.count)])
    );

    const total = productCounts.reduce((sum, r) => sum + Number(r.count), 0);

    const counts = allCategories.map((cat) => ({
      category: cat.name,
      count: countMap.get(cat.name) || 0,
    }));

    return NextResponse.json({
      categories: allCategories.map((c) => c.name),
      counts,
      total,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Creates a new category. Requires admin session.
 * Body: { name: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const trimmed = name.trim();

    // Check for duplicates
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, trimmed))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 409 }
      );
    }

    const newCategory = await db
      .insert(categories)
      .values({ name: trimmed })
      .returning();

    return NextResponse.json({ category: newCategory[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories
 * Deletes a category by name. Requires admin session.
 * Body: { name: string }
 * Returns 409 if the category has products assigned.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    // Check if there are products using this category
    const productCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.category, name));

    if (productCount[0].count > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar: hay ${productCount[0].count} producto(s) en esta categoría. Reasignalos primero.`,
        },
        { status: 409 }
      );
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.name, name))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}
