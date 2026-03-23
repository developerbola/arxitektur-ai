import Cerebras from "@cerebras/cerebras_cloud_sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Cerebras({
  apiKey: "csk-jkr5ty3h68vkcvkemcdv5kyn4v492jrycm63td5k5tm5rn3m",
});

export async function generateLayout(prompt, currentState) {
  const systemPrompt = `You are an expert AI Architectural Draftsman. 
Given a user's prompt, conceptualize and generate a real-world architectural floor plan in raw JSON format.
The canvas coordinates are in meters (e.g. 5.5 for 5.5m).

Return JSON matching this exact schema:
{
  "rooms": [
    { "type": "room", "x": 0, "y": 0, "width": 5, "height": 4, "label": "Living Room" }
  ],
  "elements": [
    { "type": "door", "x": 2, "y": 0, "width": 1, "height": 0.2 },
    { "type": "window", "x": 0, "y": 1.5, "width": 0.2, "height": 1.5 }
  ],
  "explanation": "A short rationalization."
}

Rules:
1. All elements must specify numeric x, y, width, and height in meters.
2. The "type" for rooms must be "room". For elements, use "door" or "window".
3. Rooms should realistically be sized (e.g., minimum 3m x 3m). Doors shouldn't be too wide (e.g. 1m wide).
4. Provide ONLY valid JSON. Avoid any text outside the JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: "llama3.1-8b",
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
