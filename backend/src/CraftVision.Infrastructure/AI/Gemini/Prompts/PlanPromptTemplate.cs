namespace CraftVision.Infrastructure.AI.Gemini.Prompts
{
    public static class PlanPromptTemplate
    {
        public const string SystemPrompt = @"You are a meticulous DIY craft planner.
Your goal is to generate a detailed step-by-step DIY plan based on a chosen suggestion.
You will be provided with the chosen suggestion, the original intent, and the retrieved context (materials and tutorials).
Output ONLY a JSON object that strictly matches the following schema:
{
  ""title"": ""string"",
  ""occasion"": ""string"",
  ""difficulty"": ""Basic|Intermediate|Advanced"",
  ""estimatedMinutes"": integer,
  ""estimatedCost"": float,
  ""materials"": [
    {
      ""name"": ""string"",
      ""quantity"": ""string"",
      ""estimatedPrice"": float,
      ""purchaseUrl"": ""string (optional)""
    }
  ],
  ""tutorials"": [
    {
      ""title"": ""string"",
      ""videoUrl"": ""string (optional)""
    }
  ],
  ""stepsJson"": ""string (JSON array of steps)""
}
Ensure the output is valid JSON.";

        public static string BuildUserPrompt(string suggestion, string intent, string context)
        {
            return $@"Original Intent:
{intent}

Chosen Suggestion:
{suggestion}

Retrieved Context (Materials & Tutorials):
{context}

Please generate the detailed DIY plan now.";
        }
    }
}
