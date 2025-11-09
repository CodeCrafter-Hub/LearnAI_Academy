/**
 * AI Provider Configuration System
 * 
 * Centralized configuration for multiple AI providers with automatic fallback.
 * Supports: Groq, OpenAI, Gemini, Kimi
 * 
 * Usage:
 *   import { aiProvider } from '@/services/ai/aiProviderConfig';
 *   const response = await aiProvider.chat(messages, options);
 */

import Groq from 'groq-sdk';
import PerformanceMonitor from '@/lib/performance.js';

/**
 * Provider configuration
 */
const PROVIDERS = {
  groq: {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    enabled: !!process.env.GROQ_API_KEY,
    priority: 1, // Higher priority = preferred
    models: {
      fast: 'llama-3.1-8b-instant',
      smart: 'llama-3.1-70b-versatile',
      code: 'llama-3.1-70b-versatile',
    },
    defaultModel: 'llama-3.1-70b-versatile',
    costPerMillionTokens: 0.27, // $0.27 per 1M tokens
    maxTokens: 8192,
  },
  openai: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    enabled: !!process.env.OPENAI_API_KEY,
    priority: 2,
    models: {
      fast: 'gpt-3.5-turbo',
      smart: 'gpt-4-turbo-preview',
      code: 'gpt-4-turbo-preview',
    },
    defaultModel: 'gpt-4-turbo-preview',
    costPerMillionTokens: 10.0, // Approximate for GPT-4
    maxTokens: 4096,
  },
  gemini: {
    name: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY,
    enabled: !!process.env.GEMINI_API_KEY,
    priority: 3,
    models: {
      fast: 'gemini-pro',
      smart: 'gemini-pro',
      code: 'gemini-pro',
    },
    defaultModel: 'gemini-pro',
    costPerMillionTokens: 0.5, // Approximate
    maxTokens: 8192,
  },
  kimi: {
    name: 'Kimi (Moonshot AI)',
    apiKey: process.env.KIMI_API_KEY,
    enabled: !!process.env.KIMI_API_KEY,
    priority: 4,
    models: {
      fast: 'moonshot-v1-8k',
      smart: 'moonshot-v1-32k',
      code: 'moonshot-v1-32k',
    },
    defaultModel: 'moonshot-v1-32k',
    costPerMillionTokens: 1.2, // Approximate
    maxTokens: 32000,
  },
};

/**
 * Get available providers sorted by priority
 */
