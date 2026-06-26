const defaultSiteConfig = {
  companyName: 'Pavan X Dhee Coding Lab',
  shortName: 'PavanXDCL',
  tagline: 'Empowering Learners with Premium Tech Education',
  description: 'DSA Forge • LeetCode Arena • Aptitude Lab — everything you need to crack placements and dominate FAANG interviews with PavanxDCL mentorship.',

  contact: {
    email: 'pavan@dheecodinglab.com',
    whatsapp: '+917760876386',
    address: 'BTM Layout, India'
  },

  socials: {
    whatsapp: 'https://whatsapp.com/channel/0029VbBqF0Q5a23umr9kfA3k',
    discord: 'https://discord.gg/example-invite',
    telegram: 'https://t.me/example-telegram',
    instagram: 'https://www.instagram.com/codewithpavanprakash/',
    linkedin: 'https://linkedin.com/company/pavanxdcl'
  },

  stats: {
    dsaProblems: '500+',
    placementFocused: '100%',
    activeLearners: '2000+',
    mentorship: 'Live'
  },

  seo: {
    defaultTitle: 'Pavan X Dhee Coding Lab (PavanXDCL) | Premium Coding Academy',
    defaultDescription: 'DSA Forge • LeetCode Arena • Aptitude Lab — everything you need to crack placements and dominate FAANG interviews with PavanxDCL mentorship.',
    defaultKeywords: 'dsa, coding academy, placement preparation, faang coding interviews, pavanxdcl',
    siteUrl: 'http://localhost:5173',
    defaultOgImage: '/og-image.png'
  }
};

const getPersistedConfig = () => {
  if (typeof window === 'undefined') return defaultSiteConfig;
  try {
    const saved = localStorage.getItem('site_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Detect and migrate stale defaults
      let modified = false;
      if (parsed.contact) {
        if (parsed.contact.email === 'support@pavanxdcl.com') {
          parsed.contact.email = defaultSiteConfig.contact.email;
          modified = true;
        }
        if (parsed.contact.whatsapp === '+91 98765 43210') {
          parsed.contact.whatsapp = defaultSiteConfig.contact.whatsapp;
          modified = true;
        }
        if (parsed.contact.address === 'Virtual Lab, India') {
          parsed.contact.address = defaultSiteConfig.contact.address;
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem('site_settings', JSON.stringify(parsed));
      }

      return {
        ...defaultSiteConfig,
        ...parsed,
        contact: { ...defaultSiteConfig.contact, ...(parsed.contact || {}) },
        socials: defaultSiteConfig.socials, // Always enforce default social links
        seo: { ...defaultSiteConfig.seo, ...(parsed.seo || {}) }
      };
    }
  } catch (e) {
    console.error("Error reading site settings from localStorage:", e);
  }
  return defaultSiteConfig;
};

// Return a proxy so that components always fetch the latest values dynamically if localStorage changes
export const siteConfig = new Proxy(defaultSiteConfig, {
  get(target, prop) {
    const active = getPersistedConfig();
    return active[prop];
  }
});

export default siteConfig;
