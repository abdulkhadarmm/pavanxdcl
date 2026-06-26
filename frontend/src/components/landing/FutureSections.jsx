import React, { useState } from 'react';
import SectionHeading from '../shared/SectionHeading';
import Card from '../ui/Card';
import Button from '../ui/Button';
import theme from '../../config/theme';

export function FutureSections() {
  const [activeTab, setActiveTab] = useState('contests');
  const [notified, setNotified] = useState(false);
  const [email, setEmail] = useState('');

  const futureModules = {
    contests: {
      title: 'Coding Contests & Leaderboards',
      badge: 'Competitive Programming',
      description: 'Test your solving skills in scheduled coding battles. Earn rank badges, view structural code metrics, climb global academy leaderboards, and get scouted by recruiters.',
      mockItems: [
        { name: 'Weekly Sprint Challenge #14', date: 'Upcoming Sunday', prize: 'Top Rank Badges' },
        { name: 'DSA Marathon (Graphs & DP)', date: 'July 5, 2026', prize: 'Certificate of Excellence' }
      ]
    },
    live: {
      title: 'Live Mentoring & Interactive Sessions',
      badge: 'Live Classes',
      description: 'Interact with industry professionals in real time. Participate in live Q&A circles, system design workshops, resume breakdown drives, and core project clinics.',
      mockItems: [
        { name: 'Mock Coding Interview (Java & Spring Boot)', date: 'June 30, 2026', host: 'Senior Dev @ Google' },
        { name: 'System Design: Designing Scalable Platforms', date: 'July 8, 2026', host: 'Staff Engineer @ Razorpay' }
      ]
    },
    blogs: {
      title: 'Tech Blogs & Handbooks',
      badge: 'Articles',
      description: 'Explore comprehensive text guides, algorithmic cheat sheets, placement experience reports, tech explainers, and syntax blueprints written by senior coding instructors.',
      mockItems: [
        { title: 'Demystifying Dynamic Programming: The Matrix Way', author: 'Pavan Kumar', readTime: '8 min read' },
        { title: 'Vite 5.0 vs Webpack: Performance Case Studies', author: 'Dhee Lab Team', readTime: '5 min read' }
      ]
    },
    placements: {
      title: 'Placement Hub & Success Stories',
      badge: 'Career Center',
      description: 'Browse comprehensive recruitment trackers, search hiring alumni networks, review standard salary distributions, and inspect detailed placement stories.',
      mockItems: [
        { student: 'Rahul K.', firm: 'Amazon', role: 'SDE-1', review: 'Cleared coding rounds using the structured trees roadmap.' },
        { student: 'Sneha S.', firm: 'Microsoft', role: 'Frontend Engineer', review: 'React mock drills helped me showcase layout proficiency.' }
      ]
    }
  };

  const currentModule = futureModules[activeTab];

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setNotified(true);
      setTimeout(() => {
        setNotified(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section 
      id="future" 
      style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'radial-gradient(circle at 10% 90%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)'
      }}
    >
      <SectionHeading 
        title="Learning Ecosystem Previews"
        subtitle="We are constantly building additional modules to accelerate your engineering outcomes. Explore what is coming next."
      />

      {/* Tabs */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}
      >
        {Object.entries(futureModules).map(([key, value]) => (
          <Button
            key={key}
            variant={activeTab === key ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(key)}
            size="sm"
          >
            {value.badge}
          </Button>
        ))}
      </div>

      {/* Preview Area */}
      <div className="animate-fade-in" key={activeTab}>
        <Card 
          hoverable={false} 
          padding="40px"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}
          className="future-grid"
        >
          {/* Details */}
          <div>
            <span 
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.blue,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
                display: 'inline-block'
              }}
            >
              {currentModule.badge} (Preview)
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              {currentModule.title}
            </h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '30px' }}>
              {currentModule.description}
            </p>

            <form onSubmit={handleNotifySubmit} style={{ display: 'flex', gap: '10px', maxWidth: '420px', position: 'relative' }}>
              <input
                type="email"
                placeholder="Enter email to get notified"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flexGrow: 1,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Button type="submit" size="sm">
                {notified ? 'Subscribed! ✓' : 'Notify Me'}
              </Button>
            </form>
          </div>

          {/* List of Mock entries (Dynamic previews) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Teaser Timetable / Insights:
            </h4>
            
            {activeTab === 'contests' && currentModule.mockItems.map((item, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>{item.name}</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                  <span>📅 {item.date}</span>
                  <span style={{ color: theme.colors.amber }}>🏆 {item.prize}</span>
                </div>
              </div>
            ))}

            {activeTab === 'live' && currentModule.mockItems.map((item, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>{item.name}</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                  <span>📅 {item.date}</span>
                  <span style={{ color: theme.colors.blue }}>🎤 Host: {item.host}</span>
                </div>
              </div>
            ))}

            {activeTab === 'blogs' && currentModule.mockItems.map((item, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>{item.title}</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                  <span>✍️ Author: {item.author}</span>
                  <span>⏳ {item.readTime}</span>
                </div>
              </div>
            ))}

            {activeTab === 'placements' && currentModule.mockItems.map((item, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                  <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{item.student}</h5>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: 600 }}>
                    Placed @ {item.firm} ({item.role})
                  </span>
                </div>
                <p style={{ color: theme.colors.textSecondary, fontSize: '0.82rem', lineHeight: '1.4', margin: 0, fontStyle: 'italic' }}>
                  "{item.review}"
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .future-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default FutureSections;
