import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { images, platforms } = await request.json();

    const imageContent = images.map(img => ({
      type: 'image',
      source: { type: 'base64', media_type: img.type, data: img.data }
    }));

    const prompt = `You are an expert at selling secondhand items online. Analyse the item(s) in these photos carefully.

For each of these platforms: ${platforms.join(', ')} — generate a complete listing.

Respond ONLY with a valid JSON array (no markdown, no backticks). Each object must have:
- "platform": string
- "title": string (optimised for that platform, max 60 chars)
- "description": string (natural, engaging, 3-5 sentences with key details)
- "price": string (realistic secondhand price in EUR, e.g. "€24")
- "condition": string (one of: New with tags, Like new, Good, Acceptable)
- "tags": array of 5-8 relevant keyword strings

Be specific about brand, colour, material, size if visible. Price fairly for secondhand market.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: prompt }] }]
    });

    const raw = response.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const listings = JSON.parse(clean);

    return Response.json({ listings });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
