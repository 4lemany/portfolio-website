export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body || {};
    const apiKey = (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_AI_STUDIO_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.laga_api_call ||
        process.env.OPENAI_API_KEY ||
        process.env.API_KEY ||
        process.env.GROQ_KEY ||
        ''
    ).trim();

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Server configuration error: Missing API Key in Vercel Environment Variables. Configure GEMINI_API_KEY (or GOOGLE_API_KEY) in your Vercel project settings.' 
        });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    try {
        // 1. Google Gemini (AI Studio) - keys starting with AIza or if set as Gemini/Google env var
        const isGemini = apiKey.startsWith('AIza') || 
            Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ||
            (!apiKey.startsWith('gsk_') && !apiKey.startsWith('sk-'));

        if (isGemini) {
            const geminiResult = await callGemini(apiKey, messages);
            return res.status(200).json(geminiResult);
        }

        // 2. Groq (keys starting with gsk_)
        if (apiKey.startsWith('gsk_')) {
            const groqResult = await callOpenAICompatible(
                'https://api.groq.com/openai/v1/chat/completions',
                apiKey,
                'llama-3.3-70b-versatile',
                messages
            );
            return res.status(200).json(groqResult);
        }

        // 3. OpenAI (keys starting with sk-)
        const openAIResult = await callOpenAICompatible(
            'https://api.openai.com/v1/chat/completions',
            apiKey,
            'gpt-4o-mini',
            messages
        );
        return res.status(200).json(openAIResult);

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Error processing AI response'
        });
    }
}

/**
 * Native Google AI Studio (Gemini) integration
 */
async function callGemini(apiKey, messages) {
    let systemInstruction = '';
    const contents = [];

    for (const msg of messages) {
        if (msg.role === 'system') {
            systemInstruction += (systemInstruction ? '\n\n' : '') + msg.content;
        } else if (msg.role === 'assistant' || msg.role === 'model') {
            contents.push({
                role: 'model',
                parts: [{ text: msg.content || '' }]
            });
        } else {
            contents.push({
                role: 'user',
                parts: [{ text: msg.content || '' }]
            });
        }
    }

    // Ensure at least one user message
    if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const payload = {
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 450
        }
    };

    if (systemInstruction) {
        payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    // Use Gemini 1.5 Flash (fast, generous free tier on AI Studio)
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || `Google Gemini API Error (${response.status})`);
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
        throw new Error('Empty response received from Gemini');
    }

    return {
        choices: [
            {
                message: {
                    role: 'assistant',
                    content: replyText
                }
            }
        ]
    };
}

/**
 * OpenAI / Groq compatible API caller
 */
async function callOpenAICompatible(endpoint, apiKey, model, messages) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 400
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || `API Error (${response.status})`);
    }

    return data;
}
