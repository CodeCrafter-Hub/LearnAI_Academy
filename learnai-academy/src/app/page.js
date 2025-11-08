'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Shield,
  Sparkles,
  BookOpen,
  Users,
  Award
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

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
            LearnAI Academy
          </div>
          <div className="cluster" style={{ gap: 'var(--space-md)' }}>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-ghost"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary"
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
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2xs)',
              padding: 'var(--space-2xs) var(--space-md)',
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
            }}>
              <Sparkles style={{ width: '16px', height: '16px' }} />
              Powered by Advanced AI Technology
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-md)',
            lineHeight: 'var(--leading-tight)',
            maxWidth: '900px',
            marginInline: 'auto',
          }}>
            Personalized AI Tutoring for Every Student
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '700px',
            marginInline: 'auto',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            Transform learning with intelligent tutors that adapt to each student's needs.
            From K-12 to advanced subjects, we make education accessible and effective.
          </p>

          {/* CTA Buttons */}
          <div className="cluster" style={{
            justifyContent: 'center',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-2xl)',
          }}>
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary btn-lg"
              style={{ gap: 'var(--space-2xs)' }}
            >
              Start Learning Free
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary btn-lg"
            >
              Sign In
            </button>
          </div>

          {/* Social Proof */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
              <Star style={{ width: '16px', height: '16px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <Star style={{ width: '16px', height: '16px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <Star style={{ width: '16px', height: '16px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <Star style={{ width: '16px', height: '16px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <Star style={{ width: '16px', height: '16px', fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <span style={{ marginLeft: 'var(--space-2xs)', color: 'var(--color-text-secondary)' }}>
                4.9/5 from 2,000+ families
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ paddingBlock: 'var(--space-2xl)' }}>
        <div className="container">
          <div className="grid-enterprise-3" style={{ gap: 'var(--space-xl)' }}>
            <FeatureItem
              icon={BookOpen}
              title="Adaptive Learning"
              description="AI tutors adjust difficulty and teaching style based on student performance and learning patterns."
            />
            <FeatureItem
              icon={TrendingUp}
              title="Progress Tracking"
              description="Comprehensive analytics and insights help parents and students monitor growth over time."
            />
            <FeatureItem
              icon={Shield}
              title="Safe & Secure"
              description="Enterprise-grade security ensures student data is protected with industry-leading encryption."
            />
            <FeatureItem
              icon={Users}
              title="Parent Dashboard"
              description="Real-time visibility into learning sessions, progress, and achievements for peace of mind."
            />
            <FeatureItem
              icon={Award}
              title="Proven Results"
              description="Students show an average 35% improvement in comprehension within the first 3 months."
            />
            <FeatureItem
              icon={Sparkles}
              title="Engaging Experience"
              description="Gamification elements keep students motivated with achievements, streaks, and rewards."
            />
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section style={{
        paddingBlock: 'var(--space-2xl)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Comprehensive Curriculum Coverage
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '600px',
            marginInline: 'auto)',
          }}>
            From foundational skills to advanced concepts across all major subjects
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-sm)',
            maxWidth: '800px',
            marginInline: 'auto',
          }}>
            {[
              { name: 'Mathematics', icon: '∑' },
              { name: 'English', icon: 'Aa' },
              { name: 'Reading', icon: '📕' },
              { name: 'Science', icon: '⚗' },
              { name: 'Writing', icon: '✎' },
              { name: 'Coding', icon: '</>' },
            ].map(subject => (
              <div
                key={subject.name}
                style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all var(--transition-base)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 'var(--text-3xl)',
                  marginBottom: 'var(--space-xs)',
                  color: 'var(--color-text-primary)',
                }}>
                  {subject.icon}
                </div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {subject.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ paddingBlock: 'var(--space-2xl)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-xl)',
          }}>
            Trusted by Families Worldwide
          </h2>

          <div className="grid-enterprise-3" style={{ gap: 'var(--space-lg)' }}>
            <Testimonial
              quote="My daughter went from struggling with algebra to getting A's. The personalized approach made all the difference."
              author="Sarah Chen"
              role="Parent of 8th grader"
            />
            <Testimonial
              quote="As a teacher, I recommend LearnAI to all my students. The progress tracking helps me identify where they need extra support."
              author="Michael Rodriguez"
              role="High School Math Teacher"
            />
            <Testimonial
              quote="The AI tutors are patient and explain things in different ways until my son understands. It's like having a private tutor 24/7."
              author="Jennifer Williams"
              role="Parent of 5th grader"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        paddingBlock: 'var(--space-2xl)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
          }}>
            Start free, upgrade anytime
          </p>

          <div className="grid-enterprise-3" style={{ gap: 'var(--space-lg)', maxWidth: '1000px', marginInline: 'auto' }}>
            <PricingTier
              name="Free"
              price="$0"
              description="Perfect for trying out LearnAI"
              features={[
                '3 sessions per week',
                'Basic progress tracking',
                'All core subjects',
                'Email support',
              ]}
              cta="Start Free"
              onClick={() => router.push('/register')}
            />
            <PricingTier
              name="Pro"
              price="$29"
              period="/month"
              description="For serious students"
              features={[
                'Unlimited sessions',
                'Advanced analytics',
                'Priority support',
                'Parent dashboard',
                'Custom learning paths',
              ]}
              cta="Get Started"
              highlighted
              onClick={() => router.push('/register')}
            />
            <PricingTier
              name="Family"
              price="$49"
              period="/month"
              description="Up to 4 students"
              features={[
                'Everything in Pro',
                'Up to 4 student profiles',
                'Family progress reports',
                'Dedicated support',
              ]}
              cta="Get Started"
              onClick={() => router.push('/register')}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        paddingBlock: 'var(--space-2xl)',
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
              padding: 'var(--space-md) var(--space-xl)',
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
        padding: 'var(--space-xl) 0',
        background: 'var(--color-bg-base)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-xl)',
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: 'var(--space-md)',
                color: 'var(--color-text-primary)',
              }}>
                LearnAI Academy
              </div>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                Personalized AI tutoring for every student
              </p>
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Product
              </div>
              <div className="stack" style={{ gap: 'var(--space-2xs)' }}>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Features</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Pricing</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Subjects</a>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Company
              </div>
              <div className="stack" style={{ gap: 'var(--space-2xs)' }}>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>About</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Blog</a>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Contact</a>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-base)',
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
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
            textAlign: 'center',
          }}>
            © 2024 LearnAI Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--color-accent-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginInline: 'auto',
        marginBottom: 'var(--space-md)',
      }}>
        <Icon style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
      </div>
      <h3 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
      }}>
        {description}
      </p>
    </div>
  );
}

