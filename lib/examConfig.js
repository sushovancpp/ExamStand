export const EXAM_CONFIG = {
  'SBI Clerk': {
    stages: {
      Prelims: {
        totalTime: 3600,
        sections: [
          { id: 'english',   name: 'English Language',          questions: 30, time: 1200 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 35, time: 1200 },
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 35, time: 1200 },
        ],
      },
      Mains: {
        totalTime: 9600,
        sections: [
          { id: 'ga',        name: 'General/Financial Awareness',         questions: 50, time: 2400 },
          { id: 'english',   name: 'English Language',                    questions: 40, time: 2400 },
          { id: 'quant',     name: 'Quantitative Aptitude',               questions: 50, time: 2400 },
          { id: 'reasoning', name: 'Reasoning & Computer Aptitude',       questions: 50, time: 2400 },
        ],
      },
    },
  },

  'SBI PO': {
    stages: {
      Prelims: {
        totalTime: 3600,
        sections: [
          { id: 'english',   name: 'English Language',          questions: 30, time: 1200 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 35, time: 1200 },
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 35, time: 1200 },
        ],
      },
      Mains: {
        totalTime: 10800,
        sections: [
          { id: 'reasoning', name: 'Reasoning & Computer Aptitude', questions: 45, time: 2700 },
          { id: 'quant',     name: 'Data Analysis & Interpretation', questions: 35, time: 2700 },
          { id: 'english',   name: 'English Language',               questions: 35, time: 2700 },
          { id: 'ga',        name: 'General/Economy/Banking Awareness', questions: 40, time: 2700 },
        ],
      },
    },
  },

  'RRB Clerk': {
    stages: {
      Prelims: {
        totalTime: 2700,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 40, time: 1350 },
          { id: 'quant',     name: 'Numerical Ability',         questions: 40, time: 1350 },
        ],
      },
      Mains: {
        totalTime: 7200,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 40, time: 1440 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 40, time: 1440 },
          { id: 'ga',        name: 'General Awareness',         questions: 40, time: 1440 },
          { id: 'english',   name: 'English Language',          questions: 40, time: 1440 },
          { id: 'computer',  name: 'Computer Knowledge',        questions: 40, time: 1440 },
        ],
      },
    },
  },

  'RRB PO': {
    stages: {
      Prelims: {
        totalTime: 2700,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 40, time: 1350 },
          { id: 'quant',     name: 'Numerical Ability',         questions: 40, time: 1350 },
        ],
      },
      Mains: {
        totalTime: 7200,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 40, time: 1440 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 40, time: 1440 },
          { id: 'ga',        name: 'General Awareness',         questions: 40, time: 1440 },
          { id: 'english',   name: 'English Language',          questions: 40, time: 1440 },
          { id: 'computer',  name: 'Computer Knowledge',        questions: 40, time: 1440 },
        ],
      },
    },
  },

  'IBPS Clerk': {
    stages: {
      Prelims: {
        totalTime: 3600,
        sections: [
          { id: 'english',   name: 'English Language',          questions: 30, time: 1200 },
          { id: 'quant',     name: 'Numerical Ability',         questions: 35, time: 1200 },
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 35, time: 1200 },
        ],
      },
      Mains: {
        totalTime: 10800,
        sections: [
          { id: 'reasoning', name: 'Reasoning & Computer Aptitude', questions: 50, time: 2700 },
          { id: 'english',   name: 'English Language',               questions: 40, time: 2700 },
          { id: 'quant',     name: 'Quantitative Aptitude',          questions: 50, time: 2700 },
          { id: 'ga',        name: 'General & Financial Awareness',  questions: 50, time: 2700 },
        ],
      },
    },
  },

  'IBPS PO': {
    stages: {
      Prelims: {
        totalTime: 3600,
        sections: [
          { id: 'english',   name: 'English Language',          questions: 30, time: 1200 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 35, time: 1200 },
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 35, time: 1200 },
        ],
      },
      Mains: {
        totalTime: 10800,
        sections: [
          { id: 'reasoning', name: 'Reasoning & Computer Aptitude',  questions: 45, time: 2700 },
          { id: 'english',   name: 'English Language',                questions: 35, time: 2700 },
          { id: 'quant',     name: 'Data Analysis & Interpretation',  questions: 35, time: 2700 },
          { id: 'ga',        name: 'General, Economy & Banking Awareness', questions: 40, time: 2700 },
        ],
      },
    },
  },

  'IBPS SO IT': {
    stages: {
      Prelims: {
        totalTime: 7200,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',     questions: 50, time: 2400 },
          { id: 'english',   name: 'English Language',      questions: 50, time: 2400 },
          { id: 'quant',     name: 'Quantitative Aptitude', questions: 50, time: 2400 },
        ],
      },
      Mains: {
        totalTime: 7200,
        sections: [
          { id: 'it_professional', name: 'Professional Knowledge (IT)', questions: 60, time: 7200 },
        ],
      },
    },
  },

  'SBI SO IT': {
    stages: {
      'Written Test': {
        totalTime: 7200,
        sections: [
          { id: 'reasoning', name: 'Reasoning',             questions: 50, time: 1800 },
          { id: 'english',   name: 'English Language',      questions: 50, time: 1800 },
          { id: 'quant',     name: 'Quantitative Aptitude', questions: 50, time: 1800 },
          { id: 'it_professional', name: 'Professional Knowledge (IT)', questions: 75, time: 1800 },
        ],
      },
    },
  },

  'IDBI Assistant Manager': {
    stages: {
      'Online Test': {
        totalTime: 7200,
        sections: [
          { id: 'reasoning', name: 'Reasoning Ability',         questions: 60, time: 1800 },
          { id: 'quant',     name: 'Quantitative Aptitude',     questions: 40, time: 1800 },
          { id: 'english',   name: 'English Language',          questions: 40, time: 1800 },
          { id: 'ga',        name: 'General Awareness',         questions: 60, time: 1800 },
        ],
      },
    },
  },
}

