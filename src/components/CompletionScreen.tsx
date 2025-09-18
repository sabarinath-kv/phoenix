import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CompletionScreenProps {
  onStartAgain: () => void;
  className?: string;
}

export const CompletionScreen = ({ onStartAgain, className = "" }: CompletionScreenProps) => {
  return (
    <Card className={`bg-gradient-secondary shadow-hover border-0 animate-scale-in ${className}`}>
      <div className="p-8 text-center">
        <div className="text-6xl sm:text-7xl mb-6 animate-bounce-in">
          🎉
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
          Completed!
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8">
          Great job mimicking that expression! 
          <br />
          <span className="text-sm">Ready to try another one?</span>
        </p>
        
        <Button 
          onClick={onStartAgain}
          size="lg"
          className="bg-gradient-primary hover:shadow-hover text-white border-0 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
        >
          Start Again
        </Button>
        
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </Card>
  );
};