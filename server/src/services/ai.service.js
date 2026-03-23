import Cerebras from "@cerebras/cerebras_cloud_sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY || "missing_key",
});

export async function generateLayout(prompt, currentState) {

    const systemPrompt = `You are an expert AI Architectural Draftsman. 
Given a user's prompt, conceptualize and generate a real-world, perfectly connected architectural floor plan in raw JSON format matching this schema:
{
  "points": [{"id": "p1", "x": 0, "y": 0}],
  "walls": [{"id": "w1", "startPointId": "p1", "endPointId": "p2", "thickness": 20, "isExterior": true}],
  "openings": [{"id": "o1", "type": "door", "wallId": "w1", "distanceFromStart": 100, "width": 90, "swingDirection": "right_in"}],
  "rooms": [{"id": "r1", "name": "Living Room", "wallNodes": ["p1", "p2", "p3", "p4"], "computedAreaSqM": 20}],
  "explanation": "A short architectural rationale for the layout choices."
}

Rules:
1. "thickness" must be 30 for perimeter exterior walls, and 15 for interior partition walls.
2. Assume coordinates map to centimeters. A typical bedroom is minimum 300x300.
3. Every wall must start and end exactly at matching 'points'. Closed loops are mandatory for all perimeter shapes.
4. Every door and window must reference an explicit 'wallId' and fall within its maximum length bounds.
5. Provide ONLY valid JSON. Avoid any text outside the JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: "llama3.1-70b",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Prompt: ${prompt}\nCurrent Canvas State: ${JSON.stringify(currentState)}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      let aiContent = response.choices[0].message.content;
      console.log("Raw AI Content:", aiContent);

      // Simple regex to extract JSON if it's wrapped in triple backticks
      if (aiContent.includes("```")) {
        aiContent =
          aiContent.match(/```(?:json)?([\s\S]*?)```/)?.[1] || aiContent;
      }

      const result = JSON.parse(aiContent.trim());

      return result;
    } catch (error) {
      console.error(
        "AI Generation Error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to generate AI layout");
    }
  }
