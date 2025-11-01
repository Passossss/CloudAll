import { useState, useCallback } from 'react';
import { reportService, ReportFilters } from '../services';
import type { ReportSummary, CashFlowReport } from '../services/types';
import { useAuth } from '../components/contexts/AuthContext';

// ============================================
// Types
// ============================================

export interface UseReportsResult {
  loading: boolean;
  error: Error | null;
  getSummary: (filters: ReportFilters) => Promise<ReportSummary>;
  getCashFlow: (from: string, to: string, accountId?: string) => Promise<CashFlowReport>;
  getMonthlyReport: (months?: number) => Promise<any>;
  exportToPDF: (filters: ReportFilters) => Promise<void>;
  exportToExcel: (filters: ReportFilters) => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useReports(): UseReportsResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSummary = useCallback(async (filters: ReportFilters) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const report = await reportService.getSummary(filters);
      return report;
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao gerar relatório de resumo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getCashFlow = useCallback(async (from: string, to: string, accountId?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const report = await reportService.getCashFlow(from, to, accountId);
      return report;
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao gerar relatório de fluxo de caixa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getMonthlyReport = useCallback(async (months: number = 12) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const report = await reportService.getMonthly(months);
      return report;
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao gerar relatório mensal:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const exportToPDF = useCallback(async (filters: ReportFilters) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const blob = await reportService.exportToPDF(filters);
      
      // Criar URL temporário e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao exportar relatório em PDF:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const exportToExcel = useCallback(async (filters: ReportFilters) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const blob = await reportService.exportToExcel(filters);
      
      // Criar URL temporário e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao exportar relatório em Excel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    getSummary,
    getCashFlow,
    getMonthlyReport,
    exportToPDF,
    exportToExcel,
  };
}
