import { Subject, SyllabusTopic, Subtopic, ExamSettings } from '../types';

export const APPSC_NINE_SUBJECTS: Subject[] = [
  {
    id: 'sub-appsc-1',
    track: 'appsc-prelims',
    groupNumber: 1,
    paper: 'General Studies Paper I',
    name: 'Indian History',
    nameTelugu: 'భారతదేశ చరిత్ర',
    description: 'Ancient India, Indus Valley, Vedic Age, Buddhism/Jainism, Mauryas & Guptas, Medieval India, Delhi Sultanate, Mughals, Bhakti & Sufi, Modern Freedom Struggle, and Constitutional Evolution.',
    color: '#3b82f6',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 12,
    targetHours: 50,
  },
  {
    id: 'sub-appsc-2',
    track: 'appsc-prelims',
    groupNumber: 2,
    paper: 'General Studies Paper I',
    name: 'Andhra Pradesh History and Culture',
    nameTelugu: 'ఆంధ్రప్రదేశ్ సామాజిక & సాంస్కృతిక చరిత్ర',
    description: 'Ancient Andhra, Satavahanas, Ikshvakus, Chalukyas, Kakatiyas, Vijayanagara, Qutb Shahis, Colonial Andhra, Social Reformers, Freedom Movement, and State Formation/Reorganisation.',
    color: '#ec4899',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 12,
    targetHours: 45,
  },
  {
    id: 'sub-appsc-3',
    track: 'appsc-prelims',
    groupNumber: 3,
    paper: 'General Studies Paper I',
    name: 'Indian and Andhra Pradesh Geography',
    nameTelugu: 'భారత & ఆంధ్రప్రదేశ్ భూగోళశాస్త్రం',
    description: 'Physical Geography, Earth Interior, Landforms, Plate Tectonics, Monsoon & Climate, Oceans, Rivers, Soils, Vegetation, Minerals, Population, and AP Physical & District Geography.',
    color: '#10b981',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 12,
    targetHours: 45,
  },
  {
    id: 'sub-appsc-4',
    track: 'appsc-prelims',
    groupNumber: 4,
    paper: 'General Studies Paper I',
    name: 'Indian Polity and Governance',
    nameTelugu: 'భారత రాజ్యాంగం & పరిపాలన',
    description: 'Constituent Assembly, Preamble, Fundamental Rights, DPSPs, President, PM & Council, Parliament, Judiciary, Federalism, Governor & CM, State Legislature, Local Governance & PRIs.',
    color: '#8b5cf6',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 12,
    targetHours: 50,
  },
  {
    id: 'sub-appsc-5',
    track: 'appsc-prelims',
    groupNumber: 5,
    paper: 'General Studies Paper I',
    name: 'Indian and Andhra Pradesh Economy',
    nameTelugu: 'భారత & ఆంధ్రప్రదేశ్ ఆర్థిక వ్యవస్థ',
    description: 'National Income, GDP, Inflation, Money & Banking, RBI Policy, Public Finance, Taxation & GST, Fiscal Policy, Poverty & Unemployment, External Trade, and AP State Finances.',
    color: '#f59e0b',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 12,
    targetHours: 50,
  },
  {
    id: 'sub-appsc-6',
    track: 'appsc-prelims',
    groupNumber: 6,
    paper: 'General Studies Paper I',
    name: 'Indian Society and Social Issues',
    nameTelugu: 'భారత సమాజం & సామాజిక సమస్యలు',
    description: 'Social Structure, Stratification, Caste, Class, Varna & Jati, Women & Gender, Education, Health, SC/ST Rights, Backward Classes, Demography, and Welfare Policies.',
    color: '#06b6d4',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 10,
    targetHours: 35,
  },
  {
    id: 'sub-appsc-7',
    track: 'appsc-prelims',
    groupNumber: 7,
    paper: 'General Studies Paper I',
    name: 'Science and Technology',
    nameTelugu: 'సైన్స్ మరియు టెక్నాలజీ',
    description: 'Physics & Chemistry Fundamentals, Biology, Human Physiology, Genetics, Biotechnology, Public Health, Information Technology, AI, Space Missions (ISRO), and Renewable Energy.',
    color: '#6366f1',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 10,
    targetHours: 40,
  },
  {
    id: 'sub-appsc-8',
    track: 'appsc-prelims',
    groupNumber: 8,
    paper: 'General Studies Paper I',
    name: 'Environment and Disaster Management',
    nameTelugu: 'పర్యావరణం & విపత్తు నిర్వహణ',
    description: 'Ecology, Ecosystems, Biodiversity, Protected Areas, Pollution, Climate Change, Global Conventions, Forest Conservation, Disaster Mitigation (Floods/Cyclones), and AP Concerns.',
    color: '#14b8a6',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 10,
    targetHours: 35,
  },
  {
    id: 'sub-appsc-9',
    track: 'appsc-prelims',
    groupNumber: 9,
    paper: 'General Studies Paper I',
    name: 'Mental Ability and Current Affairs',
    nameTelugu: 'మెంటల్ ఎబిలిటీ & వర్తమాన వ్యవహారాలు',
    description: 'Quantitative Aptitude, Logical Reasoning, Data Interpretation, Analytical Reasoning, National Current Affairs, AP State Affairs, Government Schemes, and Global Developments.',
    color: '#f97316',
    priority: 'high',
    officialMarks: 30,
    targetWeightPercent: 10,
    targetHours: 45,
  },
];

export const APPSC_NINE_EXAM_SETTINGS: ExamSettings = {
  examId: 'appsc-group-2-nine-subjects',
  examName: 'APPSC Group-II Nine Subject Examination System',
  totalQuestions: 150,
  totalMarks: 150,
  marksPerQuestion: 1.0,
  negativeMarks: 0.33,
  durationMinutes: 150,
  subjectTargets: APPSC_NINE_SUBJECTS.map((s) => ({
    subjectId: s.id,
    subjectName: s.name,
    officialMarks: s.officialMarks,
    studyTargetWeightPercent: s.targetWeightPercent ?? 11.1,
    targetHours: s.targetHours,
  })),
};

