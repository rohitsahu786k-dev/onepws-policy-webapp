import Category from '@/models/Category';

export const DEFAULT_CATEGORIES = [
  'CERTIFICATES',
  'COMPANY POLICIES',
  'PRODUCT DISCLOSURES',
  'GENERAL PUBLIC DISCLOSURES',
];

export async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((name) =>
      Category.updateOne(
        { name: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
        { $setOnInsert: { name } },
        { upsert: true }
      )
    )
  );

  return Category.find({}).sort({ name: 1 });
}

export function inferCategoryNameFromFile(fileName: string) {
  const normalized = fileName.toLowerCase();

  if (normalized.includes('certificate') || normalized.includes('certification')) {
    return 'CERTIFICATES';
  }

  if (normalized.includes('product') || normalized.includes('disclosure')) {
    return 'PRODUCT DISCLOSURES';
  }

  if (normalized.includes('public') || normalized.includes('visitor') || normalized.includes('general')) {
    return 'GENERAL PUBLIC DISCLOSURES';
  }

  return 'COMPANY POLICIES';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
