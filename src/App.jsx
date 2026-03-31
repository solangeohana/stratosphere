import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   Stratosphere — Interactive Strategy Platform
   Dark theme, multi-page: Home / Frameworks / Research / War Room / Scenarios / Board Output
   ═══════════════════════════════════════════════════════ */

/* ──────────── PALETTE ──────────── */
const C = {
  bg: '#0A0A0F',
  surface: '#111118',
  surfaceLight: '#1A1A24',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  text: '#E8E8EC',
  textMuted: '#888892',
  textDim: '#55555E',
  orange: '#FF6B35',
  green: '#04C9A6',
  blue: '#0B91DB',
  red: '#E0043B',
  purple: '#734286',
  pink: '#DE007B',
  yellow: '#FFAD00',
};

/* ──────────── ROLES ──────────── */
const ROLES = ['CEO','CMO','CPO','CFO','Finance Director','Board Member'];

/* ──────────── FRAMEWORKS DATA ──────────── */
const FRAMEWORKS = [
  {
    id: 'porters-five',
    name: "Porter's Five Forces",
    category: 'Competitive Strategy',
    color: C.orange,
    summary: 'Analyse the competitive forces shaping your industry: supplier power, buyer power, new entrants, substitutes, and rivalry.',
    fields: [
      { id: 'rivalry', label: 'Competitive Rivalry', prompt: 'How intense is competition among existing players in your market?', placeholder: 'Describe the competitive landscape...' },
      { id: 'new_entrants', label: 'Threat of New Entrants', prompt: 'How easy is it for new competitors to enter your market — and does AI lower the barriers?', placeholder: 'Assess barriers to entry...' },
      { id: 'substitutes', label: 'Threat of Substitutes', prompt: 'What alternative solutions could replace your product entirely?', placeholder: 'Name specific substitutes...' },
      { id: 'buyer_power', label: 'Buyer Power', prompt: 'How much leverage do your customers have over pricing and terms?', placeholder: 'Describe buyer dynamics...' },
      { id: 'supplier_power', label: 'Supplier Power', prompt: 'How dependent are you on key suppliers or partners?', placeholder: 'Assess supplier concentration...' },
    ],
  },
  {
    id: 'moat',
    name: 'Competitive Moat',
    category: 'Defensive Strategy',
    color: C.yellow,
    summary: 'Map the five structural advantages that protect your business from AI-native competitors.',
    fields: [
      { id: 'network_effects', label: 'Network Effects', prompt: 'How does each additional user make your product more valuable for every other user — and can an AI clone replicate that loop?', placeholder: 'Describe the mechanism, not just "we have network effects"...' },
      { id: 'switching_costs', label: 'Switching Costs', prompt: 'What would a customer lose if they switched to an AI alternative tomorrow?', placeholder: 'Be specific about what\'s locked in...' },
      { id: 'proprietary_data', label: 'Proprietary Data', prompt: 'What data do you generate that no competitor can access, and does it compound over time?', placeholder: 'Think about data assets that improve with scale...' },
      { id: 'brand_trust', label: 'Brand & Trust', prompt: 'What makes your brand the one customers trust with their decision?', placeholder: 'Go beyond "brand awareness"...' },
      { id: 'scale_economies', label: 'Scale Economies', prompt: 'Where does your cost per unit decrease faster than competitors as you grow?', placeholder: 'Specify the unit economics advantage...' },
    ],
  },
  {
    id: 'errc',
    name: 'Blue Ocean — ERRC',
    category: 'Market Creation',
    color: C.green,
    summary: 'Apply the Eliminate-Reduce-Raise-Create framework to find uncontested market space.',
    fields: [
      { id: 'eliminate', label: 'Eliminate', prompt: 'Which industry factors should be completely eliminated because AI has made them irrelevant?', placeholder: 'Name specific competitive factors to kill...' },
      { id: 'reduce', label: 'Reduce', prompt: 'Which factors should be reduced well below the industry standard?', placeholder: 'What are you over-investing in?...' },
      { id: 'raise', label: 'Raise', prompt: 'Which factors should be raised well above the industry standard?', placeholder: 'What do AI-era customers now demand at a higher bar?...' },
      { id: 'create', label: 'Create', prompt: 'Which factors should be created that the industry has never offered?', placeholder: 'What entirely new value can you offer?...' },
    ],
  },
  {
    id: 'ansoff',
    name: 'Ansoff Matrix',
    category: 'Growth Strategy',
    color: C.red,
    summary: 'Plot your growth strategy across market vs product newness. Factor in AI risk shifts.',
    fields: [
      { id: 'penetration', label: 'Market Penetration', prompt: 'How can you grow share in your existing market with your existing product?', placeholder: 'Existing product × existing market...' },
      { id: 'product_dev', label: 'Product Development', prompt: 'What new products could you build for your existing market using AI?', placeholder: 'New product × existing market...' },
      { id: 'market_dev', label: 'Market Development', prompt: 'Which new markets could your existing product reach now that AI has changed economics?', placeholder: 'Existing product × new market...' },
      { id: 'diversification', label: 'Diversification', prompt: 'What entirely new product for an entirely new market would AI make possible?', placeholder: 'New product × new market...' },
    ],
  },
  {
    id: 'wardley',
    name: 'Wardley Map',
    category: 'Situational Awareness',
    color: C.blue,
    summary: 'Map your value chain from user need to underlying components, positioned by evolution stage.',
    fields: [
      { id: 'user_need', label: 'User Need', prompt: 'What is the core user need at the top of your value chain?', placeholder: 'The fundamental problem you solve...' },
      { id: 'visible_components', label: 'Visible Components', prompt: 'Which components does the user interact with directly?', placeholder: 'UI, APIs, content, services...' },
      { id: 'invisible_components', label: 'Invisible Components', prompt: 'Which backend components power the experience without user awareness?', placeholder: 'Infrastructure, data pipelines, models...' },
      { id: 'evolution', label: 'Evolution Stage', prompt: 'Where is each component on the genesis→custom→product→commodity spectrum?', placeholder: 'Map component maturity...' },
      { id: 'movement', label: 'Strategic Movement', prompt: 'Which components should you allow to commoditise vs invest in differentiating?', placeholder: 'Where to build vs buy vs outsource...' },
    ],
  },
];

