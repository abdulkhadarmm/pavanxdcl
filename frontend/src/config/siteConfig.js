export const siteConfig = {
  companyName: 'Pavan X Dhee Coding Lab',
  shortName: 'PavanXDCL',
  tagline: 'Empowering Learners with Premium Structured Tech Education',
  description: 'Acquire high-demand software engineering skills in Data Structures & Algorithms, Web Development, Programming, and Placement preparation with curated learning paths and structured practice.',
  
  contact: {
    email: 'support@pavanxdcl.com',
    whatsapp: '+91 98765 43210',
    address: 'Hyderabad, Telangana, India'
  },
  
  socials: {
    whatsapp: 'https://chat.whatsapp.com/example-invite',
    discord: 'https://discord.gg/example-invite',
    telegram: 'https://t.me/example-invite',
    instagram: 'https://instagram.com/pavanxdcl',
    linkedin: 'https://linkedin.com/company/pavanxdcl',
    youtube: 'https://youtube.com/c/pavanxdcl',
    github: 'https://github.com/pavanxdcl'
  },
  
  seo: {
    defaultTitle: 'Pavan X Dhee Coding Lab (PavanXDCL) | Premium Coding Academy',
    defaultDescription: 'Master DSA, Web Development, Aptitude, and Crack Product-based Company Interviews at Pavan X Dhee Coding Lab (PavanXDCL).',
    defaultKeywords: 'DSA, Data Structures, Algorithms, Programming Languages, Web Development, React, Java, Aptitude Preparation, Interview Preparation, PavanXDCL',
    defaultOgImage: '/src/assets/images/hero.png',
    siteUrl: 'http://localhost:5173'
  },
  
  // Static placeholders / fallback stats
  stats: {
    activeStudents: '12,500+',
    coursesAvailable: '15+',
    practiceQuestions: '1,200+',
    placementRate: '94.8%'
  },
  
  // Static placeholder data for testimonials
  testimonials: [
    {
      id: 1,
      name: 'Rohan Sharma',
      role: 'Software Engineer @ Amazon',
      text: 'Pavan X Dhee Coding Lab transformed my approach to problem-solving. The structured DSA learning path and practice questions were exactly what I needed to crack my interviews.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Frontend Developer @ Razorpay',
      text: 'The Web Development course is top-notch. Building projects in React and understanding the underlying CSS/JS concepts helped me transition from a non-tech background to a tech role.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Abhishek Verma',
      role: 'Systems Engineer @ TCS',
      text: 'Highly recommend the Aptitude and Java tracks. The clean structure, explanations, and practice links make learning highly structured. I got placed in my campus drive!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  
  // Static placeholder data for FAQs
  faqs: [
    {
      id: 'faq-1',
      question: 'What is Pavan X Dhee Coding Lab (PavanXDCL)?',
      answer: 'Pavan X Dhee Coding Lab (PavanXDCL) is a premier full-stack educational academy offering hands-on, structured learning paths in DSA, Web Development, Aptitude, and Interview Preparation.'
    },
    {
      id: 'faq-2',
      question: 'Is this platform completely dynamic?',
      answer: 'Yes! The administration panel allows administrators to dynamically add, edit, and reorder courses, modules, sessions, questions, practice tasks, and study resources, reflecting changes in real-time.'
    },
    {
      id: 'faq-3',
      question: 'Can I practice questions directly on the website?',
      answer: 'Absolutely. For Question Bank courses, the platform provides interactive MCQ assessments with immediate correct/incorrect feedback and detailed explanations.'
    },
    {
      id: 'faq-4',
      question: 'How do I access learning materials and practice links?',
      answer: 'Navigate to any course inside the portal, expand the module of interest, and select any session to access downloadable/external resources and coding practice tasks.'
    },
    {
      id: 'faq-5',
      question: 'Will there be more features like coding contests and live classes?',
      answer: 'Yes! PavanXDCL is built to be future-ready. Features like blogs, coding contests, live session integration, and placement statistics will be released in the upcoming updates.'
    }
  ],
  
  // Default course themes mapped to CSS classes
  courseThemes: [
    { name: 'Blue Glow', value: 'blue' },
    { name: 'Emerald Green', value: 'emerald' },
    { name: 'Royal Purple', value: 'royal' },
    { name: 'Warm Amber', value: 'amber' },
    { name: 'Rose Red', value: 'rose' }
  ]
};

export default siteConfig;
