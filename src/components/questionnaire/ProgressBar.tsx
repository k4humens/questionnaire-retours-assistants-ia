import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};
