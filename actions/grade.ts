"use server";

import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

const GradeSchema = z.object({
  isCorrect: z.boolean().describe("True if the user understood the core concept, even if phrased differently."),
  score: z.number().min(0).max(100).describe("A confidence score of how well they knew it."),
  feedback: z.string().describe("Encouraging, direct feedback to the student in second person (you/your)."),
  missedConcepts: z.array(z.string()).describe("List of specific keywords or concepts the user forgot to mention."),
});

export async function gradeFlashcardAnswer(
  userAnswer: string, 
  correctAnswer: string, 
  question: string
) {
  const { output } = await generateText({
    model: google("gemini-2.5-flash"), 
    output: Output.object({schema:GradeSchema}),
    prompt: `
      You are a supportive tutor speaking directly to a student.
      
      Question: "${question}"
      Official Answer: "${correctAnswer}"
      Student's Answer: "${userAnswer}"
      
      GRADING CRITERIA:
      - If the student captures the MAIN IDEA, mark as correct (even with different wording)
      - If they miss critical concepts or nuance, mark as incorrect
      - Be forgiving of typos and minor phrasing differences
      
      FEEDBACK STYLE:
      - Speak DIRECTLY to the student using "you" and "your"
      - Be encouraging and constructive
      - Examples:
        ✅ "Your answer shows understanding of..."
        ✅ "You correctly identified..."
        ✅ "You missed the key point about..."
        ❌ Avoid: "The student answer..." or "They forgot..."
      
      - Keep feedback concise (2-3 sentences max)
      - If incorrect, briefly explain what they missed without being harsh
      - If correct, affirm their understanding
      
      MISSED CONCEPTS:
      - Only list concepts if the answer is incorrect or incomplete
      - Use specific, actionable terms (not generic phrases)
      - Keep concepts short (3-7 words each)
    `,
  });
  
  console.log(output);
  return output;
}