// Obsidian corpus matching, recommendation, and teaching-asset UI helpers.
function getMethodMoveKeys(card) {
  const title = String(card?.title || '');
  const category = String(card?.category || '');
  if (/对立统一|必然|偶然/.test(title)) return ['transition', 'boundary'];
  if (/量变|质变|因果/.test(title)) return ['mechanism'];
  if (/现象|本质/.test(title)) return ['mechanism', 'definition'];
  if (/价值|排序|条件/.test(title)) return ['boundary', 'definition'];
  if (/个人|社会|伦理/.test(title) || category === 'ethics') return ['reality', 'boundary'];
  if (/传承|创新/.test(title)) return ['definition', 'mechanism', 'reality'];
  if (category === 'epistemology') return ['definition', 'mechanism'];
  if (category === 'thinking') return ['mechanism', 'boundary'];
  return ['definition', 'mechanism'];
}

function getMethodThemeHints(card) {
  const title = String(card?.title || '');
  const category = String(card?.category || '');
  const hints = new Set();
  if (/对立|必然|偶然|量变|质变/.test(title) || category === 'dialectics') {
    hints.add('关系');
    hints.add('辩证');
  }
  if (/现象|本质|因果|条件/.test(title) || category === 'epistemology' || category === 'thinking') {
    hints.add('认知');
    hints.add('判断');
    hints.add('方法');
  }
  if (/价值|排序/.test(title) || category === 'axiology') {
    hints.add('价值');
    hints.add('意义');
  }
  if (/个人|社会|伦理/.test(title) || category === 'ethics') {
    hints.add('责任');
    hints.add('社会');
  }
  if (/传承|创新/.test(title)) {
    hints.add('传承');
    hints.add('创新');
    hints.add('文化');
  }
  return Array.from(hints);
}

function getMethodActionSteps(card, row) {
  const title = String(card?.title || '');
  const evidence = row?.evidence || row?.lead || '';
  const sampleTip = evidence ? `范文参照：先看它如何写“${summarizeSentence(evidence, 28)}”。` : '范文参照：先看对应段的段首句和例后分析。';
  if (/对立统一/.test(title)) {
    return ['第一句界定两端：A不是B的反面，而是与B互相校正。', '主体段写一端的合理性，再用“然而”写其边界。', sampleTip];
  }
  if (/必然|偶然/.test(title)) {
    return ['把偶然写成触发因素，把必然写成长期趋势。', '用“意外发生后，人如何回应”替代宿命论。', sampleTip];
  }
  if (/量变|质变/.test(title)) {
    return ['先写积累为什么还只是量变，再指出触发质变的阈值。', '例证后补一句：结构改变在哪里，价值新增在哪里。', sampleTip];
  }
  if (/现象|本质/.test(title)) {
    return ['开头先承认现象，再追问“它为什么会出现”。', '主体段按“表层表现-深层机制-现实后果”推进。', sampleTip];
  }
  if (/价值|排序/.test(title)) {
    return ['先给出排序标准：长期性、公平性、主体性或公共性。', '比较两种选择的代价，不要只说“都重要”。', sampleTip];
  }
  if (/个人|社会/.test(title)) {
    return ['先写个人处境，再写这种选择对他人和社会的影响。', '避免道德喊话，落到制度、关系或行动责任。', sampleTip];
  }
  if (/因果/.test(title)) {
    return ['每段都补齐“前提-机制-结果”，不让例子裸奔。', '例子后必须回答：它为什么能证明这一段观点。', sampleTip];
  }
  if (/条件/.test(title)) {
    return ['把“一定/必须/只有”改成“在……条件下更可能”。', '主动写一条例外，说明观点的适用边界。', sampleTip];
  }
  if (/传承|创新/.test(title)) {
    return ['先区分“简单拼接”和“重新生成”。', '写清旧资源如何形成新结构、新解释或新效用。', sampleTip];
  }
  return ['先把抽象概念改写成题目中的具体关系。', '主体段补机制解释，结尾补边界条件。', sampleTip];
}

function scoreEssayForMethodCard(essay, card) {
  if (!essay || !card) return 0;
  const haystack = [
    essay.title,
    essay.prompt,
    essay.topicKey,
    essay.topicType,
    essay.themeTag,
    essay.docRole,
    essay.yearLabel,
    ...(essay.highScoreMoves || []),
    ...(essay.anchorTerms || []).slice(0, 12)
  ].filter(Boolean).join(' ');
  const years = Array.isArray(card.years) ? card.years.map((year) => String(year).replace(/\D/g, '')) : [];
  let score = 0;
  if (years.includes(String(essay.yearLabel || ''))) score += 30;
  getMethodThemeHints(card).forEach((hint) => {
    if (haystack.includes(hint)) score += 12;
  });
  getMethodMoveKeys(card).forEach((key) => {
    const hit = (essay.paragraphDissection || []).some((row) => (row.moveKeys || []).includes(key));
    if (hit) score += 10;
  });
  const titleTerms = String(card.title || '').split('').filter((ch) => /[\u4e00-\u9fa5]/.test(ch));
  titleTerms.forEach((term) => {
    if (haystack.includes(term)) score += 2;
  });
  if (essay.scoreBand?.isHighScore) score += 10;
  return score;
}

function rankObsidianEssaysForMethodCard(card, limit = 6) {
  const essays = getObsidianTeachingEssays();
  if (!essays.length) return [];
  return essays
    .map((essay) => ({ ...essay, methodScore: scoreEssayForMethodCard(essay, card) }))
    .filter((essay) => essay.methodScore > 0)
    .sort((a, b) => b.methodScore - a.methodScore)
    .slice(0, limit);
}

function pickMethodBridgeParagraph(essay, card) {
  const rows = Array.isArray(essay?.paragraphDissection) ? essay.paragraphDissection : [];
  if (!rows.length) return null;
  const keys = getMethodMoveKeys(card);
  return rows.find((row) => (row.moveKeys || []).some((key) => keys.includes(key)))
    || rows.find((row) => /主体|分析|推进|转折|边界/.test(row.role || ''))
    || rows[0];
}

function buildMethodCardObsidianBridge(card) {
  const matches = rankObsidianEssaysForMethodCard(card, 3);
  const essay = matches[0] || null;
  const row = pickMethodBridgeParagraph(essay, card);
  return {
    matchCount: matches.length,
    essay,
    row,
    paragraphIndex: row?.index || 1,
    actions: getMethodActionSteps(card, row)
  };
}

function renderMethodCardBridge(bridge) {
  if (!bridge?.essay) {
    return `
      <div class="card-method-bridge">
        <div class="card-method-bridge-title">范文迁移</div>
        <p>暂未匹配到 OB 范文。先按上面的三条落地写法训练。</p>
      </div>
    `;
  }
  return `
    <div class="card-method-bridge">
      <div class="card-method-bridge-title">范文迁移</div>
      <p><strong>看哪篇</strong>：${escapeHtml(summarizeSentence(bridge.essay.title || 'OB范文', 24))}</p>
      <p><strong>看哪段</strong>：第${bridge.paragraphIndex || 1}段｜${escapeHtml(bridge.row?.role || '段落推进')}</p>
      <ol class="card-method-steps">${(bridge.actions || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </div>
  `;
}

function rankMethodCardsForObsidianEssay(essay, limit = 3) {
  if (typeof PHILOSOPHY_CARDS === 'undefined' || !Array.isArray(PHILOSOPHY_CARDS)) return [];
  return PHILOSOPHY_CARDS
    .map((card) => {
      const row = pickMethodBridgeParagraph(essay, card);
      return {
        ...card,
        row,
        methodScore: scoreEssayForMethodCard(essay, card),
        actions: getMethodActionSteps(card, row)
      };
    })
    .filter((card) => card.methodScore > 0)
    .sort((a, b) => b.methodScore - a.methodScore)
    .slice(0, limit);
}

function renderObsidianEssayMethodCardBlock(essay) {
  const cards = rankMethodCardsForObsidianEssay(essay, 3);
  if (!cards.length) return '';
  const rows = cards.map((card, index) => `
    <div class="flaw-row">
      <div class="flaw-row-top">
        <span>${index + 1}. ${escapeHtml(card.title || '方法卡')}</span>
        <strong>第${card.row?.index || 1}段</strong>
      </div>
      <p><strong>抽象概念</strong>：${escapeHtml(card.description || card.subtitle || '')}</p>
      <p><strong>范文落点</strong>：${escapeHtml(card.row?.evidence || card.row?.lead || '看这一段如何承担论证功能。')}</p>
      <p><strong>迁移动作</strong>：${escapeHtml((card.actions || [])[0] || '把概念转成题目中的具体关系。')}</p>
    </div>
  `).join('');
  return `
    <div class="agent-result-block">
      <h4>关联方法卡片</h4>
      <p class="agent-para-issues">这一步把范文里的高分动作翻译成可训练的方法卡：不是背哲学名词，而是学它在文章中怎么落地。</p>
      <div class="score-grid">${rows}</div>
    </div>
  `;
}

let OBSIDIAN_ENTRY_INDEX_CACHE = null;
let OBSIDIAN_SUPPORT_PROFILE_CACHE = null;
const OBSIDIAN_INDEX_FETCH_TIMEOUT_MS = 1200;

function getEmbeddedObsidianEntryIndex() {
  try {
    if (typeof window !== 'undefined' && Array.isArray(window.OBSIDIAN_ENTRY_INDEX)) {
      return window.OBSIDIAN_ENTRY_INDEX;
    }
    if (typeof OBSIDIAN_ENTRY_INDEX !== 'undefined' && Array.isArray(OBSIDIAN_ENTRY_INDEX)) {
      return OBSIDIAN_ENTRY_INDEX;
    }
  } catch (_) {
    return [];
  }
  return [];
}

function getEmbeddedObsidianSupportProfile() {
  try {
    if (OBSIDIAN_SUPPORT_PROFILE_CACHE) return OBSIDIAN_SUPPORT_PROFILE_CACHE;
    if (typeof window !== 'undefined' && window.OBSIDIAN_SUPPORT_PROFILE) {
      OBSIDIAN_SUPPORT_PROFILE_CACHE = window.OBSIDIAN_SUPPORT_PROFILE;
      return OBSIDIAN_SUPPORT_PROFILE_CACHE;
    }
    if (typeof OBSIDIAN_SUPPORT_PROFILE !== 'undefined' && OBSIDIAN_SUPPORT_PROFILE) {
      OBSIDIAN_SUPPORT_PROFILE_CACHE = OBSIDIAN_SUPPORT_PROFILE;
      return OBSIDIAN_SUPPORT_PROFILE_CACHE;
    }
  } catch (_) {
    return null;
  }
  return null;
}

