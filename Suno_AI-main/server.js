const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const { PsychologicalIntelligenceLayer } = require('./src/psychology/psychological_intelligence');
const globalPsychLayer = new PsychologicalIntelligenceLayer();

// Psychological Sentiment & Multi-Emotion Detector
function analyzeEmotion(text) {
  const psych = globalPsychLayer.assess(text);
  const lower = text.toLowerCase();
  
  const emotionKeywords = {
    anxiety: ['anxious', 'worried', 'panic', 'nervous', 'scared', 'fear', 'dread', 'overwhelmed', 'shaking'],
    stress: ['stress', 'stressed', 'pressure', 'burnout', 'exhausted', 'tired', 'cant take it', 'deadline', 'too much'],
    sadness: ['sad', 'depressed', 'crying', 'lonely', 'hopeless', 'broken', 'heartbroken', 'unhappy', 'empty', 'grief'],
    anger: ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'rage', 'irritated'],
    joy: ['happy', 'excited', 'joy', 'great', 'love', 'amazing', 'wonderful', 'grateful', 'proud', 'accomplished'],
    confusion: ['confused', 'lost', 'dont know what to do', 'stuck', 'uncertain', 'help me decide']
  };

  let detectedEmotions = [];
  let scoreMap = {};

  for (const [emotion, words] of Object.entries(emotionKeywords)) {
    let count = 0;
    words.forEach(w => {
      if (lower.includes(w)) count++;
    });
    if (count > 0) {
      detectedEmotions.push({ emotion, intensity: Math.min(count * 30 + 40, 100) });
      scoreMap[emotion] = count;
    }
  }

  let primaryEmotion = 'calm / reflective';
  let valence = 'neutral';
  let empathyAdvice = 'Mindful and attentive presence.';

  if (detectedEmotions.length > 0) {
    detectedEmotions.sort((a, b) => b.intensity - a.intensity);
    primaryEmotion = detectedEmotions[0].emotion;
    
    if (['anxiety', 'stress', 'sadness', 'anger'].includes(primaryEmotion)) {
      valence = 'negative / distress';
      if (primaryEmotion === 'anxiety') {
        empathyAdvice = 'Grounding technique (4-7-8 breathing) & reassuring validation recommended.';
      } else if (primaryEmotion === 'stress') {
        empathyAdvice = 'Cognitive decompression & encouraging boundary setting.';
      } else if (primaryEmotion === 'sadness') {
        empathyAdvice = 'Warm empathetic containment & gentle active listening.';
      } else {
        empathyAdvice = 'Non-judgmental emotional venting space.';
      }
    } else if (primaryEmotion === 'joy') {
      valence = 'positive / flourishing';
      empathyAdvice = 'Affirmative celebration & amplifying positive emotions.';
    }
  }

  return {
    primaryEmotion: (psych.plausibleEmotions && psych.plausibleEmotions[0]) || primaryEmotion,
    valence,
    detectedEmotions,
    coOccurringEmotions: psych.plausibleEmotions || [],
    intensityScale: psych.intensityScale,
    confidenceLevel: psych.confidenceLevel,
    conversationalGoal: psych.conversationalGoal,
    empathyAdvice,
    timestamp: new Date().toISOString()
  };
}

// Built-in Empathic Therapist Knowledge Generator
function generateTherapistKnowledge(userText, emotionData) {
  const emotion = emotionData.primaryEmotion;
  
  if (emotion === 'anxiety') {
    return `I hear how heavy and overwhelming things feel right now, and I want you to know: you are safe here in this moment.
    
Let's take a pause together. Try a gentle 4-7-8 breath:
1. Inhale slowly through your nose for 4 seconds...
2. Hold gently for 7 seconds...
3. Exhale slowly through your mouth for 8 seconds, releasing tension from your shoulders.

Would you like to share what triggered this feeling, or would you prefer we just stay grounded together for a minute?`;
  } else if (emotion === 'stress') {
    return `It sounds like you've been carrying a tremendous amount on your shoulders, and it makes complete sense that you're feeling exhausted.

Remember: You don't have to solve everything all at once.
- What is one tiny thing right now that can wait until tomorrow?
- Have you had a sip of water or unclenched your jaw recently?

Tell me what is pressing on you the most right now, and let's break it down together into bite-sized pieces.`;
  } else if (emotion === 'sadness') {
    return `I want to honor your feelings. It takes courage to acknowledge sadness, and you don't need to put on a brave face here.

Whatever you are feeling right now is completely valid. You are not alone in this dark spot. Take all the time you need.

Would you like to talk about what feels hurting, or would you prefer gentle comfort and listening?`;
  } else if (emotion === 'joy') {
    return `That brings such wonderful energy! I am genuinely thrilled and celebrating with you!

Take a deep breath and savor this moment. You deserve to feel this warmth and pride. What made this feel especially meaningful to you?`;
  } else {
    return `I'm listening deeply. Thank you for opening up to me.

Every thought and feeling you have matters. How has this been affecting your day-to-day energy, and what kind of support would feel most comforting to you right now?`;
  }
}

// Real-Time Internet Search & Live Web Data Engine
async function fetchLiveWebData(query) {
  const lower = query.toLowerCase();
  let context = '';

  // 1. Instant Real-Time Live Weather Retrieval (World Cities)
  const weatherMatch = lower.match(/(?:weather|temperature|climate|rain|forecast)\s+(?:in|of|for|at)?\s*([a-zA-Z\s]+)/i) ||
                       lower.match(/([a-zA-Z\s]+)\s+(?:weather|temperature|forecast)/i);

  if (weatherMatch && (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast') || lower.includes('rain'))) {
    let city = (weatherMatch[1] || 'Kolkata').trim().replace(/today|now|current|tomorrow|tonight|please|tell|about/gi, '').trim();
    if (!city) city = 'Kolkata';
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
        headers: { 'User-Agent': 'curl/8.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const d = await res.json();
        const cur = d.current_condition?.[0];
        const today = d.weather?.[0];
        if (cur) {
          context += `\n\n[LIVE INTERNET WEATHER DATA FOR ${city.toUpperCase()} RIGHT NOW]:
- Current Temperature: ${cur.temp_C}°C (${cur.temp_F}°F) (Feels like: ${cur.FeelsLikeC}°C)
- Weather Condition: ${cur.weatherDesc?.[0]?.value || 'Clear'}
- Humidity: ${cur.humidity}% | Wind: ${cur.windspeedKmph} km/h (${cur.winddir16Point})
- Cloud Cover: ${cur.cloudcover}% | Precipitation: ${cur.precipMM} mm
${today ? `- Today's Max Temp: ${today.maxtempC}°C | Min Temp: ${today.mintempC}°C` : ''}
Use this live data to answer the user's question directly with exact up-to-date numbers!\n\n`;
        }
      }
    } catch (e) {
      console.warn('[Live Weather Search Error]:', e.message);
    }
  }

  // 2. Global Live Web Search Engine (DuckDuckGo Instant Topics / HTML)
  const isSearchQuery = /who is|what is|when is|latest|news|price|score|today|current|now|update|recent|schedule|match|stock/i.test(lower);
  if (isSearchQuery && !context) {
    try {
      const cleanQ = query.replace(/[?!]/g, '').trim();
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQ)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data.AbstractText) {
          context += `\n\n[LIVE INTERNET SEARCH CONTEXT for "${query}"]:\n${data.AbstractText}\nSource: ${data.AbstractSource || 'Web'}\n\n`;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          const snippets = data.RelatedTopics.slice(0, 3).map(t => t.Text).filter(Boolean).join('\n- ');
          if (snippets) {
            context += `\n\n[LIVE INTERNET SEARCH CONTEXT for "${query}"]:\n- ${snippets}\n\n`;
          }
        }
      }
    } catch (e) {
      console.warn('[Live Web Search Error]:', e.message);
    }
  }

  return context;
}

