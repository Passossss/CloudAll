import api from './api';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
  transactionCount?: number;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  userId: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  icon?: string;
  type?: CategoryType;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

class CategoryService {
  /**
   * Cria uma nova categoria
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<{ category: Category }>('/categories', data);
    return response.data.category;
  }

  /**
   * Lista todas as categorias do usuário
   */
  async list(userId: string, type?: CategoryType | 'all'): Promise<Category[]> {
    const params = type && type !== 'all' ? `?type=${type}` : '';
    const response = await api.get<CategoryListResponse>(`/categories/user/${userId}${params}`);
    return response.data.categories;
  }

  /**
   * Obtém uma categoria específica
   */
  async getById(categoryId: string): Promise<Category> {
    const response = await api.get<{ category: Category }>(`/categories/${categoryId}`);
    return response.data.category;
  }

  /**
   * Atualiza uma categoria
   */
  async update(categoryId: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put<{ category: Category }>(`/categories/${categoryId}`, data);
    return response.data.category;
  }

  /**
   * Deleta uma categoria
   */
  async delete(categoryId: string): Promise<void> {
    await api.delete(`/categories/${categoryId}`);
  }

  /**
   * Obtém estatísticas de uso de uma categoria
   */
  async getStats(categoryId: string): Promise<{
    transactionCount: number;
    totalAmount: number;
    lastUsed?: string;
  }> {
    const response = await api.get(`/categories/${categoryId}/stats`);
    return response.data;
  }

  /**
   * Lista categorias padrão do sistema (para novos usuários)
   */
  async getDefaultCategories(): Promise<Category[]> {
    const response = await api.get<{ categories: Category[] }>('/categories/defaults');
    return response.data.categories;
  }
}

export const categoryService = new CategoryService();