async function loadObsidianEntryIndex() {
  if (Array.isArray(OBSIDIAN_ENTRY_INDEX_CACHE)) return OBSIDIAN_ENTRY_INDEX_CACHE;
  const embedded = getEmbeddedObsidianEntryIndex();
  if (embedded.length) {
    OBSIDIAN_ENTRY_INDEX_CACHE = embedded;
    return OBSIDIAN_ENTRY_INDEX_CACHE;
  }
  if (typeof fetch !== 'function') {
    OBSIDIAN_ENTRY_INDEX_CACHE = [];
    return OBSIDIAN_ENTRY_INDEX_CACHE;
  }
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), OBSIDIAN_INDEX_FETCH_TIMEOUT_MS) : null;
  try {
    const response = await fetch('obsidian_vault/_meta/obsidian-entry-index.json', {
      cache: 'no-store',
      signal: controller?.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    OBSIDIAN_ENTRY_INDEX_CACHE = Array.isArray(data) ? data : [];
  } catch (_) {
    OBSIDIAN_ENTRY_INDEX_CACHE = [];
  } finally {
    if (timer) clearTimeout(timer);
  }
  return OBSIDIAN_ENTRY_INDEX_CACHE;
}

function normalizeObsidianTopicTypeName(name) {
  const text = String(name || '');
  if (/问题|设问/.test(text)) return '问题式命题';
  if (/关系|辩证|二元|对立/.test(text)) return '关系辩证题';
  if (/价值|判断|认可|意义/.test(text)) return '价值判断题';
  if (/话题/.test(text)) return '话题作文';
  if (/材料|主题|路径|方法/.test(text)) return '材料作文';
  if (/现象|思辨/.test(text)) return '现象思辨题';
  return text || '未分类';
}

function normalizeObsidianMatchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[“”"‘’'《》〈〉（）()【】\[\]，。！？、：；\s\-—·.,!?;:]/g, '');
}

function inferObsidianThemeTag(topic, draft = '') {
  const text = `${topic || ''} ${draft || ''}`;
  const rules = [
    { tag: '技术与传播', regex: /(专.*转.*传|专业文章|通俗文章|传世|传播|转发|媒介|短视频|互联网|AI|人工智能|知识生产|公共传播)/ },
    { tag: '价值与意义', regex: /(认可度|价值|意义|有用|无用|值得|高下|传世|沉淀|认可|重要)/ },
    { tag: '自我与成长', regex: /(自我|成长|内心|真实所求|断舍离|被需要|坚硬|柔软|选择|主体)/ },
    { tag: '认知与判断', regex: /(判断|发问|结论|好奇心|陌生世界|预测|知识|综合|创新|中国味|标准)/ },
    { tag: '关系与责任', regex: /(关系|责任|规则|自由|不自由|共识|对话|我们|他们|帮助)/ },
    { tag: '生活现象与思辨', regex: /(生活|社会|现实|时代|评价|忙|流行|公共|群体|个人)/ }
  ];
  return rules.find((rule) => rule.regex.test(text))?.tag || '';
}

function extractObsidianMatchTerms(topic, draft, analysis) {
  const topicText = String(topic || '');
  const draftText = String(draft || '');
  const quoted = [...topicText.matchAll(/[“"']([^”"']{1,16})[”"']/g)].map((m) => m[1]);
  const fixed = ['认可度', '断舍离', '真实所求', '专', '转', '传', '好奇心', '陌生世界', '时间', '价值', '发问', '结论', '创新', '综合', '自由', '不自由', '被需要', '中国味'];
  const chunks = (topicText.match(/[\u4e00-\u9fa5A-Za-z0-9]{2,10}/g) || [])
    .map((x) => x.replace(/生活中|人们|请写|文章|谈谈|认识|思考|对此|要求|自拟|不少于/g, ''))
    .filter((x) => x.length >= 2);
  const draftSignals = fixed.filter((kw) => draftText.includes(kw));
  return normalizeTopicPhrases(dedupeArray([
    ...fixed.filter((kw) => topicText.includes(kw)),
    ...quoted,
    ...(analysis?.topicPhrases || []),
    ...extractTopicPhrases(topicText),
    ...chunks,
    ...draftSignals
  ])).filter((x) => normalizeObsidianMatchText(x).length >= 2);
}

function getTeacherReportWeakFocus(report) {
  const dimensions = [
    { key: '立意', score: report.intent?.score ?? 0, max: report.intent?.max ?? 12, action: '先对照范文开头，检查它怎样界定核心概念、怎样把题目问法转成中心判断。' },
    { key: '中心论点', score: report.thesis?.score ?? 0, max: report.thesis?.max ?? 10, action: '重点看范文第1段末尾或第2段开头，学习“完整判断句”如何贯穿全文。' },
    { key: '论证逻辑', score: report.argument?.score ?? 0, max: report.argument?.max ?? 12, action: '重点看范文中段，标出“观点-例证-机制解释-回扣题眼”的完整链条。' },
    { key: '语言表达', score: report.language?.score ?? 0, max: report.language?.max ?? 10, action: '重点看范文如何用短判断句承接转折，不学辞藻，学句子推进。' },
    { key: '结构章法', score: report.structure?.score ?? 0, max: report.structure?.max ?? 8, action: '重点看范文段落顺序，确认它是否按“界定-展开-边界-收束”推进。' }
  ];
  return dimensions
    .map((item) => ({ ...item, ratio: item.max ? item.score / item.max : 0 }))
    .sort((a, b) => a.ratio - b.ratio)[0] || dimensions[0];
}

function scoreObsidianEntryForEssay(entry, topic, draft, analysis) {
  const topicText = String(topic || '');
  const draftText = String(draft || '');
  const haystackRaw = [
    entry.title,
    entry.topicKey,
    entry.topicType,
    entry.themeTag,
    entry.docRole,
    entry.folder,
    entry.relativePath,
    entry.packTitle,
    entry.sourceFile,
    entry.typeNoteName,
    entry.themeNoteName,
    entry.clusterNoteName,
    ...(entry.anchorTerms || []),
    ...(entry.promptSamples || []),
    ...(entry.trainingUses || [])
  ].filter(Boolean).join(' ');
  const haystack = normalizeObsidianMatchText(haystackRaw);
  const topicNorm = normalizeObsidianMatchText(topicText);
  const entryTopicNorm = normalizeObsidianMatchText(`${entry.title || ''}${entry.topicKey || ''}`);
  const topicTypeName = normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(topicText).name);
  const entryTypeName = normalizeObsidianTopicTypeName(entry.topicType);
  const inferredTheme = inferObsidianThemeTag(topicText, draftText);
  const phrases = extractObsidianMatchTerms(topicText, draftText, analysis);
  let score = 0;
  const reasons = [];

  const shortTopicNeedle = topicNorm.slice(0, 24);
  if (shortTopicNeedle.length >= 8 && entryTopicNorm.includes(shortTopicNeedle)) {
    score += 48;
    reasons.push('同题档案');
  }

  if (entryTypeName && topicTypeName && entryTypeName === topicTypeName) {
    score += 26;
    reasons.push(`同属“${entryTypeName}”`);
  }

  if (inferredTheme && entry.themeTag === inferredTheme) {
    score += 16;
    reasons.push(`同母题：${inferredTheme}`);
  }

  if (entry.scoreBand?.isHighScore && /(高分范文|佳作|下水|师生同写|高考同题)/.test(String(entry.docRole || entry.sourceFile || ''))) {
    score += 8;
    reasons.push('OB高分标杆');
  }

  phrases.slice(0, 10).forEach((phrase) => {
    const needle = normalizeObsidianMatchText(phrase);
    if (needle && haystack.includes(needle)) {
      score += needle.length >= 4 ? 18 : 12;
      reasons.push(`题眼同频：${phrase}`);
    }
  });

  if (/(是否|吗|怎样|如何|为什么|何以|必定|仅仅)/.test(topicText) && entryTypeName === '问题式命题') {
    score += 10;
    reasons.push('同为问题式设问');
  }
  if (/(价值|意义|认可|有用|无用|值得|高下)/.test(topicText) && entryTypeName === '价值判断题') {
    score += 8;
    reasons.push('同为价值判断角度');
  }
  const relationCoreText = topicText
    .replace(/认识和思考|认识与思考|谈谈你对|谈谈你的|请写一篇文章/g, '')
    .replace(/认识|思考/g, '');
  if (/(关系|既.*又|之间|一方面|另一方面|对立|统一|自由.*不自由|坚硬.*柔软)/.test(relationCoreText) && entryTypeName === '关系辩证题') {
    score += 8;
    reasons.push('同为关系辨析角度');
  }

  (['AI', '人工智能', '短视频', '社交媒体', '学习', '知识', '责任', '自由', '认可度', '断舍离', '创新', '好奇心', '真实所求', '传播']).forEach((kw) => {
    if ((topicText.includes(kw) || draftText.includes(kw)) && haystack.includes(normalizeObsidianMatchText(kw))) {
      score += 6;
      reasons.push(`现实关键词：${kw}`);
    }
  });

  return { score, reasons: dedupeArray(reasons).slice(0, 3) };
}

function buildObsidianVisibleItem(entry, index, weakFocus, report, matched, mode = 'Obsidian范文库') {
  const reasons = matched?.reasons?.length ? matched.reasons.join('；') : '题型或母题接近';
  const weakParagraph = report.paragraphRows?.[0]?.paragraph || 2;
  const roleText = String(`${entry.docRole || ''}${entry.topicType || ''}${entry.themeTag || ''}`);
  const benchmarkMove = /方法|解析|评分/.test(roleText)
    ? '先看它的方法句：如何拆概念、分层讨论、落到现实。'
    : (/高分|佳作|一类|下水/.test(roleText)
      ? '先看它的成文节奏：开头如何立中心，中段如何补机制，结尾如何收边界。'
      : '先看它的题型处理方式：不要抄句子，只学段落功能。');
  const visibleAction = `${weakFocus.action} OB对照动作：${benchmarkMove}`;
  return {
    rank: index + 1,
    title: entry.title || entry.topicKey || '未命名范文档案',
    meta: `${entry.docRole || entry.sourceFile || mode}｜${entry.yearLabel || '年份未标'}｜${entry.topicType || '题型未标'}｜${entry.themeTag || '母题未标'}`,
    why: `${mode}：${reasons}`,
    visibleAction,
    selfCheck: `看完后回到自己的第${weakParagraph}段，只检查“${weakFocus.key}”这一项：段首是否回题眼，例后是否有机制解释，结尾是否有条件边界。`,
    location: entry.wikiPath ? `Obsidian 定位：[[${entry.wikiPath}]]` : `Obsidian 文件：${entry.notePath || '未记录路径'}`,
    matchScore: matched?.score || entry.matchScore || 0
  };
}

