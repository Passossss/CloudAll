import api from './api';
import type { Category, CategoryType } from './types';

// ============================================
// Types
// ============================================

export interface CreateCategoryData {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
}

export interface UpdateCategoryData {
  name?: string;
  type?: CategoryType;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface CategoryFilters {
  type?: CategoryType | 'all';
  search?: string;
}

export interface CategoryStats {
  transactionCount: number;
  totalAmount: number;
  lastUsed?: string;
  monthlyAverage?: number;
}

// ============================================
// Category Service
// ============================================

class CategoryService {
  /**
   * Lista todas as categorias do usuário
   * GET /categories
   */
  async list(filters?: CategoryFilters): Promise<Category[]> {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.search) {
      params.append('q', filters.search);
    }

    const queryString = params.toString();
    const url = `/categories${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ categories: Category[] }>(url);
    return response.data.categories;
  }

  /**
   * Obtém uma categoria específica
   * GET /categories/:id
   */
  async getById(categoryId: string): Promise<Category> {
    const response = await api.get<{ category: Category }>(`/categories/${categoryId}`);
    return response.data.category;
  }

  /**
   * Cria uma nova categoria
   * POST /categories
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<{ category: Category }>('/categories', data);
    return response.data.category;
  }

  /**
   * Atualiza uma categoria
   * PUT /categories/:id
   */
  async update(categoryId: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put<{ category: Category }>(`/categories/${categoryId}`, data);
    return response.data.category;
  }

  /**
   * Deleta uma categoria
   * DELETE /categories/:id
   */
  async delete(categoryId: string): Promise<void> {
    await api.delete(`/categories/${categoryId}`);
  }

  /**
   * Obtém estatísticas de uso de uma categoria
   * GET /categories/:id/stats
   */
  async getStats(categoryId: string): Promise<CategoryStats> {
    const response = await api.get<{ stats: CategoryStats }>(`/categories/${categoryId}/stats`);
    return response.data.stats;
  }

  /**
   * Lista categorias padrão do sistema (para novos usuários)
   * GET /categories/defaults
   */
  async getDefaults(): Promise<Category[]> {
    const response = await api.get<{ categories: Category[] }>('/categories/defaults');
    return response.data.categories;
  }

  /**
   * Importa categorias padrão para o usuário
   * POST /categories/import-defaults
   */
  async importDefaults(): Promise<Category[]> {
    const response = await api.post<{ categories: Category[] }>('/categories/import-defaults');
    return response.data.categories;
  }

  /**
   * Reordena categorias (para drag & drop)
   * PUT /categories/reorder
   */
  async reorder(categoryIds: string[]): Promise<void> {
    await api.put('/categories/reorder', { categoryIds });
  }
}

export const categoryService = new CategoryService();
