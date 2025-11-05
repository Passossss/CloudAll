import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import finLogo from "figma:asset/cb6e84f9267ba7d9df65b2df986e7030850c04ce.png";

interface LoginProps {
  onPageChange: (page: string) => void;
}

export function Login({ onPageChange }: LoginProps) {
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Validar email
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);

      // Salvar preferência "Lembrar de mim"
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      toast.success(`Bem-vindo de volta!`);
      onPageChange('dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.message || 'Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F87B07] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={finLogo} alt="Fin" className="w-16 h-16" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">FinApp</h1>
            <h2 className="text-xl font-medium text-gray-900 mb-1">Entre para controlar suas finanças</h2>
            <p className="text-gray-600 text-sm">Seu gerenciador financeiro pessoal</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={`w-full h-12 px-4 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? 'border border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    setErrors(prev => ({ ...prev, password: "" }));
                  }}
                  className={`w-full h-12 px-4 pr-12 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                    errors.password ? 'border border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Lembrar e Esqueceu senha */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Lembrar de mim
                </label>
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm text-[#F87B07] hover:text-[#f87b07]/80"
                onClick={() => onPageChange('forgot-password')}
                disabled={isLoading}
              >
                Esqueceu a senha?
              </Button>
            </div>

            {/* Botão Entrar */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#F87B07] hover:bg-[#f87b07]/90 text-white font-medium rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Criar Conta */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?
            </p>
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-lg"
              onClick={() => onPageChange('create-account')}
              disabled={isLoading}
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/90 mt-6 font-medium">
          © 2024 FinApp - Gestão Financeira Inteligente
        </p>
      </div>
    </div>
  );
}