function buildObsidianFallbackEntries(index, topic, draft, analysis) {
  const topicTypeName = normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(topic).name);
  const inferredTheme = inferObsidianThemeTag(topic, draft);
  return index
    .map((entry) => {
      const entryTypeName = normalizeObsidianTopicTypeName(entry.topicType);
      let score = 0;
      const reasons = [];
      if (topicTypeName && entryTypeName === topicTypeName) {
        score += 18;
        reasons.push(`同题型兜底：${entryTypeName}`);
      }
      if (inferredTheme && entry.themeTag === inferredTheme) {
        score += 14;
        reasons.push(`同母题兜底：${inferredTheme}`);
      }
      if (score > 0 && /202[3-6]|2024|2025/.test(String(entry.yearLabel || entry.packTitle || entry.sourceFile || ''))) {
        score += 3;
      }
      return { ...entry, matchScore: score, matchReasons: reasons };
    })
    .filter((entry) => entry.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function buildFallbackVisibleExampleSuggestions(topic, analysis, report) {
  const weakFocus = getTeacherReportWeakFocus(report);
  const cards = pickRelevantExampleCards(topic, analysis?.topicType, 3);
  return cards.map((card, index) => ({
    rank: index + 1,
    title: card.title,
    meta: `${card.source || '内置范例训练卡'}｜${(card.categories || []).join(' / ') || '上海作文范例'}`,
    why: card.focus || card.intent || '与当前题目的题型或关键词相近，可用来做同类题对照。',
    visibleAction: weakFocus.action,
    selfCheck: card.risk ? `对照避坑：${card.risk}` : `对照后只做一件事：把自己文章中最弱的“${weakFocus.key}”补清楚。`,
    location: `应用内置范例训练卡：${card.id}`,
    matchScore: card.matchScore || 0
  }));
}

async function buildVisibleObsidianSuggestions(topic, draft, analysis, report) {
  const weakFocus = getTeacherReportWeakFocus(report);
  const index = await loadObsidianEntryIndex();
  const scoredEntries = index
    .map((entry) => {
      const matched = scoreObsidianEntryForEssay(entry, topic, draft, analysis);
      return { ...entry, matchScore: matched.score, matchReasons: matched.reasons };
    })
    .filter((entry) => entry.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  let entries = scoredEntries.slice(0, 3);
  let mode = index.length ? `已加载 ${index.length} 篇 Obsidian 档案` : 'Obsidian索引未加载';

  if (!entries.length && index.length) {
    entries = buildObsidianFallbackEntries(index, topic, draft, analysis);
    mode = `已加载 ${index.length} 篇 Obsidian 档案，按邻近题型/母题推荐`;
  }

  if (!entries.length) {
    return buildFallbackVisibleExampleSuggestions(topic, analysis, report);
  }

  return entries.map((entry, idx) => buildObsidianVisibleItem(
    entry,
    idx,
    weakFocus,
    report,
    { score: entry.matchScore, reasons: entry.matchReasons || [] },
    mode
  ));
}

function renderVisibleObsidianSuggestionBlock(items) {
  const rows = (items || []).map((item) => `
    <div class="flaw-row obsidian-visible-card">
      <div class="flaw-row-top">
        <span>对照建议 ${item.rank}｜${escapeHtml(item.title)}</span>
        <strong>匹配度 ${Math.round(item.matchScore || 0)}</strong>
      </div>
      <p><strong>为什么看它</strong>：${escapeHtml(item.why || '与当前习作题型接近。')}</p>
      <p><strong>看得见的动作</strong>：${escapeHtml(item.visibleAction || '只学它的结构，不照搬表达。')}</p>
      <p><strong>自改检查</strong>：${escapeHtml(item.selfCheck || '看完后只改自己文章中最弱的一项。')}</p>
      <p><strong>位置</strong>：${escapeHtml(item.meta || '')}；${escapeHtml(item.location || '')}</p>
    </div>
  `).join('');
  return `
    <div class="agent-result-block">
      <h4>Obsidian 范文库可见建议</h4>
      <p>不是让孩子照抄范文，而是给他一个“看得见的对照物”：看哪篇、看什么、回到自己文章改哪一项。</p>
      ${rows || '<p>暂未匹配到 Obsidian 范文；可先补全题目，或在范文库中增加同题档案。</p>'}
    </div>
  `;
}

async function buildObsidianHighScoreBenchmark(topic, draft, analysis, offTopic, checks = {}) {
  const index = await loadObsidianEntryIndex();
  const supportProfile = getEmbeddedObsidianSupportProfile();
  const signals = offTopic?.expertSignals || assessExpertEssaySignals(topic, draft, {
    topicPhrases: analysis?.topicPhrases || offTopic?.topicPhrases || [],
    semanticBridgeScore: offTopic?.semanticBridgeScore || 0
  });
  const bridge = Number(offTopic?.semanticBridgeScore || signals.bridge || 0);
  const selfAxis = Number(signals.selfAxisScore || 0);
  const scored = (index || [])
    .map((entry) => {
      const matched = scoreObsidianEntryForEssay(entry, topic, draft, analysis);
      return { ...entry, matchScore: matched.score, matchReasons: matched.reasons || [] };
    })
    .filter((entry) => entry.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
  const topMatch = clamp(scored[0]?.matchScore || 0, 0, 100);
  const topicTypeName = normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(topic).name);
  const typeMatch = scored.some((entry) => normalizeObsidianTopicTypeName(entry.topicType) === topicTypeName);
  const theme = inferObsidianThemeTag(topic, draft);
  const themeMatch = scored.some((entry) => theme && entry.themeTag === theme);
  const highScoreMatch = scored.some((entry) => entry.scoreBand?.isHighScore);
  const highScoreProfile = buildHighScoreEssayProfile(topic, draft, analysis, offTopic, checks);
  const corpusScore = clamp(
    Math.round(topMatch * 0.38 + Number(signals.score || 0) * 0.28 + bridge * 0.18 + selfAxis * 0.16)
      + (typeMatch ? 4 : 0)
      + (themeMatch ? 3 : 0)
      + (highScoreMatch ? 3 : 0),
    0,
    100
  );
  const profileBackfill = supportProfile?.highScoreCount
    ? clamp(Math.round(highScoreProfile.score * 0.82 + (highScoreProfile.moveScore || 0) * 0.12 + (highScoreProfile.rhythmScore || 0) * 0.06), 0, 100)
    : 0;
  const score = clamp(Math.max(corpusScore, profileBackfill), 0, 100);
  const traits = [];
  traits.push(`高分画像：${highScoreProfile.label}（${highScoreProfile.score}/100）`);
  if (Number(signals.score || 0) >= 78) traits.push('论证节奏接近高分范文');
  if (bridge >= 68) traits.push('题意关联稳定');
  if (selfAxis >= 65) traits.push('自拟中心轴贯穿明显');
  if (typeMatch) traits.push('与OB高分库同题型');
  if (themeMatch) traits.push('与OB高分库同母题');
  if (highScoreMatch) traits.push('命中OB高分/下水标杆');
  if (!traits.length) traits.push('暂未形成稳定高分特征');
  return {
    score,
    corpusScore,
    indexSize: index.length,
    supportProfile,
    highScoreProfile,
    matched: scored.map((entry) => ({
      title: entry.title || entry.topicKey || '未命名范文',
      docRole: entry.docRole || '',
      topicType: entry.topicType || '',
      themeTag: entry.themeTag || '',
      sourceFile: entry.sourceFile || '',
      scoreBand: entry.scoreBand || null,
      matchScore: entry.matchScore,
      reasons: entry.matchReasons || []
    })),
    traits
  };
}

function renderObsidianBenchmarkPanel(report) {
  const benchmark = report.officialScore?.obsidianBenchmark || report.obsidianBenchmark;
  const sourceComparison = report.officialScore?.sourceComparison;
  const supportProfile = benchmark?.supportProfile || getEmbeddedObsidianSupportProfile();
  const profileLine = supportProfile?.total
    ? `OB库共${supportProfile.total}篇，含${supportProfile.highScoreCount || 0}篇高分/可作标杆档案；主要支撑：${Object.entries(supportProfile.trainingUseCounts || {}).slice(0, 4).map(([k, v]) => `${k}${v}`).join('、')}`
    : '';
  const matchedRows = (benchmark?.matched || []).slice(0, 3).map((item) => `
    <li>${escapeHtml(item.title)}｜${escapeHtml(item.docRole || item.sourceFile || 'OB档案')}｜${escapeHtml(item.topicType || '题型未标')}｜${escapeHtml(item.themeTag || '母题未标')}｜${item.scoreBand?.isHighScore ? '高分标杆｜' : ''}匹配${Math.round(item.matchScore || 0)}</li>
  `).join('');
  const traitRows = (benchmark?.traits || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const profile = benchmark?.highScoreProfile || null;
  const profileRows = profile ? `
    <div class="score-grid">
      <div class="flaw-row"><div class="flaw-row-top"><span>题眼覆盖</span><strong>${Math.round(profile.topicCoverage || 0)}/100</strong></div><p>看核心概念是否贯穿多段，而不是只在开头出现。</p></div>
      <div class="flaw-row"><div class="flaw-row-top"><span>思辨动作</span><strong>${Math.round(profile.moveScore || 0)}/100</strong></div><p>统计界定、转折、机制、边界、现实关联等高分动作。</p></div>
      <div class="flaw-row"><div class="flaw-row-top"><span>段落节奏</span><strong>${Math.round(profile.rhythmScore || 0)}/100</strong></div><p>检查是否像完整考场议论文，而不是片段式讲评。</p></div>
      <div class="flaw-row"><div class="flaw-row-top"><span>中心轴</span><strong>${Math.round(profile.thesisAxisScore || 0)}/100</strong></div><p>看中心判断是否在后文持续推进。</p></div>
    </div>
  ` : '';
  return `
    <div class="agent-result-block">
      <h4>OB高分范文标杆校准</h4>
      <p><strong>标杆命中</strong>：${benchmark?.indexSize ? `已加载${benchmark.indexSize}篇OB高分档案，匹配度 ${Math.round(benchmark.score || 0)}/100` : '未加载到OB索引，暂用规则评分'}</p>
      ${profileLine ? `<p><strong>库画像</strong>：${escapeHtml(profileLine)}</p>` : ''}
      ${profile ? `<p><strong>高分画像</strong>：${escapeHtml(profile.label)}｜总相似度 ${Math.round(profile.score || 0)}/100｜${escapeHtml((profile.strengths || []).join('、') || '暂无明显优势')}</p>${profileRows}` : ''}
      <p><strong>高分特征</strong></p>
      <ul>${traitRows || '<li>暂未形成稳定高分特征。</li>'}</ul>
      <p><strong>相近范文</strong></p>
      <ul>${matchedRows || '<li>暂无相近OB范文；可补同题档案后再测。</li>'}</ul>
      <p><strong>原评对照</strong>：${sourceComparison ? `${escapeHtml(sourceComparison.label)} ${sourceComparison.score}分｜系统差距 ${sourceComparison.gap > 0 ? '+' : ''}${sourceComparison.gap}分｜${escapeHtml(sourceComparison.status)}` : '未检测到资料原评'}</p>
      <p class="agent-para-issues">原评只做复核参照，不直接抬高系统分；系统主要学习OB高分范文的题型、母题、中心轴和论证节奏。</p>
    </div>
  `;
}

function renderObsidianScoreEngineDecision(report) {
  const decision = report.officialScore?.benchmarkDecision;
  const calibration = report.officialScore?.calibrationDecision;
  if (!decision) return '';
  return `
    <div class="agent-result-block">
      <h4>OB校准后的评分引擎判断</h4>
      <div class="score-grid">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>标杆强度</span><strong>${Math.round(decision.benchmarkScore || 0)}/100</strong></div>
          <p><strong>高分画像</strong>：${Math.round(decision.profileScore || 0)}/100</p>
          <p><strong>命中情况</strong>：${decision.matchedCount || 0}篇｜${decision.highScoreAnchor ? '含高分/一类标杆' : '暂无明确高分标杆'}</p>
          <p><strong>最相近档案</strong>：${escapeHtml(decision.topTitle || '暂无')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>校准结论</span><strong>${escapeHtml(decision.effect || '不调整')}</strong></div>
          <p><strong>证据</strong>：${escapeHtml(decision.evidence || '暂无')}</p>
          <p><strong>下限处理</strong>：${decision.floor ? `设置复核下限 ${decision.floor} 分` : '不设置分数下限，仍按原文证据赋分'}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>评分锚点校准</span><strong>${escapeHtml(calibration?.anchorLabel || '暂无锚点')}</strong></div>
          <p><strong>锚点预期</strong>：${escapeHtml(calibration?.expectedScore ? `${calibration.expectedBand}｜${calibration.expectedScore}分` : '暂无')}</p>
          <p><strong>置信度</strong>：${escapeHtml(String(calibration?.confidence ?? '--'))}/100</p>
          <p><strong>处理</strong>：${escapeHtml(calibration?.effect || '只做参照，不调整')}</p>
          <p><strong>证据</strong>：${escapeHtml(calibration?.evidence || '暂无')}</p>
        </div>
      </div>
      <p class="agent-para-issues">这一步专门解决“好文章被关键词规则误杀”的问题：OB只负责复核分档，最终仍要看正文的中心轴、语义关联、结构与语言证据。</p>
    </div>
  `;
}

function buildScoreBandBoundaryExplanation(report) {
  const score = Number(report.total70 || report.officialScore?.score || 0);
  const signals = report.officialScore?.calibrationDecision
    ? (report.officialScore?.obsidianBenchmark?.highScoreProfile || {})
    : {};
  const officialSignals = report.officialScore?.signals || buildShanghaiOfficialRubricSignals({
    offTopic: report.offTopic,
    thesis: report.thesis,
    argument: report.argument,
    material: report.material,
    language: report.language,
    structure: report.structure,
    wordCount: countWords(report.draft)
  });
  const bandKey = getShanghaiBandKeyByScore(score);
  const whyNotHigher = [];
  const whyNotLower = [];
  if (bandKey !== 'class1') {
    if (officialSignals.topicAccuracy < 80) whyNotHigher.push(`题眼准确度${officialSignals.topicAccuracy}/100，还没有达到一类卷“准确理解材料”的稳定线。`);
    if (officialSignals.thoughtDepth < 82) whyNotHigher.push(`思辨深度${officialSignals.thoughtDepth}/100，仍缺少持续的机制解释或边界反思。`);
    if (officialSignals.structureStable < 72) whyNotHigher.push(`结构稳定度${officialSignals.structureStable}/100，段落推进还不够像一类卷的层层递进。`);
    if (officialSignals.languageStable < 62) whyNotHigher.push(`语言稳定度${officialSignals.languageStable}/100，表达还未形成足够的判断密度。`);
  } else {
    if (score < 67) whyNotHigher.push('已进入一类，但要到一类上，需要更鲜明的中心轴、更均衡的主体段和更有辨识度的结尾收束。');
    else whyNotHigher.push('已接近高分区，继续提升主要看语言精度、素材新鲜度和段落之间的牵引感。');
  }
  if (officialSignals.topicAccuracy >= 60) whyNotLower.push(`题眼准确度${officialSignals.topicAccuracy}/100，至少能让阅卷者看到材料核心没有丢。`);
  if (officialSignals.thesisStable >= 50) whyNotLower.push(`中心论点稳定度${officialSignals.thesisStable}/100，文章不是完全散谈。`);
  if (officialSignals.structureStable >= 50) whyNotLower.push(`结构稳定度${officialSignals.structureStable}/100，起承转合基本可辨。`);
  if (report.argument?.score >= 7) whyNotLower.push('论证中能看到因果/转折/例证动作，因此不宜直接压到低档。');
  const currentBlock = bandKey === 'class2'
    ? `当前主要卡在${report.officialScore?.bandLane || '二类内部'}：要上探一类，需要把“观点成立的条件”和“例子证明观点的机制”写得更连续。`
    : (bandKey === 'class1'
      ? '当前已经进入一类区间，后续看能否从“稳定一类”推进到“有独到锋芒的一类上”。'
      : `当前卡在${getShanghaiOfficialBand(score)}：先解决题眼贯穿和完整展开，再谈语言润色。`);
  return {
    topicTypeFocus: officialSignals.topicTypeFocus || describeTopicTypeScoringFocus(report.offTopic?.topicType?.code),
    whyNotHigher: whyNotHigher.slice(0, 4),
    whyNotLower: whyNotLower.slice(0, 4),
    currentBlock,
    signals: officialSignals,
    highScoreProfile: signals
  };
}

function renderScoreBandBoundaryPanel(report) {
  const explain = buildScoreBandBoundaryExplanation(report);
  const higherRows = explain.whyNotHigher.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const lowerRows = explain.whyNotLower.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  return `
    <div class="agent-result-block">
      <h4>像阅卷老师一样解释分数</h4>
      <p><strong>题型权重</strong>：${escapeHtml(explain.topicTypeFocus)}</p>
      <p><strong>当前卡点</strong>：${escapeHtml(explain.currentBlock)}</p>
      <div class="score-grid">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>为什么暂时不是上一档</span><strong>卡分点</strong></div>
          <ul>${higherRows || '<li>暂无明显上一档卡点。</li>'}</ul>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>为什么不能再往下压</span><strong>保分点</strong></div>
          <ul>${lowerRows || '<li>保分证据不足，需先补题眼和中心句。</li>'}</ul>
        </div>
      </div>
    </div>
  `;
}

function findCalibrationSamplesForTopic(topic) {
  const samples = getShanghaiScoreCalibrationSamples();
  const exact = samples.filter((sample) => sample.topic === topic);
  if (exact.length) return exact;
  const phrases = extractTopicPhrases(topic).filter((x) => x && x.length >= 2);
  const scored = samples.map((sample) => {
    const text = `${sample.topic} ${sample.label}`;
    const hit = phrases.filter((phrase) => text.includes(phrase)).length;
    return { sample, hit };
  }).filter((x) => x.hit > 0).sort((a, b) => b.hit - a.hit);
  const topTopic = scored[0]?.sample?.topic || '';
  return samples.filter((sample) => sample.topic === topTopic);
}

function renderSameTopicCalibrationPanel(report) {
  const samples = findCalibrationSamplesForTopic(report.topic).slice(0, 8);
  const rows = samples.map((sample) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(sample.label)}</span><strong>${sample.expectedScore}/70</strong></div>
      <p><strong>样本来源</strong>：${escapeHtml(sample.sourceKind || '校准样本')}</p>
      <p><strong>老师原评理由</strong>：${escapeHtml(sample.teacherReason)}</p>
      <p><strong>扣分点</strong>：${escapeHtml(sample.deductions)}</p>
    </div>
  `).join('');
  return `
    <div class="agent-result-block">
      <h4>同题多档校准参照</h4>
      <p class="agent-para-issues">同一道题看不同分档，重点不是照抄，而是看中心深度、论证机制、边界处理如何拉开分差。</p>
      <div class="score-grid">${rows || '<p>暂无同题校准样本，后续可通过人工复核继续补入。</p>'}</div>
    </div>
  `;
}

function buildObsidianReverseFeatureSummary(report) {
  const profile = report.officialScore?.obsidianBenchmark?.highScoreProfile || report.obsidianBenchmark?.highScoreProfile || {};
  const matched = report.officialScore?.obsidianBenchmark?.matched || report.obsidianBenchmark?.matched || [];
  const counts = profile.moveCounts || getHighScoreMoveCounts(report.draft || '');
  return {
    paragraphCount: profile.paragraphCount || splitParagraphs(report.draft || '').length,
    wordCount: profile.wordCount || countWords(report.draft || ''),
    definition: counts.definition || 0,
    transition: counts.transition || 0,
    mechanism: counts.mechanism || 0,
    boundary: counts.boundary || 0,
    reality: counts.reality || 0,
    matchedTitles: matched.slice(0, 3).map((x) => x.title || x.sourceFile || 'OB范文'),
    profileScore: Math.round(profile.score || 0),
    moveScore: Math.round(profile.moveScore || 0)
  };
}

function renderObsidianReverseFeaturePanel(report) {
  const item = buildObsidianReverseFeatureSummary(report);
  return `
    <div class="agent-result-block">
      <h4>OB高分范文反向特征</h4>
      <p class="agent-para-issues">不是“像OB就高分”，而是把OB高分文拆成可见动作，再看本文有没有这些动作。</p>
      <div class="score-calibration-kpi">
        <div class="flaw-row"><div class="flaw-row-top"><span>段落节奏</span><strong>${item.paragraphCount}段</strong></div><p>字数约${item.wordCount}，看是否像完整考场议论文。</p></div>
        <div class="flaw-row"><div class="flaw-row-top"><span>思辨动作</span><strong>${item.moveScore}/100</strong></div><p>界定${item.definition}｜转折${item.transition}｜机制${item.mechanism}</p></div>
        <div class="flaw-row"><div class="flaw-row-top"><span>边界与现实</span><strong>${item.profileScore}/100</strong></div><p>边界${item.boundary}｜现实关联${item.reality}</p></div>
      </div>
      <p><strong>可对照OB档案</strong>：${escapeHtml(item.matchedTitles.join('、') || '暂无相近档案')}</p>
    </div>
  `;
}

function loadManualScoreCalibrations() {
  try {
    const raw = localStorage.getItem(SCORING_CALIBRATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveManualScoreCalibrationEntry({ topic, draft, teacherScore, report }) {
  const list = loadManualScoreCalibrations();
  const systemScore = Number(report?.total70 || 0);
  const entry = {
    id: `manual-cal-${Date.now()}`,
    topic,
    topicType: detectTopicType(topic).name,
    systemScore,
    teacherScore: Number(teacherScore || 0),
    gap: Number(teacherScore || 0) - systemScore,
    systemBand: getShanghaiOfficialBand(systemScore),
    teacherBand: getShanghaiOfficialBand(teacherScore),
    anchorLabel: report?.officialScore?.calibrationDecision?.anchorLabel || '',
    wordCount: countWords(draft),
    createdAt: Date.now()
  };
  const next = [...list, entry].slice(-120);
  try { localStorage.setItem(SCORING_CALIBRATION_STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
  return entry;
}

function buildManualScoreCalibrationSummary() {
  const list = loadManualScoreCalibrations();
  const byType = {};
  list.forEach((item) => {
    const key = item.topicType || '未分类';
    byType[key] = byType[key] || { count: 0, bias: 0, strict: 0, loose: 0 };
    byType[key].count += 1;
    byType[key].bias += Number(item.gap || 0);
    if (Number(item.gap || 0) >= 4) byType[key].strict += 1;
    if (Number(item.gap || 0) <= -4) byType[key].loose += 1;
  });
  const rows = Object.entries(byType).map(([type, info]) => ({
    type,
    count: info.count,
    avgGap: Math.round((info.bias / Math.max(info.count, 1)) * 10) / 10,
    strict: info.strict,
    loose: info.loose
  })).sort((a, b) => b.count - a.count);
  const avgGap = list.length ? Math.round(list.reduce((sum, item) => sum + Number(item.gap || 0), 0) / list.length * 10) / 10 : 0;
  return { total: list.length, avgGap, rows, recent: list.slice(-5).reverse() };
}

function renderManualCalibrationReport(entry, summary, container) {
  const typeRows = (summary.rows || []).map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(row.type)}</span><strong>${row.count}次</strong></div>
      <p>平均偏差：${row.avgGap > 0 ? '+' : ''}${row.avgGap}分｜系统偏严${row.strict}次｜系统偏松${row.loose}次</p>
    </div>
  `).join('');
  const recentRows = (summary.recent || []).map((item) => `<li>${escapeHtml(item.topic.slice(0, 36))}｜系统${item.systemScore}，老师${item.teacherScore}，偏差${item.gap > 0 ? '+' : ''}${item.gap}</li>`).join('');
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>人工复核已记录</h3>
      <div class="agent-tags">
        <span class="agent-tag">系统：${entry.systemScore}/70</span>
        <span class="agent-tag">老师：${entry.teacherScore}/70</span>
        <span class="agent-tag">偏差：${entry.gap > 0 ? '+' : ''}${entry.gap}</span>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>这次记录说明什么</h4>
      <p>${entry.gap >= 4 ? '系统这次偏严，后续要重点观察同题型是否经常低估。' : (entry.gap <= -4 ? '系统这次偏松，后续要重点观察同题型是否经常高估。' : '系统与老师分数接近，可作为稳定样本。')}</p>
      <p><strong>题型</strong>：${escapeHtml(entry.topicType)}｜<strong>锚点</strong>：${escapeHtml(entry.anchorLabel || '暂无')}</p>
    </div>
    <div class="agent-result-block">
      <h4>累计偏差画像</h4>
      <p>累计${summary.total}次人工复核，平均偏差${summary.avgGap > 0 ? '+' : ''}${summary.avgGap}分。</p>
      <div class="score-grid">${typeRows || '<p>继续记录3-5篇后，题型偏差会更明显。</p>'}</div>
      <p><strong>最近记录</strong></p>
      <ul>${recentRows || '<li>暂无最近记录。</li>'}</ul>
    </div>
  `;
}

function getObsidianTeachingAssets() {
  try {
    if (typeof window !== 'undefined' && window.OBSIDIAN_TEACHING_ASSETS) return window.OBSIDIAN_TEACHING_ASSETS;
    if (typeof OBSIDIAN_TEACHING_ASSETS !== 'undefined' && OBSIDIAN_TEACHING_ASSETS) return OBSIDIAN_TEACHING_ASSETS;
  } catch (_) {
    return null;
  }
  return null;
}

function getObsidianTeachingEssays() {
  const assets = getObsidianTeachingAssets();
  return Array.isArray(assets?.essays) ? assets.essays : [];
}

function getObsidianTeachingEssayById(id) {
  if (!id) return null;
  return getObsidianTeachingEssays().find((essay) => essay.id === id) || null;
}

function populateObsidianTutorSelect(select) {
  if (!select) return;
  const essays = getObsidianTeachingEssays();
  if (!essays.length) {
    select.innerHTML = '<option value="">未加载 OB 教学资产</option>';
    return;
  }
  const sorted = [...essays].sort((a, b) => {
    const ah = a.scoreBand?.isHighScore ? 1 : 0;
    const bh = b.scoreBand?.isHighScore ? 1 : 0;
    if (ah !== bh) return bh - ah;
    return String(b.yearLabel || '').localeCompare(String(a.yearLabel || ''), 'zh-Hans-CN');
  });
  select.innerHTML = [
    '<option value="">选择一篇 OB 范文解剖</option>',
    ...sorted.slice(0, 180).map((essay) => {
      const meta = [essay.yearLabel, essay.topicType, essay.scoreBand?.label || (essay.scoreBand?.isHighScore ? '高分' : '')].filter(Boolean).join(' / ');
      return `<option value="${escapeHtml(essay.id)}">${escapeHtml(takeSentencePreview(essay.title || essay.topicKey || '未命名', 34))}${meta ? `｜${escapeHtml(meta)}` : ''}</option>`;
    })
  ].join('');
}

function renderObsidianTutorMessage(panel, message) {
  if (!panel) return;
  panel.innerHTML = `<p class="agent-empty">${escapeHtml(message)}</p>`;
}

function renderObsidianTutorIntro(panel) {
  if (!panel) return;
  const assets = getObsidianTeachingAssets();
  if (!assets?.essays?.length) {
    renderObsidianTutorMessage(panel, '暂未加载 OB 教学资产；请先运行 node scripts/build-obsidian-teaching-assets.js。');
    return;
  }
  panel.innerHTML = `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>OB 范文助教已就绪</span><strong>${assets.total || assets.essays.length}篇</strong></div>
      <p>已提炼高分标杆 ${assets.highScoreCount || 0} 篇，并按“概念界定、转折推进、机制解释、边界收束、现实关联”建立动作库。</p>
      <p class="agent-para-issues">建议用法：先输入题目点“推荐3篇”，再解剖其中一篇，看第几段、学什么动作。</p>
    </div>
  `;
}

function getObsidianKnowledgeEntries() {
  const index = getEmbeddedObsidianEntryIndex();
  if (Array.isArray(index) && index.length) return index;
  return getObsidianTeachingEssays().map((essay) => ({
    id: essay.id,
    title: essay.title,
    folder: essay.folder || '',
    notePath: essay.notePath || essay.relativePath || '',
    relativePath: essay.relativePath || essay.notePath || '',
    wikiPath: essay.wikiPath || '',
    yearLabel: essay.yearLabel || '',
    docRole: essay.docRole || '',
    topicType: essay.topicType || '',
    themeTag: essay.themeTag || '',
    trainingUses: essay.trainingUses || [],
    scoreBand: essay.scoreBand || null,
    anchorTerms: essay.anchorTerms || [],
    promptSamples: essay.promptSamples || [],
    preview: essay.preview || essay.thesis || essay.topicKey || ''
  }));
}

function getObsidianKnowledgeEntryById(id) {
  return getObsidianKnowledgeEntries().find((entry) => entry.id === id) || null;
}

function getObsidianEntryFolder(entry) {
  const folder = String(entry?.folder || '').replace(/\\/g, '/').trim();
  return folder && folder !== '.' ? folder : '根目录';
}

function buildObsidianKnowledgeSearchText(entry) {
  return normalizeObsidianMatchText([
    entry?.title,
    entry?.folder,
    entry?.notePath,
    entry?.relativePath,
    entry?.yearLabel,
    entry?.docRole,
    entry?.topicType,
    entry?.themeTag,
    entry?.scoreBand?.label,
    entry?.scoreBand?.score,
    entry?.topicKey,
    entry?.preview,
    ...(entry?.anchorTerms || []),
    ...(entry?.promptSamples || []),
    ...(entry?.trainingUses || [])
  ].filter(Boolean).join(' '));
}

function getObsidianEntryTheme(entry) {
  return String(entry?.themeTag || inferObsidianThemeTag(`${entry?.topicKey || ''} ${entry?.title || ''}`, entry?.preview || '') || '未标注母题').trim() || '未标注母题';
}

function getObsidianEntryScoreTier(entry) {
  const label = String(entry?.scoreBand?.label || '').trim();
  const score = Number(entry?.scoreBand?.score);
  if (entry?.scoreBand?.isHighScore || /高分|一类上|一类/.test(label) || score >= 63) return '一类/高分标杆';
  if (/二类/.test(label) || (score >= 52 && score <= 62)) return '二类样本';
  if (/三类/.test(label) || (score >= 39 && score <= 51)) return '三类样本';
  if (/四类/.test(label) || (score >= 21 && score <= 38)) return '四类样本';
  if (score > 0 && score < 21) return '五类/低分样本';
  return '未标分';
}

function getObsidianEntryPurposeList(entry) {
  const role = String(entry?.docRole || '');
  const uses = Array.isArray(entry?.trainingUses) ? entry.trainingUses.filter(Boolean) : [];
  const inferred = [];
  if (/题|命题|评析|解读|回顾/.test(role)) inferred.push('分析题目');
  if (/评分|标准|样卷|评述/.test(role)) inferred.push('草稿评分');
  if (/方法|议论文|写作/.test(role)) inferred.push('方法训练');
  if (/范文|佳作|高分|下水/.test(role) || entry?.scoreBand?.isHighScore) inferred.push('范文生成');
  if (/批改|问题|任务/.test(role)) inferred.push('习作精批');
  return dedupeArray([...uses, ...inferred]).filter(Boolean);
}

function getObsidianEntryTopicType(entry) {
  return normalizeObsidianTopicTypeName(entry?.topicType || detectTopicType(`${entry?.topicKey || ''} ${entry?.title || ''}`).name);
}

function getObsidianKnowledgeFilters() {
  const entries = getObsidianKnowledgeEntries();
  const folders = dedupeArray(entries.map(getObsidianEntryFolder)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const types = dedupeArray(entries.map(getObsidianEntryTopicType)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const themes = dedupeArray(entries.map(getObsidianEntryTheme)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const scoreOrder = ['一类/高分标杆', '二类样本', '三类样本', '四类样本', '五类/低分样本', '未标分'];
  const scores = dedupeArray(entries.map(getObsidianEntryScoreTier))
    .sort((a, b) => {
      const ai = scoreOrder.includes(a) ? scoreOrder.indexOf(a) : scoreOrder.length;
      const bi = scoreOrder.includes(b) ? scoreOrder.indexOf(b) : scoreOrder.length;
      return ai - bi || a.localeCompare(b, 'zh-Hans-CN');
    });
  const purposes = dedupeArray(entries.flatMap(getObsidianEntryPurposeList)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  return { folders, types, themes, scores, purposes };
}

function renderObsidianOptionList(prefix, items) {
  return [
    `<option value="all">${prefix}：全部</option>`,
    ...items.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
  ].join('');
}

function populateObsidianKnowledgeFilters(folderSelect, typeSelect, themeSelect, scoreSelect, purposeSelect) {
  const { folders, types, themes, scores, purposes } = getObsidianKnowledgeFilters();
  if (folderSelect) {
    folderSelect.innerHTML = renderObsidianOptionList('目录', folders);
  }
  if (typeSelect) {
    typeSelect.innerHTML = renderObsidianOptionList('题型', types);
  }
  if (themeSelect) themeSelect.innerHTML = renderObsidianOptionList('母题', themes);
  if (scoreSelect) scoreSelect.innerHTML = renderObsidianOptionList('分数档', scores);
  if (purposeSelect) purposeSelect.innerHTML = renderObsidianOptionList('用途', purposes);
}

function filterObsidianKnowledgeEntries({ query = '', folder = 'all', type = 'all', theme = 'all', score = 'all', purpose = 'all' } = {}) {
  const q = normalizeObsidianMatchText(query);
  return getObsidianKnowledgeEntries().filter((entry) => {
    if (folder && folder !== 'all' && getObsidianEntryFolder(entry) !== folder) return false;
    if (type && type !== 'all' && getObsidianEntryTopicType(entry) !== type) return false;
    if (theme && theme !== 'all' && getObsidianEntryTheme(entry) !== theme) return false;
    if (score && score !== 'all' && getObsidianEntryScoreTier(entry) !== score) return false;
    if (purpose && purpose !== 'all' && !getObsidianEntryPurposeList(entry).includes(purpose)) return false;
    if (!q) return true;
    return buildObsidianKnowledgeSearchText(entry).includes(q);
  });
}

function renderObsidianKnowledgeEntryCard(entry) {
  const folder = getObsidianEntryFolder(entry);
  const purposes = getObsidianEntryPurposeList(entry);
  const scoreTier = getObsidianEntryScoreTier(entry);
  const tags = [entry.yearLabel, getObsidianEntryTopicType(entry), getObsidianEntryTheme(entry), scoreTier, purposes[0], entry.docRole]
    .filter(Boolean)
    .slice(0, 6)
    .map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`)
    .join('');
  return `
    <div class="ob-kb-item">
      <div class="ob-kb-item-main">
        <strong>${escapeHtml(entry.title || entry.topicKey || '未命名档案')}</strong>
        <span>${escapeHtml(folder)}｜${escapeHtml(entry.notePath || entry.relativePath || '')}</span>
        <div class="agent-tags">${tags || '<span class="agent-tag">未分类</span>'}</div>
        <p>${escapeHtml(summarizeSentence(entry.preview || (entry.promptSamples || [])[0] || '', 86))}</p>
        <p>用途：${escapeHtml(purposes.join('、') || '待归类')}｜分数档：${escapeHtml(scoreTier)}</p>
      </div>
      <div class="ob-kb-item-actions">
        <button class="agent-btn ghost" type="button" data-ob-kb-id="${escapeHtml(entry.id)}">查看</button>
        <button class="agent-btn ghost" type="button" data-ob-kb-read-id="${escapeHtml(entry.id)}">读原文</button>
      </div>
    </div>
  `;
}

function groupObsidianKnowledgeByFolder(entries) {
  return entries.reduce((groups, entry) => {
    const folder = getObsidianEntryFolder(entry);
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(entry);
    return groups;
  }, {});
}

function renderObsidianKnowledgeDirectory(panel, state = {}) {
  if (!panel) return;
  const entries = filterObsidianKnowledgeEntries(state);
  const grouped = groupObsidianKnowledgeByFolder(entries);
  const folders = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const total = getObsidianKnowledgeEntries().length;
  const queryHint = state.query ? `｜关键词：${state.query}` : '';
  const folderHint = state.folder && state.folder !== 'all' ? `｜目录：${state.folder}` : '';
  const typeHint = state.type && state.type !== 'all' ? `｜题型：${state.type}` : '';
  const themeHint = state.theme && state.theme !== 'all' ? `｜母题：${state.theme}` : '';
  const scoreHint = state.score && state.score !== 'all' ? `｜分数档：${state.score}` : '';
  const purposeHint = state.purpose && state.purpose !== 'all' ? `｜用途：${state.purpose}` : '';
  const folderHtml = folders.map((folder, index) => {
    const list = grouped[folder].slice(0, 40).map(renderObsidianKnowledgeEntryCard).join('');
    const extra = grouped[folder].length > 40 ? `<p class="agent-empty">该目录还有 ${grouped[folder].length - 40} 篇未展开，可继续用关键词缩小范围。</p>` : '';
    return `
      <details class="ob-kb-folder" ${index < 2 ? 'open' : ''}>
        <summary><strong>${escapeHtml(folder)}</strong><span>${grouped[folder].length}篇</span></summary>
        <div class="ob-kb-list">${list}${extra}</div>
      </details>
    `;
  }).join('');
  panel.innerHTML = `
    <div class="ob-kb-summary">
      <strong>OB知识库检索系统</strong>
      <span>已收录 ${total} 篇，本次显示 ${entries.length} 篇${escapeHtml(queryHint + folderHint + typeHint + themeHint + scoreHint + purposeHint)}</span>
    </div>
    ${folderHtml || '<p class="agent-empty">没有匹配结果。可以换关键词，如“认可度”“断舍离”“专转传”“一类”。</p>'}
  `;
}

function buildObsidianKnowledgeLearningActions(entry) {
  const role = String(`${entry?.docRole || ''}${entry?.topicType || ''}${entry?.themeTag || ''}`);
  const actions = [];
  if (/评分|标准/.test(role)) actions.push('把它当评分尺：看哪些维度会影响分档，不要当范文抄。');
  if (/方法|议论文|写作/.test(role)) actions.push('把它当方法卡：提炼“概念辨析-分类讨论-现实关联”的动作。');
  if (/高分|佳作|下水|同题/.test(role) || entry?.scoreBand?.isHighScore) actions.push('把它当对照文：先看开头如何立中心，再看中段如何补机制。');
  if (/真题|命题|评析|回顾/.test(role)) actions.push('把它当审题资料：看出题人真正想考的关系和边界。');
  if (!actions.length) actions.push('先看标题、题型、母题和摘要，判断它适合用来审题、成文还是批改。');
  actions.push('回到自己的作文时，只迁移一个动作：段首回题眼、例后补机制、结尾补边界三选一。');
  return dedupeArray(actions).slice(0, 4);
}

function renderObsidianKnowledgeEntry(entry, panel, fullText = '') {
  if (!entry || !panel) return;
  const teachingEssay = getObsidianTeachingEssayById(entry.id);
  const actions = buildObsidianKnowledgeLearningActions(entry).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const promptRows = (entry.promptSamples || []).slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const purposeLine = getObsidianEntryPurposeList(entry).join('、') || '待归类';
  const scoreTier = getObsidianEntryScoreTier(entry);
  const fullTextBlock = fullText
    ? `<div class="ob-kb-fulltext">${renderObsidianMarkdownPreview(fullText, 4200)}</div>`
    : `<p class="agent-empty">点击“读原文”可加载 Markdown 正文预览；若本地 file 打开受限，请用 http://127.0.0.1:5500 访问。</p>`;
  panel.innerHTML = `
    <div class="agent-result-block ob-kb-detail">
      <h4>${escapeHtml(entry.title || 'OB档案')}</h4>
      <p><strong>目录</strong>：${escapeHtml(getObsidianEntryFolder(entry))}</p>
      <p><strong>路径</strong>：${escapeHtml(entry.notePath || entry.relativePath || '')}</p>
      <p><strong>标签</strong>：${escapeHtml([entry.yearLabel, entry.docRole, getObsidianEntryTopicType(entry), getObsidianEntryTheme(entry), scoreTier].filter(Boolean).join('｜') || '未标注')}</p>
      <p><strong>写作用途</strong>：${escapeHtml(purposeLine)}</p>
      <p><strong>摘要</strong>：${escapeHtml(entry.preview || '暂无摘要')}</p>
      <p><strong>题目/摘录</strong></p>
      <ul>${promptRows || '<li>暂无题目摘录。</li>'}</ul>
      <p><strong>怎么用</strong></p>
      <ul>${actions}</ul>
      <div class="agent-actions quiet-actions">
        ${teachingEssay ? `<button class="agent-btn primary" type="button" data-ob-dissect-id="${escapeHtml(entry.id)}">解剖这篇</button><button class="agent-btn ghost" type="button" data-ob-task-id="${escapeHtml(entry.id)}">生成对照任务卡</button>` : ''}
        <button class="agent-btn ghost" type="button" data-ob-kb-read-id="${escapeHtml(entry.id)}">读原文</button>
        <button class="agent-btn ghost" type="button" data-ob-kb-back="1">返回目录</button>
      </div>
    </div>
    ${fullTextBlock}
  `;
}

function renderObsidianMarkdownPreview(markdown, limit = 4200) {
  const source = String(markdown || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const clipped = source.length > limit ? `${source.slice(0, limit)}\n\n……（已截取前${limit}字，完整内容请在 Obsidian 中查看）` : source;
  return clipped.split(/\r?\n/).map((line) => {
    const clean = escapeHtml(line.trim());
    if (!clean) return '<br />';
    if (/^#{1,3}\s+/.test(line)) return `<h5>${clean.replace(/^#{1,3}\s+/, '')}</h5>`;
    if (/^[-*]\s+/.test(line)) return `<p>• ${clean.replace(/^[-*]\s+/, '')}</p>`;
    return `<p>${clean}</p>`;
  }).join('');
}

async function loadObsidianMarkdown(entry) {
  if (!entry?.relativePath && !entry?.notePath) return '';
  const path = String(entry.relativePath || entry.notePath).replace(/\\/g, '/');
  const url = `obsidian_vault/${path.split('/').map((part) => encodeURIComponent(part)).join('/')}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function setSelectValueIfExists(select, value) {
  if (!select || !value) return false;
  const option = [...select.options].find((item) => item.value === value);
  if (!option) return false;
  select.value = value;
  return true;
}

function buildObsidianTopicFilterPreset(topic) {
  const rawTopic = String(topic || '').trim();
  if (!rawTopic) return null;
  const analysis = analyzeEssayTopic(rawTopic);
  const terms = extractObsidianMatchTerms(rawTopic, '', analysis)
    .filter((term) => term && !/请写|文章|谈谈|认识|思考|要求|自拟|不少于/.test(term))
    .slice(0, 4);
  return {
    query: terms.join(' ') || rawTopic.slice(0, 18),
    type: normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(rawTopic).name),
    theme: inferObsidianThemeTag(rawTopic, ''),
    score: '一类/高分标杆',
    purpose: '同题对照'
  };
}

function applyObsidianTopicPresetToControls(preset, controls) {
  if (!preset || !controls) return null;
  const { searchInput, folderSelect, typeSelect, themeSelect, scoreSelect, purposeSelect } = controls;
  if (searchInput) searchInput.value = preset.query || '';
  if (folderSelect) folderSelect.value = 'all';
  const applied = {
    query: preset.query || '',
    folder: 'all',
    type: setSelectValueIfExists(typeSelect, preset.type) ? preset.type : 'all',
    theme: setSelectValueIfExists(themeSelect, preset.theme) ? preset.theme : 'all',
    score: setSelectValueIfExists(scoreSelect, preset.score) ? preset.score : 'all',
    purpose: setSelectValueIfExists(purposeSelect, preset.purpose) ? preset.purpose : 'all'
  };
  return applied;
}

function initObsidianKnowledgeBrowser({ searchInput, folderSelect, typeSelect, themeSelect, scoreSelect, purposeSelect, topicFilterBtn, searchBtn, resetBtn, panel, tutorPanel, essaySelect, topicInput }) {
  if (!panel) return;
  populateObsidianKnowledgeFilters(folderSelect, typeSelect, themeSelect, scoreSelect, purposeSelect);
  const getState = () => ({
    query: searchInput?.value?.trim() || '',
    folder: folderSelect?.value || 'all',
    type: typeSelect?.value || 'all',
    theme: themeSelect?.value || 'all',
    score: scoreSelect?.value || 'all',
    purpose: purposeSelect?.value || 'all'
  });
  const renderCurrent = () => renderObsidianKnowledgeDirectory(panel, getState());
  renderCurrent();
  searchBtn?.addEventListener('click', renderCurrent);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') renderCurrent();
  });
  topicFilterBtn?.addEventListener('click', () => {
    const topic = topicInput?.value?.trim() || '';
    if (!topic) {
      renderObsidianTutorMessage(tutorPanel, '请先在上方输入作文题目，再按题目筛选 OB 范文库。');
      return;
    }
    const preset = buildObsidianTopicFilterPreset(topic);
    const applied = applyObsidianTopicPresetToControls(preset, { searchInput, folderSelect, typeSelect, themeSelect, scoreSelect, purposeSelect });
    renderObsidianKnowledgeDirectory(panel, applied || getState());
    renderObsidianTopicRecommendations(topic, tutorPanel);
  });
  folderSelect?.addEventListener('change', renderCurrent);
  typeSelect?.addEventListener('change', renderCurrent);
  themeSelect?.addEventListener('change', renderCurrent);
  scoreSelect?.addEventListener('change', renderCurrent);
  purposeSelect?.addEventListener('change', renderCurrent);
  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (folderSelect) folderSelect.value = 'all';
    if (typeSelect) typeSelect.value = 'all';
    if (themeSelect) themeSelect.value = 'all';
    if (scoreSelect) scoreSelect.value = 'all';
    if (purposeSelect) purposeSelect.value = 'all';
    renderCurrent();
  });
  panel.addEventListener('click', async (event) => {
    const backBtn = event.target.closest('[data-ob-kb-back]');
    if (backBtn) return void renderCurrent();
    const viewBtn = event.target.closest('[data-ob-kb-id]');
    const readBtn = event.target.closest('[data-ob-kb-read-id]');
    const dissectBtn = event.target.closest('[data-ob-dissect-id]');
    const taskBtn = event.target.closest('[data-ob-task-id]');
    if (dissectBtn || taskBtn) {
      const essay = getObsidianTeachingEssayById(dissectBtn?.dataset.obDissectId || taskBtn?.dataset.obTaskId);
      if (!essay) return;
      if (dissectBtn) {
        if (essaySelect) essaySelect.value = essay.id;
        renderObsidianEssayDissection(essay, tutorPanel, topicInput?.value?.trim() || '');
      }
      if (taskBtn) renderObsidianComparisonTaskCard(essay, topicInput?.value?.trim() || '', tutorPanel);
      return;
    }
    const targetId = viewBtn?.dataset.obKbId || readBtn?.dataset.obKbReadId;
    if (!targetId) return;
    const entry = getObsidianKnowledgeEntryById(targetId);
    if (!entry) return;
    if (viewBtn) return void renderObsidianKnowledgeEntry(entry, panel);
    panel.innerHTML = '<p class="agent-empty">正在读取 Obsidian 原文...</p>';
    try {
      const markdown = await loadObsidianMarkdown(entry);
      renderObsidianKnowledgeEntry(entry, panel, markdown);
    } catch (error) {
      renderObsidianKnowledgeEntry(entry, panel, '');
      panel.insertAdjacentHTML('afterbegin', `<p class="agent-empty">原文读取失败：${escapeHtml(error?.message || '未知错误')}。请确认用本地服务器打开页面，而不是直接 file:// 打开。</p>`);
    }
  });
}

