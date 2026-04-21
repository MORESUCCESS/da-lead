const OpenAI = require("openai");
const userModel = require("../models/userModel");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// User generates suggested leads manuallly by inputing their skill and niche (Old way)
const generateSuggestedLeads = async (req, res) => {
  const { skill, niche } = req.body;

  if (!skill || !niche) {
    return res
      .status(400)
      .json({ success: false, message: "Skill and niche are required" });
  }

  try {
    const prompt = `
You are a lead generation assistant. A user is a ${skill} targeting ${niche}.
Generate exactly 5 lead opportunities, each with:
- "title": short opportunity name
- "note": why it's a good lead

Return ONLY valid JSON array like this:
[
  { "title": "...", "note": "..." }
]
Ensure the output is parseable JSON.
`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // valid model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 450,
    });

    const text = response.choices[0].message.content;

    let generatedLeads = [];

    try {
      generatedLeads = JSON.parse(text);
    } catch {
      const match = text.match(/\[.*\]/s);
      if (match) generatedLeads = JSON.parse(match[0]);
      else
        throw new Error(
          "AI response could not be parsed. Raw response: " + text,
        );
    }

    return res.json({ success: true, leads: generatedLeads });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const generateLeadsForUser = async (user) => {
  const today = new Date().toDateString();

  if (user.lastGeneratedDate === today && user.dailyLeads.length > 0) {
    return user.dailyLeads;
  }

  const seenLeads = user.seenLeads || [];
  const seenList = seenLeads.length > 0
    ? `Do NOT include any of these businesses: ${seenLeads.slice(-15).join(', ')}`
    : '';

  // Step 1 — Ask AI to find real businesses with web search enabled
  const searchRes = await openai.chat.completions.create({
    model: "perplexity/sonar", // ← supports real web search on OpenRouter
    messages: [
      {
        role: "user",
        content: `Find 3 real local businesses in ${user.location} that would benefit from hiring a ${user.freelanceCategory}. 

For each business find their REAL confirmed information only:
- Business name
- Physical address in ${user.location}
- Website URL (only if confirmed real)
- Contact email (only if confirmed real)
- Instagram or social media handle (only if confirmed real)
- Their specific industry

${seenList}

Return ONLY a valid JSON array with no extra text:
[{ 
  "title": "exact business name",
  "address": "real address or empty string",
  "website": "real website url or empty string",
  "email": "real email or empty string", 
  "socialHandle": "real handle or empty string",
  "industry": "specific industry",
  "note": "2-3 sentences on why they need a ${user.freelanceCategory} and what pain point you solve"
}]`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.3, // low temp for factual accuracy
  });

  const raw = searchRes.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, "").trim();

  let leads;
  try {
    leads = JSON.parse(clean);
  } catch {
    const match = clean.match(/\[.*\]/s);
    if (match) leads = JSON.parse(match[0]);
    else throw new Error("AI response could not be parsed");
  }

  leads = leads.slice(0, 3);

  const newSeenLeads = [...(user.seenLeads || []), ...leads.map(l => l.title)];
  user.seenLeads = newSeenLeads.length > 100 ? newSeenLeads.slice(-100) : newSeenLeads;
  user.dailyLeads = leads;
  user.lastGeneratedDate = today;
  await user.save();

  return leads;
};

// HTTP handler
const autoLeadGen = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user.freelanceCategory || !user.location) {
      return res.json({
        success: false,
        incomplete: true,
        message: "Please update your profile with your freelance category and location.",
      });
    }

    const today = new Date().toDateString();

    if (user.lastGeneratedDate === today && user.dailyLeads.length > 0) {
      return res.json({ success: true, leads: user.dailyLeads });
    }

    const leads = await generateLeadsForUser(user);
    return res.json({ success: true, leads });

  } catch (error) {
    console.error("autoLeadGen error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate leads",
    });
  }
};


module.exports = { generateSuggestedLeads, autoLeadGen, generateLeadsForUser };
