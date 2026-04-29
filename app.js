const EXAM_MODE_DURATION_SEC = 25 * 60;
const EXAM_MODE_MAX_WORDS = 800;
const ESSAY_FAVORITES_STORAGE_KEY = 'gaokao_essay_favorites_v1';
const TRAINING_STATS_STORAGE_KEY = 'gaokao_training_stats_v1';
const PATH_TRAINING_STORAGE_KEY = 'gaokao_path_training_v1';
const ERROR_BOOK_STORAGE_KEY = 'gaokao_error_book_v1';
const MATERIAL_CARD_STORAGE_KEY = 'gaokao_material_cards_v1';
const SCORING_CALIBRATION_STORAGE_KEY = 'gaokao_scoring_calibration_v1';
const TRAINING_SESSION_LIMIT = 120;

const TIMELINE_SCORE_GUIDE = {
  '2025': '重点看“概念链条完整度”：是否同时处理“专-转-传”，并对“必定”给出条件判断。',
  '2024': '重点看“价值标准清晰度”：是否区分“认可度”与“价值本体”，并处理多数与真理关系。',
  '2023': '重点看“动机结构层次”：是否写出好奇心之外的责任感、问题意识与价值目标。',
  '2022': '重点看“关系辩证”：发问与结论是否互相支撑，而非二选一站队。',
  '2021': '重点看“时间与实践”：是否避免把时间当唯一标准，写出实践检验价值。',
  '2020': '重点看“偶然与作为”：是否从“意外”过渡到“人的回应能力与组织能力”。',
  '2019': '重点看“认识路径”：是否由比较进入本质解释，而非只做感性抒情。'
};

const AGENT_SAMPLE_TOPICS = [
  '真正的自由不是没有约束，而是在约束中作出自觉选择。',
  '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？',
  '世界上许多重要的转折是在意想不到时发生的，这是否意味着人对事物发展进程无能为力？'
];

const DEMO_CASE_TOPIC = '对已有知识的综合，是创新吗？';
const DEMO_CASE_DRAFT_HIGH = [
  '面对“对已有知识的综合，是创新吗”这一问题，关键不在“综合”动作本身，而在综合后是否发生认知质变。',
  '若只是堆叠信息，它只是整理；若形成新的解释框架并有效解决问题，才构成创新。',
  '因此，综合是创新的重要路径，但不是自动结果。'
].join('\n\n');

const ESSAY_SAMPLE_LIST = [
  {
    id: 'model-turning-point-2020',
    title: '意外中的作为（考场可写版）',
    topic: '世界上许多重要的转折是在意想不到时发生的，这是否意味着人对事物发展进程无能为力？',
    tag: '上海风格 / 论证型',
    categories: ['问题式命题', '关系辩证题'],
    content: [
      '意外并不等于无力。人未必能决定每次转折何时出现，却能通过理解、选择与回应，影响转折之后的进程。',
      '世界复杂、人有局限，因此“意料之外”常常发生；但人可以通过准备、协作与制度设计提升应对能力。',
      '真正的有能为力，体现在不确定中仍能组织行动、承担责任，并把冲击转化为成长。'
    ].join('\n\n')
  },
  {
    id: 'model-knowledge-innovation-value',
    title: '综合与创新（价值判断版）',
    topic: '对已有知识的综合，是创新吗？',
    tag: '上海风格 / 价值判断',
    categories: ['问题式命题', '价值判断题'],
    content: DEMO_CASE_DRAFT_HIGH
  },
  {
    id: 'model-recognition-2024',
    title: '认可度之外（2024）',
    topic: '生活中，人们常用认可度判别事物，区分高下。请写一篇文章，谈谈你对“认可度”的认识和思考。',
    tag: '上海风格 / 价值判断',
    categories: ['价值判断题'],
    content: [
      '认可度是社会协作中的快筛机制，却不是价值本体。多数人的选择可以提高效率，但不能自动等于真理。',
      '若把认可度直接当成价值标准，容易产生“流行即正确”的误判。许多真正有创造力的观点，起初往往处于少数。',
      '因此，面对认可度，我们应采取“双重判断”：先看其现实效用，再审其长期价值与公共后果。这样既不盲从，也不轻率反叛。'
    ].join('\n\n')
  },
  {
    id: 'model-explore-2023',
    title: '不止好奇心（2023）',
    topic: '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？',
    tag: '上海风格 / 问题式',
    categories: ['问题式命题', '关系辩证题'],
    content: [
      '好奇心是探索的起点，但不是全部动力。真正持久的探索，往往还来自责任感、问题意识与价值追求。',
      '在科技、医学、教育等领域，许多探索并非“好玩”驱动，而是对现实难题的回应。没有这种责任维度，探索就可能停留在浅层尝鲜。',
      '因此，探索的深度取决于动机结构：好奇心点火，责任感续航，价值目标定向。三者合力，才能让陌生世界真正转化为新的认知与实践。'
    ].join('\n\n')
  },
  {
    id: 'model-chinese-taste-2019',
    title: '在比较中发现中国味（2019）',
    topic: '这段话可以启发人们如何去认识事物。请写一篇文章，谈谈你对上述材料的思考和感悟。',
    tag: '上海风格 / 认识论',
    categories: ['问题式命题', '关系辩证题'],
    content: [
      '认识“自我”，往往离不开“他者”。当我们接触不同文化与风格，原本习焉不察的特征才会被重新照亮。',
      '比较不是否定自身，而是提供参照系。正是在异同辨析中，我们才能从“感到不同”走向“解释何以不同”。',
      '因此，成熟的认识路径应是：在开放中保持主体，在比较中形成判断，在反思中完成自我确认。'
    ].join('\n\n')
  },
  {
    id: 'model-question-conclusion-2022',
    title: '发问与结论（2022）',
    topic: '小时候人们喜欢发问，长大后往往看重结论。对此，有人感到担忧，有人觉得正常，你有怎样的思考？',
    tag: '上海风格 / 关系辩证',
    categories: ['关系辩证题'],
    content: [
      '发问与结论并非对立，而是认知链条中的两个环节。没有问题意识，结论容易僵化；没有结论沉淀，问题会流于空转。',
      '成长带来的并非“提问消失”，而应是“提问升级”：从情绪化追问走向结构化追问，从零散疑惑走向问题框架。',
      '真正值得担忧的不是重视结论，而是把结论当终点。好的学习者，应在结论之后继续追问其边界与前提。'
    ].join('\n\n')
  },
  {
    id: 'model-value-time-2021',
    title: '时间与价值（2021）',
    topic: '有人说，经过时间的沉淀，事物的价值才能被人们认识；也有人认为不尽如此。你怎么看？',
    tag: '上海风格 / 价值判断',
    categories: ['价值判断题', '关系辩证题'],
    content: [
      '时间会过滤噪音，却不自动生产价值。价值能否被看见，更取决于实践中的检验与主体的判断能力。',
      '有些价值需要时间显影，如经典作品；也有些价值必须在当下行动中被确认，如公共责任与制度改进。',
      '因此，“时间沉淀”是条件之一，不是唯一标准。判断价值，应把时间维度与实践维度结合起来。'
    ].join('\n\n')
  },
  {
    id: 'model-be-needed-2018',
    title: '被需要与自我价值（2018）',
    topic: '这种“被需要”的心态普遍存在，对此你有怎样的认识？',
    tag: '上海风格 / 价值论',
    categories: ['价值判断题'],
    content: [
      '“被需要”体现了人对关系与意义的追求，本身并不可疑。问题在于：这种需要是建立在真实贡献上，还是建立在外部认可上。',
      '若只追求被看见，容易陷入表演化自我；若把被需要理解为承担责任，就能在服务他人的过程中完成自我成长。',
      '所以，“被需要”应从情绪诉求升级为行动伦理：以真实能力回应真实问题，让价值在实践中成立。'
    ].join('\n\n')
  },
  {
    id: 'model-free-unfree-2014',
    title: '自由与不自由（2014）',
    topic: '你可以选择穿越沙漠的道路和方式，所以你是自由的；你必须穿越这片沙漠，所以你又是不自由的。',
    tag: '上海风格 / 辩证论证',
    categories: ['关系辩证题'],
    content: [
      '自由不是没有约束，而是在约束中作出自觉选择。题目中的“不自由”给出客观边界，“自由”体现主体能动。',
      '若否认边界，自由会沦为空想；若否认选择，不自由会滑向宿命。成熟立场应把两者放在同一结构中理解。',
      '因此，真正的自由，是在必须面对现实的前提下，仍能选择路径、承担后果并不断修正。'
    ].join('\n\n')
  },
  {
    id: 'model-special-to-classic-2025',
    title: '从“专”到“传”（2025）',
    topic: '由“专”到“传”，必定要经过“转”吗？',
    tag: '上海风格 / 新题型',
    categories: ['问题式命题', '关系辩证题', '价值判断题'],
    content: [
      '“专”保证深度，“转”扩大触达，“传”沉淀经典。三者不是线性流水线，而是动态互构关系。',
      '“转”常常是“专”走向公共的桥梁，但并非唯一通道。若转化失真，传播越广反而离“传”越远；若转化得当，可激发更深层阅读。',
      '因此，关键不在是否“必经”，而在转化质量：能否在可理解与不降格之间取得平衡。'
    ].join('\n\n')
  }
];

const CATEGORY_LABEL_MAP = {
  dialectics: '辩证法',
  epistemology: '认识论',
  axiology: '价值论',
  ethics: '伦理学',
  other: '其他哲学',
  thinking: '思维模型'
};

const AGENT_RULES = [
  { regex: /(是否|还是|两端|对立|关系|边界)/gi, category: 'dialectics', lens: '先处理两端关系，再给条件化判断。' },
  { regex: /(为什么|如何|机制|路径|步骤)/gi, category: 'thinking', lens: '用“前提-机制-结果”搭建因果链。' },
  { regex: /(价值|意义|标准|值得|应不应该)/gi, category: 'axiology', lens: '明确价值标准，并解释排序理由。' },
  { regex: /(认知|判断|知识|信息|结论)/gi, category: 'epistemology', lens: '写清判断依据，避免口号化结论。' },
  { regex: /(责任|他人|社会|规则|伦理)/gi, category: 'ethics', lens: '把个人选择放进社会责任关系中讨论。' }
];

document.addEventListener('DOMContentLoaded', () => {
  safeInit(initParticles);
  safeInit(initCounterAnimation);
  safeInit(initCards);
  safeInit(initCategoryNav);
  safeInit(initPageDirectoryLinks);
  safeInit(initAgentWorkbench);
  safeInit(initEvolutionOverview);
  safeInit(initTimeline);
  safeInit(initScrollEffects);
});

function safeInit(fn) { try { fn(); } catch (_) {} }

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.left = `${Math.random() * 100}%`;
    d.style.animationDelay = `${Math.random() * 8}s`;
    d.style.animationDuration = `${6 + Math.random() * 6}s`;
    d.style.width = `${2 + Math.random() * 3}px`;
    d.style.height = d.style.width;
    container.appendChild(d);
  }
}

function initCounterAnimation() {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    el.textContent = String(target);
  });
}

