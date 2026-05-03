import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db
      .select({
        category: products.category,
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(sql`${products.active} = 1`)
      .groupBy(products.category);

    const categories = result.map((r) => r.category);
    const total = result.reduce((sum, r) => sum + Number(r.count), 0);

    return NextResponse.json({
      categories,
      counts: result.map((r) => ({ category: r.category, count: Number(r.count) })),
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
