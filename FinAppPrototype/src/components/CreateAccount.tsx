import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import finLogo from "figma:asset/cb6e84f9267ba7d9df65b2df986e7030850c04ce.png"; 
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";

interface CreateAccountProps {
  onPageChange: (page: string) => void;
}

export function CreateAccount({ onPageChange }: CreateAccountProps) {
  const { register } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);        
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    const newErrors = { fullName: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    // Validar nome
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório";
      isValid = false;
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Nome deve ter pelo menos 3 caracteres";
      isValid = false;
    }

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
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
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

    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.fullName.trim(),
      });
      toast.success('Conta criada com sucesso!');
      onPageChange('dashboard');
    } catch (error: any) {
      // Error already handled by useAuth hook
      console.error('Erro ao criar conta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F87B07] dark:bg-[#c85f05] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={finLogo} alt="Fin" className="w-16 h-16" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">App Fin</h1>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Criar sua conta</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Preencha os dados para começar</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome completo</label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, fullName: e.target.value }));
                  setErrors(prev => ({ ...prev, fullName: "" }));
                }}
                className={`w-full h-12 px-4 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                  errors.fullName ? 'border border-red-500' : ''
                }`}
                required
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
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
                required
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha</label>
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
                  required
                  minLength={6}
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

            {/* Confirmar senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`w-full h-12 px-4 pr-12 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                    errors.confirmPassword ? 'border border-red-500' : ''
                  }`}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Termos */}
            <div className="flex items-start space-x-2 py-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                className="mt-0.5"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Eu concordo com os{" "}
                <Button type="button" variant="link" className="p-0 h-auto text-sm text-[#F87B07] hover:text-[#f87b07]/80">
                  Termos de Uso
                </Button>{" "}
                e{" "}
                <Button type="button" variant="link" className="p-0 h-auto text-sm text-[#F87B07] hover:text-[#f87b07]/80">
                  Política de Privacidade
                </Button>
              </label>
            </div>

            {/* Botão Criar Conta */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#F87B07] hover:bg-[#f87b07]/90 text-white font-medium rounded-lg"
              disabled={!acceptTerms || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">ou</span>
            </div>
          </div>

          {/* Link para Login */}
          <div className="text-center">
            <span className="text-gray-600 dark:text-gray-300 text-sm">Já tem uma conta? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm text-[#F87B07] hover:text-[#f87b07]/80"
              onClick={() => onPageChange('login')}
              disabled={isLoading}
            >
              Fazer login
            </Button>
          </div>
        </div>

        {/* Botão Voltar */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => onPageChange('login')}
            className="gap-2 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Login
          </Button>
        </div>
      </div>
    </div>
  );
}