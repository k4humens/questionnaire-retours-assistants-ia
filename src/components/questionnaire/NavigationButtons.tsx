import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";

interface NavigationButtonsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  canGoBack?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export const NavigationButtons = ({
  onNext,
  onPrevious,
  onSubmit,
  canGoBack = true,
  isLastStep = false,
  isLoading = false,
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-center gap-4 mt-8 max-w-3xl mx-auto">
      {canGoBack && onPrevious && (
        <Button onClick={onPrevious} variant="outline" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      )}
      {isLastStep && onSubmit ? (
        <Button onClick={onSubmit} size="lg" className="glow" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Envoyer mes retours
            </>
          )}
        </Button>
      ) : (
        onNext && (
          <Button onClick={onNext} size="lg" className="glow">
            Suivant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )
      )}
    </div>
  );
};
