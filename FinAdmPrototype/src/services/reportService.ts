import api from './api';
import type { ReportSummary, ReportGroupBy, CashFlowReport } from './types';

// ============================================
// Types
// ============================================

export interface ReportFilters {
  from: string;
  to: string;
  groupBy?: ReportGroupBy;
  accountId?: string;
  categoryId?: string;
}

export interface IncomeExpenseReport {
  period: {
    from: string;
    to: string;
  };
  income: {
    total: number;
    count: number;
    average: number;
  };
  expense: {
    total: number;
    count: number;
    average: number;
  };
  balance: number;
  savingsRate: number;
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  type: 'income' | 'expense';
  total: number;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

// ============================================
// Report Service
// ============================================

class ReportService {
  /**
   * Obtém resumo financeiro com agrupamento
   * GET /reports/summary
   */
  async getSummary(filters: ReportFilters): Promise<ReportSummary> {
    const params = new URLSearchParams();
    
    params.append('from', filters.from);
    params.append('to', filters.to);
    
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }
    if (filters.accountId) {
      params.append('accountId', filters.accountId);
    }
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId);
    }

    const response = await api.get<{ report: ReportSummary }>(`/reports/summary?${params.toString()}`);
    return response.data.report;
  }

  /**
   * Obtém relatório de fluxo de caixa
   * GET /reports/cashflow
   */
  async getCashFlow(from: string, to: string, accountId?: string): Promise<CashFlowReport> {
    const params = new URLSearchParams();
    
    params.append('from', from);
    params.append('to', to);
    
    if (accountId) {
      params.append('accountId', accountId);
    }

    const response = await api.get<{ report: CashFlowReport }>(`/reports/cashflow?${params.toString()}`);
    return response.data.report;
  }

  /**
   * Obtém relatório de receitas vs despesas
   * GET /reports/income-expense
   */
  async getIncomeExpense(from: string, to: string): Promise<IncomeExpenseReport> {
    const params = new URLSearchParams();
    
    params.append('from', from);
    params.append('to', to);

    const response = await api.get<{ report: IncomeExpenseReport }>(
      `/reports/income-expense?${params.toString()}`
    );
    return response.data.report;
  }

  /**
   * Obtém relatório por categorias
   * GET /reports/by-category
   */
  async getByCategory(from: string, to: string, type?: 'income' | 'expense'): Promise<CategoryReport[]> {
    const params = new URLSearchParams();
    
    params.append('from', from);
    params.append('to', to);
    
    if (type) {
      params.append('type', type);
    }

    const response = await api.get<{ categories: CategoryReport[] }>(
      `/reports/by-category?${params.toString()}`
    );
    return response.data.categories;
  }

  /**
   * Obtém relatório mensal (últimos 12 meses)
   * GET /reports/monthly
   */
  async getMonthly(months: number = 12): Promise<MonthlyReport[]> {
    const response = await api.get<{ months: MonthlyReport[] }>(
      `/reports/monthly?months=${months}`
    );
    return response.data.months;
  }

  /**
   * Obtém comparação entre períodos
   * GET /reports/compare
   */
  async comparePeriods(
    period1From: string,
    period1To: string,
    period2From: string,
    period2To: string
  ): Promise<{
    period1: IncomeExpenseReport;
    period2: IncomeExpenseReport;
    comparison: {
      incomeChange: number;
      expenseChange: number;
      balanceChange: number;
    };
  }> {
    const params = new URLSearchParams();
    
    params.append('period1From', period1From);
    params.append('period1To', period1To);
    params.append('period2From', period2From);
    params.append('period2To', period2To);

    const response = await api.get(`/reports/compare?${params.toString()}`);
    return response.data;
  }

  /**
   * Exporta relatório para PDF
   * GET /reports/export/pdf
   */
  async exportToPDF(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    params.append('from', filters.from);
    params.append('to', filters.to);
    
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }
    if (filters.accountId) {
      params.append('accountId', filters.accountId);
    }

    const response = await api.get(`/reports/export/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Exporta relatório para Excel
   * GET /reports/export/excel
   */
  async exportToExcel(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    params.append('from', filters.from);
    params.append('to', filters.to);
    
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const response = await api.get(`/reports/export/excel?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }
}

export const reportService = new ReportService();