function buildTeachingEssayMetaLine(essay) {
  return [essay.yearLabel, essay.docRole, getObsidianEntryTopicType(essay), getObsidianEntryTheme(essay), essay.scoreBand?.score ? `${essay.scoreBand.score}分` : essay.scoreBand?.label]
    .filter(Boolean)
    .join('｜') || 'OB范文档案';
}

function scoreTeachingEssayForTopic(essay, topic, analysis) {
  const matched = scoreObsidianEntryForEssay(essay, topic, '', analysis);
  let score = Number(matched.score || 0);
  const topicTypeName = normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(topic).name);
  if (getObsidianEntryTopicType(essay) === topicTypeName) score += 12;
  const theme = inferObsidianThemeTag(topic, '');
  if (theme && essay.themeTag === theme) score += 8;
  if (essay.scoreBand?.isHighScore) score += 8;
  const topicTerms = extractObsidianMatchTerms(topic, '', analysis);
  const promptHaystack = normalizeObsidianMatchText(`${essay.prompt || ''}${essay.title || ''}${essay.topicKey || ''}`);
  const promptTermHits = topicTerms.filter((kw) => {
    const needle = normalizeObsidianMatchText(kw);
    return needle.length >= 2 && promptHaystack.includes(needle);
  });
  const termHits = (essay.anchorTerms || []).filter((term) => topicTerms.some((kw) => normalizeObsidianMatchText(term).includes(normalizeObsidianMatchText(kw)) || normalizeObsidianMatchText(kw).includes(normalizeObsidianMatchText(term))));
  score += Math.min(54, promptTermHits.length * 18);
  score += Math.min(18, termHits.length * 4);
  return {
    ...essay,
    sortScore: score,
    matchScore: clamp(score, 0, 100),
    matchReasons: dedupeArray([...(matched.reasons || []), promptTermHits.length ? `题目同频：${promptTermHits.slice(0, 3).join('、')}` : '', termHits.length ? `题眼相近：${termHits.slice(0, 3).join('、')}` : '', essay.scoreBand?.isHighScore ? '高分标杆' : '']).filter(Boolean).slice(0, 4)
  };
}