// Topics per section ID — used in prompt generation
export const SECTION_TOPICS = {
  reasoning: [
    'Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Puzzles',
    'Seating Arrangement', 'Direction Sense', 'Inequalities',
    'Input-Output', 'Order & Ranking', 'Alphanumeric Series',
    'Statement & Conclusions', 'Data Sufficiency',
  ],
  quant: [
    'Number Series', 'Simplification & Approximation', 'Data Interpretation (Table/Bar/Pie)',
    'Profit & Loss', 'Simple & Compound Interest', 'Time & Work',
    'Speed, Distance & Time', 'Ratio & Proportion', 'Percentage',
    'Quadratic Equations', 'Mensuration', 'Probability',
  ],
  english: [
    'Reading Comprehension', 'Error Spotting', 'Fill in the Blanks',
    'Para Jumbles', 'Cloze Test', 'Sentence Improvement',
    'Synonyms & Antonyms', 'Phrase Replacement', 'Connectors',
  ],
  ga: [
    'Current Affairs (Last 6 months)', 'Banking & Financial Awareness',
    'RBI & Monetary Policy', 'Government Schemes', 'Static GK',
    'Indian Economy', 'International Organizations', 'Awards & Honours',
    'Sports', 'Books & Authors',
  ],
  computer: [
    'Computer Fundamentals', 'MS Office (Word/Excel/PowerPoint)',
    'Internet & Networking', 'Database Management', 'Operating Systems',
    'Cybersecurity Basics', 'Number Systems', 'Computer Abbreviations',
  ],
  it_professional: [
    'Data Structures & Algorithms',
    'Database Management Systems (DBMS)',
    'Operating Systems',
    'Computer Networks & Protocols',
    'Object-Oriented Programming (OOP)',
    'Software Engineering & SDLC',
    'Web Technologies (HTML/CSS/JS)',
    'Cybersecurity & Cryptography',
    'Cloud Computing',
    'Programming Languages (C/C++/Java/Python)',
    'Computer Organization & Architecture',
    'Artificial Intelligence & Machine Learning Basics',
  ],
  hindi: [
    'Reading Comprehension (Hindi)', 'Hindi Grammar', 'Synonyms (Hindi)',
    'Antonyms (Hindi)', 'Fill in the Blanks (Hindi)', 'Sentence Correction (Hindi)',
  ],
}

export function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}
