import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QuestionnaireData {
  id: string;
  company_name: string;
  team_name: string;
  unique_code: string;
  assistants: string[];
  created_at: string;
}

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("feedback_questionnaires")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setQuestionnaire(data as QuestionnaireData);
      } catch (error) {
        console.error("Erreur chargement :", error);
        toast.error("Impossible de charger le questionnaire.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const copyLink = () => {
    if (!questionnaire) return;
    const link = `${window.location.origin}/q/${questionnaire.unique_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Questionnaire introuvable
          </h2>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  const shareableLink = `${window.location.origin}/q/${questionnaire.unique_code}`;
  const assistants = Array.isArray(questionnaire.assistants)
    ? questionnaire.assistants
    : [];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Questionnaire créé</h1>
          <p className="text-muted-foreground">
            {questionnaire.company_name} — {questionnaire.team_name}
          </p>
        </div>

        {/* Lien de partage */}
        <Card className="p-6 mb-8 glass">
          <h2 className="text-xl font-bold mb-4">
            Partagez ce lien avec l'équipe
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 bg-muted/50 rounded-lg p-4 font-mono text-sm break-all">
              {shareableLink}
            </div>
            <Button onClick={copyLink} size="icon" variant="outline">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                window.open(
                  `/q/${questionnaire.unique_code}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Résumé */}
        <Card className="p-6 glass">
          <h2 className="text-xl font-bold mb-4">
            {assistants.length} assistant(s) configuré(s)
          </h2>
          <div className="space-y-2">
            {assistants.map((assistant, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="font-medium">{assistant}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Preview;
