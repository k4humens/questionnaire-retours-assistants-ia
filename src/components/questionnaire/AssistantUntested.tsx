import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface AssistantUntestedProps {
  assistantName: string;
  reason: string;
  onChange: (reason: string) => void;
  index: number;
  total: number;
}

export const AssistantUntested = ({
  assistantName,
  reason,
  onChange,
  index,
  total,
}: AssistantUntestedProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Assistant non testé {index + 1} sur {total}
        </p>
        <h2 className="text-2xl font-bold">{assistantName}</h2>
      </div>

      <Card className="p-5 bg-gradient-to-br from-background to-orange-50 border-orange-200">
        <Label className="text-base font-semibold mb-3 block">
          Pourquoi n'avez-vous pas pu tester cet assistant ?
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Manque de temps, pas pertinent pour mon activité, problème technique, autre..."
          className="min-h-[100px] mt-2"
        />
      </Card>
    </div>
  );
};
