'use server';

import { prisma } from '@/lib/prisma';

/**
 * Fetches a list of unique category names from the Product table.
 * @returns Promise<string[]> - A promise that resolves to an array of unique category strings.
 */
export async function getCategories(): Promise<string[]> {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });
    // Filter out potential null/empty strings if necessary and return unique names
    return categories.map(c => c.category).filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return []; // Return empty array on error
  }
}