function getAvailableProviders() {
  return Object.entries(PROVIDERS)
    .filter(([_, config]) => config.enabled)
    .sort(([_, a], [__, b]) => a.priority - b.priority)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Unified AI Provider Client
 */
class AIProvider {
  constructor() {
    this.providers = getAvailableProviders();
    this.currentProvider = null;
    this.clients = new Map();
    
    // Initialize first available provider
    if (this.providers.length > 0) {
      this.currentProvider = this.providers[0];
      console.log(`✅ AI Provider initialized: ${this.currentProvider.name}`);
    } else {
      console.warn('⚠️  No AI providers configured. Please set at least one API key.');
    }
  }

  /**
   * Get provider client (lazy initialization)
   */
  _getProviderClient(providerKey) {
    if (this.clients.has(providerKey)) {
      return this.clients.get(providerKey);
    }

    const provider = PROVIDERS[providerKey];
    if (!provider || !provider.enabled) {
      return null;
    }

    let client = null;

    try {
      switch (providerKey) {
        case 'groq':
          client = new Groq({
            apiKey: provider.apiKey,
          });
          break;

        case 'openai':
          // Dynamic import to avoid requiring package if not used
          const { default: OpenAI } = require('openai');
          client = new OpenAI({
            apiKey: provider.apiKey,
          });
          break;

        case 'gemini':
          // Google Gemini uses REST API
          client = {
            apiKey: provider.apiKey,
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          };
          break;

        case 'kimi':
          // Kimi/Moonshot uses REST API
          client = {
            apiKey: provider.apiKey,
            baseUrl: 'https://api.moonshot.cn/v1',
          };
          break;

        default:
          return null;
      }

      this.clients.set(providerKey, client);
      return client;
    } catch (error) {
      console.warn(`Failed to initialize ${provider.name} client:`, error.message);
      return null;
    }
  }

  /**
   * Chat with AI provider (with automatic fallback)
   */
  async chat(messages, options = {}) {
    const {
      model = null,
      temperature = 0.7,
      maxTokens = 1500,
      stream = false,
      retries = 3,
      preferredProvider = null,
    } = options;

    // Try preferred provider first, then fallback to available providers
    const providersToTry = preferredProvider
      ? [PROVIDERS[preferredProvider], ...this.providers.filter(p => p.key !== preferredProvider)]
      : this.providers;

    let lastError = null;

    for (const provider of providersToTry) {
      if (!provider.enabled) continue;

      try {
        return await this._chatWithProvider(provider, messages, {
          model: model || provider.defaultModel,
          temperature,
          maxTokens: Math.min(maxTokens, provider.maxTokens),
          stream,
          retries,
        });
      } catch (error) {
        lastError = error;
        console.warn(`${provider.name} failed, trying next provider...`, error.message);
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Chat with specific provider
   */
  async _chatWithProvider(provider, messages, options) {
    const { model, temperature, maxTokens, stream, retries } = options;
    const client = this._getProviderClient(provider.key);

    if (!client) {
      throw new Error(`${provider.name} client not available`);
    }

    return this._retryWithBackoff(async () => {
      const startTime = Date.now();
      let response;

      switch (provider.key) {
        case 'groq':
          response = await client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream,
          });
          break;

        case 'openai':
          response = await client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream,
          });
          break;

        case 'gemini':
          response = await this._callGeminiAPI(client, messages, { model, temperature, maxTokens });
          break;

        case 'kimi':
          response = await this._callKimiAPI(client, messages, { model, temperature, maxTokens });
          break;

        default:
          throw new Error(`Unsupported provider: ${provider.key}`);
      }

      const responseTime = Date.now() - startTime;

      // Parse response based on provider
      const parsed = this._parseResponse(provider, response);

      // Calculate cost
      const promptTokens = parsed.usage?.promptTokens || 0;
      const completionTokens = parsed.usage?.completionTokens || 0;
      const totalTokens = parsed.usage?.totalTokens || 0;
      const cost = (totalTokens / 1_000_000) * provider.costPerMillionTokens;

      // Track performance
      PerformanceMonitor.trackAICall(
        model,
        responseTime,
        totalTokens,
        cost,
        {
          provider: provider.name,
          promptTokens,
          completionTokens,
        }
      );

      return {
        content: parsed.content,
        usage: parsed.usage,
        model,
        provider: provider.name,
        responseTime,
        cost,
      };
    }, retries);
  }

  /**
   * Call Gemini API (REST)
   */
  async _callGeminiAPI(client, messages, options) {
    const { model, temperature, maxTokens } = options;

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `${client.baseUrl}/models/${model}:generateContent?key=${client.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      choices: [{
        message: {
          content: data.candidates[0]?.content?.parts[0]?.text || '',
        },
      }],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  /**
   * Call Kimi API (REST)
   */
  async _callKimiAPI(client, messages, options) {
    const { model, temperature, maxTokens } = options;

    const response = await fetch(`${client.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Kimi API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Parse response from different providers
   */
  _parseResponse(provider, response) {
    switch (provider.key) {
      case 'groq':
      case 'openai':
        return {
          content: response.choices[0]?.message?.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };

      case 'gemini':
        return {
          content: response.choices[0]?.message?.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };

      case 'kimi':
        return {
          content: response.choices[0]?.message?.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };

      default:
        throw new Error(`Unsupported provider: ${provider.key}`);
    }
  }

  /**
   * Retry with exponential backoff
   */
  async _retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error.status === 400 || error.status === 401 || error.status === 403) {
          throw error;
        }

        if (attempt === maxRetries) break;

        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`AI API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Select best model for complexity and domain
   */
  selectModel(complexity, domain, preferredProvider = null) {
    const provider = preferredProvider
      ? PROVIDERS[preferredProvider]
      : this.currentProvider || this.providers[0];

    if (!provider) {
      return 'gpt-3.5-turbo'; // Fallback
    }

    if (complexity === 'simple') {
      return provider.models.fast;
    }

    if (domain === 'coding') {
      return provider.models.code;
    }

    return provider.models.smart;
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      available: this.providers.map(p => ({
        name: p.name,
        key: p.key,
        enabled: p.enabled,
        priority: p.priority,
      })),
      current: this.currentProvider ? {
        name: this.currentProvider.name,
        key: this.currentProvider.key,
      } : null,
    };
  }
}

// Export singleton instance
export const aiProvider = new AIProvider();

export default aiProvider;

