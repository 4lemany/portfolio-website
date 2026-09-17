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
            error: 'Server configuration error: Missing API Key in Vercel Environment Variables. Configure GEMINI_API_KEY in your Vercel project settings.' 
        });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    try {
        // 1. Google Gemini (AI Studio)
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
 * Native Google AI Studio (Gemini) integration with dynamic ModelService.ListModels discovery
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

    // Step 1: Query ListModels dynamically to get the exact models active for this specific key
    let targetModelPath = process.env.GEMINI_MODEL ? `models/${process.env.GEMINI_MODEL.replace(/^models\//, '')}` : null;

    if (!targetModelPath) {
        try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const listData = await listRes.json();

            if (listData?.error?.message) {
                throw new Error(`Google AI Studio error: ${listData.error.message}`);
            }

            if (listData.models && Array.isArray(listData.models)) {
                // Filter models supporting generateContent and suitable for text chat
                const chatModels = listData.models.filter(m => 
                    Array.isArray(m.supportedGenerationMethods) && 
                    m.supportedGenerationMethods.includes('generateContent') &&
                    !m.name.includes('embedding') &&
                    !m.name.includes('aqa') &&
                    !m.name.includes('imagen')
                );

                if (chatModels.length > 0) {
                    // Priority preference list of current models (Gemini 3.6 Flash primary)
                    const preferred = [
                        'models/gemini-3.6-flash',
                        'models/gemini-3.6',
                        'models/gemini-3.5-flash',
                        'models/gemini-3.5-pro',
                        'models/gemini-2.0-flash',
                        'models/gemini-2.0-flash-exp',
                        'models/gemini-2.5-flash',
                        'models/gemini-1.5-flash-latest',
                        'models/gemini-1.5-flash-002',
                        'models/gemini-1.5-flash'
                    ];

                    const found = preferred.find(p => chatModels.some(m => m.name === p));
                    targetModelPath = found || chatModels[0].name;
                } else {
                    const names = listData.models.map(m => m.name).join(', ');
                    throw new Error(`No models with generateContent found for this key. Available models: [${names}]`);
                }
            }
        } catch (err) {
            console.warn('ListModels query failed or completed with note:', err.message);
            if (err.message.startsWith('Google AI Studio error') || err.message.startsWith('No models')) {
                throw err;
            }
        }
    }

    if (!targetModelPath) {
        targetModelPath = 'models/gemini-3.6-flash';
    }

    // Step 2: Call the selected model
    const url = `https://generativelanguage.googleapis.com/v1beta/${targetModelPath}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini Error (${response.status}) on ${targetModelPath}`);
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