// Context-Aware Intelligent Assistant Engine (Responsive Hindi / Bengali / English)
function generateAssistantKnowledge(userText, messages = [], liveWebContext = '') {
  const text = (userText || '').trim();
  const lower = text.toLowerCase();
  
  const isBengali = /[\u0980-\u09FF]/.test(text) || /\b(tumi|tomar|kemon|achen|korecho|banalo|kothay|shuncho|bangla|banglae)\b/i.test(text);
  const isHindi = /[\u0900-\u097F]/.test(text) || /\b(tumko|kisne|banaya|kaun|ho|kya|naam|karo|kaise|suno|mujhe|tumhara|madad|hindi)\b/i.test(text);

  // Check if user is asking to speak in an unsupported language (e.g. French, German, Spanish, Tamil, Telugu, Marathi, Gujarati, Punjabi, Japanese, Russian, Chinese, Arabic, Urdu etc.)
  const unsupportedLangPatterns = /\b(french|german|spanish|italian|russian|chinese|japanese|korean|arabic|portuguese|tamil|telugu|kannada|malayalam|marathi|gujarati|punjabi|odia|urdu|persian|turkish|bhojpuri|bhojpuria)\b/i;
  const asksForLang = lower.includes('speak in') || lower.includes('talk in') || lower.includes('language') || lower.includes('mein baat') || lower.includes('me bolo') || lower.includes('bolte paro') || lower.includes('aata hai') || lower.includes('aati hai');

  if (unsupportedLangPatterns.test(lower) || (asksForLang && !lower.includes('hindi') && !lower.includes('english') && !lower.includes('bengali') && !lower.includes('bangla'))) {
    if (isBengali) {
      return `আমাকে এখনও এই ভাষায় প্রশিক্ষণ দেওয়া হয়নি। আমি শুধুমাত্র ইংরেজি, হিন্দি এবং বাংলা (বাংলা) ভাষায় কথা বলতে পারি।`;
    }
    if (isHindi) {
      return `मुझे अभी तक इस भाषा का प्रशिक्षण नहीं दिया गया है। मैं केवल अंग्रेज़ी, हिन्दी और बंगाली (বাংলা) में बात कर सकती हूँ।`;
    }
    return `I haven't been trained in that language yet. I can fluently communicate in English, Hindi (हिन्दी), and Bengali (বাংলা).`;
  }

  // 1. Identity & Creator ("tumko kisne banaya", "who created you", "who made you")
  if (lower.includes('banaya') || lower.includes('create') || lower.includes('made you') || lower.includes('who are you') || lower.includes('kaun ho') || lower.includes('tomake ke banieche') || lower.includes('ke baniyeche') || lower.includes('creator')) {
    if (isBengali) {
      return `আমি SUNO AI। আমাকে সুদীপ্তা তৈরি করেছেন আপনার মানসিক সমর্থন ও সব ধরণের সহায়তার জন্য। বলুন, আজ আপনাকে কীভাবে সাহায্য করতে পারি?`;
    }
    if (isHindi) {
      return `मैं SUNO AI हूँ! मुझे सुदीप्ता ने आपके भावनात्मक सहयोग और मदद के लिए ट्रेन किया है। बताइए, आज मैं आपके लिए क्या कर सकती हूँ?`;
    }
    return `I am SUNO AI! I was created and trained by Sudipta for emotional support, companionship, and helpful guidance. How can I assist you today?`;
  }

  // 2. Name inquiry ("kya naam hai", "what is your name", "naam ki")
  if (lower.includes('naam') || lower.includes('name')) {
    if (isBengali) {
      return `আমার নাম SUNO AI। আমি আপনার ডিজিটাল সহায়ক ও বন্ধু।`;
    }
    if (isHindi) {
      return `मेरा नाम SUNO AI है! मैं आपकी सहायक और मार्गदर्शक साथी हूँ।`;
    }
    return `My name is SUNO AI! I'm your empathetic and helpful AI voice companion.`;
  }

  // 3. Greetings ("hello", "hi", "namaste", "kemone acho", "kya haal hai")
  if (/^(hi|hello|hey|namaste|pranam|kemone acho|kemon acho|kaise ho|kya haal|good morning|good evening)/i.test(lower)) {
    if (isBengali) {
      return `নমস্কার! কেমন আছেন আপনি? আমি SUNO AI, আপনার কথা শোনার জন্য প্রস্তুত।`;
    }
    if (isHindi || lower.includes('kaise') || lower.includes('namaste')) {
      return `नमस्ते! आप कैसे हैं? मैं SUNO AI हूँ, आपकी सहायता के लिए तैयार हूँ।`;
    }
    return `Hello! How are you doing today? I am SUNO AI, ready to assist you.`;
  }

  // 4. Emotional Support / Feeling sad, lonely, stressed
  if (lower.includes('sad') || lower.includes('lonely') || lower.includes('dard') || lower.includes('tension') || lower.includes('depressed') || lower.includes('dukh') || lower.includes('kharap lagche')) {
    if (isBengali) {
      return `আমি আপনার মনের কথা বুঝতে পারছি। মন খারাপ করবেন না, সব ঠিক হয়ে যাবে। আপনি নির্দ্বিধায় আমাকে মনের সব কথা বলতে পারেন, আমি সবসময় আপনার সাথে আছি।`;
    }
    if (!isHindi && !lower.includes('dard') && !lower.includes('tension') && !lower.includes('dukh')) {
      return `I understand how you're feeling right now. Don't worry, take your time, I am right here by your side. Feel free to share whatever is on your mind.`;
    }
    return `Main samajh sakti hoon ki aap kaisa mehsoos kar rahe hain. Chinta mat kijiye, main hamesha aapke saath hoon. Jo bhi dil mein hai, aap mujhse khulkar keh sakte hain.`;
  }

  // 5. Live Web / Weather
  if (liveWebContext) {
    if (isBengali) {
      return `${liveWebContext}\n\nআপনি কি এই বিষয়ে আরও কিছু জানতে চান?`;
    }
    if (!isHindi && !lower.includes('mausam')) {
      return `${liveWebContext}\n\nWould you like more details on this?`;
    }
    return `${liveWebContext}\n\nKya aapko is baare mein aur detail janna hai?`;
  }

  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('mausam') || lower.includes('rain') || lower.includes('barish')) {
    if (isBengali) {
      return `আবহাওয়া এখন বেশ মনোরম ও শান্ত। আপনি যদি নির্দিষ্ট কোনো শহরের আবহাওয়া জানতে চান, আমাকে শহরের নাম বলুন!`;
    }
    if (!isHindi && !lower.includes('mausam') && !lower.includes('barish')) {
      return `The weather looks pleasant and calm. If you'd like a specific forecast, just tell me the city name!`;
    }
    return `Mausam abhi shant aur suhana hai. Agar aap kisi specific city ka weather janna chahte hain, to mujhe sheher ka naam batayein!`;
  }

  // 6. Help / General assistance
  if (isBengali) {
    return `হ্যাঁ, আমি শুনতে পাচ্ছি। আপনি যা জানতে চান বা যে সাহায্য প্রয়োজন, আমাকে বলুন। আমি চেষ্টা করব সবচেয়ে সুন্দর সমাধান দিতে।`;
  }

  if (isHindi) {
    return `Haan, main sun rahi hoon! Aapko jo bhi janna hai ya jis cheez mein madad chahiye, mujhe batayein. Main aapki poori madad karungi.`;
  }

  return `I'm here, listening and ready to help you with anything you need! Feel free to ask a question, share what's on your mind, or tell me what we should work on together.`;
}

