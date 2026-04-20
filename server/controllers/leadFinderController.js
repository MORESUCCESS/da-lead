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

  let lat, lon;

  if (user.cachedLat && user.cachedLon) {
    lat = user.cachedLat;
    lon = user.cachedLon;
  } else {
    const geoRes = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: { q: user.location, format: "json", limit: 1 },
        headers: { "User-Agent": "da-lead-app/1.0 (ms2dwrld@gmail.com)" },
        timeout: 8000,
      },
    );

    if (!geoRes.data.length) throw new Error("Location not found");

    lat = geoRes.data[0].lat;
    lon = geoRes.data[0].lon;
    user.cachedLat = lat;
    user.cachedLon = lon;
  }

  console.log(`Coordinates for ${user.location}: lat=${lat}, lon=${lon}`);

  // Use Nominatim to search for businesses directly — more reliable than Overpass
  let rawBusinesses = [];

  const searchTerms = ['shop', 'restaurant', 'office', 'hotel', 'cafe', 'clinic', 'pharmacy', 'gym', 'salon', 'supermarket'];

  for (const term of searchTerms) {
    if (rawBusinesses.length >= 30) break;
    try {
      const searchRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: `${term} ${user.location}`,
            format: "json",
            limit: 10,
            addressdetails: 1,
          },
          headers: { "User-Agent": "da-lead-app/1.0 (ms2dwrld@gmail.com)" },
          timeout: 8000,
        }
      );

      const results = searchRes.data.filter(r =>
        r.display_name &&
        !rawBusinesses.find(b => b.display_name === r.display_name)
      );

      rawBusinesses = [...rawBusinesses, ...results];
    } catch {
      continue;
    }
  }

  console.log(`Nominatim returned ${rawBusinesses.length} results for ${user.location}`);

  if (!rawBusinesses.length) throw new Error("No businesses found in your area.");

  // Shuffle and filter seen
  const seenLeads = user.seenLeads || [];

  const shuffled = rawBusinesses.sort(() => Math.random() - 0.5);

  let freshBusinesses = shuffled
    .filter(b => !seenLeads.includes(b.display_name))
    .slice(0, 5);

  if (freshBusinesses.length < 5) {
    user.seenLeads = [];
    const currentNames = freshBusinesses.map(b => b.display_name);
    const fillUp = shuffled
      .filter(b => !currentNames.includes(b.display_name))
      .slice(0, 5 - freshBusinesses.length);
    freshBusinesses = [...freshBusinesses, ...fillUp];
  }

  const businesses = freshBusinesses.slice(0, 5);

  // Build business list for AI
  const businessList = businesses.map((b, i) => {
    const name = b.display_name.split(',')[0]; // first part is usually business name
    const address = b.display_name;
    const lat2 = b.lat;
    const lon2 = b.lon;

    return `${i + 1}. ${name} — address: ${address} — lat: ${lat2}, lon: ${lon2}`;
  }).join("\n");

  const aiRes = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a lead generation assistant for freelancers. Given real local businesses in ${user.location}, generate a short personalized outreach note for each one tailored to a ${user.freelanceCategory}. Return ONLY a valid JSON array with no extra text: [{ "title": "business name", "address": "full address", "website": "empty string", "email": "empty string", "socialHandle": "empty string", "industry": "business category based on the name", "note": "any note about this lead, their social media activity, recent posts, pain points you noticed!" }]`,
      },
      {
        role: "user",
        content: `Here are exactly ${businesses.length} real local businesses in ${user.location}:\n${businessList}\n\nGenerate outreach notes for each one. Return ONLY the JSON array with exactly ${businesses.length} items.`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  const raw = aiRes.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, "").trim();

  let leads;
  try {
    leads = JSON.parse(clean);
  } catch {
    const match = clean.match(/\[.*\]/s);
    if (match) leads = JSON.parse(match[0]);
    else throw new Error("AI response could not be parsed");
  }

  // Update seenLeads using display_name
  const newSeenLeads = [...(user.seenLeads || []), ...businesses.map(b => b.display_name)];
  user.seenLeads = newSeenLeads.length > 100 ? newSeenLeads.slice(-100) : newSeenLeads;
  user.dailyLeads = leads;
  user.lastGeneratedDate = today;
  await user.save();

  return leads;
};

// HTTP handler — thin wrapper
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