function recommendObsidianTeachingEssays(topic, limit = 3) {
  const essays = getObsidianTeachingEssays();
  if (!essays.length) return [];
  const analysis = analyzeEssayTopic(topic);
  return essays
    .map((essay) => scoreTeachingEssayForTopic(essay, topic, analysis))
    .filter((essay) => essay.matchScore > 0)
    .sort((a, b) => Number(b.sortScore || b.matchScore || 0) - Number(a.sortScore || a.matchScore || 0))
    .slice(0, limit);
}

function pickBestParagraphToStudy(essay, topic) {
  const topicTerms = extractTopicPhrases(topic);
  const rows = essay.paragraphDissection || [];
  if (!rows.length) return null;
  const scored = rows.map((row) => {
    const text = `${row.lead || ''}${row.evidence || ''}${(row.moveLabels || []).join('')}`;
    const termHit = topicTerms.filter((term) => term && text.includes(term)).length;
    const actionHit = (row.moveKeys || []).length;
    const roleBonus = /主体|边界|递进/.test(row.role || '') ? 8 : 4;
    return { ...row, studyScore: termHit * 10 + actionHit * 8 + roleBonus };
  });
  return scored.sort((a, b) => b.studyScore - a.studyScore)[0] || rows[0];
}

function buildObsidianRecommendationBreakdown(essay, topic, analysis = null) {
  const topicAnalysis = analysis || analyzeEssayTopic(topic);
  const topicType = normalizeObsidianTopicTypeName(topicAnalysis?.topicType?.name || detectTopicType(topic).name);
  const essayType = getObsidianEntryTopicType(essay);
  const topicTheme = inferObsidianThemeTag(topic, '');
  const essayTheme = getObsidianEntryTheme(essay);
  const terms = extractObsidianMatchTerms(topic, '', topicAnalysis);
  const haystack = normalizeObsidianMatchText([
    essay?.title,
    essay?.prompt,
    essay?.topicKey,
    essay?.thesis,
    essay?.preview,
    ...(essay?.anchorTerms || []),
    ...(essay?.promptSamples || [])
  ].filter(Boolean).join(' '));
  const termHits = terms.filter((term) => {
    const needle = normalizeObsidianMatchText(term);
    return needle.length >= 2 && haystack.includes(needle);
  });
  return [
    {
      label: '题型',
      value: essayType === topicType ? '命中' : '接近',
      ok: essayType === topicType,
      detail: `${essayType || '未分类'} 对照 ${topicType || '未分类'}`
    },
    {
      label: '母题',
      value: topicTheme && essayTheme === topicTheme ? '命中' : '参考',
      ok: !!topicTheme && essayTheme === topicTheme,
      detail: essayTheme || '未标注母题'
    },
    {
      label: '题眼',
      value: `${termHits.length}个`,
      ok: termHits.length >= 2,
      detail: termHits.slice(0, 4).join('、') || '题眼词较少'
    },
    {
      label: '档位',
      value: getObsidianEntryScoreTier(essay),
      ok: getObsidianEntryScoreTier(essay) === '一类/高分标杆',
      detail: essay?.scoreBand?.score ? `${essay.scoreBand.score}分` : (essay?.scoreBand?.label || '未标具体分')
    }
  ];
}