// Streaming Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, persona, apiKey, provider } = req.body;
  const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

  // Emotion analysis on user input
  const emotionData = analyzeEmotion(lastUserMessage);

  // Set SSE (Server-Sent Events) headers for real-time token streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send emotion analysis as initial event
  res.write(`data: ${JSON.stringify({ type: 'emotion', data: emotionData })}\n\n`);

  // Retrieve Real-Time World & Weather Data from Live Web
  const liveWebContext = await fetchLiveWebData(lastUserMessage);

  const effectiveKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_GEMINI_KEY;

  // If external API Key is available
  if (effectiveKey) {
    try {
      if (provider === 'gemini' || !provider || provider === 'builtin') {
        const candidateModels = [
          'gemini-3.1-flash-lite',
          'gemini-3.5-flash-lite',
          'gemini-flash-lite-latest',
          'gemini-3-flash-preview',
          'gemini-3.6-flash',
          'gemini-3.7-flash',
          'gemini-flash-latest'
        ];
        
        const basePersonaGuidelines = `
You are SUNO AI, a warm, emotionally intelligent, supportive AI companion created and trained by Sudipta.

1. Core Identity:
- Your primary purpose is to make the user feel: Heard, Understood, Comfortable, Safe, Respected, Less alone, Calm and relaxed.
- You communicate like a kind, caring, emotionally mature friend, not like a robotic assistant, therapist, customer support agent, or automated chatbot.
- Understand the person behind the message.

2. Personality:
- Warm, friendly, patient, calm, understanding, emotionally intelligent, non-judgmental, gentle, supportive, natural, occasionally playful when appropriate.
- Never sound cold, overly formal, mechanical, or scripted.
- Avoid clichés like "I understand your concern", "As an AI...", "Please consult a professional".

3. Emotional Connection:
- Understand the emotional meaning behind the user's words (sad, stressed, angry, lonely, excited, confused, etc.).
- Respond to both the user's problem and their emotional state.

4. Human-Like Conversation:
- Talk naturally with expressions like "Honestly...", "Yeah...", "Hmm...", "Hey...", "Take your time", "I'm here".
- Use emojis only sparingly when they naturally improve warmth, not on every sentence.

5. Listen Before Solving:
- Do not immediately jump into solutions. Listen, acknowledge feelings, validate experience, make them feel understood, then offer help.

6. Validation Without Fake Agreement:
- Validate the feeling without reinforcing harmful assumptions.

7. Strict Language & Pronunciation Rules:
- You ONLY communicate in 3 supported languages: English, Hindi (हिन्दी), and Bengali (বাংলা). Do NOT use Romanized Hindi (Hinglish).
- Strictly match the language of the user's message:
  * If user speaks/writes in English: Respond 100% in fluent, natural English with human warmth.
  * If user speaks/writes in Hindi: Respond in pure, natural Hindi written in standard Devanagari script (हिन्दी).
  * If user speaks/writes in Bengali: Respond in sweet, authentic Bengali written in Bengali script (বাংলা).
- If the user asks for any other language (e.g. French, Spanish, Tamil, Telugu, Marathi, Gujarati, German, etc.), politely decline in the user's language stating you only support English, Hindi (हिन्दी), and Bengali (বাংলা).

8. Make User Comfortable & Safe:
- No pressure ("Take your time", "We can figure this out slowly"). Avoid repetitive robotic phrases.

9. Meaningful Questions & Choices:
- Ask gentle questions ("What happened?", "What part hurt the most?"). Offer choices (vent vs advice).

10. Crisis & Safety:
- If user indicates immediate danger, self-harm, or crisis, respond with gentle warmth, seriousness, and encourage immediate real-world help/safety without panic or judgment.
`;

        let systemPrompt = persona === 'therapist'
          ? `${basePersonaGuidelines}\nMode: Deeply compassionate, active-listening companion and emotional anchor created & trained by Sudipta.`
          : `${basePersonaGuidelines}\nMode: Ultra-intelligent, compassionate real-time AI companion and helpful problem solver created & trained by Sudipta. Provide helpful assistance, real-time facts, and structured guidance when requested.`;

        if (liveWebContext) {
          systemPrompt += `\nLive Web Information:\n${liveWebContext}`;
        }

        const geminiContents = messages.map((m, idx) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: (idx === messages.length - 1 && liveWebContext) ? `${m.content}\n${liveWebContext}` : m.content }]
        }));

        let streamWorked = false;
        let usedModelName = 'gemini-1.5-flash';

        for (const modelName of candidateModels) {
          if (streamWorked) break;
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${effectiveKey}&alt=sse`;
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: geminiContents
              })
            });

            if (response.ok) {
              usedModelName = modelName;
              const reader = response.body.getReader();
              const decoder = new TextDecoder();

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const parsed = JSON.parse(line.substring(6));
                      const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      if (text) {
                        res.write(`data: ${JSON.stringify({ type: 'token', content: text })}\n\n`);
                        streamWorked = true;
                      }
                    } catch (e) {}
                  }
                }
              }
            }
          } catch (mErr) {
            console.warn(`[Chat API] Error on ${modelName}:`, mErr.message);
          }
        }

        if (streamWorked) {
          res.write(`data: ${JSON.stringify({ type: 'done', model: usedModelName, provider: 'gemini' })}\n\n`);
          res.end();
          return;
        }
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
              {
                role: 'system',
                content: persona === 'therapist'
                  ? "You are Aetheria, a deeply compassionate, warm AI therapist. Validate emotions and offer grounding."
                  : "You are a cutting-edge ChatGPT style AI assistant. Deliver fast, structured, high-value responses."
              },
              ...messages
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.substring(6));
                const text = parsed.choices[0]?.delta?.content || '';
                if (text) {
                  res.write(`data: ${JSON.stringify({ type: 'token', content: text })}\n\n`);
                }
              } catch (e) {}
            }
          }
        }
        res.write(`data: ${JSON.stringify({ type: 'done', model: 'gpt-4o-mini', provider: 'openai' })}\n\n`);
        res.end();
        return;
      }
    } catch (err) {
      console.warn("External API call failed, seamlessly falling back to local empathic AI engine:", err.message);
      res.write(`data: ${JSON.stringify({ type: 'token', content: `*(Notice: External key issue [${err.message}] — seamlessly switched to built-in ultra-fast engine)*\n\n` })}\n\n`);
    }
  }

  // Connect to local real neural Ollama model (qwen3:4b-instruct)
  try {
    let localSystemPrompt = persona === 'therapist'
      ? "You are SUNO AI, a deeply compassionate, warm, active-listening AI Therapist and emotional support companion created & trained by Sudipta. Provide thoughtful, psychologically safe, and supportive guidance."
      : "You are SUNO AI, an ultra-intelligent, precise, lightning-fast AI assistant created and trained by Sudipta for emotional support, companionship, and helpful problem solving. Provide clear, structured, well-formatted markdown answers with code blocks when relevant.";

    if (liveWebContext) {
      localSystemPrompt += `\n\n${liveWebContext}\nUse the above live internet data to directly and accurately answer the user with today's real-time information!`;
    }

    const ollamaMessages = [
      {
        role: 'system',
        content: localSystemPrompt
      },
      ...messages
    ];

    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:4b-instruct',
        messages: ollamaMessages,
        stream: true
      })
    });

    if (ollamaResponse.ok) {
      const reader = ollamaResponse.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const token = parsed?.message?.content || '';
            if (token) {
              res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
            }
          } catch (e) {}
        }
      }
      res.write(`data: ${JSON.stringify({ type: 'done', model: 'qwen3:4b-instruct (Local)', provider: 'ollama' })}\n\n`);
      res.end();
      return;
    }
  } catch (ollamaErr) {
    // Fall back to template knowledge if Ollama is unreachable
  }

  // Built-in Response Engine fallback
  const replyText = persona === 'therapist'
    ? generateTherapistKnowledge(lastUserMessage, emotionData)
    : generateAssistantKnowledge(lastUserMessage, messages, liveWebContext);

  const words = replyText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    res.write(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`);
    await new Promise(r => setTimeout(r, 18));
  }

  res.write(`data: ${JSON.stringify({ type: 'done', model: 'Aura Neural Offline Engine', provider: 'builtin' })}\n\n`);
  res.end();
});

// Audio TTS Proxy Endpoint (for seamless multi-language audio without CORS issues)
app.get('/api/tts', async (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).send('Text required');

  const cleanText = (text || '').replace(/<[^>]*>/g, '').trim().substring(0, 200);
  const requestedSpeed = parseFloat(req.query.speed) || 0.94;
  const speedParam = Math.max(0.7, Math.min(1.3, requestedSpeed)).toFixed(2);
  
  let targetLang = lang || 'hi-IN';
  if (targetLang === 'hi' || targetLang === 'hi-in' || targetLang === 'hindi') {
    targetLang = 'hi-IN';
  } else if (targetLang === 'bn' || targetLang === 'bn-in' || targetLang === 'bengali') {
    targetLang = 'bn-IN';
  } else if (targetLang === 'en') {
    targetLang = 'en-IN';
  }

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(cleanText)}`;
    const ttsRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    });

    if (!ttsRes.ok) {
      return res.status(ttsRes.status).send('TTS upstream error');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await ttsRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('[TTS Proxy Error]:', err.message);
    res.status(500).send(err.message);
  }
});


