import { MathAgent } from "./agents/MathAgent.js";
import { EnglishAgent } from "./agents/EnglishAgent.js";
import { ReadingAgent } from "./agents/ReadingAgent.js";
import { ScienceAgent } from "./agents/ScienceAgent.js";
import { WritingAgent } from "./agents/WritingAgent.js";
import { CodingAgent } from "./agents/CodingAgent.js";

export async function routeToAgent({ subject, input }) {
  const map = {
    math: new MathAgent(),
    english: new EnglishAgent(),
    reading: new ReadingAgent(),
    science: new ScienceAgent(),
    writing: new WritingAgent(),
    coding: new CodingAgent(),
  };
  const agent = map[subject?.toLowerCase()] ?? new MathAgent();
  return agent.respond(input);
}
