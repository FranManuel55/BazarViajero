import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products);

    const activeResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.active, 1));

    const featuredResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.featured, 1));

    return NextResponse.json({
      total: totalResult[0].count,
      active: activeResult[0].count,
      featured: featuredResult[0].count,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
