import openai from '../config/openai.js';

export const generateAIQuestions = async ({ textContent, count = 5, subjectName = 'General', difficultyDistribution = 'balanced' }) => {
  try {
    const prompt = `You are an expert academic test generator.
Based on the following study text material, generate exactly ${count} multiple choice questions.

Subject: ${subjectName}
Difficulty Strategy: ${difficultyDistribution}

STRICT OUTPUT REQUIREMENT:
Return ONLY a JSON object matching this schema:
{
  "questions": [
    {
      "questionText": "Clear question stem",
      "options": [
        { "key": "A", "text": "Option A text" },
        { "key": "B", "text": "Option B text" },
        { "key": "C", "text": "Option C text" },
        { "key": "D", "text": "Option D text" }
      ],
      "correctAnswer": "A", // MUST BE ONE OF "A", "B", "C", "D"
      "explanation": "Detailed step-by-step explanation for why this is correct",
      "marks": 1,
      "difficulty": "Medium", // "Easy", "Medium", or "Hard"
      "source": "AI"
    }
  ]
}

Study Material:
${textContent.slice(0, 12000)}
`;

    // Check if API key is real or placeholder
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key') || process.env.OPENAI_API_KEY.includes('mock-key')) {
      console.log('[AI Service] Mock Mode Activated (No valid OpenAI key provided)');
      return getMockQuestions(count);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: 'You are an AI subject matter expert that outputs strictly structured test JSON.'
        },
        { role: 'user', content: prompt }
      ]
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (error) {
    console.error('OpenAI Generation Error:', error.message);
    // Graceful fallback to deterministic mock questions if OpenAI fails
    return getMockQuestions(count);
  }
};

function getMockQuestions(count = 5) {
  const samplePool = [
    {
      questionText: 'What is the main function of the Operating System kernel?',
      options: [
        { key: 'A', text: 'Managing hardware resources and system memory' },
        { key: 'B', text: 'Designing user interfaces for applications' },
        { key: 'C', text: 'Compiling high-level programming code' },
        { key: 'D', text: 'Routing network packets over HTTP' }
      ],
      correctAnswer: 'A',
      explanation: 'The kernel is the core component of an OS that manages hardware resources, CPU scheduling, and memory allocation.',
      marks: 2,
      difficulty: 'Easy',
      source: 'AI'
    },
    {
      questionText: 'Which time complexity characterizes binary search on a sorted array of size N?',
      options: [
        { key: 'A', text: 'O(N)' },
        { key: 'B', text: 'O(N log N)' },
        { key: 'C', text: 'O(log N)' },
        { key: 'D', text: 'O(1)' }
      ],
      correctAnswer: 'C',
      explanation: 'Binary search continuously divides the search interval in half, resulting in logarithmic time complexity O(log N).',
      marks: 2,
      difficulty: 'Medium',
      source: 'AI'
    },
    {
      questionText: 'In relational database design, what does Third Normal Form (3NF) eliminate?',
      options: [
        { key: 'A', text: 'Multivalued dependencies' },
        { key: 'B', text: 'Transitive dependencies' },
        { key: 'C', text: 'Partial functional dependencies' },
        { key: 'D', text: 'Duplicate rows only' }
      ],
      correctAnswer: 'B',
      explanation: '3NF requires that a relation is in 2NF and has no transitive dependencies for non-prime attributes.',
      marks: 3,
      difficulty: 'Hard',
      source: 'AI'
    },
    {
      questionText: 'Which HTTP status code indicates a successful creation of a resource?',
      options: [
        { key: 'A', text: '200 OK' },
        { key: 'B', text: '201 Created' },
        { key: 'C', text: '204 No Content' },
        { key: 'D', text: '302 Found' }
      ],
      correctAnswer: 'B',
      explanation: '201 Created signifies that the request succeeded and resulted in a new resource being created.',
      marks: 1,
      difficulty: 'Easy',
      source: 'AI'
    },
    {
      questionText: 'What is the primary advantage of indexing a database column?',
      options: [
        { key: 'A', text: 'Reduces disk space usage' },
        { key: 'B', text: 'Speeds up SELECT data retrieval queries' },
        { key: 'C', text: 'Speeds up INSERT and UPDATE statements' },
        { key: 'D', text: 'Prevents database corruption' }
      ],
      correctAnswer: 'B',
      explanation: 'Indexes optimize read efficiency at the trade-off of slightly slower writes and extra storage space.',
      marks: 2,
      difficulty: 'Medium',
      source: 'AI'
    }
  ];

  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(samplePool[i % samplePool.length]);
  }
  return results;
}
