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
    ? `Do NOT include any of these businesses already shown: ${seenLeads.slice(-15).join(', ')}.`
    : '';

  const searchRes = await openai.chat.completions.create({
    model: "perplexity/sonar",
    messages: [
      {
        role: "user",
        content: `Search the web and find exactly 3 real local businesses in ${user.location} that would benefit from hiring a ${user.freelanceCategory}.

For each business, search thoroughly for:
1. Their exact business name
2. Their full physical street address in ${user.location} — this is required, search hard for it
3. Their website URL — search their name to find it
4. Their contact email — check their website contact page
5. Their Instagram or Facebook handle — search "@businessname" on social media
6. Their specific business industry

${seenList}

Rules:
- Only return information you have confirmed from real web search results
- For address: always provide the full street address if found, never leave empty if you can find it
- For website, email, socialHandle: return empty string "" only if you truly cannot find it after searching
- Never guess or fabricate any information
- Return businesses that are currently active and operating

Return ONLY this exact JSON format, no markdown, no explanation:
[
  {
    "title": "exact real business name",
    "address": "full street address in ${user.location}",
    "website": "https://realwebsite.com or empty string if not available",
    "email": "real@email.com or empty string if not available",
    "socialHandle": "@realhandle or empty string if not available",
    "industry": "specific industry e.g. Fashion Retail, Food & Beverage, Healthcare",
    "note": "2-3 sentences on the specific digital problem this business has and exactly how a ${user.freelanceCategory} solves it"
  }
]`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.2,
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

    // Respond immediately with generating status, run generation in background
    res.json({ success: true, leads: [], generating: true });

    // Generate in background — don't await in response
    generateLeadsForUser(user).catch(err => {
      console.error("Background lead gen failed:", err.message);
    });

  } catch (error) {
    console.error("autoLeadGen error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate leads",
    });
  }
};


module.exports = { generateSuggestedLeads, autoLeadGen, generateLeadsForUser };