function initCards() {
  const container = document.getElementById('cardsContainer');
  if (!container || !Array.isArray(PHILOSOPHY_CARDS)) return;
  container.innerHTML = '';
  PHILOSOPHY_CARDS.forEach((data) => {
    const card = document.createElement('div');
    card.className = 'knowledge-card visible';
    card.dataset.category = data.category;
    const years = Array.isArray(data.years) && data.years.length ? data.years : ['待补充'];
    const freq = Math.max(1, Math.min(5, Number(data.frequency || 3)));
    const backPointsRaw = Array.isArray(data.backPoints) ? data.backPoints : [];
    const backPoints = normalizeBackPoints(backPointsRaw);
    const bridge = buildMethodCardObsidianBridge(data);
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="card-header">
            <div class="card-icon">${escapeHtml(data.icon || '')}</div>
            <div class="card-title-area">
              <div class="card-category-label">${escapeHtml(data.categoryLabel || '')}</div>
              <h3 class="card-title">${escapeHtml(data.title || '')}</h3>
              <div class="card-subtitle">${escapeHtml(data.subtitle || '')}</div>
            </div>
          </div>
          <div class="card-body">
            <p class="card-description">${escapeHtml(data.description || '')}</p>
            <div class="card-year-tags">${years.map((y) => `<span class="year-tag">${escapeHtml(y)}</span>`).join('')}</div>
            ${bridge.matchCount ? `<p class="card-ob-note">OB高分范文支持：${bridge.matchCount}篇｜推荐看第${bridge.paragraphIndex || 1}段</p>` : ''}
          </div>
          <div class="card-foot">
            <span class="card-foot-left">出现频次 <em class="freq-dots">${renderFrequencyDots(freq)}</em></span>
            <span class="card-foot-right">点击翻面</span>
          </div>
        </div>
        <div class="card-back">
          <div class="card-back-head">${escapeHtml(data.backTitle || '考场提示')}</div>
          <ol class="card-back-list">${backPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ol>
          ${renderMethodCardBridge(bridge)}
          <div class="card-foot">
            <span class="card-foot-left">再点一次可翻回</span>
            <span class="card-foot-right">翻回正面</span>
          </div>
        </div>
      </div>`;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    container.appendChild(card);
  });
}

function renderFrequencyDots(freq) {
  return [1, 2, 3, 4, 5]
    .map((n) => `<i class="freq-dot${n <= freq ? ' active' : ''}"></i>`)
    .join('');
}

function normalizeBackPoints(points) {
  const defaults = [
    '先界定核心概念，再明确你的立场。',
    '每段至少给出一条机制解释，避免只喊口号。',
    '结尾回扣题目问法，给出条件化结论。'
  ];
  const normalized = points
    .filter((x) => typeof x === 'string' && x.trim())
    .slice(0, 3);
  while (normalized.length < 3) normalized.push(defaults[normalized.length]);
  return normalized;
}

function initCategoryNav() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category || 'all';
      document.querySelectorAll('.knowledge-card').forEach((card) => card.classList.toggle('hidden', cat !== 'all' && card.dataset.category !== cat));
    });
  });
}

function initPageDirectoryLinks() {
  document.querySelectorAll('.page-directory [data-open-details]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const detailsId = link.dataset.openDetails;
      const targetId = link.dataset.scrollTarget;
      const details = detailsId ? document.getElementById(detailsId) : null;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!details && !target) return;
      event.preventDefault();
      if (details && details.tagName === 'DETAILS') details.open = true;
      const destination = target || details;
      window.setTimeout(() => {
        destination?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  });
}

function initAgentWorkbench() {
  const topicInput = document.getElementById('essayTopicInput');
  const draftInput = document.getElementById('essayDraftInput');
  const analyzeBtn = document.getElementById('analyzeTopicBtn');
  const generateFullEssayBtn = document.getElementById('generateFullEssayBtn');
  const generateTieredEssayBtn = document.getElementById('generateTieredEssayBtn');
  const casePoolSelect = document.getElementById('casePoolSelect');
  const sampleBtn = document.getElementById('sampleTopicBtn');
  const randomTopicBtn = document.getElementById('randomTopicBtn');
  const showDemoCardBtn = document.getElementById('showDemoCardBtn');
  const copyBtn = document.getElementById('copyAgentResultBtn');
  const offTopicCheckBtn = document.getElementById('offTopicCheckBtn');
  const scoreDraftBtn = document.getElementById('scoreDraftBtn');
  const masterCritiqueBtn = document.getElementById('masterCritiqueBtn');
  const improveDraftBtn = document.getElementById('improveDraftBtn');
  const weeklyDashboardBtn = document.getElementById('weeklyDashboardBtn');
  const regressionTestBtn = document.getElementById('regressionTestBtn');
  const baselineCheckBtn = document.getElementById('baselineCheckBtn');
  const manualScoreInput = document.getElementById('manualScoreInput');
  const manualCalibrationBtn = document.getElementById('manualCalibrationBtn');
  const resultContainer = document.getElementById('agentResult');
  const essayFilterBar = document.getElementById('essayFilterBar');
  const essaySampleList = document.getElementById('essaySampleList');
  const materialTitleInput = document.getElementById('materialTitleInput');
  const materialBodyInput = document.getElementById('materialBodyInput');
  const createMaterialCardBtn = document.getElementById('createMaterialCardBtn');
  const clearMaterialInputBtn = document.getElementById('clearMaterialInputBtn');
  const materialCardList = document.getElementById('materialCardList');
  const exampleTrainingList = document.getElementById('exampleTrainingList');
  const obEssaySelect = document.getElementById('obEssaySelect');
  const obDissectBtn = document.getElementById('obDissectBtn');
  const obTopicRouteBtn = document.getElementById('obTopicRouteBtn');
  const obRecommendBtn = document.getElementById('obRecommendBtn');
  const obActionTypeSelect = document.getElementById('obActionTypeSelect');
  const obActionBankBtn = document.getElementById('obActionBankBtn');
  const obTutorPanel = document.getElementById('obTutorPanel');
  const obKnowledgeSearchInput = document.getElementById('obKnowledgeSearchInput');
  const obKnowledgeFolderSelect = document.getElementById('obKnowledgeFolderSelect');
  const obKnowledgeTypeSelect = document.getElementById('obKnowledgeTypeSelect');
  const obKnowledgeThemeSelect = document.getElementById('obKnowledgeThemeSelect');
  const obKnowledgeScoreSelect = document.getElementById('obKnowledgeScoreSelect');
  const obKnowledgePurposeSelect = document.getElementById('obKnowledgePurposeSelect');
  const obKnowledgeTopicFilterBtn = document.getElementById('obKnowledgeTopicFilterBtn');
  const obKnowledgeSearchBtn = document.getElementById('obKnowledgeSearchBtn');
  const obKnowledgeResetBtn = document.getElementById('obKnowledgeResetBtn');
  const obKnowledgePanel = document.getElementById('obKnowledgePanel');
  const handwritingImageInput = document.getElementById('handwritingImageInput');
  const handwritingOcrFillBtn = document.getElementById('handwritingOcrFillBtn');
  const clearHandwritingImageBtn = document.getElementById('clearHandwritingImageBtn');
  const examCountdown = document.getElementById('examCountdown');
  const examWordCount = document.getElementById('examWordCount');
  const startExamModeBtn = document.getElementById('startExamModeBtn');
  const pauseExamModeBtn = document.getElementById('pauseExamModeBtn');
  const resetExamModeBtn = document.getElementById('resetExamModeBtn');
  const examModeStatus = document.getElementById('examModeStatus');
  if (!topicInput || !draftInput || !analyzeBtn || !resultContainer) return;

  const uiState = { activeFilter: 'all', favorites: loadEssayFavorites() };
  const examState = { running: false, paused: false, remaining: EXAM_MODE_DURATION_SEC, timer: null };
  let tieredEssayCache = [];

  renderEssayFilterBar(essayFilterBar, uiState.activeFilter, uiState.favorites);
  renderEssaySampleList(essaySampleList, uiState.activeFilter, uiState.favorites);
  renderMaterialCardList(materialCardList);
  renderExampleTrainingList(exampleTrainingList);
  populateObsidianTutorSelect(obEssaySelect);
  renderObsidianTutorIntro(obTutorPanel);
  initObsidianKnowledgeBrowser({
    searchInput: obKnowledgeSearchInput,
    folderSelect: obKnowledgeFolderSelect,
    typeSelect: obKnowledgeTypeSelect,
    themeSelect: obKnowledgeThemeSelect,
    scoreSelect: obKnowledgeScoreSelect,
    purposeSelect: obKnowledgePurposeSelect,
    topicFilterBtn: obKnowledgeTopicFilterBtn,
    searchBtn: obKnowledgeSearchBtn,
    resetBtn: obKnowledgeResetBtn,
    panel: obKnowledgePanel,
    tutorPanel: obTutorPanel,
    essaySelect: obEssaySelect,
    topicInput
  });
  renderHandwritingPreviewList();
  updateHandwritingUi('ready', HANDWRITING_SCAN_STATE.pages.length ? `已上传手写图片，评分时会自动OCR识别；若草稿框为空，会先自动回填正文（最多${HANDWRITING_MAX_FILES}张）。` : `未上传手写图片时，书写项暂按中档估计；最多支持上传${HANDWRITING_MAX_FILES}张。`);
  updateExamWordCountDisplay(draftInput, examWordCount);
  renderExamCountdown(examCountdown, examState.remaining);

  handwritingImageInput?.addEventListener('change', async (e) => {
    try {
      await handleHandwritingFiles(e.target.files);
    } catch (error) {
      HANDWRITING_SCAN_STATE.status = 'error';
      HANDWRITING_SCAN_STATE.error = error?.message || '图片读取失败';
      updateHandwritingUi('error', `手写图片读取失败：${HANDWRITING_SCAN_STATE.error}`);
    }
  });
  handwritingOcrFillBtn?.addEventListener('click', async () => {
    await fillDraftFromHandwritingImages(draftInput, examWordCount, resultContainer);
  });
  clearHandwritingImageBtn?.addEventListener('click', () => clearHandwritingUpload(handwritingImageInput));
  obDissectBtn?.addEventListener('click', () => {
    const essay = getObsidianTeachingEssayById(obEssaySelect?.value);
    if (!essay) return void renderObsidianTutorMessage(obTutorPanel, '请先选择一篇 OB 范文。');
    renderObsidianEssayDissection(essay, obTutorPanel, topicInput.value.trim());
  });
  obRecommendBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    if (!topic) return void renderObsidianTutorMessage(obTutorPanel, '请先在上方输入作文题目，再推荐同题高分文。');
    renderObsidianTopicRecommendations(topic, obTutorPanel);
  });
  obTopicRouteBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    if (!topic) return void renderObsidianTutorMessage(obTutorPanel, '请先在上方输入作文题目，再生成 OB 训练路径。');
    renderObsidianTopicStudyPlan(topic, obTutorPanel);
  });
  obActionBankBtn?.addEventListener('click', () => {
    renderObsidianActionBank(obActionTypeSelect?.value || 'all', obTutorPanel);
  });
  obTutorPanel?.addEventListener('click', (event) => {
    const dissectBtn = event.target.closest('[data-ob-dissect-id]');
    const taskBtn = event.target.closest('[data-ob-task-id]');
    if (!dissectBtn && !taskBtn) return;
    const targetId = dissectBtn?.dataset.obDissectId || taskBtn?.dataset.obTaskId;
    const essay = getObsidianTeachingEssayById(targetId);
    if (essay && dissectBtn) {
      if (obEssaySelect) obEssaySelect.value = essay.id;
      renderObsidianEssayDissection(essay, obTutorPanel, topicInput.value.trim());
    }
    if (essay && taskBtn) {
      renderObsidianComparisonTaskCard(essay, topicInput.value.trim(), obTutorPanel);
    }
  });

  analyzeBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    renderAgentResult(analyzeEssayTopic(topic), resultContainer);
  });

  bindGenerateEssayButton(generateFullEssayBtn, topicInput, draftInput, resultContainer, examWordCount, casePoolSelect);
  generateTieredEssayBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    const analysis = analyzeEssayTopic(topic);
    const casePool = getSelectedCasePool(casePoolSelect);
    tieredEssayCache = generateTieredEssaySet(topic, analysis, { casePool });
    renderTieredEssayReport({ topic, tiers: tieredEssayCache }, resultContainer);
  });

  sampleBtn?.addEventListener('click', () => { topicInput.value = AGENT_SAMPLE_TOPICS[Math.floor(Math.random() * AGENT_SAMPLE_TOPICS.length)]; topicInput.focus(); });
  randomTopicBtn?.addEventListener('click', () => {
    if (!Array.isArray(TIMELINE_DATA) || !TIMELINE_DATA.length) return;
    const pick = TIMELINE_DATA[Math.floor(Math.random() * TIMELINE_DATA.length)];
    topicInput.value = pick.prompt || pick.topic || '';
    renderAgentResult(analyzeEssayTopic(topicInput.value.trim()), resultContainer);
    topicInput.focus();
    document.getElementById('agentWorkbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  showDemoCardBtn?.addEventListener('click', () => { topicInput.value = DEMO_CASE_TOPIC; draftInput.value = DEMO_CASE_DRAFT_HIGH; updateExamWordCountDisplay(draftInput, examWordCount); renderAgentResult(analyzeEssayTopic(DEMO_CASE_TOPIC), resultContainer); });

  offTopicCheckBtn?.addEventListener('click', async () => {
    const topic = topicInput.value.trim();
    const draft = draftInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    if (!draft) return void (resultContainer.innerHTML = '<p class="agent-empty">请先粘贴作文草稿。</p>');
    try {
      resultContainer.innerHTML = '<p class="agent-empty">正在对照 Obsidian 高分范文库校准防跑题判断，请稍候...</p>';
      const report = await buildOffTopicCheckReport(topic, draft);
      recordErrorBookEntry({ topic, draft, offTopic: report, source: 'offtopic' });
      renderOffTopicReport(report, resultContainer);
    }
    catch (e) { resultContainer.innerHTML = `<p class="agent-empty">防跑题检查失败：${escapeHtml(e?.message || '未知错误')}</p>`; }
  });

  scoreDraftBtn?.addEventListener('click', async () => {
    try {
      const topic = topicInput.value.trim();
      if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
      const draftState = await resolveDraftFromInputOrHandwriting(draftInput, examWordCount, resultContainer, '草稿评分');
      const draft = draftState.draft.trim();
      if (!draft) return void (resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '手写图片已识别，但暂未成功提取出可用正文，请换一张更清晰、更平整的照片再试。' : '请先粘贴作文草稿。'}</p>`);
      const hasHandwriting = HANDWRITING_SCAN_STATE.pages.length > 0;
      resultContainer.innerHTML = `<p class="agent-empty">${hasHandwriting ? `${draftState.fromOcr ? '已自动回填手写正文，' : ''}检测到${HANDWRITING_SCAN_STATE.pages.length}张手写图片，正在自动OCR识别并生成上海模考阅卷报告，请稍候...` : '正在生成上海模考阅卷报告，请稍候...'}</p>`;
      const legacyScore = scoreEssayDraft(topic, draft);
      const precomputedHandwriting = hasHandwriting ? await assessHandwritingByOCR(draft) : null;
      if (hasHandwriting) {
        resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '手写正文已自动写入草稿框，' : ''}手写图片识别已完成，正在整理上海模考阅卷报告...</p>`;
      }
      const report = await buildShanghaiTeacherReviewReport(topic, draft, { precomputedHandwriting });
      updateTrainingStats(legacyScore.dimensions, {
        topic,
        total: legacyScore.total,
        score70: legacyScore.score70,
        riskLevel: legacyScore.offTopic?.riskLevel || '中',
        source: 'score',
        topicType: detectTopicType(topic).name
      });
      recordErrorBookEntry({ topic, draft, score: legacyScore, offTopic: legacyScore.offTopic, source: 'score' });
      renderTeacherScoreReport(report, resultContainer);
    } catch (error) {
      renderWorkbenchActionError(resultContainer, '草稿评分失败', error);
    }
  });

  masterCritiqueBtn?.addEventListener('click', async () => {
    try {
      const topic = topicInput.value.trim();
      if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
      const draftState = await resolveDraftFromInputOrHandwriting(draftInput, examWordCount, resultContainer, '习作精批');
      const draft = draftState.draft.trim();
      if (!draft) return void (resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '手写图片已识别，但暂未成功提取出可用正文，请换一张更清晰、正向拍摄的照片再试。' : '请先粘贴作文草稿。'}</p>`);
      const hasHandwriting = HANDWRITING_SCAN_STATE.pages.length > 0;
      resultContainer.innerHTML = `<p class="agent-empty">${hasHandwriting ? `${draftState.fromOcr ? '已自动回填手写正文，' : ''}检测到${HANDWRITING_SCAN_STATE.pages.length}张手写图片，正在自动OCR识别并生成老师式逐段精批，请稍候...` : '正在生成老师式逐段精批，请稍候...'}</p>`;
      const legacyReport = buildMasterCritiqueReport(topic, draft);
      const precomputedHandwriting = hasHandwriting ? await assessHandwritingByOCR(draft) : null;
      if (hasHandwriting) {
        resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '手写正文已自动写入草稿框，' : ''}手写图片识别已完成，正在整理老师式逐段精批...</p>`;
      }
      const teacherReport = await buildShanghaiTeacherReviewReport(topic, draft, { precomputedHandwriting });
      updateTrainingStats(legacyReport.score.dimensions, {
        topic,
        total: legacyReport.score.total,
        score70: legacyReport.score.score70,
        riskLevel: legacyReport.score.offTopic?.riskLevel || '中',
        source: 'critique',
        topicType: detectTopicType(topic).name
      });
      recordErrorBookEntry({ topic, draft, score: legacyReport.score, offTopic: legacyReport.score.offTopic, source: 'critique' });
      renderTeacherCritiqueReport(teacherReport, resultContainer);
    } catch (error) {
      renderWorkbenchActionError(resultContainer, '习作精批失败', error);
    }
  });

  improveDraftBtn?.addEventListener('click', async () => {
    try {
      const topic = topicInput.value.trim();
      if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
      const draftState = await resolveDraftFromInputOrHandwriting(draftInput, examWordCount, resultContainer, '修改任务单');
      const draft = draftState.draft.trim();
      if (!draft) return void (resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '手写图片已识别，但暂未成功提取出可用正文，请换一张更清晰的照片再试。' : '请先粘贴作文草稿。'}</p>`);
      resultContainer.innerHTML = `<p class="agent-empty">${draftState.fromOcr ? '已自动回填手写正文，' : ''}正在整理修改任务单，请稍候...</p>`;
      const teacherReport = await buildShanghaiTeacherReviewReport(topic, draft);
      renderRevisionTaskList(teacherReport, resultContainer);
    } catch (error) {
      renderWorkbenchActionError(resultContainer, '修改任务单生成失败', error);
    }
  });

  weeklyDashboardBtn?.addEventListener('click', () => {
    renderWeeklyDashboardReport(buildWeeklyTrainingDashboard(), resultContainer);
  });

  baselineCheckBtn?.addEventListener('click', async () => {
    resultContainer.innerHTML = '<p class="agent-empty">正在进行基础自检，请稍候...</p>';
    renderBaselineCheckReport(await runBaselineHealthCheck(), resultContainer);
  });

  regressionTestBtn?.addEventListener('click', async () => {
    resultContainer.innerHTML = '<p class="agent-empty">正在运行回归测试，请稍候...</p>';
    renderRegressionReport(await runRegressionSuite(), resultContainer);
  });

  manualCalibrationBtn?.addEventListener('click', async () => {
    try {
      const topic = topicInput.value.trim();
      const draft = draftInput.value.trim();
      const teacherScore = Number(manualScoreInput?.value || NaN);
      if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
      if (!draft) return void (resultContainer.innerHTML = '<p class="agent-empty">请先粘贴作文草稿。</p>');
      if (!Number.isFinite(teacherScore) || teacherScore < 0 || teacherScore > 70) {
        return void (resultContainer.innerHTML = '<p class="agent-empty">请填入0-70之间的老师实际分数。</p>');
      }
      resultContainer.innerHTML = '<p class="agent-empty">正在把老师实际分数写入评分校准本，请稍候...</p>';
      const report = await buildShanghaiTeacherReviewReport(topic, draft);
      const entry = saveManualScoreCalibrationEntry({ topic, draft, teacherScore, report });
      renderManualCalibrationReport(entry, buildManualScoreCalibrationSummary(), resultContainer);
    } catch (error) {
      renderWorkbenchActionError(resultContainer, '人工复核记录失败', error);
    }
  });

  copyBtn?.addEventListener('click', async () => { const t = resultContainer.innerText.trim(); if (t) { try { await navigator.clipboard.writeText(t); } catch (_) {} } });
  draftInput.addEventListener('input', () => updateExamWordCountDisplay(draftInput, examWordCount));

  essayFilterBar?.addEventListener('click', (e) => {
    const btn = e.target.closest('.essay-filter-btn');
    if (!btn) return;
    uiState.activeFilter = btn.dataset.filter || 'all';
    renderEssayFilterBar(essayFilterBar, uiState.activeFilter, uiState.favorites);
    renderEssaySampleList(essaySampleList, uiState.activeFilter, uiState.favorites);
  });

  essaySampleList?.addEventListener('click', (e) => {
    const star = e.target.closest('.essay-lib-star');
    if (star) {
      const id = star.dataset.sampleId;
      if (!id) return;
      if (uiState.favorites.has(id)) uiState.favorites.delete(id); else uiState.favorites.add(id);
      saveEssayFavorites(uiState.favorites);
      renderEssayFilterBar(essayFilterBar, uiState.activeFilter, uiState.favorites);
      renderEssaySampleList(essaySampleList, uiState.activeFilter, uiState.favorites);
      return;
    }
    const load = e.target.closest('.essay-lib-load');
    if (!load) return;
    const sample = ESSAY_SAMPLE_LIST.find((x) => x.id === load.dataset.sampleId);
    if (!sample) return;
    topicInput.value = sample.topic;
    draftInput.value = sample.content;
    updateExamWordCountDisplay(draftInput, examWordCount);
    resultContainer.innerHTML = '<p class="agent-empty">已加载范文，可直接点击“防跑题检查”或“草稿评分”。</p>';
  });

  createMaterialCardBtn?.addEventListener('click', () => {
    const title = (materialTitleInput?.value || '').trim();
    const body = (materialBodyInput?.value || '').trim();
    if (!title || !body) {
      resultContainer.innerHTML = '<p class="agent-empty">请先粘贴文章标题和正文，再生成素材卡。</p>';
      return;
    }
    const card = createMaterialCardFromArticle(title, body);
    const saved = saveMaterialCard(card);
    renderMaterialCardList(materialCardList);
    resultContainer.innerHTML = renderMaterialCardCreatedReport(saved);
  });

  clearMaterialInputBtn?.addEventListener('click', () => {
    if (materialTitleInput) materialTitleInput.value = '';
    if (materialBodyInput) materialBodyInput.value = '';
    resultContainer.innerHTML = '<p class="agent-empty">已清空素材卡导入框。</p>';
  });

  materialCardList?.addEventListener('click', (e) => {
    const useBtn = e.target.closest('.material-card-use');
    if (useBtn) {
      const card = findMaterialCardById(useBtn.dataset.cardId || '');
      if (!card) return;
      if (casePoolSelect) casePoolSelect.value = 'mycards';
      if (card.topic && !topicInput.value.trim()) topicInput.value = card.topic;
      resultContainer.innerHTML = renderMaterialCardDetail(card);
      return;
    }
    const trainBtn = e.target.closest('.material-card-train');
    if (trainBtn) {
      const card = findMaterialCardById(trainBtn.dataset.cardId || '');
      if (!card) return;
      topicInput.value = card.topic || card.title || '';
      renderAgentResult(analyzeEssayTopic(topicInput.value), resultContainer);
      document.getElementById('agentWorkbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const delBtn = e.target.closest('.material-card-delete');
    if (delBtn) {
      deleteMaterialCard(delBtn.dataset.cardId || '');
      renderMaterialCardList(materialCardList);
      resultContainer.innerHTML = '<p class="agent-empty">已删除这张素材卡。</p>';
    }
  });

  const handleExampleCardAction = (target) => {
    const viewBtn = target.closest('.example-card-view');
    if (viewBtn) {
      const card = findExampleTrainingCardById(viewBtn.dataset.exampleId || '');
      if (!card) return true;
      resultContainer.innerHTML = renderTrainingExampleDetail(card);
      return true;
    }
    const trainBtn = target.closest('.example-card-train');
    if (trainBtn) {
      const card = findExampleTrainingCardById(trainBtn.dataset.exampleId || '');
      if (!card) return true;
      topicInput.value = card.topic || card.title || '';
      if (casePoolSelect) casePoolSelect.value = 'examplelib';
      renderAgentResult(analyzeEssayTopic(topicInput.value), resultContainer);
      topicInput.focus();
      document.getElementById('agentWorkbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    const saveBtn = target.closest('.example-card-save');
    if (saveBtn) {
      const card = findExampleTrainingCardById(saveBtn.dataset.exampleId || '');
      if (!card) return true;
      const saved = saveMaterialCard(convertExampleTrainingCardToMaterialCard(card));
      renderMaterialCardList(materialCardList);
      if (casePoolSelect) casePoolSelect.value = 'mycards';
      resultContainer.innerHTML = renderMaterialCardCreatedReport(saved);
      return true;
    }
    return false;
  };

  exampleTrainingList?.addEventListener('click', (e) => {
    handleExampleCardAction(e.target);
  });

  resultContainer.addEventListener('click', (e) => {
    if (handleExampleCardAction(e.target)) return;
    const convertBtn = e.target.closest('.convert-four-block-btn');
    if (convertBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const analysis = analyzeEssayTopic(topic);
      const draft = buildDraftFromFourBlocks(analysis);
      draftInput.value = draft;
      updateExamWordCountDisplay(draftInput, examWordCount);
      resultContainer.innerHTML = '<p class="agent-empty">已根据“出题人意图 + 三步拆题 + 必答清单 + 模板”生成草稿骨架，可直接续写。</p>';
      return;
    }

    const tplBtn = e.target.closest('.template-use-btn');
    if (tplBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const analysis = analyzeEssayTopic(topic);
      const kind = tplBtn.dataset.templateKind || 'opening';
      const idx = parseInt(tplBtn.dataset.templateIndex || '0', 10);
      const pool = kind === 'turning'
        ? (analysis.examTemplateSets?.turnings || [])
        : (kind === 'rising' ? (analysis.examTemplateSets?.risings || []) : (analysis.examTemplateSets?.openings || []));
      const sentence = pool[idx] || pool[0];
      if (!sentence) return;
      draftInput.value = injectTemplateIntoDraft(draftInput.value, sentence, kind);
      updateExamWordCountDisplay(draftInput, examWordCount);
      return;
    }

    const btn = e.target.closest('.gen-outline-draft-btn');
    if (btn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const p = generateThreeParagraphDraft(analyzeEssayTopic(topic));
      const old = resultContainer.querySelector('.outline-draft-block');
      if (old) old.remove();
      resultContainer.insertAdjacentHTML('beforeend', renderOutlineDraftBlock(p));
      draftInput.value = p.map((x) => x.join(' ')).join('\n\n');
      updateExamWordCountDisplay(draftInput, examWordCount);
      return;
    }

    const triadBtn = e.target.closest('.triad-outline-btn');
    if (triadBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const analysis = analyzeEssayTopic(topic);
      const draft = buildTriadTrainingOutlineCard(analysis);
      draftInput.value = draft;
      updateExamWordCountDisplay(draftInput, examWordCount);
      resultContainer.innerHTML = '<p class="agent-empty">已生成“三维训练提纲卡”，请直接扩写为完整作文。</p>';
      return;
    }

    const highScoreBtn = e.target.closest('.sh-highscore-card-btn');
    if (highScoreBtn) {
      const card = buildHighScoreChecklistDraft();
      draftInput.value = card;
      updateExamWordCountDisplay(draftInput, examWordCount);
      resultContainer.innerHTML = '<p class="agent-empty">已写入“上海一类卷考前清单”，可按清单逐段扩写。</p>';
      return;
    }

    const threePathBtn = e.target.closest('.three-path-card-btn');
    if (threePathBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const analysis = analyzeEssayTopic(topic);
      draftInput.value = buildThreePathDraft(analysis);
      updateExamWordCountDisplay(draftInput, examWordCount);
      resultContainer.innerHTML = '<p class="agent-empty">已写入“三路径深度思辨草稿”，可直接扩写成800字作文。</p>';
      return;
    }

    const pathWriteBtn = e.target.closest('.path-step-write-btn');
    if (pathWriteBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      const step = parseInt(pathWriteBtn.dataset.pathStep || '1', 10);
      const analysis = analyzeEssayTopic(topic);
      draftInput.value = appendPathStepTemplate(draftInput.value, analysis, step);
      updateExamWordCountDisplay(draftInput, examWordCount);
      return;
    }

    const pathCheckBtn = e.target.closest('.path-step-check-btn');
    if (pathCheckBtn) {
      const topic = topicInput.value.trim();
      const draft = draftInput.value.trim();
      if (!topic || !draft) return;
      const step = parseInt(pathCheckBtn.dataset.pathStep || '1', 10);
      const analysis = analyzeEssayTopic(topic);
      const result = evaluatePathStep(step, analysis, draft);
      const state = getPathTrainingState(topic);
      if (result.pass) {
        state.completed[step] = true;
        state.unlocked = Math.max(state.unlocked, Math.min(3, step + 1));
      }
      state.updatedAt = Date.now();
      savePathTrainingState(topic, state);
      renderAgentResult(analyzeEssayTopic(topic), resultContainer);
      renderPathTrainingFeedback(resultContainer, result.pass, result.message);
      return;
    }

    const pathResetBtn = e.target.closest('.path-reset-btn');
    if (pathResetBtn) {
      const topic = topicInput.value.trim();
      if (!topic) return;
      resetPathTrainingState(topic);
      renderAgentResult(analyzeEssayTopic(topic), resultContainer);
      renderPathTrainingFeedback(resultContainer, true, '本题逐步训练进度已重置。');
      return;
    }

    const triadTplBtn = e.target.closest('.triad-template-btn');
    if (triadTplBtn) {
      const sentence = triadTplBtn.dataset.templateSentence || '';
      const targetParagraph = parseInt(triadTplBtn.dataset.targetParagraph || '0', 10);
      if (!sentence) return;
      draftInput.value = insertTemplateSentenceAtParagraph(draftInput.value, sentence, targetParagraph);
      updateExamWordCountDisplay(draftInput, examWordCount);
      return;
    }

    const fixBtn = e.target.closest('.flaw-fix-btn');
    if (fixBtn) {
      resultContainer.innerHTML = '<p class="agent-empty">这里只指出漏洞位置，请学生自己重写对应句子。</p>';
      return;
    }

    const gapFixBtn = e.target.closest('.triad-gap-fix-btn');
    if (gapFixBtn) {
      resultContainer.innerHTML = '<p class="agent-empty">三维缺口已指出，请学生根据提示自行补写，不由AI代改。</p>';
      return;
    }

    const paraRewriteBtn = e.target.closest('.paragraph-rewrite-btn');
    if (paraRewriteBtn) {
      resultContainer.innerHTML = '<p class="agent-empty">逐段问题已经标明，请学生自己重写该段，不由AI代写。</p>';
      return;
    }

    const boostBtn = e.target.closest('.apply-score-boost-btn');
    if (boostBtn) {
      resultContainer.innerHTML = '<p class="agent-empty">提分方向已经列出，请学生自己据此修改，不由AI代改正文。</p>';
      return;
    }

    const weakBtn = e.target.closest('.weak-training-btn');
    if (weakBtn) {
      const trainingPrompt = weakBtn.dataset.trainingPrompt || '';
      if (!trainingPrompt) return;
      const topic = topicInput.value.trim() || '请完成专项训练';
      topicInput.value = `${topic}\n【专项训练】${trainingPrompt}`;
      resultContainer.innerHTML = `<p class="agent-empty">已推送专项训练到题目输入框，点击“分析题目”开始训练。</p>`;
      return;
    }

    const errorDrillBtn = e.target.closest('.error-drill-btn');
    if (errorDrillBtn) {
      const trainingPrompt = errorDrillBtn.dataset.trainingPrompt || '';
      if (!trainingPrompt) return;
      const topic = topicInput.value.trim() || '请完成错因专项训练';
      topicInput.value = `${topic}\n【错因专项】${trainingPrompt}`;
      resultContainer.innerHTML = `<p class="agent-empty">已根据高频错因推送专项训练，请点击“分析题目”或直接续写。</p>`;
      return;
    }

    const weeklyPromptBtn = e.target.closest('.weekly-prompt-btn');
    if (weeklyPromptBtn) {
      const trainingPrompt = weeklyPromptBtn.dataset.trainingPrompt || '';
      if (!trainingPrompt) return;
      const topic = topicInput.value.trim() || '请完成本周补短板训练';
      topicInput.value = `${topic}\n【周训练补短板】${trainingPrompt}`;
      resultContainer.innerHTML = '<p class="agent-empty">已把本周补短板任务写入题目框，点击“分析题目”即可开练。</p>';
      return;
    }

    const weeklyTopicBtn = e.target.closest('.weekly-topic-btn');
    if (weeklyTopicBtn) {
      const recommendedTopic = weeklyTopicBtn.dataset.recommendedTopic || '';
      if (!recommendedTopic) return;
      topicInput.value = recommendedTopic;
      renderAgentResult(analyzeEssayTopic(recommendedTopic), resultContainer);
      topicInput.focus();
      document.getElementById('agentWorkbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const tierLoadBtn = e.target.closest('.tier-essay-load-btn');
    if (tierLoadBtn) {
      const idx = parseInt(tierLoadBtn.dataset.tierIndex || '-1', 10);
      const tier = tieredEssayCache[idx];
      if (!tier) return;
      draftInput.value = tier.draft;
      updateExamWordCountDisplay(draftInput, examWordCount);
      resultContainer.insertAdjacentHTML('afterbegin', `<div class="agent-result-block"><p class="agent-para-issues low">已把“${escapeHtml(tier.bandLabel)}”加载到草稿框，可直接评分或继续改写。</p></div>`);
      draftInput.focus();
      return;
    }
  });

  startExamModeBtn?.addEventListener('click', () => {
    if (examState.running && !examState.paused) return;
    examState.running = true;
    examState.paused = false;
    if (examModeStatus) examModeStatus.textContent = '进行中';
    if (examState.timer) clearInterval(examState.timer);
    examState.timer = setInterval(() => {
      if (!examState.running || examState.paused) return;
      examState.remaining = Math.max(0, examState.remaining - 1);
      renderExamCountdown(examCountdown, examState.remaining);
      if (examState.remaining === 0) {
        clearInterval(examState.timer);
        examState.running = false;
        if (examModeStatus) examModeStatus.textContent = '已结束';
      }
    }, 1000);
  });

  pauseExamModeBtn?.addEventListener('click', () => {
    if (!examState.running) return;
    examState.paused = !examState.paused;
    if (examModeStatus) examModeStatus.textContent = examState.paused ? '已暂停' : '进行中';
  });

  resetExamModeBtn?.addEventListener('click', () => {
    if (examState.timer) clearInterval(examState.timer);
    examState.running = false;
    examState.paused = false;
    examState.remaining = EXAM_MODE_DURATION_SEC;
    renderExamCountdown(examCountdown, examState.remaining);
    if (examModeStatus) examModeStatus.textContent = '未开始';
  });
}

function bindGenerateEssayButton(btn, topicInput, draftInput, resultContainer, examWordCount, casePoolSelect) {
  if (!btn || btn.dataset.boundGenerate === '1') return;
  btn.dataset.boundGenerate = '1';
  btn.addEventListener('click', () => {
    try {
      const topic = (topicInput?.value || '').trim();
      if (!topic) {
        if (resultContainer) resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>';
        return;
      }
      const analysis = analyzeEssayTopic(topic);
      const casePool = getSelectedCasePool(casePoolSelect);
      const fullEssay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool });
      if (draftInput) draftInput.value = fullEssay;
      updateExamWordCountDisplay(draftInput, examWordCount);
      const offTopic = runOffTopicCheck(topic, fullEssay);
      const score = scoreEssayDraft(topic, fullEssay);
      updateTrainingStats(score.dimensions, {
        topic,
        total: score.total,
        score70: score.score70,
        riskLevel: score.offTopic?.riskLevel || '中',
        source: 'generate',
        topicType: detectTopicType(topic).name
      });
      renderGeneratedEssayReport({
        topic,
        draft: fullEssay,
        wordCount: countWords(fullEssay),
        score,
        offTopic,
        exampleAnchorTitle: analysis.exampleGuidedKit?.anchorCard?.title || ''
      }, resultContainer);
    } catch (err) {
      const msg = err?.message || '未知错误';
      if (resultContainer) resultContainer.innerHTML = `<p class="agent-empty">范文生成失败：${escapeHtml(msg)}</p>`;
    }
  });
}

function renderWorkbenchActionError(container, title, error) {
  if (!container) return;
  const message = error?.message || String(error || '未知错误');
  console.error(title, error);
  container.innerHTML = `
    <div class="agent-result-block">
      <h4>${escapeHtml(title)}</h4>
      <p class="agent-para-issues high">系统没有完成本次报告，但不会再卡在加载状态。</p>
      <p>错误信息：${escapeHtml(message)}</p>
      <p>可以先点击“防跑题检查”，或刷新页面后再试一次。</p>
    </div>
  `;
}

function analyzeEssayTopic(topic) {
  const t = topic.toLowerCase();
  const scores = { dialectics: 0, epistemology: 0, axiology: 0, ethics: 0, other: 0, thinking: 0 };
  const lens = [];
  AGENT_RULES.forEach((rule) => {
    const m = t.match(rule.regex) || [];
    if (!m.length) return;
    scores[rule.category] += m.length;
    lens.push(rule.lens);
  });
  if (!Object.values(scores).some((x) => x > 0)) scores.thinking = 2;
  const rankedCategories = Object.keys(scores).sort((a, b) => scores[b] - scores[a]).filter((k) => scores[k] > 0).slice(0, 3);
  const topicType = detectTopicType(topic);
  const topicPhrases = normalizeTopicPhrases(extractTopicPhrases(topic));
  const exampleGuidedKit = buildExampleGuidedKit(topic, topicType, topicPhrases);
  const methodGuidedKit = buildMethodGuidedKit(topic, topicType, topicPhrases);
  const hiddenPremise = detectHiddenPremise(topic, topicType, topicPhrases);
  const mustAnswerQuestions = dedupeArray([
    ...buildMustAnswerQuestions(topic, topicType, topicPhrases, hiddenPremise),
    ...(exampleGuidedKit?.mustAnswers || [])
  ]).slice(0, 6);
  const pitfalls = dedupeArray([
    ...(exampleGuidedKit?.pitfalls || []),
    ...buildTopicPitfalls(topic, topicType, topicPhrases)
  ]).slice(0, 6);
  const examinerIntent = dedupeArray([
    ...(exampleGuidedKit?.intent || []),
    ...buildExaminerIntent(topic, topicType, topicPhrases)
  ]).slice(0, 5);
  const threeStepAnalysis = buildThreeStepAnalysis(topic, topicType, topicPhrases);
  const mustAnswerChecklist = dedupeArray([
    ...buildMustAnswerChecklist(topic, topicType, topicPhrases, hiddenPremise),
    ...(exampleGuidedKit?.mustAnswers || [])
  ]).slice(0, 6);
  const examReadyTemplates = buildExamReadyTemplates(topic, topicType, topicPhrases);
  const triadTrainingKit = buildTriadTrainingKit(topic, topicType, topicPhrases);
  const threePathKit = buildThreePathMethodKit(topic, topicType, topicPhrases);
  const stanceOptions = buildStanceOptions(topic, topicType, topicPhrases);
  const thesis = exampleGuidedKit?.thesis || buildTopicThesis(topic, topicType, topicPhrases);
  const outline = exampleGuidedKit?.structure?.length
    ? exampleGuidedKit.structure
    : buildTopicOutline(topic, topicType, topicPhrases, thesis);
  return {
    topic,
    topicType,
    topicPhrases,
    rankedCategories,
    lensSuggestions: dedupeArray(lens).slice(0, 4),
    examinerIntent,
    threeStepAnalysis,
    mustAnswerChecklist,
    examReadyTemplates,
    triadTrainingKit,
    threePathKit,
    exampleGuidedKit,
    methodGuidedKit,
    hiddenPremise,
    mustAnswerQuestions,
    pitfalls,
    thesis,
    outline,
    examReadySentences: buildExamReadySentences(topic, topicType, topicPhrases),
    examTemplateSets: buildExamTemplateSets(topic, topicType, topicPhrases),
    stanceOptions
  };
}

function renderAgentResult(analysis, container) {
  const tags = analysis.rankedCategories.map((c) => `<span class="agent-tag">${escapeHtml(CATEGORY_LABEL_MAP[c] || c)}</span>`).join('');
  const lens = analysis.lensSuggestions.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const outline = analysis.outline.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const stances = (analysis.stanceOptions || []).map((s) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(s.title)}</span></div>
      <p>${escapeHtml(s.thesis)}</p>
      <p>${escapeHtml(s.risk)}</p>
    </div>`).join('');
  const mustAnswers = (analysis.mustAnswerQuestions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const pitfalls = (analysis.pitfalls || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const intentRows = (analysis.examinerIntent || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const stepRows = (analysis.threeStepAnalysis || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const checklistRows = (analysis.mustAnswerChecklist || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const triadKit = analysis.triadTrainingKit || { blocks: [], integration: [], selfCheck: [] };
  const triadRows = (triadKit.blocks || []).map((b) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(b.title || '')}</span></div>
      <p>${escapeHtml(b.focus || '')}</p>
      <ol>${(b.actions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ol>
    </div>
  `).join('');
  const triadIntegrationRows = (triadKit.integration || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const triadCheckRows = (triadKit.selfCheck || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const triadTemplates = buildTriadTemplateSentences(analysis);
  const triadTplBlock = `
    <p><strong>可点击填充模板句</strong></p>
    <div class="score-grid">
      <div class="flaw-row">
        <div class="flaw-row-top"><span>审题立意句</span></div>
        <ol>${triadTemplates.openings.map((x) => `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="1">插入第1段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="2">插入第2段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="3">插入第3段</button></li>`).join('')}</ol>
      </div>
      <div class="flaw-row">
        <div class="flaw-row-top"><span>逻辑转折句</span></div>
        <ol>${triadTemplates.turnings.map((x) => `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="1">插入第1段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="2">插入第2段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="3">插入第3段</button></li>`).join('')}</ol>
      </div>
      <div class="flaw-row">
        <div class="flaw-row-top"><span>升华收束句</span></div>
        <ol>${triadTemplates.closings.map((x) => `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="1">插入第1段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="2">插入第2段</button> <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(x)}" data-target-paragraph="3">插入第3段</button></li>`).join('')}</ol>
      </div>
    </div>
  `;
  const highScoreGuide = buildShanghaiHighScoreGuide();
  const highScoreWeights = highScoreGuide.weights.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const highScoreStruct = highScoreGuide.structures.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const highScoreDebate = highScoreGuide.debateTips.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const highScoreLang = highScoreGuide.languageTips.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const highScorePit = highScoreGuide.pitfalls.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const threePathKit = analysis.threePathKit || { concept: [], classify: [], reality: [], caution: '' };
  const matchedExamples = pickRelevantExampleCards(analysis.topic, analysis.topicType, 3);
  const exampleGuidedKit = analysis.exampleGuidedKit || null;
  const methodGuidedKit = analysis.methodGuidedKit || null;
  const matchedExampleRows = renderTrainingExampleQuickRows(matchedExamples);
  const exampleGuidedBlock = exampleGuidedKit ? `
    <div class="agent-result-block">
      <h4>范例驱动题目解读</h4>
      <p><strong>命中的母题</strong>：${escapeHtml(exampleGuidedKit.anchorCard?.title || '未命中')}</p>
      <p><strong>这题真正要抓什么</strong></p>
      <ul>${(exampleGuidedKit.intent || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <p><strong>建议立意</strong>：${escapeHtml(exampleGuidedKit.thesis || '待提炼')}</p>
      <p><strong>建议结构</strong></p>
      <ol>${(exampleGuidedKit.structure || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ol>
      <p><strong>先避开的失误</strong></p>
      <ul>${(exampleGuidedKit.pitfalls || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <p><strong>生成提醒</strong></p>
      <ul>${(exampleGuidedKit.generatorHints || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </div>
  ` : '';
  const methodGuidedBlock = methodGuidedKit ? `
    <div class="agent-result-block">
      <h4>22-23 方法论提醒</h4>
      <p>这部分来自《作文范例 22-23》的备考方法档案，用来把“会想”真正变成“会写”。</p>
      <div class="score-grid">
        ${(methodGuidedKit.notes || []).map((note) => `
          <div class="flaw-row">
            <div class="flaw-row-top"><span>${escapeHtml(note.title)}</span><strong>${escapeHtml(note.source || '')}</strong></div>
            <p>${escapeHtml(note.focus || '')}</p>
          </div>
        `).join('')}
      </div>
      <p><strong>分析时先做这几步</strong></p>
      <ul>${(methodGuidedKit.analysisActions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </div>
  ` : '';
  const pathTraining = getPathTrainingState(analysis.topic);
  const pathStepRows = renderPathStepRows(pathTraining);
  const conceptRows = (threePathKit.concept || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const classifyRows = (threePathKit.classify || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const realityRows = (threePathKit.reality || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const readyTpl = analysis.examReadyTemplates || { opening: '', turning: '', rising: '' };
  const eightTrainingPanel = renderTeacherEightTrainingPanel(analysis);
  const openingTpl = (analysis.examTemplateSets?.openings || []).map((x, idx) =>
    `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost template-use-btn" type="button" data-template-kind="opening" data-template-index="${idx}">用作开头</button></li>`
  ).join('');
  const turningTpl = (analysis.examTemplateSets?.turnings || []).map((x, idx) =>
    `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost template-use-btn" type="button" data-template-kind="turning" data-template-index="${idx}">插入转折</button></li>`
  ).join('');
  const risingTpl = (analysis.examTemplateSets?.risings || []).map((x, idx) =>
    `<li><span>${escapeHtml(x)}</span> <button class="agent-btn ghost template-use-btn" type="button" data-template-kind="rising" data-template-index="${idx}">用作结尾</button></li>`
  ).join('');

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>题目分析：${escapeHtml(analysis.topic)}</h3>
      <div class="agent-tags">${tags}<span class="agent-tag">题型：${escapeHtml(analysis.topicType.name)}</span></div>
    </div>
    ${eightTrainingPanel}
    ${exampleGuidedBlock}
    ${methodGuidedBlock}
    <div class="agent-result-block"><h4>出题人意图（筛选什么）</h4><ul>${intentRows}</ul></div>
    <div class="agent-result-block"><h4>三步拆题法（立刻可用）</h4><ul>${stepRows}</ul></div>
    <div class="agent-result-block"><h4>必答清单（不答会掉档）</h4><ul>${checklistRows}</ul></div>
    <div class="agent-result-block">
      <h4>思辨三维训练包（审题 / 逻辑 / 语言）</h4>
      <div class="score-grid">${triadRows}</div>
      <p><strong>一体化落地路径</strong></p>
      <ul>${triadIntegrationRows}</ul>
      <p><strong>自检评分清单</strong></p>
      <ul>${triadCheckRows}</ul>
      ${triadTplBlock}
      <div class="agent-actions secondary">
        <button class="agent-btn primary triad-outline-btn" type="button">一键生成训练提纲卡</button>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>上海一类卷冲刺卡（63-70）</h4>
      <p><strong>评分命脉（权重）</strong></p>
      <ul>${highScoreWeights}</ul>
      <p><strong>结构模板</strong></p>
      <ul>${highScoreStruct}</ul>
      <p><strong>思辨与论证</strong></p>
      <ul>${highScoreDebate}</ul>
      <p><strong>语言规范</strong></p>
      <ul>${highScoreLang}</ul>
      <p><strong>避坑清单</strong></p>
      <ul>${highScorePit}</ul>
      <p><strong>高分口诀</strong>：${escapeHtml(highScoreGuide.mantra)}</p>
      <div class="agent-actions secondary">
        <button class="agent-btn primary sh-highscore-card-btn" type="button">一键写入考前清单</button>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>三路径深度思辨训练</h4>
      <p><strong>路径一：概念辨析法</strong></p>
      <ul>${conceptRows}</ul>
      <p><strong>路径二：分类讨论法</strong></p>
      <ul>${classifyRows}</ul>
      <p><strong>路径三：现实关联法</strong></p>
      <ul>${realityRows}</ul>
      <p><strong>使用提醒</strong>：${escapeHtml(threePathKit.caution || '紧扣题眼，具体问题具体分析。')}</p>
      <div class="agent-actions secondary">
        <button class="agent-btn primary three-path-card-btn" type="button">一键写入三路径草稿</button>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>匹配到的上海范例训练卡</h4>
      <p>下面这些卡片来自《作文范例 25-26》提炼，可直接借结构、借点评、借训练动作。</p>
      <div class="score-grid">${matchedExampleRows}</div>
    </div>
    <div class="agent-result-block">
      <h4>逐步训练模式（长期提分）</h4>
      <p>当前进度：${escapeHtml(pathTraining.statusText)}</p>
      <div class="score-grid">${pathStepRows}</div>
      <div class="agent-actions secondary">
        <button class="agent-btn ghost path-reset-btn" type="button">重置本题进度</button>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>考场可用模板（直接套）</h4>
      <p>首句模板：${escapeHtml(readyTpl.opening)}</p>
      <p>转折模板：${escapeHtml(readyTpl.turning)}</p>
      <p>升华模板：${escapeHtml(readyTpl.rising)}</p>
      <div class="agent-actions secondary">
        <button class="agent-btn primary convert-four-block-btn" type="button">一键转草稿骨架</button>
      </div>
    </div>
    <div class="agent-result-block"><h4>隐含前提</h4><p>${escapeHtml(analysis.hiddenPremise || '无')}</p></div>
    <div class="agent-result-block"><h4>必答问题（不答会掉档）</h4><ul>${mustAnswers}</ul></div>
    <div class="agent-result-block"><h4>审题切口</h4><ul>${lens}</ul></div>
    <div class="agent-result-block"><h4>高分避坑</h4><ul>${pitfalls}</ul></div>
    <div class="agent-result-block"><h4>三种立场可选</h4>${stances}</div>
    <div class="agent-result-block"><h4>核心立意</h4><p>${escapeHtml(analysis.thesis)}</p></div>
    <div class="agent-result-block"><h4>三段式骨架</h4><ol>${outline}</ol></div>
    <div class="agent-result-block">
      <h4>考场可写句</h4>
      <p>开头句：${escapeHtml(analysis.examReadySentences.opening)}</p>
      <p>中心句：${escapeHtml(analysis.examReadySentences.thesis)}</p>
      <p>转折句：${escapeHtml(analysis.examReadySentences.turning || '')}</p>
      <p>结尾句：${escapeHtml(analysis.examReadySentences.closing)}</p>
      <div class="agent-actions secondary"><button class="agent-btn primary gen-outline-draft-btn" type="button">一键生成三段提纲草稿</button></div>
      <div class="agent-result-block">
        <h4>考场模板库（可直接套用）</h4>
        <p><strong>首句模板</strong></p><ol>${openingTpl}</ol>
        <p><strong>转折模板</strong></p><ol>${turningTpl}</ol>
        <p><strong>升华模板</strong></p><ol>${risingTpl}</ol>
      </div>
    </div>`;
}

function renderEssaySampleList(container, activeFilter, favorites) {
  if (!container) return;
  const list = ESSAY_SAMPLE_LIST.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favorites') return favorites.has(item.id);
    return (item.categories || []).includes(activeFilter);
  });
  if (!list.length) {
    container.innerHTML = '<div class="essay-lib-item"><div class="essay-lib-meta"><strong>暂无匹配范文</strong><span>切换筛选再试。</span></div></div>';
    return;
  }
  container.innerHTML = list.map((item) => `
    <div class="essay-lib-item">
      <div class="essay-lib-meta"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml((item.categories || []).join(' / '))} ｜ ${escapeHtml(item.topic)}</span></div>
      <div class="essay-lib-actions">
        <button class="essay-lib-star ${favorites.has(item.id) ? 'active' : ''}" type="button" data-sample-id="${escapeHtml(item.id)}">${favorites.has(item.id) ? '★' : '☆'}</button>
        <button class="essay-lib-load" type="button" data-sample-id="${escapeHtml(item.id)}">加载</button>
      </div>
    </div>`).join('');
}

function renderEssayFilterBar(container, activeFilter, favorites) {
  if (!container) return;
  const options = [
    { id: 'all', label: '全部' },
    { id: 'favorites', label: `收藏(${favorites.size})` },
    { id: '问题式命题', label: '问题式命题' },
    { id: '关系辩证题', label: '关系辩证题' },
    { id: '价值判断题', label: '价值判断题' }
  ];
  container.innerHTML = options.map((o) => `<button class="essay-filter-btn ${activeFilter === o.id ? 'active' : ''}" type="button" data-filter="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`).join('');
}

function renderMaterialCardList(container) {
  if (!container) return;
  const cards = [...loadMaterialCards()].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 8);
  if (!cards.length) {
    container.innerHTML = '<div class="material-card-empty">暂无素材卡。粘贴一篇文章后，点击“生成素材卡”。</div>';
    return;
  }
  container.innerHTML = cards.map((card) => `
    <div class="material-card-item">
      <div class="material-card-main">
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(card.topic || '未提取题目')}</span>
        <div class="agent-tags">${(card.tags || []).slice(0, 4).map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
      <div class="material-card-actions">
        <button class="agent-btn ghost material-card-use" type="button" data-card-id="${escapeHtml(card.id)}">查看/调用</button>
        <button class="agent-btn ghost material-card-train" type="button" data-card-id="${escapeHtml(card.id)}">练此题</button>
        <button class="agent-btn ghost material-card-delete" type="button" data-card-id="${escapeHtml(card.id)}">删除</button>
      </div>
    </div>
  `).join('');
}

function renderMaterialCardCreatedReport(card) {
  return `
    <div class="agent-result-head">
      <h3>素材卡已生成</h3>
      <div class="agent-tags">
        <span class="agent-tag">本地保存</span>
        <span class="agent-tag">原文字数：${card.wordCount || 0}</span>
        ${(card.tags || []).slice(0, 4).map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
    ${renderMaterialCardDetail(card, true)}
  `;
}

function renderMaterialCardDetail(card, innerOnly = false) {
  const structureRows = (card.structure || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const materialRows = (card.materials || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const goldenRows = (card.goldenSentences || []).map((x) => `<li class="sentence-good">${escapeHtml(x)}</li>`).join('');
  const body = `
    <div class="agent-result-block">
      <h4>${escapeHtml(card.title)}</h4>
      <p><strong>提取题目：</strong>${escapeHtml(card.topic || '未提取')}</p>
      <p><strong>中心论点：</strong>${escapeHtml(card.thesis || '待补充')}</p>
    </div>
    <div class="agent-result-block"><h4>结构拆解</h4><ol>${structureRows || '<li>暂无结构信息</li>'}</ol></div>
    <div class="agent-result-block"><h4>可借鉴素材</h4><ul>${materialRows || '<li>暂无素材句，可重新粘贴更完整正文。</li>'}</ul></div>
    <div class="agent-result-block"><h4>高分句式</h4><ul>${goldenRows || '<li>暂无明显高分句。</li>'}</ul></div>
    <div class="agent-result-block">
      <h4>如何调用</h4>
      <p>已切换到“案例素材池：我的素材卡”后，再点“一键生成800-850字范文”，系统会优先调用这类素材卡。</p>
    </div>`;
  if (innerOnly) return body;
  return `
    <div class="agent-result-head">
      <h3>素材卡详情</h3>
      <div class="agent-tags">${(card.tags || []).slice(0, 5).map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`).join('')}</div>
    </div>
    ${body}`;
}

function loadEssayFavorites() {
  try {
    const raw = localStorage.getItem(ESSAY_FAVORITES_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (_) {
    return new Set();
  }
}

function saveEssayFavorites(set) {
  try { localStorage.setItem(ESSAY_FAVORITES_STORAGE_KEY, JSON.stringify([...set])); } catch (_) {}
}

function normalizeTrainingStatsPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') return { count: 0, dims: {}, sessions: [] };
  const sessions = Array.isArray(parsed.sessions)
    ? parsed.sessions
      .map((item) => ({
        day: typeof item?.day === 'string' ? item.day : getDateKey(Number(item?.ts || Date.now())),
        total: clamp(Number(item?.total || 0), 0, 100),
        score70: clamp(Number(item?.score70 || 0), 0, 70),
        riskLevel: typeof item?.riskLevel === 'string' ? item.riskLevel : '中',
        source: typeof item?.source === 'string' ? item.source : 'score',
        topicType: typeof item?.topicType === 'string' ? item.topicType : '未分类',
        topic: topicTrainingKey(item?.topic || ''),
        ts: Number(item?.ts || Date.now())
      }))
      .slice(-TRAINING_SESSION_LIMIT)
    : [];
  return {
    count: Number(parsed.count || 0),
    dims: parsed.dims && typeof parsed.dims === 'object' ? parsed.dims : {},
    sessions
  };
}

function loadTrainingStats() {
  try {
    const raw = localStorage.getItem(TRAINING_STATS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeTrainingStatsPayload(parsed);
  } catch (_) {
    return { count: 0, dims: {}, sessions: [] };
  }
}

function updateTrainingStats(dimensions, meta = {}) {
  if (!Array.isArray(dimensions) || !dimensions.length) return;
  const stats = loadTrainingStats();
  stats.count += 1;
  dimensions.forEach((d) => {
    const key = d.label;
    const prev = stats.dims[key] || { sum: 0, max: d.max || 20, times: 0 };
    prev.sum += d.score;
    prev.max = d.max || prev.max || 20;
    prev.times += 1;
    stats.dims[key] = prev;
  });
  const total = clamp(Number(meta.total || dimensions.reduce((sum, item) => sum + Number(item.score || 0), 0)), 0, 100);
  const session = {
    day: getDateKey(meta.ts),
    total,
    score70: clamp(Number(meta.score70 || Math.round(total * 0.7)), 0, 70),
    riskLevel: normalizeRiskLabel(meta.riskLevel),
    source: typeof meta.source === 'string' ? meta.source : 'score',
    topicType: typeof meta.topicType === 'string' && meta.topicType.trim() ? meta.topicType.trim() : '未分类',
    topic: topicTrainingKey(meta.topic || ''),
    ts: Number(meta.ts || Date.now())
  };
  stats.sessions = Array.isArray(stats.sessions) ? [...stats.sessions, session].slice(-TRAINING_SESSION_LIMIT) : [session];
  try { localStorage.setItem(TRAINING_STATS_STORAGE_KEY, JSON.stringify(stats)); } catch (_) {}
}

function loadErrorBook() {
  try {
    const raw = localStorage.getItem(ERROR_BOOK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return { records: [], tags: {} };
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      tags: parsed.tags && typeof parsed.tags === 'object' ? parsed.tags : {}
    };
  } catch (_) {
    return { records: [], tags: {} };
  }
}

function saveErrorBook(book) {
  try { localStorage.setItem(ERROR_BOOK_STORAGE_KEY, JSON.stringify(book)); } catch (_) {}
}

function getDateKey(ts) {
  const d = new Date(Number(ts || Date.now()));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildRecentDateKeys(days) {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    arr.push(getDateKey(d.getTime()));
  }
  return arr;
}

function formatDateShort(key) {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function normalizeRiskLabel(level) {
  if (typeof level !== 'string') return '中';
  if (/低/.test(level)) return '低';
  if (/高/.test(level)) return '高';
  return '中';
}

function calculateTrainingStreak(sessions) {
  const days = dedupeArray((Array.isArray(sessions) ? sessions : []).map((item) => item.day).filter(Boolean)).sort();
  if (!days.length) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const daySet = new Set(days);
  while (daySet.has(getDateKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function extractErrorTags({ draft, score, offTopic }) {
  const tags = [];
  const hasDraftText = typeof draft === 'string' && draft.trim().length > 0;
  const wordCount = hasDraftText ? countWords(draft) : Number(score?.stats?.wordCount || 0);
  const dims = offTopic?.scaffold?.dimensions || [];
  const d = (id) => dims.find((x) => x.id === id)?.score ?? 100;
  if (d('d1') < 65) tags.push('题眼覆盖不足');
  if (d('d2') < 65 || (offTopic?.precision?.oppositionCoverage?.score ?? 100) < 60) tags.push('辩证覆盖不足');
  if (d('d3') < 65) tags.push('机制解释不足');
  if (d('d4') < 65) tags.push('现实关联不足');
  if (d('d5') < 65 || (offTopic?.precision?.risingQuality?.score ?? 100) < 60) tags.push('边界收束薄弱');
  if (d('d6') < 65) tags.push('结构节奏松散');
  if ((score?.dimensions || []).find((x) => x.label === '审题立意')?.score < 15) tags.push('审题立意偏弱');
  if ((score?.dimensions || []).find((x) => x.label === '论证与材料')?.score < 15) tags.push('论证材料偏弱');
  if ((score?.dimensions || []).find((x) => x.label === '语言表达')?.score < 15) tags.push('语言表达偏弱');
  if ((score?.dimensions || []).find((x) => x.label === '思辨深度')?.score < 15) tags.push('思辨深度不足');
  if (wordCount > 0 && wordCount < 760) tags.push('字数不足');
  if (wordCount > 920) tags.push('篇幅冗余');
  (offTopic?.flawScan || []).forEach((item) => {
    if (/绝对化/.test(item.name)) tags.push('结论绝对化');
    if (/例证堆砌/.test(item.name)) tags.push('例证堆砌');
    if (/单边论证/.test(item.name)) tags.push('单边论证');
  });
  return dedupeArray(tags).slice(0, 8);
}

function recordErrorBookEntry({ topic, draft, score, offTopic, source }) {
  const book = loadErrorBook();
  const tags = extractErrorTags({ draft, score, offTopic });
  if (!tags.length) return;
  const fingerprint = `${topicTrainingKey(topic)}|${tags.join('|')}|${countWords(draft || '')}`;
  const last = book.records[book.records.length - 1];
  if (last && last.fingerprint === fingerprint && Math.abs(Date.now() - Number(last.ts || 0)) < 15000) return;

  const entry = {
    topic: topicTrainingKey(topic),
    source: source || 'manual',
    tags,
    wordCount: countWords(draft || ''),
    ts: Date.now(),
    fingerprint
  };
  book.records.push(entry);
  if (book.records.length > 80) book.records = book.records.slice(-80);
  tags.forEach((tag) => {
    const prev = book.tags[tag] || { count: 0, lastTopic: '', lastTs: 0 };
    prev.count += 1;
    prev.lastTopic = entry.topic;
    prev.lastTs = entry.ts;
    book.tags[tag] = prev;
  });
  saveErrorBook(book);
}

function buildErrorDrillFromTag(tag) {
  if (tag === '题眼覆盖不足') return { drill: '练习：每段首句必须回扣题眼，写3个不同版本。', prompt: '请围绕题眼，写3个段首回扣句。' };
  if (tag === '辩证覆盖不足') return { drill: '练习：补一段“诚然-然而-因此”三句辩证论证。', prompt: '请写一段含诚然、然而、因此的辩证论证。' };
  if (tag === '机制解释不足') return { drill: '练习：任选1个例子，补2句“为什么能证明观点”的机制解释。', prompt: '请给例子补写两句机制解释。' };
  if (tag === '现实关联不足') return { drill: '练习：把观点放进校园/平台/社会场景，各写1句现实落点。', prompt: '请补3句现实关联句，分别对应校园、平台、社会。' };
  if (tag === '边界收束薄弱') return { drill: '练习：写2句条件化结尾，必须含“前提/边界/未必”。', prompt: '请写两个有边界条件的结尾句。' };
  if (tag === '结构节奏松散') return { drill: '练习：按“界定-论证-收束”把草稿重分三段。', prompt: '请把当前草稿整理成界定、论证、收束三段。' };
  if (tag === '结论绝对化') return { drill: '练习：把5个绝对词改成条件化表述。', prompt: '请把绝对化表达改成条件化判断。' };
  if (tag === '例证堆砌') return { drill: '练习：删1个例子，补1条分析链。', prompt: '请减少例证堆砌，改成机制分析。' };
  if (tag === '单边论证') return { drill: '练习：补另一端价值与风险，各写1句。', prompt: '请补写另一端的价值和风险。' };
  if (tag === '字数不足') return { drill: '练习：补“现实分析段 + 条件收束段”各2句。', prompt: '请补足字数，增加现实分析和结尾收束。' };
  return { drill: '练习：围绕该错因补一段“观点-依据-分析”闭环。', prompt: `请围绕“${tag}”做专项训练。` };
}

function buildErrorBookSummary(report) {
  const currentTags = extractErrorTags({ score: report, offTopic: report.offTopic || report });
  const book = loadErrorBook();
  const top = Object.entries(book.tags || {})
    .map(([tag, info]) => ({ tag, count: Number(info.count || 0), lastTopic: info.lastTopic || '' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const drills = top.slice(0, 3).map((item) => ({ ...item, ...buildErrorDrillFromTag(item.tag) }));
  const recent = (book.records || []).slice(-5).reverse();
  return { currentTags, top, drills, recent, total: (book.records || []).length };
}

function buildWeakTrainingPlan(report) {
  const stats = loadTrainingStats();
  const current = (report.dimensions || []).map((d) => {
    const avg = stats.dims?.[d.label]?.times ? (stats.dims[d.label].sum / stats.dims[d.label].times) : d.score;
    return { label: d.label, score: d.score, avg };
  });
  const weak = current.sort((a, b) => (a.score + a.avg) - (b.score + b.avg)).slice(0, 2);
  const plan = weak.map((w) => buildWeakDimensionDrill(w.label));
  return { count: stats.count, weak: plan };
}

function buildWeakDimensionDrill(label) {
  if (label === '审题立意') return { label, drill: '练习：给同一题写3个“条件化立场句”，每句必须含“前提/边界”。', prompt: '请写3个不同立场的条件化中心论点句。' };
  if (label === '结构章法') return { label, drill: '练习：把一段散文改成“界定-论证-收束”三段，每段2句。', prompt: '请把草稿改写为三段结构，每段2句。' };
  if (label === '论证与材料') return { label, drill: '练习：任选1个例子，补写2句“机制解释”，禁止只叙事。', prompt: '请给这个例子补两句机制解释。' };
  if (label === '语言表达') return { label, drill: '练习：删去3句口号句，改成“判断句+依据句”。', prompt: '请将口号化句子改成判断+依据表达。' };
  return { label, drill: '练习：补一段“诚然-然而-因此”三句论证并写边界条件。', prompt: '请写一段三句辩证论证，包含边界条件。' };
}

function buildWeeklyTrainingDashboard() {
  const stats = loadTrainingStats();
  const sessions = Array.isArray(stats.sessions) ? stats.sessions : [];
  const recentDays = buildRecentDateKeys(7);
  const recentSet = new Set(recentDays);
  const dayMap = Object.fromEntries(recentDays.map((day) => [day, { count: 0, score70Sum: 0, risks: { 低: 0, 中: 0, 高: 0 } }]));
  const weeklySessions = sessions.filter((item) => recentSet.has(item.day));
  weeklySessions.forEach((item) => {
    const bucket = dayMap[item.day];
    if (!bucket) return;
    bucket.count += 1;
    bucket.score70Sum += Number(item.score70 || 0);
    bucket.risks[normalizeRiskLabel(item.riskLevel)] += 1;
  });

  const dayRows = recentDays.map((day) => {
    const bucket = dayMap[day];
    return {
      day,
      label: formatDateShort(day),
      count: bucket.count,
      avg70: bucket.count ? Math.round(bucket.score70Sum / bucket.count) : 0,
      riskHigh: bucket.risks.高
    };
  });

  const weeklyCount = weeklySessions.length;
  const avg70 = weeklyCount ? Math.round(weeklySessions.reduce((sum, item) => sum + Number(item.score70 || 0), 0) / weeklyCount) : 0;
  const avgTotal = weeklyCount ? Math.round(weeklySessions.reduce((sum, item) => sum + Number(item.total || 0), 0) / weeklyCount) : 0;
  const riskCounts = weeklySessions.reduce((acc, item) => {
    acc[normalizeRiskLabel(item.riskLevel)] += 1;
    return acc;
  }, { 低: 0, 中: 0, 高: 0 });
  const streak = calculateTrainingStreak(sessions);

  const weakestDims = Object.entries(stats.dims || {})
    .map(([label, item]) => ({ label, avg: item.times ? Math.round((item.sum / item.times) * 10) / 10 : 0, times: Number(item.times || 0) }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .map((item) => ({ ...item, ...buildWeakDimensionDrill(item.label) }));

  const errorBook = loadErrorBook();
  const recentCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const hotErrors = Object.entries(errorBook.tags || {})
    .map(([tag, meta]) => ({ tag, count: Number(meta?.count || 0), lastTs: Number(meta?.lastTs || 0) }))
    .filter((item) => item.lastTs >= recentCutoff)
    .sort((a, b) => b.count - a.count || b.lastTs - a.lastTs)
    .slice(0, 3);

  const recommendation = buildWeeklyTopicRecommendation(weakestDims, hotErrors);

  return {
    count: stats.count,
    weeklyCount,
    avg70,
    avgTotal,
    streak,
    dayRows,
    riskCounts,
    weakestDims,
    hotErrors,
    recommendation
  };
}

function buildWeeklyTopicRecommendation(weakestDims, hotErrors) {
  const weakLabel = weakestDims[0]?.label || '';
  const hotTag = hotErrors[0]?.tag || '';
  const pool = Array.isArray(TIMELINE_DATA) ? TIMELINE_DATA : [];
  let picked = null;

  const byYear = (year) => pool.find((item) => String(item.year) === String(year));
  if (!picked && (weakLabel === '审题立意' || /题眼覆盖|审题立意/.test(hotTag))) picked = byYear('2024') || byYear('2025');
  if (!picked && (weakLabel === '结构章法' || /结构节奏|字数不足/.test(hotTag))) picked = byYear('2022') || byYear('2014');
  if (!picked && (weakLabel === '论证与材料' || /机制解释|例证堆砌/.test(hotTag))) picked = byYear('2020') || byYear('2025');
  if (!picked && (weakLabel === '语言表达' || /语言表达|结论绝对化/.test(hotTag))) picked = byYear('2023') || byYear('2018');
  if (!picked && (weakLabel === '思辨深度' || /辩证覆盖|单边论证|边界收束/.test(hotTag))) picked = byYear('2014') || byYear('2021');
  if (!picked) picked = pool[0] || null;

  const prompt = weakestDims[0]?.prompt || (hotTag ? buildErrorDrillFromTag(hotTag).prompt : '请围绕本周最弱维度完成专项训练。');
  return {
    label: weakLabel || '综合训练',
    prompt,
    topic: picked?.prompt || '',
    year: picked?.year || ''
  };
}

function renderWeeklyDashboardReport(report, container) {
  const maxCount = Math.max(1, ...(report.dayRows || []).map((item) => item.count || 0));
  const bars = (report.dayRows || []).map((item) => `
    <div class="week-bar-card">
      <div class="week-bar-wrap"><span class="week-bar-fill" style="height:${item.count ? Math.max(14, Math.round((item.count / maxCount) * 88)) : 8}px"></span></div>
      <strong>${item.count}</strong>
      <span>${escapeHtml(item.label)}</span>
      <em>均分 ${item.avg70}</em>
    </div>
  `).join('');
  const weakRows = (report.weakestDims || []).map((item, index) => `
    <li>
      <strong>${index + 1}. ${escapeHtml(item.label)}</strong>（均分 ${escapeHtml(String(item.avg))}/20）：
      ${escapeHtml(item.drill)}
      <button class="agent-btn ghost weekly-prompt-btn" type="button" data-training-prompt="${escapeHtml(item.prompt)}">推送补练</button>
    </li>
  `).join('');
  const errorRows = (report.hotErrors || []).map((item, index) => `
    <li>
      <strong>${index + 1}. ${escapeHtml(item.tag)}</strong>（${item.count}次）
      <button class="agent-btn ghost weekly-prompt-btn" type="button" data-training-prompt="${escapeHtml(buildErrorDrillFromTag(item.tag).prompt)}">按错因补练</button>
    </li>
  `).join('');

  const recommendationTopic = report.recommendation?.topic || '';
  const recommendationButton = recommendationTopic
    ? `<button class="agent-btn primary weekly-topic-btn" type="button" data-recommended-topic="${escapeHtml(recommendationTopic)}">直接练这道题${report.recommendation?.year ? `（${escapeHtml(report.recommendation.year)}）` : ''}</button>`
    : '';

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>周训练看板</h3>
      <div class="agent-tags">
        <span class="agent-tag">累计训练：${report.count}次</span>
        <span class="agent-tag">近7天：${report.weeklyCount}次</span>
        <span class="agent-tag">近7天均分：${report.avg70}/70</span>
        <span class="agent-tag">连续打卡：${report.streak}天</span>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>最近7天训练走势</h4>
      <div class="week-bar-grid">${bars || '<p class="agent-empty">近7天还没有训练记录。</p>'}</div>
    </div>
    <div class="agent-result-block">
      <h4>本周风险分布</h4>
      <div class="agent-tags">
        <span class="agent-tag risk low">低风险 ${report.riskCounts?.低 || 0}</span>
        <span class="agent-tag risk medium">中风险 ${report.riskCounts?.中 || 0}</span>
        <span class="agent-tag risk high">高风险 ${report.riskCounts?.高 || 0}</span>
      </div>
      <p>如果“高风险”连续两天大于 0，优先先练审题和题眼覆盖，不要急着追求辞藻。</p>
    </div>
    <div class="agent-result-block">
      <h4>当前最弱维度</h4>
      <ul>${weakRows || '<li>暂未形成有效画像，先做2次评分再来看板。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>最近高频错因</h4>
      <ul>${errorRows || '<li>最近14天暂无明显高频错因，可继续稳定输出。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>本周推荐下一练</h4>
      <p>建议先补：<strong>${escapeHtml(report.recommendation?.label || '综合训练')}</strong>。先用专项练习补动作，再上真题更稳。</p>
      <div class="agent-actions secondary">
        <button class="agent-btn ghost weekly-prompt-btn" type="button" data-training-prompt="${escapeHtml(report.recommendation?.prompt || '请完成本周综合训练。')}">先做补短板训练</button>
        ${recommendationButton}
      </div>
    </div>`;
}

function initEvolutionOverview() {
  const box = document.getElementById('evolutionOverview');
  if (!box || typeof EVOLUTION_OVERVIEW !== 'object' || !EVOLUTION_OVERVIEW) return;
  const models = (EVOLUTION_OVERVIEW.models || []).map((m) => `
    <div class="evo-card">
      <h4>${escapeHtml(m.title || '')}</h4>
      <p>${escapeHtml(m.summary || '')}</p>
      <div class="evo-tags">${(m.years || []).map((y) => `<span class="evo-tag">${escapeHtml(y)}</span>`).join('')}</div>
    </div>
  `).join('');
  const stages = (EVOLUTION_OVERVIEW.stages || []).map((s, index) => {
    const sid = s.id || `stage-${index + 1}`;
    return `
      <details class="evo-stage-path" ${index === 0 ? 'open' : ''}>
        <summary>
          <span class="evo-stage-index">阶段 ${index + 1}</span>
          <strong>${escapeHtml(s.period || '')}｜${escapeHtml(s.title || '')}</strong>
        </summary>
        <p>${escapeHtml(s.detail || '')}</p>
        <button type="button" class="agent-btn ghost evo-stage-apply-btn" data-stage-id="${escapeHtml(sid)}">进入该阶段训练</button>
      </details>
    `;
  }).join('');
  const philosophy = (EVOLUTION_OVERVIEW.philosophy || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');

  box.innerHTML = `
    <div class="evo-head">
      <h3>${escapeHtml(EVOLUTION_OVERVIEW.headline || '')}</h3>
      <p>${escapeHtml(EVOLUTION_OVERVIEW.core || '')}</p>
    </div>
    <div class="evo-grid">${models}</div>
    <div class="evo-bottom">
      <div class="evo-block"><h4>哲学向度</h4><ul>${philosophy}</ul></div>
      <div class="evo-block"><h4>三阶段学习路径</h4>${stages}<div style="margin-top:8px;"><button type="button" class="agent-btn ghost evo-stage-reset-btn">显示全部年份</button></div></div>
    </div>
  `;

  box.addEventListener('click', (event) => {
    const applyBtn = event.target.closest('.evo-stage-apply-btn');
    if (applyBtn) {
      const sid = applyBtn.dataset.stageId || 'all';
      if (typeof window.setTimelineStageFilter === 'function') window.setTimelineStageFilter(sid);
      const randomItem = pickRandomTimelineItemByStage(sid);
      if (randomItem) {
        startTrainingFromTimelineItem(randomItem);
      } else {
        document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    const resetBtn = event.target.closest('.evo-stage-reset-btn');
    if (resetBtn) {
      if (typeof window.setTimelineStageFilter === 'function') window.setTimelineStageFilter('all');
      document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function initTimeline() {
  const container = document.getElementById('timelineContainer');
  const yearFilter = document.getElementById('timelineYearFilter');
  const typeFilter = document.getElementById('timelineTypeFilter');
  const summary = document.getElementById('timelineFilterSummary');
  const scoreGuideBox = document.getElementById('timelineScoreGuide');
  if (!container || !Array.isArray(TIMELINE_DATA)) return;

  const years = dedupeArray(TIMELINE_DATA.map((item) => String(item.year))).sort((a, b) => Number(b) - Number(a));
  if (yearFilter) {
    yearFilter.innerHTML = `<option value="all">全部年份</option>${years.map((y) => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('')}`;
  }

  const timelineState = { stageId: 'all' };
  window.setTimelineStageFilter = (stageId) => {
    timelineState.stageId = stageId || 'all';
    if (yearFilter) yearFilter.value = 'all';
    render();
  };

  const render = () => {
    const yearVal = yearFilter?.value || 'all';
    const typeVal = typeFilter?.value || 'all';
    const stageRange = getTimelineStageRange(timelineState.stageId);
    const list = TIMELINE_DATA.filter((item) => {
      if (yearVal !== 'all' && String(item.year) !== yearVal) return false;
      const t = classifyTimelineType(item);
      if (typeVal !== 'all' && t !== typeVal) return false;
      if (stageRange) {
        const y = Number(item.year);
        if (!Number.isFinite(y) || y < stageRange.startYear || y > stageRange.endYear) return false;
      }
      return true;
    });

    container.innerHTML = list.map((item) => {
      const t = classifyTimelineType(item);
      return `
        <div class="timeline-item visible timeline-train-item" data-year="${escapeHtml(item.year)}" data-topic="${escapeHtml(item.topic)}" data-prompt="${escapeHtml(item.prompt || '')}">
          <div class="timeline-dot"></div>
          <div class="timeline-year">${escapeHtml(item.year)}</div>
          <div class="timeline-topic">${escapeHtml(item.topic)}</div>
          <div class="timeline-philosophy">${escapeHtml(item.philosophy)} ｜ ${escapeHtml(t)}</div>
          ${item.prompt ? `<p style="margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5;">${escapeHtml(item.prompt)}</p>` : ''}
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
            <button class="agent-btn ghost timeline-train-btn" type="button" data-year="${escapeHtml(item.year)}">训练此题</button>
            <button class="agent-btn ghost timeline-score-btn" type="button" data-year="${escapeHtml(item.year)}">评分标准摘要</button>
          </div>
        </div>`;
    }).join('');

    if (summary) {
      const stageLabel = stageRange ? `｜阶段：${stageRange.period}` : '';
      summary.textContent = `当前匹配：${list.length} 题${stageLabel}`;
    }
  };

  yearFilter?.addEventListener('change', render);
  typeFilter?.addEventListener('change', render);
  container.addEventListener('click', (event) => {
    const scoreBtn = event.target.closest('.timeline-score-btn');
    if (scoreBtn) {
      const year = scoreBtn.dataset.year || '';
      renderTimelineScoreGuide(year, scoreGuideBox);
      return;
    }
    const trigger = event.target.closest('.timeline-train-btn, .timeline-train-item');
    if (!trigger) return;
    const card = trigger.classList.contains('timeline-train-item') ? trigger : trigger.closest('.timeline-train-item');
    if (!card) return;
    startTrainingFromTimelineCard(card);
  });
  renderTimelineScoreGuide('2025', scoreGuideBox);
  render();
}

function renderTimelineScoreGuide(year, box) {
  if (!box) return;
  const y = String(year || '');
  const text = TIMELINE_SCORE_GUIDE[y] || '该年份暂无专门摘要，建议按“审题立意、论证链、边界结论、语言表达”四项进行自检。';
  box.innerHTML = `<div class="score-guide-card"><strong>${escapeHtml(y)}年评分标准摘要（参考）</strong><p>${escapeHtml(text)}</p></div>`;
}

function getTimelineStageRange(stageId) {
  if (!stageId || stageId === 'all' || !EVOLUTION_OVERVIEW || !Array.isArray(EVOLUTION_OVERVIEW.stages)) return null;
  const stage = EVOLUTION_OVERVIEW.stages.find((s, index) => (s.id || `stage-${index + 1}`) === stageId);
  if (!stage) return null;
  const start = Number(stage.startYear);
  const end = Number(stage.endYear);
  if (Number.isFinite(start) && Number.isFinite(end)) return { startYear: start, endYear: end, period: stage.period || `${start}-${end}` };
  const matched = String(stage.period || '').match(/(\d{4})\s*-\s*(\d{4})/);
  if (!matched) return null;
  return { startYear: Number(matched[1]), endYear: Number(matched[2]), period: stage.period || '' };
}

function pickRandomTimelineItemByStage(stageId) {
  if (!Array.isArray(TIMELINE_DATA) || !TIMELINE_DATA.length) return null;
  const stageRange = getTimelineStageRange(stageId);
  const pool = TIMELINE_DATA.filter((item) => {
    if (!stageRange) return true;
    const y = Number(item.year);
    return Number.isFinite(y) && y >= stageRange.startYear && y <= stageRange.endYear;
  });
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function startTrainingFromTimelineItem(item) {
  const topicInput = document.getElementById('essayTopicInput');
  const resultContainer = document.getElementById('agentResult');
  if (!topicInput || !resultContainer || !item) return;
  const text = String(item.prompt || item.topic || '').trim();
  if (!text) return;
  topicInput.value = text;
  renderAgentResult(analyzeEssayTopic(text), resultContainer);
  document.getElementById('agentWorkbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  topicInput.focus();
}

function startTrainingFromTimelineCard(card) {
  if (!card) return;
  startTrainingFromTimelineItem({
    topic: card.dataset.topic || '',
    prompt: card.dataset.prompt || ''
  });
}

function classifyTimelineType(item) {
  if (item.type && ['问题式命题', '关系辩证题', '价值判断题'].includes(item.type)) return item.type;
  const text = `${item.topic || ''} ${item.prompt || ''}`;
  if (/(还是|与|和|之间|对立|一切都会过去|一切都不会过去|自由.*不自由)/.test(text)) return '关系辩证题';
  if (/(价值|认可度|高下|被需要|重要|更重要|值得|应不应该|好不好)/.test(text)) return '价值判断题';
  return '问题式命题';
}

function initScrollEffects() {
  const nav = document.getElementById('categoryNav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 100), { passive: true });
}

function detectTopicType(topic) {
  const text = topic || '';
  const coreText = text
    .replace(/请写一篇文章/g, '')
    .replace(/谈谈你对/g, '')
    .replace(/谈谈你的/g, '')
    .replace(/认识和思考|认识与思考/g, '')
    .replace(/认识|思考/g, '');
  if (isExpoThemeTopic(text)) return { code: 'method', name: '主题设计论证型' };
  if (/(还是|之间|对立|既.*又|一方面.*另一方面|自由.*不自由|坚硬.*柔软|一切都会过去.*一切都不会过去)/.test(coreText)) return { code: 'relation', name: '关系辩证型' };
  if (/[\u4e00-\u9fa5]{1,8}(与|和)[\u4e00-\u9fa5]{1,8}/.test(coreText) && !/(认识|思考)/.test(coreText)) return { code: 'relation', name: '关系辩证型' };
  if (/(价值|认可度|高下|被需要|有用|无用|值得|应不应该|好不好|应该|意义)/.test(text)) return { code: 'value', name: '价值判断型' };
  if (/(是否|吗|仅仅|必定|怎样|如何|为什么|何以)/.test(text)) return { code: 'problem', name: '问题式命题' };
  if (/(如何|怎么|为什么|路径|方法)/.test(text)) return { code: 'method', name: '方法路径型' };
  return { code: 'phenomenon', name: '现象思辨型' };
}

function normalizeTopicPhrases(items) {
  const stop = ['请为', '请写一篇文章', '谈谈你的认识', '谈谈你的思考', '谈谈你的认识与思考', '你有怎样的思考', '请联系社会生活', '自拟题目', '不少于', '要求', '加以论证'];
  return dedupeArray((items || []).filter((x) => x && x.length <= 12 && !stop.some((s) => x.includes(s) || s.includes(x)))).slice(0, 8);
}

function detectHiddenPremise(topic, topicType, topicPhrases) {
  const text = String(topic || '');
  const key = topicPhrases[0] || '该命题';
  if (isExpoThemeTopic(text)) return '命题预设“世博会主题不是口号”，你要证明主题能统摄价值、展馆内容与城市想象。';
  if (/必定/.test(text)) return `命题预设“存在一条稳定路径”，你要回答这条路径是否具有必然性。`;
  if (/仅仅/.test(text)) return `命题预设“单一动机解释不足”，你要处理多重动因。`;
  if (/是否/.test(text)) return `命题预设“二元判断可成立”，你要改写为条件化判断。`;
  if (topicType.code === 'relation') return `命题预设“两个概念存在张力”，你要写清二者如何互相制约。`;
  return `命题预设“${key}可被直接理解”，你需要先界定概念再下结论。`;
}

function buildExaminerIntent(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return [
      '考察“公共表达能力”：能否提出清晰、有时代感、可论证的世博主题。',
      '考察“主题统摄能力”：主题是否能贯穿价值判断、展馆设计和城市发展设想。',
      '考察“现实想象力”：是否能把上海、世界、未来生活三者联系起来，而非空喊口号。'
    ];
  }
  const key = topicPhrases[0] || '该概念';
  const key2 = topicPhrases[1] || '另一端';
  const rows = [
    `考察“思辨张力”：你能否在“${key}${topicType.code === 'relation' ? `—${key2}` : ''}”之间搭桥，而非二选一站队。`,
    '考察“时代回声”：你是否把抽象概念放进当下社会情境，而不是空谈哲理。',
    '考察“反套路能力”：是否有独立判断，而非名言堆砌与套话复述。'
  ];
  return rows;
}

function buildThreeStepAnalysis(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return [
      '第一步 定主题：主题必须简洁、有价值方向，不能只是“欢迎世界”式口号。',
      '第二步 讲理由：从城市文明、国际交流、人的生活改善三个角度证明主题必要。',
      '第三步 写设想：把主题落到展馆板块、公共空间、绿色交通、青少年参与等具体方案。'
    ];
  }
  const key = topicPhrases[0] || '核心词';
  const key2 = topicPhrases[1] || '关联概念';
  return [
    `第一步 概念边界：先定义“${key}”指什么、不指什么。`,
    topicType.code === 'relation'
      ? `第二步 矛盾机制：写清“${key}”与“${key2}”为何冲突、何时转化。`
      : '第二步 机制深挖：解释为何会出现争议，给出“前提-机制-结果”链条。',
    '第三步 高阶立意：不要停在“兼顾就好”，要给出价值重定义与边界判断。'
  ];
}

function buildMustAnswerChecklist(topic, topicType, topicPhrases, hiddenPremise) {
  if (isExpoThemeTopic(topic)) {
    return [
      '我是否明确提出了一个可作为题目的世博主题？',
      '我是否解释了这个主题为什么适合上海、适合2010年、适合世博会？',
      '我是否写出具体展览或城市设想，而不是只喊口号？',
      '我是否把“世界交流”与“人的生活”联系起来？',
      `我是否回应了题目隐含前提：${hiddenPremise}`
    ];
  }
  const key = topicPhrases[0] || '题眼';
  const list = [
    `我是否定义了“${key}”而不是直接表态？`,
    '我是否写出至少一条“因为-所以-因此”的机制链？',
    topicType.code === 'relation'
      ? '我是否真正处理了两端价值，而非只写一端？'
      : '我是否回应了反方或例外情形？',
    '我的结尾是否有边界条件，而非绝对化结论？',
    `我是否回应了题目隐含前提：${hiddenPremise}`
  ];
  return list;
}

function buildExamReadyTemplates(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return {
      opening: '我为2010年上海世博会确立的主题是：“城市，让世界共享更好的生活”。',
      turning: '然而，世博会的意义不只是展示新奇建筑，更在于让不同文明共同讨论未来城市如何服务人的生活。',
      rising: '当主题能够连接上海经验、世界交流与未来生活，它才不只是宣传语，而是城市面向未来的公共承诺。'
    };
  }
  const key = topicPhrases[0] || '该命题';
  const key2 = topicPhrases[1] || '另一端';
  return {
    opening: `先不急于站队。面对“${topic}”，我先界定“${key}”的内涵与边界。`,
    turning: topicType.code === 'relation'
      ? `诚然，只强调“${key}”会让论证更直接；然而，忽视“${key2}”会让结论失衡。`
      : '然而，离开前提谈结论，往往会把合理判断推向片面化。',
    rising: `在可量化与高效率并行的时代，对“${key}”作条件化判断，本质上是在捍卫理性与主体性。`
  };
}

function buildMustAnswerQuestions(topic, topicType, topicPhrases, hiddenPremise) {
  if (isExpoThemeTopic(topic)) {
    return [
      '你的世博主题是什么？是否简洁、明确、有价值方向？',
      '这个主题为什么适合上海，而不是任何城市都能套用？',
      '这个主题如何体现世界交流、城市文明与人的生活？',
      '你能否提出2-3个展馆或活动设想来支撑主题？',
      `你是否回应了隐含前提：${hiddenPremise}`
    ];
  }
  const key = topicPhrases[0] || '该概念';
  const key2 = topicPhrases[1] || '另一概念';
  const common = [
    `“${key}”在这道题里具体指什么？哪些情况不算？`,
    `你的结论在什么前提下成立？在哪些边界下失效？`,
    `你是否给出“机制解释”而不是只给态度？`
  ];
  if (topicType.code === 'relation') {
    common.splice(1, 0, `“${key}”与“${key2}”是替代关系、并列关系，还是递进关系？`);
  }
  if (/专.*转.*传/.test(String(topic || ''))) {
    common.splice(1, 0, '“专、转、传”三者中，哪一环决定“传”的质量？为什么？');
  }
  common.push(`你是否回应了隐含前提：${hiddenPremise}`);
  return common.slice(0, 5);
}

function buildTopicPitfalls(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return [
      '只写“上海欢迎你”，没有真正确立主题。',
      '只介绍世博会热闹场面，没有论证主题为什么成立。',
      '有主题无设想：没有展馆、活动、城市治理等具体落点。',
      '把文章写成宣传稿，缺少价值判断与现实论证。'
    ];
  }
  const key = topicPhrases[0] || '题眼';
  const items = [
    `只复述材料，不解释“${key}”的定义与边界。`,
    '只有立场没有机制：整篇都在“我认为”，没有“为什么”。',
    '结论绝对化：频繁使用“必然、唯一、绝对”却不给条件。'
  ];
  if (topicType.code === 'relation') items.push('单边论证：只写一端优点，忽视另一端价值与风险。');
  if (/专.*转.*传/.test(String(topic || ''))) items.push('把“转”简单写成“转发量”，忽视“转译质量”与“失真风险”。');
  return items.slice(0, 5);
}

function buildTopicThesis(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) return '本文主张：2010年上海世博会可确立“城市，让世界共享更好的生活”为主题，并通过城市文明、国际交流与公共生活改善来论证。';
  const key = topicPhrases[0] || '该命题';
  const key2 = topicPhrases[1] || '另一端';
  if (topicType.code === 'relation') return `本文主张：处理“${key}—${key2}”不能二选一，应在条件与边界中作动态判断。`;
  if (topicType.code === 'value') return `本文主张：${key}是否成立，不取决于情绪好恶，而取决于价值标准、现实代价与长期后果。`;
  if (topicType.code === 'method') return `本文主张：讨论${key}时，应先界定问题，再建立“前提-机制-结果”链条。`;
  return `本文主张：${key}并非天然成立，必须通过现实机制与反例检验来确认其有效性。`;
}

function buildTopicOutline(topic, topicType, topicPhrases, thesis) {
  if (isExpoThemeTopic(topic)) {
    return [
      `第一段：直接提出主题，并说明它不是口号，而是世博会的价值方向。中心论点：${thesis}`,
      '第二段：从城市文明和人的生活角度论证主题必要性，避免只写热闹场面。',
      '第三段：写具体设想，如绿色交通、未来社区、水岸上海、少年城市等板块。',
      '第四段：回到上海的开放气质和世界交流，升华为城市未来责任。'
    ];
  }
  const key = topicPhrases[0] || '该命题';
  const key2 = topicPhrases[1] || key;
  return [
    `第一段：界定“${key}”并回应题目问法，提出中心论点：${thesis}`,
    topicType.code === 'relation'
      ? `第二段：双边论证“${key}”与“${key2}”的作用与代价，加入一处“诚然-然而”转折。`
      : `第二段：用“前提-机制-结果”展开论证，至少给1个例证并解释其证明力。`,
    '第三段：处理反方质疑，给出条件化结论与边界条款，完成升华。'
  ];
}

function buildStanceOptions(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return [
      { title: '方案A：城市生活型', thesis: '主题聚焦“城市让生活更美好”，突出人的尺度与公共服务。', risk: '风险：容易写得温和，需补国际交流高度。' },
      { title: '方案B：绿色未来型', thesis: '主题聚焦绿色城市与可持续发展，突出未来责任。', risk: '风险：容易只谈环保，需补文化与生活维度。' },
      { title: '方案C：共享文明型', thesis: '主题聚焦世界共享城市文明，兼顾上海开放与全球合作。', risk: '风险：概念较大，必须写具体展馆设想。' }
    ];
  }
  const key = topicPhrases[0] || '该题核心概念';
  const key2 = topicPhrases[1] || key;
  return [
    { title: '立场A：条件性肯定', thesis: `在特定前提下，${key}可以成立。`, risk: '风险：容易写成绝对肯定。' },
    { title: '立场B：条件性质疑', thesis: `若条件不足，${key}并不必然成立。`, risk: '风险：容易写成否定一切。' },
    { title: '立场C：关系整合', thesis: topicType.code === 'relation' ? `把“${key}—${key2}”写成动态关系。` : `把“${key}”放入前提-机制-结果链条。`, risk: '风险：结构复杂，需段段扣题。' }
  ];
}

function buildExamReadySentences(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return {
      opening: '开篇直接给主题：我为2010年上海世博会确立的主题是“城市，让世界共享更好的生活”。',
      thesis: '本文主张：这一主题能把上海经验、世界交流与未来城市生活统一起来。',
      turning: '然而，主题若只停留在响亮口号上，就无法支撑真正的论证，必须落到展馆设计与公共生活设想。',
      closing: '结尾回到世博会使命：让世界在上海相遇，也让城市重新思考如何服务人的生活。'
    };
  }
  const key = topicPhrases[0] || '该命题';
  const key2 = topicPhrases[1] || '另一端概念';
  const relationTurn = `诚然，若只强调一端，判断会更省力；然而，题目的难点恰在于处理两端张力。`;
  const valueTurn = `判断“值得与否”不能停在情绪好恶，应回到标准、代价与长期后果。`;
  const methodTurn = `与其追问唯一答案，不如先搭建“前提-机制-结果”的论证链条。`;
  return {
    opening: `开篇先回应题目：面对“${topic}”，我先界定“${key}”的内涵，再讨论其成立条件。`,
    thesis: topicType.code === 'relation'
      ? `本文主张：“${key}”与“${key2}”并非非此即彼，应在关系与边界中作判断。`
      : `本文主张：${key}是否成立，取决于前提是否满足与机制是否闭合。`,
    turning: topicType.code === 'relation' ? relationTurn : (topicType.code === 'value' ? valueTurn : methodTurn),
    closing: '结尾回到题目问法：不给绝对答案，而给条件化、可检验、能落地的结论。'
  };
}

function buildExamTemplateSets(topic, topicType, topicPhrases) {
  if (isExpoThemeTopic(topic)) {
    return {
      openings: [
        '我为2010年上海世博会确立的主题是：“城市，让世界共享更好的生活”。',
        '一个好的世博主题，不应只是欢迎辞，而应能回答未来城市为何而建、为谁而建。',
        '上海世博会的主题，应当把上海的开放气质、世界的文明交流与普通人的生活改善连接起来。'
      ],
      turnings: [
        '然而，展示先进技术并不等于完成世博使命，关键在于技术能否转化为人的生活质量。',
        '进一步看，世博会不是各国展品的简单陈列，而是不同文明共同讨论未来的公共场域。',
        '换言之，主题必须既能概括时代问题，也能组织具体展馆内容。'
      ],
      risings: [
        '当城市以人的尊严、联系与创造力为尺度，世博会才真正拥有超越展览本身的意义。',
        '这样的主题不是宣传语，而是上海向世界作出的城市文明承诺。',
        '让世界在上海相遇，也让上海在世界目光中重新定义未来生活。'
      ]
    };
  }
  const key = topicPhrases[0] || '该命题';
  const key2 = topicPhrases[1] || '另一端概念';
  const openings = [
    `面对“${topic}”，我先界定“${key}”的含义，再讨论其成立边界。`,
    `这道题看似在问“是或否”，实则在考查我们如何处理“${key}”的条件关系。`,
    `与其急于站队，不如先追问：在何种前提下，“${key}”才成立？`
  ];
  const turnings = topicType.code === 'relation'
    ? [
      `诚然，只强调“${key}”会让论证更直接；然而，忽视“${key2}”会让结论失衡。`,
      `进一步看，题目并不鼓励二选一，而要求在张力中寻找更高层次的统一。`,
      `换言之，关键不在否定任何一端，而在解释二者如何互相制约与转化。`
    ]
    : [
      '诚然，直观判断往往有其合理性；然而，若缺少机制解释，结论就会变得脆弱。',
      '进一步而言，案例本身不是答案，关键在于案例背后的结构性原因。',
      '但也要看到，任何判断都有边界，离开前提谈结论只会制造误导。'
    ];
  const risings = [
    `回到题目，真正重要的不是给出唯一答案，而是给出可检验、可落地的条件化判断。`,
    `当我们把“${key}”放进现实实践中检验，思辨才会从纸面走向行动。`,
    '因此，好的作文不止于表态，更在于建立标准、呈现边界、回应时代问题。'
  ];
  return { openings, turnings, risings };
}

function extractTopicPhrases(topic) {
  if (isExpoThemeTopic(topic)) return ['上海世博会', '主题', '城市文明', '共享生活'];
  const text = String(topic || '');
  const quoted = [...text.matchAll(/“([^”]{1,12})”/g)].map((m) => m[1]);
  const cleaned = text
    .replace(/要求[:：]?[\s\S]*/g, '')
    .replace(/请写一篇文章/g, '')
    .replace(/谈谈你对/g, '')
    .replace(/谈谈你的/g, '')
    .replace(/认识和思考/g, '')
    .replace(/认识与思考/g, '')
    .replace(/请联系社会生活/g, '')
    .replace(/自拟题目/g, '')
    .replace(/不少于\d+字/g, '');
  const candidates = [...quoted];
  const keyPatterns = [
    /(认可度)/g,
    /(高下)/g,
    /(断舍离)/g,
    /(真实所求|内心)/g,
    /(好奇心)/g,
    /(陌生世界)/g,
    /(发问)/g,
    /(结论)/g,
    /(时间的沉淀|时间|价值)/g,
    /(重要的转折|转折|意想不到|事物发展进程|无能为力)/g,
    /(已有知识|综合|创新)/g,
    /(专|转|传)/g,
    /(自由|不自由|规则|责任)/g,
    /(坚硬|柔软|自我)/g,
    /(预测|变数)/g,
    /(被需要|自身需要)/g,
    /(中国味|异域音调|认识事物)/g
  ];
  keyPatterns.forEach((regex) => {
    [...cleaned.matchAll(regex)].forEach((m) => {
      if (m[1]) candidates.push(m[1]);
    });
  });
  (cleaned.match(/[\u4e00-\u9fa5]{2,12}/g) || []).forEach((chunk) => {
    const compact = chunk
      .replace(/生活中|人们|常用|对此|有人|觉得|正常|担忧|请|写|一篇|文章|谈谈|怎样|思考|认识|由此/g, '')
      .trim();
    if (compact === '判别事物') return;
    if (compact === '区分高下') {
      candidates.push('高下');
      return;
    }
    let reduced = compact;
    quoted.forEach((q) => {
      if (q && compact.includes(q)) {
        candidates.push(q);
        reduced = reduced.replace(q, '');
      }
    });
    if (reduced === '判别事物') return;
    if (reduced === '区分高下') {
      candidates.push('高下');
      return;
    }
    if (reduced.length >= 2 && reduced.length <= 8) candidates.push(reduced);
    else if (!quoted.some((q) => q && compact.includes(q)) && compact.length >= 2 && compact.length <= 8) candidates.push(compact);
  });
  if (/是否/.test(text)) candidates.push('是否');
  if (/必定/.test(text)) candidates.push('必定');
  if (/仅仅/.test(text)) candidates.push('仅仅');
  return normalizeTopicPhrases(dedupeArray(candidates)).slice(0, 8);
}

function splitParagraphs(text) {
  return String(text || '').split(/\r?\n\r?\n+/).map((x) => x.trim()).filter(Boolean);
}

function isLikelyFrontMatterParagraph(paragraph, remainingText, topicPhrases = []) {
  const raw = String(paragraph || '').trim();
  const compact = raw.replace(/\s+/g, '').replace(/[《》“”"']/g, '');
  if (!compact) return false;
  if (String(remainingText || '').replace(/\s+/g, '').length < 180) return false;
  const compactLen = compact.replace(/[，。！？；：,.!?;:、]/g, '').length;
  const sentenceCount = splitSentences(raw).length;
  const hasEssayMotion = /(我认为|在我看来|因此|然而|因为|所以|这说明|关键在于|本质|价值|现实|社会|时代|不是.*而是|并非|未必)/.test(raw);
  const looksLikeAuthor = /(学校|中学|班|姓名|作者|指导老师|高[一二三]|初[一二三]|同学)/.test(raw);
  const looksLikeTitle = compactLen <= 26 && sentenceCount <= 1 && !hasEssayMotion;
  const sameAsTopic = topicPhrases.some((term) => term && compact === String(term).replace(/\s+/g, ''));
  return looksLikeAuthor || sameAsTopic || looksLikeTitle;
}

function getReviewDraftInfo(topic, draft) {
  const topicPhrases = normalizeTopicPhrases(extractTopicPhrases(topic));
  const paragraphs = splitParagraphs(draft);
  const removedHeadings = [];
  let body = [...paragraphs];
  let sourceGrade = null;
  let titleHint = '';
  let guard = 0;
  while (body.length >= 2 && guard < 3) {
    const remaining = body.slice(1).join('\n\n');
    if (!isLikelyFrontMatterParagraph(body[0], remaining, topicPhrases)) break;
    sourceGrade = sourceGrade || parseSourceGradeMetadata(body[0]);
    const possibleTitle = stripSourceGradeText(body[0]);
    if (!titleHint && possibleTitle && !isLikelyAuthorHeading(possibleTitle)) {
      titleHint = possibleTitle;
    }
    removedHeadings.push(body.shift());
    guard += 1;
  }
  const cleaned = body.join('\n\n').trim() || String(draft || '').trim();
  return { draft: cleaned, removedHeadings, sourceGrade, titleHint };
}

function normalizeDraftForReview(topic, draft) {
  return getReviewDraftInfo(topic, draft).draft;
}

function getTopicRelatedTerms(topic, topicPhrases = []) {
  const text = `${topic || ''} ${(topicPhrases || []).join(' ')}`;
  const terms = [];
  const add = (items) => terms.push(...items);
  if (/专.*转.*传|专业文章|转发|传世/.test(text)) add(['专业', '通俗', '传播', '转发', '转译', '传世', '经典', '精华', '浓缩', '流量', '公共表达']);
  if (/认可度|高下/.test(text)) add(['认可', '标准', '评价', '高下', '大众', '多数', '共识', '判断', '独立思考']);
  if (/断舍离|真实所求|内心/.test(text)) add(['断舍离', '减法', '取舍', '冗余', '内心', '真实', '所求', '自我', '排序']);
  if (/好奇心|陌生世界|探索/.test(text)) add(['好奇', '探索', '陌生', '未知', '动机', '责任', '求知', '世界']);
  if (/转折|意想不到|无能为力|发展进程/.test(text)) add(['转折', '意外', '进程', '回应', '选择', '主动', '作为', '局限']);
  if (/已有知识|综合|创新/.test(text)) add(['知识', '综合', '创新', '拼接', '融合', '生成', '创造', '解释力']);
  if (/发问|结论/.test(text)) add(['发问', '问题', '结论', '思考', '追问', '判断', '成长']);
  if (/时间|价值|沉淀/.test(text)) add(['时间', '价值', '沉淀', '检验', '实践', '认识', '发现']);
  if (/自由|不自由|规则|责任/.test(text)) add(['自由', '限制', '规则', '责任', '选择', '边界', '主体']);
  if (/被需要|自身需要/.test(text)) add(['需要', '被需要', '价值', '他人', '关系', '自我']);
  return dedupeArray([
    ...(topicPhrases || []).filter((term) => !/^(是否|必定|仅仅|对此|怎样)$/.test(term)),
    ...terms
  ]).slice(0, 18);
}

function isOpenReflectionTopic(topic) {
  const text = String(topic || '');
  return /(启发.*认识事物|思考和感悟|自选角度|选取一个角度|根据以下材料|这段话|上述材料|材料.*思考|话题写一篇)/.test(text);
}

function escapeRegex(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractTitleAxisTerms(title) {
  const cleaned = stripSourceGradeText(title)
    .replace(/[《》“”"‘’'，。！？、：；,.!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || isLikelyAuthorHeading(cleaned)) return [];
  const terms = [];
  const chunks = cleaned.split(/\s+/).filter((x) => x && x.length >= 1 && x.length <= 12);
  chunks.forEach((chunk) => {
    if (!/^(一类|二类|三类|四类|五类|上等|中等|高考|作文)$/.test(chunk)) terms.push(chunk);
  });
  if (/旧/.test(cleaned)) terms.push('旧', '旧有');
  if (/新/.test(cleaned)) terms.push('新', '更新', '维新');
  if (/生生不息/.test(cleaned)) terms.push('生生不息', '生命力');
  if (/破/.test(cleaned) && /立/.test(cleaned)) terms.push('破', '立', '破立');
  if (/认/.test(cleaned) && /可/.test(cleaned)) terms.push('认可', '认可度');
  if (/断舍离/.test(cleaned)) terms.push('断舍离', '取舍');
  if (/专/.test(cleaned) && /传/.test(cleaned)) terms.push('专', '转', '传', '传播');
  return normalizeTopicPhrases(dedupeArray(terms)).slice(0, 10);
}

function buildSelfThesisAxisProfile(draft, explicitTitle = '') {
  const paragraphs = splitParagraphs(draft);
  let title = stripSourceGradeText(explicitTitle);
  let bodyParagraphs = paragraphs;
  if (!title && paragraphs.length >= 2) {
    const first = stripSourceGradeText(paragraphs[0]);
    const compact = first.replace(/\s+/g, '');
    if (compact.length <= 28 && splitSentences(first).length <= 1 && !/[，。！？；：,.!?;:]/.test(first) && !isLikelyAuthorHeading(first)) {
      title = first;
      bodyParagraphs = paragraphs.slice(1);
    }
  }
  const terms = extractTitleAxisTerms(title);
  const body = bodyParagraphs.join('\n\n');
  if (!terms.length || !body) {
    return { score: 0, title, terms: [], termHits: 0, paragraphCoverage: 0, titleEcho: 0 };
  }
  const termHits = terms.reduce((sum, term) => sum + countMatches(body, new RegExp(escapeRegex(term), 'g')), 0);
  const coveredParagraphs = bodyParagraphs.filter((p) => terms.some((term) => p.includes(term))).length;
  const paragraphCoverage = Math.round((coveredParagraphs / Math.max(bodyParagraphs.length, 1)) * 100);
  const relationCount = countMatches(body, /(关系|不是.*而是|并非|然而|但是|同时|条件|边界|转化|生成|价值|本质|机制|尺度|主体|实践)/g);
  const firstLastEcho = [
    bodyParagraphs[0] || '',
    bodyParagraphs[bodyParagraphs.length - 1] || ''
  ].filter((p) => terms.some((term) => p.includes(term))).length;
  const score = clamp(
    Math.min(30, termHits * 4)
      + Math.min(26, Math.round(paragraphCoverage * 0.26))
      + Math.min(24, relationCount * 3)
      + firstLastEcho * 10
      + (bodyParagraphs.length >= 5 ? 10 : 0),
    0,
    100
  );
  return { score, title, terms, termHits, paragraphCoverage, titleEcho: firstLastEcho };
}

function buildSelfThesisAxisScore(draft, explicitTitle = '') {
  return buildSelfThesisAxisProfile(draft, explicitTitle).score;
}

function buildTopicSemanticBridgeScore(topic, draft, topicPhrases = []) {
  const related = getTopicRelatedTerms(topic, topicPhrases);
  const text = String(draft || '');
  const selfAxis = buildSelfThesisAxisScore(text);
  if (!related.length) return selfAxis;
  const exactHits = (topicPhrases || []).filter((term) => term && term.length >= 2 && text.includes(term)).length;
  const relatedHits = related.filter((term) => term && text.includes(term)).length;
  const relationSignals = countMatches(text, /(关系|标准|价值|机制|本质|边界|条件|前提|转化|制约|实践|现实)/g);
  const base = clamp(exactHits * 14 + relatedHits * 10 + Math.min(18, relationSignals * 3), 0, 100);
  return isOpenReflectionTopic(topic) ? Math.max(base, selfAxis) : Math.max(base, Math.round(selfAxis * 0.72));
}

function assessExpertEssaySignals(topic, draft, options = {}) {
  const paragraphs = splitParagraphs(draft);
  const wordCount = countWords(draft);
  const logicCount = countMatches(draft, /(因为|所以|因此|由此|从而|意味着|这说明|可见|关键在于|本质上|原因在于|换言之)/g);
  const turnCount = countMatches(draft, /(诚然|然而|但是|不过|另一方面|同时|反过来|并非|未必|不能简单)/g);
  const boundaryCount = countMatches(draft, /(前提|条件|边界|如果|若|当.*时|并不意味着|未必|不能绝对|限度)/g);
  const realityCount = countMatches(draft, /(现实|社会|时代|生活|校园|平台|算法|技术|青年|公共|传播|消费|信息)/g);
  const abstractCount = countMatches(draft, /(价值|标准|机制|本质|关系|主体|结构|判断|实践|公共|意义|逻辑)/g);
  const thesisCue = countMatches(draft, /(关键在于|真正|不是.*而是|不在于.*而在于|取决于|应当|需要|可以|不能|并非|未必)/g);
  const selfAxisProfile = buildSelfThesisAxisProfile(draft);
  const selfAxisScore = selfAxisProfile.score;
  const bridge = Number(options.semanticBridgeScore ?? buildTopicSemanticBridgeScore(topic, draft, options.topicPhrases || []));
  const score = clamp(
    (wordCount >= 760 ? 15 : (wordCount >= 600 ? 9 : 0))
    + (paragraphs.length >= 4 ? 10 : (paragraphs.length >= 3 ? 6 : 0))
    + Math.min(18, logicCount * 4)
    + Math.min(12, turnCount * 4)
    + Math.min(10, boundaryCount * 5)
    + Math.min(12, realityCount * 3)
    + Math.min(13, abstractCount * 2)
    + Math.min(8, thesisCue * 3)
    + Math.min(12, Math.round(bridge * 0.12))
    + Math.min(10, Math.round(selfAxisScore * 0.1)),
    0,
    100
  );
  return { score, wordCount, paragraphCount: paragraphs.length, logicCount, turnCount, boundaryCount, realityCount, abstractCount, thesisCue, bridge, selfAxisScore, selfAxisProfile };
}

function splitSentences(text) {
  return String(text || '').split(/[。！？.!?；;]/).map((x) => x.trim()).filter(Boolean);
}

function analyzeSentenceQuality(topic, draft, topicPhrases) {
  const sentenceRows = splitParagraphs(draft).flatMap((paragraph, paragraphIndex) =>
    splitSentences(paragraph)
      .filter((s) => s.length >= 8 && s.length <= 100)
      .map((sentence) => ({ sentence, paragraphIndex }))
  );
  const scored = sentenceRows.map((row) => {
    const s = row.sentence;
    const topicHit = (topicPhrases || []).slice(0, 4).filter((k) => s.includes(k)).length;
    const logic = countMatches(s, /(因为|所以|因此|然而|另一方面|前提|条件|边界|由此)/gi);
    const abstract = countMatches(s, /(机制|本质|价值|实践|结构|关系|标准)/gi);
    const reality = countMatches(s, /(现实|社会|时代|校园|平台|算法|技术|生活|公共)/gi);
    const absolute = countMatches(s, /(绝对|唯一|永远|完全|必须|必然)/gi);
    const empty = countMatches(s, /(我们要|应该|必须|显而易见|毋庸置疑)/gi);
    const tooLong = s.replace(/\s+/g, '').length >= 58 ? 1 : 0;
    const score = clamp(topicHit * 18 + logic * 14 + abstract * 10 + reality * 6 - empty * 16 - absolute * 9 - tooLong * 10 + 35, 0, 100);
    const reasons = [];
    if (topicHit) reasons.push('回扣题眼');
    if (logic) reasons.push('有逻辑推进');
    if (abstract) reasons.push('能上升到本质/标准');
    if (reality) reasons.push('有现实落点');
    if (empty) reasons.push('口号化');
    if (absolute) reasons.push('绝对化');
    if (tooLong) reasons.push('句子过长');
    if (!topicHit) reasons.push('未明显扣题');
    if (!logic && !abstract && !reality) reasons.push('缺少分析含量');
    return { sentence: ensureSentenceEnding(s), score, paragraphIndex: row.paragraphIndex, reasons };
  });
  const goodItems = [...scored].sort((a, b) => b.score - a.score).slice(0, 3).filter((x) => x.score >= 70);
  const badItems = [...scored].sort((a, b) => a.score - b.score).slice(0, 3).filter((x) => x.score <= 58);
  const good = goodItems.map((x) => x.sentence);
  const bad = badItems.map((x) => x.sentence);
  return { good, bad, goodItems, badItems, scored };
}

function countWords(text) {
  const en = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  const cn = (String(text || '').match(/[\u4e00-\u9fa5]/g) || []).length;
  return en + cn;
}

function countMatches(text, regex) {
  return (String(text || '').match(regex) || []).length;
}

function getParagraphRanges(text) {
  const ranges = [];
  const regex = /[^\r\n]+(?:\r?\n(?!\r?\n)[^\r\n]+)*/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
  }
  return ranges;
}

function getSentenceRanges(text) {
  const ranges = [];
  const regex = /[^。！？.!?；;]+[。！？.!?；;]?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const content = match[0].trim();
    if (!content) continue;
    ranges.push({ start: match.index, end: match.index + match[0].length, text: content });
  }
  return ranges;
}

function ensureSentenceEnding(text) {
  const t = String(text || '').trim();
  if (!t) return '本段先回扣题目核心概念，再展开论证。';
  return /[。！？.!?]$/.test(t) ? t : `${t}。`;
}

function updateExamWordCountDisplay(draftInput, wordCountEl) {
  if (!wordCountEl || !draftInput) return;
  const w = countWords(draftInput.value || '');
  wordCountEl.textContent = `${w} / ${EXAM_MODE_MAX_WORDS}`;
  wordCountEl.classList.toggle('over-limit', w > EXAM_MODE_MAX_WORDS);
}

function renderExamCountdown(el, sec) {
  if (!el) return;
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
}

function getShanghaiBand(total) {
  const score70 = total > 70 ? Math.round(Number(total || 0) * 0.7) : Number(total || 0);
  return getShanghaiOfficialBand(score70);
}

function normalizeRiskClass(level) {
  if (level === '高风险') return 'high';
  if (level === '中风险') return 'medium';
  return 'low';
}

function dedupeArray(items) {
  return [...new Set(items)];
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