function renderObsidianMatchBreakdown(items) {
  return `
    <div class="ob-match-breakdown">
      ${(items || []).map((item) => `
        <span class="${item.ok ? 'hit' : ''}">
          <strong>${escapeHtml(item.label)} ${escapeHtml(item.value)}</strong>
          <em>${escapeHtml(item.detail)}</em>
        </span>
      `).join('')}
    </div>
  `;
}

function pickObsidianStudyRow(essay, predicate, fallbackIndex = 0, used = new Set()) {
  const rows = essay?.paragraphDissection || [];
  const hit = rows.find((row) => !used.has(row.index) && predicate(row))
    || rows.find((row, index) => !used.has(row.index) && index >= fallbackIndex)
    || rows.find((row) => !used.has(row.index))
    || rows[fallbackIndex]
    || rows[0]
    || null;
  if (hit) used.add(hit.index);
  return hit;
}

function buildObsidianThreeStepStudyRoute(essay, topic = '') {
  const used = new Set();
  const rows = essay?.paragraphDissection || [];
  if (!rows.length) return [];
  const first = pickObsidianStudyRow(
    essay,
    (row) => (row.moveKeys || []).includes('definition') || /开篇|起|界定|概念/.test(`${row.role || ''}${row.learnPoint || ''}`),
    0,
    used
  );
  const second = pickObsidianStudyRow(
    essay,
    (row) => (row.moveKeys || []).includes('mechanism') || (row.moveKeys || []).includes('transition') || /机制|例证|证明|转折/.test(`${row.role || ''}${row.learnPoint || ''}${row.evidence || ''}`),
    Math.min(2, rows.length - 1),
    used
  );
  const third = pickObsidianStudyRow(
    essay,
    (row) => (row.moveKeys || []).includes('boundary') || (row.moveKeys || []).includes('reality') || /边界|现实|收束|结尾|当下/.test(`${row.role || ''}${row.learnPoint || ''}${row.evidence || ''}`),
    Math.max(rows.length - 2, 0),
    used
  );
  return [
    { label: '先看', row: first, focus: '开头如何把题目转成中心判断' },
    { label: '再看', row: second, focus: '主体段如何把例子变成论证' },
    { label: '最后看', row: third, focus: '结尾或转折处如何补边界与现实' }
  ].filter((item) => item.row).map((item) => ({
    ...item,
    action: describeObsidianMoveAction(item.row, essay, topic)
  }));
}