/* ──────────── RESEARCH DATA ──────────── */
const RESEARCH = [
  { id: 'seo-disruption', title: 'SEO Channel Disruption', subtitle: 'How AI search is reshaping organic acquisition', color: C.orange, tags: ['Acquisition','AI Search','Channel Risk'], readTime: '8 min', content: 'AI-powered search (Google SGE, Perplexity, ChatGPT search) is compressing organic click-through rates by 30-60% across informational queries. Companies with >40% SEO-dependent acquisition are facing existential channel risk. The data shows commercial-intent queries still drive clicks, but the window is narrowing. First-party data and brand search become critical moats.' },
  { id: 'ai-native-competitors', title: 'AI-Native Competitor Analysis', subtitle: 'Mapping the new entrant landscape', color: C.green, tags: ['Competition','AI Startups','Market Entry'], readTime: '12 min', content: 'AI-native startups can now reach product-market fit 3-5x faster than traditional startups. The average time from founding to $1M ARR has compressed from 24 months to 8 months for AI-native companies. Their cost structure is fundamentally different: smaller teams, higher compute costs, faster iteration cycles.' },
  { id: 'moat-erosion', title: 'Moat Erosion Patterns', subtitle: 'Which competitive advantages survive AI disruption', color: C.yellow, tags: ['Moats','Defensibility','Analysis'], readTime: '10 min', content: 'Network effects remain the strongest moat in the AI era, but only when the network generates proprietary data. Brand trust is strengthening as AI-generated content floods the market. Scale economies in infrastructure are compressing as cloud costs drop. Switching costs based on data lock-in are the fastest-eroding moat category.' },
  { id: 'pricing-pressure', title: 'AI Pricing Pressure', subtitle: 'How AI commoditises your value proposition', color: C.red, tags: ['Pricing','Commoditisation','Value'], readTime: '7 min', content: 'SaaS companies face margin pressure as AI alternatives offer 80% of functionality at 20% of the price. The key differentiator is shifting from features to outcomes. Companies that price on value delivered (not seats or usage) are 2.3x more likely to maintain margins through AI disruption.' },
  { id: 'talent-strategy', title: 'AI Talent Strategy', subtitle: 'Building teams for the AI-augmented org', color: C.purple, tags: ['Talent','Organization','AI Skills'], readTime: '9 min', content: 'The most effective AI-era teams combine deep domain expertise with AI fluency. Companies that upskill existing domain experts outperform those that hire AI specialists without industry context by 1.8x on shipped product outcomes. The new title to hire: AI-augmented domain experts.' },
  { id: 'board-readiness', title: 'Board AI Readiness', subtitle: 'Preparing governance for AI-era decisions', color: C.blue, tags: ['Governance','Board','Risk'], readTime: '6 min', content: 'Only 12% of growth-stage boards have formal AI strategy oversight. Companies with board-level AI governance make strategic pivots 40% faster. Three things every board needs: AI competitive threat assessment, AI investment framework, and AI risk monitoring dashboard.' },
  { id: 'channel-diversification', title: 'Post-SEO Channel Mix', subtitle: 'Building resilient acquisition beyond organic search', color: C.green, tags: ['Channels','Acquisition','Diversification'], readTime: '11 min', content: 'Companies successfully diversifying from SEO-dependent acquisition are investing across community-led growth (28%), product-led virality (23%), strategic partnerships (19%), and AI-native distribution (18%). The most resilient companies have no single channel >30% of new revenue.' },
  { id: 'ai-product-strategy', title: 'AI Product Integration', subtitle: 'Build vs buy vs partner AI capabilities', color: C.orange, tags: ['Product','AI Integration','Strategy'], readTime: '8 min', content: 'The build vs buy framework for AI has shifted: fine-tuning foundation models costs 90% less than training from scratch. The new decision matrix: build when proprietary data is the moat, buy when speed-to-market matters, partner when the AI capability is adjacent to your core.' },
  { id: 'market-timing', title: 'AI Market Timing', subtitle: 'When to move: reading disruption signals', color: C.pink, tags: ['Timing','Disruption','Signals'], readTime: '7 min', content: 'Three reliable signals that AI disruption is imminent in your market: (1) AI startup funding in your category exceeds $100M in 12 months, (2) your top 3 competitors announce AI features simultaneously, (3) customer win/loss analysis shows "AI alternative" appearing in >10% of losses. When all three hit, you have 12-18 months.' },
];

/* ──────────── FEATURE PAGES DATA ──────────── */
const PARTICIPANT_COLORS = [C.orange, C.blue, C.green, C.pink, C.purple, C.red, C.yellow];
const PARTICIPANT_ICONS = ['👤','👔','⚙️','💰','📣','🏭','🎯','📊','🔬','🛡'];

const WAR_ROOM_PROMPTS = [
  { id: 'biggest_threat', label: 'Biggest AI Threat', prompt: 'What is the single biggest AI threat to our business in the next 18 months?' },
  { id: 'top_opportunity', label: 'Top AI Opportunity', prompt: 'What is our highest-ROI AI opportunity right now?' },
  { id: 'first_move', label: 'First Move', prompt: 'If we could only make one strategic move this quarter, what should it be?' },
  { id: 'resource_ask', label: 'Resource Ask', prompt: 'What resource or investment would you fight hardest for at the board table?' },
];

const SCENARIO_PRESETS = [
  { id: 'ai-competitor', label: 'AI Competitor Enters', icon: '⚡', desc: 'An AI-native startup offers 80% of your functionality at 20% of the price.' },
  { id: 'regulation-shift', label: 'Regulation Shift', icon: '📜', desc: 'New AI regulation forces you to disclose all AI usage in your product.' },
  { id: 'talent-drain', label: 'Talent Drain', icon: '🚪', desc: 'Your top 3 engineers leave to join an AI startup in your space.' },
  { id: 'market-collapse', label: 'Market Collapse', icon: '📉', desc: 'Your primary market shrinks 40% as AI eliminates the need for your category.' },
  { id: 'partnership-offer', label: 'Partnership Offer', icon: '🤝', desc: 'A major AI platform offers to acquire or partner — you have 48 hours to decide.' },
  { id: 'custom', label: 'Custom Scenario', icon: '✏️', desc: 'Define your own what-if scenario for AI-powered analysis.' },
];

const BOARD_TEMPLATES = [
  { id: 'exec-summary', label: 'Executive Summary', icon: '📋', desc: 'One-page AI strategy brief with threat/opportunity/ask', color: C.orange },
  { id: 'swot-canvas', label: 'SWOT Canvas', icon: '◇', desc: 'AI-enhanced Strengths, Weaknesses, Opportunities, Threats', color: C.blue },
  { id: 'porter-brief', label: "Porter's Five Forces Brief", icon: '⬠', desc: 'Competitive forces analysis formatted for board consumption', color: C.green },
  { id: 'blue-ocean', label: 'Blue Ocean Canvas', icon: '🌊', desc: 'ERRC framework with visual eliminate-reduce-raise-create grid', color: C.purple },
  { id: 'roadmap-90', label: '90-Day Roadmap', icon: '🏃', desc: 'Sprint plan with milestones, owners, and success metrics', color: C.pink },
  { id: 'roadmap-1y', label: '1-Year Strategic Plan', icon: '📅', desc: 'Annual strategy with quarterly objectives and key results', color: C.red },
  { id: 'roadmap-3y', label: '3-Year Vision', icon: '🔭', desc: 'Long-range vision with strategic bets and transformation milestones', color: C.yellow },
];

