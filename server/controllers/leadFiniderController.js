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

const autoLeadGen = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user.freelanceCategory || !user.location) {
      return res.json({
        success: false,
        incomplete: true,
        message:
          "Please update your profile with your freelance category and location.",
      });
    }

    const today = new Date().toDateString();

    if (user.lastGeneratedDate === today && user.dailyLeads.length > 0) {
      return res.json({ success: true, leads: user.dailyLeads });
    }

    // Step 1 — Use cached coordinates or fetch once
    let lat, lon;

    if (user.cachedLat && user.cachedLon) {
      lat = user.cachedLat;
      lon = user.cachedLon;
    } else {
      let geoData;
      try {
        const geoRes = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: { q: user.location, format: "json", limit: 1 },
            headers: { "User-Agent": "da-lead-app/1.0 (ms2dwrld@gmail.com)" },
            timeout: 8000,
          },
        );
        geoData = geoRes.data;
      } catch {
        return res.json({
          success: false,
          message: "Location lookup timed out. Please try again.",
        });
      }

      if (!geoData.length) {
        return res.json({
          success: false,
          message: "Could not find your location.",
        });
      }

      lat = geoData[0].lat;
      lon = geoData[0].lon;
      user.cachedLat = lat;
      user.cachedLon = lon;
      await user.save();
    }

    // Step 2 — Single large query, no progressive widening
    const overpassQuery = `
  [out:json][timeout:30];
  (
    node["name"]["shop"](around:10000,${lat},${lon});
    node["name"]["office"](around:10000,${lat},${lon});
    node["name"]["amenity"="restaurant"](around:10000,${lat},${lon});
    node["name"]["amenity"="cafe"](around:10000,${lat},${lon});
    node["name"]["amenity"="bar"](around:10000,${lat},${lon});
    node["name"]["amenity"="fast_food"](around:10000,${lat},${lon});
    node["name"]["amenity"="beauty"](around:10000,${lat},${lon});
    node["name"]["amenity"="salon"](around:10000,${lat},${lon});
    node["name"]["amenity"="gym"](around:10000,${lat},${lon});
    node["name"]["amenity"="hotel"](around:10000,${lat},${lon});
    node["name"]["amenity"="clinic"](around:10000,${lat},${lon});
    node["name"]["amenity"="dentist"](around:10000,${lat},${lon});
  );
  out 50;
`;

    let rawBusinesses;
    try {
      const overpassRes = await axios.post(
        "https://overpass-api.de/api/interpreter",
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 20000,
        },
      );
      rawBusinesses = overpassRes.data.elements;
    } catch {
      return res.json({
        success: false,
        message: "Business search timed out. Please try again in a moment.",
      });
    }

    if (!rawBusinesses || rawBusinesses.length === 0) {
      return res.json({
        success: false,
        message: "No businesses found in your area.",
      });
    }

    // Step 3 — Shuffle, filter seen, reset if exhausted
    const seenLeads = user.seenLeads || [];

    const shuffled = rawBusinesses
      .filter((b) => b.tags?.name)
      .sort(() => Math.random() - 0.5);

    let freshBusinesses = shuffled
      .filter((b) => !seenLeads.includes(b.tags.name))
      .slice(0, 5);

    // Reset seenLeads if pool exhausted, fill remainder
    if (freshBusinesses.length < 5) {
      user.seenLeads = [];
      const currentTitles = freshBusinesses.map((b) => b.tags.name);
      const fillUp = shuffled
        .filter((b) => !currentTitles.includes(b.tags.name))
        .slice(0, 5 - freshBusinesses.length);
      freshBusinesses = [...freshBusinesses, ...fillUp];
    }

    const businesses = freshBusinesses.slice(0, 5);

    if (!businesses.length) {
      return res.json({
        success: false,
        message: "No businesses found in your area.",
      });
    }

    // Step 4 — AI pitch notes
    const businessList = businesses
      .map((b, i) => {
        const street = b.tags["addr:street"] || "";
        const housenumber = b.tags["addr:housenumber"] || "";
        const city = b.tags["addr:city"] || "";
        const suburb = b.tags["addr:suburb"] || "";
        const full = [housenumber, street, suburb, city]
          .filter(Boolean)
          .join(", ");

        const website = b.tags["website"] || b.tags["contact:website"] || "";
        const email = b.tags["email"] || b.tags["contact:email"] || "";
        const social =
          b.tags["contact:instagram"] ||
          b.tags["contact:twitter"] ||
          b.tags["contact:facebook"] ||
          "";

        return `${i + 1}. ${b.tags.name} — address: ${full || "unknown"} — website: ${website || "unknown"} — email: ${email || "unknown"} — social: ${social || "unknown"}`;
      })
      .join("\n");

    const aiRes = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a lead generation assistant for freelancers. Given real local businesses in ${user.location}, generate a short personalized outreach note for each one tailored to a ${user.freelanceCategory}.  For the address field, use whatever address info is provided — if none is available, make a reasonable guess based on the business name and the city ${user.location} Return ONLY a valid JSON array with no extra text: [{ "title": "business name", "address": "full address", "website": "website url or empty string", "email": "email or empty string", "socialHandle": "social handle or empty string", "industry": "business category", "note": "any note about this lead, their social media activity, recent posts, pain points you noticed!" }]`,
        },
        {
          role: "user",
          content: `Here are exactly ${businesses.length} real local businesses:\n${businessList}\n\nGenerate outreach notes for each one. Return ONLY the JSON array with exactly ${businesses.length} items.`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
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
        return res.json({
          success: false,
          message: "AI returned unexpected format. Please try again.",
        });
      }
    }

    // Step 6 — Update seenLeads, cap at 100, save and return
    const newSeenLeads = [
      ...(user.seenLeads || []),
      ...businesses.map((b) => b.tags.name),
    ];
    user.seenLeads =
      newSeenLeads.length > 100 ? newSeenLeads.slice(-100) : newSeenLeads;

    user.dailyLeads = leads;
    user.lastGeneratedDate = today;
    await user.save();

    return res.json({ success: true, leads });
  } catch (error) {
    console.error("autoLeadGen error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate leads",
    });
  }
};
module.exports = {
  generateSuggestedLeads,
  autoLeadGen,
};
