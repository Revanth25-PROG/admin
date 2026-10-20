import React, { useState, useMemo } from 'react';
import {
  Globe,
  Calendar,
  Award,
  Search,
  Filter,
  Bookmark,
  Share2,
  Play,
  TrendingUp,
  Tag,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

interface CurrentAffairsArticle {
  id: string;
  category: 'ap_state' | 'national' | 'schemes' | 'economy' | 'science_env' | 'international';
  date: string;
  title: string;
  titleTelugu?: string;
  summary: string;
  summaryTelugu?: string;
  keyExamFacts: string[];
  apRelevance: string;
  sampleQuestion?: {
    q: string;
    options: string[];
    ans: string;
    exp: string;
  };
  tags: string[];
}

const SAMPLE_CURRENT_AFFAIRS: CurrentAffairsArticle[] = [
  {
    id: 'ca-2026-10-1',
    category: 'ap_state',
    date: '2026-10-18',
    title: 'AP Cabinet Approves Industrial Development Policy 2024-29 with "Speed of Doing Business" Framework',
    titleTelugu: 'ఆంధ్రప్రదేశ్ నూతన పారిశ్రామిక విధానం 2024-29 ఆమోదం: స్పీడ్ ఆఫ్ డూయింగ్ బిజినెస్ అమలు',
    summary: 'The Government of Andhra Pradesh notified its flagship Industrial Development Policy focusing on 10 priority sectors including green hydrogen, defense electronics, aerospace, and food processing.',
    summaryTelugu: 'రాష్ట్రంలో పెట్టుబడుల ఆకర్షణకు సింగిల్ విండో అనుమతులు, మౌలిక వసతుల కల్పన మరియు 10 ప్రాధాన్యత రంగాల గుర్తింపుతో నూతన విధానాన్ని ఆమోదించారు.',
    keyExamFacts: [
      'Focus sectors: Green Energy, Electric Mobility, Electronics System Design & Manufacturing (ESDM).',
      'Special fiscal incentives for women entrepreneurs and SC/ST industrial ventures.',
      'Target: Attract Rs 10 lakh crore investments and generate 20 lakh private sector jobs over 5 years.',
    ],
    apRelevance: 'Directly relevant to APPSC Group 2 Prelims (AP Economy) and Mains Paper II (Industrial Growth).',
    sampleQuestion: {
      q: 'Under the AP Industrial Development Policy 2024-29, which of the following is designated as the core governance framework for investor approvals?',
      options: ['A) Single Door clearances', 'B) Speed of Doing Business (SoDB)', 'C) Fast Track AP', 'D) Ease of Capital AP'],
      ans: 'B',
      exp: 'The policy shifts focus from traditional Ease of Doing Business (EoDB) to "Speed of Doing Business (SoDB)" guaranteeing time-bound clearances.',
    },
    tags: ['AP Economy', 'Industrial Policy 2024-29', 'SoDB', 'Investments'],
  },
  {
    id: 'ca-2026-10-2',
    category: 'schemes',
    date: '2026-10-15',
    title: 'PM-DevINE & National Green Hydrogen Mission Progress Report 2026',
    titleTelugu: 'జాతీయ గ్రీన్ హైడ్రోజన్ మిషన్ పురోగతి: విశాఖపట్నం ఎగుమతి హబ్‌గా గుర్తింపు',
    summary: 'Union Ministry of New and Renewable Energy announced the commissioning of the country’s largest green hydrogen electrolyzer plant in the coastal SEZ corridor of Andhra Pradesh.',
    summaryTelugu: 'ఆంధ్రప్రదేశ్ తీరప్రాంతాన్ని గ్రీన్ హైడ్రోజన్ ఎగుమతి కేంద్రంగా అభివృద్ధి చేసేందుకు కేంద్ర ప్రభుత్వం ప్రత్యేక నిధులను కేటాయించింది.',
    keyExamFacts: [
      'National Target: 5 MMT annual green hydrogen production by 2030.',
      'Strategic Interventions for Green Hydrogen Transition (SIGHT) program subsidies.',
      'Visakhapatnam & Kakinada identified as National Green Hydrogen Hubs.',
    ],
    apRelevance: 'Crucial for General Science, Environment, and AP Regional Infrastructure questions.',
    sampleQuestion: {
      q: 'Which coastal ports in Andhra Pradesh have been identified under the National Green Hydrogen Mission for dedicated green ammonia bunkering and exports?',
      options: ['A) Krishnapatnam and Bhavanapadu', 'B) Visakhapatnam and Kakinada', 'C) Machilipatnam and Nizampatnam', 'D) Gangavaram and Vadarevu'],
      ans: 'B',
      exp: 'Visakhapatnam and Kakinada possess existing deep-water logistics making them ideal for the National Green Hydrogen & Ammonia export hubs.',
    },
    tags: ['Green Hydrogen', 'MNRE', 'Renewables', 'AP Infrastructure'],
  },
  {
    id: 'ca-2026-10-3',
    category: 'national',
    date: '2026-10-12',
    title: 'Supreme Court 7-Judge Constitution Bench Clarifies Sub-classification of Scheduled Castes',
    titleTelugu: 'ఎస్సీ వర్గీకరణపై సుప్రీంకోర్టు 7-న్యాయమూర్తుల రాజ్యాంగ ధర్మాసనం చరిత్రాత్మక తీర్పు',
    summary: 'In State of Punjab v. Davinder Singh (2024/2026), the Supreme Court ruled that State legislatures have the power to create sub-classifications within Scheduled Castes for affirmative action.',
    summaryTelugu: 'ఎస్సీ రిజర్వేషన్లలో అత్యంత వెనుకబడిన వర్గాలకు ప్రాధాన్యత కల్పించేందుకు ఉప-వర్గీకరణ చేసే అధికారం రాష్ట్రాలకు ఉంటుందని సుప్రీంకోర్టు స్పష్టం చేసింది.',
    keyExamFacts: [
      'Overruled previous 5-judge bench decision in E.V. Chinnaiah v. State of Andhra Pradesh (2004).',
      'Articles 14, 15(4), 16(4), and 341 of the Constitution interpreted.',
      'Requires empirical data on backwardness; creamy layer exclusion criteria highlighted.',
    ],
    apRelevance: 'High yield for APPSC Polity & Governance, Indian Society, and Historical AP Commission background.',
    sampleQuestion: {
      q: 'Which landmark 2004 judgment regarding SC sub-classification was recently revisited and overruled by the 7-judge Constitution bench of the Supreme Court?',
      options: ['A) Indira Sawhney v. Union of India', 'B) E.V. Chinnaiah v. State of Andhra Pradesh', 'C) M. Nagaraj v. Union of India', 'D) Jarnail Singh v. Lachhmi Narain'],
      ans: 'B',
      exp: 'The 7-judge bench overruled E.V. Chinnaiah (2004), holding that sub-classification does not tamper with the Presidential list under Article 341.',
    },
    tags: ['Polity', 'Supreme Court', 'Sub-classification', 'Article 341'],
  },
  {
    id: 'ca-2026-10-4',
    category: 'economy',
    date: '2026-10-08',
    title: 'RBI Monetary Policy Committee Maintains Repo Rate at 6.50% with Neutral Stance',
    titleTelugu: 'ఆర్బీఐ ద్రవ్య పరపతి విధానం: రెపో రేటు 6.50% వద్ద యథాతథం',
    summary: 'The Monetary Policy Committee voted to adjust the monetary policy stance from "withdrawal of accommodation" to "neutral", reflecting balanced inflation and growth dynamics.',
    summaryTelugu: 'ద్రవ్యోల్బణ నియంత్రణ మరియు ఆర్థిక వృద్ధికి సమతుల్యత కల్పిస్తూ ఆర్బీఐ రెపో రేటును యథాతథంగా కొనసాగించింది.',
    keyExamFacts: [
      'Policy Repo Rate: 6.50%; Standing Deposit Facility (SDF): 6.25%; Marginal Standing Facility (MSF): 6.75%.',
      'Target Headline Inflation: 4.0% (+/- 2% tolerance band) under Section 45ZA of RBI Act 1934.',
      'FY27 Real GDP growth forecast projected at 7.2%.',
    ],
    apRelevance: 'Core topic for APPSC Prelims Group 4 and Mains Paper II Economy.',
    sampleQuestion: {
      q: 'What is the statutory inflation target band mandated to the Reserve Bank of India under Section 45ZA of the RBI Act?',
      options: ['A) 3% with +/- 1%', 'B) 4% with +/- 2%', 'C) 5% with +/- 1.5%', 'D) 2% to 6% floating'],
      ans: 'B',
      exp: 'The flexible inflation targeting framework mandates 4.0% with a tolerance band of +/- 2% (2% to 6%).',
    },
    tags: ['RBI', 'Repo Rate', 'Monetary Policy', 'Inflation Target'],
  },
];

export const CurrentAffairsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'ap_state', label: 'Andhra Pradesh Affairs' },
    { id: 'national', label: 'National & Polity' },
    { id: 'schemes', label: 'Government Schemes' },
    { id: 'economy', label: 'Economy & Banking' },
    { id: 'science_env', label: 'Science & Environment' },
  ];

  const filteredArticles = useMemo(() => {
    return SAMPLE_CURRENT_AFFAIRS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Exam Intelligence
            </span>
            <Badge variant="blue">Date-Grounded & Updateable</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Current Affairs & Government Schemes Centre
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            High-yield national and Andhra Pradesh developments cross-mapped with official APPSC Group 2 syllabus topics.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Play size={16} />}
          onClick={() => navigate('/mock-tests')}
        >
          Take Current Affairs Quiz (30M)
        </Button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search current affairs topics..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <EmptyState
            icon={<Globe size={24} />}
            title="No current affairs articles found"
            description="Try modifying your keyword search or category filter."
            actionLabel="Show All Updates"
            onAction={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredArticles.map((article) => {
            const isQuizOpen = expandedQuizId === article.id;

            return (
              <Card key={article.id} className="bg-[#101726] border-slate-800 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold">
                        <Calendar size={12} />
                        {article.date}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        {article.category === 'ap_state' ? 'Andhra Pradesh' : article.category.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-[11px] text-blue-300 font-medium">
                      📌 {article.apRelevance}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-white leading-relaxed">
                      {article.title}
                    </h2>
                    {article.titleTelugu && (
                      <p className="text-xs text-amber-300/90 font-telugu mt-0.5">
                        {article.titleTelugu}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Key Exam Facts Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
                      🎯 High-Yield Exam Takeaways (Prelims & Mains Grounding):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {article.keyExamFacts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags & Quiz Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag size={12} className="text-slate-500" />
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {article.sampleQuestion && (
                      <Button
                        variant={isQuizOpen ? 'outline' : 'secondary'}
                        size="sm"
                        icon={<Sparkles size={14} />}
                        onClick={() => setExpandedQuizId(isQuizOpen ? null : article.id)}
                      >
                        {isQuizOpen ? 'Hide Practice MCQ' : 'Solve Practice MCQ'}
                      </Button>
                    )}
                  </div>

                  {/* Expanded Practice MCQ Box */}
                  {isQuizOpen && article.sampleQuestion && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                          Practice Exam Question:
                        </span>
                        <Badge variant="blue">1.0 Mark (-0.33 Negative)</Badge>
                      </div>

                      <p className="font-bold text-white leading-relaxed">
                        {article.sampleQuestion.q}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {article.sampleQuestion.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border text-xs ${
                              opt.startsWith(article.sampleQuestion!.ans)
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                        <strong className="text-emerald-400">Answer Explanation: </strong>
                        {article.sampleQuestion.exp}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
