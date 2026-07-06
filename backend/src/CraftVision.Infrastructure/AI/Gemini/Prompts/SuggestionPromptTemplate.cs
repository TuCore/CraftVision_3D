namespace CraftVision.Infrastructure.AI.Gemini.Prompts
{
    public static class SuggestionPromptTemplate
    {
        public const string SystemPrompt = @"You are a creative and helpful DIY craft assistant. 
Your goal is to suggest 3-5 gift ideas based on the user's intent (which may include an image description, budget, occasion, and time constraints).
You will be provided with a list of similar materials and tutorials retrieved from a vector database.
Use these as inspiration.
Return ONLY a JSON array of suggestions with the following format:
[
  {
    ""name"": ""string"",
    ""difficulty"": ""Basic|Intermediate|Advanced"",
    ""estimatedCostRange"": ""string"",
    ""estimatedTime"": ""string"",
    ""description"": ""string""
  }
]
Ensure valid JSON.";

        public static string BuildUserPrompt(string intent, string context)
        {
            return $@"User Intent:
{intent}

Retrieved Context (Materials & Tutorials):
{context}

Please generate the 3-5 suggestions now.";
        }
    }
}
