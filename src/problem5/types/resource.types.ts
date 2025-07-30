export interface Resource {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface ResourceFilters {
  name?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}
