const Lead = require('../models/leadModel.js');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const analyzeLead = async (req, res) => {
  const {id} = req.params;
  const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const { businessName, website, socialHandle } = lead;

  //  create prompt for ai
  const prompt = `
        Analyze this business for digital opportunities:
        Business: ${businessName}
        Website: ${website || "N/A"}
        Instagram: ${socialHandle || "N/A"}

        Return ONLY JSON:
        {
        "problem": "...",
        "opportunity": "...",
        "score": "High | Medium | Low"
        }
        `;

  try {
    // generate response
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // valid model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 450,
    });

    const text = response.choices[0].message.content;

    let result;
     try {
      result = JSON.parse(text);
    } catch {
      // fallback: extract JSON from text
      const match = text.match(/\{.*\}/s);
      if (match) result = JSON.parse(match[0]);
      else throw new Error("AI response could not be parsed: " + text);
    }

    res.json({success: true, message: result});

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = analyzeLead;