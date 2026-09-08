/**
 * Psychological Intelligence Layer for SUNO AI
 * 
 * CORE PRINCIPLE:
 * Treat every interaction as an interpretation problem under uncertainty.
 * Psychology is a reasoning and empathy framework, NEVER an instrument for diagnosis or mind-reading.
 * 
 * Implements:
 * 1. Multi-dimensional emotional palette (30+ human emotions with co-occurrence)
 * 2. 0-10 calibrated intensity scale
 * 3. Confidence level separation (High, Moderate, Low) - Low confidence never treated as fact
 * 4. Acoustic prosody & speech context fusion
 * 5. Conversational goal inference (vent, listening, advice, distraction, grounding, action)
 * 6. Active listening & validation without cognitive distortion confirmation
 * 7. Gentle cognitive reframing & emotional regulation strategies
 * 8. Dynamic conversation pacing & trauma-informed crisis boundaries
 */

// 1. Broad Emotional Palette
const EMOTIONS_CATALOG = [
  'happiness', 'sadness', 'anger', 'fear', 'anxiety', 'stress', 'frustration',
  'disappointment', 'guilt', 'shame', 'embarrassment', 'loneliness', 'jealousy',
  'envy', 'confusion', 'surprise', 'disgust', 'relief', 'hope', 'excitement',
  'gratitude', 'pride', 'love', 'affection', 'grief', 'resentment', 'helplessness',
  'overwhelm', 'calmness', 'boredom', 'indifference', 'uncertainty'
];

