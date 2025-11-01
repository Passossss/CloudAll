import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import finLogo from "figma:asset/cb6e84f9267ba7d9df65b2df986e7030850c04ce.png";

interface ForgotPasswordProps {
  onPageChange: (page: string) => void;
}

export function ForgotPassword({ onPageChange }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");

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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">App Fin</h1>
            <h2 className="text-xl font-medium text-gray-900 mb-1">Esqueceu sua senha?</h2>
            <p className="text-gray-600 text-sm">Digite seu email para receber o link de recuperação</p>
          </div>

          {/* Formulário */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#F87B07] hover:bg-[#f87b07]/90 text-white font-medium rounded-lg"
            >
              Enviar link
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-[#F87B07] hover:text-[#f87b07]/80 gap-1"
              onClick={() => onPageChange('login')}
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para o login
            </Button>
          </div>
        </div>

        {/* Botão Voltar */}
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => onPageChange('login')}
            className="gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Login
          </Button>
        </div>
      </div>
    </div>
  );
}