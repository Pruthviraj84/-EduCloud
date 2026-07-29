import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates Multiple Choice Questions (MCQs) using Google Gemini API.
 * Rules:
 * - Uses only process.env.GEMINI_API_KEY.
 * - Questions based ONLY on provided study material.
 * - Validates JSON output strictly.
 * - Retries automatically on malformed response.
 */
export const generateGeminiQuestions = async ({
  textContent,
  count = 5,
  subjectName = 'General',
  difficulty = 'Medium'
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey === 'mock-gemini-key') {
    throw new Error('Valid Google Gemini API Key (GEMINI_API_KEY) is required in server environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try gemini-1.5-flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  const prompt = `Generate exactly ${count} multiple-choice questions from the study material.

Requirements:
* Questions must be based ONLY on the provided study material.
* Do not invent facts.
* Cover different concepts.
* Avoid duplicate questions.
* Difficulty should follow: ${difficulty}.
* Return valid JSON only.
* No markdown.
* No explanation outside JSON.
* No code fences.

Required JSON format:
{
  "questions": [
    {
      "question": "Question stem text here?",
      "options": [
        "First option text",
        "Second option text",
        "Third option text",
        "Fourth option text"
      ],
      "correctAnswer": 0,
      "difficulty": "${difficulty}",
      "marks": 1,
      "explanation": "Detailed explanation of why this option is correct."
    }
  ]
}

Subject: ${subjectName}

Study Material Content:
${textContent.slice(0, 20000)}
`;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`[Gemini Request] Sending question generation request to Google Gemini API (Attempt ${attempts})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let rawText = response.text();

      console.log(`[Gemini Response] Raw response received. Parsing JSON...`);

      // Clean markdown code fences if present
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(rawText);

      if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Gemini API returned invalid or empty questions array');
      }

      const keysMap = ['A', 'B', 'C', 'D'];

      // Perform strict Question Generation Validation
      const validatedQuestions = parsed.questions.map((q, idx) => {
        const questionText = q.question || q.questionText;
        if (!questionText || typeof questionText !== 'string' || questionText.trim().length === 0) {
          throw new Error(`Validation Error: Question text missing at index ${idx}`);
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Validation Error: Exactly 4 options required at index ${idx}`);
        }

        let answerIndex = -1;
        if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3) {
          answerIndex = q.correctAnswer;
        } else if (typeof q.correctAnswer === 'string') {
          const upperAns = q.correctAnswer.trim().toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(upperAns)) {
            answerIndex = keysMap.indexOf(upperAns);
          } else if (['0', '1', '2', '3'].includes(upperAns)) {
            answerIndex = parseInt(upperAns, 10);
          }
        }

        if (answerIndex === -1) {
          throw new Error(`Validation Error: Correct answer index (0-3 or A-D) invalid at index ${idx}`);
        }

        const formattedOptions = q.options.map((opt, oIdx) => {
          const textVal = typeof opt === 'object' && opt !== null ? (opt.text || opt.value || '') : String(opt);
          if (!textVal.trim()) {
            throw new Error(`Validation Error: Empty option text at question index ${idx}, option ${oIdx}`);
          }
          return {
            key: keysMap[oIdx],
            text: textVal.trim()
          };
        });

        const qDifficulty = ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : difficulty;
        const qExplanation = q.explanation && typeof q.explanation === 'string' ? q.explanation.trim() : 'Based on provided study material.';
        const qMarks = typeof q.marks === 'number' && q.marks > 0 ? q.marks : 1;

        return {
          questionText: questionText.trim(),
          question: questionText.trim(),
          options: formattedOptions,
          correctAnswer: keysMap[answerIndex],
          correctAnswerIndex: answerIndex,
          difficulty: qDifficulty,
          explanation: qExplanation,
          marks: qMarks,
          source: 'AI'
        };
      });

      console.log(`[Questions Parsed & Validated] Successfully validated ${validatedQuestions.length} questions.`);
      return validatedQuestions;
    } catch (err) {
      console.error(`[Gemini Service Error] Attempt ${attempts} failed:`, err.message);
      if (attempts >= maxAttempts) {
        throw new Error(`Gemini API Question Generation Failed after ${maxAttempts} attempts: ${err.message}`);
      }
    }
  }
};
