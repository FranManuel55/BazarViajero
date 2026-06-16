import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  image: text('image'),
  category: text('category').notNull(),
  featured: integer('featured').default(0),
  active: integer('active').default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at'),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
