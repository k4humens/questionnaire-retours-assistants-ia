import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export interface AssistantAnswer {
  task: string;
  gains: string;
  blockers: string;
  daily_needs: string;
  priority_adjustment: string;
}

interface AssistantFeedbackProps {
  assistantName: string;
  answer: AssistantAnswer;
  onChange: (answer: AssistantAnswer) => void;
  index: number;
  total: number;
}

const questions = [
  {
    key: "task" as const,
    label: "Sur quel sujet ou quelle tâche concrète l'avez-vous utilisé ?",
    placeholder: "Décrivez la tâche ou le contexte d'utilisation...",
  },
  {
    key: "gains" as const,
    label: "Qu'est-ce qui vous a fait gagner du temps ou de la clarté ?",
    placeholder: "Ce qui a bien fonctionné, les gains concrets...",
  },
  {
    key: "blockers" as const,
    label: "Qu'est-ce qui a coincé, manqué ou demandé trop de retraitement ?",
    placeholder: "Les difficultés rencontrées, les limites observées...",
  },
  {
    key: "daily_needs" as const,
    label: "De quoi auriez-vous besoin pour l'utiliser plus naturellement au quotidien ?",
    placeholder: "Améliorations souhaitées pour une utilisation régulière...",
  },
  {
    key: "priority_adjustment" as const,
    label: "Quel ajustement vous semblerait prioritaire ?",
    placeholder: "L'amélioration la plus importante à apporter...",
  },
];

export const AssistantFeedback = ({
  assistantName,
  answer,
  onChange,
  index,
  total,
}: AssistantFeedbackProps) => {
  const updateField = (key: keyof AssistantAnswer, value: string) => {
    onChange({ ...answer, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Assistant {index + 1} sur {total}
        </p>
        <h2 className="text-2xl font-bold">{assistantName}</h2>
      </div>

      {questions.map((q) => (
        <Card
          key={q.key}
          className="p-5 bg-gradient-to-br from-background to-primary/5 border-primary/20"
        >
          <Label className="text-base font-semibold mb-3 block">
            {q.label}
          </Label>
          <Textarea
            value={answer[q.key]}
            onChange={(e) => updateField(q.key, e.target.value)}
            placeholder={q.placeholder}
            className="min-h-[100px] mt-2"
          />
        </Card>
      ))}
    </div>
  );
};
