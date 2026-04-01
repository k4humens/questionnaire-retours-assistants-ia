import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
const NOTION_FEEDBACK_DB_ID = Deno.env.get("NOTION_FEEDBACK_DB_ID");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      respondent_name,
      first_name,
      last_name,
      job_title,
      company_name,
      team_name,
      assistant_data,
      potential_assistant,
      created_at,
      questionnaire_url,
    } = await req.json();

    if (!NOTION_API_KEY || !NOTION_FEEDBACK_DB_ID) {
      throw new Error("NOTION_API_KEY ou NOTION_FEEDBACK_DB_ID non configuré");
    }

    console.log("Sync feedback to Notion:", {
      respondent_name,
      company_name,
      team_name,
      assistants: assistant_data?.length,
    });

    const results = [];

    for (const assistant of assistant_data) {
      const notionPage = {
        parent: { database_id: NOTION_FEEDBACK_DB_ID },
        properties: {
          Répondant: {
            title: [
              { text: { content: respondent_name || "Anonyme" } },
            ],
          },
          Entreprise: {
            rich_text: [{ text: { content: company_name || "" } }],
          },
          Équipe: {
            rich_text: [{ text: { content: team_name || "" } }],
          },
          Fonction: {
            rich_text: [{ text: { content: job_title || "" } }],
          },
          Assistant: {
            rich_text: [
              { text: { content: assistant.assistant_name || "" } },
            ],
          },
          Testé: {
            select: { name: assistant.tested ? "Oui" : "Non" },
          },
          "Tâche concrète": {
            rich_text: [{ text: { content: assistant.task || "" } }],
          },
          Gains: {
            rich_text: [{ text: { content: assistant.gains || "" } }],
          },
          Blocages: {
            rich_text: [{ text: { content: assistant.blockers || "" } }],
          },
          "Besoins quotidien": {
            rich_text: [{ text: { content: assistant.daily_needs || "" } }],
          },
          "Ajustement prioritaire": {
            rich_text: [
              { text: { content: assistant.priority_adjustment || "" } },
            ],
          },
          "Raison non-test": {
            rich_text: [
              { text: { content: assistant.untested_reason || "" } },
            ],
          },
          "Assistant potentiel": {
            rich_text: [
              { text: { content: potential_assistant || "" } },
            ],
          },
          "Date de réponse": {
            date: { start: created_at || new Date().toISOString() },
          },
          "Lien questionnaire": {
            url: questionnaire_url || null,
          },
        },
      };

      const response = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify(notionPage),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Notion API error:", result);
        results.push({
          success: false,
          error: result,
          assistant: assistant.assistant_name,
        });
      } else {
        console.log("Page Notion créée:", result.id);
        results.push({
          success: true,
          pageId: result.id,
          assistant: assistant.assistant_name,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur sync-feedback-to-notion:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
