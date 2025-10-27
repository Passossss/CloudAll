import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { CreditCard, Plus, Eye, EyeOff, MoreVertical } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function Cards() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>({});
  
  const [cards, setCards] = useState([
    {
      id: "1",
      name: "Cartão Principal",
      type: "Crédito",
      brand: "Visa",
      lastFour: "4532",
      limit: 5000,
      used: 1250,
      color: "bg-gradient-to-r from-blue-600 to-blue-800"
    },
    {
      id: "2", 
      name: "Cartão Estudante",
      type: "Débito",
      brand: "Mastercard",
      lastFour: "8901",
      limit: 2000,
      used: 450,
      color: "bg-gradient-to-r from-purple-600 to-purple-800"
    },
    {
      id: "3",
      name: "Cartão Digital",
      type: "Crédito",
      brand: "Elo",
      lastFour: "2345",
      limit: 3000,
      used: 890,
      color: "bg-gradient-to-r from-green-600 to-green-800"
    }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    limit: "",
    lastFour: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      brand: formData.brand,
      lastFour: formData.lastFour,
      limit: parseFloat(formData.limit),
      used: 0,
      color: "bg-gradient-to-r from-orange-600 to-orange-800"
    };
    
    setCards(prev => [...prev, newCard]);
    toast.success("Cartão adicionado com sucesso!");
    setFormData({ name: "", type: "", brand: "", limit: "", lastFour: "" });
    setShowAddCard(false);
  };

  const toggleCardVisibility = (cardId: string) => {
    setVisibleCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const formatCardNumber = (lastFour: string, visible: boolean) => {
    if (visible) {
      return `**** **** **** ${lastFour}`;
    }
    return "**** **** **** ****";
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Cartões</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie seus cartões de crédito e débito</p>
        </div>
        
        <Button onClick={() => setShowAddCard(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Novo Cartão</CardTitle>
            <CardDescription>Adicione um novo cartão ao seu portfólio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-name">Nome do Cartão</Label>
                <Input
                  id="card-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Cartão Principal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bandeira" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="Elo">Elo</SelectItem>
                      <SelectItem value="American Express">American Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limit">Limite</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastFour">Últimos 4 dígitos</Label>
                  <Input
                    id="lastFour"
                    value={formData.lastFour}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastFour: e.target.value }))}
                    placeholder="0000"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Adicionar Cartão
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddCard(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isVisible = visibleCards[card.id];
          const usagePercentage = getUsagePercentage(card.used, card.limit);
          
          return (
            <Card key={card.id} className="overflow-hidden">
              {/* Card Visual */}
              <div className={`${card.color} p-6 text-white relative`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/80 text-sm">{card.name}</p>
                    <p className="text-white/60 text-xs">{card.type} • {card.brand}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 text-white hover:bg-white/20"
                      onClick={() => toggleCardVisibility(card.id)}
                    >
                      {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 text-white hover:bg-white/20"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-mono tracking-wider">
                    {formatCardNumber(card.lastFour, isVisible)}
                  </p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-white/80" />
                    <span className="text-sm">
                      {card.type === "Crédito" ? "Limite disponível" : "Saldo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {card.type === "Crédito" ? "Utilizado" : "Gasto hoje"}
                    </span>
                    <span className="font-semibold">
                      R$ {card.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Uso: {usagePercentage}%</span>
                      <span>R$ {(card.limit - card.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} disponível</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          usagePercentage > 80 ? 'bg-red-500' : 
                          usagePercentage > 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant={card.type === "Crédito" ? "default" : "secondary"}>
                      {card.type}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Final {card.lastFour}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}