const PEER_ANSWERS = {};
const AI_SYNTHESIS = {};

/* ──────────── GLOBAL STYLES ──────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  min-height: 100vh;
  background: #0A0A0F;
  color: #E8E8EC;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(255,107,53,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 60% 60% at 100% 100%, rgba(4,201,166,0.04) 0%, transparent 50%),
    #0A0A0F;
  background-attachment: fixed;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }

textarea { outline: none; font-family: 'Inter', sans-serif; }
textarea:focus { border-color: #FF6B35 !important; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.4); opacity: 1; }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-up { animation: fadeUp 0.5s ease both; }
.fade-in { animation: fadeIn 0.4s ease both; }
.slide-in { animation: slideIn 0.4s ease both; }

.card-hover {
  transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
  cursor: pointer;
}
.card-hover:hover {
  transform: translateY(-3px);
  border-color: rgba(255,255,255,0.12) !important;
}
`;

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

export default function Stratosphere() {
  /* ── state ── */
  const [page, setPage] = useState('home');
  const [role, setRole] = useState('CEO');
  const [activeFramework, setActiveFramework] = useState(null);
  const [activeResearch, setActiveResearch] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [coaching, setCoaching] = useState({});
  const [loading, setLoading] = useState({});
  const [expandedPeers, setExpandedPeers] = useState({});

  /* War Room state */
  const [warRoomSessionId, setWarRoomSessionId] = useState(null);
  const [warRoomParticipants, setWarRoomParticipants] = useState([]);
  const [warRoomCurrentUser, setWarRoomCurrentUser] = useState(null);
  const [warRoomJoinName, setWarRoomJoinName] = useState('');
  const [warRoomJoinRole, setWarRoomJoinRole] = useState('');
  const [warRoomInputs, setWarRoomInputs] = useState({});
  const [warRoomVotes, setWarRoomVotes] = useState({});
  const [warRoomSynthesis, setWarRoomSynthesis] = useState(null);
  const [warRoomSynthLoading, setWarRoomSynthLoading] = useState(false);
  const [warRoomLinkCopied, setWarRoomLinkCopied] = useState(false);

  const resetWarRoom = useCallback(() => {
    setWarRoomSessionId(null);
    setWarRoomParticipants([]);
    setWarRoomCurrentUser(null);
    setWarRoomJoinName('');
    setWarRoomJoinRole('');
    setWarRoomInputs({});
    setWarRoomVotes({});
    setWarRoomSynthesis(null);
    setWarRoomSynthLoading(false);
    setWarRoomLinkCopied(false);
  }, []);

  /* Scenario Simulator state */
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioCustom, setScenarioCustom] = useState('');
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  /* Board Output state */
  const [boardOutputs, setBoardOutputs] = useState({});
  const [boardLoading, setBoardLoading] = useState({});

  /* ── inject styles ── */
  useEffect(() => {
    const id = 'stratosphere-css';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* ── URL hash routing (enables shareable war room links + browser back) ── */
  const resolveHash = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    if (hash.startsWith('war-room/')) {
      const sid = hash.split('/')[1];
      if (sid) {
        setWarRoomSessionId(sid);
        setPage('war-room');
      }
    } else if (['home','frameworks','research','war-room','scenarios','board-output'].includes(hash)) {
      setPage(hash);
    }
  }, []);

  useEffect(() => {
    resolveHash();
    const onPop = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('war-room/')) {
        setPage('war-room');
      } else if (['home','frameworks','research','war-room','scenarios','board-output','framework-detail','research-detail'].includes(hash)) {
        setPage(hash);
      } else {
        setPage('home');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [resolveHash]);

  /* ── helpers ── */
  const getAnswer = (ctxId, fieldId) => answers[ctxId]?.[fieldId] || '';
  const isSubmitted = (ctxId, fieldId) => submitted[ctxId]?.[fieldId] || false;

  const setAnswer = useCallback((ctxId, fieldId, value) => {
    setAnswers(prev => ({ ...prev, [ctxId]: { ...prev[ctxId], [fieldId]: value } }));
  }, []);

  const submitField = useCallback((ctxId, fieldId) => {
    setSubmitted(prev => ({ ...prev, [ctxId]: { ...prev[ctxId], [fieldId]: true } }));
  }, []);

  const getCompletionPct = (id, fields) => {
    const done = fields.filter(f => isSubmitted(id, f.id)).length;
    return Math.round((done / fields.length) * 100);
  };

  const getSubmittedCount = (id, fields) => fields.filter(f => isSubmitted(id, f.id)).length;

  /* ── AI coaching ── */
  const fetchCoaching = useCallback(async (contextName, fieldLabel, fieldId, text, currentRole) => {
    setLoading(prev => ({ ...prev, [fieldId]: true }));
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': (typeof window !== 'undefined' && window.__ANTHROPIC_API_KEY__) || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an elite strategy coach embedded in Stratosphere. The exec (role: ${currentRole}) is working on "${contextName}", field "${fieldLabel}". Style: real-time, Socratic, direct. Max 2 sentences. Either ask ONE sharp follow-up question OR name the assumption they haven't examined. Never summarise. Push forward. Calibrate to AI disruption of SEO-driven growth. Tone: brilliant peer who respects their intelligence.`,
          messages: [{ role: 'user', content: text }],
        }),
      });
      const data = await resp.json();
      const t = data?.content?.[0]?.text || 'Keep going — push deeper on the mechanism behind this.';
      setCoaching(prev => ({ ...prev, [fieldId]: t }));
    } catch {
      setCoaching(prev => ({ ...prev, [fieldId]: 'Keep writing — articulate the specific mechanism, not just the category.' }));
    } finally {
      setLoading(prev => ({ ...prev, [fieldId]: false }));
    }
  }, []);

  /* ── navigation (with history) ── */
  const navigate = useCallback((p) => {
    setPage(p);
    setActiveFramework(null);
    setActiveResearch(null);
    if (p === 'war-room') {
      if (!warRoomSessionId) {
        const sid = Math.random().toString(36).slice(2, 10);
        setWarRoomSessionId(sid);
        window.history.pushState(null, '', `#war-room/${sid}`);
      } else {
        window.history.pushState(null, '', `#war-room/${warRoomSessionId}`);
      }
    } else {
      window.history.pushState(null, '', `#${p}`);
    }
  }, [warRoomSessionId]);

  const openFramework = (fw) => { setActiveFramework(fw); setPage('framework-detail'); window.history.pushState(null, '', '#framework-detail'); };
  const openResearch = (r) => { setActiveResearch(r); setPage('research-detail'); window.history.pushState(null, '', '#research-detail'); };

  /* ── War Room session helpers ── */
  const createWarRoomSession = useCallback(() => {
    const sid = Math.random().toString(36).slice(2, 10);
    setWarRoomSessionId(sid);
    window.history.pushState(null, '', `#war-room/${sid}`);
  }, []);

  const joinWarRoom = useCallback(() => {
    if (!warRoomJoinName.trim() || !warRoomJoinRole.trim()) return;
    const pid = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const idx = warRoomParticipants.length;
    const participant = {
      id: pid,
      name: warRoomJoinName.trim(),
      role: warRoomJoinRole.trim(),
      icon: PARTICIPANT_ICONS[idx % PARTICIPANT_ICONS.length],
      color: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length],
    };
    setWarRoomParticipants(prev => [...prev, participant]);
    setWarRoomCurrentUser(participant);
    setWarRoomJoinName('');
    setWarRoomJoinRole('');
  }, [warRoomJoinName, warRoomJoinRole, warRoomParticipants]);

  const shareWarRoomLink = useCallback(() => {
    if (!warRoomSessionId) createWarRoomSession();
    const url = `${window.location.origin}${window.location.pathname}#war-room/${warRoomSessionId || ''}`;
    navigator.clipboard.writeText(url).then(() => {
      setWarRoomLinkCopied(true);
      setTimeout(() => setWarRoomLinkCopied(false), 2000);
    });
  }, [warRoomSessionId, createWarRoomSession]);

  const PAGES = ['home','frameworks','research','war-room','scenarios','board-output'];

  const PAGE_LABELS = { home: 'Home', frameworks: 'Frameworks', research: 'Research', 'war-room': 'War Room', scenarios: 'Scenarios', 'board-output': 'Board Output' };

  /* ═══════════════ NAV BAR (inline JSX) ═══════════════ */
  const navJSX = (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(10,10,15,0.8)',
      borderBottom: `1px solid ${C.border}`,
      padding: '0 32px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('home')}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter', fontWeight: 800, fontSize: 14, color: '#fff',
          }}>S</div>
          <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>
            Stratosphere
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
          {PAGES.map(p => (
            <button key={p} onClick={() => navigate(p)} style={{
              fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
              padding: '6px 16px', borderRadius: 20,
              border: 'none', cursor: 'pointer',
              background: (page === p || (p === 'frameworks' && page === 'framework-detail') || (p === 'research' && page === 'research-detail'))
                ? C.orange : 'transparent',
              color: (page === p || (p === 'frameworks' && page === 'framework-detail') || (p === 'research' && page === 'research-detail'))
                ? '#fff' : C.textMuted,
              transition: 'all 0.2s',
            }}>
              {PAGE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

    </nav>
  );

  /* ═══════════════ HOME PAGE ═══════════════ */
  const HomePage = () => (
    <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 80px' }}>
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        {/* Left: Hero */}
        <div style={{ flex: 1 }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500,
              padding: '4px 12px', borderRadius: 4,
              background: 'rgba(4,201,166,0.12)', color: C.green,
              letterSpacing: '0.5px',
            }}>Leadership intelligence</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 32, color: '#fff' }}>
            Think<br />Sharper.<br />
            <span style={{ fontStyle: 'italic', color: C.orange }}>Pivot</span><br />
            <span style={{ fontStyle: 'italic', color: C.orange }}>Faster.</span><br />
            Lead<br />Through AI.
          </h1>

          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: C.textMuted, lineHeight: 1.8, maxWidth: 480 }}>
            Stratosphere is your executive strategy intelligence platform — frameworks, research, a collaborative war room, scenario simulator, and board-ready outputs, all powered by AI.
          </p>
        </div>

        {/* Right: Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: 340, flexShrink: 0, marginTop: 40 }}>
          {[
            { value: '5', label: 'Strategy\nFrameworks', color: C.orange },
            { value: '9+', label: 'Research\nStudies', color: C.blue },
            { value: '3', label: 'Interactive\nTools', color: C.green },
            { value: '∞', label: 'Unlimited\nPossibilities', color: C.pink },
          ].map((s, i) => (
            <div key={i} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: s.color, fontStyle: 'italic', marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Selector */}
      <div style={{ marginTop: 60, marginBottom: 40 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '1.5px', color: C.textDim, marginBottom: 12 }}>YOUR ROLE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
              padding: '7px 18px', borderRadius: 20,
              border: role === r ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
              background: role === r ? 'rgba(255,107,53,0.1)' : 'transparent',
              color: role === r ? C.orange : C.textMuted,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '1.5px', color: C.textDim, marginBottom: 16 }}>QUICK ACCESS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {[
          { label: 'Frameworks', desc: '5 strategic frameworks with interactive canvases', icon: '◇', target: 'frameworks' },
          { label: 'Research', desc: '9+ studies on AI disruption and strategic response', icon: '◈', target: 'research' },
          { label: 'War Room', desc: 'Collaborative strategy room with AI synthesis & voting', icon: '⚔', target: 'war-room' },
          { label: 'Scenarios', desc: 'What-if simulator with AI-powered outcome modelling', icon: '🔮', target: 'scenarios' },
          { label: 'Board Output', desc: 'One-click board-ready artifacts, export-ready', icon: '📋', target: 'board-output' },
        ].map(q => (
          <div key={q.target} className="card-hover" onClick={() => navigate(q.target)} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18, color: C.orange }}>{q.icon}</span>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#fff' }}>{q.label}</span>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{q.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════ FRAMEWORKS PAGE ═══════════════ */
  const FrameworksPage = () => (
    <div className="fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 32px 80px' }}>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
        Strategy Frameworks
      </h2>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.textMuted, marginBottom: 40, maxWidth: 560 }}>
        Five proven strategic frameworks, adapted for the AI disruption era. Each includes interactive fields and a live canvas.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {FRAMEWORKS.map(fw => {
          const pct = getCompletionPct(fw.id, fw.fields);
          return (
            <div key={fw.id} className="card-hover" onClick={() => openFramework(fw)} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: fw.color, transition: 'width 0.5s' }} />
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: fw.color, letterSpacing: '1px', textTransform: 'uppercase' }}>{fw.category}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: fw.color, background: `${fw.color}15`, padding: '2px 8px', borderRadius: 10 }}>{pct}%</span>
                </div>
                <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>{fw.name}</h3>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.5, marginBottom: 14 }}>{fw.summary}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.textDim, background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: 8 }}>{fw.fields.length} fields</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════ RESEARCH PAGE ═══════════════ */
  const ResearchPage = () => (
    <div className="fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 32px 80px' }}>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
        Research &amp; Intelligence
      </h2>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.textMuted, marginBottom: 40, maxWidth: 560 }}>
        AI disruption research calibrated for growth-stage executives. Each study includes data, frameworks, and actionable takeaways.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {RESEARCH.map(r => (
          <div key={r.id} className="card-hover" onClick={() => openResearch(r)} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.tags.map(t => (
                  <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: r.color, background: `${r.color}12`, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.3px' }}>{t}</span>
                ))}
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.textDim }}>{r.readTime}</span>
            </div>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 6 }}>{r.title}</h3>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{r.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════ RESEARCH DETAIL PAGE ═══════════════ */
  const ResearchDetailPage = () => {
    const r = activeResearch;
    if (!r) return null;
    return (
      <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 80px' }}>
        <button onClick={() => navigate('research')} style={{
          fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: C.textMuted,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
          padding: '6px 16px', cursor: 'pointer', marginBottom: 32,
        }}>← Research</button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {r.tags.map(t => (
            <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: r.color, background: `${r.color}12`, padding: '3px 10px', borderRadius: 8 }}>{t}</span>
          ))}
        </div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>{r.title}</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 16, color: C.textMuted, marginBottom: 24 }}>{r.subtitle}</p>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, marginBottom: 32 }}>{r.readTime} read</div>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28,
          fontFamily: 'Inter', fontSize: 15, color: C.text, lineHeight: 1.8,
        }}>
          {r.content}
        </div>
      </div>
    );
  };

  /* ═══════════════ WAR ROOM PAGE ═══════════════ */
  const synthesizeWarRoom = useCallback(async () => {
    setWarRoomSynthLoading(true);
    try {
      const inputSummary = warRoomParticipants.map(p => {
        const inputs = WAR_ROOM_PROMPTS.map(pr => `${pr.label}: ${warRoomInputs[p.id]?.[pr.id] || '(not answered)'}`).join('\n');
        return `### ${p.name} (${p.role})\n${inputs}`;
      }).join('\n\n');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'PLACEHOLDER_KEY', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1200,
          messages: [{ role: 'user', content: `You are a senior strategy facilitator. Given these inputs from a collaborative war room session with ${warRoomParticipants.length} participants, produce:\n1. **Areas of Alignment** — where leaders agree\n2. **Points of Divergence** — where views differ sharply\n3. **Blind Spots** — what no one addressed\n4. **Recommended Priority** — the single highest-impact move\n\nKeep each section to 2-3 crisp bullets. Be direct.\n\n${inputSummary}` }],
        }),
      });
      const data = await res.json();
      setWarRoomSynthesis(data.content?.[0]?.text || 'Unable to synthesize. Please try again.');
    } catch { setWarRoomSynthesis('Synthesis failed — check your API key.'); }
    finally { setWarRoomSynthLoading(false); }
  }, [warRoomInputs, warRoomParticipants]);

  const castVote = (promptId, priority) => {
    setWarRoomVotes(prev => ({ ...prev, [promptId]: priority }));
  };

  const warRoomHasJoined = !!warRoomCurrentUser;
  const warRoomFilledCount = warRoomParticipants.reduce((acc, p) => acc + WAR_ROOM_PROMPTS.filter(pr => (warRoomInputs[p.id]?.[pr.id] || '').length > 20).length, 0);
  const warRoomTotalFields = Math.max(warRoomParticipants.length, 1) * WAR_ROOM_PROMPTS.length;

  const warRoomPageJSX = (
      <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
              Collaborative War Room
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.textMuted, maxWidth: 560 }}>
              Join with your name and role. Each participant answers independently. AI synthesises alignment, divergence, and blind spots. Share the link to invite others.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {warRoomParticipants.length > 0 && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: C.green, background: 'rgba(4,201,166,0.1)', padding: '6px 14px', borderRadius: 10 }}>
                {warRoomFilledCount}/{warRoomTotalFields} fields
              </span>
            )}
            <button onClick={shareWarRoomLink} style={{
              fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
              padding: '8px 16px', borderRadius: 10,
              border: `1px solid ${C.orange}40`, background: warRoomLinkCopied ? `${C.green}20` : `${C.orange}12`,
              color: warRoomLinkCopied ? C.green : C.orange, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {warRoomLinkCopied ? '✓ Link Copied!' : '🔗 Share War Room'}
            </button>
            {warRoomSessionId && (
              <button onClick={resetWarRoom} style={{
                fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                padding: '8px 16px', borderRadius: 10,
                border: `1px solid ${C.red}40`, background: `${C.red}12`,
                color: C.red, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ↻ New Session
              </button>
            )}
          </div>
        </div>

        {/* Session badge */}
        {warRoomSessionId && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 8, display: 'inline-block', marginBottom: 24 }}>
            SESSION: {warRoomSessionId}
          </div>
        )}

        {/* Participants strip */}
        {warRoomParticipants.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {warRoomParticipants.map(p => (
              <div key={p.id} onClick={() => setWarRoomCurrentUser(p)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: p.id === warRoomCurrentUser?.id ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.id === warRoomCurrentUser?.id ? `${p.color}40` : C.border}`,
                borderRadius: 20, padding: '5px 14px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: p.color }}>{p.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.textDim }}>{p.role}</span>
              </div>
            ))}
          </div>
        )}

        {/* Join form */}
        {!warRoomHasJoined && (
          <div className="fade-in" style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, marginBottom: 32,
            maxWidth: 500, margin: '0 auto 32px',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '1.5px', color: C.orange, marginBottom: 20 }}>JOIN WAR ROOM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, display: 'block', marginBottom: 6 }}>Your Name</label>
                <input
                  value={warRoomJoinName}
                  onChange={e => setWarRoomJoinName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0A0A0F', border: `1px solid ${C.border}`,
                    color: '#fff', fontSize: 14, fontFamily: 'Inter', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, display: 'block', marginBottom: 6 }}>Your Role</label>
                <input
                  value={warRoomJoinRole}
                  onChange={e => setWarRoomJoinRole(e.target.value)}
                  placeholder="e.g. CTO, VP Engineering, Head of Strategy..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0A0A0F', border: `1px solid ${C.border}`,
                    color: '#fff', fontSize: 14, fontFamily: 'Inter', outline: 'none',
                  }}
                />
              </div>
              <button onClick={joinWarRoom} disabled={!warRoomJoinName.trim() || !warRoomJoinRole.trim()} style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
                padding: '12px 24px', borderRadius: 12, marginTop: 4,
                border: 'none', cursor: !warRoomJoinName.trim() || !warRoomJoinRole.trim() ? 'not-allowed' : 'pointer',
                background: !warRoomJoinName.trim() || !warRoomJoinRole.trim() ? C.border : `linear-gradient(135deg, ${C.orange}, ${C.pink})`,
                color: '#fff', transition: 'all 0.3s',
              }}>
                Join War Room →
              </button>
            </div>
          </div>
        )}

        {/* Participant input cards (only shown after joining) */}
        {warRoomHasJoined && warRoomParticipants.map(wr => (
          <div key={wr.id} style={{ marginBottom: 32, background: C.surface, border: `1px solid ${wr.id === warRoomCurrentUser?.id ? `${wr.color}30` : C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{wr.icon}</span>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: wr.color }}>{wr.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, marginLeft: 4 }}>{wr.role}</span>
              {wr.id === warRoomCurrentUser?.id && (
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: C.green, background: `${C.green}15`, padding: '2px 8px', borderRadius: 10, marginLeft: 'auto' }}>YOU</span>
              )}
            </div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {WAR_ROOM_PROMPTS.map(p => (
                <div key={p.id}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>{p.label}</label>
                  <textarea
                    value={warRoomInputs[wr.id]?.[p.id] || ''}
                    onChange={e => setWarRoomInputs(prev => ({
                      ...prev, [wr.id]: { ...prev[wr.id], [p.id]: e.target.value }
                    }))}
                    placeholder={p.prompt}
                    readOnly={wr.id !== warRoomCurrentUser?.id}
                    style={{
                      width: '100%', minHeight: 80, padding: 12, borderRadius: 10,
                      background: wr.id === warRoomCurrentUser?.id ? '#0A0A0F' : 'rgba(10,10,15,0.4)',
                      border: `1px solid ${C.border}`,
                      color: wr.id === warRoomCurrentUser?.id ? '#fff' : C.textMuted,
                      fontSize: 13, fontFamily: 'Inter', lineHeight: 1.5, resize: 'vertical',
                      opacity: wr.id === warRoomCurrentUser?.id ? 1 : 0.6,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add another participant (quick-add for facilitator) */}
        {warRoomHasJoined && (
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <button onClick={() => setWarRoomCurrentUser(null)} style={{
              fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim,
              background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 12,
              padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              + Add Another Participant
            </button>
          </div>
        )}

        {/* Synthesize button */}
        {warRoomParticipants.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button onClick={synthesizeWarRoom} disabled={warRoomSynthLoading || warRoomFilledCount < 4} style={{
              fontFamily: 'Inter', fontWeight: 700, fontSize: 15,
              padding: '14px 40px', borderRadius: 12,
              border: 'none', cursor: warRoomFilledCount < 4 ? 'not-allowed' : 'pointer',
              background: warRoomFilledCount < 4 ? C.border : `linear-gradient(135deg, ${C.orange}, ${C.pink})`,
              color: '#fff', transition: 'all 0.3s', opacity: warRoomSynthLoading ? 0.6 : 1,
            }}>
              {warRoomSynthLoading ? '◎ Synthesising...' : '◎ AI Synthesis — Find Alignment & Blind Spots'}
            </button>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textDim, marginTop: 8 }}>
              Fill at least 4 fields across participants to unlock synthesis
            </p>
          </div>
        )}

        {/* Synthesis result */}
        {warRoomSynthesis && (
          <div className="slide-in" style={{
            background: 'rgba(255,107,53,0.06)', border: `1px solid ${C.orange}30`,
            borderRadius: 16, padding: 32, marginBottom: 32,
          }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.orange, letterSpacing: '1px', marginBottom: 16 }}>AI SYNTHESIS</div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#E8E8EC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {warRoomSynthesis}
            </div>
          </div>
        )}

        {/* Anonymous Voting / Heat Map */}
        {warRoomParticipants.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '1.5px', color: C.textDim, marginBottom: 16 }}>ANONYMOUS PRIORITY VOTE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {WAR_ROOM_PROMPTS.map(p => {
                const vote = warRoomVotes[p.id];
                return (
                  <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 12 }}>{p.label}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { val: 'critical', label: 'Critical', color: C.red },
                        { val: 'high', label: 'High', color: C.orange },
                        { val: 'medium', label: 'Medium', color: C.yellow },
                        { val: 'low', label: 'Low', color: C.green },
                      ].map(opt => (
                        <button key={opt.val} onClick={() => castVote(p.id, opt.val)} style={{
                          fontFamily: 'JetBrains Mono', fontSize: 10, padding: '4px 10px', borderRadius: 8,
                          border: vote === opt.val ? `1px solid ${opt.color}` : `1px solid ${C.border}`,
                          background: vote === opt.val ? `${opt.color}20` : 'transparent',
                          color: vote === opt.val ? opt.color : C.textDim,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>{opt.label}</button>
                      ))}
                    </div>
                    {/* Heat bar */}
                    <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, transition: 'width 0.4s',
                        width: vote ? (vote === 'critical' ? '100%' : vote === 'high' ? '75%' : vote === 'medium' ? '50%' : '25%') : '0%',
                        background: vote === 'critical' ? C.red : vote === 'high' ? C.orange : vote === 'medium' ? C.yellow : C.green,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );

  /* ═══════════════ SCENARIO SIMULATOR PAGE ═══════════════ */
  const runScenario = useCallback(async () => {
    setScenarioLoading(true);
    try {
      const scenarioDesc = selectedScenario.id === 'custom' ? scenarioCustom : selectedScenario.desc;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'PLACEHOLDER_KEY', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1500,
          messages: [{ role: 'user', content: `You are a senior strategy consultant. The user's role is ${role}. Analyse this what-if scenario:\n\n"${scenarioDesc}"\n\nProvide:\n1. **Immediate Impact (0-30 days)** — what happens first\n2. **Medium-term Cascade (1-6 months)** — second-order effects\n3. **Long-term Position (6-24 months)** — strategic landscape shift\n4. **Resource Requirements** — what you'd need to respond\n5. **Recommended Response** — your top 3 moves, ranked by urgency\n6. **Confidence Level** — how predictable is this outcome (High/Medium/Low) and why\n\nBe specific, quantitative where possible, and direct.` }],
        }),
      });
      const data = await res.json();
      setScenarioResult(data.content?.[0]?.text || 'Unable to model scenario.');
    } catch { setScenarioResult('Scenario modelling failed — check your API key.'); }
    finally { setScenarioLoading(false); }
  }, [selectedScenario, scenarioCustom, role]);

  const scenarioPageJSX = (
    <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
        Scenario Simulator
      </h2>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.textMuted, marginBottom: 40, maxWidth: 600 }}>
        Select a what-if scenario or create your own. AI models the cascading impact on your business with timelines and resource requirements.
      </p>

      {/* Scenario selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 32 }}>
        {SCENARIO_PRESETS.map(s => (
          <div key={s.id} className="card-hover" onClick={() => { setSelectedScenario(s); setScenarioResult(null); }} style={{
            background: selectedScenario?.id === s.id ? 'rgba(255,107,53,0.08)' : C.surface,
            border: `1px solid ${selectedScenario?.id === s.id ? C.orange : C.border}`,
            borderRadius: 14, padding: 20, transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: selectedScenario?.id === s.id ? C.orange : '#fff' }}>{s.label}</span>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Custom scenario input */}
      {selectedScenario?.id === 'custom' && (
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <textarea
            value={scenarioCustom}
            onChange={e => setScenarioCustom(e.target.value)}
            placeholder="Describe your what-if scenario in detail..."
            style={{
              width: '100%', minHeight: 100, padding: 16, borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              color: '#fff', fontSize: 14, fontFamily: 'Inter', lineHeight: 1.6, resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Run button */}
      {selectedScenario && (
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button
            onClick={runScenario}
            disabled={scenarioLoading || (selectedScenario.id === 'custom' && scenarioCustom.length < 20)}
            style={{
              fontFamily: 'Inter', fontWeight: 700, fontSize: 15,
              padding: '14px 40px', borderRadius: 12,
              border: 'none', cursor: scenarioLoading ? 'not-allowed' : 'pointer',
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
              color: '#fff', transition: 'all 0.3s', opacity: scenarioLoading ? 0.6 : 1,
            }}
          >
            {scenarioLoading ? '◎ Modelling...' : '◎ Run AI Scenario Model'}
          </button>
        </div>
      )}

      {/* Result */}
      {scenarioResult && (
        <div className="slide-in" style={{
          background: 'rgba(99,102,241,0.06)', border: `1px solid ${C.purple}30`,
          borderRadius: 16, padding: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.purple, letterSpacing: '1px' }}>SCENARIO MODEL OUTPUT</div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.textDim, background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 8 }}>
              {selectedScenario?.label}
            </span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#E8E8EC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {scenarioResult}
          </div>
        </div>
      )}
    </div>
  );

  /* ═══════════════ BOARD-READY OUTPUT PAGE ═══════════════ */
  const generateBoardDoc = useCallback(async (template) => {
    setBoardLoading(prev => ({ ...prev, [template.id]: true }));
    try {
      const contextSummary = Object.entries(answers).map(([ctxId, fields]) => {
        const entries = Object.entries(fields).filter(([, v]) => v.length > 10).map(([k, v]) => `  ${k}: ${v}`).join('\n');
        return entries ? `[${ctxId}]\n${entries}` : null;
      }).filter(Boolean).join('\n\n');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'PLACEHOLDER_KEY', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 2000,
          messages: [{ role: 'user', content: `You are a senior strategy consultant preparing board-ready documents. The user's role is ${role}.\n\nGenerate a "${template.label}" document in polished, board-ready format.\n\n${contextSummary ? `Context from the user's strategy work:\n${contextSummary}\n\n` : ''}Requirements:\n- Use clear section headers with markdown formatting\n- Be concise but comprehensive — boards value brevity\n- Include specific metrics and timelines where possible\n- Format for a 10-minute board read\n- Include an executive summary at the top\n- End with clear "asks" or "decisions needed"\n\nTemplate: ${template.label} — ${template.desc}` }],
        }),
      });
      const data = await res.json();
      setBoardOutputs(prev => ({ ...prev, [template.id]: data.content?.[0]?.text || 'Generation failed.' }));
    } catch { setBoardOutputs(prev => ({ ...prev, [template.id]: 'Generation failed — check your API key.' })); }
    finally { setBoardLoading(prev => ({ ...prev, [template.id]: false })); }
  }, [answers, role]);

  const exportDoc = (templateId, label) => {
    const text = boardOutputs[templateId];
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const BoardOutputPage = () => (
    <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
        Board-Ready Output
      </h2>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.textMuted, marginBottom: 40, maxWidth: 600 }}>
        One-click generation of polished strategy artifacts. AI pulls from your framework and research inputs to create export-ready board documents.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {BOARD_TEMPLATES.map(t => {
          const output = boardOutputs[t.id];
          const isLoading = boardLoading[t.id];
          return (
            <div key={t.id} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <div>
                    <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#fff' }}>{t.label}</h3>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => generateBoardDoc(t)} disabled={isLoading} style={{
                    flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                    padding: '10px 16px', borderRadius: 10,
                    border: `1px solid ${t.color}40`, background: `${t.color}12`,
                    color: t.color, cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', opacity: isLoading ? 0.5 : 1,
                  }}>
                    {isLoading ? '◎ Generating...' : output ? '↻ Regenerate' : '◎ Generate'}
                  </button>
                  {output && (
                    <button onClick={() => exportDoc(t.id, t.label)} style={{
                      fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                      padding: '10px 16px', borderRadius: 10,
                      border: `1px solid ${C.green}40`, background: `${C.green}12`,
                      color: C.green, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      ↓ Export .md
                    </button>
                  )}
                </div>
              </div>
              {output && (
                <div style={{
                  borderTop: `1px solid ${C.border}`, padding: 24,
                  maxHeight: 320, overflowY: 'auto',
                }}>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#E8E8EC', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {output}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════ DETAIL PAGE (shared for frameworks) ═══════════════ */
  const detailItem = activeFramework;
  const detailBackPage = 'frameworks';
  const detailBackLabel = 'Frameworks';
  const detailSubCount = detailItem ? getSubmittedCount(detailItem.id, detailItem.fields) : 0;
  const detailTotal = detailItem ? detailItem.fields.length : 1;
  const detailIsComplete = detailSubCount === detailTotal;
  const detailPct = Math.round((detailSubCount / detailTotal) * 100);

  const detailPageJSX = detailItem ? (
      <div style={{ minHeight: '100vh' }}>
        {/* Sub-header */}
        <div style={{
          background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '10px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(detailBackPage)} style={{
              fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: C.textMuted,
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
              padding: '5px 14px', cursor: 'pointer',
            }}>← {detailBackLabel}</button>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: C.textDim }}>{detailItem.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, background: 'rgba(255,255,255,0.04)', color: C.textMuted, padding: '3px 10px', borderRadius: 12 }}>
              {detailSubCount}/{detailTotal} submitted
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, background: 'rgba(255,107,53,0.08)', color: C.orange, padding: '3px 10px', borderRadius: 12 }}>
              {role}
            </span>
          </div>
        </div>
        {/* Progress */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ height: '100%', width: `${detailPct}%`, background: detailItem.color, transition: 'width 0.5s' }} />
        </div>

        {/* Content */}
        <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 32px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {detailItem.icon && <span style={{ fontSize: 28 }}>{detailItem.icon}</span>}
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>{detailItem.name}</h2>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
            {detailItem.description || detailItem.summary}
          </p>
          <div style={{
            background: 'rgba(255,107,53,0.04)', border: `1px solid rgba(255,107,53,0.1)`,
            borderRadius: 12, padding: 16, marginBottom: 32,
          }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.orange, letterSpacing: '1.5px', marginBottom: 8 }}>HOW THIS WORKS</div>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Write your strategic thinking in each field. After 40+ characters, an AI coach will challenge your assumptions. Submit when confident — peer benchmarks unlock only after submission.
            </p>
          </div>

          {/* Fields */}
          {detailItem.fields.map((field, i) => (
            <FieldCard
              key={field.id}
              field={field}
              ctxId={detailItem.id}
              ctxName={detailItem.name}
              color={detailItem.color}
              answer={getAnswer(detailItem.id, field.id)}
              isFieldSubmitted={isSubmitted(detailItem.id, field.id)}
              setAnswer={setAnswer}
              submitField={submitField}
              coachText={coaching[field.id] || ''}
              isLoading={loading[field.id] || false}
              fetchCoaching={fetchCoaching}
              role={role}
              delay={i}
              expandedPeers={expandedPeers}
              setExpandedPeers={setExpandedPeers}
              exId={detailItem.id}
            />
          ))}

          {/* Completion */}
          {detailIsComplete && (
            <div className="fade-up" style={{
              background: `linear-gradient(135deg, ${detailItem.color}0D, rgba(255,107,53,0.06))`,
              border: `1px solid ${detailItem.color}22`, borderRadius: 14, padding: 32,
              textAlign: 'center', marginTop: 24,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
              <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Exercise Complete</h3>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 20px' }}>
                All answers submitted. Peer benchmarks are now unlocked above. Your responses have been anonymised and added to the peer pool.
              </p>
              <button onClick={() => navigate(detailBackPage)} style={{
                fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
                padding: '10px 24px', borderRadius: 20,
                background: C.orange, color: '#fff', border: 'none',
                cursor: 'pointer',
              }}>Back to {detailBackLabel}</button>
            </div>
          )}
        </div>
      </div>
  ) : null;

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <>
      {navJSX}
      {page === 'home' && <HomePage />}
      {page === 'frameworks' && <FrameworksPage />}
      {page === 'framework-detail' && detailPageJSX}
      {page === 'research' && <ResearchPage />}
      {page === 'research-detail' && <ResearchDetailPage />}
      {page === 'war-room' && warRoomPageJSX}
      {page === 'scenarios' && scenarioPageJSX}
      {page === 'board-output' && <BoardOutputPage />}
    </>
  );
}

