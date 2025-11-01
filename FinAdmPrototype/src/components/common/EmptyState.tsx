import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel,
  onAction 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {description}
            </p>
          </div>
          {actionLabel && onAction && (
            <Button 
              onClick={onAction}
              className="mt-2 bg-primary hover:bg-primary/90"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
