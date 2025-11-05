import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Shield, Users, Plus, Settings } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: {
    dashboard: boolean;
    users: boolean;
    transactions: boolean;
    reports: boolean;
    settings: boolean;
    admin: boolean;
  };
}

const initialPermissions: Permission[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'Acesso total ao sistema com todas as permissões administrativas',
    userCount: 3,
    permissions: {
      dashboard: true,
      users: true,
      transactions: true,
      reports: true,
      settings: true,
      admin: true,
    }
  },
  {
    id: 2,
    name: 'Usuário Normal',
    description: 'Acesso básico para gerenciar finanças pessoais',
    userCount: 45,
    permissions: {
      dashboard: true,
      users: false,
      transactions: true,
      reports: true,
      settings: false,
      admin: false,
    }
  },
  {
    id: 3,
    name: 'Convidado',
    description: 'Acesso limitado apenas para visualização',
    userCount: 12,
    permissions: {
      dashboard: true,
      users: false,
      transactions: false,
      reports: false,
      settings: false,
      admin: false,
    }
  }
];

export function PermissionManagement() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setIsDialogOpen(true);
  };

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsDialogOpen(true);
  };

  const PermissionForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Permissão</Label>
        <Input id="name" placeholder="Ex: Gerente" defaultValue={editingPermission?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          placeholder="Descreva as responsabilidades desta permissão..." 
          defaultValue={editingPermission?.description}
        />
      </div>
      
      <div className="space-y-4">
        <Label>Permissões do Sistema</Label>
        <div className="space-y-3">
          {[
            { key: 'dashboard', label: 'Dashboard', description: 'Ver dashboard principal' },
            { key: 'users', label: 'Usuários', description: 'Gerenciar usuários do sistema' },
            { key: 'transactions', label: 'Transações', description: 'Ver e editar transações' },
            { key: 'reports', label: 'Relatórios', description: 'Gerar e visualizar relatórios' },
            { key: 'settings', label: 'Configurações', description: 'Alterar configurações do sistema' },
            { key: 'admin', label: 'Administração', description: 'Acesso total administrativo' },
          ].map((perm) => (
            <div key={perm.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{perm.label}</p>
                <p className="text-sm text-gray-600">{perm.description}</p>
              </div>
              <Switch 
                defaultChecked={editingPermission?.permissions[perm.key as keyof Permission['permissions']] || false}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg">
          {editingPermission ? 'Salvar Alterações' : 'Criar Permissão'}
        </Button>
        <Button onClick={() => setIsDialogOpen(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold">
          Cancelar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Permissões</h1>
          <p className="text-gray-600">Configure os níveis de acesso do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddPermission} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Permissão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
              </DialogTitle>
            </DialogHeader>
            <PermissionForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {permissions.map((permission) => (
          <Card key={permission.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    permission.name === 'Admin' ? 'bg-red-100 text-red-600' :
                    permission.name === 'Usuário Normal' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{permission.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{permission.userCount} usuários</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPermission(permission)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{permission.description}</p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Permissões:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(permission.permissions).map(([key, value]) => {
                    if (!value) return null;
                    const labels: Record<string, string> = {
                      dashboard: 'Dashboard',
                      users: 'Usuários',
                      transactions: 'Transações',
                      reports: 'Relatórios',
                      settings: 'Configurações',
                      admin: 'Admin'
                    };
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {labels[key]}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Matrix de Permissões</CardTitle>
          <p className="text-sm text-gray-600">Visão geral de todas as permissões por perfil</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Perfil</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Dashboard</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Usuários</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Transações</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Relatórios</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Configurações</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Admin</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{permission.name}</td>
                    {Object.values(permission.permissions).map((hasPermission, index) => (
                      <td key={index} className="py-3 px-4 text-center">
                        {hasPermission ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}