function Testimonial({ quote, author, role }) {
  return (
    <div style={{
      padding: 'var(--space-lg)',
      background: 'var(--color-bg-subtle)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-2xs)',
        marginBottom: 'var(--space-md)',
        justifyContent: 'center',
      }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            style={{
              width: '16px',
              height: '16px',
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
        "{quote}"
      </p>
      <div>
        <div style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {author}
        </div>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)',
        }}>
          {role}
        </div>
      </div>
    </div>
  );
}

function PricingTier({ name, price, period, description, features, cta, highlighted, onClick }) {
  return (
    <div style={{
      padding: 'var(--space-xl)',
      background: highlighted ? 'var(--color-accent-subtle)' : 'var(--color-bg-base)',
      border: highlighted ? '2px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-2xl)',
      position: 'relative',
    }}>
      {highlighted && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-md)',
          right: 'var(--space-md)',
          background: 'var(--color-accent)',
          color: 'white',
          padding: 'var(--space-2xs) var(--space-sm)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
        }}>
          POPULAR
        </div>
      )}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2xs)',
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-md)',
        }}>
          {description}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2xs)' }}>
          <span style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
          }}>
            {price}
          </span>
          {period && (
            <span style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-tertiary)',
            }}>
              {period}
            </span>
          )}
        </div>
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        marginBottom: 'var(--space-lg)',
      }}>
        {features.map((feature, i) => (
          <li
            key={i}
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
      <button
        onClick={onClick}
        className={highlighted ? 'btn btn-primary' : 'btn btn-secondary'}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {cta}
      </button>
    </div>
  );
}
