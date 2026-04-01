import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo4humens from "@/assets/logo-4humens.png";

const Index = () => {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [assistantsText, setAssistantsText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      toast.error("Veuillez renseigner le nom de l'entreprise.");
      return;
    }

    if (!teamName.trim()) {
      toast.error("Veuillez renseigner le nom de l'équipe ou du métier.");
      return;
    }

    if (!assistantsText.trim()) {
      toast.error("Veuillez lister au moins un assistant IA.");
      return;
    }

    // Parser les assistants : un par ligne, ou séparés par des virgules
    const assistants = assistantsText
      .split(/[\n,]/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (assistants.length === 0) {
      toast.error("Aucun assistant détecté. Mettez un assistant par ligne.");
      return;
    }

    setIsGenerating(true);

    try {
      // Générer un code unique
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_feedback_code"
      );

      if (codeError) throw codeError;

      // Sauvegarder en base
      const { data: questionnaire, error: dbError } = await supabase
        .from("feedback_questionnaires")
        .insert({
          company_name: companyName.trim(),
          team_name: teamName.trim(),
          assistants: assistants,
          unique_code: codeData,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success(
        `Questionnaire créé avec ${assistants.length} assistant(s) !`
      );

      navigate(`/preview/${questionnaire.id}`);
    } catch (error: unknown) {
      console.error("Erreur lors de la création :", error);
      toast.error("Une erreur est survenue lors de la création.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <img src={logo4humens} alt="4humens" className="h-12 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">
            Créer un questionnaire de retours
          </h1>
          <p className="text-muted-foreground">
            Collectez les retours terrain sur vos assistants IA déployés.
          </p>
        </div>

        <Card className="p-8 glass">
          <div className="space-y-6">
            <div>
              <Label htmlFor="company">Nom de l'entreprise *</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ex: Conceptory"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="team">Nom de l'équipe / métier *</Label>
              <Input
                id="team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="ex: Équipe Newbiz"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="assistants">Liste des assistants IA *</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Un assistant par ligne
              </p>
              <Textarea
                id="assistants"
                value={assistantsText}
                onChange={(e) => setAssistantsText(e.target.value)}
                placeholder={`Diagnostic écosystème digital et social\nRédacteur brief client\nRédacteur de comptes-rendus\nCadrage budgétaire`}
                className="min-h-[200px]"
              />
              {assistantsText.trim() && (
                <p className="text-sm text-muted-foreground mt-2">
                  {
                    assistantsText
                      .split(/[\n,]/)
                      .map((a) => a.trim())
                      .filter((a) => a.length > 0).length
                  }{" "}
                  assistant(s) détecté(s)
                </p>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full glow h-14 text-lg"
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Générer le questionnaire
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
