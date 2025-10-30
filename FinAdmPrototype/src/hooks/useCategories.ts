import { useState, useEffect, useCallback } from 'react';
import {
  categoryService,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryType,
} from '../services/categoryService';
import { useAuth } from '../components/contexts/AuthContext';

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  createCategory: (data: Omit<CreateCategoryData, 'userId'>) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export function useCategories(type?: CategoryType | 'all'): UseCategoriesResult {
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
      const categoriesData = await categoryService.list(user.id, type);
      setCategories(categoriesData);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  const createCategory = useCallback(async (data: Omit<CreateCategoryData, 'userId'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const category = await categoryService.create({
      ...data,
      userId: user.id,
    });

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
    refreshCategories,
  };
}