function renderObsidianThreeStepRoute(route) {
  return `
    <div class="ob-study-route">
      ${(route || []).map((item) => `
        <div>
          <strong>${escapeHtml(item.label)}：第${item.row?.index || '?'}段</strong>
          <span>${escapeHtml(item.focus)}</span>
          <em>${escapeHtml(item.action)}</em>
        </div>
      `).join('')}
    </div>
  `;
}

function describeObsidianMoveAction(row, essay, topic = '') {
  const keys = row?.moveKeys || [];
  const labels = row?.moveLabels || [];
  const role = row?.role || '段落功能';
  const topicHint = extractTopicPhrases(topic).slice(0, 2).join('、') || essay?.topicKey || essay?.title || '当前题目';
  if (keys.includes('definition')) return `学它如何在第${row?.index || 1}段界定概念，并把“${topicHint}”限定到可论证范围。`;
  if (keys.includes('mechanism')) return `学它如何在例证后补“原因-机制-结果”，说明材料为什么能证明中心论点。`;
  if (keys.includes('transition')) return `学它如何用转折承认另一面，再把文章从单向表态推向辩证判断。`;
  if (keys.includes('boundary')) return `学它如何收住绝对化结论，写清观点成立的条件和失效边界。`;
  if (keys.includes('reality')) return `学它如何把抽象判断落到当代生活、校园经验或社会场景。`;
  if (/开篇|起/.test(role)) return `学它如何开头不绕圈，直接把题目问题转成中心判断。`;
  if (/收束|结尾/.test(role)) return `学它如何结尾回到题目，不喊口号，而是留下条件化判断。`;
  return labels.length
    ? `学它的${labels.slice(0, 2).join('、')}动作，回到自己的作文只迁移这一种段落功能。`
    : `学它如何承担“${role}”，不要照抄句子，只学推进方式。`;
}

function renderObsidianTopicRecommendations(topic, panel) {
  if (!panel) return;
  const picks = recommendObsidianTeachingEssays(topic, 3);
  if (!picks.length) return void renderObsidianTutorMessage(panel, '暂未匹配到合适的 OB 范文，请换一个更完整的题目再试。');
  const analysis = analyzeEssayTopic(topic);
  const cards = picks.map((essay, index) => {
    const row = pickBestParagraphToStudy(essay, topic);
    const action = describeObsidianMoveAction(row, essay, topic);
    const moveLabels = (row?.moveLabels || []).slice(0, 3).join('、') || row?.role || '段落推进';
    const breakdown = buildObsidianRecommendationBreakdown(essay, topic, analysis);
    const studyRoute = buildObsidianThreeStepStudyRoute(essay, topic);
    return `
      <div class="flaw-row">
        <div class="flaw-row-top">
          <span>${index + 1}. ${escapeHtml(essay.title)}</span>
          <strong>匹配 ${Math.round(essay.matchScore || 0)}</strong>
        </div>
        <p><strong>档案信息</strong>：${escapeHtml(buildTeachingEssayMetaLine(essay))}</p>
        <p><strong>为什么推荐</strong>：${escapeHtml((essay.matchReasons || []).join('；') || '题型和母题接近。')}</p>
        ${renderObsidianMatchBreakdown(breakdown)}
        <p><strong>看第几段</strong>：第${row?.index || 1}段｜${escapeHtml(row?.role || '段落功能')}｜${escapeHtml(moveLabels)}</p>
        <p><strong>学什么动作</strong>：${escapeHtml(action)}</p>
        <p><strong>原段提醒</strong>：${escapeHtml(row?.learnPoint || '看它如何完成段落功能。')}</p>
        <p><strong>证据句</strong>：${escapeHtml(row?.evidence || essay.thesis || '')}</p>
        ${renderObsidianThreeStepRoute(studyRoute)}
        <button class="agent-btn ghost" type="button" data-ob-dissect-id="${escapeHtml(essay.id)}">解剖这篇</button>
        <button class="agent-btn ghost" type="button" data-ob-task-id="${escapeHtml(essay.id)}">生成对照任务卡</button>
      </div>
    `;
  }).join('');
  panel.innerHTML = `
    <div class="agent-result-block">
      <h4>同题高分对照：推荐 3 篇</h4>
      <p class="agent-para-issues">只看“段落动作”，不照搬语句。看完后回到自己的作文补一个动作。</p>
      <div class="score-grid">${cards}</div>
    </div>
  `;
}

