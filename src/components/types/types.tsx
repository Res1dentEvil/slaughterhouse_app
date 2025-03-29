export interface Movement {
  id: number;
  date: string;
  from: string;
  to: string;
  who: string;
  createdAt: string;
  updatedAt: string;
  details: Detail[];
}

export interface Detail {
  quantity?: number;
  weight?: number;
  product: string;
  category?: string;
  price?: number;
  totalPrice?: number;
  comment?: string;
}
