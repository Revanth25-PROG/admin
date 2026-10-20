import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Clock,
  Award,
  CheckCircle2,
  Bookmark,
  Save,
  Send,
  Download,
  Printer,
  Sparkles,
  HelpCircle,
  Eye,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface MainsQuestion {
  id: string;
  paper: string;
  subjectName: string;
  topicName: string;
  questionText: string;
  questionTextTelugu?: string;
  marks: number;
  wordLimit: number;
  timeLimitMinutes: number;
  rubric: {
    intro: string;
    body: string;
    apDimension: string;
    conclusion: string;
  };
  modelAnswer: string;
}

const SAMPLE_MAINS_QUESTIONS: MainsQuestion[] = [
  {
    id: 'mains-q1',
    paper: 'Paper I - Section A (75M)',
    subjectName: 'Social and Cultural History of AP',
    topicName: 'Satavahanas & Trade Guilds',
    questionText: 'Analyze the socio-economic conditions of Andhradesa under the Satavahanas with special reference to trade guilds (Srenis) and maritime trade. How did Buddhist monasteries contribute to urbanization?',
    questionTextTelugu: 'శాతవాహనుల కాలం నాటి సామాజిక-ఆర్థిక పరిస్థితులను శ్రేణులు మరియు విదేశీ వాణిజ్యాల ఆధారంగా విశ్లేషించండి. పట్టణీకరణకు బౌద్ధ విహారాలు ఏ విధంగా దోహదపడ్డాయి?',
    marks: 15,
    wordLimit: 250,
    timeLimitMinutes: 15,
    rubric: {
      intro: 'Brief introduction about Satavahana rule (230 BCE - 220 CE), geographical extent, and sources like Periplus of the Erythraean Sea.',
      body: 'Role of Srenis (goldsmiths, weavers, potters), coin currency (Karshapanas), Roman gold coin hoards, ports like Motupalli, Ghantasala.',
      apDimension: 'Impact on Amaravati, Nagarjunakonda, Jaggayyapeta urban growth through merchant donations (Upasakas).',
      conclusion: 'Synthesis of how cultural syncretism between Buddhism, trade, and royal patronage created a resilient Deccan civilization.',
    },
    modelAnswer: `### Introduction
The Satavahana dynasty (circa 3rd Century BCE to 3rd Century CE) laid the foundational infrastructure for urban culture and maritime commerce in Andhradesa. Classical Greek and Roman accounts, notably the *Periplus of the Erythraean Sea* and Ptolemy's Geography, corroborate the flourishing commercial landscape.

### 1. The Dynamic Role of Trade Guilds (Srenis)
- **Guild Autonomy & Specialization**: Inscriptions at Nasik and Amaravati reveal specialized corporate bodies of artisans: *Kularika* (potters), *Tilapisaka* (oil pressers), and *Dhamnika* (corn merchants).
- **Banking & Religious Endowments**: Srenis functioned as ancient banks accepting permanent deposits (*Akshayanivi*) on which regular interest was paid to support Buddhist monks.
- **Monetary Economy**: Extensive circulation of lead, potin, copper, and silver coins (*Karshapanas*) featuring maritime ship symbols issued by rulers like Yajna Sri Satakarni.

### 2. Maritime Trade & Ports of Andhradesa
- **Port Infrastructure**: Key maritime hubs on the Coromandel coast included Ghantasala, Maisolia (Machilipatnam), Motupalli, and Salihundam.
- **Commodity Flow**: Export of fine muslin, spices, and precious stones to Rome in exchange for Roman gold/silver denarii, wine amphorae, and fine pottery.

### 3. Buddhist Monasteries as Catalysts for Urbanization
- Monasteries (*Viharas* and *Chaityas*) were strategically built along primary caravan trade routes connecting inland capitals like Kotilingala and Dhanyakataka (Dharanikota) to coastal emporia.
- Generous endowments by prosperous merchant guilds (*Nigamas*) transformed monastic centers into dynamic consumption hubs, stimulating local crafts and market townships.

### Conclusion
The synergistic interdependence of autonomous trade guilds, maritime commercial expansion, and monastic institutions under Satavahana rule catalyzed the first wave of comprehensive urbanization in the Deccan.`,
  },
  {
    id: 'mains-q2',
    paper: 'Paper I - Section B (75M)',
    subjectName: 'General Overview of Indian Constitution',
    topicName: 'High Court Writ Jurisdiction vs Article 32',
    questionText: 'Compare and contrast the writ jurisdiction of the Supreme Court under Article 32 and High Courts under Article 226 of the Constitution of India. Why is Article 226 considered wider in scope?',
    questionTextTelugu: 'ఆర్టికల్ 32 ప్రకారం సుప్రీంకోర్టు మరియు ఆర్టికల్ 226 ప్రకారం హైకోర్టుల రిట్ పరిధిని పోల్చి విశ్లేషించండి. ఆర్టికల్ 226 పరిధి ఎందుకు విస్తృతమైనదిగా పరిగణించబడుతుంది?',
    marks: 15,
    wordLimit: 250,
    timeLimitMinutes: 15,
    rubric: {
      intro: 'Define the constitutional writ mechanism as a cornerstone of judicial review ensuring rule of law.',
      body: 'Tabular / point comparison of Art 32 (Fundamental Right itself) vs Art 226 (Constitutional Remedy).',
      apDimension: 'Territorial vs subject-matter scope: Fundamental rights only vs "for any other purpose" (legal rights).',
      conclusion: 'Chandra Kumar (1997) precedent confirming both jurisdictions as untouchable basic structure.',
    },
    modelAnswer: `### Introduction
The writ jurisdiction under Articles 32 and 226 constitutes the primary constitutional safeguard enabling the higher judiciary to preserve the rule of law and protect individuals against administrative overreach. Dr. B.R. Ambedkar famously characterized Article 32 as the "heart and soul of the Constitution."

### Comparative Analysis: Article 32 vs Article 226

| Dimension | Supreme Court (Article 32) | High Courts (Article 226) |
|---|---|---|
| **Nature of Right** | A Fundamental Right in itself (Part III) | A Constitutional discretionary remedy (Part VI) |
| **Subject Matter Scope** | Enforcement of **Fundamental Rights only** | Enforcement of **Fundamental Rights AND "for any other purpose"** (ordinary legal rights) |
| **Territorial Scope** | Entire territory of India | Restricted to the state territory or where the cause of action arises |
| **Obligation** | The Supreme Court cannot refuse relief where a Fundamental Right is violated | The High Court retains equitable discretion to relegate the petitioner to alternative statutory remedies |

### Why Article 226 is Wider in Scope
1. **Subject Matter Breadth**: While the Supreme Court is strictly confined to Part III violations under Article 32, a High Court under Article 226 can remedy violations of statutory rights, contractual rights, and common law obligations.
2. **Administrative Fairness**: Citizens can challenge arbitrary executive actions, illegal tender rejections, or municipal overreach under Article 226 even where no fundamental right is infringed.

### Conclusion
In *L. Chandra Kumar v. Union of India (1997)*, the Supreme Court ruled that the power of judicial review under both Articles 32 and 226 is an integral part of the Basic Structure of the Constitution and cannot be abrogated even by constitutional amendment.`,
  },
  {
    id: 'mains-q3',
    paper: 'Paper II - Section A (75M)',
    subjectName: 'Indian and AP Economy',
    topicName: 'Fiscal Deficit & AP State Debt',
    questionText: 'Examine the fiscal position of Andhra Pradesh in the post-bifurcation era. What structural challenges impact state revenues, and how can capital expenditure be sustainably revitalized?',
    questionTextTelugu: 'రాష్ట్ర విభజనానంతరం ఆంధ్రప్రదేశ్ ఆర్థిక స్థితిగతులను మరియు ఆదాయ సవాళ్లను పరిశీలించండి. మూలధన వ్యయాన్ని ఏ విధంగా పునరుద్ధరించవచ్చు?',
    marks: 15,
    wordLimit: 250,
    timeLimitMinutes: 15,
    rubric: {
      intro: 'Post-2014 reorganization fiscal baseline (loss of Hyderabad revenue engine, debt allocation formula).',
      body: 'Revenue deficit persistence, high revenue expenditure on welfare transfers, borrowing limits under FRBM.',
      apDimension: 'Capital expenditure squeeze: Polavaram, Amaravati, port-led development corridors.',
      conclusion: 'Actionable policy recommendations balancing welfare delivery with asset-creating capital investments.',
    },
    modelAnswer: `### Introduction
The bifurcation of Andhra Pradesh in 2014 altered the state's fiscal architecture. While the residual state inherited approximately 58% of the population and debt, it received only 46% of combined revenues due to the loss of Hyderabad's commercial tax engine.

### 1. Structural Fiscal Challenges
- **Persistent Revenue Deficit**: Ongoing revenue expenditure demands (salaries, pensions, and welfare entitlements) consume nearly 85% of total revenue receipts.
- **Debt-to-GSDP Ratio**: The state's debt burden has hovered around 33-35% of GSDP, exceeding the recommended 15th Finance Commission trajectory (20-25%).
- **Low Own Tax Revenue (OTR)**: High reliance on central devolution and GST compensation cess phase-out has constrained fiscal maneuverability.

### 2. Impact on Capital Expenditure
Capital expenditure creates long-term physical and social assets. Heavy committed expenditures have historically crowded out capital outlays for:
- Irrigation projects (Polavaram National Project, Rayalaseema lift irrigation).
- Greenfield non-major port infrastructure (Ramayapatnam, Machilipatnam, Bhavanapadu).
- Industrial corridor infrastructure along the Visakhapatnam-Chennai Industrial Corridor (VCIC).

### 3. Policy Roadmap for Sustainable Fiscal Revitalization
1. **Asset Monetization**: Unlock state-owned land parcels and brownfield logistics assets through transparent PPP frameworks.
2. **Port-Led Industrial Corridors**: Leverage the state's 974 km coastline by offering plug-and-play industrial estates to attract manufacturing FDI.
3. **Targeted Subsidies**: Rationalize untargeted subsidies through biometric Direct Benefit Transfer (DBT) to reduce fiscal leakage.

### Conclusion
Balancing social security commitments with productive capital creation is imperative for Andhra Pradesh to regain double-digit GSDP growth while maintaining fiscal sustainability.`,
  },
];