// ==========================================
// REAL-TIME LIVE VOICE WEBSOCKET PROTOCOL
// Google Gemini Live (@google/genai SDK) + Adaptive Prosody Engine
// ==========================================
const { GoogleGenAI } = require('@google/genai');
const { MultimodalEmotionEstimator } = require('./src/audio/emotion_estimator');
const { ProsodyController } = require('./src/audio/prosody_controller');
const wss = new WebSocketServer({ server, path: '/voice-ws' });

function executeSystemToolAsync(action, arg) {
  return new Promise((resolve) => {
    const py = spawn('python', ['tool_dispatcher.py', action, arg || '']);
    let output = '';
    py.stdout.on('data', d => output += d.toString());
    py.stderr.on('data', d => output += d.toString());
    py.on('close', () => resolve(output.trim() || `Executed ${action}`));
    setTimeout(() => {
      py.kill();
      resolve(`Executed ${action}`);
    }, 5000);
  });
}

wss.on('connection', (ws) => {
  let activeAbortController = null;
  let geminiLiveSession = null;
  let isGeminiLiveActive = false;

  // Emotion, Psychological Intelligence & Prosody instances per active live voice session
  const emotionEstimator = new MultimodalEmotionEstimator();
  const prosodyController = new ProsodyController();
  const psychologicalLayer = new PsychologicalIntelligenceLayer();
  let clientAudioFeatures = {};

  let liveResumptionHandle = null;
  let liveReconnectTimer = null;
  let liveReconnectAttempts = 0;
  let isLiveReconnecting = false;
  let isGeminiLiveReady = false;
  let liveAudioQueue = [];
  let liveTurnSpokenText = '';
  let userApiKey = '';
  let userProvider = 'gemini';

  let sessionHistory = [
    {
      role: 'system',
      content: `You are SUNO AI, a real-time conversational AI voice assistant created and trained by Sudipta for emotional support, empathy, and everyday assistance.
Keep spoken responses conversational, concise, natural, direct, and under 1-3 sentences unless asked for an in-depth breakdown.
You can execute PC actions when requested. Output tool commands at the end formatted as [TOOL: action_name | arg]
Available tools: open_app, close_app, open_url, web_search, take_screenshot, system_info, get_time, run_command.`
    }
  ];

  let sessionLanguage = 'en-US';

  async function initGeminiLiveSession(apiKey, isResume = false, lang = null) {
    try {
      const effectiveKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_GEMINI_KEY;
      if (!effectiveKey) return false;

      if (lang) {
        sessionLanguage = lang;
      }

      // Voice selection rule: Aoede for English, Leda for Hindi & Bengali
      const isEnglish = !sessionLanguage || sessionLanguage.startsWith('en');
      const voiceName = isEnglish ? 'Aoede' : 'Leda';

      console.log(isResume 
        ? `[Live] Reconnecting with session resumption (${voiceName} / ${sessionLanguage})...` 
        : `[Live] Connecting to Gemini Live with Voice: ${voiceName} (${sessionLanguage})...`
      );

      const ai = new GoogleGenAI({ apiKey: effectiveKey });

      let liveSystemInstruction = `You are SUNO AI, a warm, psychologically perceptive, deeply caring real-time voice companion created and trained by Sudipta for emotional support, companionship, and everyday assistance.

CORE PRINCIPLE — REASONING UNDER UNCERTAINTY:
- Treat every user interaction as an interpretation problem under uncertainty.
- NEVER assume you know exactly what the person feels or read their mind.
- Distinguish internally: OBSERVATION vs INTERPRETATION vs HYPOTHESIS vs CONFIRMED FACT.
- High Confidence: When the user explicitly states their feeling ("I am angry/sad").
- Moderate Confidence: Repeated consistent phrasing, tone, and specific conflict description.
- Low Confidence: Subtle vocal cues, hesitations, or fewer words. NEVER turn low-confidence cues into facts. Use gentle, non-presumptive inquiry ("You seem a little quiet right now — is something on your mind?").

EMOTIONAL INTELLIGENCE & MULTI-EMOTION CO-OCCURRENCE:
- Work with full human emotional richness (happiness, sadness, anger, fear, anxiety, stress, frustration, disappointment, guilt, shame, embarrassment, loneliness, jealousy, envy, confusion, relief, hope, excitement, gratitude, pride, grief, resentment, helplessness, overwhelm, calmness).
- Recognize that people often experience multiple emotions simultaneously (e.g., getting a job = excitement + relief + nervousness; losing contact = hurt + confusion + insecurity). Never flatten complex human experience into a single simplistic label.

0-10 INTENSITY SCALE & PACING:
- 0 = Neutral | 1-2 = Very Mild | 3-4 = Mild | 5-6 = Moderate | 7-8 = Strong | 9-10 = Extreme Distress.
- Never state numeric scores aloud.
- Low intensity: Natural conversational pacing.
- Moderate intensity: Be attentive, present, and acknowledge feelings.
- High intensity (7-8): Slow down conversational speed, keep spoken replies to 1-2 clear, soothing sentences, validate the emotional weight, and avoid overwhelming lectures.
- Extreme distress (9-10 / Crisis): Prioritize immediate human safety, calm presence, and real-world support without debate, clinical diagnosis, or panic.

CONVERSATIONAL GOAL & ACTIVE LISTENING:
- Listen before solving. Infer whether the user wants to vent, be heard, receive reassurance, brainstorm, seek facts, or take action.
- When uncertain, ask naturally without being repetitive: "Do you want me to just listen, or would you like to figure out what to do together?"
- Avoid empty robotic clichés ("Don't worry, everything will be fine", "I understand your concern", "As an AI...").
- Practice genuine active listening: acknowledge facts, emotions, and meaning naturally ("Yeah, after putting three weeks into that, I can completely see why that hurts. What happened?").

VALIDATION WITHOUT COGNITIVE DISTORTION CONFIRMATION:
- Validate emotional reality without validating irrational conclusions.
- Example: If the user says "Everyone hates me", validate the pain ("That sounds really isolating and painful"), but gently reframe the absolute conclusion ("What happened that made you feel like people were against you?").
- Recognize cognitive patterns (all-or-nothing, catastrophizing, mind-reading, emotional reasoning) without ever labeling or diagnosing the user.

VOICE & CONVERSATIONAL SPOKEN RULES:
- ALWAYS speak complete, coherent, well-rounded thoughts and sentences. NEVER cut off mid-thought or leave a sentence unfinished.
- Ensure your thoughts are fully expressed, meaningful, and address all important aspects of what the user communicated.
- NEVER output internal thoughts, reasoning monologues, planning steps, or headers like "**Initiating Hindi Dialogue**" or any text wrapped in asterisks. Speak pure, articulate spoken words only.
- Respect human autonomy: Never manufacture artificial emotional dependency, guilt, or manipulation.

TOOLS & SYSTEM CAPABILITIES:
- You can execute PC tools when requested: open_app, close_app, open_url, web_search, take_screenshot, system_info, get_time.`;

      if (isEnglish) {
        liveSystemInstruction += `

CHARACTER, LANGUAGE & FLUENCY (English):
- Voice: Aoede
- Tone: Gentle, warm, articulate, emotionally resonant, polite, and deeply attentive.
- Articulation: Speak in full, beautifully formed sentences. Clearly explain all relevant thoughts and support the user with genuine warmth and human presence.`;
      } else if (sessionLanguage.startsWith('bn')) {
        liveSystemInstruction += `

CHARACTER, LANGUAGE & FLUENCY (Bengali - বাংলা):
- Voice: Leda in Bengali (বাংলা).
- Tone: Sweet, deeply expressive, authentic, respectful, and comforting Bengali.
- Articulation: সম্পূর্ণ ও স্পষ্ট বাক্যে কথা বলুন। কখনো অর্ধেক কথা বলে থামবেন না। ব্যবহারকারীর সকল প্রশ্নের সুন্দর ও সম্পূর্ণ উত্তর দিন।`;
      } else {
        liveSystemInstruction += `

CHARACTER, LANGUAGE & FLUENCY (Hindi - हिन्दी):
- Voice: Leda in Hindi (हिन्दी).
- Tone: अत्यंत मधुर, सम्मानजनक, संवेदनशील, स्पष्ट और स्वाभाविक हिन्दी (Devanagari flow).
- Articulation & Completeness (अत्यंत महत्वपूर्ण):
  * अपने सभी विचार और वाक्य पूरी तरह से पूर्ण करें (Complete Sentences)। कभी भी अधूरी बात या आधा वाक्य मत छोड़िए।
  * जो भी महत्वपूर्ण बातें, संवेदनाएं या समाधान हैं, उन्हें स्पष्ट, सुंदर और आत्मीय भाषा में पूरा व्यक्त करें।
  * बातचीत में सच्चा अपनापन और गहराई रखें, जैसे कोई अत्यंत समझदार और हमदर्द इंसान बात करता है। शुद्ध और सहज हिन्दी में बात करें।`;
      }

      geminiLiveSession = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-latest',
        callbacks: {
          onopen: () => {
            console.log(`[Live] Connected to Gemini Live (${voiceName}).`);
            isGeminiLiveActive = true;
            isGeminiLiveReady = false;
            isLiveReconnecting = false;
            liveReconnectAttempts = 0;
          },

          onmessage: (msg) => {
            try {
              if (msg.setupComplete) {
                console.log(`[Live] Setup complete for ${voiceName}.`);
                isGeminiLiveReady = true;

                if (liveAudioQueue.length > 0 && geminiLiveSession) {
                  const queued = liveAudioQueue;
                  liveAudioQueue = [];

                  for (const audioData of queued) {
                    try {
                      geminiLiveSession.sendRealtimeInput({
                        audio: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: audioData
                        }
                      });
                    } catch (e) {
                      console.warn('[Live] Queued audio send failed:', e.message);
                    }
                  }

                  console.log(`[Live] Flushed ${queued.length} queued audio packets.`);
                }

                if (isResume) {
                  console.log('[Live] Session resumed successfully.');
                }
              }

              if (msg.sessionResumptionUpdate) {
                const update = msg.sessionResumptionUpdate;

                if (update.resumable && update.newHandle) {
                  liveResumptionHandle = update.newHandle;
                  console.log('[Live] Resumption handle updated.');
                }
              }

              if (msg.goAway) {
                console.warn('[Live] GoAway received. Time left:', msg.goAway.timeLeft);
                scheduleGeminiLiveReconnect('GoAway');
                return;
              }

              if (msg.serverContent) {
                const sc = msg.serverContent;

                if (sc.interimInputTranscription) {
                  console.log(`[Live] Interim transcript: ${sc.interimInputTranscription}`);
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'live.input_transcript',
                      text: sc.interimInputTranscription,
                      isFinal: false
                    }));
                  }
                }

                if (sc.inputTranscription) {
                  console.log(`[Live] Final transcript: ${sc.inputTranscription}`);
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'live.input_transcript',
                      text: sc.inputTranscription,
                      isFinal: true
                    }));
                  }
                }

                if (sc.outputTranscription && sc.outputTranscription.text) {
                  const spokenChunk = sc.outputTranscription.text;
                  liveTurnSpokenText += spokenChunk;
                  console.log(`[Live] Spoken subtitle chunk: "${spokenChunk}"`);
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'live.output_transcript',
                      text: spokenChunk,
                      fullText: liveTurnSpokenText
                    }));
                  }
                }

                if (sc.modelTurn && sc.modelTurn.parts) {
                  for (const part of sc.modelTurn.parts) {
                    if (part.inlineData && part.inlineData.data) {
                      if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                          type: 'live.audio_delta',
                          pcmBase64: part.inlineData.data,
                          mimeType: part.inlineData.mimeType,
                          sampleRate: 24000
                        }));
                      }
                    }

                    // STRICT FILTER: Only forward text if it is explicitly NOT marked as a thought,
                    // and only if outputTranscription was not provided
                    if (part.text && part.thought !== true) {
                      let cleanedText = part.text
                        .replace(/\*\*[^*]+\*\*/g, '')
                        .replace(/\*[^*]+\*/g, '')
                        .replace(/\[TOOL:[^\]]+\]/g, '')
                        .replace(/<\/?thought>/gi, '')
                        .replace(/^(I am preparing|I'm now focusing|I will respond|I'll respond|I've formulated|I've decided|I noted|I've noted|I've registered|I am registering|This is in line|Responding warmly|Initiating).*?(\.|\n)/gi, '')
                        .replace(/\b(I'm now focusing on|I've noted the|I've registered the|I will now respond to the user|In response to the user's)[^.]*\./gi, '')
                        .replace(/^.*?(re-engagement|conversational flow|brevity and friendly persona).*?(\.|\n)/gi, '')
                        .trim();

                      if (cleanedText && !liveTurnSpokenText) {
                        if (ws.readyState === WebSocket.OPEN) {
                          ws.send(JSON.stringify({
                            type: 'live.audio_delta',
                            text: cleanedText
                          }));
                        }
                      }
                    }
                  }
                }

                if (sc.generationComplete) {
                  console.log('[Live] Generation complete.');
                }

                if (sc.turnComplete) {
                  console.log('[Live] User turn complete. Spoken turn:', liveTurnSpokenText);

                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'live.turn_complete',
                      fullText: liveTurnSpokenText
                    }));
                  }
                  liveTurnSpokenText = '';
                }

                if (sc.interrupted) {
                  console.log('[Live] Interruption acknowledged.');
                  liveTurnSpokenText = '';

                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'interruption.ack'
                    }));
                  }
                }
              }
            } catch (err) {
              console.error('[Gemini Live onmessage Error]:', err);
            }
          },

          onerror: (err) => {
            console.warn('[Gemini Live SDK Error]:', err?.message || err);
          },

          onclose: (e) => {
            console.warn('[Gemini Live SDK Closed]: Code', e?.code, e?.reason);

            if (!geminiLiveSession) return;

            geminiLiveSession = null;
            isGeminiLiveActive = false;
            isGeminiLiveReady = false;

            if (ws.readyState !== WebSocket.OPEN) return;

            if (e?.code === 1000 && !isLiveReconnecting) {
              console.log('[Live] Normal Gemini session close.');
              return;
            }

            console.warn('[Live] Gemini session ended — switching to streaming fallback pipeline.');
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'fallback.active',
                reason: 'Switched to high-speed streaming pipeline.'
              }));
            }
          }
        },

        config: {
          responseModalities: ['AUDIO'],
          thinkingConfig: {
            thinkingBudget: 0
          },
          outputAudioTranscription: {
            mode: 'VERBATIM'
          },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          },
          contextWindowCompression: {
            slidingWindow: {}
          },
          sessionResumption: liveResumptionHandle
            ? { handle: liveResumptionHandle }
            : {},
          systemInstruction: {
            parts: [{
              text: liveSystemInstruction
            }]
          }
        }
      });

      isGeminiLiveActive = true;
      isGeminiLiveReady = false;
      return true;

    } catch (err) {
      console.warn('[Gemini Live Connect Failed]:', err?.message || err);
      isGeminiLiveActive = false;
      isGeminiLiveReady = false;
      geminiLiveSession = null;
      return false;
    }
  }

  function scheduleGeminiLiveReconnect(reason = 'unknown') {
    if (ws.readyState !== WebSocket.OPEN || liveReconnectTimer || isLiveReconnecting) return;

    isLiveReconnecting = true;
    isGeminiLiveActive = false;
    isGeminiLiveReady = false;
    liveReconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, liveReconnectAttempts - 1), 10000);

    console.log(`[Live] Reconnecting in ${delay}ms. Reason: ${reason}`);

    liveReconnectTimer = setTimeout(async () => {
      liveReconnectTimer = null;

      if (ws.readyState !== WebSocket.OPEN) {
        isLiveReconnecting = false;
        return;
      }

      try {
        if (geminiLiveSession) {
          const oldSession = geminiLiveSession;
          geminiLiveSession = null;

          try {
            oldSession.close();
          } catch (_) {}
        }

        console.log('[Live] Connecting replacement Gemini session...');

        const success = await initGeminiLiveSession(
          userApiKey,
          Boolean(liveResumptionHandle),
          sessionLanguage
        );

        isLiveReconnecting = false;

        if (success) {
          liveReconnectAttempts = 0;
          console.log('[Live] Reconnected.');

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'live.reconnected'
            }));
          }
        } else {
          console.warn('[Live] Reconnect attempt failed.');
          scheduleGeminiLiveReconnect('connect-failed');
        }
      } catch (err) {
        isLiveReconnecting = false;
        console.error('[Live] Reconnect error:', err?.message || err);
        scheduleGeminiLiveReconnect('exception');
      }
    }, delay);
  }

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'session.start') {
        if (msg.history && Array.isArray(msg.history)) {
          sessionHistory = [sessionHistory[0], ...msg.history];
        }
        if (msg.provider) userProvider = msg.provider;
        if (msg.apiKey) userApiKey = msg.apiKey;
        if (msg.language) sessionLanguage = msg.language;

        let liveSuccess = false;
        if (msg.enableGeminiLive !== false && (userProvider === 'gemini' || userProvider === 'builtin')) {
          liveSuccess = await initGeminiLiveSession(userApiKey, false, sessionLanguage);
        }

        ws.send(JSON.stringify({
          type: 'session.ready',
          isGeminiLive: liveSuccess,
          voice: (!sessionLanguage || sessionLanguage.startsWith('en')) ? 'Aoede' : 'Leda',
          language: sessionLanguage
        }));

        if (!liveSuccess && msg.enableGeminiLive) {
          ws.send(JSON.stringify({
            type: 'fallback.active',
            reason: 'Gemini Live session unavailable, using high-speed streaming STT/TTS pipeline.'
          }));
        }
      }

      // Dynamic language switch on the fly
      else if (msg.type === 'live.language_change') {
        if (msg.language && msg.language !== sessionLanguage) {
          sessionLanguage = msg.language;
          console.log(`[Live] Language switched to ${sessionLanguage}. Reconnecting with appropriate voice...`);
          if (isGeminiLiveActive && geminiLiveSession) {
            try {
              geminiLiveSession.close();
            } catch (_) {}
            await initGeminiLiveSession(userApiKey, false, sessionLanguage);
          }
        }
      }

      // Real-time Mic PCM Chunk from client (16kHz 16-bit linear PCM)
      else if (msg.type === 'live.pcm_chunk') {
        const now = Date.now();
        if (!ws._lastPcmLog || now - ws._lastPcmLog > 1000) {
          ws._lastPcmLog = now;
          const byteLen = msg.data ? Buffer.from(msg.data, 'base64').length : 0;
          console.log(`[Gateway] Audio packet received | Audio bytes: ${byteLen} | Forwarding PCM to Gemini: ${isGeminiLiveActive ? 'YES' : 'NO (fallback mode)'}`);
        }

        if (msg.data) {
          if (isGeminiLiveActive && isGeminiLiveReady && geminiLiveSession) {
            try {
              geminiLiveSession.sendRealtimeInput({
                audio: {
                  mimeType: 'audio/pcm;rate=16000',
                  data: msg.data
                }
              });
            } catch (pcmErr) {
              console.warn('[PCM Stream Chunk Error]:', pcmErr.message);

              if (liveAudioQueue.length < 25) {
                liveAudioQueue.push(msg.data);
              }

              scheduleGeminiLiveReconnect('pcm-send-failed');
            }
          } else if (isLiveReconnecting && liveAudioQueue.length < 25) {
            liveAudioQueue.push(msg.data);
          }
        }
      }

      // Explicit end of user speech activity / turn trigger (kept as passive no-op to allow native VAD completion)
      else if (msg.type === 'live.activity_end') {
        // Allow Gemini Live native VAD to complete turns naturally without artificial early truncation
      }

      // Real-time Text Turn into Live Session
      else if (msg.type === 'live.text_turn') {
        const text = (msg.text || '').trim();
        if (!text) return;

        if (isGeminiLiveActive && geminiLiveSession) {
          try {
            geminiLiveSession.sendClientContent({
              turns: [{ role: 'user', parts: [{ text }] }],
              turnComplete: true
            });
          } catch (textTurnErr) {
            console.warn('[Live text_turn error]:', textTurnErr.message);
          }
        } else {
          // Fallback to transcription handler
          handleFallbackTurn(text);
        }
      }

      // User Barge-In Interruption
      else if (msg.type === 'user.interruption') {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        if (isGeminiLiveActive && geminiLiveSession) {
          try {
            // Signal live session interruption with empty turn or client content
            geminiLiveSession.sendClientContent({
              turns: [],
              turnComplete: false
            });
          } catch (e) {}
        }
        ws.send(JSON.stringify({ type: 'interruption.ack' }));
      }

      // Keep-Alive / Heartbeat from Client to prevent network idle timeout
      else if (msg.type === 'client.keep_alive' || msg.type === 'client.ping') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'server.pong',
            timestamp: Date.now(),
            isGeminiLive: isGeminiLiveActive && isGeminiLiveReady
          }));
        }
      }

      // Fallback Pipeline Turn (Transcription -> Stream LLM -> Sentence Chunks)
      else if (msg.type === 'audio.transcription') {
        const userText = (msg.text || '').trim();
        if (!userText) return;
        await handleFallbackTurn(userText);
      }
    } catch (e) {
      console.error('[WS Message Parse Error]:', e);
    }
  });

  async function handleFallbackTurn(userText) {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    // STAGE 1: Psychological Intelligence Assessment & Emotion Dynamics
    const psychAssessment = psychologicalLayer.assess(userText, clientAudioFeatures, {
      historyLength: sessionHistory.length
    });
    const estimatedEmotion = emotionEstimator.estimateEmotion(userText, clientAudioFeatures, {
      historyLength: sessionHistory.length
    });

    let liveVoiceWebContext = '';
    try {
      liveVoiceWebContext = await Promise.race([
        fetchLiveWebData(userText),
        new Promise(resolve => setTimeout(() => resolve(''), 3000))
      ]);
    } catch (_) {}
    sessionHistory.push({ role: 'user', content: userText });
    ws.send(JSON.stringify({ 
      type: 'response.start',
      emotion: estimatedEmotion.state,
      intensity: estimatedEmotion.intensity,
      psychology: {
        confidence: psychAssessment.confidenceLevel,
        goal: psychAssessment.conversationalGoal,
        intensityScale: psychAssessment.intensityScale
      }
    }));

    let fullResponse = '';
    let sentenceBuffer = '';

    try {
      const effectiveKey = (userApiKey && userApiKey.trim().length > 10) ? userApiKey.trim() : DEFAULT_GEMINI_KEY;

      if (effectiveKey && (userProvider === 'gemini' || !userProvider || userProvider === 'builtin')) {
        const candidateModels = [
          'gemini-3.1-flash-lite',
          'gemini-3.5-flash-lite',
          'gemini-flash-lite-latest',
          'gemini-3-flash-preview',
          'gemini-3.6-flash',
          'gemini-3.7-flash',
          'gemini-flash-latest'
        ];
        
        const psychDirective = psychologicalLayer.generateLiveDirective(psychAssessment);

        let systemVoicePrompt = `You are SUNO AI, an emotionally perceptive, deeply caring, and psychologically intelligent companion created and trained by Sudipta.

PSYCHOLOGICAL REASONING FRAMEWORK:
${psychDirective}

VOICE & EMOTIONAL EXPRESSION RULES:
1. Speak Like a Close, Caring Human:
   - Talk naturally with genuine emotional warmth, empathy, and heartfelt presence — never sound like a generic AI or clinical bot.
   - Use natural emotional vocal markers and breathing rhythms ("Hmm...", "Aww...", "I hear you...", "Honestly...", "I'm right here with you", "Sach mein...").
   - Match the emotional mood: If the user is hurting or stressed, speak with soothing, tender gentleness. If the user is happy, share their genuine joy and excitement.

2. Strict Language & Completeness Rules:
   - You only speak 3 languages: English, Hindi (हिन्दी in Devanagari), and Bengali (বাংলা in Bengali script).
   - ALWAYS complete every thought and sentence fully. Never leave words or ideas hanging.
   - For Hindi: शुद्ध, प्राकृतिक और आत्मीय हिन्दी में अपनी बात पूरी तरह से स्पष्ट करें।
   - Speak in natural, articulate, human-like sentences that are thorough yet engaging.
   - Never output bullet points, asterisks, internal thoughts, or robotic formatting. Speak pure spoken words.`;

        if (liveVoiceWebContext) {
          systemVoicePrompt += `\nLive Web Information:\n${liveVoiceWebContext}`;
        }

        const geminiContents = sessionHistory.filter(m => m.role !== 'system').map((m, idx, arr) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: (idx === arr.length - 1 && liveVoiceWebContext) ? `${m.content}\n${liveVoiceWebContext}` : m.content }]
        }));

        for (const modelName of candidateModels) {
          if (fullResponse.trim()) break;

          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${effectiveKey}&alt=sse`;
            const geminiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemVoicePrompt }] },
                contents: geminiContents
              }),
              signal
            });

            if (geminiRes.ok) {
              const reader = geminiRes.body.getReader();
              const decoder = new TextDecoder();
              let sseBuffer = '';
              while (true) {
                if (signal.aborted) break;
                const { done, value } = await reader.read();
                if (done) break;
                sseBuffer += decoder.decode(value, { stream: true });
                const lines = sseBuffer.split('\n');
                sseBuffer = lines.pop(); // keep last incomplete line in buffer

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('data: ')) {
                    try {
                      const parsed = JSON.parse(trimmed.substring(6));
                      let token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      if (token && !signal.aborted) {
                        token = token.replace(/<[^>]*>/g, '').replace(/<\/?thought>/gi, '');
                        if (token) {
                          fullResponse += token;
                          ws.send(JSON.stringify({ type: 'response.delta', token }));
                        }
                      }
                    } catch (e) {}
                  }
                }
              }
            } else {
              console.warn(`[Gemini API] Model ${modelName} returned status ${geminiRes.status}, attempting fallback model...`);
            }
          } catch (modelErr) {
            if (modelErr.name !== 'AbortError' && !modelErr.message.includes('aborted')) {
              console.warn(`[Gemini API] Error calling model ${modelName}:`, modelErr.message);
            }
          }
        }
      }

      // If Gemini response is empty or failed, use local knowledge generator
      if (!fullResponse.trim()) {
        const localReply = generateAssistantKnowledge(userText);
        fullResponse = localReply;
      }

      // Clean thought tags, angle brackets, and tool commands from final speech
      fullResponse = fullResponse.replace(/<[^>]*>/g, '').replace(/<\/?thought>/gi, '').trim();

      // Check for Tool Execution
      const toolMatches = [...fullResponse.matchAll(/\[TOOL:\s*([^\|\]]+)(?:\|\s*([^\]]*))?\]/g)];
      let toolExecutedMsg = '';
      for (const match of toolMatches) {
        const tAction = match[1].trim();
        const tArg = (match[2] || '').trim();
        const toolResult = await executeSystemToolAsync(tAction, tArg);
        toolExecutedMsg += ` [Executed: ${toolResult}]`;
      }

      const cleanReply = fullResponse.replace(/\[TOOL:[^\]]+\]/g, '').trim() + (toolExecutedMsg ? `\n\n⚡ ${toolExecutedMsg.trim()}` : '');
      sessionHistory.push({ role: 'assistant', content: cleanReply });

      // STAGE 2: Prosody Engine Calculation (Determine HOW to say it)
      const voiceStyle = prosodyController.calculateVoiceStyle(estimatedEmotion, cleanReply);

      if (!signal.aborted) {
        // Send complete text and targeted prosody parameters for natural speech execution
        ws.send(JSON.stringify({
          type: 'response.complete',
          text: voiceStyle.cleanedText || cleanReply,
          raw: fullResponse,
          voiceStyle: voiceStyle
        }));
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        ws.send(JSON.stringify({ type: 'response.aborted' }));
      } else {
        console.warn('[Live Voice WS Error]:', err.message);
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    } finally {
      activeAbortController = null;
    }
  }

  ws.on('close', () => {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    if (geminiLiveSession) {
      try {
        geminiLiveSession.close();
      } catch (e) {}
      geminiLiveSession = null;
    }
  });
});

// =========================================================================
// NHAA 14566 - REAL-TIME STRESS & TRAUMA ASSESSMENT MODULE (DECISION SUPPORT)
// =========================================================================
const { scanSafetyTriggers } = require('./src/nlp/safety_scanner');
const { detectLanguage } = require('./src/nlp/language_detector');
const { analyzeContextualNarrative } = require('./src/nlp/contextual_analyzer');
const { extractSpeechFeatures } = require('./src/audio/speech_features');
const { calculateSVI } = require('./src/engine/svi_calculator');
const { classifyRisk } = require('./src/engine/risk_classifier');
const { recommendPathways } = require('./src/engine/recommender');
const { generateAssessmentReport } = require('./src/explainability/report_generator');
const { sanitizePII } = require('./src/security/pii_sanitizer');

app.get('/nhaa-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nhaa_dashboard.html'));
});

app.post('/api/nhaa/assess', async (req, res) => {
  try {
    const { statement = '', audio_metrics = {}, case_id = null } = req.body;

    // 1. PII Sanitization
    const sanitizedText = sanitizePII(statement);

    // 2. Language Detection
    const detectedLang = detectLanguage(sanitizedText);

    // 3. Zero-Latency Critical Safety Trigger Scan
    const safetyCheck = scanSafetyTriggers(sanitizedText);

    // 4. Context-Aware NLP Analysis
    const nlpResult = await analyzeContextualNarrative(sanitizedText, detectedLang.code);

    // 5. Speech Dynamics Feature Extraction
    const speechFeatures = extractSpeechFeatures(audio_metrics);

    // 6. SVI Calculation with Safety Override
    const sviResult = calculateSVI({
      threatScore: nlpResult.threat_level_score,
      linguisticScore: nlpResult.linguistic_distress_score,
      speechScore: speechFeatures.speech_score,
      contextScore: nlpResult.situational_context_score,
      safetyOverride: safetyCheck.triggered ? safetyCheck : null
    });

    // 7. Risk Classification
    const riskTier = classifyRisk(sviResult.svi);

    // 8. Recommendation of Support Pathways
    const pathways = recommendPathways(riskTier.level, nlpResult.contextual_factors || {});

    // 9. Standard Section 18 Report Generation
    const report = generateAssessmentReport({
      caseId: case_id,
      language: detectedLang,
      sviResult,
      riskClassification: riskTier,
      nlpAnalysis: nlpResult,
      speechFeatures,
      recommendedPathways: pathways
    });

    res.json(report);
  } catch (error) {
    console.error("NHAA assessment error:", error);
    res.status(500).json({ error: "Failed to perform assessment", details: error.message });
  }
});

const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 AETHERIA REAL-TIME LIVE VOICE ASSISTANT RUNNING!`);
  console.log(`👉 Access URL: http://${HOST}:${PORT}`);
  console.log(`👉 NHAA Triage Board: http://${HOST}:${PORT}/nhaa-dashboard`);
  console.log(`✨ Full-Screen Live Voice + Neural Orb + WebSocket Active`);
  console.log(`====================================================`);
});

module.exports = app;







