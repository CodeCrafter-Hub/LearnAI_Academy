'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function ChatInterface({ sessionId, onSessionEnd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          ...data.message,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Speak response if voice enabled
        if (voiceEnabled) {
          speak(data.message.content);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again!",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animationDelay: '50ms',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-2xl)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
                ...(msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)',
                } : {
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }),
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div className="surface-elevated" style={{
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-2xl)',
              display: 'flex',
              gap: 'var(--space-xs)',
            }}>
              <div className="animate-bounce" style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-text-tertiary)',
              }} />
              <div className="animate-bounce" style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-text-tertiary)',
                animationDelay: '150ms',
              }} />
              <div className="animate-bounce" style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-text-tertiary)',
                animationDelay: '300ms',
              }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass" style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-md)',
      }}>
        {/* Listening Indicator */}
        {isListening && (
          <div style={{
            marginBottom: 'var(--space-sm)',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              background: 'hsla(0, 80%, 95%, 1)',
              color: 'hsl(0, 70%, 50%)',
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
            }}>
              <div className="animate-pulse" style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-full)',
                background: 'hsl(0, 70%, 50%)',
              }} />
              <span>Listening...</span>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
        }}>
          {/* Microphone Button */}
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className="btn"
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              background: isListening ? 'hsl(0, 70%, 55%)' : 'var(--color-bg-muted)',
              color: isListening ? 'white' : 'var(--color-text-secondary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type or speak your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--color-border-subtle)',
              background: 'var(--color-bg-base)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px hsla(var(--hue-accent), 70%, 55%, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {/* Voice Toggle Button */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="btn"
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              background: 'var(--color-bg-muted)',
              color: 'var(--color-text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'var(--color-bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--color-bg-muted)';
            }}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              background: (isLoading || !input.trim())
                ? 'var(--color-bg-muted)'
                : 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
              color: 'white',
              fontWeight: 'var(--weight-semibold)',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.5 : 1,
              boxShadow: (isLoading || !input.trim()) ? 'none' : 'var(--shadow-md)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
