import { NextResponse } from "next/server";

// Fallback models in case the API call fails
const FALLBACK_MODELS = [
  {
    id: "gpt-4o-realtime-preview-2024-12-17",
    name: "GPT-4o Realtime Preview",
    description: "Latest realtime model with improved capabilities (default)"
  },
  {
    id: "gpt-4-realtime-preview",
    name: "GPT-4 Realtime Preview",
    description: "Standard realtime model"
  },
  {
    id: "gpt-4o-realtime-preview-mini",
    name: "GPT-4o Realtime Mini",
    description: "Smaller, more cost-effective version of GPT-4o realtime"
  }
];

interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface OpenAIListModelsResponse {
  object: string;
  data: OpenAIModel[];
}

export async function GET() {
  try {
    // Try to fetch models from OpenAI API
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Failed to fetch models from OpenAI API, using fallback models");
      return NextResponse.json({ models: FALLBACK_MODELS });
    }

    const data = await response.json() as OpenAIListModelsResponse;
    
    // Filter for models that appear to be realtime models
    const realtimeModels = data.data
      .filter(model => model.id.includes("realtime"))
      .map(model => {
        // Format the model names to be more user-friendly
        let name = model.id
          .replace("gpt-", "GPT-")
          .replace("-preview", " Preview")
          .replace("-realtime", " Realtime");
          
        // Add mini designation if applicable
        if (model.id.includes("mini")) {
          name += " Mini";
        }
        
        // Create description based on model properties
        let description = "";
        if (model.id.includes("4o")) {
          description = "GPT-4o optimized for realtime conversations";
        } else if (model.id.includes("mini")) {
          description = "Smaller, more cost-effective version";
        } else {
          description = "Standard realtime model";
        }
        
        return {
          id: model.id,
          name,
          description
        };
      });
    
    // If no realtime models were found, use the fallback models
    if (realtimeModels.length === 0) {
      console.warn("No realtime models found in OpenAI API response, using fallback models");
      return NextResponse.json({ models: FALLBACK_MODELS });
    }
    
    return NextResponse.json({ models: realtimeModels });
  } catch (error) {
    console.error("Error in /api/models:", error);
    // In case of error, return the fallback models
    return NextResponse.json({ models: FALLBACK_MODELS });
  }
} 