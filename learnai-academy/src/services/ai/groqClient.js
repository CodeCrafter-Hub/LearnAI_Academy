import Groq from 'groq-sdk';

class GroqClient {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    // Groq models
    this.models = {
      fast: 'llama-3.1-8b-instant', // Fast, cheap
      smart: 'llama-3.1-70b-versatile', // Best quality
      code: 'llama-3.1-70b-versatile', // Good for coding
    };
  }

  async chat(messages, options = {}) {
    const {
      model = this.models.smart,
      temperature = 0.7,
      maxTokens = 1500,
      stream = false,
    } = options;

    try {
      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      const responseTime = Date.now() - startTime;

      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model,
        responseTime,
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async streamChat(messages, options = {}) {
    const {
      model = this.models.smart,
      temperature = 0.7,
      maxTokens = 1500,
    } = options;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error('Groq Streaming Error:', error);
      throw new Error(`AI streaming error: ${error.message}`);
    }
  }

  selectModel(complexity, domain) {
    // Route to appropriate model based on query
    if (complexity === 'simple') {
      return this.models.fast;
    }
    
    if (domain === 'coding') {
      return this.models.code;
    }
    
    return this.models.smart;
  }
}

export const groqClient = new GroqClient();
export default groqClient;
