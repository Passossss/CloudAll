import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function CategoryRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "#f87b07",
    description: ""
  });

  const [categories, setCategories] = useState([
    { id: 1, name: "Alimentação", type: "Despesa", color: "#ef4444" },
    { id: 2, name: "Transporte", type: "Despesa", color: "#3b82f6" },
    { id: 3, name: "Salário", type: "Receita", color: "#10b981" },
    { id: 4, name: "Entretenimento", type: "Despesa", color: "#8b5cf6" },
  ]);

  const colors = [
    "#f87b07", "#ef4444", "#3b82f6", "#10b981", 
    "#8b5cf6", "#f59e0b", "#06b6d4", "#84cc16"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      color: formData.color
    };
    setCategories(prev => [...prev, newCategory]);
    toast.success("Categoria cadastrada com sucesso!");
    setFormData({
      name: "",
      type: "",
      color: "#f87b07",
      description: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const deleteCategory = (id: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast.success("Categoria removida!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Cadastro de Categorias</h2>
        <p className="text-gray-600 mt-1">Organize suas transações por categorias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
            <CardDescription>
              Crie categorias para classificar suas receitas e despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Alimentação, Transporte, Salário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleChange("color", color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descrição da categoria"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Categoria
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias Existentes</CardTitle>
            <CardDescription>
              Gerencie suas categorias cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <Badge
                        variant={category.type === "Receita" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}