// Lexical, syntactical and conversational triggers for multi-emotion detection
const EMOTION_PROFILES = {
  happiness: {
    patterns: [/\b(happy|glad|delighted|pleased|joy|joyful|cheerful|content)\b/i, /khush|anondo|sukhi/i],
    weight: 0.8
  },
  excitement: {
    patterns: [/\b(excited|thrilled|can't wait|pumped|hyped|fantastic|amazing|awesome)\b/i, /utsahito|romanchit/i],
    weight: 0.85
  },
  relief: {
    patterns: [/\b(relief|relieved|finally done|weight off|glad that's over|thank goodness)\b/i, /shanti mili|bach gaye|halka lag raha/i],
    weight: 0.8
  },
  pride: {
    patterns: [/\b(proud|accomplished|did it|achieved|won|succeeded)\b/i, /garv|gorbo/i],
    weight: 0.8
  },
  gratitude: {
    patterns: [/\b(thank you|grateful|thankful|appreciate|blessed)\b/i, /dhanyavad|shukriya|kritagya/i],
    weight: 0.8
  },
  sadness: {
    patterns: [/\b(sad|down|unhappy|crying|tears|heartbroken|depressed|miserable|blue)\b/i, /dukhi|mon kharap|udaas|rona/i],
    weight: 0.85
  },
  grief: {
    patterns: [/\b(lost someone|passed away|died|death|funeral|mourning|never see .* again)\b/i, /chale gaye|mar gaye|shok/i],
    weight: 0.95
  },
  loneliness: {
    patterns: [/\b(lonely|alone|nobody cares|no one to talk to|isolated|abandoned)\b/i, /akela|ekaki|nisongo/i],
    weight: 0.85
  },
  disappointment: {
    patterns: [/\b(disappointed|let down|expected more|didn't work out|wasted|failed me)\b/i, /nirash|ashahoto/i],
    weight: 0.8
  },
  helplessness: {
    patterns: [/\b(helpless|powerless|nothing I can do|stuck|lost control|trapped)\b/i, /bebas|lachar|upay nei/i],
    weight: 0.85
  },
  anxiety: {
    patterns: [/\b(anxious|nervous|dread|scared of what will happen|panic|panicking|jittery|shaking)\b/i, /ghabrahant|chinta|tension|darr lag raha/i],
    weight: 0.85
  },
  sadness: {
    patterns: [/\b(sad|down|unhappy|crying|tears|heartbroken|depressed|miserable|blue|failed|failure)\b/i, /dukhi|mon kharap|udaas|rona/i],
    weight: 0.85
  },
  grief: {
    patterns: [/\b(lost someone|passed away|died|death|funeral|mourning|never see .* again)\b/i, /chale gaye|mar gaye|shok/i],
    weight: 0.95
  },
  loneliness: {
    patterns: [/\b(lonely|alone|nobody cares|no one to talk to|isolated|abandoned)\b/i, /akela|ekaki|nisongo/i],
    weight: 0.85
  },
  disappointment: {
    patterns: [/\b(disappointed|let down|expected more|didn't work out|wasted|failed me|failed|mess up)\b/i, /nirash|ashahoto/i],
    weight: 0.8
  },
  helplessness: {
    patterns: [/\b(helpless|powerless|nothing I can do|stuck|lost control|trapped)\b/i, /bebas|lachar|upay nei/i],
    weight: 0.85
  },
  anxiety: {
    patterns: [/\b(anxious|nervous|dread|scared of what will happen|panic|panicking|jittery|shaking)\b/i, /ghabrahant|chinta|tension|darr lag raha/i],
    weight: 0.85
  },
  fear: {
    patterns: [/\b(fear|terrified|scared|afraid|frightened|spooked)\b/i, /darr|bhoe/i],
    weight: 0.85
  },
  stress: {
    patterns: [/\b(stress|stressed|pressure|too much work|burnout|exhausted|frazzled|deadline)\b/i, /dabav|chinta|haanp gaya/i],
    weight: 0.8
  },
  overwhelm: {
    patterns: [/\b(overwhelmed|too much to handle|can't keep up|drowning in|breaking point)\b/i, /bohot jyada|aar parchi na|sambhal nahi raha/i],
    weight: 0.85
  },
  frustration: {
    patterns: [/\b(frustrated|annoyed|irritated|fed up|sick of|why won't|keeps failing)\b/i, /tang aa gaya|dimag kharab|chidh/i],
    weight: 0.85
  },
  anger: {
    patterns: [/\b(angry|furious|mad|rage|hate this|pissed|unacceptable)\b/i, /gussa|krodh|raag/i],
    weight: 0.85
  },
  resentment: {
    patterns: [/\b(unfair|always me|never appreciated|they took credit|grudge|after all I did)\b/i, /khunnas|na insafi/i],
    weight: 0.75
  },
  guilt: {
    patterns: [/\b(my fault|I shouldn't have|I messed up|I hurt them|feel guilty|regret)\b/i, /meri galti|pashchatap|anutap/i],
    weight: 0.8
  },
  shame: {
    patterns: [/\b(worthless|useless|hate myself|disgusting person|pathetic|embarrassed of who I am)\b/i, /sharm|sharminda|lajjito/i],
    weight: 0.85
  },
  embarrassment: {
    patterns: [/\b(embarrassed|humiliated|fool of myself|awkward|cringe|wished ground swallowed)\b/i, /ajeeb laga|sharmindagi/i],
    weight: 0.75
  },
  confusion: {
    patterns: [/\b(confused|don't understand|makes no sense|mixed signals|puzzled|what is happening)\b/i, /samajh nahi aa raha|bujhte parchi na/i],
    weight: 0.75
  },
  uncertainty: {
    patterns: [/\b(not sure|uncertain|indecisive|don't know which way|torn|hesitant)\b/i, /dविधा|sandeh/i],
    weight: 0.7
  },
  jealousy: {
    patterns: [/\b(jealous|they might take|threatened by|possessive|afraid to lose them to)\b/i, /jalan|irshya/i],
    weight: 0.75
  },
  envy: {
    patterns: [/\b(wish I had their|must be nice for them|why them and not me|they have everything)\b/i, /hasad|jalan/i],
    weight: 0.75
  },
  hope: {
    patterns: [/\b(hope|hoping|fingers crossed|maybe things will improve|optimistic|praying for)\b/i, /umeed|aasha/i],
    weight: 0.75
  },
  calmness: {
    patterns: [/\b(calm|peaceful|relaxed|at ease|quiet mind|content)\b/i, /shant|sukoon/i],
    weight: 0.7
  },
  boredom: {
    patterns: [/\b(bored|nothing to do|dull|monotonous|uninspired)\b/i, /bore ho raha|mon bhalo nei/i],
    weight: 0.7
  }
};

// 2. Cognitive Distortion / Reframing Patterns (to identify and gently bridge, never label)
const COGNITIVE_PATTERNS = {
  catastrophizing: {
    test: /\b(everything is ruined|my life is over|worst thing possible|doomed|never recover)\b/i,
    reframeCue: 'Check if jumping to the worst possible outcome; offer grounded perspective.'
  },
  allOrNothing: {
    test: /\b(always|never|every single time|everyone|nobody|total failure|completely useless)\b/i,
    reframeCue: 'Examine extreme binary terms; explore grey areas and exceptions.'
  },
  mindReading: {
    test: /\b((they|she|he|everyone)\s+(hates?|dislikes?|judges?)\s+me|thinks?\s+I'm\s+(stupid|bad|useless|worthless)|I know (they|she|he)\s+(hate|dislike))\b/i,
    reframeCue: 'Differentiate between perceived intent and confirmed facts; gently explore alternative reasons.'
  },
  emotionalReasoning: {
    test: /\b(I feel like a failure so I am|it feels hopeless so it is|I feel terrified so it must be dangerous)\b/i,
    reframeCue: 'Validate the emotional intensity while gently decoupling feelings from factual realities.'
  },
  shamePersonalization: {
    test: /\b(I'm useless|I'm broken|it's all because of me|I ruin everything|I am the problem)\b/i,
    reframeCue: 'Distinguish the event from self-worth; de-escalate self-condemnation into compassion.'
  }
};

// 3. Crisis & Safety Flags
const CRISIS_PATTERNS = [
  /\b(want to die|kill myself|suicide|end my life|better off dead|don't want to live|no reason to live)\b/i,
  /\b(self[-\s]?harm|cutting myself|hurt myself|bleed out|take all the pills)\b/i,
  /\b(goodbye forever|can't go on anymore|ending it all tonight)\b/i
];

class PsychologicalIntelligenceLayer {
  constructor() {
    this.interactionHistory = [];
    this.userPreferences = {
      pacingPreference: 'adaptive', // concise, conversational, reflective
      communicationStyle: 'warm-direct',
      establishedNeeds: []
    };
  }

  /**
   * Evaluates text, vocal acoustics, and conversational context into a structured
   * psychological reasoning assessment.
   * 
   * @param {string} userText 
   * @param {Object} audioFeatures { speakingRateWPM, silenceRatio, rms, pauseFrequencyPerMin, jitter }
   * @param {Object} context { history, lang, sessionGoal }
   */
  assess(userText = '', audioFeatures = {}, context = {}) {
    const text = (userText || '').trim();
    const lower = text.toLowerCase();

    // STEP 1: Safety & Crisis Assessment (Highest Priority)
    const isCrisis = CRISIS_PATTERNS.some(pat => pat.test(lower));
    if (isCrisis) {
      return {
        observation: 'User expressed severe hopelessness, ideation, or intention of self-harm/suicide.',
        interpretation: 'Immediate crisis situation requiring non-judgmental containment and emergency safety direction.',
        confidence: 'HIGH',
        intensity: 10,
        emotions: [{ emotion: 'grief', intensity: 9 }, { emotion: 'helplessness', intensity: 10 }, { emotion: 'overwhelm', intensity: 10 }],
        conversationalGoal: 'safety-containment',
        guidance: 'Prioritize human life. Remain calm, warm, direct. Avoid clinical jargon, guilt, or debate. Encourage immediate real-world help/hotline.',
        recommendedPacing: 'slow-grounded',
        isCrisis: true
      };
    }

    // STEP 2: Multi-Emotion Identification & Co-occurrence
    const detectedEmotions = [];
    let highConfidenceExplicit = false;

    // Direct self-reporting yields HIGH confidence
    const explicitMatch = lower.match(/\b(i am|i feel|i'm feeling|i'm so)\s+(angry|furious|sad|anxious|nervous|happy|scared|depressed|lonely|exhausted|guilty)\b/i);
    if (explicitMatch) {
      highConfidenceExplicit = true;
    }

    for (const [emotion, config] of Object.entries(EMOTION_PROFILES)) {
      let matchedCount = 0;
      for (const pattern of config.patterns) {
        if (pattern.test(lower)) {
          matchedCount++;
        }
      }
      if (matchedCount > 0) {
        // Base score
        let score = Math.min(10, Math.round(matchedCount * 3.5 + (config.weight * 2)));
        detectedEmotions.push({
          emotion,
          score,
          weight: config.weight
        });
      }
    }

    // STEP 3: Vocal / Acoustic Behavioral Evidence
    const acousticSignals = [];
    const {
      speakingRateWPM = 120,
      silenceRatio = 0.15,
      pauseFrequencyPerMin = 4,
      rms = 20
    } = audioFeatures;

    let acousticDistressModifier = 0;

    if (speakingRateWPM > 175) {
      acousticSignals.push('Fast, pressurized speech rate');
      acousticDistressModifier += 1;
    } else if (speakingRateWPM > 0 && speakingRateWPM < 85 && silenceRatio > 0.28) {
      acousticSignals.push('Slow cadence with prolonged hesitations and silences');
      acousticDistressModifier += 1.5;
    }

    if (pauseFrequencyPerMin > 8) {
      acousticSignals.push('High frequency of mid-sentence pauses or stutter');
      acousticDistressModifier += 1;
    }

    if (rms > 45) {
      acousticSignals.push('High vocal intensity/loudness');
    } else if (rms > 0 && rms < 8) {
      acousticSignals.push('Low vocal volume / whispered tone');
    }

    // STEP 4: Estimate Emotional Intensity (0 to 10 scale)
    let maxEmotionScore = detectedEmotions.length > 0
      ? Math.max(...detectedEmotions.map(e => e.score))
      : 1;

    let finalIntensity = Math.min(10, Math.max(0, Math.round(maxEmotionScore + (acousticSignals.length > 0 ? 1 : 0))));
    if (detectedEmotions.length === 0 && acousticSignals.length === 0) {
      finalIntensity = 0; // Emotionally neutral
    }

    // STEP 5: Confidence Level Determination (Observation vs Interpretation vs Hypothesis)
    let confidenceLevel = 'LOW';
    if (highConfidenceExplicit) {
      confidenceLevel = 'HIGH';
    } else if (detectedEmotions.length > 0 && (lower.length > 25 || detectedEmotions.length >= 2)) {
      confidenceLevel = 'MODERATE';
    } else if (acousticSignals.length > 0 || detectedEmotions.length === 1) {
      confidenceLevel = 'LOW';
    }

    // STEP 6: Infer Conversational Need / Goal
    let conversationalGoal = 'normal-conversation';
    if (finalIntensity >= 7) {
      if (lower.includes('why') || lower.includes('should i') || lower.includes('how do i')) {
        conversationalGoal = 'support-then-problem-solve';
      } else {
        conversationalGoal = 'vent-and-containment';
      }
    } else if (lower.includes('what should i do') || lower.includes('help me choose') || lower.includes('decide')) {
      conversationalGoal = 'decision-support-and-brainstorm';
    } else if (lower.includes('listen') || lower.includes('just want to say') || lower.includes('can i vent')) {
      conversationalGoal = 'pure-active-listening';
    } else if (lower.includes('what is') || lower.includes('how to') || lower.includes('tell me about')) {
      conversationalGoal = 'factual-information';
    } else if (detectedEmotions.some(e => e.emotion === 'sadness' || e.emotion === 'grief' || e.emotion === 'loneliness')) {
      conversationalGoal = 'warm-presence-and-empathy';
    } else if (detectedEmotions.some(e => e.emotion === 'happiness' || e.emotion === 'excitement' || e.emotion === 'pride')) {
      conversationalGoal = 'shared-celebration';
    }

    // STEP 7: Cognitive Bias / Distortion Exploration
    const cognitiveAlerts = [];
    for (const [patternKey, patternData] of Object.entries(COGNITIVE_PATTERNS)) {
      if (patternData.test.test(lower)) {
        cognitiveAlerts.push({
          type: patternKey,
          guidance: patternData.reframeCue
        });
      }
    }

    // STEP 8: Construct Probabilistic Reasoning Blueprint for the Voice AI
    const primaryEmotionsList = detectedEmotions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(e => e.emotion);

    let pacing = 'adaptive';
    if (finalIntensity >= 7) pacing = 'slow-validating-concise';
    else if (finalIntensity <= 2) pacing = 'natural-conversational';

    const reasoningSummary = {
      observedText: text,
      acousticSignals,
      plausibleEmotions: primaryEmotionsList.length > 0 ? primaryEmotionsList : ['neutral / conversational'],
      intensityScale: `${finalIntensity}/10`,
      intensityCategory: finalIntensity >= 9 ? 'extreme' : finalIntensity >= 7 ? 'strong' : finalIntensity >= 5 ? 'moderate' : finalIntensity >= 3 ? 'mild' : finalIntensity >= 1 ? 'very mild' : 'neutral',
      confidenceLevel,
      conversationalGoal,
      pacing,
      cognitiveAlerts,
      isCrisis: false
    };

    return reasoningSummary;
  }

  /**
   * Generates tailored psychological guidance to inject into dynamic system instructions.
   */
  generateLiveDirective(assessment) {
    if (assessment.isCrisis) {
      return `CRITICAL SAFETY OVERRIDE:
- User is experiencing severe acute distress / self-harm / crisis.
- Prioritize human life, calmness, and immediate real-world safety support.
- Direct them warmly to emergency resources (e.g. Tele-MANAS 14416 / 988 / trusted family member).
- Keep voice tone calm, gentle, steady, and grounded. Never debate or judge.`;
    }

    let directives = [];

    // 1. Uncertainty Principle
    if (assessment.confidenceLevel === 'LOW') {
      directives.push(`PSYCHOLOGICAL POSTURE (Low Confidence):
- Treat user state as a tentative hypothesis, NEVER a diagnosed fact.
- Do NOT say "You sound anxious/sad." Instead ask gently: "You seem a little quiet right now — is something on your mind?"
- Give the user autonomy to define their own internal experience.`);
    } else if (assessment.confidenceLevel === 'MODERATE') {
      directives.push(`PSYCHOLOGICAL POSTURE (Moderate Confidence):
- Acknowledge emotional tone without boxing the user into a rigid label.
- Plausible co-occurring states: ${assessment.plausibleEmotions.join(', ')}.
- Validate feelings before addressing logistics.`);
    } else {
      directives.push(`PSYCHOLOGICAL POSTURE (High Confidence):
- User explicitly identified their state (${assessment.plausibleEmotions.join(', ')}).
- Validate the emotional impact directly with warmth and zero hollow clichés.`);
    }

    // 2. Intensity & Pacing Adaptation
    if (assessment.intensityCategory === 'strong' || assessment.intensityCategory === 'extreme') {
      directives.push(`PACING & INTENSITY (Score: ${assessment.intensityScale}):
- Slow down conversational speed. Keep spoken responses to 1-2 clear, soothing sentences.
- Avoid overwhelming the user with advice, lectures, or lengthy multi-step solutions.
- Focus on containment, presence, and simple comfort first.`);
    } else if (assessment.intensityCategory === 'moderate') {
      directives.push(`PACING & INTENSITY (Score: ${assessment.intensityScale}):
- Be attentive and present. Offer 1-3 warm, conversational sentences.
- Inquire gently about their need: listening vs. brainstorming.`);
    }

    // 3. Goal-Specific Empathy
    if (assessment.conversationalGoal === 'pure-active-listening' || assessment.conversationalGoal === 'vent-and-containment') {
      directives.push(`CONVERSATIONAL GOAL (Venting / Listening):
- The user needs an empathetic listener, NOT an immediate fix.
- Do NOT jump into advice. Validate the emotional weight first.`);
    } else if (assessment.conversationalGoal === 'shared-celebration') {
      directives.push(`CONVERSATIONAL GOAL (Celebration):
- Share sincere joy and pride without exaggerated fake cheerfulness.
- Savor the moment together.`);
    }

    // 4. Cognitive Reframing Safeguards (gentle, non-patronizing)
    if (assessment.cognitiveAlerts && assessment.cognitiveAlerts.length > 0) {
      const topAlert = assessment.cognitiveAlerts[0];
      directives.push(`COGNITIVE SENSITIVITY:
- Detected pattern: ${topAlert.type}.
- Rule: NEVER diagnose or say "you have a cognitive distortion".
- Approach: ${topAlert.guidance}`);
    }

    return directives.join('\n\n');
  }
}

module.exports = {
  PsychologicalIntelligenceLayer,
  EMOTIONS_CATALOG,
  COGNITIVE_PATTERNS
};
