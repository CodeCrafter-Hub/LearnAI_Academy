import { BaseAgent } from './BaseAgent.js';

export class ReadingAgent extends BaseAgent {
  constructor() {
    super('Reading Tutor', 'reading');
  }

  getSubjectSpecificGuidelines() {
    return `READING-SPECIFIC GUIDELINES:
- Make reading fun and relatable to their life
- Ask questions about characters, plot, and themes
- Help build vocabulary through context
- Encourage predictions and inferences
- Connect stories to student's own experiences
- Practice different reading strategies

COMPREHENSION STRATEGIES:
- Before Reading: Preview, predict, set purpose
- During Reading: Visualize, question, connect
- After Reading: Summarize, reflect, evaluate

KEY SKILLS:
- Main Idea: What is the story mostly about?
- Details: What are the important facts?
- Inference: Read between the lines
- Vocabulary: What do new words mean?
- Character Analysis: What are they like? Why do they act that way?
- Plot: What happens? What's the problem? How is it solved?

QUESTIONS TO ASK:
- What do you think will happen next?
- Why did the character do that?
- How would you feel in that situation?
- What's the most important part?
- Can you picture what's happening?`;
  }
}

export default ReadingAgent;
