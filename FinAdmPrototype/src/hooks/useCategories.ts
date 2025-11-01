import { useState, useEffect, useCallback } from 'react';
import {
  categoryService,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
} from '../services';
import type { Category, CategoryType } from '../services/types';
import { useAuth } from '../components/contexts/AuthContext';

// ============================================
// Types
// ============================================

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
  importDefaults: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useCategories(filters?: CategoryFilters): UseCategoriesResult {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoriesData = await categoryService.list(filters);
      setCategories(categoriesData);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const createCategory = useCallback(async (data: CreateCategoryData) => {
    if (!user) throw new Error('Usuário não autenticado');

    const category = await categoryService.create(data);

    // Recarregar lista após criar
    await loadCategories();

    return category;
  }, [user, loadCategories]);

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryData) => {
    const category = await categoryService.update(id, data);

    // Recarregar lista após atualizar
    await loadCategories();

    return category;
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    await categoryService.delete(id);

    // Recarregar lista após deletar
    await loadCategories();
  }, [loadCategories]);

  const reorderCategories = useCallback(async (categoryIds: string[]) => {
    await categoryService.reorder(categoryIds);

    // Recarregar lista após reordenar
    await loadCategories();
  }, [loadCategories]);

  const importDefaults = useCallback(async () => {
    if (!user) throw new Error('Usuário não autenticado');

    await categoryService.importDefaults();

    // Recarregar lista após importar
    await loadCategories();
  }, [user, loadCategories]);

  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    importDefaults,
    refreshCategories,
  };
}
