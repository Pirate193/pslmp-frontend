"use server";

import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";

import { z } from "zod";

// Updated Schema to support FRQ
const quizSchema = z.object({
  question: z.string(),
  // Added 'frq' to the enum
  type: z.enum(["single", "multiple", "frq"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  // Options can be empty for FRQ
  options: z.array(z.string()).optional().describe("Array of choices for single/multiple. one correct answer for FRQ."),
  // For FRQ, this contains the "Model Answer"
  correctAnswers: z.array(z.string()),
  explanation: z.string().describe("A structured explanation. First, explain why the correct answer is right. Then, explicitly list why EACH incorrect option is wrong."),
});

const quizListSchema = z.object({
  quizzes: z.array(quizSchema).min(1),
});

export async function generateQuizzesAction(
  topic: string,
  numQuestions: number,
  noteContent: string = ""
) {
  const systemContext = `You are an expert tutor creating study materials.
    TASK: Generate exactly ${numQuestions} distinct practice problems .user's prompt "${topic}"
    CONTEXT: Use the following notes as the primary source of truth. If the notes do not fully cover the topic, you may use your general knowledge to supplement it, but prioritize the user's specific notes.
    
    USER NOTES:
    "${noteContent}"`;

  let promptText = `${systemContext}`;
  // Updated Rules with strict type following
  promptText += `
    
    ## QUESTION TYPE INSTRUCTIONS (CRITICAL - FOLLOW EXACTLY):if in users prompt "frq" is mentioned then generate only "frq" questions. if in users prompt "single" is mentioned then generate only "single" questions. if in users prompt "multiple" is mentioned then generate only "multiple" questions. if in users prompt doesn't mention any type then generate a mix of "single", "multiple", and "frq" types for variety.
    
    
    ## GENERAL RULES:
    1. **NEVER leave correctAnswers empty** - Every question MUST have at least one correct answer.
    2. For "frq" questions:
       - Set \`options\` to an empty array []
       - Put the model answer in \`correctAnswers\` (REQUIRED - never leave empty)
       - The correctAnswers should contain a clear, complete answer
    3. For "single" questions:
       - Provide 4 options in the \`options\` array
       - Put exactly ONE correct answer in \`correctAnswers\`
    4. For "multiple" questions:
       - Provide 4 options in the \`options\` array
       - Put ALL correct answers (2 or more) in \`correctAnswers\`
    
    ## ANSWER VALIDATION:
    - ❌ INVALID: \`correctAnswers: []\` - This will break the quiz!
    - ✅ VALID: \`correctAnswers: ["The mitochondria is the powerhouse of the cell"]\`
    
    ## EXPLANATION FORMATTING:
    For Multiple Choice and Single Choice questions, the 'explanation' field MUST follow this exact structure:
    
    "✅ Correct: [Explain why the right answer is correct].
    
    ❌ Option [X]: [Explain why this specific distractor is wrong].
    ❌ Option [Y]: [Explain why this specific distractor is wrong]."
    
    For FRQ questions, explain why the model answer is correct and what key points it covers.
    
    Use newlines to make it readable. Do not just give a generic summary. Analyze every option.
  `;

  const { output } = await generateText({
    model: google("gemini-2.5-flash"),
    output: Output.object({schema:quizListSchema}),
    prompt: promptText,
  });

  return output.quizzes;
}
const flashcardSchema=z.object({
  question:z.string(),
  answer:z.string(),
  explanation:z.string(),
  difficulty:z.enum(["Easy","Medium","Hard"]),
})
const flashcardListSchema = z.object({
  flashcards:z.array(flashcardSchema).min(1)
})
export async function generateFlashcardsAction(
  topic:string,
  numFlashcards:number,
  noteContent:string
){
  "use server";

  const {output}= await generateText({
    model:google('gemini-2.5-flash'),
    output:Output.object({schema:flashcardListSchema}),
    prompt:`You are an expert tutor creating study materials.
    
    TASK: Generate ${numFlashcards} flashcards about "${topic}".
    
    CONTEXT: Use the following notes as the primary source of truth. If the notes do not fully cover the topic, you may use your general knowledge to supplement it, but prioritize the user's specific notes.
    
    USER NOTES:
    "${noteContent}"
    
    GUIDELINES:
    1. Questions should be clear and unambiguous.
    2. Answers should be concise (1-2 sentences) to fit on a card.
    3. Include a short 'explanation' only if the answer is complex.
    4. Vary the difficulty.`

  })
  return output.flashcards;
}