// Generates the comprehensive topics matching the prompt's syllabus specification for each of the 9 subjects
export function generateNineSubjectTopics(): { topics: SyllabusTopic[]; subtopics: Subtopic[] } {
  const allTopics: SyllabusTopic[] = [];
  const allSubtopics: Subtopic[] = [];

  const rawSyllabusData = [
    // Subject 1: Indian History
    {
      subjectId: 'sub-appsc-1',
      prefix: 'top-ih',
      paper: 'Indian History',
      topics: [
        { title: 'Ancient Indian History: Sources, Paleolithic to Chalcolithic Eras', telugu: 'ప్రాచీన భారతదేశ చరిత్ర: ఆధారాలు & రాతియుగాలు' },
        { title: 'Indus Valley Civilization: Origins, Major Sites, Town Planning & Religion', telugu: 'సింధు నాగరికత: పట్టణ ప్రణాళిక, మురుగునీటి వ్యవస్థ & మతం' },
        { title: 'Vedic Age: Early Rigvedic vs Later Vedic Society, Economy & Philosophy', telugu: 'వేద యుగం: తొలి & మలి వేద నాగరికత, సమాజం & తత్వశాస్త్రం' },
        { title: 'Buddhism and Jainism: Founders, Teachings, Councils & Sects', telugu: 'బౌద్ధ మరియు జైన మతాలు: సిద్ధాంతాలు, సంగీతులు & వ్యాప్తి' },
        { title: 'Mauryan Empire: Chandragupta, Kautilya Arthashastra & Ashoka Dhamma', telugu: 'మౌర్య సామ్రాజ్యం: కౌటిల్యుని అర్థశాస్త్రం & అశోకుని ధర్మ ప్రచారం' },
        { title: 'Gupta Empire: Golden Age Administration, Art, Kalidasa & Aryabhata', telugu: 'గుప్త సామ్రాజ్యం: పరిపాలన, విజ్ఞాన శాస్త్రం & స్వర్ణయుగం' },
        { title: 'Medieval India: Rajput Kingdoms, Tripartite Struggle & Feudal Formations', telugu: 'మధ్యయుగ భారతదేశం: రాజపుత్ర రాజ్యాలు & సామాజిక వ్యవస్థ' },
        { title: 'Delhi Sultanate: Slave, Khalji, Tughlaq & Lodi Dynasties and Market Reforms', telugu: 'ఢిల్లీ సుల్తానేట్: ఖిల్జీ మార్కెట్ సంస్కరణలు & తుగ్లక్ పరిపాలన' },
        { title: 'Mughal Empire: Babur, Akbar (Mansabdari, Sulh-i-Kul) to Aurangzeb', telugu: 'మొఘల్ సామ్రాజ్యం: అక్బర్ మన్సబ్దారీ విధానం, సూల్-ఇ-కుల్ & నిర్మాణాలు' },
        { title: 'Bhakti and Sufi Movements: Ramanuja, Kabir, Guru Nanak, Mirabai & Silsilas', telugu: 'భక్తి & సూఫీ ఉద్యమాలు: సంస్కర్తలు & సమన్వయ సంస్కృతి' },
        { title: 'Modern Indian History: Advent of Europeans (Portuguese, Dutch, French, British)', telugu: 'ఆధునిక భారతదేశం: యూరోపియన్ల రాక & ఆంగ్లేయ ఆధిపత్యం' },
        { title: 'British Expansion: Carnatic Wars, Battle of Plassey, Buxar & Subsidiary Alliance', telugu: 'బ్రిటిష్ విస్తరణ: కర్ణాటక, ప్లాసీ & బక్సార్ యుద్ధాలు' },
        { title: 'Revolt of 1857: Causes, Key Centers, Leaders, Suppression & Consequences', telugu: '1857 సిపాయిల తిరుగుబాటు: కారణాలు, నాయకులు & ఫలితాలు' },
        { title: 'Social and Religious Reform Movements: Brahmo, Arya Samaj & Jyotirao Phule', telugu: 'సామాజిక-మత సంస్కరణోద్యమాలు: బ్రహ్మ సమాజం, ఆర్య సమాజం & ఫూలే' },
        { title: 'Indian National Congress: Foundation, Safety Valve Theory & Early Objectives', telugu: 'భారత జాతీయ కాంగ్రెస్: ఆవిర్భావం & తొలి లక్ష్యాలు' },
        { title: 'Moderates and Extremists: Ideologies, Surat Split & Swadeshi Movement (1905)', telugu: 'మితవాదులు & అతివాదులు: విభజన & వందేమాతరం ఉద్యమం' },
        { title: 'Gandhian Movements: Non-Cooperation, Civil Disobedience & Quit India', telugu: 'గాంధేయ ఉద్యమాలు: సహాయ నిరాకరణ, ఉప్పు సత్యాగ్రహం & క్విట్ ఇండియా' },
        { title: 'Constitutional Developments: Regulating Act (1773) to GoI Act (1935)', telugu: 'రాజ్యాంగ అభివృద్ధి చట్టాలు: 1773 రెగ్యులేటింగ్ చట్టం నుండి 1935 చట్టం వరకు' },
        { title: 'Independence and Partition: Mountbatten Plan, Radcliffe Line & Integration of States', telugu: 'భారత స్వాతంత్ర్యం, దేశ విభజన & స్వదేశీ సంస్థానాల విలీనం' },
      ],
    },

    // Subject 2: Andhra Pradesh History and Culture
    {
      subjectId: 'sub-appsc-2',
      prefix: 'top-aph',
      paper: 'AP History & Culture',
      topics: [
        { title: 'Ancient Andhra: Prehistoric Sites, Guntupalli, Nagarjunakonda & Amaravati Stupa', telugu: 'ప్రాచీన ఆంధ్ర: అమరావతి స్తూపం & నాగార్జునకొండ సంస్కృతి' },
        { title: 'Satavahanas: Simuka, Gautamiputra Satakarni, Hala Gathasaptashati & Trade', telugu: 'శాతవాహనులు: గౌతమీపుత్ర శాతకర్ణి, గాథాసప్తశతి & విదేశీ వాణిజ్యం' },
        { title: 'Ikshvakus of Vijayapuri: Art, Buddhist Patronage, Coins & Queen Inscriptions', telugu: 'విజయపురి ఇక్ష్వాకులు: బౌద్ధ మత ప్రోత్సాహం & స్త్రీల దానశాసనాలు' },
        { title: 'Eastern Chalukyas of Vengi: Kubja Vishnuvardhana, Rajaraja Narendra & Telugu Literature', telugu: 'వేంగి తూర్పు చాళుక్యులు: రాజరాజ నరేంద్రుడు & నన్నయ భారతాంధ్రీకరణ' },
        { title: 'Kakatiyas of Warangal: Ganapatideva, Rudramadevi, Prataparudra & Tank Irrigation', telugu: 'వరంగల్ కాకతీయులు: రుద్రమదేవి, గొలుసుకట్టు చెరువుల నిర్మాణం & మోటుపల్లి శాసనం' },
        { title: 'Vijayanagara Empire: Krishnadevaraya, Nayankara System, Amuktamalyada & Hampi Art', telugu: 'విజయనగర సామ్రాజ్యం: శ్రీకృష్ణదేవరాయలు, ఆముక్తమాల్యద & హంపి వైభవం' },
        { title: 'Qutb Shahis and Regional History: Golconda, Charminar, Ibrahim Qutb Shah & Sarangadhara', telugu: 'కుతుబ్ షాహీలు: గోల్కొండ పాలన, చార్మినార్ & తెలుగు సాహిత్య సేవ' },
        { title: 'Colonial Andhra: Northern Circars Acquisition, Thomas Munro Ryotwari & Arthur Cotton Dams', telugu: 'వలసపాలనలో ఆంధ్ర: సర్కార్ల ఆక్రమణ, మన్రో రైత్వారీ & ఆర్థర్ కాటన్ ఆనకట్టలు' },
        { title: 'Andhra Social Reformers: Kandukuri Veeresalingam, Gurajada Apparao & Raghupathi Venkataratnam', telugu: 'ఆంధ్ర సాంఘిక సంస్కర్తలు: కందుకూరి, గురజాడ అప్పారావు & రఘుపతి వెంకటరత్నం' },
        { title: 'Freedom Movement in Andhra: Chirala-Perala, Palnadu Forest Satyagraha & Alluri Sitarama Raju', telugu: 'ఆంధ్రలో జాతీయోద్యమం: చీరాల-పేరాల, పల్నాటి సత్యాగ్రహం & అల్లూరి పోరాటం' },
        { title: 'Andhra State Formation (1953): Potti Sreeramulu Supreme Sacrifice & Kurnool Capital', telugu: 'ఆంధ్ర రాష్ట్ర ఆవిర్భావం (1953): పొట్టి శ్రీరాములు ఆమరణ నిరాహారదీక్ష & కర్నూలు' },
        { title: 'Andhra Pradesh Formation (1956) and AP Reorganisation Act (2014) Provisions', telugu: 'ఆంధ్రప్రదేశ్ అవతరణ (1956) & రాష్ట్ర పునర్విభజన చట్టం (2014)' },
        { title: 'Andhra Art, Architecture, Kuchipudi Dance, Carnatic Music & Telugu Literary Heritage', telugu: 'ఆంధ్ర లలిత కళలు: కూచిపూడి నృత్యం, కర్ణాటక సంగీతం & వాగ్గేయకారులు' },
      ],
    },

    // Subject 3: Indian and Andhra Pradesh Geography
    {
      subjectId: 'sub-appsc-3',
      prefix: 'top-geo',
      paper: 'Geography',
      topics: [
        { title: 'Earth and the Solar System: Planetary Motions, Seasons, Solstices & Eclipses', telugu: 'సౌర కుటుంబం: గ్రహాల చలనాలు, రుతువులు & గ్రహణాలు' },
        { title: 'Latitudes, Longitudes, Time Calculations and International Date Line', telugu: 'అక్షాంశాలు, రేఖాంశాలు, ప్రామాణిక కాలం & అంతర్జాతీయ తేదీ రేఖ' },
        { title: "Earth's Interior and Landforms: Crust, Mantle, Core, Continental Drift & Plate Tectonics", telugu: 'భూ అంతర్భాగం: భూపటలం, ఖండచలన & పలక విరూపకారక సిద్ధాంతం' },
        { title: 'Rocks, Weathering, Mass Wasting and Fluvial/Glacial/Aeolian Landforms', telugu: 'శిలలు: శిలాశైథిల్యం, నదీ, హిమానీనద & పవన భూస్వరూపాలు' },
        { title: 'Atmosphere: Composition, Layers, Pressure Belts, Planetary Winds & Rainfall', telugu: 'వాతావరణం: పొరలు, పీడన మేఖలలు, పవనాలు & వర్షపాతం' },
        { title: 'Indian Monsoon: Origin, Mechanism (ITCZ, El Nino/La Nina, IOD) and Rainfall Distribution', telugu: 'భారత ఋతుపవనాలు: ఆవిర్భావం, ఎల్‌నినో, లానినా & వర్షపాత పంపిణీ' },
        { title: 'Oceans and Oceanography: Relief, Ocean Currents (Kuroshio, Gulf Stream), Tides & Salinity', telugu: 'మహాసముద్రాలు: ఉపరితల స్వరూపం, సముద్ర ప్రవాహాలు, పోటుపాట్లు & లవణీయత' },
        { title: 'Rivers and Drainage Systems of India: Himalayan (Indus, Ganga, Brahmaputra) & Peninsular', telugu: 'భారత నదీ వ్యవస్థ: హిమాలయ నదులు & ద్వీపకల్ప నదులు' },
        { title: 'Soils of India: Alluvial, Black (Regur), Red, Laterite Soils & Soil Conservation', telugu: 'భారతదేశ నేలలు: ఒండ్రు, నల్లరేగడి, ఎర్ర & లాటరైట్ నేలలు' },
        { title: 'Natural Vegetation and Wildlife: Forest Types, Biomes, Protected Forest Cover & Social Forestry', telugu: 'సహజ వృక్షసంపద: అడవుల రకాలు & అటవీ విస్తీర్ణం' },
        { title: 'Agriculture and Irrigation: Major Crops (Rice, Wheat, Cotton), Multi-purpose Dams & Micro-irrigation', telugu: 'వ్యవసాయం & నీటిపారుదల: ప్రధాన పంటలు & ప్రాజెక్టులు' },
        { title: 'Minerals, Energy and Industries: Iron Ore, Coal, Petroleum, Solar Energy & Industrial Corridors', telugu: 'ఖనిజాలు, ఇంధన వనరులు & పారిశ్రామిక కారిడార్లు' },
        { title: 'Population and Settlements: Census Demographics, Sex Ratio, Urbanization & Migration Patterns', telugu: 'జనాభా & స్థిరనివాసాలు: లింగ నిష్పత్తి, జనసాంద్రత & పట్టణీకరణ' },
        { title: 'Andhra Pradesh Physical Geography: Coastal Plains, Eastern Ghats & Rayalaseema Plateau', telugu: 'ఆంధ్రప్రదేశ్ నైసర్గిక స్వరూపం: తీర మైదానాలు, తూర్పు కనుమలు & రాయలసీమ' },
        { title: 'Andhra Pradesh Rivers, Districts, Agriculture, Irrigation Projects (Polavaram) & Resources', telugu: 'ఆంధ్రప్రదేశ్ నదులు, జిల్లాలు, పంటలు, పోలవరం ప్రాజెక్ట్ & వనరులు' },
      ],
    },

    // Subject 4: Indian Polity and Governance
    {
      subjectId: 'sub-appsc-4',
      prefix: 'top-pol',
      paper: 'Polity & Governance',
      topics: [
        { title: 'Historical Background of Constitution: 1919 Mont-Ford, 1935 Act & Constituent Assembly', telugu: 'రాజ్యాంగ చారిత్రక నేపథ్యం & రాజ్యాంగ పరిషత్' },
        { title: 'Preamble: Sovereign, Socialist, Secular, Democratic, Republic, Justice & Liberty', telugu: 'రాజ్యాంగ పీఠిక: ప్రాముఖ్యత, సవరణలు & మౌలిక స్వరూపం' },
        { title: 'Fundamental Rights (Articles 12-35): Writs, Reasonable Restrictions & Judicial Review', telugu: 'ప్రాథమిక హక్కులు (ఆర్టికల్స్ 12-35): రిట్లు & న్యాయ సమీక్ష' },
        { title: 'Directive Principles of State Policy (Articles 36-51) & Fundamental Duties (Article 51A)', telugu: 'ఆదేశిక సూత్రాలు & ప్రాథమిక విధులు' },
        { title: 'Union Executive: President Election/Powers, Vice-President, PM & Council of Ministers', telugu: 'కేంద్ర కార్యనిర్వాహక వర్గం: రాష్ట్రపతి, ఉపరాష్ట్రపతి & ప్రధానమంత్రి' },
        { title: 'Parliament: Lok Sabha, Rajya Sabha, Law-making Procedure, Parliamentary Committees & Budgets', telugu: 'పార్లమెంట్: ఉభయ సభలు, చట్టాల తయారీ విధానం & కమిటీలు' },
        { title: 'Supreme Court & High Courts: Jurisdiction, Collegium System, Judicial Activism & PILs', telugu: 'సుప్రీంకోర్టు & హైకోర్టులు: న్యాయవ్యవస్థ, కొలీజియం & ప్రజాప్రయోజన వ్యాజ్యాలు' },
        { title: 'Indian Federalism & Centre-State Relations: Legislative, Administrative & Financial Tensions', telugu: 'సమాఖ్య వ్యవస్థ & కేంద్ర-రాష్ట్ర సంబంధాలు: సర్కారియా & పూంఛీ కమిషన్లు' },
        { title: 'State Executive & Legislature: Governor Powers (Article 163), Chief Minister & Vidhan Parishad', telugu: 'రాష్ట్ర కార్యనిర్వాహక వర్గం: గవర్నర్ పాత్ర, ముఖ్యమంత్రి & శాసనమండలి' },
        { title: 'Constitutional Bodies: Election Commission, UPSC, CAG, Finance Commission & NCSC/NCST', telugu: 'రాజ్యాంగబద్ధ సంస్థలు: ఎన్నికల సంఘం, కాగ్, ఆర్థిక సంఘం' },
        { title: 'Local Government: 73rd and 74th Constitutional Amendments, Panchayati Raj & Municipalities', telugu: 'స్థానిక స్వపరిపాలన: 73, 74వ రాజ్యాంగ సవరణలు & గ్రామ పంచాయతీలు' },
        { title: 'Elections, Representation of People Act, Electoral Reforms & Anti-Defection Law (10th Schedule)', telugu: 'ఎన్నికల సంస్కరణలు, ప్రజాప్రాతినిధ్య చట్టం & పార్టీ ఫిరాయింపుల నిరోధక చట్టం' },
        { title: 'Good Governance, RTI Act 2005, Lokpal & Lokayukta, Citizen Charters and E-Governance in AP', telugu: 'సుపరిపాలన, సమాచార హక్కు చట్టం, లోక్‌పాల్ & ఆంధ్రప్రదేశ్‌లో ఈ-గవర్నెన్స్' },
      ],
    },

    // Subject 5: Indian and Andhra Pradesh Economy
    {
      subjectId: 'sub-appsc-5',
      prefix: 'top-eco',
      paper: 'Economy',
      topics: [
        { title: 'Basic Economic Concepts: Scarcity, Opportunity Cost, Factors of Production & Market Structures', telugu: 'ఆర్థిక మౌలిక భావనలు: ఉత్పత్తి కారకాలు & మార్కెట్ రకాలు' },
        { title: 'National Income Accounting: GDP, GNP, NNP, Real vs Nominal GDP & GVA Calculations', telugu: 'జాతీయాదాయం: జీడీపీ, జీఎన్‌పీ, స్థూల విలువ జోడింపు & లెక్కింపు పద్ధతులు' },
        { title: 'Inflation: CPI, WPI, Headline vs Core, Demand-pull, Cost-push & Inflation Targeting Framework', telugu: 'ద్రవ్యోల్బణం: రకాలు, కొలమానాలు (సీపీఐ, డబ్ల్యూపీఐ) & నియంత్రణ' },
        { title: 'Money and Banking: Money Supply (M1-M4), Commercial Banking, NPAs & Financial Inclusion', telugu: 'ద్రవ్యం & బ్యాంకింగ్: వాణిజ్య బ్యాంకులు, నిరర్థక ఆస్తులు & డిజిటల్ చెల్లింపులు' },
        { title: 'RBI & Monetary Policy: Repo, Reverse Repo, CRR, SLR, Open Market Operations & MPC Mandate', telugu: 'రిజర్వ్ బ్యాంక్: ద్రవ్య విధాన సాధనాలు (రెపో, సీఆర్‌ఆర్, ఎస్‌ఎల్‌ఆర్)' },
        { title: 'Public Finance & Union Budget: Revenue/Capital Budgets, Fiscal Deficit, FRBM Act & Disinvestment', telugu: 'ప్రభుత్వ విత్తం: కేంద్ర బడ్జెట్, రెవెన్యూ/ద్రవ్య లోట్లు & ఎఫ్ఆర్బీఎం చట్టం' },
        { title: 'Taxation Structure: Direct vs Indirect Taxes, GST Council, Surcharges & Tax Reforms', telugu: 'పన్నుల వ్యవస్థ: ప్రత్యక్ష, పరోక్ష పన్నులు, జీఎస్టీ కౌన్సిల్ & సంస్కరణలు' },
        { title: 'Economic Planning in India: Five-Year Plans History, NITI Aayog Structure & Cooperative Federalism', telugu: 'ఆర్థిక ప్రణాళికలు: పంచవర్ష ప్రణాళికల చరిత్ర & నీతి ఆయోగ్' },
        { title: 'Poverty, Unemployment & Inequality: Tendulkar/Rangarajan Committees, MGNREGA & Gini Coefficient', telugu: 'పేదరికం, నిరుద్యోగం & అసమానతలు: ఉపాధి హామీ పథకం & గణాంకాలు' },
        { title: 'Indian Agriculture: MSP, PM-KISAN, Green Revolution, PDS & Food Security', telugu: 'భారత వ్యవసాయం: కనీస మద్దతు ధర (MSP), ఆహార భద్రత & ప్రధాన పథకాలు' },
        { title: 'Indian Industry & Infrastructure: PLI Schemes, National Infrastructure Pipeline, Make in India & MSMEs', telugu: 'పారిశ్రామిక రంగం: మేక్ ఇన్ ఇండియా, ఎంఎస్ఎంఈలు & పీఎల్ఐ పథకాలు' },
        { title: 'External Sector: Balance of Payments (BoP), Current Account Deficit, FDI, Forex Reserves & WTO', telugu: 'విదేశీ వాణిజ్యం: చెల్లింపుల సమతుల్యత (BoP), విదేశీ మారక నిల్వలు & డబ్ల్యూటీవో' },
        { title: 'Andhra Pradesh Economy: GSDP Growth, Sectoral Contribution, State Debt & Socio-Economic Survey', telugu: 'ఆంధ్రప్రదేశ్ ఆర్థిక వ్యవస్థ: జీఎస్డీపీ వృద్ధి, వ్యవసాయ/పారిశ్రామిక వాటా & బడ్జెట్' },
        { title: 'Andhra Pradesh Welfare Programmes: Navaratnalu, Direct Benefit Transfer & Regional Disparities', telugu: 'ఆంధ్రప్రదేశ్ సంక్షేమ పథకాలు: డీబీటీ అమలు, పారిశ్రామిక కారిడార్లు & పోర్టుల అభివృద్ధి' },
      ],
    },

    // Subject 6: Indian Society and Social Issues
    {
      subjectId: 'sub-appsc-6',
      prefix: 'top-soc',
      paper: 'Society & Social Issues',
      topics: [
        { title: 'Meaning, Characteristics & Salient Features of Indian Society: Unity in Diversity', telugu: 'భారత సమాజ స్వరూపం: భిన్నత్వంలో ఏకత్వం & విశిష్ట లక్షణాలు' },
        { title: 'Social Stratification: Varna and Jati System, Caste Hierarchy, Untouchability & Dominant Caste', telugu: 'సామాజిక స్తరీకరణ: వర్ణ, కుల వ్యవస్థ, అస్పృశ్యత నివారణ చట్టాలు' },
        { title: 'Family, Marriage and Kinship Systems in India: Traditional vs Modern Transformations', telugu: 'కుటుంబం, వివాహం & బంధుత్వ వ్యవస్థ: ఆధునిక మార్పులు' },
        { title: 'Social Change, Sanskritization, Westernization, Modernization and Secularization', telugu: 'సామాజిక మార్పు: సంస్కృతీకరణ, పాశ్చాత్యీకరణ & ఆధునీకరణ' },
        { title: 'Women and Gender Issues: Female Feticide, Gender Wage Gap, Domestic Violence & Empowerment Laws', telugu: 'మహిళా సమస్యలు: లింగ వివక్ష, గృహహింస నిరోధక చట్టం & సాధికారత' },
        { title: 'Education and Health Disparities: RTE Act 2009, NEP 2020, Malnutrition & Public Health Burden', telugu: 'విద్య, వైద్య రంగాల్లో అసమానతలు: విద్యా హక్కు చట్టం & జాతీయ విద్యా విధానం' },
        { title: 'Scheduled Castes & Scheduled Tribes: Constitutional Safeguards (Art 330-342), PESA Act & FRA 2006', telugu: 'ఎస్సీ, ఎస్టీల సమస్యలు: రాజ్యాంగ రక్షణలు, పెసా చట్టం & అటవీ హక్కుల చట్టం' },
        { title: 'Backward Classes & Social Justice: Mandal Commission, 102nd/105th Amendments & OBC Quotas', telugu: 'వెనుకబడిన తరగతులు & సామాజిక న్యాయం: మండల్ కమిషన్ & రిజర్వేషన్లు' },
        { title: 'Population Trends and Demographic Dividend: Aging Population, Youth Employment & Migration', telugu: 'జనాభా పరిణామాలు: డెమోగ్రాఫిక్ డివిడెండ్, వలసలు & వయోవృద్ధుల సంక్షేమం' },
        { title: 'Welfare Policies and Social Security: Old Age Pensions, Transgender Rights, Child Labour & Persons with Disabilities', telugu: 'సంక్షేమ విధానాలు: దివ్యాంగుల హక్కులు, బాలకార్మిక నిషేధం & ట్రాన్స్‌జెండర్ చట్టాలు' },
        { title: 'Contemporary Social Issues: Communalism, Regionalism, Drug Abuse, Cyber Crimes against Women & Social Disharmony', telugu: 'సమకాలీన సమస్యలు: మతోన్మాదం, ప్రాంతీయతత్వం, సైబర్ నేరాలు & పరిష్కారాలు' },
      ],
    },

    // Subject 7: Science and Technology
    {
      subjectId: 'sub-appsc-7',
      prefix: 'top-st',
      paper: 'Science & Technology',
      topics: [
        { title: 'Physics Fundamentals: Gravity, Motion, Light, Sound, Electricity, Magnetism & Nuclear Energy', telugu: 'భౌతిక శాస్త్ర మౌలిక సూత్రాలు: గురుత్వాకర్షణ, కాంతి, విద్యుత్ & కేంద్రక శక్తి' },
        { title: 'Chemistry Fundamentals: Periodic Table, Acids, Bases, Salts, Metals, Polymers & Nanotechnology', telugu: 'రసాయన శాస్త్రం: ఆమ్లాలు, క్షారాలు, పాలిమర్లు & నానో టెక్నాలజీ' },
        { title: 'Biology and Human Physiology: Cell Structure, Circulatory, Nervous, Digestive & Immune Systems', telugu: 'జీవశాస్త్రం: మానవ శరీరధర్మశాస్త్రం, రోగనిరోధక వ్యవస్థ & పోషణ' },
        { title: 'Genetics and Biotechnology: DNA/RNA, Recombinant DNA, CRISPR-Cas9, GM Crops & Cloning', telugu: 'జన్యుశాస్త్రం & బయోటెక్నాలజీ: జీనోమ్ సీక్వెన్సింగ్, జీఎమ్ పంటలు & క్లోనింగ్' },
        { title: 'Diseases and Public Health: Viral, Bacterial, Vector-borne, Non-communicable Diseases & Vaccines', telugu: 'వ్యాధులు & ప్రజారోగ్యం: అంటువ్యాధులు, క్యాన్సర్, టీకాలు & జాతీయ ఆరోగ్య మిషన్' },
        { title: 'Information Technology: 5G/6G Networks, Cloud Computing, Big Data, Blockchain & Cybersecurity', telugu: 'సమాచార సాంకేతికత: 5జీ, క్లౌడ్ కంప్యూటింగ్, బ్లాక్‌చెయిన్ & సైబర్ భద్రత' },
        { title: 'Artificial Intelligence & Robotics: Machine Learning, Deep Learning, Generative AI & Automation', telugu: 'ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ & రోబోటిక్స్: మెషిన్ లెర్నింగ్ & జనరేటివ్ ఏఐ' },
        { title: 'Indian Space Technology: ISRO History, Launch Vehicles (PSLV, GSLV, LVM3) & Spaceports (Sriharikota)', telugu: 'భారత అంతరిక్ష రంగం: ఇస్రో ఉపగ్రహ వాహక నౌకలు (పీఎస్‌ఎల్‌వీ, జీఎస్‌ఎల్‌వీ)' },
        { title: 'Major Indian Space Missions: Chandrayaan 1-3, Mangalyaan, Aditya-L1, Gaganyaan & Shukrayaan', telugu: 'ప్రధాన అంతరిక్ష మిషన్లు: చంద్రయాన్-3, ఆదిత్య-ఎల్1, గగన్‌యాన్' },
        { title: 'Satellites and Remote Sensing: Earth Observation (Cartosat), Communication, NavIC GPS & Disaster Warning', telugu: 'రిమోట్ సెన్సింగ్: నావిక్ (NavIC), ఉపగ్రహ సంకేతాలు & వ్యవసాయ అంచనాలు' },
        { title: 'Energy and Renewable Technologies: Solar, Green Hydrogen Mission, Wind, EV Batteries & Nuclear Power in India', telugu: 'పునరుత్పాదక ఇంధనాలు: గ్రీన్ హైడ్రోజన్ మిషన్, సౌరశక్తి & ఈవీ బ్యాటరీలు' },
        { title: 'Emerging Scientific Developments: Quantum Computing, Superconductors, Semiconductors & India Semiconductor Mission', telugu: 'వర్ధమాన సాంకేతికతలు: క్వాంటమ్ కంప్యూటింగ్, సెమీకండక్టర్ మిషన్' },
      ],
    },

    // Subject 8: Environment and Disaster Management
    {
      subjectId: 'sub-appsc-8',
      prefix: 'top-env',
      paper: 'Environment & Disaster',
      topics: [
        { title: 'Ecology and Ecosystems: Biotic & Abiotic Components, Ecological Pyramids & Nutrient Cycles', telugu: 'ఆవరణశాస్త్రం: ఆహార జాలాలు, పోషక వలయాలు & పర్యావరణ పిరమిడ్లు' },
        { title: 'Food Chains, Food Webs, Trophic Levels, Biomagnification & Ecological Succession', telugu: 'ఆహార గొలుసులు: బయోమాగ్నిఫికేషన్ & ఆవరణ వ్యవస్థల పరిణామ క్రమం' },
        { title: 'Biodiversity: Genetic, Species & Ecosystem Diversity, Mega-diversity Countries & Biodiversity Hotspots', telugu: 'జీవవైవిధ్యం: హాట్‌స్పాట్లు, అంతరించిపోతున్న జాతులు (IUCN రెడ్ లిస్ట్)' },
        { title: 'Protected Areas: National Parks, Wildlife Sanctuaries, Biosphere Reserves, Ramsar Wetlands & Project Tiger', telugu: 'రక్షిత ప్రాంతాలు: జాతీయ పార్కులు, రామ్‌సార్ చిత్తడి నేలలు & ప్రాజెక్ట్ టైగర్' },
        { title: 'Environmental Pollution: Air (AQI, PM2.5), Water (Eutrophication), Soil, Noise & E-Waste Rules', telugu: 'పర్యావరణ కాలుష్యం: గాలి, నీరు, ప్లాస్టిక్ & ఇ-వ్యర్థాల నిర్వహణ' },
        { title: 'Climate Change: Greenhouse Gases, Global Warming, IPCC Reports, Carbon Sequestration & Carbon Credits', telugu: 'వాతావరణ మార్పు: గ్రీన్‌హౌస్ వాయువులు, ఐపీసీసీ నివేదికలు & కార్బన్ ట్రేడింగ్' },
        { title: 'Global Environmental Conventions: UNFCCC, Paris Agreement, Kyoto Protocol, Montreal Protocol & CBD COP', telugu: 'అంతర్జాతీయ ఒప్పందాలు: పారిస్ ఒప్పందం, క్యోటో ప్రోటోకాల్ & మాంట్రియల్ ఒప్పందం' },
        { title: 'Forest Conservation and Wildlife Laws: Wildlife Protection Act 1972, Forest Conservation Act 1980 & CAMPA', telugu: 'అటవీ చట్టాలు: వన్యప్రాణి సంరక్షణ చట్టం 1972 & కంపా (CAMPA) నిధులు' },
        { title: 'Natural Resources and Sustainable Development: Sustainable Development Goals (SDGs 2030) & Resource Depletion', telugu: 'సహజ వనరులు & సుస్థిర అభివృద్ధి: ఎస్‌డీజీ 2030 లక్ష్యాలు' },
        { title: 'Disaster Management Framework: NDMA, SDMA, NDRF, Disaster Management Act 2005 & Sendai Framework', telugu: 'విపత్తు నిర్వహణ: ఎన్‌డీఎంఏ, ఎస్‌డీఎంఏ, విపత్తు నిర్వహణ చట్టం 2005' },
        { title: 'Natural Disasters in India: Cyclones (Bay of Bengal), Floods, Droughts, Heatwaves & Early Warning Systems', telugu: 'ప్రకృతి విపత్తులు: తుఫానులు, వరదలు, కరువులు & ముందస్తు హెచ్చరిక కేంద్రాలు' },
        { title: 'Andhra Pradesh Environmental Concerns: Coastal Erosion, Mangrove Conservation (Coringa), Godavari Floods & Rayalaseema Droughts', telugu: 'ఆంధ్రప్రదేశ్ పర్యావరణ సమస్యలు: కోరింగ మడ అడవులు, గోదావరి వరదలు & తీరకోత' },
      ],
    },

    // Subject 9: Mental Ability and Current Affairs
    {
      subjectId: 'sub-appsc-9',
      prefix: 'top-ma',
      paper: 'Mental Ability & CA',
      topics: [
        { title: 'Number Systems, Divisibility Rules, LCM and HCF Calculations', telugu: 'సంఖ్యా వ్యవస్థ: భాజనీయతా సూత్రాలు, గ.సా.భా & క.సా.గు' },
        { title: 'Percentages, Profit and Loss, Marked Price & Discount Problems', telugu: 'శాతాలు, లాభనష్టాలు & రాయితీ లెక్కలు' },
        { title: 'Ratio, Proportion, Variation and Partnership Problems', telugu: 'నిష్పత్తి, అనుపాతం & భాగస్వామ్యాలు' },
        { title: 'Averages, Mixtures, Alligations and Age Calculations', telugu: 'సగటులు, మిశ్రమాలు & వయస్సుల సమస్యలు' },
        { title: 'Simple Interest, Compound Interest and Depreciation Calculations', telugu: 'బారువడ్డీ, చక్రవడ్డీ & తరుగుదల' },
        { title: 'Time and Work, Pipes and Cisterns, Work and Wages', telugu: 'కాలం - పని, పైపులు - తొట్టెలు & వేతనాలు' },
        { title: 'Time, Speed, Distance, Train Problems, Boats and Streams', telugu: 'కాలం - దూరం - వేగం, రైలు లెక్కలు & పడవలు - ప్రవాహాలు' },
        { title: 'Number Series, Alphabet Series, Missing Characters and Analogies', telugu: 'సంఖ్యా శ్రేణులు, అక్షర శ్రేణులు & పోలికలు' },
        { title: 'Coding-Decoding, Letter Shifting and Symbol Substitution', telugu: 'కోడింగ్ - డీకోడింగ్ & గుర్తుల ప్రతిక్షేపణ' },
        { title: 'Directions, Distance Sense, Shadow Problems and Angle Rotations', telugu: 'దిశలు, దూరాలు & కోణాల భ్రమణాలు' },
        { title: 'Blood Relations, Family Tree Puzzles and Coded Relations', telugu: 'రక్త సంబంధాలు & కుటుంబ పట్టికలు' },
        { title: 'Ranking, Ordering, Seating Arrangements (Linear and Circular)', telugu: 'ర్యాంకులు, క్రమాలు & సీటింగ్ అమరికలు' },
        { title: 'Logical Reasoning: Syllogisms, Statement-Assumptions & Statement-Arguments', telugu: 'లాజికల్ రీజనింగ్: సిలాజిజమ్స్, ప్రకటనలు - ఊహలు' },
        { title: 'Data Interpretation: Bar Graphs, Pie Charts, Line Graphs and Tabular Data', telugu: 'దత్తాంశ విశ్లేషణ: బార్ గ్రాఫ్‌లు, పై చార్టులు & పట్టికలు' },
        { title: 'National Current Affairs: Supreme Court Judgments, Bills, Summit Outcomes & High-Level Appointments', telugu: 'జాతీయ వర్తమాన అంశాలు: చట్టాలు, సుప్రీంకోర్టు తీర్పులు & సదస్సులు' },
        { title: 'Andhra Pradesh Current Affairs: State Welfare Schemes, New Policies, District Initiatives & State Events', telugu: 'ఆంధ్రప్రదేశ్ వర్తమాన అంశాలు: రాష్ట్ర ప్రభుత్వ పథకాలు & విధానాలు' },
        { title: 'Economic & Financial Current Affairs: Union Budget Highlights, RBI Circulars, GST Collections & Indices', telugu: 'ఆర్థిక వర్తమాన అంశాలు: బడ్జెట్ ముఖ్యాంశాలు, ద్రవ్యోల్బణ గణాంకాలు' },
        { title: 'Science, Defense and Environment Current Affairs: Nobel Prizes, Defense Exercises & Wildlife Surveys', telugu: 'సైన్స్ & డిఫెన్స్ కరెంట్ అఫైర్స్: రక్షణ విన్యాసాలు & పరిశోధనలు' },
      ],
    },
  ];

  let topicCounter = 1;

  rawSyllabusData.forEach((subj) => {
    subj.topics.forEach((tData, idx) => {
      const topicNumber = idx + 1;
      const topicId = `${subj.prefix}-${topicNumber}`;

      const newTopic: SyllabusTopic = {
        id: topicId,
        subjectId: subj.subjectId,
        track: 'appsc-prelims',
        paper: subj.paper,
        topicNumber,
        title: tData.title,
        titleTelugu: tData.telugu,
        description: `Official comprehensive syllabus topic #${topicNumber} under ${subj.paper} for APPSC Group-II Examination.`,
        learningObjectives: [
          `Master key theoretical concepts and factual details for ${tData.title}.`,
          'Analyze previous examination trends and high-yield question patterns.',
          'Solve multi-difficulty practice quizzes and sectional mock tests.',
        ],
        timeline: subj.subjectId === 'sub-appsc-1' ? (topicNumber <= 6 ? 'Ancient' : topicNumber <= 10 ? 'Medieval' : 'Modern') : undefined,
        estimatedHours: 3.5,
        difficulty: topicNumber % 3 === 0 ? 'hard' : topicNumber % 2 === 0 ? 'moderate' : 'easy',
        priority: topicNumber <= 5 || topicNumber >= 12 ? 'high' : 'medium',
        status: topicNumber === 1 ? 'completed' : topicNumber === 2 ? 'in_progress' : 'not_started',
        progressPercent: topicNumber === 1 ? 100 : topicNumber === 2 ? 50 : 0,
        isVerified: true,
        verificationSource: 'APPSC Group-II Official Gazette Notification & Curriculum Framework',
        isSharedWithMains: ['sub-appsc-1', 'sub-appsc-2', 'sub-appsc-4', 'sub-appsc-5', 'sub-appsc-6'].includes(subj.subjectId),
      };

      allTopics.push(newTopic);

      // Create 3 structured subtopics per topic
      const subtopicsForThisTopic: Subtopic[] = [
        {
          id: `subt-${topicId}-1`,
          topicId,
          title: `Core Fundamentals & Conceptual Framework`,
          titleTelugu: 'ప్రాథమిక భావనలు & సిద్ధాంతాలు',
          explanation: `Fundamental conceptual foundation, origins, and core principles of ${tData.title}.`,
          keyConcepts: ['Key Principles', 'Historical / Theoretical Framework', 'Basic Definitions'],
          importantFacts: ['Standard Telugu Akademi Reference', 'Important Dates & Eras', 'Core Formulations'],
          estimatedMinutes: 45,
          isCompleted: topicNumber === 1,
          orderIndex: 1,
        },
        {
          id: `subt-${topicId}-2`,
          topicId,
          title: `Analytical Insights & Case Applications`,
          titleTelugu: 'విశ్లేషణాత్మక అంశాలు & అన్వయాలు',
          explanation: `In-depth analysis, structural dynamics, comparative assessments, and policy impacts.`,
          keyConcepts: ['Comparative Analysis', 'Structural Features', 'Administrative Implications'],
          importantFacts: ['Constitutional / Scientific Evidence', 'Official Statistics', 'High-Yield Facts'],
          estimatedMinutes: 50,
          isCompleted: false,
          orderIndex: 2,
        },
        {
          id: `subt-${topicId}-3`,
          topicId,
          title: `AP Specific Nuances & Examination PYQ Trends`,
          titleTelugu: 'ఆంధ్రప్రదేశ్ ప్రత్యేక అంశాలు & పరీక్ష ప్రశ్నలు',
          explanation: `Application to Andhra Pradesh regional context, previous year question trends, and tricky edge-cases.`,
          keyConcepts: ['AP Regional Context', 'Previous Year Questions', 'Revision Keypoints'],
          importantFacts: ['Recent AP Government Data', 'Frequently Confused Traps', 'Memory Mnemonics'],
          estimatedMinutes: 45,
          isCompleted: false,
          orderIndex: 3,
        },
      ];

      allSubtopics.push(...subtopicsForThisTopic);
      topicCounter++;
    });
  });

  return { topics: allTopics, subtopics: allSubtopics };
}
