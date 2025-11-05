import Groq from 'groq-sdk';

class GroqClient {
  constructor() {
    // Groq models
    this.models = {
      fast: 'llama-3.1-8b-instant', // Fast, cheap
      smart: 'llama-3.1-70b-versatile', // Best quality
      code: 'llama-3.1-70b-versatile', // Good for coding
    };

    // Lazy initialization - only create client when needed and API key is available
    this._client = null;
  }

  /**
   * Get or create Groq client (lazy initialization)
   */
  getClient() {
    if (this._client) {
      return this._client;
    }

    // Only initialize if API key is available
    if (!process.env.GROQ_API_KEY) {
      // Return a mock client during build or when API key is missing
      return this._createMockClient();
    }

    try {
      this._client = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      return this._client;
    } catch (error) {
      console.warn('Groq client initialization failed:', error.message);
      return this._createMockClient();
    }
  }

  /**
   * Create a mock client for build time or when API key is missing
   */
  _createMockClient() {
    return {
      chat: {
        completions: {
          create: async () => ({
            choices: [{
              message: {
                content: 'AI service not available. Please configure GROQ_API_KEY.',
              },
            }],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
          }),
        },
      },
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
      const client = this.getClient();
      const startTime = Date.now();

      const response = await client.chat.completions.create({
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
      const client = this.getClient();
      const stream = await client.chat.completions.create({
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
