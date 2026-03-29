const OpenAI = require("openai");
const userModel = require("../models/userModel");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// User generates suggested leads manuallly by inputing their skill and niche (Old form)
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

// Auto generate leads for users
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

    // Step 1 — Get coordinates for the user's location
    let geoData;
    try {
      const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: user.location, format: "json", limit: 1 },
        headers: { "User-Agent": "da-lead-app/1.0 (ms2dwrld@gmail.com)" },
        timeout: 8000,
      });
      geoData = geoRes.data;
    } catch {
      return res.json({ success: false, message: "Location lookup timed out. Please try again." });
    }

    if (!geoData.length) {
      return res.json({ success: false, message: "Could not find your location." });
    }

    const { lat, lon } = geoData[0];

    // Step 2 — Rotate radius and category daily for variety
    const radii = [2000, 3000, 5000, 7000, 10000];
    const radius = radii[new Date().getDate() % radii.length];

    const categories = [
      `node["name"]["shop"]`,
      `node["name"]["amenity"="restaurant"]`,
      `node["name"]["office"]`,
      `node["name"]["amenity"="cafe"]`,
      `node["name"]["amenity"="beauty"]`,
    ];
    const category = categories[new Date().getDate() % categories.length];

    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${category}(around:${radius},${lat},${lon});
        node["name"]["shop"](around:${radius},${lat},${lon});
        node["name"]["office"](around:${radius},${lat},${lon});
      );
      out 30;
    `;

    let rawBusinesses;
    try {
      const overpassRes = await axios.post(
        "https://overpass-api.de/api/interpreter",
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 15000,
        }
      );
      rawBusinesses = overpassRes.data.elements;
    } catch {
      return res.json({ success: false, message: "Business search timed out. Please try again in a moment." });
    }

    if (!rawBusinesses.length) {
      return res.json({ success: false, message: "No businesses found in your area." });
    }

    // Step 3 — Shuffle for randomness, filter seen businesses
    const seenLeads = user.seenLeads || [];

    const shuffled = rawBusinesses
      .filter(b => b.tags?.name)
      .sort(() => Math.random() - 0.5); // ← random order each call

    let freshBusinesses = shuffled
      .filter(b => !seenLeads.includes(b.tags.name))
      .slice(0, 5);

    // If all businesses have been seen — reset seenLeads and start fresh
    if (freshBusinesses.length === 0) {
      user.seenLeads = [];
      freshBusinesses = shuffled.slice(0, 5);
    }

    const businesses = freshBusinesses;

    if (!businesses.length) {
      return res.json({ success: false, message: "No businesses found in your area." });
    }

    // Step 4 — Pass real businesses to AI for pitch notes
    const businessList = businesses.map((b, i) =>
      `${i + 1}. ${b.tags.name} — ${b.tags["addr:street"] || "Local business"} — website: ${b.tags["website"] || "unknown"}`
    ).join("\n");

    const aiRes = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a lead generation assistant for freelancers. Given real local businesses, generate a short personalized outreach note for each one tailored to a ${user.freelanceCategory}. Return ONLY a valid JSON array with no extra text: [{ "title": "business name", "address": "full address", "website": "website url or empty string", "email": "email or empty string", "socialHandle": "social handle guess or empty string", "industry": "business category", "note": "any note about this lead, their social media activity, recent posts, pain points you noticed!" }]`,
        },
        {
          role: "user",
          content: `Here are today's real local businesses:\n${businessList}\n\nGenerate outreach notes for each. Return ONLY the JSON array.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7, // ← slightly higher for more varied AI responses
    });

    // Step 5 — Safe JSON parsing
    const raw = aiRes.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, "").trim();

    let leads;
    try {
      leads = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[.*\]/s);
      if (match) {
        leads = JSON.parse(match[0]);
      } else {
        console.error("AI parse failed. Raw:", clean);
        return res.json({ success: false, message: "AI returned unexpected format. Please try again." });
      }
    }

    // Step 6 — Update seenLeads, cap at 100, save and return
    const newSeenLeads = [...(user.seenLeads || []), ...businesses.map(b => b.tags.name)];
    user.seenLeads = newSeenLeads.length > 100
      ? newSeenLeads.slice(-100)
      : newSeenLeads;

    user.dailyLeads = leads;
    user.lastGeneratedDate = today;
    await user.save();

    return res.json({ success: true, leads });

  } catch (error) {
    console.error("autoLeadGen error:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate leads" });
  }
};

module.exports = {
  generateSuggestedLeads,
  autoLeadGen,
};