export const MainsWorkspacePage: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<MainsQuestion>(SAMPLE_MAINS_QUESTIONS[0]);
  const [answerText, setAnswerText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(selectedQuestion.timeLimitMinutes * 60);
  const [isSaved, setIsSaved] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showRubric, setShowRubric] = useState(true);
  const [checklist, setChecklist] = useState({
    introClear: false,
    headingsUsed: false,
    apDimensionsCovered: false,
    statsSchemesCited: false,
    withinWordLimit: false,
  });

  // Calculate live word count
  const wordCount = useMemo(() => {
    return answerText.trim() === '' ? 0 : answerText.trim().split(/\s+/).length;
  }, [answerText]);

  // Handle question switch
  const handleSelectQuestion = (q: MainsQuestion) => {
    setSelectedQuestion(q);
    setAnswerText('');
    setSecondsRemaining(q.timeLimitMinutes * 60);
    setIsTimerRunning(false);
    setShowModelAnswer(false);
    setIsSaved(false);
    setChecklist({
      introClear: false,
      headingsUsed: false,
      apDimensionsCovered: false,
      statsSchemesCited: false,
      withinWordLimit: false,
    });
  };

  // Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSubmitAnswer = () => {
    setIsTimerRunning(false);
    setShowModelAnswer(true);
    alert('Answer submitted! Compare your draft with the official Model Answer and Evaluation Rubric below.');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
              Mains Practice Engine (300 Marks Scheme)
            </span>
            <Badge variant="blue">Paper I & Paper II</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Mains Answer-Writing Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Write structured descriptive answers, track word-count limits, and evaluate against official APPSC model rubrics.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print Answer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => {
              const blob = new Blob([answerText], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mains-answer-${selectedQuestion.id}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Markdown
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Selection & Instructions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-[#101726]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-violet-400" />
                <CardTitle className="text-xs uppercase tracking-wider text-slate-300">
                  Select Question Prompt
                </CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-2">
              {SAMPLE_MAINS_QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedQuestion.id === q.id
                      ? 'bg-violet-600/15 border-violet-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-violet-400">{q.paper}</span>
                    <span>{q.marks} Marks • {q.wordLimit} Words</span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed font-normal">
                    {q.questionText}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Rubric Card */}
          <Card className="bg-[#101726]">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-amber-400" />
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-300">
                    Evaluation Rubric (15M)
                  </CardTitle>
                </div>
                <button
                  onClick={() => setShowRubric(!showRubric)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  {showRubric ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </CardHeader>

            {showRubric && (
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <span className="font-bold text-blue-400 block mb-0.5">1. Introduction (3M):</span>
                  <span className="text-slate-400 text-[11px]">{selectedQuestion.rubric.intro}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <span className="font-bold text-emerald-400 block mb-0.5">2. Core Body & Arguments (6M):</span>
                  <span className="text-slate-400 text-[11px]">{selectedQuestion.rubric.body}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <span className="font-bold text-amber-400 block mb-0.5">3. Andhra Pradesh Nuance (3M):</span>
                  <span className="text-slate-400 text-[11px]">{selectedQuestion.rubric.apDimension}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <span className="font-bold text-violet-400 block mb-0.5">4. Conclusion & Synthesis (3M):</span>
                  <span className="text-slate-400 text-[11px]">{selectedQuestion.rubric.conclusion}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Self-Assessment Checklist */}
          <Card className="bg-[#101726]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-teal-400" />
                <CardTitle className="text-xs uppercase tracking-wider text-slate-300">
                  Self-Assessment Checklist
                </CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-2 text-xs">
              {[
                { key: 'introClear', label: 'Crisp introductory contextual framing' },
                { key: 'headingsUsed', label: 'Clear sub-headings and bullet structures' },
                { key: 'apDimensionsCovered', label: 'Addressed Andhra Pradesh regional dimensions' },
                { key: 'statsSchemesCited', label: 'Cited official statistics / government schemes' },
                { key: 'withinWordLimit', label: 'Strict adherence to prescribed word limit' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 cursor-pointer text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="rounded bg-slate-950 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Writing Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-[#101726]">
            {/* Question Details Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="font-bold text-violet-400 uppercase tracking-wider">
                  {selectedQuestion.subjectName} • {selectedQuestion.topicName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Target: <strong className="text-white">{selectedQuestion.wordLimit} Words</strong></span>
                  <span className="text-slate-400">Marks: <strong className="text-white">{selectedQuestion.marks}M</strong></span>
                </div>
              </div>

              <h2 className="text-sm md:text-base font-bold text-white leading-relaxed">
                {selectedQuestion.questionText}
              </h2>

              {selectedQuestion.questionTextTelugu && (
                <p className="text-xs text-blue-300 font-telugu leading-relaxed">
                  {selectedQuestion.questionTextTelugu}
                </p>
              )}
            </div>

            {/* Writing Controls Bar */}
            <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs flex-wrap gap-2">
              {/* Word Count Progress */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-400">Word Count:</span>
                  <span
                    className={`font-bold ${
                      wordCount > selectedQuestion.wordLimit
                        ? 'text-rose-400'
                        : wordCount >= selectedQuestion.wordLimit * 0.8
                        ? 'text-emerald-400'
                        : 'text-white'
                    }`}
                  >
                    {wordCount} / {selectedQuestion.wordLimit}
                  </span>
                </div>
                {wordCount > selectedQuestion.wordLimit && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1">
                    <AlertTriangle size={12} /> Exceeds word limit
                  </span>
                )}
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2">
                <Clock size={14} className={isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
                <span className="font-mono text-xs font-bold text-white">
                  {formatTimer(secondsRemaining)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  {isTimerRunning ? 'Pause' : 'Start Timer'}
                </Button>
              </div>
            </div>

            {/* Answer Text Area */}
            <div className="mt-3">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Compose your structured descriptive answer here... Begin with a crisp introduction, construct logical thematic sub-headings, integrate relevant statutory/constitutional articles or economic data, and synthesize with a forward-looking conclusion."
                rows={16}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Save size={14} />}
                  onClick={handleSaveDraft}
                >
                  {isSaved ? 'Draft Saved ✓' : 'Save Draft'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size={14} />}
                  onClick={() => {
                    if (window.confirm('Clear answer workspace?')) {
                      setAnswerText('');
                    }
                  }}
                  className="text-slate-400 hover:text-rose-300"
                >
                  Reset
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Eye size={14} />}
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer ? 'Hide Model Answer' : 'View Model Answer'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send size={14} />}
                  disabled={wordCount === 0}
                  onClick={handleSubmitAnswer}
                >
                  Submit for Evaluation
                </Button>
              </div>
            </div>
          </Card>

          {/* Model Answer Showcase */}
          {showModelAnswer && (
            <Card className="bg-[#101726] border-violet-500/30">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" />
                    <CardTitle className="text-xs uppercase tracking-wider text-violet-300">
                      Standard Official Model Answer
                    </CardTitle>
                  </div>
                  <Badge variant="emerald">Verified APPSC Format</Badge>
                </div>
              </CardHeader>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 prose prose-invert max-w-none text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedQuestion.modelAnswer}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
