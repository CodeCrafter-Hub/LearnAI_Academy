'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ThemeToggle to prevent SSR issues
const ThemeToggle = dynamic(() => import('@/components/ui/ThemeToggle'), {
  ssr: false,
  loading: () => <div style={{ width: '40px', height: '40px' }} />,
});

import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Shield,
  Sparkles,
  BookOpen,
  Users,
  Award,
  ChevronDown,
  Zap,
  Target,
  BarChart3,
  Play
} from 'lucide-react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--color-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg-base)' }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        position: 'sticky',
        top: 0,
        background: 'var(--color-bg-elevated)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
        zIndex: 'var(--z-sticky)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-md) var(--space-lg)',
        }}>
          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
          }}>
            LearnAI
          </div>
          <div className="cluster" style={{ gap: 'var(--space-lg)', alignItems: 'center' }}>
            <a href="#services" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-medium)' }}>Services</a>
            <a href="#how-it-works" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-medium)' }}>How it works</a>
            <a href="#testimonials" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-medium)' }}>Testimonials</a>
            <a href="#pricing" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-medium)' }}>Pricing</a>
            <a href="#faq" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-medium)' }}>FAQ</a>
            <ThemeToggle />
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary btn-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, var(--color-bg-subtle) 0%, var(--color-bg-base) 100%)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 'var(--space-2xl)',
            alignItems: 'center',
          }}>
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2xs)',
                  padding: 'var(--space-2xs) var(--space-md)',
                  background: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-semibold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  100% active users
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-md)',
                lineHeight: 'var(--leading-tight)',
              }}>
                AI-Powered Learning That{' '}
                <span style={{
                  background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Adapts to Every Student
                </span>
              </h1>

              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-xl)',
                lineHeight: 'var(--leading-relaxed)',
              }}>
                Personalized tutoring that understands each student's unique learning style. See measurable improvement in comprehension and confidence.
              </p>

              <div className="cluster" style={{
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)',
              }}>
                <button
                  onClick={() => router.push('/register')}
                  className="btn btn-primary btn-lg"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-secondary btn-lg"
                >
                  Watch Demo
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                fontSize: 'var(--text-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} style={{ width: '14px', height: '14px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
                  ))}
                </div>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Trusted by 2,000+ families
                </span>
              </div>
            </div>

            {/* Right Column - Screenshot */}
            <div style={{
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-2xl)',
              border: '1px solid var(--color-border-subtle)',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--color-accent-subtle) 0%, var(--color-primary-subtle) 100%)',
              }}>
                <Play style={{ width: '64px', height: '64px', color: 'var(--color-accent)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section style={{
        paddingBlock: 'var(--space-xl)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xl)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
              fontWeight: 'var(--weight-medium)',
            }}>
              Trusted by employees at:
            </span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div
                key={i}
                style={{
                  width: '80px',
                  height: '40px',
                  background: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="services" style={{ paddingBlock: 'var(--space-3xl)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Benefits
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2xl)',
            maxWidth: '600px',
            marginInline: 'auto',
          }}>
            Focus on how it helps users instead of what features it has
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-lg)',
          }}>
            {[
              { icon: Target, title: 'Adaptive Learning', desc: 'AI tutors adjust to each student\'s pace and style' },
              { icon: BarChart3, title: 'Track Progress', desc: 'Detailed analytics show growth over time' },
              { icon: Shield, title: 'Safe & Secure', desc: 'Enterprise-grade data protection' },
              { icon: Users, title: 'Parent Dashboard', desc: 'Real-time visibility into learning sessions' },
              { icon: Zap, title: 'Instant Feedback', desc: 'Get help exactly when you need it' },
              { icon: Award, title: 'Proven Results', desc: '35% average improvement in 3 months' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 'var(--space-xl)',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border-subtle)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginInline: 'auto',
                  marginBottom: 'var(--space-md)',
                }}>
                  <item.icon style={{ width: '28px', height: '28px', color: 'var(--color-accent)' }} />
                </div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            How it works?
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2xl)',
            maxWidth: '600px',
            marginInline: 'auto',
          }}>
            Get started in 3 simple steps
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-xl)',
          }}>
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up and set your grade level' },
              { num: '2', title: 'Choose Subject', desc: 'Select what you want to learn' },
              { num: '3', title: 'Start Learning', desc: 'Get personalized tutoring instantly' },
            ].map((step, i) => (
              <div key={i} style={{
                padding: 'var(--space-xl)',
                background: 'var(--color-bg-base)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border-subtle)',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--weight-bold)',
                  marginInline: 'auto',
                  marginBottom: 'var(--space-md)',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ paddingBlock: 'var(--space-3xl)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Pricing - Why to buy/How it helps
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2xl)',
          }}>
            Simple, transparent pricing
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-lg)',
            maxWidth: '1000px',
            marginInline: 'auto',
          }}>
            {[
              {
                name: 'Starter',
                price: '$100',
                period: '/month',
                features: ['Feature 1 goes here', 'Feature 2 goes here', 'Feature 3 goes here', 'Feature 4 goes here', 'Feature 5 goes here'],
              },
              {
                name: 'Pro',
                price: '$200',
                period: '/month',
                popular: true,
                features: ['Everything in Starter', 'Feature 6 goes here', 'Feature 7 goes here', 'Feature 8 goes here', 'Feature 9 goes here', 'Feature 10 goes here'],
              },
              {
                name: 'Advanced',
                price: '$300',
                period: '/month',
                features: ['Everything in Pro', 'Feature 11 goes here', 'Feature 12 goes here', 'Feature 13 goes here'],
              },
            ].map((tier, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--space-xl)',
                  background: tier.popular ? 'var(--color-accent-subtle)' : 'var(--color-bg-subtle)',
                  border: tier.popular ? '2px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-2xl)',
                  position: 'relative',
                  textAlign: 'left',
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-md)',
                    right: 'var(--space-md)',
                    background: 'var(--color-accent)',
                    color: 'white',
                    padding: 'var(--space-2xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)',
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}>
                    {tier.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2xs)' }}>
                    <span style={{
                      fontSize: 'var(--text-4xl)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-text-primary)',
                    }}>
                      {tier.price}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-tertiary)',
                    }}>
                      {tier.period}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/register')}
                  className={tier.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}
                >
                  CTA
                </button>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                }}>
                  {tier.features.map((feature, j) => (
                    <li
                      key={j}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Check style={{ width: '16px', height: '16px', color: 'var(--color-success)', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2xl)',
          }}>
            Loved by people worldwide
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-lg)',
          }}>
            {[
              {
                quote: 'My daughter went from struggling with algebra to getting A\'s. The personalized approach made all the difference.',
                author: 'Sarah Chen',
                role: 'Parent of 8th grader',
              },
              {
                quote: 'As a teacher, I recommend LearnAI to all my students. The progress tracking is invaluable.',
                author: 'Michael Rodriguez',
                role: 'High School Teacher',
              },
              {
                quote: 'The AI tutors are patient and explain things in different ways until my son understands.',
                author: 'Jennifer Williams',
                role: 'Parent of 5th grader',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--color-bg-base)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border-subtle)',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-2xs)',
                  marginBottom: 'var(--space-md)',
                }}>
                  {[1, 2, 3, 4, 5].map(j => (
                    <Star
                      key={j}
                      style={{
                        width: '14px',
                        height: '14px',
                        fill: 'var(--color-warning)',
                        color: 'var(--color-warning)',
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-md)',
                  lineHeight: 'var(--leading-relaxed)',
                  fontStyle: 'italic',
                }}>
                  "{testimonial.quote}"
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-muted)',
                  }} />
                  <div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}>
                      {testimonial.author}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                    }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ paddingBlock: 'var(--space-3xl)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
            textAlign: 'center',
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2xl)',
            textAlign: 'center',
          }}>
            Address major questions to help people make the trial call
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { q: 'How does the AI personalize learning?', a: 'Our AI analyzes student performance in real-time, adapting difficulty levels and teaching approaches based on comprehension patterns.' },
              { q: 'Is my child\'s data secure?', a: 'Yes. We use enterprise-grade encryption and never share student data with third parties.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts or cancellation fees. Cancel with one click from your dashboard.' },
              { q: 'What subjects are available?', a: 'We cover Math, English, Science, Reading, Writing, and Coding for grades K-12.' },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-lg)',
                    background: 'var(--color-bg-base)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-base)'}
                >
                  <span style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    textAlign: 'left',
                  }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    style={{
                      width: '20px',
                      height: '20px',
                      color: 'var(--color-text-tertiary)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform var(--transition-fast)',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: 'var(--space-lg)',
                    paddingTop: 0,
                    background: 'var(--color-bg-base)',
                  }}>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'var(--color-text-primary)',
        color: 'white',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            marginBottom: 'var(--space-md)',
            color: 'white',
          }}>
            Ready to Transform Learning?
          </h2>
          <p style={{
            fontSize: 'var(--text-xl)',
            marginBottom: 'var(--space-xl)',
            opacity: 0.9,
            maxWidth: '600px',
            marginInline: 'auto',
          }}>
            Join thousands of students achieving better results with personalized AI tutoring
          </p>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'white',
              color: 'var(--color-text-primary)',
              padding: 'var(--space-md) var(--space-2xl)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Learning Free
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-2xl) 0',
        background: 'var(--color-bg-base)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)',
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: 'var(--space-md)',
                color: 'var(--color-text-primary)',
              }}>
                LearnAI
              </div>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-md)',
              }}>
                Personalized AI tutoring for every student
              </p>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                Newsletter sign-up placeholder
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Menu
              </div>
              <div className="stack" style={{ gap: 'var(--space-2xs)' }}>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Link 1</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Link 2</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Link 3</a>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Legal
              </div>
              <div className="stack" style={{ gap: 'var(--space-2xs)' }}>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Privacy</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Terms</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Security</a>
              </div>
            </div>
          </div>
          <div style={{
            paddingTop: 'var(--space-lg)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
          }}>
            <div>© 2024 LearnAI Academy. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <a href="#" style={{ color: 'var(--color-text-tertiary)' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--color-text-tertiary)' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
