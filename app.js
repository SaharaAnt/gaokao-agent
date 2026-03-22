const EXAM_MODE_DURATION_SEC = 25 * 60;
const EXAM_MODE_MAX_WORDS = 800;
const ESSAY_FAVORITES_STORAGE_KEY = 'gaokao_essay_favorites_v1';

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
          </div>
          <div class="card-foot">
            <span class="card-foot-left">Frequency <em class="freq-dots">${renderFrequencyDots(freq)}</em></span>
            <span class="card-foot-right">Click to flip</span>
          </div>
        </div>
        <div class="card-back">
          <div class="card-back-head">${escapeHtml(data.backTitle || '考场提示')}</div>
          <ol class="card-back-list">${backPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ol>
          <div class="card-foot">
            <span class="card-foot-left">再点一次可翻回</span>
            <span class="card-foot-right">Back</span>
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

function initAgentWorkbench() {
  const topicInput = document.getElementById('essayTopicInput');
  const draftInput = document.getElementById('essayDraftInput');
  const analyzeBtn = document.getElementById('analyzeTopicBtn');
  const sampleBtn = document.getElementById('sampleTopicBtn');
  const randomTopicBtn = document.getElementById('randomTopicBtn');
  const showDemoCardBtn = document.getElementById('showDemoCardBtn');
  const copyBtn = document.getElementById('copyAgentResultBtn');
  const offTopicCheckBtn = document.getElementById('offTopicCheckBtn');
  const scoreDraftBtn = document.getElementById('scoreDraftBtn');
  const resultContainer = document.getElementById('agentResult');
  const essayFilterBar = document.getElementById('essayFilterBar');
  const essaySampleList = document.getElementById('essaySampleList');
  const examCountdown = document.getElementById('examCountdown');
  const examWordCount = document.getElementById('examWordCount');
  const startExamModeBtn = document.getElementById('startExamModeBtn');
  const pauseExamModeBtn = document.getElementById('pauseExamModeBtn');
  const resetExamModeBtn = document.getElementById('resetExamModeBtn');
  const examModeStatus = document.getElementById('examModeStatus');
  if (!topicInput || !draftInput || !analyzeBtn || !resultContainer) return;

  const uiState = { activeFilter: 'all', favorites: loadEssayFavorites() };
  const examState = { running: false, paused: false, remaining: EXAM_MODE_DURATION_SEC, timer: null };

  renderEssayFilterBar(essayFilterBar, uiState.activeFilter, uiState.favorites);
  renderEssaySampleList(essaySampleList, uiState.activeFilter, uiState.favorites);
  updateExamWordCountDisplay(draftInput, examWordCount);
  renderExamCountdown(examCountdown, examState.remaining);

  analyzeBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    renderAgentResult(analyzeEssayTopic(topic), resultContainer);
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

  offTopicCheckBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const draft = draftInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    if (!draft) return void (resultContainer.innerHTML = '<p class="agent-empty">请先粘贴作文草稿。</p>');
    try { renderOffTopicReport(runOffTopicCheck(topic, draft), resultContainer); }
    catch (e) { resultContainer.innerHTML = `<p class="agent-empty">防跑题检查失败：${escapeHtml(e?.message || '未知错误')}</p>`; }
  });

  scoreDraftBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const draft = draftInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    if (!draft) return void (resultContainer.innerHTML = '<p class="agent-empty">请先粘贴作文草稿。</p>');
    renderScoreReport(scoreEssayDraft(topic, draft), resultContainer);
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

  resultContainer.addEventListener('click', (e) => {
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

    const fixBtn = e.target.closest('.flaw-fix-btn');
    if (fixBtn) {
      const topic = topicInput.value.trim();
      const draft = draftInput.value;
      const idx = parseInt(fixBtn.dataset.flawIndex || '-1', 10);
      const report = runOffTopicCheck(topic, draft);
      const flaw = report.flawScan[idx];
      if (!flaw) return;
      const replaced = replaceParagraphLeadSentence(draft, flaw.paragraphIndex, flaw.rewriteLead);
      if (!replaced.ok) return;
      draftInput.value = replaced.newDraft;
      updateExamWordCountDisplay(draftInput, examWordCount);
      renderOffTopicReport(runOffTopicCheck(topic, replaced.newDraft), resultContainer);
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
  const topicPhrases = extractTopicPhrases(topic);
  const stanceOptions = buildStanceOptions(topic, topicType, topicPhrases);
  return {
    topic,
    topicType,
    topicPhrases,
    rankedCategories,
    lensSuggestions: dedupeArray(lens).slice(0, 4),
    thesis: '本文主张：该题应作条件化判断，先界定概念，再比较立场，最后回到边界。',
    outline: [
      '第一段：界定概念并提出中心论点。',
      '第二段：展开因果论证并加入例证。',
      '第三段：回到题目边界并完成升华。'
    ],
    examReadySentences: buildExamReadySentences(topic, topicType, topicPhrases),
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

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>题目分析：${escapeHtml(analysis.topic)}</h3>
      <div class="agent-tags">${tags}<span class="agent-tag">题型：${escapeHtml(analysis.topicType.name)}</span></div>
    </div>
    <div class="agent-result-block"><h4>审题切口</h4><ul>${lens}</ul></div>
    <div class="agent-result-block"><h4>三种立场可选</h4>${stances}</div>
    <div class="agent-result-block"><h4>核心立意</h4><p>${escapeHtml(analysis.thesis)}</p></div>
    <div class="agent-result-block"><h4>三段式骨架</h4><ol>${outline}</ol></div>
    <div class="agent-result-block">
      <h4>考场可写句</h4>
      <p>开头句：${escapeHtml(analysis.examReadySentences.opening)}</p>
      <p>中心句：${escapeHtml(analysis.examReadySentences.thesis)}</p>
      <p>结尾句：${escapeHtml(analysis.examReadySentences.closing)}</p>
      <div class="agent-actions secondary"><button class="agent-btn primary gen-outline-draft-btn" type="button">一键生成三段提纲草稿</button></div>
    </div>`;
}

function generateThreeParagraphDraft(analysis) {
  const key = analysis.topicPhrases[0] || '该命题';
  const key2 = analysis.topicPhrases[1] || key;
  return [
    [
      `面对“${analysis.topic}”，本文先界定“${key}”的含义与适用范围。`,
      `${analysis.stanceOptions?.[2]?.thesis || analysis.thesis}`,
      '本段结尾明确中心论点与判断标准。'
    ],
    [
      `第二段围绕“${key}”展开因果链：前提成立时会产生何种结果。`,
      '加入一个可分析例证，并说明“为什么这个例子支持你的观点”。',
      analysis.topicType.code === 'relation'
        ? `同时处理“${key}”与“${key2}”的双边关系，避免单边站队。`
        : '补充一次反方回应，提升论证完整性。'
    ],
    [
      `第三段回到题目边界：指出“${key}”并非绝对成立。`,
      '给出条件化结论，避免“唯一/必然”等绝对化词语。',
      '最后回扣题眼并完成价值提升。'
    ]
  ];
}

function renderOutlineDraftBlock(paragraphs) {
  const items = paragraphs.map((s, i) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>第${i + 1}段提纲草稿</span></div>
      <ol>${s.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ol>
    </div>`).join('');
  return `<div class="agent-result-block outline-draft-block"><h4>三段提纲草稿（每段2-3句）</h4><div class="score-grid">${items}</div></div>`;
}

function runOffTopicCheck(topic, draft) {
  const topicType = detectTopicType(topic);
  const topicPhrases = extractTopicPhrases(topic);
  const paragraphs = splitParagraphs(draft);
  const lower = draft.toLowerCase();
  const matched = topicPhrases.filter((p) => lower.includes(p.toLowerCase()));
  const missed = topicPhrases.filter((p) => !lower.includes(p.toLowerCase()));

  const diagnostics = paragraphs.map((p, i) => {
    const hits = topicPhrases.filter((k) => p.toLowerCase().includes(k.toLowerCase()));
    const score = clamp(Math.round((hits.length / Math.max(topicPhrases.length, 1)) * 100), 0, 100);
    return {
      index: i,
      semanticScore: score,
      level: score >= 70 ? '良好' : (score >= 45 ? '可改进' : '偏题风险'),
      matchedTopicPhrases: hits
    };
  });

  const weak = diagnostics.filter((x) => x.level === '偏题风险').length;
  const scaffold = buildOffTopicScaffold({ topic, draft, topicType, topicPhrases, paragraphs });
  const baseRiskPoints = (missed.length * 8) + (weak * 10) + (paragraphs.length < 3 ? 10 : 0);
  const qualityScore = Math.round(
    (scaffold.dimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(scaffold.dimensions.length, 1)) * 0.72
      + (100 - baseRiskPoints) * 0.28
  );
  const riskScore = clamp(qualityScore, 0, 100);
  const riskLevel = riskScore < 50 ? '高风险' : (riskScore < 75 ? '中风险' : '低风险');
  const flawScan = scanArgumentFlaws({ topic, topicType, draft, topicPhrases, paragraphDiagnostics: diagnostics, paragraphs, scaffold });
  const lowDims = scaffold.dimensions.filter((d) => d.score < 65);
  const autoSuggestions = lowDims.slice(0, 4).map((d) => d.fix);

  return {
    topic,
    topicType,
    topicPhrases,
    expectedCategories: ['thinking', 'dialectics'],
    matchedPhrases: matched,
    missedPhrases: missed,
    semanticAvg: diagnostics.length ? Math.round(diagnostics.reduce((s, x) => s + x.semanticScore, 0) / diagnostics.length) : 0,
    paragraphDiagnostics: diagnostics,
    riskLevel,
    riskScore,
    scaffold,
    flawScan,
    evidence: [
      `题眼覆盖：${matched.length}/${Math.max(topicPhrases.length, 1)}`,
      `段落数量：${paragraphs.length}`,
      `偏题段落：${weak}段`,
      `思辨脚手架：${scaffold.summary}`
    ],
    suggestions: [
      missed.length ? `补齐缺失题眼：${missed.slice(0, 3).join('、')}` : '题眼覆盖基本达标。',
      '每段首句都显式回扣题眼。',
      '至少加入1个例证并说明其证明机制。',
      ...autoSuggestions
    ]
  };
}

function buildOffTopicScaffold({ topic, draft, topicType, topicPhrases, paragraphs }) {
  const text = String(draft || '');
  const lower = text.toLowerCase();
  const quotedTerms = [...String(topic || '').matchAll(/“([^”]{1,10})”/g)].map((m) => m[1]);
  const coreTerms = dedupeArray([...quotedTerms, ...topicPhrases.filter((x) => x.length <= 8)]).slice(0, 8);
  const coveredTerms = coreTerms.filter((k) => lower.includes(String(k).toLowerCase()));
  const relationSignals = countMatches(text, /(关系|并非|不是.*而是|既.*又|一方面|另一方面|同时|然而|但是|转化|张力|条件|前提|边界|非必然|未必|不必|反过来)/gi);
  const logicChainSignals = countMatches(text, /(因为|所以|因此|由此|导致|从而|进而|意味着|如果|那么)/gi);
  const mustWordSignals = countMatches(topic, /(是否|必定|必须|仅仅|意味着|无能为力)/gi);
  const mustWordCovered = countMatches(text, /(是否|必定|必须|仅仅|意味着|无能为力|未必|不必然)/gi);

  const binarySignals = countMatches(text, /(另一方面|诚然|然而|但|同时|并且|反过来|也要看到|并非)/gi);
  const termMentions = coreTerms.slice(0, 3).map((k) => countMatches(text, new RegExp(escapeRegExp(k), 'gi'))).filter((n) => n > 0);
  const balanceRatio = termMentions.length >= 2 ? Math.min(...termMentions) / Math.max(...termMentions) : 0;

  const essenceSignals = countMatches(text, /(本质|机制|逻辑|结构|根源|实质|规律|框架|范式|对象性活动|实践标准|异化|主体)/gi);
  const phenomenonSignals = countMatches(text, /(现象|案例|例子|生活中|看到|表面|流量|热搜|平台)/gi);
  const abstractionSignals = countMatches(text, /(认识论|辩证|实践|存在|边界|条件|主体精神|价值排序)/gi);

  const realitySignals = countMatches(text, /(社会|时代|现实|校园|家庭|社区|平台|算法|人工智能|AI|ChatGPT|就业|教育|医疗|航天|产业|媒体)/gi);
  const concreteSignals = countMatches(text, /(例如|比如|以.*为例|数据显示|某次|某年|亲身|经历|观察)/gi);
  const emptyTalkSignals = countMatches(text, /(我们要|应该要|必须要|由此可见|毋庸置疑|总而言之|显而易见)/gi);

  const boundarySignals = countMatches(text, /(前提|条件|边界|若|如果|当.*时|在.*条件下|例外|并不总是|未必)/gi);
  const premiseSignals = countMatches(text, /(隐含前提|假设|设定|命题本身|问题意识)/gi);
  const absoluteSignals = countMatches(text, /(绝对|唯一|永远|完全|必然|毫无疑问|彻底)/gi);

  const rhythmSignals = countMatches(text, /(首先|其次|再次|最后|进一步而言|究其本质|换言之|总之|回到题目)/gi);
  const transitionSignals = countMatches(text, /(诚然|然而|但|另一方面|同时|反过来|尽管|不过)/gi);

  const dim1 = clamp(Math.round((coveredTerms.length / Math.max(coreTerms.length, 1)) * 55 + Math.min(30, relationSignals * 4) + Math.min(15, logicChainSignals * 2) - (mustWordSignals > 0 && mustWordCovered === 0 ? 18 : 0)), 0, 100);
  const dim2 = clamp(Math.round((topicType.code === 'relation' ? 35 : 20) + Math.min(40, binarySignals * 6) + balanceRatio * 25), 0, 100);
  const dim3 = clamp(Math.round(Math.min(45, essenceSignals * 7) + Math.min(20, abstractionSignals * 5) + Math.min(20, logicChainSignals * 3) + Math.min(15, phenomenonSignals * 2)), 0, 100);
  const dim4 = clamp(Math.round(Math.min(45, realitySignals * 8) + Math.min(35, concreteSignals * 8) - Math.max(0, (emptyTalkSignals - concreteSignals) * 8)), 0, 100);
  const dim5 = clamp(Math.round(Math.min(55, boundarySignals * 8 + premiseSignals * 10) - Math.max(0, absoluteSignals * 9 - boundarySignals * 3) + 25), 0, 100);
  const dim6 = clamp(Math.round(Math.min(55, rhythmSignals * 9) + Math.min(30, transitionSignals * 7) + (paragraphs.length >= 3 ? 15 : 5)), 0, 100);

  const dimensions = [
    { id: 'd1', name: '关键词关联与逻辑链', score: dim1, evidence: `核心词覆盖 ${coveredTerms.length}/${Math.max(coreTerms.length, 1)}，关系信号 ${relationSignals}，因果链信号 ${logicChainSignals}`, fix: '补齐遗漏题眼，并用“因为-所以-因此”把关键词连成逻辑链。' },
    { id: 'd2', name: '二元/三元辩证平衡', score: dim2, evidence: `平衡信号 ${binarySignals}，核心概念平衡比 ${balanceRatio.toFixed(2)}`, fix: '加入“诚然/然而/另一方面”段内转折，避免单边站队。' },
    { id: 'd3', name: '现象-本质跨度', score: dim3, evidence: `本质词 ${essenceSignals}，抽象词 ${abstractionSignals}，现象词 ${phenomenonSignals}`, fix: '每个案例后补一句“机制解释”，把现象上升到本质。' },
    { id: 'd4', name: '现实生活关联度', score: dim4, evidence: `现实词 ${realitySignals}，具体例证 ${concreteSignals}，空话信号 ${emptyTalkSignals}`, fix: '至少补1个时代场景（校园/技术/社会），并写出你的观察细节。' },
    { id: 'd5', name: '前提与边界条件', score: dim5, evidence: `边界词 ${boundarySignals}，前提词 ${premiseSignals}，绝对词 ${absoluteSignals}`, fix: '把绝对结论改成条件结论，明确“在何前提下成立”。' },
    { id: 'd6', name: '结构标志词与节奏', score: dim6, evidence: `结构词 ${rhythmSignals}，转折词 ${transitionSignals}，段落数 ${paragraphs.length}`, fix: '补“首先-其次-最后”骨架和“诚然-然而”转折信号。' }
  ];

  const summary = dimensions.map((d) => `${d.name}${d.score}`).join('｜');
  return { coreTerms, coveredTerms, dimensions, summary };
}

function scanArgumentFlaws(payload) {
  const { topic, topicType, draft, topicPhrases, paragraphDiagnostics, scaffold } = payload;
  const flaws = [];
  const abs = countMatches(draft, /(绝对|唯一|必须|必然)/gi);
  const cond = countMatches(draft, /(在.*条件下|前提是|如果|当)/gi);
  const evidence = countMatches(draft, /(例如|比如|案例|数据)/gi);
  const reasoning = countMatches(draft, /(因为|所以|因此|由此)/gi);
  const weak = paragraphDiagnostics.find((x) => x.level === '偏题风险');

  if (abs >= 2 && cond === 0) flaws.push({ name: '结论绝对化', level: '高', evidence: `绝对化词语${abs}处`, fix: '改为条件化判断。', paragraphIndex: 0 });
  if (evidence >= 3 && reasoning <= 2) flaws.push({ name: '例证堆砌', level: '中', evidence: `例证${evidence}处而推理偏少`, fix: '例后补机制解释句。', paragraphIndex: 1 });
  if (topicType.code === 'relation' && countMatches(draft, /(另一方面|然而|同时)/gi) < 1) flaws.push({ name: '单边论证', level: '中', evidence: '关系题缺少双边分析信号', fix: '补“另一方面/然而”句。', paragraphIndex: 1 });
  if (weak) flaws.push({ name: '概念漂移（疑似偷换）', level: '高', evidence: `第${weak.index + 1}段贴合度低`, fix: '先回扣题眼再展开。', paragraphIndex: weak.index });
  if (scaffold?.dimensions?.some((d) => d.id === 'd4' && d.score < 55)) flaws.push({ name: '现实锚点不足', level: '中', evidence: '抽象判断较多，现实场景支撑偏弱', fix: '补一个时代语境例证并解释其指向。', paragraphIndex: 1 });
  if (scaffold?.dimensions?.some((d) => d.id === 'd3' && d.score < 55)) flaws.push({ name: '停留表象', level: '高', evidence: '现象描述多于机制解释', fix: '补“究其本质/其机制在于”句。', paragraphIndex: 1 });
  if (scaffold?.dimensions?.some((d) => d.id === 'd6' && d.score < 50)) flaws.push({ name: '结构节奏平面化', level: '中', evidence: '转折与递进标志词不足', fix: '补“诚然-然而-进一步而言”结构锚点。', paragraphIndex: 0 });

  return flaws.slice(0, 5).map((f, i) => ({ ...f, id: `flaw-${i + 1}`, rewriteLead: buildFlawLeadRewrite(f, topic, topicPhrases) }));
}

function buildFlawLeadRewrite(flaw, topic, topicPhrases) {
  const key = topicPhrases[0] || '该题核心';
  if (flaw.name === '结论绝对化') return `回到“${key}”，更稳妥的判断是：其成立需要明确前提与边界。`;
  if (flaw.name === '例证堆砌') return `围绕“${key}”，本段先给机制判断，再用例证验证，不做材料堆砌。`;
  if (flaw.name === '单边论证') return `讨论“${key}”时，不能只站一边，应在对照中呈现张力与边界。`;
  return `第${flaw.paragraphIndex + 1}段先回扣题目：本文讨论的核心是“${key}”。`;
}

function renderOffTopicReport(report, container) {
  const evidenceItems = report.evidence.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const suggestionItems = report.suggestions.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const dimensionCards = (report.scaffold?.dimensions || []).map((d) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(d.name)}</span><strong>${d.score}/100</strong></div>
      <div class="score-bar"><span style="width:${d.score}%"></span></div>
      <p class="agent-para-issues">依据：${escapeHtml(d.evidence)}</p>
      <p class="agent-para-issues">修正：${escapeHtml(d.fix)}</p>
    </div>
  `).join('');
  const paragraphCards = report.paragraphDiagnostics.map((item) => `
    <div class="score-row">
      <div class="score-row-top"><span>第${item.index + 1}段：${escapeHtml(item.level)}</span><strong>${item.semanticScore}/100</strong></div>
      <div class="score-bar"><span style="width:${item.semanticScore}%"></span></div>
      <p class="agent-para-issues">命中题眼：${escapeHtml((item.matchedTopicPhrases || []).join('、') || '无')}</p>
    </div>`).join('');

  container.innerHTML = `
    <div class="agent-result-head"><h3>防跑题诊断报告</h3><div class="agent-tags"><span class="agent-tag risk ${normalizeRiskClass(report.riskLevel)}">偏题风险：${report.riskLevel}</span><span class="agent-tag">扣题指数：${report.riskScore}/100</span></div></div>
    <div class="agent-result-block"><h4>思辨脚手架（6维）</h4><div class="score-grid">${dimensionCards}</div></div>
    <div class="agent-result-block"><h4>诊断依据</h4><ul>${evidenceItems}</ul></div>
    <div class="agent-result-block"><h4>修正建议</h4><ul>${suggestionItems}</ul></div>
    <div class="agent-result-block"><h4>段落贴合图</h4><div class="score-grid">${paragraphCards || '<p>暂无段落</p>'}</div></div>
    <div class="agent-result-block"><h4>论证漏洞扫描</h4>${renderFlawScanRows(report.flawScan || [])}</div>`;
}

function renderFlawScanRows(flawScan) {
  if (!flawScan.length) return '<p>未发现明显漏洞。</p>';
  return flawScan.map((item, idx) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(item.name)}</span><strong class="flaw-level ${item.level === '高' ? 'high' : 'medium'}">${item.level}优先级</strong></div>
      <p>识别依据：${escapeHtml(item.evidence)}</p>
      <p>修复动作：${escapeHtml(item.fix)}</p>
      <div class="flaw-actions"><span class="flaw-target">定位：第${item.paragraphIndex + 1}段首句</span><button class="flaw-fix-btn" type="button" data-flaw-index="${idx}">一键修复段首句</button></div>
    </div>`).join('');
}

function replaceParagraphLeadSentence(draft, paragraphIndex, newLeadSentence) {
  const ranges = getParagraphRanges(draft);
  if (!ranges.length) return { ok: false };
  const idx = clamp(paragraphIndex || 0, 0, ranges.length - 1);
  const target = ranges[idx];
  const sentences = getSentenceRanges(target.text);
  const lead = ensureSentenceEnding(newLeadSentence);
  let newParagraph = target.text;
  if (sentences.length) {
    const first = sentences[0];
    newParagraph = `${target.text.slice(0, first.start)}${lead}${target.text.slice(first.end)}`;
  } else {
    newParagraph = `${lead}${target.text ? `\n${target.text}` : ''}`;
  }
  return { ok: true, newDraft: `${draft.slice(0, target.start)}${newParagraph}${draft.slice(target.end)}` };
}

function scoreEssayDraft(topic, draft) {
  const offTopic = runOffTopicCheck(topic, draft);
  const paragraphs = splitParagraphs(draft);
  const sentenceCount = splitSentences(draft).length;
  const wordCount = countWords(draft);
  const relevance = clamp(Math.round(offTopic.riskScore * 0.2), 0, 20);
  const structure = clamp((paragraphs.length >= 3 ? 12 : 6) + (sentenceCount >= 8 ? 8 : 4), 0, 20);
  const argument = clamp((countMatches(draft, /(因为|所以|因此)/gi) >= 3 ? 12 : 7) + (countMatches(draft, /(例如|比如|案例)/gi) >= 1 ? 8 : 4), 0, 20);
  const language = clamp(wordCount >= 600 ? 16 : wordCount >= 380 ? 13 : 9, 0, 20);
  const depth = clamp(countMatches(draft, /(然而|另一方面|同时|边界|条件)/gi) >= 2 ? 16 : 10, 0, 20);
  const total = relevance + structure + argument + language + depth;
  const score70 = Math.round(total * 0.7);
  const level = getShanghaiBand(total);
  const dimensions = [
    { label: '审题立意', score: relevance, max: 20 },
    { label: '结构章法', score: structure, max: 20 },
    { label: '论证与材料', score: argument, max: 20 },
    { label: '语言表达', score: language, max: 20 },
    { label: '思辨深度', score: depth, max: 20 }
  ];
  return {
    topic,
    total,
    score70,
    level,
    dimensions,
    stats: { wordCount, sentenceCount, paragraphCount: paragraphs.length },
    offTopic,
    actions: [
      relevance < 15 ? '每段首句回扣题眼词。' : '审题扣题较稳。',
      argument < 15 ? '补1个例证并写清机制解释。' : '论证基础可用。',
      depth < 15 ? '补“另一方面/然而”做反向校正。' : '思辨层次基本达标。'
    ]
  };
}

function renderScoreReport(report, container) {
  const rows = report.dimensions.map((x) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(x.label)}</span><strong>${x.score}/${x.max}</strong></div>
      <div class="score-bar"><span style="width:${Math.round((x.score / x.max) * 100)}%"></span></div>
    </div>`).join('');
  const actions = report.actions.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  container.innerHTML = `
    <div class="agent-result-head"><h3>上海作文维度评分报告</h3><div class="agent-tags"><span class="agent-tag">总分：${report.total}/100</span><span class="agent-tag">折算：${report.score70}/70</span><span class="agent-tag">分档：${escapeHtml(report.level)}</span><span class="agent-tag risk ${normalizeRiskClass(report.offTopic.riskLevel)}">偏题风险：${escapeHtml(report.offTopic.riskLevel)}</span></div></div>
    <div class="agent-result-block"><h4>分维度得分</h4><div class="score-grid">${rows}</div></div>
    <div class="agent-result-block"><h4>文本统计</h4><p>字数：${report.stats.wordCount} ｜ 句子：${report.stats.sentenceCount} ｜ 段落：${report.stats.paragraphCount}</p></div>
    <div class="agent-result-block"><h4>提分动作</h4><ul>${actions}</ul></div>`;
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
          <div style="margin-top:8px;">
            <button class="agent-btn ghost timeline-train-btn" type="button" data-year="${escapeHtml(item.year)}">训练此题</button>
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
    const trigger = event.target.closest('.timeline-train-btn, .timeline-train-item');
    if (!trigger) return;
    const card = trigger.classList.contains('timeline-train-item') ? trigger : trigger.closest('.timeline-train-item');
    if (!card) return;
    startTrainingFromTimelineCard(card);
  });
  render();
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
  if (/(还是|与|和|之间|对立)/.test(text)) return { code: 'relation', name: '关系辩证型' };
  if (/(是否|应不应该|值得|好不好|应该)/.test(text)) return { code: 'value', name: '价值判断型' };
  if (/(如何|怎么|为什么|路径|方法)/.test(text)) return { code: 'method', name: '方法路径型' };
  return { code: 'phenomenon', name: '现象思辨型' };
}

function buildStanceOptions(topic, topicType, topicPhrases) {
  const key = topicPhrases[0] || '该题核心概念';
  const key2 = topicPhrases[1] || key;
  return [
    { title: '立场A：条件性肯定', thesis: `在特定前提下，${key}可以成立。`, risk: '风险：容易写成绝对肯定。' },
    { title: '立场B：条件性质疑', thesis: `若条件不足，${key}并不必然成立。`, risk: '风险：容易写成否定一切。' },
    { title: '立场C：关系整合', thesis: topicType.code === 'relation' ? `把“${key}—${key2}”写成动态关系。` : `把“${key}”放入前提-机制-结果链条。`, risk: '风险：结构复杂，需段段扣题。' }
  ];
}

function buildExamReadySentences(topic, topicType, topicPhrases) {
  const key = topicPhrases[0] || '该命题';
  return {
    opening: `面对“${topic}”，先界定“${key}”的含义，再讨论其成立条件。`,
    thesis: topicType.code === 'relation' ? `本文认为，“${key}”并非非此即彼，应在张力中判断。` : `本文主张：${key}的有效性取决于前提是否满足。`,
    closing: '回到题目，关键不是给唯一答案，而是作出条件化、负责任的判断。'
  };
}

function extractTopicPhrases(topic) {
  const cn = (topic.match(/[\u4e00-\u9fa5]{2,}/g) || []);
  return dedupeArray(cn).slice(0, 8);
}

function splitParagraphs(text) {
  return String(text || '').split(/\r?\n\r?\n+/).map((x) => x.trim()).filter(Boolean);
}

function splitSentences(text) {
  return String(text || '').split(/[。！？.!?；;]/).map((x) => x.trim()).filter(Boolean);
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
  if (total >= 90) return '一类上';
  if (total >= 80) return '一类卷';
  if (total >= 70) return '二类卷';
  if (total >= 60) return '三类卷';
  if (total >= 50) return '四类卷';
  return '五类卷';
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
