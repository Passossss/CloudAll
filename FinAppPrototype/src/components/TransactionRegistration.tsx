import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";
import { apiService } from "../services/api";

export function TransactionRegistration() {
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const { user } = useUser();

  // Load transactions for the current user
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      const res = await apiService.getTransactionsByUser(user.id);
      if (res && res.data) {
        if (mounted) {
          // expect res.data to be an array of transactions
          setTransactions(res.data || []);
        }
      } else {
        // keep empty list
        setTransactions([]);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const categories = [
    { name: "food", type: "expense", color: "#ef4444", label: "Alimentação" },
    { name: "transport", type: "expense", color: "#3b82f6", label: "Transporte" },
    { name: "salary", type: "income", color: "#10b981", label: "Salário" },
    { name: "entertainment", type: "expense", color: "#8b5cf6", label: "Entretenimento" },
    { name: "shopping", type: "expense", color: "#f59e0b", label: "Compras" },
    { name: "bills", type: "expense", color: "#ef4444", label: "Contas" },
    { name: "health", type: "expense", color: "#10b981", label: "Saúde" },
    { name: "education", type: "expense", color: "#3b82f6", label: "Educação" },
    { name: "freelance", type: "income", color: "#10b981", label: "Freelance" },
    { name: "investment", type: "income", color: "#8b5cf6", label: "Investimento" },
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const selectedCategory = categories.find(cat => cat.name === formData.category);
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === "Despesa" ? -Math.abs(amount) : Math.abs(amount);
    
    const type: 'income' | 'expense' = formData.type === 'Receita' ? 'income' : 'expense';

    if (!user) {
      toast.error('Você precisa estar logado para registrar transações');
      return;
    }

    const payload = {
      userId: user.id,
      amount: finalAmount,
      description: formData.description,
      category: formData.category,
      type,
      date: formData.date
    };

    apiService.createTransaction(payload).then(res => {
      if (res && res.data) {
        // Refetch transactions after creating
        if (user) {
          apiService.getTransactionsByUser(user.id).then(r => {
            if (r && r.data) {
              setTransactions(r.data || []);
            }
          });
        }
        toast.success("Transação registrada com sucesso!");
        setFormData({
          type: "",
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        toast.error(res.error || 'Erro ao criar transação');
      }
    }).catch(err => {
      console.error('createTransaction error', err);
      toast.error('Erro de conexão ao criar transação');
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(cat => 
    !formData.type || cat.type === formData.type
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Registro de Transações</h2>
        <p className="text-gray-600 mt-1">Acompanhe suas receitas e despesas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Transação</CardTitle>
            <CardDescription>
              Registre uma nova receita ou despesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Transação</Label>
                <Select onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        Receita
                      </div>
                    </SelectItem>
                    <SelectItem value="Despesa">
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-red-600" />
                        Despesa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="0,00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  onValueChange={(value) => handleChange("category", value)}
                  disabled={!formData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descreva a transação (opcional)"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Registrar Transação
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Últimas transações registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: transaction.color + "20" }}
                    >
                      {transaction.type === "Receita" ? (
                        <ArrowUp className="h-5 w-5" style={{ color: transaction.color }} />
                      ) : (
                        <ArrowDown className="h-5 w-5" style={{ color: transaction.color }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}{formatCurrency(transaction.amount)}
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={async () => {
                          try {
                            // If transaction has an id expected by API
                            if (transaction.id && user) {
                              const res = await apiService.deleteTransaction(transaction.id.toString());
                              if (res && !res.error) {
                                setTransactions(prev => (prev || []).filter(t => t.id !== transaction.id));
                                toast.success('Transação removida');
                              } else {
                                toast.error(res.error || 'Erro ao remover transação');
                              }
                            }
                          } catch (err) {
                            console.error('deleteTransaction error', err);
                            toast.error('Erro de conexão ao remover');
                          }
                        }}
                      >Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}