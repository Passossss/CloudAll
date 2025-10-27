import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  transactionCount: number;
  totalAmount: number;
}

const initialCategories: Category[] = [
  { id: 1, name: 'Salário', color: '#10b981', icon: '💰', type: 'income', transactionCount: 2, totalAmount: 5300 },
  { id: 2, name: 'Freelance', color: '#3b82f6', icon: '💻', type: 'income', transactionCount: 1, totalAmount: 800 },
  { id: 3, name: 'Investimentos', color: '#8b5cf6', icon: '📈', type: 'income', transactionCount: 1, totalAmount: 150 },
  { id: 4, name: 'Alimentação', color: '#f87b07', icon: '🍕', type: 'expense', transactionCount: 8, totalAmount: 1200 },
  { id: 5, name: 'Transporte', color: '#ef4444', icon: '🚗', type: 'expense', transactionCount: 5, totalAmount: 450 },
  { id: 6, name: 'Lazer', color: '#06b6d4', icon: '🎮', type: 'expense', transactionCount: 3, totalAmount: 280 },
  { id: 7, name: 'Saúde', color: '#84cc16', icon: '🏥', type: 'expense', transactionCount: 2, totalAmount: 320 },
  { id: 8, name: 'Casa', color: '#d946ef', icon: '🏠', type: 'expense', transactionCount: 4, totalAmount: 650 },
  { id: 9, name: 'Educação', color: '#f59e0b', icon: '📚', type: 'expense', transactionCount: 1, totalAmount: 199 },
];

const colorOptions = [
  '#f87b07', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f59e0b', '#d946ef', '#6b7280'
];

const iconOptions = [
  '💰', '💻', '📈', '🍕', '🚗', '🎮', '🏥', '🏠', '📚', '🛒',
  '⚡', '📱', '🎬', '🏋️', '✈️', '🎨', '🔧', '👕', '🎵', '📝'
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredCategories = categories.filter(category => 
    filterType === 'all' || category.type === filterType
  );

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const totalIncomeCategories = incomeCategories.length;
  const totalExpenseCategories = expenseCategories.length;

  const CategoryForm = () => {
    const [selectedColor, setSelectedColor] = useState(editingCategory?.color || colorOptions[0]);
    const [selectedIcon, setSelectedIcon] = useState(editingCategory?.icon || iconOptions[0]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Categoria</Label>
          <Input 
            id="name" 
            placeholder="Ex: Supermercado, Transporte, etc." 
            defaultValue={editingCategory?.name}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select defaultValue={editingCategory?.type || 'expense'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  selectedColor === color ? 'border-primary scale-110' : 'border-border hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ícone</Label>
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                  selectedIcon === icon ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:scale-105 hover:bg-muted'
                }`}
                onClick={() => setSelectedIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: selectedColor + '20', color: selectedColor }}
            >
              {selectedIcon}
            </div>
            <span className="font-medium">Nova Categoria</span>
            <Badge 
              variant="secondary" 
              className="ml-auto"
              style={{ backgroundColor: selectedColor + '20', color: selectedColor }}
            >
              {editingCategory?.type === 'income' ? 'Receita' : 'Despesa'}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Categorias</h1>
          <p className="text-muted-foreground">Organize suas transações com categorias personalizadas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Categorias</p>
                <p className="text-2xl font-semibold">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Categorias de Receita</p>
                <p className="text-2xl font-semibold text-green-800 dark:text-green-100">{totalIncomeCategories}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Categorias de Despesa</p>
                <p className="text-2xl font-semibold text-red-800 dark:text-red-100">{totalExpenseCategories}</p>
              </div>
              <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
                <span className="text-lg">🛒</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="income">Apenas receitas</SelectItem>
              <SelectItem value="expense">Apenas despesas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                    style={{ 
                      backgroundColor: category.color + '20',
                      color: category.color
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${
                        category.type === 'income' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {category.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transações:</span>
                  <span className="font-medium">{category.transactionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span 
                    className="font-medium"
                    style={{ color: category.color }}
                  >
                    R$ {category.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              {/* Usage bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uso no mês</span>
                  <span>{Math.min(100, (category.transactionCount / 10) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (category.transactionCount / 10) * 100)}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {filterType === 'all' 
                ? 'Você ainda não criou nenhuma categoria.'
                : `Não há categorias do tipo "${filterType === 'income' ? 'receita' : 'despesa'}".`
              }
            </p>
            <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}