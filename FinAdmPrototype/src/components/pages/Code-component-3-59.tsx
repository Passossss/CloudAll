import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  onGoBack?: () => void;
}

export function ComingSoon({ title, description, onGoBack }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-semibold mb-3">{title}</h1>
          
          <p className="text-muted-foreground mb-6">
            {description || 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.'}
          </p>
          
          <div className="space-y-3">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">Desenvolvimento em progresso... 65%</p>
          </div>
          
          {onGoBack && (
            <Button 
              variant="outline" 
              onClick={onGoBack}
              className="mt-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}