import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { User, Shield, Mail, Phone, Bell, Lock, Palette, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useUser } from "../contexts/UserContext";

export function Settings() {
  const { userType, setUserType } = useUser();
  const [profileData, setProfileData] = useState({
    name: "Gustavo Passos",
    email: "gustavo@email.com",
    phone: "(11) 99999-9999",
    language: "pt-BR"
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transactions: true,
    reports: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: true
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  const handleUserTypeChange = (type: 'admin' | 'normal') => {
    setUserType(type);
    toast.success(`Perfil alterado para ${type === 'admin' ? 'Administrador' : 'Usuário Normal'}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Configurações</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      {/* Perfil do Usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Perfil do Usuário</CardTitle>
                <CardDescription>Informações básicas da sua conta</CardDescription>
              </div>
            </div>
            <Badge variant={userType === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
              {userType === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {userType === 'admin' ? 'Administrador' : 'Usuário Normal'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={profileData.language} onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Tipo de Usuário</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Administradores têm acesso completo ao sistema
                </p>
              </div>
              <Select value={userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Usuário Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium">Notificações por E-mail</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações no seu e-mail</p>
                </div>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações no dispositivo</p>
                </div>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transações</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas sobre novas transações</p>
              </div>
              <Switch
                checked={notifications.transactions}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, transactions: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resumos mensais e relatórios</p>
              </div>
              <Switch
                checked={notifications.reports}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reports: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Configurações de segurança da sua conta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Autenticação de Dois Fatores</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adiciona uma camada extra de segurança</p>
            </div>
            <Switch
              checked={security.twoFactor}
              onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login Biométrico</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use impressão digital ou Face ID</p>
            </div>
            <Switch
              checked={security.biometric}
              onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, biometric: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full">
              Gerenciar Dispositivos Conectados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}