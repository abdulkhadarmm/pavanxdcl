import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import SectionHeading from '../shared/SectionHeading';
import Card from '../ui/Card';

export function CommunitySection() {
  const socialMeta = [
    { key: 'whatsapp', name: 'WhatsApp Channels', icon: '💬', color: '#25D366', description: 'Join instant classroom alerts, roadmaps, and announcement rings.' },
    { key: 'discord', name: 'Discord Servers', icon: '🎮', color: '#5865F2', description: 'Collaborate with coding cohorts, request code reviews, and pair program.' },
    { key: 'telegram', name: 'Telegram Groups', icon: '✈️', color: '#0088cc', description: 'Download tech handbooks, coding guides, and placement resources.' },
    { key: 'instagram', name: 'Instagram Hub', icon: '📸', color: '#E1306C', description: 'Watch tech reels, bite-sized algorithms, and campus life feeds.' },
    { key: 'linkedin', name: 'LinkedIn Company', icon: '👔', color: '#0A66C2', description: 'Stay connected with recruiting events, hiring partners, and success alumni.' },
    { key: 'youtube', name: 'YouTube Channel', icon: '📺', color: '#FF0000', description: 'Watch session explainers, coding webinars, and concept walkthroughs.' }
  ];

  return (
    <section 
      id="community" 
      style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <SectionHeading 
        title="Connect With Our Coding Community"
        subtitle="Learn, debug, share, and grow alongside thousands of active engineering students across our portals."
      />

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}
        className="community-grid"
      >
        {socialMeta.map((social) => {
          const url = siteConfig.socials[social.key];
          if (!url) return null; // Don't show if empty

          return (
            <a 
              key={social.key} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              className="animate-slide-up"
            >
              <Card 
                hoverable={true} 
                padding="24px"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderLeft: `3px solid ${social.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{social.icon}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                    {social.name}
                  </h3>
                </div>
                
                <p style={{ color: theme.colors.textSecondary, fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 16px 0', flexGrow: 1 }}>
                  {social.description}
                </p>

                <span 
                  style={{ 
                    color: social.color, 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Join Channel <span>&rarr;</span>
                </span>
              </Card>
            </a>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .community-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CommunitySection;
