import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/questionnaire/QuestionCard";
import { ProgressBar } from "@/components/questionnaire/ProgressBar";
import { NavigationButtons } from "@/components/questionnaire/NavigationButtons";
import {
  AssistantFeedback,
  type AssistantAnswer,
} from "@/components/questionnaire/AssistantFeedback";
import { AssistantUntested } from "@/components/questionnaire/AssistantUntested";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import logo4humens from "@/assets/logo-4humens.png";

type Step =
  | "intro"
  | "personal-info"
  | "select-assistants"
  | "tested-feedback"
  | "untested-feedback"
  | "potential"
  | "done";

interface QuestionnaireData {
  id: string;
  company_name: string;
  team_name: string;
  unique_code: string;
  assistants: string[];
}

const emptyAnswer = (): AssistantAnswer => ({
  task: "",
  gains: "",
  blockers: "",
  daily_needs: "",
  priority_adjustment: "",
});

const Questionnaire = () => {
  const { code } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(
    null
  );

  // Navigation
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [currentTestedIndex, setCurrentTestedIndex] = useState(0);
  const [currentUntestedIndex, setCurrentUntestedIndex] = useState(0);

  // Données répondant
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // Sélection des assistants testés
  const [testedAssistants, setTestedAssistants] = useState<Set<string>>(
    new Set()
  );

  // Réponses
  const [assistantAnswers, setAssistantAnswers] = useState<
    Map<string, AssistantAnswer>
  >(new Map());
  const [untestedReasons, setUntestedReasons] = useState<Map<string, string>>(
    new Map()
  );
  const [potentialAnswer, setPotentialAnswer] = useState("");

  // Scroll en haut à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, currentTestedIndex, currentUntestedIndex]);

  // Charger le questionnaire
  useEffect(() => {
    const fetch = async () => {
      if (!code) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("feedback_questionnaires")
        .select("*")
        .eq("unique_code", code)
        .maybeSingle();

      if (error || !data) {
        toast.error("Questionnaire introuvable");
        setLoading(false);
        return;
      }

      setQuestionnaire(data as QuestionnaireData);
      setLoading(false);
    };

    fetch();
  }, [code]);

  // Helpers
  const allAssistants = questionnaire?.assistants ?? [];
  const testedList = allAssistants.filter((a) => testedAssistants.has(a));
  const untestedList = allAssistants.filter((a) => !testedAssistants.has(a));

  const toggleAssistant = (name: string) => {
    const next = new Set(testedAssistants);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setTestedAssistants(next);
  };

  // Navigation
  const getTotalSteps = () => {
    // intro + personal-info + select + tested (N) + untested (M) + potential
    return 3 + testedList.length + untestedList.length + 1;
  };

  const getCurrentStepNumber = () => {
    if (currentStep === "intro") return 1;
    if (currentStep === "personal-info") return 2;
    if (currentStep === "select-assistants") return 3;
    if (currentStep === "tested-feedback") return 4 + currentTestedIndex;
    if (currentStep === "untested-feedback")
      return 4 + testedList.length + currentUntestedIndex;
    if (currentStep === "potential")
      return 4 + testedList.length + untestedList.length;
    return getTotalSteps();
  };

  const handleNext = () => {
    if (currentStep === "intro") {
      setCurrentStep("personal-info");
    } else if (currentStep === "personal-info") {
      if (!firstName.trim() || !lastName.trim() || !jobTitle.trim()) {
        toast.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      setCurrentStep("select-assistants");
    } else if (currentStep === "select-assistants") {
      // Au moins un assistant doit être coché OU au moins un non-coché
      // (on accepte le cas où personne n'a rien testé)
      setCurrentTestedIndex(0);
      setCurrentUntestedIndex(0);
      if (testedList.length > 0) {
        setCurrentStep("tested-feedback");
      } else if (untestedList.length > 0) {
        setCurrentStep("untested-feedback");
      } else {
        setCurrentStep("potential");
      }
    } else if (currentStep === "tested-feedback") {
      // Valider les réponses du tested courant
      const currentAssistant = testedList[currentTestedIndex];
      const answer = assistantAnswers.get(currentAssistant);
      if (!answer || !answer.task.trim()) {
        toast.error(
          "Veuillez au moins décrire sur quelle tâche vous avez utilisé cet assistant."
        );
        return;
      }

      if (currentTestedIndex < testedList.length - 1) {
        setCurrentTestedIndex(currentTestedIndex + 1);
      } else if (untestedList.length > 0) {
        setCurrentStep("untested-feedback");
        setCurrentUntestedIndex(0);
      } else {
        setCurrentStep("potential");
      }
    } else if (currentStep === "untested-feedback") {
      if (currentUntestedIndex < untestedList.length - 1) {
        setCurrentUntestedIndex(currentUntestedIndex + 1);
      } else {
        setCurrentStep("potential");
      }
    } else if (currentStep === "potential") {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep === "personal-info") {
      setCurrentStep("intro");
    } else if (currentStep === "select-assistants") {
      setCurrentStep("personal-info");
    } else if (currentStep === "tested-feedback") {
      if (currentTestedIndex > 0) {
        setCurrentTestedIndex(currentTestedIndex - 1);
      } else {
        setCurrentStep("select-assistants");
      }
    } else if (currentStep === "untested-feedback") {
      if (currentUntestedIndex > 0) {
        setCurrentUntestedIndex(currentUntestedIndex - 1);
      } else if (testedList.length > 0) {
        setCurrentStep("tested-feedback");
        setCurrentTestedIndex(testedList.length - 1);
      } else {
        setCurrentStep("select-assistants");
      }
    } else if (currentStep === "potential") {
      if (untestedList.length > 0) {
        setCurrentStep("untested-feedback");
        setCurrentUntestedIndex(untestedList.length - 1);
      } else if (testedList.length > 0) {
        setCurrentStep("tested-feedback");
        setCurrentTestedIndex(testedList.length - 1);
      } else {
        setCurrentStep("select-assistants");
      }
    }
  };

  const handleSubmit = async () => {
    if (!questionnaire) return;
    setSubmitting(true);

    try {
      // Préparer les données pour Notion
      const testedData = testedList.map((name) => ({
        assistant_name: name,
        tested: true,
        ...(assistantAnswers.get(name) || emptyAnswer()),
        untested_reason: null,
      }));

      const untestedData = untestedList.map((name) => ({
        assistant_name: name,
        tested: false,
        task: null,
        gains: null,
        blockers: null,
        daily_needs: null,
        priority_adjustment: null,
        untested_reason: untestedReasons.get(name) || "",
      }));

      const allAssistantData = [...testedData, ...untestedData];

      // Sauvegarder en BDD Supabase
      const { error: dbError } = await supabase
        .from("feedback_responses")
        .insert({
          questionnaire_id: questionnaire.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: jobTitle.trim(),
          tested_assistants: testedList,
          assistant_answers: Object.fromEntries(
            testedList.map((name) => [
              name,
              assistantAnswers.get(name) || emptyAnswer(),
            ])
          ),
          untested_reasons: Object.fromEntries(
            untestedList.map((name) => [
              name,
              untestedReasons.get(name) || "",
            ])
          ),
          potential_assistant: potentialAnswer,
        });

      if (dbError) throw dbError;

      // Sync Notion via Edge Function
      try {
        await supabase.functions.invoke("sync-feedback-to-notion", {
          body: {
            respondent_name: `${firstName.trim()} ${lastName.trim()}`,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            job_title: jobTitle.trim(),
            company_name: questionnaire.company_name,
            team_name: questionnaire.team_name,
            assistant_data: allAssistantData,
            potential_assistant: potentialAnswer,
            created_at: new Date().toISOString(),
            questionnaire_url: `${window.location.origin}/q/${questionnaire.unique_code}`,
          },
        });
      } catch (notionError) {
        console.warn("Notion sync échoué (non-bloquant) :", notionError);
      }

      setCurrentStep("done");
      toast.success("Merci ! Vos retours ont été enregistrés.");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <QuestionCard>
          <h1 className="text-2xl font-bold text-center">
            Questionnaire introuvable
          </h1>
        </QuestionCard>
      </div>
    );
  }

  if (currentStep === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <QuestionCard>
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">
              Merci pour vos retours !
            </h1>
            <p className="text-lg text-muted-foreground">
              Vos réponses ont été enregistrées avec succès. Elles seront
              utilisées pour améliorer vos assistants IA.
            </p>
          </div>
        </QuestionCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Logo */}
      <div className="max-w-3xl mx-auto mb-6">
        <img src={logo4humens} alt="4humens" className="h-10 mx-auto" />
      </div>

      {/* Barre de progression */}
      {currentStep !== "intro" && (
        <ProgressBar
          currentStep={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
        />
      )}

      {/* Introduction */}
      {currentStep === "intro" && (
        <QuestionCard>
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">
              {questionnaire.company_name} — {questionnaire.team_name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Retours sur vos assistants IA
            </p>
            <p className="text-muted-foreground">
              Ce questionnaire vous permet de partager vos retours d'expérience
              sur les assistants IA que vous avez testés. Vos réponses
              permettront d'améliorer ces outils pour mieux répondre à vos
              besoins quotidiens.
            </p>
            <p className="text-sm text-muted-foreground">
              Durée estimée : 5 à 10 minutes
            </p>
          </div>
        </QuestionCard>
      )}

      {/* Informations personnelles */}
      {currentStep === "personal-info" && (
        <QuestionCard>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Vos informations
            </h2>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Entreprise :</strong> {questionnaire.company_name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Équipe :</strong> {questionnaire.team_name}
              </p>
            </div>

            <div>
              <Label htmlFor="firstName" className="text-base font-semibold">
                Prénom *
              </Label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full mt-2 px-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-base font-semibold">
                Nom *
              </Label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="w-full mt-2 px-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <Label htmlFor="jobTitle" className="text-base font-semibold">
                Fonction exacte *
              </Label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Votre fonction dans l'entreprise"
                className="w-full mt-2 px-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
        </QuestionCard>
      )}

      {/* Sélection des assistants testés */}
      {currentStep === "select-assistants" && (
        <QuestionCard>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Quels assistants avez-vous testés ?
            </h2>
            <p className="text-center text-muted-foreground">
              Cochez les assistants que vous avez eu l'occasion d'utiliser.
            </p>

            <div className="space-y-3">
              {allAssistants.map((name) => (
                <Card
                  key={name}
                  className={`p-4 cursor-pointer transition-all border-2 hover:shadow-md ${
                    testedAssistants.has(name)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => toggleAssistant(name)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={testedAssistants.has(name)}
                      onCheckedChange={() => toggleAssistant(name)}
                    />
                    <span className="font-medium text-base">{name}</span>
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {testedAssistants.size} assistant(s) sélectionné(s) sur{" "}
              {allAssistants.length}
            </p>
          </div>
        </QuestionCard>
      )}

      {/* Questions par assistant testé */}
      {currentStep === "tested-feedback" && testedList[currentTestedIndex] && (
        <QuestionCard>
          <AssistantFeedback
            assistantName={testedList[currentTestedIndex]}
            answer={
              assistantAnswers.get(testedList[currentTestedIndex]) ||
              emptyAnswer()
            }
            onChange={(answer) => {
              const next = new Map(assistantAnswers);
              next.set(testedList[currentTestedIndex], answer);
              setAssistantAnswers(next);
            }}
            index={currentTestedIndex}
            total={testedList.length}
          />
        </QuestionCard>
      )}

      {/* Questions par assistant non testé */}
      {currentStep === "untested-feedback" &&
        untestedList[currentUntestedIndex] && (
          <QuestionCard>
            <AssistantUntested
              assistantName={untestedList[currentUntestedIndex]}
              reason={
                untestedReasons.get(untestedList[currentUntestedIndex]) || ""
              }
              onChange={(reason) => {
                const next = new Map(untestedReasons);
                next.set(untestedList[currentUntestedIndex], reason);
                setUntestedReasons(next);
              }}
              index={currentUntestedIndex}
              total={untestedList.length}
            />
          </QuestionCard>
        )}

      {/* Question potentiel */}
      {currentStep === "potential" && (
        <QuestionCard>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Question finale
            </h2>
            <Card className="p-5 bg-gradient-to-br from-background to-primary/5 border-primary/20">
              <Label className="text-base font-semibold mb-3 block">
                Quel assistant vous semble avoir le plus de potentiel à court
                terme dans votre quotidien ?
              </Label>
              <Textarea
                value={potentialAnswer}
                onChange={(e) => setPotentialAnswer(e.target.value)}
                placeholder="L'assistant qui pourrait le plus vous aider au quotidien et pourquoi..."
                className="min-h-[120px] mt-2"
              />
            </Card>
          </div>
        </QuestionCard>
      )}

      {/* Navigation */}
      {currentStep === "intro" ? (
        <div className="flex justify-center mt-8">
          <Button onClick={handleNext} size="lg" className="glow">
            Commencer
          </Button>
        </div>
      ) : (
        <NavigationButtons
          onNext={currentStep === "potential" ? undefined : handleNext}
          onSubmit={currentStep === "potential" ? handleSubmit : undefined}
          onPrevious={handlePrevious}
          canGoBack={true}
          isLastStep={currentStep === "potential"}
          isLoading={submitting}
        />
      )}

      {/* Overlay de chargement */}
      {submitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