/* ═══════════════════════════════════
   FIELD CARD COMPONENT
   ═══════════════════════════════════ */

function FieldCard({ field, ctxId, ctxName, color, answer, isFieldSubmitted, setAnswer, submitField, coachText, isLoading, fetchCoaching, role, delay, expandedPeers, setExpandedPeers, exId }) {
  const debounceRef = useRef(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setAnswer(ctxId, field.id, val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 40) {
      debounceRef.current = setTimeout(() => {
        fetchCoaching(ctxName, field.label, field.id, val, role);
      }, 1800);
    }
  }, [ctxId, field.id, field.label, ctxName, setAnswer, fetchCoaching, role]);

  const peers = PEER_ANSWERS[field.id] || [];
  const showSubmitBtn = answer.length >= 5 && !isFieldSubmitted;
  const peerExpanded = expandedPeers[field.id] || false;
  const synthesis = AI_SYNTHESIS[exId];

  return (
    <div className="fade-up" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 22, marginBottom: 14,
      transition: 'border-color 0.3s',
      borderColor: isFieldSubmitted ? `${color}33` : C.border,
      animationDelay: `${delay * 0.05}s`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isFieldSubmitted ? color : '#333', transition: 'background 0.3s' }} />
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#fff' }}>{field.label}</span>
        {isFieldSubmitted && (
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: color, background: `${color}15`, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.5px' }}>✓ SUBMITTED</span>
        )}
      </div>

      {/* Prompt */}
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 12 }}>{field.prompt}</p>

      {/* Textarea */}
      <textarea
        value={answer}
        onChange={handleChange}
        disabled={isFieldSubmitted}
        placeholder={field.placeholder}
        style={{
          width: '100%', minHeight: 100, padding: 14, borderRadius: 10,
          background: isFieldSubmitted ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          color: isFieldSubmitted ? C.textDim : C.text,
          fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6,
          resize: 'vertical', transition: 'all 0.2s',
        }}
      />

      {/* AI Coaching */}
      {(isLoading || coachText) && !isFieldSubmitted && (
        <div style={{
          marginTop: 12, padding: 14, borderRadius: 10,
          background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 10, color: C.orange,
            letterSpacing: '1px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ◎ AI COACH
            {isLoading && (
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: C.orange, animation: `pulse 1s ease-in-out ${i*0.2}s infinite`, display: 'inline-block' }} />
                ))}
              </span>
            )}
          </div>
          {!isLoading && coachText && (
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#bb8855', lineHeight: 1.6 }}>{coachText}</p>
          )}
        </div>
      )}

      {/* Submit */}
      {showSubmitBtn && (
        <button onClick={() => submitField(ctxId, field.id)} style={{
          marginTop: 12, fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
          padding: '8px 22px', borderRadius: 20,
          background: C.orange, color: '#fff', border: 'none',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>Submit Answer</button>
      )}

      {/* Peer Benchmarks */}
      <div style={{ marginTop: 16 }}>
        {!isFieldSubmitted ? (
          <div style={{ border: `1px dashed ${C.border}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: C.textDim }}>{answer.length < 5 ? `Type at least 5 characters to submit (${answer.length}/5)` : 'Submit your answer to unlock peer benchmarks'}</p>
          </div>
        ) : peers.length > 0 ? (
          <div>
            <button onClick={() => setExpandedPeers(prev => ({...prev, [field.id]: !peerExpanded}))} style={{
              fontFamily: 'JetBrains Mono', fontSize: 10, color: C.textMuted, letterSpacing: '0.5px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            }}>
              <span style={{ transform: peerExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▸</span>
              PEER BENCHMARKS ({peers.length})
            </button>
            {peerExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {peers.map((peer, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.01)', borderLeft: `3px solid ${color}`,
                    borderRadius: '0 10px 10px 0', padding: 14,
                  }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: color, letterSpacing: '0.5px', marginBottom: 6 }}>{peer.label}</div>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{peer.text}</p>
                  </div>
                ))}
                {synthesis && (
                  <div style={{ background: 'rgba(255,107,53,0.03)', border: '1px solid rgba(255,107,53,0.08)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: C.orange, letterSpacing: '1px', marginBottom: 6 }}>◎ AI SYNTHESIS</div>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{synthesis}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ border: `1px dashed ${C.border}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: C.textDim }}>Peer benchmarks coming soon for this exercise</p>
          </div>
        )}
      </div>
    </div>
  );
}
