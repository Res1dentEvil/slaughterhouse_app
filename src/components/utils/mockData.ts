import { Movement } from '../types/types';

export const initialData: Movement[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  date: `2025-03-${12 + i}`,
  from: `Ферма ${i + 1}`,
  to: `Ферма ${i + 2}`,
  who: `Працівник ${i + 1}`,
  createdAt: `2025-03-${10 + i}`,
  updatedAt: `2025-03-${11 + i}`,
  details: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
    const quantity = Math.floor(Math.random() * 100);
    const weight = parseFloat((Math.random() * 50).toFixed(2));
    const price = parseFloat((Math.random() * 1000).toFixed(2));
    return {
      quantity,
      weight,
      product: ['Свині', 'Телята'][Math.floor(Math.random() * 2)],
      category: `Категорія ${Math.floor(Math.random() * 5) + 1}`,
      price,
      totalPrice: weight && price ? parseFloat((weight * price).toFixed(0)) : undefined,
      comment: `Коментар ${i + 1}`,
    };
  }),
}));
