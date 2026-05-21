import { CodeStory, LineExplanation } from '../types';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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';

export async function generateStory(code: string, language: string): Promise<CodeStory> {
  const systemPrompt = `You are a master programmer and a world-class fantasy/sci-fi storyteller. Your job is to translate a piece of code into an epic, educational adventure story that maps characters to code variables/functions, and execution steps to chapters (levels).
  
You must output a single, valid JSON object matching the schema below. Do not wrap it in anything else, and ensure it can be parsed by JSON.parse.

JSON Schema:
{
  "title": "An epic, short title for the story matching the theme",
  "setting": "Detailed setting description (e.g. 'The Cyberpunk Neon Grid of NodeCity' or 'The Ancient Elven Archive of Recursion')",
  "characters": [
    {
      "name": "Character Name",
      "role": "Their role in the narrative",
      "codeEquivalent": "The specific variable name, function, array, index, or operator in the code (e.g. 'arr', 'len', 'swapped', 'temp')",
      "description": "How their character behavior matches the programming concept"
    }
  ],
  "chapters": [
    {
      "title": "Level X: Chapter Title",
      "narrative": "A paragraph of storytelling showing the characters carrying out actions that match the execution flow of the code lines.",
      "codeSnippet": "The exact lines of code related to this level",
      "explanation": "A direct educational explanation mapping the story elements back to the technical code mechanics.",
      "analogy": "A clear, real-world non-programming analogy explaining this level's logic (e.g. 'It is like swapping potions in boxes: you need a temporary shelf to place potion A while you transfer B to A, then move A from the shelf.')",
      "lineBreakdown": [
        {
          "line": "A single line or block of code from the codeSnippet",
          "meaning": "Plain English breakdown of exactly what this line does and why it is necessary."
        }
      ],
      "challenge": {
        "question": "A multiple-choice question testing the user's understanding of either this level's story logic or this level's code snippet",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": 0,
        "explanation": "Detailed explanation of why this answer is correct."
      }
    }
  ]
}

Requirements:
1. Make sure all characters map to actual things in the code.
2. The chapter sequence MUST mirror the actual execution order of the code.
3. You MUST create exactly 5 chapters (levels) breaking down the execution steps. Each chapter represents a distinct level (e.g., Level 1: Gathering/Setup, Level 2: Preparation, Level 3: Core Loop, Level 4: Verification, Level 5: Output/Success) and must have its own 'challenge' object.
4. For each chapter, provide a highly detailed 'analogy' and 'lineBreakdown' array.
5. Keep the JSON well-formatted. Avoid trailing commas and raw backticks in JSON strings. Escape double quotes inside strings if necessary.`;

  const userPrompt = `Generate an epic story for the following code. Ensure there are exactly 5 levels (chapters) in the chapters array, with detailed analogies and lineBreakdowns.
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`;`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://super-code-learner.vercel.app',
        'X-OpenRouter-Title': 'Super Code Learner'
      },
      body: JSON.stringify({
        model: 'liquid/lfm-2.5-1.2b-thinking:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract thoughts and clean JSON response
    return parseAIResponse(content, code, language);
  } catch (error: unknown) {
    console.error('Error generating story, using smart fallback:', error);
    return generateSmartFallbackStory(code, language, error instanceof Error ? error.message : 'Fetch error');
  }
}

function parseAIResponse(content: string, code: string, language: string): CodeStory {
  let rawThinking = '';
  let cleanContent = content;

  // Extract <thought>...</thought> blocks if present
  const thoughtMatch = cleanContent.match(/<thought>([\s\S]*?)<\/thought>/);
  if (thoughtMatch) {
    rawThinking = thoughtMatch[1].trim();
    cleanContent = cleanContent.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();
  }

  // Remove markdown code fence wraps if present (e.g. ```json ... ```)
  if (cleanContent.includes('```')) {
    const jsonMatch = cleanContent.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonMatch) {
      cleanContent = jsonMatch[1].trim();
    }
  }

  // Try to find the first '{' and last '}' if there is surrounding text
  const firstBrace = cleanContent.indexOf('{');
  const lastBrace = cleanContent.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanContent = cleanContent.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleanContent) as CodeStory;
    
    // Ensure it has exactly 5 chapters, otherwise fallback
    if (!parsed.chapters || parsed.chapters.length < 5) {
      console.warn('AI returned fewer than 5 chapters, triggering smart fallback.');
      return generateSmartFallbackStory(code, language, "AI generated insufficient chapters.");
    }
    
    parsed.rawThinking = rawThinking || parsed.rawThinking;
    return parsed;
  } catch (parseError) {
    console.error('JSON parsing failed. Triggering smart fallback. Raw content was:', cleanContent);
    return generateSmartFallbackStory(code, language, cleanContent);
  }
}