function renderObsidianParagraphPath(essay) {
  const rows = Array.isArray(essay?.paragraphDissection) ? essay.paragraphDissection : [];
  if (!rows.length) return '<p class="agent-empty">暂未拆出段落路径。</p>';
  const visibleRows = rows.slice(0, 9);
  return `
    <div class="score-grid">
      ${visibleRows.map((row) => {
        const labels = (row.moveLabels || []).slice(0, 2).join('、') || '段落推进';
        const action = describeObsidianMoveAction(row, essay, essay?.prompt || essay?.topicKey || '');
        return `
          <div class="flaw-row">
            <div class="flaw-row-top">
              <span>第${row.index}段</span>
              <strong>${escapeHtml(row.role || '段落功能')}</strong>
            </div>
            <p><strong>承担动作</strong>：${escapeHtml(labels)}</p>
            <p><strong>孩子要看</strong>：${escapeHtml(row.learnPoint || '看这一段如何推进中心论点。')}</p>
            <p><strong>迁移动作</strong>：${escapeHtml(action)}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function buildObsidianMoveTransferTip(typeKey) {
  const tips = {
    definition: '迁移到开头或首个主体段：先界定题眼，再限定讨论范围，避免一上来空喊态度。',
    transition: '迁移到主体段中段：先承认一面合理性，再指出边界或另一面，让文章出现思辨转折。',
    mechanism: '迁移到每个例证之后：补一句“为什么这个例子能证明观点”，把素材变成论证。',
    boundary: '迁移到结尾或倒数第二段：把绝对结论改成条件结论，说明“何时成立、何处失效”。',
    reality: '迁移到主体段后半部分：把抽象判断落到校园、技术平台、社会生活等具体场景。'
  };
  return tips[typeKey] || '迁移时只学段落功能，不照搬原句；先判断它在原文中承担什么作用，再改写到自己的题目里。';
}

function buildObsidianComparisonTask(essay, topic = '') {
  const rows = Array.isArray(essay?.paragraphDissection) ? essay.paragraphDissection : [];
  const topicLabel = topic || essay?.prompt || essay?.topicKey || '当前题目';
  const usedRows = new Set();
  const pickRow = (predicate, fallbackIndex = 0) => {
    const row = rows.find((item) => !usedRows.has(item.index) && predicate(item))
      || rows.find((item, index) => !usedRows.has(item.index) && index >= fallbackIndex)
      || rows.find((item) => !usedRows.has(item.index))
      || rows[fallbackIndex]
      || rows[0]
      || null;
    if (row) usedRows.add(row.index);
    return row;
  };
  const opening = pickRow((row) => /开篇|起/.test(row.role || '') || (row.moveKeys || []).includes('definition'), 0);
  const mechanism = pickRow((row) => (row.moveKeys || []).includes('mechanism') || /机制|分析|证明/.test(row.learnPoint || ''), 1);
  const transition = pickRow((row) => (row.moveKeys || []).includes('transition') || /转折|然而|诚然|边界/.test(`${row.lead || ''}${row.evidence || ''}${row.learnPoint || ''}`), 2);
  const reality = pickRow((row) => (row.moveKeys || []).includes('reality') || /现实|时代|当下|社会|生活/.test(`${row.lead || ''}${row.evidence || ''}${row.learnPoint || ''}`), Math.max(rows.length - 2, 0));
  const boundary = pickRow((row) => (row.moveKeys || []).includes('boundary') || /边界|并非|不是|不能|条件/.test(`${row.lead || ''}${row.evidence || ''}${row.learnPoint || ''}`), Math.max(rows.length - 1, 0));
  const tasks = [
    {
      label: '看开头定向',
      row: opening,
      action: `用这篇第${opening?.index || 1}段对照自己的开头：是否说清“${topicLabel}”的核心概念、关系和判断边界。`
    },
    {
      label: '看例后机制',
      row: mechanism,
      action: `看第${mechanism?.index || 2}段例证后有没有解释“为什么成立”。回到自己的作文，在一个例子后补一句机制分析。`
    },
    {
      label: '看思辨转折',
      row: transition,
      action: `看第${transition?.index || 3}段如何从单向判断转入另一面。回到自己的作文，加一个“诚然/然而”式转折。`
    },
    {
      label: '看现实落点',
      row: reality,
      action: `看第${reality?.index || rows.length || 4}段如何连接当下生活。回到自己的作文，补一个校园、技术或社会场景。`
    },
    {
      label: '看边界收束',
      row: boundary,
      action: `看第${boundary?.index || rows.length || 5}段如何避免绝对化。回到自己的结尾，把“一定/必须/只有”改成条件判断。`
    }
  ].filter((item) => item.row);
  return { essay, topic: topicLabel, tasks };
}

function renderObsidianComparisonTaskCard(essay, topic, panel) {
  if (!panel) return;
  if (!essay) return void renderObsidianTutorMessage(panel, '请先选择一篇 OB 范文。');
  const card = buildObsidianComparisonTask(essay, topic);
  const rows = card.tasks.map((task, index) => `
    <div class="flaw-row">
      <div class="flaw-row-top">
        <span>${index + 1}. ${escapeHtml(task.label)}</span>
        <strong>第${task.row?.index || '?'}段</strong>
      </div>
      <p><strong>原文证据</strong>：${escapeHtml(task.row?.evidence || task.row?.lead || '未提取')}</p>
      <p><strong>学习动作</strong>：${escapeHtml(task.action)}</p>
      <p><strong>迁移提醒</strong>：只迁移动作，不复制原句；改写后必须回扣自己的题目。</p>
    </div>
  `).join('');
  panel.innerHTML = `
    <div class="agent-result-block">
      <h4>同题对照任务卡</h4>
      <p><strong>当前题目</strong>：${escapeHtml(card.topic)}</p>
      <p><strong>对照范文</strong>：${escapeHtml(essay.title || '未命名范文')}｜${escapeHtml(buildTeachingEssayMetaLine(essay))}</p>
      <p class="agent-para-issues">这张卡不是让孩子抄范文，而是让他完成 5 个可检查的小动作：定向、机制、转折、现实、边界。</p>
      <div class="score-grid">${rows || '<p>暂未生成任务。</p>'}</div>
      <button class="agent-btn ghost" type="button" data-ob-dissect-id="${escapeHtml(essay.id)}">返回解剖这篇</button>
    </div>
  `;
}

function renderObsidianEssayDissection(essay, panel, topic = '') {
  if (!panel) return;
  const studyRoute = buildObsidianThreeStepStudyRoute(essay, topic || essay?.prompt || essay?.topicKey || '');
  const paragraphRows = (essay.paragraphDissection || []).map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>第${row.index}段｜${escapeHtml(row.role)}</span><strong>${escapeHtml((row.moveLabels || []).join('、') || '段落功能')}</strong></div>
      <p><strong>段首句</strong>：${escapeHtml(row.lead || '未提取')}</p>
      <p><strong>证据句</strong>：${escapeHtml(row.evidence || '未提取')}</p>
      <p><strong>可学习点</strong>：${escapeHtml(row.learnPoint || '学习段落功能。')}</p>
    </div>
  `).join('');
  const moves = (essay.highScoreMoves || []).map((item) => `<span class="agent-tag">${escapeHtml(item)}</span>`).join('');
  const points = (essay.learnPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  panel.innerHTML = `
    <div class="agent-result-block">
      <h4>范文解剖器</h4>
      <p><strong>${escapeHtml(essay.title || '未命名范文')}</strong></p>
      <p>${escapeHtml(buildTeachingEssayMetaLine(essay))}</p>
      <p><strong>题目/任务</strong>：${escapeHtml(essay.prompt || essay.topicKey || '未提取')}</p>
      <p><strong>中心论点</strong>：${escapeHtml(essay.thesis || '未提取')}</p>
      <p><strong>关键高分动作</strong></p>
      <div class="agent-tags">${moves || '<span class="agent-tag">暂无动作标签</span>'}</div>
      <p><strong>可学习点</strong></p>
      <ul>${points || '<li>先看段落功能，再回到自己文章补缺。</li>'}</ul>
      <p><strong>Obsidian位置</strong>：${escapeHtml(essay.wikiPath ? `[[${essay.wikiPath}]]` : essay.notePath || '')}</p>
      <button class="agent-btn ghost" type="button" data-ob-task-id="${escapeHtml(essay.id)}">${escapeHtml(topic ? '按当前题目生成对照任务卡' : '生成对照任务卡')}</button>
    </div>
    <div class="agent-result-block">
      <h4>3步读范文路线</h4>
      <p class="agent-para-issues">先照着这三步读，再回到自己的作文改一个动作。不要整篇照搬。</p>
      ${renderObsidianThreeStepRoute(studyRoute)}
    </div>
    ${renderObsidianEssayMethodCardBlock(essay)}
    <div class="agent-result-block">
      <h4>段落路径图</h4>
      <p class="agent-para-issues">先看整篇文章怎样一步步推进，再看单段句子。上海卷真正拉分的地方，常在“段与段之间为什么这样走”。</p>
      ${renderObsidianParagraphPath(essay)}
    </div>
    <div class="agent-result-block">
      <h4>逐段功能拆解</h4>
      <div class="score-grid">${paragraphRows || '<p>暂未拆出段落。</p>'}</div>
    </div>
  `;
}

function renderObsidianActionBank(typeKey, panel) {
  if (!panel) return;
  const assets = getObsidianTeachingAssets();
  if (!assets?.moves) return void renderObsidianTutorMessage(panel, '暂未加载高分动作库。');
  const types = typeKey === 'all'
    ? (assets.moveTypes || [])
    : (assets.moveTypes || []).filter((item) => item.key === typeKey);
  const blocks = types.map((type) => {
    const items = (assets.moves[type.key] || []).slice(0, 12);
    const rows = items.map((item, index) => `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>${index + 1}. ${escapeHtml(item.label)}</span><strong>第${item.paragraphIndex || '?'}段</strong></div>
        <p><strong>短句样本</strong>：${escapeHtml(item.sentence)}</p>
        <p><strong>来自</strong>：${escapeHtml(item.sourceTitle)}｜${escapeHtml(item.topicType || '')}｜${escapeHtml(item.themeTag || '')}</p>
        <p><strong>怎么学</strong>：${escapeHtml(item.why || '只学功能，不照搬表达。')}</p>
      </div>
    `).join('');
    return `
      <div class="agent-result-block">
        <h4>${escapeHtml(type.label)}</h4>
        <p><strong>迁移方法</strong>：${escapeHtml(buildObsidianMoveTransferTip(type.key))}</p>
        <div class="score-grid">${rows || '<p>暂无样本。</p>'}</div>
      </div>
    `;
  }).join('');
  panel.innerHTML = `
    <div class="agent-result-block">
      <h4>高分动作库</h4>
      <p class="agent-para-issues">这些是从 OB 高分文中提炼出的“功能短句”。使用时只学动作：界定、转折、解释、收边界、落现实。</p>
    </div>
    ${blocks}
  `;
}
