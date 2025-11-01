import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ErrorStateProps {
  error?: Error | string;
  onRetry?: () => void;
  message?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  message = 'Ocorreu um erro ao carregar os dados' 
}: ErrorStateProps) {
  const errorMessage = error 
    ? (typeof error === 'string' ? error : error.message)
    : message;

  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium mb-2">Ops! Algo deu errado</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {errorMessage}
            </p>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