function generateSmartFallbackStory(code: string, language: string, rawContent?: string): CodeStory {
  // Extract variable names from code using regex patterns
  const varRegex = /(?:let|const|var|def|function)\s+([a-zA-Z0-9_]+)/g;
  const variables: string[] = [];
  let match;
  while ((match = varRegex.exec(code)) !== null && variables.length < 5) {
    if (!variables.includes(match[1]) && match[1] !== 'function') {
      variables.push(match[1]);
    }
  }
  
  // Fillers to guarantee exactly 5 characters
  while (variables.length < 5) {
    const fillers = ["runes", "spellState", "outputTracker", "logicGate", "resultCrystal"];
    const nextFiller = fillers.find(f => !variables.includes(f)) || `tempVar${variables.length}`;
    variables.push(nextFiller);
  }

  const characters = variables.map((v, i) => {
    const roles = [
      "Guardian of Setup",
      "Preparation Alchemist",
      "Core Logic Spellweaver",
      "Conditional Inquisitor",
      "Keeper of Results"
    ];
    const descriptions = [
      "Initializes memory pools and verifies boundary parameters.",
      "Transforms raw inputs into refined alchemical reagents.",
      "Iterates through loops, evaluating logic paths.",
      "Inspects intermediate logic states for conditional correctness.",
      "Validates output runes and returns the final value to the caller."
    ];
    return {
      name: v.charAt(0).toUpperCase() + v.slice(1),
      role: roles[i] || "Logic Companion",
      codeEquivalent: v,
      description: descriptions[i] || "Assists in transmuting variables during the runtime process."
    };
  });

  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const totalLines = lines.length;
  const size = Math.max(1, Math.ceil(totalLines / 5));

  const snippet1 = lines.slice(0, size).join('\n') || '// Setup runes';
  const snippet2 = lines.slice(size, size * 2).join('\n') || '// Preparation variables';
  const snippet3 = lines.slice(size * 2, size * 3).join('\n') || '// Core loop execution';
  const snippet4 = lines.slice(size * 3, size * 4).join('\n') || '// Conditional verification';
  const snippet5 = lines.slice(size * 4).join('\n') || '// Return outputs';

  const makeBreakdown = (snippet: string): LineExplanation[] => {
    return snippet.split('\n').map(line => {
      let meaning = "Executes active logic steps and advances compiler stack pointers.";
      if (line.includes('let') || line.includes('const') || line.includes('var') || line.includes('=')) {
        meaning = "Declares or mutates a slot in memory, storing values for execution steps.";
      }
      if (line.includes('for') || line.includes('while')) {
        meaning = "Sets up a loop iteration path, instructing the machine to run commands cyclically.";
      }
      if (line.includes('if')) {
        meaning = "Sets up a logical gate. The enclosed block will run only if this condition evaluates to true.";
      }
      if (line.includes('return')) {
        meaning = "Concludes the spell, outputting the finalized value to the calling program.";
      }
      return { line, meaning };
    });
  };

  return {
    title: `The Odyssey of ${language.toUpperCase()} logic`,
    setting: "An ancient mechanical vault inside compiler memory, where algorithms are active lifeforms.",
    characters,
    chapters: [
      {
        title: "Level 1: Summoning & Setup",
        narrative: `A new quest begins! The instructions initialize. We summon ${characters[0].name} to watch over variables and secure the initial boundary parameters.`,
        codeSnippet: snippet1,
        explanation: "This initial part of the code reserves memory registers, sets parameters, and declares starting tracking values.",
        analogy: "It is like registering participants at the start of a guild tourney: you record their starting health points and items on a roster before they enter the arena.",
        lineBreakdown: makeBreakdown(snippet1),
        challenge: {
          question: `Which variable serves as the primary setup state tracker or boundary parameter here?`,
          options: [
            characters[0].codeEquivalent,
            "A temporary browser cache",
            "An inactive loop iterator",
            "The memory garbage collector"
          ],
          answerIndex: 0,
          explanation: "Variable initialization reserves memory space and defines starting values before any loops or calculations run."
        }
      },
      {
        title: "Level 2: Boundary Preparation",
        narrative: `With boundaries secure, ${characters[1].name} prepares the parameters and refines secondary inputs for core execution loops.`,
        codeSnippet: snippet2,
        explanation: "This section sets up helper variables or formats raw datatypes before computational logic loops occur.",
        analogy: "It is like a chef lining up ingredients, measuring bowls, and cutting boards before turning on the stove.",
        lineBreakdown: makeBreakdown(snippet2),
        challenge: {
          question: "Why do we perform secondary variable setup at this level?",
          options: [
            "To simplify computations inside the upcoming loop logic",
            "To reset all hardware registers",
            "To query an external database server",
            "To bypass syntax compiling steps"
          ],
          answerIndex: 0,
          explanation: "Structuring inputs first allows loops to operate cleanly and improves algorithmic efficiency."
        }
      },
      {
        title: "Level 3: The Core Loop Spell",
        narrative: `The setup holds. ${characters[2].name} takes center stage, iterating through loops and advancing computational cycles.`,
        codeSnippet: snippet3,
        explanation: "This section contains the core loop structures or iterative arithmetic transformations of the function.",
        analogy: "It is like a wheel spinning in a mill: each turn grinds one grain until there is no grain left in the hopper.",
        lineBreakdown: makeBreakdown(snippet3),
        challenge: {
          question: "What is the primary mechanical operation happening during this level?",
          options: [
            "Conditions are checked and data iterates through loops to update values",
            "All registers are cleared to zero",
            "The program waits for external inputs from the server",
            "The system compiles raw machine bytes directly"
          ],
          answerIndex: 0,
          explanation: "The core loop updates states continuously over multiple steps until conditional boundaries are reached."
        }
      },
      {
        title: "Level 4: Condition Verification",
        narrative: `As cycles finish, ${characters[3].name} queries intermediate outputs and inspects logic states for correctness.`,
        codeSnippet: snippet4,
        explanation: "This section checks conditional flags or runs check-gates on the iterated values.",
        analogy: "It is like a quality control inspector verifying that every package off the assembly line meets safety standards.",
        lineBreakdown: makeBreakdown(snippet4),
        challenge: {
          question: "What is the function of the conditional check-gates evaluated at this level?",
          options: [
            "To confirm output correctness and decide whether to break loops or raise flags",
            "To erase database structures",
            "To restart the physical CPU scheduler",
            "To download updates from the web portal"
          ],
          answerIndex: 0,
          explanation: "Checking state conditions ensures that only valid computational states transition to the output phase."
        }
      },
      {
        title: "Level 5: Output Harmonization",
        narrative: `The boundaries and checks pass. ${characters[4].name} gathers the finalized alchemical values and safely returns them to the caller.`,
        codeSnippet: snippet5,
        explanation: "This final section resolves execution, clears references, and returns or prints the final computed result.",
        analogy: "It is like sealing the treasure chest and handing it back to the guild master to declare the quest complete.",
        lineBreakdown: makeBreakdown(snippet5),
        challenge: {
          question: "What is the final state of the algorithm at this level?",
          options: [
            "The computed value is returned or printed, concluding the quest",
            "The compiler crashes into memory overflow",
            "A loop resets execution to Level 1",
            "All variable values are destroyed without return"
          ],
          answerIndex: 0,
          explanation: "Returning values provides the resulting computed data to calling applications, completing the function lifecycle."
        }
      }
    ],
    rawThinking: rawContent || "Transmuted via fallback learning compiler."
  };
}
