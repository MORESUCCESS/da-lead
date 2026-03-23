const OpenAI = require("openai");
const Lead = require("../models/leadModel.js");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const generateMessage = async (req, res) => {
  const { id } = req.params;
  const { messageType, customContext } = req.body;

  try {
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const {
      businessName,
      website,
      socialHandle,
      whyTheyNeedYou,
      opportunityScore,
    } = lead;

    //Build dynamic instruction
    let toneInstruction = "";

    if (messageType === "pitch") {
      toneInstruction = "Write a cold outreach message that is short, personalized, and persuasive.";
    } else if (messageType === "follow_up") {
      toneInstruction = "Write a follow-up message that is polite, friendly, and reminds them of your value.";
    } else if (messageType === "closing") {
      toneInstruction = "Write a closing message that pushes for a decision or next step.";
    }

    const prompt = `
You are an expert sales copywriter.

Write a ${messageType} message for this lead:

Business Name: ${businessName}
Website: ${website || "N/A"}
Social: ${socialHandle || "N/A"}
Why they need the service: ${whyTheyNeedYou || "Not provided"}
Opportunity Level: ${opportunityScore}

Extra context from user:
${customContext || "None"}

Instructions:
${toneInstruction}

Return ONLY JSON:
{
  "subject": "short subject line",
  "content": "full message"
}
`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 450,
    });

    const text = response.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{.*\}/s);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Failed to parse AI response");
    }

    return res.json(parsed);

  } catch (err) {
    console.error("MESSAGE GENERATION ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = generateMessage;