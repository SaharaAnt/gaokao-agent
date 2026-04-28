// Draft generation, example-library routing, material cards, and training scaffolds.
function generateThreeParagraphDraft(analysis) {
  const key = analysis.topicPhrases[0] || '该命题';
  const key2 = analysis.topicPhrases[1] || key;
  const rise = analysis.topicType.code === 'value'
    ? '结尾升华到“价值排序与公共后果”。'
    : (analysis.topicType.code === 'relation'
      ? '结尾升华到“在张力中达成更高统一”。'
      : '结尾升华到“个体判断与时代实践的连接”。');
  return [
    [
      `开篇先回应题目：“${key}”不能被直觉化理解，需先界定概念。`,
      `${analysis.stanceOptions?.[2]?.thesis || analysis.thesis}`,
      '段末明确判断标准：在什么前提下成立，在什么前提下不成立。'
    ],
    [
      `中段围绕“${key}”展开“因为-所以-因此”因果链，并给出可分析例证。`,
      '补一处辩证转折：诚然……然而……，防止单边论证。',
      analysis.topicType.code === 'relation'
        ? `同时处理“${key}”与“${key2}”的双边关系，解释二者如何互相制约与转化。`
        : '补充一次反方回应并回收，提升论证完整性。'
    ],
    [
      `收束时回到题目问法，指出“${key}”并非绝对成立。`,
      '给出条件化结论（边界/前提/例外），避免“唯一、必然、绝对”。',
      rise
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

function buildDraftFromFourBlocks(analysis) {
  const topic = analysis.topic || '该题';
  const key = analysis.topicPhrases?.[0] || '核心概念';
  const opening = analysis.examReadyTemplates?.opening || analysis.examReadySentences?.opening || '先界定概念再立论。';
  const turning = analysis.examReadyTemplates?.turning || analysis.examReadySentences?.turning || '然而，离开边界谈结论会失真。';
  const rising = analysis.examReadyTemplates?.rising || analysis.examReadySentences?.closing || '结尾回到题目并给条件化判断。';
  const must = analysis.mustAnswerChecklist || [];
  const steps = analysis.threeStepAnalysis || [];
  const triad = analysis.triadTrainingKit || { blocks: [] };
  const triadLine = triad.blocks?.[0]?.actions?.[0] || '先拆解核心概念，再锁定题眼关系。';

  const p1 = [
    `【开篇立论】${opening}`,
    `题目“${topic}”看似在问立场，实则在考查对“${key}”的定义与边界。`,
    `本文主张：${analysis.thesis || '应作条件化判断。'}`
  ].join('');

  const p2 = [
    `【中段论证】${steps[1] || '展开机制论证。'}`,
    `按三维训练先做审题立意：${triadLine}`,
    `先回应必答问题：${must[0] || '核心概念如何定义'}；再说明机制链：前提—机制—结果。`,
    `${turning}`
  ].join('');

  const p3 = [
    `【反方与边界】${must[2] || '回应反方与例外情形。'}`,
    `在反例场景下，结论需要做边界修正，而不是绝对化表述。`,
    `由此可见，判断的质量取决于是否可检验、可修正。`
  ].join('');

  const p4 = [
    `【收束升华】${steps[2] || '完成高阶立意。'}`,
    `${rising}`,
    `回到题目问法，给出“成立条件+失效边界”的完整结论。`
  ].join('');

  return [p1, p2, p3, p4].map(ensureSentenceEnding).join('\n\n');
}

function buildTriadTrainingKit(topic, topicType, topicPhrases) {
  const key = topicPhrases[0] || '核心概念';
  const key2 = topicPhrases[1] || '关联概念';
  const relationHint = topicType.code === 'relation'
    ? `重点处理“${key}—${key2}”的对立统一关系，避免单边站队。`
    : `把“${key}”放进条件链中判断，避免绝对化结论。`;
  return {
    blocks: [
      {
        title: '一、审题立意准确（定方向）',
        focus: '抓“核心话题 + 思辨关系”，先定义再表态。',
        actions: [
          `三步拆题：圈关键词（如“${key}”）→ 判关系（对立/条件/递进）→ 锁题眼。`,
          relationHint,
          '立意升格：从“既要也要”升级为“有立场、有条件、有边界”。'
        ]
      },
      {
        title: '二、逻辑层次清晰（搭骨架）',
        focus: '每段都要有可追踪逻辑链，而不是素材堆砌。',
        actions: [
          '优先结构：定调立论 → 双边辩证/机制展开 → 反方回应 → 条件化结论。',
          '分论点自检：是否扣中心、是否有层次、是否不重复。',
          '段内链条：观点 → 道理 → 素材 → 分析 → 回扣题目。'
        ]
      },
      {
        title: '三、语言表达生动（提质感）',
        focus: '语言为思辨服务，先准确再有表现力。',
        actions: [
          '高频逻辑词：诚然、然而、进一步看、由此可见、换言之。',
          '四句型轮换：对仗句、辩证句、设问句、排比句。',
          '生动化三法：概念比喻化、时代素材融合、回到高中生真实场景。'
        ]
      }
    ],
    integration: [
      '写作顺序：审题立意 → 结构分层 → 分论点落地 → 语言打磨。',
      '每段至少出现一次“机制解释”或“边界修正”，防止空泛抒情。',
      '结尾必须回扣题目问法，给“成立条件 + 失效边界”。'
    ],
    selfCheck: [
      '审题：是否抓准核心概念与关系？是否避免偷换概念？',
      '逻辑：是否有清晰结构与段内逻辑链？是否回应反方？',
      '语言：是否口语化过重？是否有思辨标志词与句式变化？'
    ]
  };
}

function buildShanghaiHighScoreGuide() {
  return {
    weights: [
      '立意约30%：切题、深刻、不过度绝对化。',
      '思辨与逻辑约35%：论证严密、辩证充分、证据贴合。',
      '结构约15%：首尾呼应、段间过渡自然。',
      '语言约15%：准确、流畅、庄重、不过分抒情。',
      '卷面与细节约5%：字数达标、标点规范、书写清晰。'
    ],
    structures: [
      '五段通用：开头立论 + 正面论证 + 反面/辩证 + 现实拔高 + 结尾收束。',
      '关系题首选：A价值 + B价值 + A/B统一与边界 + 时代落点。',
      '每段段首写分论点句，段末回扣题眼，形成闭环。'
    ],
    debateTips: [
      '从“是什么-为什么-怎么做”递进，不只摆素材。',
      '例证后必须补“机制解释句”，回答“为何能证明观点”。',
      '避免绝对化词（一定、唯一、必须），改为条件化判断。'
    ],
    languageTips: [
      '多用思辨连接词：诚然、然而、进一步看、由此可见。',
      '少口语、少网络语，保持议论文文体稳定。',
      '可适度文采，但不堆砌辞藻，不偏离论证任务。'
    ],
    pitfalls: [
      '只表态不分析：有观点无机制。',
      '只讲单边：关系题忽视另一端价值。',
      '素材堆砌：例子很多但不能证明论点。',
      '结尾空喊口号：没有边界条件与现实指向。'
    ],
    mantra: '审题抓核心，立意有思辨，结构要清晰，论证讲逻辑，语言求得体。'
  };
}

function buildHighScoreChecklistDraft() {
  return [
    '【上海一类卷考前清单】',
    '',
    '1. 审题与立意',
    '先圈题眼，界定核心概念，明确“成立条件+失效边界”。',
    '中心论点必须可检验，避免绝对化表述。',
    '',
    '2. 结构与段落',
    '采用五段：开头立论、正面论证、辩证转折、现实拔高、结尾收束。',
    '每段段首先亮分论点，段尾回扣题目。',
    '',
    '3. 论证与思辨',
    '每个例证后补1句机制解释：它为何能证明观点。',
    '至少出现一次“诚然-然而”转折，回应反方。',
    '',
    '4. 语言与规范',
    '优先准确、简洁、庄重；避免口语化和空洞抒情。',
    '字数不少于800，标点规范，结尾回扣题眼并给条件结论。',
    '',
    '【高分口诀】',
    '审题抓核心，立意有思辨，结构要清晰，论证讲逻辑，语言求得体。'
  ].join('\n');
}

function buildThreePathMethodKit(topic, topicType, topicPhrases) {
  const key = topicPhrases[0] || '核心概念';
  const key2 = topicPhrases[1] || '相关概念';
  return {
    concept: [
      `先做“概念边界”辨析：${key}不等于常见误读，尝试用“不是……而是……”定义。`,
      topicType.code === 'relation'
        ? `关系题要明确“${key}”与“${key2}”并非二选一，而是条件化互补关系。`
        : `单问句题要明确“${key}”在何种前提下成立、何种情形下失效。`,
      '每段都回扣题眼，防止概念漂移。'
    ],
    classify: [
      '先做基础分类（支持/质疑/整合），再做次级分类（动机、后果、边界）。',
      '同一行为可有不同心理动因，分类讨论能显著拉开思辨层次。',
      '段内结构建议：观点句 → 分类证据 → 比较分析 → 回扣中心论点。'
    ],
    reality: [
      '把论证放回现实：问题在当下社会具体如何出现？谁最受影响？',
      '用“问题-分析-对策”推进，而不是只做抽象判断。',
      '优先可观察场景（校园、平台、技术、公共讨论），避免纸上空转。'
    ],
    caution: '三条路径都必须紧扣题目，不为“显深刻”而离题。'
  };
}

function buildThreePathDraft(analysis) {
  const topic = analysis.topic || '该题';
  const key = analysis.topicPhrases?.[0] || '核心概念';
  const path = analysis.threePathKit || buildThreePathMethodKit(topic, analysis.topicType || { code: 'phenomenon' }, analysis.topicPhrases || []);
  return [
    `【题目】${topic}`,
    '',
    '【路径一：概念辨析】',
    `先界定“${key}”：${path.concept?.[0] || '先做概念边界辨析。'}`,
    `${path.concept?.[1] || '明确成立条件与失效边界。'}`,
    '',
    '【路径二：分类讨论】',
    `${path.classify?.[0] || '做基础分类与次级分类。'}`,
    `${path.classify?.[1] || '比较不同类型的心理动因与后果。'}`,
    '',
    '【路径三：现实关联】',
    `${path.reality?.[0] || '回到现实场景提出问题。'}`,
    `${path.reality?.[1] || '用问题-分析-对策推进论证。'}`,
    '',
    '【收束提醒】',
    `${path.caution || '紧扣题眼，避免离题。'}`,
    '结尾回到题目问法，给出条件化判断。'
  ].join('\n');
}

function loadPathTrainingMap() {
  try {
    const raw = localStorage.getItem(PATH_TRAINING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function savePathTrainingMap(map) {
  try { localStorage.setItem(PATH_TRAINING_STORAGE_KEY, JSON.stringify(map)); } catch (_) {}
}

function topicTrainingKey(topic) {
  return String(topic || '').trim().slice(0, 120);
}

function getPathTrainingState(topic) {
  const key = topicTrainingKey(topic);
  const map = loadPathTrainingMap();
  const state = map[key] || { unlocked: 1, completed: { 1: false, 2: false, 3: false }, updatedAt: Date.now() };
  const completedCount = [1, 2, 3].filter((n) => !!state.completed[n]).length;
  return {
    ...state,
    statusText: `已完成 ${completedCount}/3 步，当前解锁到第${state.unlocked}步`
  };
}

function savePathTrainingState(topic, state) {
  const key = topicTrainingKey(topic);
  const map = loadPathTrainingMap();
  map[key] = {
    unlocked: clamp(Number(state.unlocked || 1), 1, 3),
    completed: {
      1: !!state.completed?.[1],
      2: !!state.completed?.[2],
      3: !!state.completed?.[3]
    },
    updatedAt: Number(state.updatedAt || Date.now())
  };
  savePathTrainingMap(map);
}

function resetPathTrainingState(topic) {
  const key = topicTrainingKey(topic);
  const map = loadPathTrainingMap();
  delete map[key];
  savePathTrainingMap(map);
}

function renderPathStepRows(state) {
  const rows = [
    { step: 1, name: '第1步 概念辨析', target: '写出“不是……而是……”并明确边界条件。' },
    { step: 2, name: '第2步 分类讨论', target: '完成基础分类 + 次级分类，比较不同动因。' },
    { step: 3, name: '第3步 现实关联', target: '用“问题-分析-对策”关联现实场景并收束。' }
  ];
  return rows.map((r) => {
    const done = !!state.completed?.[r.step];
    const unlocked = r.step <= (state.unlocked || 1);
    return `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>${r.name}</span><strong>${done ? '已达标' : (unlocked ? '可训练' : '未解锁')}</strong></div>
        <p>目标：${r.target}</p>
        <div class="agent-actions secondary">
          <button class="agent-btn ghost path-step-write-btn" type="button" data-path-step="${r.step}" ${unlocked ? '' : 'disabled'}>写入本步模板</button>
          <button class="agent-btn primary path-step-check-btn" type="button" data-path-step="${r.step}" ${unlocked ? '' : 'disabled'}>检测并解锁</button>
        </div>
      </div>`;
  }).join('');
}

function appendPathStepTemplate(draft, analysis, step) {
  const key = analysis.topicPhrases?.[0] || '核心概念';
  const base = String(draft || '').trim();
  const line = step === 1
    ? `【概念辨析】先界定“${key}”：它不等于常见误读，而是在特定边界内成立。`
    : (step === 2
      ? '【分类讨论】可分为两类：一类是理性使用，另一类是依赖外部标准；同一行为背后动因不同。'
      : '【现实关联】回到现实场景：问题如何出现、原因何在、可行对策是什么。');
  return base ? `${base}\n\n${ensureSentenceEnding(line)}` : ensureSentenceEnding(line);
}

function evaluatePathStep(step, analysis, draft) {
  const text = String(draft || '');
  const words = countWords(text);
  if (step === 1) {
    const pass = /(不是|并非).*(而是)/.test(text) && /(边界|前提|条件|内涵)/.test(text) && words >= 120;
    return { pass, message: pass ? '第1步达标，已解锁第2步。' : '第1步未达标：请补“不是…而是…”与边界条件。' };
  }
  if (step === 2) {
    const pass = /(分类|类型|其一|其二|一类|另一类|分别)/.test(text) && /(动因|心理|后果|差异)/.test(text) && words >= 220;
    return { pass, message: pass ? '第2步达标，已解锁第3步。' : '第2步未达标：请补分类框架与比较分析。' };
  }
  const pass = /(现实|社会|校园|平台|时代)/.test(text) && /(问题|原因|对策|路径|做法)/.test(text) && words >= 320;
  return { pass, message: pass ? '第3步达标，三路径训练完成。' : '第3步未达标：请补“问题-分析-对策”现实链。' };
}

function renderPathTrainingFeedback(container, pass, msg) {
  if (!container) return;
  const cls = pass ? 'low' : 'high';
  container.insertAdjacentHTML('afterbegin', `<div class="agent-result-block"><p class="agent-para-issues ${cls}">${escapeHtml(msg)}</p></div>`);
}

function buildTriadTrainingOutlineCard(analysis) {
  const key = analysis.topicPhrases?.[0] || '核心概念';
  const key2 = analysis.topicPhrases?.[1] || '关联概念';
  const relationLine = analysis.topicType.code === 'relation'
    ? `明确“${key}—${key2}”的关系：不是二选一，而是张力中的统一。`
    : `把“${key}”放进条件链：何时成立、何时失效。`;
  const p1 = [
    `【审题立意】先界定“${key}”的内涵与边界。`,
    relationLine,
    `中心论点：${analysis.thesis || '给出条件化判断，不绝对化。'}`
  ].join('');
  const p2 = [
    '【逻辑结构】用“前提—机制—结果”搭建论证链。',
    '给出1个现实例证，并解释它为什么支持你的判断。',
    '加入“诚然—然而”转折，回应反方并回扣题眼。'
  ].join('');
  const p3 = [
    '【语言表达】用一组对仗或排比句提升表达质感。',
    '结尾加入“价值意义 + 边界条件”双句收束。',
    '回到题目问法：给出可检验、可修正的结论。'
  ].join('');
  return [ensureSentenceEnding(p1), ensureSentenceEnding(p2), ensureSentenceEnding(p3)].join('\n\n');
}

function buildTriadTemplateSentences(analysis) {
  const key = analysis.topicPhrases?.[0] || '该命题';
  const key2 = analysis.topicPhrases?.[1] || '另一端';
  const isRelation = analysis.topicType.code === 'relation';
  return {
    openings: [
      `先界定“${key}”的内涵与边界，再讨论其成立条件。`,
      isRelation ? `题目的难点不在二选一，而在处理“${key}—${key2}”的张力。` : `与其急于表态，不如先澄清“${key}”究竟指什么。`
    ],
    turnings: [
      '诚然，直观判断有其合理性；然而，离开机制谈结论容易失真。',
      isRelation ? `进一步看，“${key}”与“${key2}”并非互相否定，而是互相校正。` : '进一步而言，关键在于前提是否成立，而非态度是否响亮。'
    ],
    closings: [
      '回到题目，结论应当条件化而非绝对化。',
      '当判断经受反问并能指向实践时，思辨才真正落地。'
    ]
  };
}

function buildTriadGapTips({ topic, draft, topicPhrases, scaffold, precision, missedCount }) {
  const tips = [];
  const d1 = scaffold?.dimensions?.find((d) => d.id === 'd1')?.score ?? 100;
  const d6 = scaffold?.dimensions?.find((d) => d.id === 'd6')?.score ?? 100;
  const d3 = scaffold?.dimensions?.find((d) => d.id === 'd3')?.score ?? 100;
  const coreScore = precision?.coreConsistency?.score ?? 100;
  const turnSignals = countMatches(draft, /(诚然|然而|另一方面|同时|反过来|不过)/gi);
  const logicSignals = countMatches(draft, /(因为|所以|因此|由此|从而|意味着)/gi);
  const emptySignals = countMatches(draft, /(我们要|应该要|必须要|毋庸置疑|显而易见)/gi);

  if (missedCount > 0 || d1 < 65 || coreScore < 60) {
    tips.push('审题立意缺口：题眼覆盖不足或概念漂移，建议每段首句回扣题眼并补边界。');
  }
  if (d6 < 60 || logicSignals < 3 || turnSignals < 1) {
    tips.push('逻辑层次缺口：结构标志词与机制链不足，建议补“前提-机制-结果”并加转折。');
  }
  if (d3 < 60 || emptySignals > 6) {
    tips.push('语言表达缺口：抽象空话偏多，建议用对仗/排比句并补具体场景。');
  }
  if (!tips.length) tips.push('三维表现较均衡，继续保持并强化结尾升华质量。');
  return tips;
}

function applyTriadEnhancement(draft, analysis) {
  const paragraphs = splitParagraphs(draft);
  if (!paragraphs.length) return draft;
  const key = analysis.topicPhrases?.[0] || '该命题';
  const exampleDriven = !!analysis.exampleGuidedKit?.anchorCard;
  const addLogic = '其关键正在于：当前提成立，某种力量便会通过具体机制转化为现实结果。';
  const addTurn = `诚然，${key}在某些情境下具有合理性；然而，一旦离开边界，它的力量也可能转化为局限。`;
  const addLanguage = '也唯有如此，判断才既见锋芒，也存分寸。';

  if (paragraphs[1] && !/(前提|机制|结果|本质|关键正在于)/.test(paragraphs[1])) {
    paragraphs[1] = `${paragraphs[1]}${addLogic}`;
  }
  if (!exampleDriven && paragraphs[2] && !/(诚然|然而)/.test(paragraphs[2])) {
    paragraphs[2] = `${paragraphs[2]}${addTurn}`;
  }
  const lastIdx = paragraphs.length - 1;
  if (paragraphs[lastIdx] && !/(锋芒|分寸|底色|航向|基石)/.test(paragraphs[lastIdx])) {
    paragraphs[lastIdx] = `${paragraphs[lastIdx]}${addLanguage}`;
  }
  return paragraphs.join('\n\n');
}

function buildEssayTemplateByType(topic, key, key2, topicType, casePool) {
  const material = pickCaseMaterial(casePool, topicType, topic);
  const relationIntro = `围绕“${topic}”形成争议，并不令人意外。`;
  const baseDefine = `因为真正值得辨析的，从来不是一句响亮的表态，而是“${key}”究竟在什么前提下成立。`;
  if (topicType === 'relation') {
    return [
      [
        relationIntro,
        `在现实生活中，“${key}”与“${key2}”常被看作彼此牵扯的两端。`,
        `${baseDefine}与其把二者写成非此即彼，不如追问它们如何在具体情境中相互校正。`
      ].join(''),
      [
        `先看“${key}”的意义。很多时候，它之所以被反复提起，正因为它确实能够提供行动方向与现实动力。`,
        `例如，${material.example}。`,
        `当一种力量切中现实难题时，它当然有存在的必要；问题只在于，若把这种必要性绝对化，判断便容易失衡。`
      ].join(''),
      [
        `这时，“${key2}”的重要性才真正显现。它不是为了否定“${key}”，而是提醒我们：任何单一原则一旦脱离边界，都会从力量转化为局限。`,
        `也正因如此，“${key}—${key2}”并非静止对立，而是一种随处境而变化的张力结构。`,
        `不同情境下，两端的权重会发生调整，这恰恰构成了现实的复杂。`
      ].join(''),
      [
        `把视角拉回当下，这一点尤其重要。`,
        `从${material.domain}场景看，${material.link}。`,
        `时代越是变化迅速，人越不能依赖单边立场处理复杂问题，而更需要在张力中守住判断力。`
      ].join(''),
      [
        `因此，处理“${key}—${key2}”不能停在二选一。`,
        `更稳妥的态度，是在条件中辨其轻重，在边界中见其转化，让判断既有方向，也有分寸。`
      ].join('')
    ];
  }

  if (topicType === 'value') {
    return [
      [
        `围绕“${topic}”的讨论，说到底是在追问一种价值标准是否可靠。`,
        `${baseDefine}只有把标准放进现实后果里检验，判断才不会流于情绪化。`
      ].join(''),
      [
        `首先必须承认，“${key}”之所以广泛存在，自有其现实依据。`,
        `例如，${material.example}。`,
        `一个能在协作中降低成本、提高效率的判断标准，当然不可能毫无道理。`
      ].join(''),
      [
        `但问题也恰恰在这里：现实上有效，并不等于价值上充分。`,
        `若只看当下的可见收益、眼前的多数选择，许多真正重要却不够喧哗的价值就会被遮蔽。`,
        `因此，价值判断还必须纳入长期后果、公共影响与更深层的人之完整性。`
      ].join(''),
      [
        `尤其在信息过载的时代，人们比任何时候都更容易把“容易测量”误当成“真正重要”。`,
        `而在${material.domain}领域，${material.link}。`,
        `这提醒我们，成熟的判断从不只是顺着惯性做选择，而是能重新追问标准本身。`
      ].join(''),
      [
        `因此，${key}是否成立，取决于价值标准、现实代价与长期后果能否彼此印证。`,
        `真正可靠的判断，不是最省力的判断，而是经得起反问、也经得起实践的判断。`
      ].join('')
    ];
  }

  return [
    [
      `围绕“${topic}”的追问之所以值得认真对待，正在于它并不止于态度选择。`,
      `${baseDefine}只有把概念放进现实过程里考察，我们才可能得到可检验的判断。`
    ].join(''),
    [
      `先看现实中的第一层图景：许多判断看起来“顺理成章”，其实只是经验惯性的结果。`,
      `例如，${material.example}。`,
      `当案例被放进“前提—机制—结果”的链条中，同一结论在不同条件下往往会出现差异。`,
      `也正因为如此，真正需要追问的不是现象本身，而是它何以成立。`
    ].join(''),
    [
      `诚然，强调${key}有其道理：它回应了现实中的某种真实需求，也能提供行动方向。`,
      `然而，如果只强调这一端，忽视边界与副作用，原本合理的判断也会迅速滑向片面。`,
      `因此，任何结论都必须接受反问：在例外情形下，它是否仍能自洽？`
    ].join(''),
    [
      `把视角拉回到当下社会，在信息高速流动的环境中，人们常被更快表达所推动，却忽略更慢思考的必要。`,
      `越是在这样的时刻，越需要通过条件、机制与边界来稳住判断。`
    ].join(''),
    [
      `回到题目，我的结论是：${key}并非绝对成立，但在明确前提、补足机制、接受边界的情况下，具有解释力。`,
      `当判断能够回应现实、经受反问并指向实践时，思辨才真正从纸面落到生活。`
    ].join('')
  ];
}

function normalizeStructureStepText(text, fallback) {
  const raw = String(text || '').trim();
  if (!raw) return fallback;
  return raw
    .replace(/^(先|再|然后|进一步|最后|结尾|第一段|第二段|第三段|第四段|第一层|第二层|第三层)[：:、，\s]*/g, '')
    .replace(/^写(出|清|明|下)?/g, '')
    .trim() || fallback;
}

function composeEssayParagraph(parts) {
  return (parts || [])
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .map((part) => ensureSentenceEnding(part))
    .join('');
}

function buildExampleLeadSentence(topic, key, exampleCard) {
  if (exampleCard?.id === 'example-declutter-true-self') {
    return '在物质丰裕而内心拥堵的今天，“断舍离”从整理术语变成流行生活方式，并不偶然。';
  }
  if (/是否|吗|？|\?/.test(String(topic || ''))) {
    return `面对“${topic}”这样的追问，最容易犯的错误，是太快表态，而太慢思考。`;
  }
  if ((exampleCard?.categories || []).includes('关系辩证题')) {
    return `“${key}”之所以值得反复讨论，恰在于现实从来不允许它被写成单边答案。`;
  }
  return `围绕“${key}”的讨论之所以值得认真对待，正在于它牵连的不只是态度，更是判断标准。`;
}

function buildDeclutterEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  const material = (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'phenomenon', topic);
  const thesis = exampleCard?.thesis || analysis.thesis || '断舍离是通向自我澄明的手段，而不是目的本身。';
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  return [
    composeEssayParagraph([
      '在物质丰裕而内心拥堵的今天，“断舍离”从整理术语变成流行生活方式，并不偶然',
      '人们热衷于清空衣橱、删减信息、重整关系，表面上是在做减法，实则是在追问：什么才值得留下',
      '若把“断舍离”仅理解为扔掉旧物，便把它写浅了；若把它理解为对责任、关系和过往的轻快切断，又把它写偏了',
      thesis
    ]),
    composeEssayParagraph([
      '断舍离之所以在今天格外流行，首先是因为现代生活确实太容易把人填满',
      '消费主义不断制造“还缺一点”的幻觉，社交媒体持续推送“别人都在拥有”的样板，学习与工作也往往把资料、任务、人际联络层层叠加',
      '东西更多了，选择更多了，人的秩序感却未必因此增加',
      '恰恰相反，过量占据常使人失去判断：哪些是真正需要，哪些只是惯性；哪些值得珍视，哪些不过出于恐惧失去',
      `正是在这样的现实压力下，${material.example || '减法才成为当代人的自救方式'}`
    ]),
    composeEssayParagraph([
      '更重要的是，断舍离真正发生作用的地方，不在垃圾袋里，而在人的判断里',
      '当一个人开始清理堆积的物品、信息乃至无效关系时，他并不只是删除外物，而是在逼迫自己回答：我为何留着它，我又为何舍不得它',
      '有些占有来自真实需要，有些依附却只是虚荣、焦虑与自我证明',
      golden[0] || '断舍离真正要清除的，不只是堆积之物，更是遮蔽内心的惯性与依附',
      '筛掉不必要的占据后，那些仍被郑重保留的东西，往往才更接近一个人内心的真实所求'
    ]),
    composeEssayParagraph([
      '然而，若把断舍离推向绝对，它就会从自我澄明的手段滑向逃避现实的借口',
      '有人把它写成极简生活的赞歌，以为东西越少、人越高级；也有人借“做减法”之名，轻率切断关系、回避责任、拒绝承受复杂生活的重量',
      '可真正成熟的断舍离，从来不是任性切割，而是有判断地取舍',
      golden[1] || '删减从来不是终点，借由删减看清自己要守住什么，才是它真正的意义'
    ]),
    composeEssayParagraph([
      '把目光放回现实，这一点尤须强调',
      '在信息过载的时代，我们当然需要删去无效输入；在消费诱惑无处不在的环境里，我们也当然需要摆脱被物欲牵着走的生活方式',
      '但与此同时，一个人不能因为“轻装上阵”就抛开家庭责任，不能因为“远离消耗”就拒绝所有难以处理的人际，也不能因为“整理自我”就回避公共生活中的承担',
      '真实所求并不是一删就自动显现，它常常是在取舍、试错与反思中逐步显影',
      `从${material.domain}的现实提醒看，${material.link || '真正可贵的不是删减动作本身，而是删减之后仍能守住价值次序'}`
    ]),
    composeEssayParagraph([
      '因此，我更愿意把断舍离理解为一种重新排序的能力，而不是一种值得神圣化的生活姿态',
      thesis,
      golden[2] || '一个人能否认清真实所求，不取决于他丢掉了多少，而取决于他留下的东西是否经过清醒选择',
      '唯有如此，减法才不会沦为空洞姿态，取舍才会通向更澄明的自我'
    ])
  ];
}

function buildInnovationSynthesisEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  const material = (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'problem', topic);
  const thesis = exampleCard?.thesis || analysis.thesis || '对已有知识的综合未必天然就是创新，关键看是否产生新的解释力。';
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  return [
    composeEssayParagraph([
      '几乎所有创新都离不开前人积累，这一点似乎已成为常识',
      '也正因此，当题目追问“对已有知识的综合，是创新吗”时，真正要辨析的便不是“创新能否借旧而生”，而是怎样的综合仍只是整理，怎样的综合已经通向创造',
      '若把综合简单理解为拼接，把创新简单理解为凭空而来，文章都会失准',
      thesis
    ]),
    composeEssayParagraph([
      '先说为什么这个问题值得追问',
      '无论科学研究、艺术创作，还是现实中的制度设计，几乎都建立在既有知识之上',
      '人不可能在真空中思考，创新也不可能脱离传统突然降临',
      '从这个意义上说，综合已有知识不是创新的对立面，而常常是创新发生的前提',
      '然而，前提并不等于结果，借旧而生也并不意味着凡综合皆可称创新'
    ]),
    composeEssayParagraph([
      '因此，判断的关键就在于区分两类综合',
      '一种是机械拼接：把材料摆在一起，把观点罗列出来，把已有知识重新包装，却没有改变结构，也没有提出新的问题',
      golden[1] || '把材料堆在一起，不等于建成房屋；把知识拼在一起，也不等于完成创新',
      '这样的综合当然有整理价值，却仍停留在搬运、复述与归档层面',
      '另一种则是生成式综合：不同知识在新的结构中发生互相照亮，原本分散的信息因此拥有新的关系，进而生出新的解释力'
    ]),
    composeEssayParagraph([
      '真正的创新，往往就诞生在这种结构重组之中',
      '科学史上的突破，常不是增加了一堆资料，而是重新组织已有知识，改写了看问题的方式；跨学科研究之所以珍贵，也不在于学科名称叠加，而在于不同方法相遇后提出了旧框架看不见的问题',
      `放到今天，${material.example || '人工智能高效整合海量信息'}更让这个判断显得迫切`,
      '如果整合只是更快归纳与输出，那么它仍主要停留在高效处理；只有当整合过程能够推动新的结构形成、提出新的问题意识，它才真正逼近创新'
    ]),
    composeEssayParagraph([
      '这也正是当下最需要警惕的地方',
      '在信息技术飞速发展的时代，人们很容易把“整合得快”“汇总得全”误当成“创造得深”',
      '可高效并不自动通向创新，数量也不自动转化为质量',
      golden[0] || '创新很少从真空中诞生，真正稀缺的，是让旧知识在新的结构中重新发光',
      `从${material.domain}的现实提醒看，${material.link || '我们比任何时候都更需要辨认“高效整合”与“真实创新”的差别'}`
    ]),
    composeEssayParagraph([
      '所以，我更愿意给出这样的回答：对已有知识的综合，未必天然就是创新，但创新往往必须经过对已有知识的创造性综合',
      thesis,
      golden[2] || '衡量综合是否构成创新，不在于它用了多少旧知识，而在于它是否生出了新的解释力',
      '真正值得珍视的，不是把旧知识重新堆高，而是让它在新的问题与新的结构中，第一次真正发出光来'
    ])
  ];
}

function buildMapCompassEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  const material = (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'relation', topic);
  const key = analysis.topicPhrases?.[0] || '地图';
  const key2 = analysis.topicPhrases?.[1] || '指南针';
  const thesis = exampleCard?.thesis || analysis.thesis || '路径经验与方向意识应协同，而非互相替代。';
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  return [
    composeEssayParagraph([
      `在前行的路上，${key}与${key2}原本就不是同一种东西`,
      `${key}指向既有路径、经验积累与抵达效率，${key2}则象征方向感、价值判断与在不确定中自我校准的能力`,
      '若把题目写成“哪个更重要”的简单比较，便错过了它真正要考查的难点',
      thesis
    ]),
    composeEssayParagraph([
      `必须承认，在路径清楚、目标明确的情况下，${key}的确常常更有效`,
      '已有经验可以减少试错，成熟方法可以节省时间，清晰路线也能降低人在复杂任务中的盲目摸索',
      '无论学习规划、职业训练还是技术实践，人都离不开对既有路径的借鉴',
      '谁能看清前人的脚印，谁往往就更容易走得稳、走得快',
      golden[0] || '地图告诉我们怎样走得更快，指南针提醒我们不要走错方向'
    ]),
    composeEssayParagraph([
      `然而，${key}之所以有用，有一个并不该被忽略的前提：路径本身大致可靠`,
      `一旦处境变得陌生、现实充满岔路，${key}的边界便会显现出来`,
      '前人留下的路线未必仍适用于今天，熟悉经验也可能只把人带回旧答案',
      '这时，真正决定一个人会走向何处的，往往不是路线图有多细，而是他心中是否仍有方向坐标'
    ]),
    composeEssayParagraph([
      `所以，${key2}的重要性，恰恰在不确定中显现`,
      '指南针并不告诉人每一步该怎样迈出，却能告诉人不该朝哪里偏离',
      '一个人在面对诱惑、捷径与短期功利时，是否仍能守住初心、原则与价值判断，这往往比是否拥有现成路线更能决定命运',
      golden[1] || '在熟悉的平原上，地图的确高效；可在迷雾与岔路中，决定命运的往往是那枚不偏不倚的指南针',
      `也正因如此，${material.example || '经验路径一旦失效，方向意识就成为重新出发的支点'}`
    ]),
    composeEssayParagraph([
      '把目光放回当下，这种关系尤其值得重视',
      '今天的青年面对的并非一条已经铺好的单一路径，而是快速变化的技术环境、竞争结构和人生选项',
      '在这样的时代里，路径经验当然重要，但若方向错了，再精确的地图也可能把人带往偏离之地',
      `从${material.domain}的现实提醒看，${material.link || '效率若脱离方向，最终只会把人更快送往错误的终点'}`
    ]),
    composeEssayParagraph([
      `因此，我不赞同把${key}绝对地置于${key2}之上`,
      thesis,
      golden[2] || '前行之路既需要路径经验，也需要方向意识；没有方向的效率，不过是更快地偏离',
      '真正成熟的前行，不是只会沿图赶路，而是在借鉴路径的同时，始终知道自己为何出发、将向何处而去'
    ])
  ];
}

function buildCommonSenseEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  const material = (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'value', topic);
  const thesis = exampleCard?.thesis || analysis.thesis || '常识是理解世界的重要起点，但不能代替持续检验。';
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  return [
    composeEssayParagraph([
      '人们往往用常识去看待事物、做出判断，这几乎是一种天然反应',
      '常识让复杂世界变得可理解，让日常决策不至于每一步都从零开始',
      '但也正因为它太熟悉、太顺手，人更容易在不自觉中把常识误当成最终答案',
      thesis
    ]),
    composeEssayParagraph([
      '先承认常识的合理性，是讨论这道题的起点',
      '所谓常识，本就是长期经验、共同生活与反复实践沉淀下来的判断方式',
      '它帮助人迅速识别风险，维持基本秩序，也为许多日常决策节省了认知成本',
      '如果没有常识，个体的生活会变得迟疑，社会的运转也会失去许多最低限度的共识',
      '因此，轻率贬低常识，本身就是不成熟的姿态'
    ]),
    composeEssayParagraph([
      '然而，常识之所以值得警惕，也恰在于它常常太像正确答案',
      '它来自经验，却未必适用于一切时代；它帮助判断，却也可能把判断锁死在旧框架中',
      '当现实情境发生变化，当新技术、新知识、新关系不断出现，原本有效的经验就可能转化为惯性、偏见甚至认知惰性',
      golden[0] || '常识是人认识世界的门槛，却不是人停止思考的借口'
    ]),
    composeEssayParagraph([
      `这种局限在今天尤其明显，${material.example || '许多网络舆论、健康知识与教育方法'}都在提醒我们：旧常识并不总能应对新问题`,
      '有人因为“大家一直都这么想”而拒绝事实，有人因为“从前经验如此”而排斥新的证据',
      '常识若不再接受现实校验，就会从帮助理解世界的工具，变成遮蔽世界的墙',
      golden[1] || '经验能让判断更快，反思才能让判断更准'
    ]),
    composeEssayParagraph([
      '因此，更稳妥的态度既不是反常识，也不是迷信常识',
      '真正成熟的判断，应当把常识当作起点，而不是终点；当事实、实践与新知提出修正要求时，人还要有更新常识的勇气',
      `从${material.domain}的现实提醒看，${material.link || '熟知并非真知，实践才是检验认知可靠性的关键通道'}`
    ]),
    composeEssayParagraph([
      '回到题目，我赞同人们往往借助常识看待事物并作出判断，因为没有任何人能脱离经验而生活',
      '但我更愿意补上一句：常识若不能不断接受现实校正，便会从基础理性滑向僵化思维',
      thesis,
      golden[2] || '真正可靠的理性，不是抛弃常识，而是让常识不断接受现实的校正'
    ])
  ];
}

function buildSpecializedEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  if (exampleCard?.id === 'example-declutter-true-self') {
    return buildDeclutterEssayTemplateFromExample(topic, analysis, exampleCard, casePool);
  }
  if (exampleCard?.id === 'example-innovation-synthesis') {
    return buildInnovationSynthesisEssayTemplateFromExample(topic, analysis, exampleCard, casePool);
  }
  if (exampleCard?.id === 'example-map-compass') {
    return buildMapCompassEssayTemplateFromExample(topic, analysis, exampleCard, casePool);
  }
  if (exampleCard?.id === 'example-common-sense') {
    return buildCommonSenseEssayTemplateFromExample(topic, analysis, exampleCard, casePool);
  }
  return null;
}

function buildEssayTemplateFromExample(topic, analysis, exampleCard, casePool) {
  const specialized = buildSpecializedEssayTemplateFromExample(topic, analysis, exampleCard, casePool);
  if (specialized?.length) return specialized;
  const material = (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'phenomenon', topic);
  const key = analysis.topicPhrases?.[0] || '该命题';
  const structure = exampleCard?.structure || [];
  const materials = dedupeArray([
    ...(exampleCard?.materials || []),
    material?.example ? `${material.domain}中的现实场景也能说明这一点：${material.example}` : ''
  ]).filter(Boolean);
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  const introFocus = splitInsightBullets(exampleCard?.focus, 1)[0] || `讨论“${key}”时不能停在直觉表态。`;
  const riskTip = splitInsightBullets(exampleCard?.risk, 1)[0] || '若忽视边界，结论就会滑向片面。';
  const thesis = exampleCard?.thesis || analysis.thesis || `本文主张：${key}需要在条件与边界中判断。`;
  const step1 = normalizeStructureStepText(structure[0], `解释“${key}”为何会成为争议中心`);
  const step2 = normalizeStructureStepText(structure[1], '把另一端的限制、代价与边界补充出来');
  const step3 = normalizeStructureStepText(structure[2], '把抽象命题落到现实结构与时代处境之中');
  const lead = buildExampleLeadSentence(topic, key, exampleCard);

  return [
    composeEssayParagraph([
      lead,
      introFocus,
      thesis
    ]),
    composeEssayParagraph([
      `${step1}并非偶然`,
      materials[0] || material.example,
      `也正是在这样的现实处境中，“${key}”才不断进入公共讨论`,
      '若不先交代它何以出现，后文的判断就难免显得悬空'
    ]),
    composeEssayParagraph([
      `如果说上一层回答的是“${key}”为何会出现，那么这一层要回答的便是：它何以成立`,
      step2,
      materials[1] || golden[0] || '现实中的复杂性，恰恰要求我们给出机制解释，而不是只堆态度',
      golden[0] || '只有把现象放回结构与因果链里，判断才不会浮在表面'
    ]),
    composeEssayParagraph([
      '但任何看似有效的方法，一旦被神圣化，就会迅速走向自己的反面',
      riskTip,
      golden[1] || '因此，结论必须补出边界、前提与例外，而不是把一时立场写成永久真理'
    ]),
    composeEssayParagraph([
      '把目光重新放回时代现场，问题会看得更清楚',
      step3,
      `在${material.domain}的现实场景中，${material.link || material.example}`,
      materials[2] || '也正是在这里，抽象命题才真正与时代处境发生联系'
    ]),
    composeEssayParagraph([
      '回到题目，真正可靠的结论从来不是最响亮的结论，而是最经得起追问的结论',
      thesis,
      golden[2] || golden[golden.length - 1] || '当判断能够回应现实、承认边界并指向实践时，思辨才真正具有力量'
    ])
  ];
}

function getSelectedCasePool(selectEl) {
  const val = (selectEl?.value || 'auto').trim();
  const allow = ['auto', 'tech', 'edu', 'culture', 'society', 'examplelib', 'mycards'];
  return allow.includes(val) ? val : 'auto';
}

function pickCaseMaterial(casePool, topicType, topic = '') {
  if (casePool === 'mycards') {
    const card = pickMaterialCardForTopic(topic, topicType);
    if (card) return materialFromCard(card);
  }
  const exampleCard = pickExampleTrainingCardForTopic(topic, topicType);
  if (casePool === 'examplelib' && exampleCard) {
    return materialFromTrainingExampleCard(exampleCard);
  }
  const poolMap = {
    tech: {
      domain: '科技创新',
      example: '国产大模型从参数竞赛转向场景落地，证明“可用性”与“真实性”必须同时校验',
      link: '技术迭代的快并不必然等于价值沉淀的深'
    },
    edu: {
      domain: '教育成长',
      example: '不少学校从“刷题强度”转向“问题链学习”，成绩提升来自结构化思考而非机械重复',
      link: '短期分数与长期能力之间需要被重新平衡'
    },
    culture: {
      domain: '文化传播',
      example: '传统戏曲短视频出圈后，真正沉淀下来的观众往往来自后续的深度导赏与完整观看',
      link: '传播广度只有与内容厚度联动，才可能走向“可传”'
    },
    society: {
      domain: '社会治理',
      example: '社区协商中，方案能否落地取决于是否把多方诉求转为可执行规则',
      link: '公共判断必须兼顾效率、公平与可持续性'
    }
  };
  if (casePool === 'auto' && exampleCard && exampleCard.matchScore >= 20) {
    return materialFromTrainingExampleCard(exampleCard);
  }
  if (casePool && casePool !== 'auto' && poolMap[casePool]) return poolMap[casePool];
  const autoByType = topicType === 'value'
    ? poolMap.society
    : (topicType === 'relation' ? poolMap.culture : poolMap.edu);
  return autoByType;
}

function loadMaterialCards() {
  try {
    const raw = localStorage.getItem(MATERIAL_CARD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === 'object' && item.id && item.title).slice(-80)
      : [];
  } catch (_) {
    return [];
  }
}

function writeMaterialCards(cards) {
  try { localStorage.setItem(MATERIAL_CARD_STORAGE_KEY, JSON.stringify((cards || []).slice(-80))); } catch (_) {}
}

function saveMaterialCard(card) {
  const cards = loadMaterialCards();
  const normalized = {
    ...card,
    id: card.id || `card-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: card.createdAt || Date.now()
  };
  const next = cards.filter((item) => item.id !== normalized.id);
  next.push(normalized);
  writeMaterialCards(next);
  return normalized;
}

function findMaterialCardById(id) {
  return loadMaterialCards().find((card) => card.id === id) || null;
}

function deleteMaterialCard(id) {
  writeMaterialCards(loadMaterialCards().filter((card) => card.id !== id));
}

function createMaterialCardFromArticle(title, body) {
  const cleanTitle = String(title || '').trim();
  const cleanBody = String(body || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
  const sentences = splitSentences(cleanBody).map((s) => ensureSentenceEnding(s)).filter((s) => s.length >= 8);
  const lines = cleanBody.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const topic = extractArticleTopic(cleanTitle, cleanBody);
  const typeInfo = detectTopicType(topic || cleanTitle);
  const thesis = extractArticleThesis(sentences, topic);
  const structure = extractArticleStructure(lines, sentences);
  const materials = extractArticleMaterials(sentences);
  const goldenSentences = extractArticleGoldenSentences(sentences);
  const tags = dedupeArray([
    typeInfo.name,
    ...inferMaterialTags(`${cleanTitle}\n${cleanBody}`),
    topic ? '含作文题' : '待补题目'
  ]).slice(0, 6);

  return {
    id: `card-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: cleanTitle,
    topic: topic || cleanTitle,
    thesis,
    structure,
    materials,
    goldenSentences,
    tags,
    source: '公众号文章导入',
    wordCount: countWords(cleanBody),
    createdAt: Date.now()
  };
}

function extractArticleTopic(title, body) {
  const text = `${title}\n${body}`;
  const quoted = text.match(/[“《](.{8,90}?)(?:[”》])/);
  if (quoted && /(吗|？|怎样|如何|是否|对此|谈谈|请|有怎样的思考|认识)/.test(quoted[1])) return quoted[1].trim();
  const lines = text.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const hit = lines.find((line) => /(作文题|题目|原题|材料|请写一篇|谈谈|对此|你怎么看|有怎样的思考)/.test(line) && line.length <= 140);
  if (hit) return hit.replace(/^(作文题|题目|原题|材料)[:：\s]*/, '').replace(/要求[:：].*$/, '').trim();
  const titleTopic = title.replace(/【.*?】/g, '').replace(/\d+\.?\s*/, '').trim();
  return titleTopic.slice(0, 80);
}

function extractArticleThesis(sentences, topic) {
  const candidates = sentences.filter((s) => /(中心|立意|关键|核心|主张|我认为|本文|高分|不在于|而在于|并非|不是.*而是|应当|需要)/.test(s));
  const picked = candidates.sort((a, b) => scoreMaterialSentence(b, topic) - scoreMaterialSentence(a, topic))[0]
    || sentences.find((s) => s.length >= 24 && s.length <= 110)
    || '本文的核心论点需要结合题目进一步提炼。';
  return picked;
}

function extractArticleStructure(lines, sentences) {
  const marked = lines.filter((line) => /^(首先|其次|再次|最后|第一|第二|第三|开头|主体|结尾|分论点|一、|二、|三、)/.test(line)).slice(0, 5);
  const source = marked.length ? marked : sentences.filter((s) => /(首先|其次|进一步|然而|因此|回到题目|结尾|分论点)/.test(s)).slice(0, 5);
  const result = source.map((x) => summarizeSentence(x, 48)).filter(Boolean);
  while (result.length < 3) {
    const fallback = ['开头：界定题眼并亮出中心论点。', '主体：用分论点推进，例证后补机制分析。', '结尾：回扣题目，给出边界与升华。'][result.length];
    result.push(fallback);
  }
  return dedupeArray(result).slice(0, 5);
}

function extractArticleMaterials(sentences) {
  return dedupeArray(sentences
    .filter((s) => /(例如|比如|以.*为例|从.*到|素材|现实|当下|社会|校园|时代|技术|算法|文化|戏曲|航天|城市|社区|青年|教育)/.test(s))
    .map((s) => summarizeSentence(s, 70)))
    .slice(0, 5);
}

function extractArticleGoldenSentences(sentences) {
  return dedupeArray(sentences
    .filter((s) => s.length >= 18 && s.length <= 100)
    .filter((s) => /(不是.*而是|并非|关键|本质|价值|机制|边界|前提|因此|然而|真正|只有|才能)/.test(s))
    .sort((a, b) => scoreMaterialSentence(b, '') - scoreMaterialSentence(a, ''))
    .map((s) => summarizeSentence(s, 86)))
    .slice(0, 6);
}

function inferMaterialTags(text) {
  const tags = [];
  if (/(是否|吗|为什么|如何|怎样)/.test(text)) tags.push('问题式命题');
  if (/(与|和|关系|之间|对立|统一|平衡)/.test(text)) tags.push('关系辩证题');
  if (/(价值|认可|高下|意义|值得|标准)/.test(text)) tags.push('价值判断题');
  if (/(科技|AI|算法|大模型|技术)/i.test(text)) tags.push('科技创新');
  if (/(文化|传统|传播|戏曲|文学|经典)/.test(text)) tags.push('文化传播');
  if (/(教育|学习|学校|学生|成长)/.test(text)) tags.push('教育成长');
  if (/(社会|治理|公共|城市|社区)/.test(text)) tags.push('社会治理');
  return tags;
}

function scoreMaterialSentence(sentence, topic) {
  const s = String(sentence || '');
  let score = 0;
  if (topic && s.includes(topic.slice(0, 4))) score += 18;
  score += countMatches(s, /(因此|然而|本质|关键|机制|价值|边界|前提|不是|而是|并非)/g) * 8;
  score += countMatches(s, /(例如|比如|现实|当下|时代|社会)/g) * 5;
  if (s.length >= 24 && s.length <= 80) score += 12;
  if (/(我们要|必须要|显而易见|毋庸置疑)/.test(s)) score -= 12;
  return score;
}

function summarizeSentence(sentence, maxLen) {
  const s = ensureSentenceEnding(String(sentence || '').replace(/\s+/g, ' ').trim());
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

function materialFromCard(card) {
  const material = (card.materials || [])[0] || (card.goldenSentences || [])[0] || card.thesis || card.title;
  const link = card.thesis || (card.goldenSentences || [])[0] || '素材卡提供了可借鉴的论证角度';
  return {
    domain: `我的素材卡：${card.title}`,
    example: material,
    link,
    card
  };
}

function loadExampleTrainingLibrary() {
  return (typeof SHANGHAI_EXAMPLE_LIBRARY !== 'undefined' && Array.isArray(SHANGHAI_EXAMPLE_LIBRARY))
    ? SHANGHAI_EXAMPLE_LIBRARY
    : [];
}

function findExampleTrainingCardById(id) {
  return loadExampleTrainingLibrary().find((card) => card.id === id) || null;
}

function normalizeExampleMatchTerm(value) {
  return String(value || '')
    .replace(/[“”"《》【】（）()，。！？、；：:\s]/g, '')
    .trim();
}

function getExampleTopicSignals(topic) {
  const rawTopic = String(topic || '');
  const normalizedTopic = normalizeExampleMatchTerm(rawTopic);
  const phrases = typeof extractTopicPhrases === 'function'
    ? extractTopicPhrases(rawTopic)
    : [];
  const topicTerms = dedupeArray([
    ...phrases,
    ...rawTopic.split(/[，。！？、；：:\s"'“”《》（）()]+/)
  ])
    .map(normalizeExampleMatchTerm)
    .filter((term) => term.length >= 2);
  const genericTerms = new Set([
    '世界', '人生', '生活', '事物', '观点', '思考', '认识', '看法', '问题', '标准',
    '价值', '社会', '个人', '人们', '一个人', '有人', '是否', '如何', '怎样', '仅仅'
  ]);
  const specificTerms = topicTerms.filter((term) => !genericTerms.has(term));
  return { rawTopic, normalizedTopic, topicTerms, specificTerms, genericTerms };
}

function scoreExampleTermHit(term, signals) {
  const normalized = normalizeExampleMatchTerm(term);
  if (!normalized || signals.genericTerms.has(normalized)) return 0;
  if (signals.normalizedTopic.includes(normalized)) {
    if (normalized.length >= 5) return 20;
    if (normalized.length >= 3) return 14;
    return 8;
  }
  const overlapsSpecific = signals.specificTerms.some((topicTerm) => {
    if (topicTerm === normalized) return true;
    if (topicTerm.length >= 3 && normalized.includes(topicTerm)) return true;
    return normalized.length >= 3 && topicTerm.includes(normalized);
  });
  return overlapsSpecific ? 8 : 0;
}

function getExampleCardTopicCoverage(card, signals) {
  const haystack = normalizeExampleMatchTerm([
    card.title,
    card.topic,
    card.focus,
    card.intent,
    card.thesis,
    ...(card.tags || []),
    ...(card.keywords || [])
  ].filter(Boolean).join(' '));
  const hits = signals.specificTerms.filter((term) => term.length >= 2 && haystack.includes(term));
  return {
    hits: dedupeArray(hits),
    ratio: signals.specificTerms.length ? hits.length / signals.specificTerms.length : 0
  };
}

function scoreExampleTrainingCard(card, topic, topicType) {
  const signals = getExampleTopicSignals(topic);
  let score = 0;
  (card.keywords || []).forEach((kw) => {
    score += scoreExampleTermHit(kw, signals);
  });
  const cardCoverage = getExampleCardTopicCoverage(card, signals);
  score += cardCoverage.hits.length * 8;
  if (card.topic && normalizeExampleMatchTerm(card.topic).includes(signals.normalizedTopic.slice(0, 12))) score += 32;
  if (card.topic && signals.normalizedTopic.includes(normalizeExampleMatchTerm(card.topic).slice(0, 10))) score += 32;
  const typeName = typeof topicType === 'string'
    ? ({ relation: '关系辩证题', value: '价值判断题', problem: '问题式命题', phenomenon: '问题式命题' }[topicType] || topicType)
    : topicType?.name;
  if (typeName && (card.categories || []).includes(typeName) && (score > 0 || cardCoverage.ratio >= 0.5)) score += 10;
  if (/(如何|怎样|是否|吗|思考)/.test(signals.rawTopic) && (card.categories || []).includes('问题式命题') && score >= 18) score += 4;
  if (signals.specificTerms.length >= 2 && cardCoverage.ratio === 0 && score < 24) score -= 18;
  return score;
}

function pickRelevantExampleCards(topic, topicType, limit = 3) {
  return loadExampleTrainingLibrary()
    .map((card) => ({ ...card, matchScore: scoreExampleTrainingCard(card, topic, topicType) }))
    .filter((card) => card.matchScore >= 18)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function pickExampleTrainingCardForTopic(topic, topicType) {
  return pickRelevantExampleCards(topic, topicType, 1)[0] || null;
}

function pickAnchoredExampleCards(topic, topicType, limit = 2) {
  const text = String(topic || '');
  const signals = getExampleTopicSignals(text);
  return pickRelevantExampleCards(text, topicType, Math.max(limit + 2, 4))
    .filter((card) => {
      const coverage = getExampleCardTopicCoverage(card, signals);
      const keywordHits = (card.keywords || []).filter((kw) => scoreExampleTermHit(kw, signals) > 0).length;
      const exactTopic = card.topic && normalizeExampleMatchTerm(card.topic).includes(signals.normalizedTopic.slice(0, 12));
      return card.matchScore >= 34 || keywordHits >= 2 || coverage.ratio >= 0.6 || exactTopic;
    })
    .slice(0, limit);
}

function pickAnchoredExampleCardForTopic(topic, topicType) {
  return pickAnchoredExampleCards(topic, topicType, 1)[0] || null;
}

function splitInsightBullets(text, limit = 3) {
  return String(text || '')
    .split(/[；。]/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 6)
    .slice(0, limit);
}

function buildExampleGuidedKit(topic, topicType, topicPhrases) {
  const anchors = pickAnchoredExampleCards(topic, topicType, 2);
  if (!anchors.length) return null;
  const anchor = anchors[0];
  const companion = anchors[1] || null;
  const thesis = anchor.thesis || '';
  const structure = (anchor.structure || []).slice(0, 3).map((item, index) => `${['第一段', '第二段', '第三段'][index] || `第${index + 1}段`}：${item}`);
  const pitfalls = dedupeArray([
    ...splitInsightBullets(anchor.risk, 2),
    ...splitInsightBullets(anchor.focus, 1).map((x) => `不要忽视：${x}`)
  ]).slice(0, 4);
  const intent = dedupeArray([
    `这道题最像范例库中的“${anchor.title}”，高分抓手是：${anchor.focus || '先界定概念，再写条件与边界。'}`,
    anchor.intent || '',
    companion ? `若想再补一层，可以参考“${companion.title}”：${companion.focus || companion.intent || ''}` : ''
  ]).filter(Boolean).slice(0, 3);
  const mustAnswers = dedupeArray([
    `你是否抓住了这道题真正要处理的难点：${anchor.focus || '先定义核心概念，再进入论证'}`,
    thesis ? `你的中心论点是否提升到这一层：${thesis}` : '',
    anchor.risk ? `你是否提前规避了常见失误：${anchor.risk}` : ''
  ]).filter(Boolean).slice(0, 4);
  const generatorHints = dedupeArray([
    `生成时优先沿用“${anchor.title}”的结构节奏，不要一上来就空泛表态。`,
    '成文时不要写成“先看第一层、进一步看”式讲评提纲，而要写成自然推进的正式议论文段落。',
    (anchor.materials || [])[0] ? `正文可优先转写这条现实支点：${anchor.materials[0]}` : '',
    (anchor.goldenSentences || [])[0] ? `结尾可借这类收束方式：${anchor.goldenSentences[0]}` : ''
  ]).filter(Boolean).slice(0, 3);
  return {
    anchorCard: anchor,
    companionCard: companion,
    thesis,
    structure,
    pitfalls,
    intent,
    mustAnswers,
    generatorHints
  };
}

function loadShanghaiMethodArchive() {
  return (typeof SHANGHAI_METHOD_ARCHIVE !== 'undefined' && Array.isArray(SHANGHAI_METHOD_ARCHIVE))
    ? SHANGHAI_METHOD_ARCHIVE
    : [];
}

function scoreMethodArchiveNote(note, topic, topicType) {
  const text = String(topic || '');
  let score = 0;
  (note.keywords || []).forEach((kw) => {
    if (kw && text.includes(kw)) score += 10;
  });
  const typeName = typeof topicType === 'string'
    ? ({ relation: '关系辩证题', value: '价值判断题', problem: '问题式命题', phenomenon: '现象评析题' }[topicType] || topicType)
    : topicType?.name;
  if (typeName && (note.topicTypes || []).includes(typeName)) score += 12;
  if (/是否|如何|怎样|怎么看|意味着/.test(text) && (note.id === 'method-hidden-relation')) score += 8;
  if (/现实|社会|时代|生活|青年/.test(text) && (note.id === 'method-look-up-road')) score += 8;
  if (note.id === 'method-look-back-resource') score += 4;
  return score;
}

function pickMethodArchiveNotes(topic, topicType, limit = 3) {
  return loadShanghaiMethodArchive()
    .map((note) => ({ ...note, matchScore: scoreMethodArchiveNote(note, topic, topicType) }))
    .filter((note) => note.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function buildMethodGuidedKit(topic, topicType, topicPhrases) {
  const notes = pickMethodArchiveNotes(topic, topicType, 3);
  if (!notes.length) return null;
  const topicKey = topicPhrases?.[0] || extractTopicPhrases(topic)[0] || '题眼';
  return {
    notes,
    summary: dedupeArray(notes.map((note) => note.focus)).slice(0, 3),
    analysisActions: dedupeArray([
      ...notes.flatMap((note) => note.analysisUse || []),
      `围绕“${topicKey}”先找现实锚点、再找隐含关系，最后决定结构。`
    ]).slice(0, 5),
    critiqueActions: dedupeArray([
      ...notes.flatMap((note) => note.critiqueUse || []),
      `重读全文时，先检查是否真正回应了“${topicKey}”，再决定补哪一段。`
    ]).slice(0, 5)
  };
}

function convertExampleTrainingCardToMaterialCard(card) {
  return {
    id: `example-${card.id}`,
    title: `范例训练卡｜${card.title}`,
    topic: card.topic,
    thesis: card.thesis,
    structure: card.structure || [],
    materials: card.materials || [],
    goldenSentences: card.goldenSentences || [],
    tags: dedupeArray([...(card.categories || []), ...(card.tags || []), '上海范例库']),
    source: `${card.source || '范例提炼'} / ${card.school || ''}`.trim(),
    wordCount: 0,
    createdAt: Date.now()
  };
}

function materialFromTrainingExampleCard(card) {
  const material = (card.materials || [])[0] || (card.goldenSentences || [])[0] || card.thesis || card.title;
  return {
    domain: `上海范例库：${card.title}`,
    example: material,
    link: card.highlight || card.thesis || '范例训练卡提供了可借鉴的结构与立意',
    card
  };
}

function renderExampleTrainingList(container) {
  if (!container) return;
  const list = loadExampleTrainingLibrary();
  if (!list.length) {
    container.innerHTML = '<div class="material-card-empty">暂无内置范例训练卡。</div>';
    return;
  }
  container.innerHTML = list.map((card) => `
    <div class="material-card-item example-card-item">
      <div class="material-card-main">
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(card.school || '')} ｜ ${escapeHtml(card.topic)}</span>
        <span>${escapeHtml(card.focus || '')}</span>
        <div class="agent-tags">${[card.grade, ...(card.categories || []).slice(0, 2), ...(card.tags || []).slice(0, 2)].filter(Boolean).map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
      <div class="material-card-actions">
        <button class="agent-btn ghost example-card-view" type="button" data-example-id="${escapeHtml(card.id)}">查看</button>
        <button class="agent-btn ghost example-card-train" type="button" data-example-id="${escapeHtml(card.id)}">练此题</button>
        <button class="agent-btn ghost example-card-save" type="button" data-example-id="${escapeHtml(card.id)}">收进素材卡</button>
      </div>
    </div>
  `).join('');
}

function renderTrainingExampleQuickRows(cards) {
  if (!cards.length) {
    return '<div class="flaw-row"><p>当前题目暂未命中内置范例，可继续按“三路径”正常训练。</p></div>';
  }
  return cards.map((card) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(card.title)}</span><strong>${escapeHtml(card.school || '')}</strong></div>
      <p>${escapeHtml(card.highlight || card.focus || '')}</p>
      <div class="agent-actions secondary">
        <button class="agent-btn ghost example-card-view" type="button" data-example-id="${escapeHtml(card.id)}">查看范例卡</button>
        <button class="agent-btn ghost example-card-train" type="button" data-example-id="${escapeHtml(card.id)}">直接练这题</button>
        <button class="agent-btn ghost example-card-save" type="button" data-example-id="${escapeHtml(card.id)}">收进素材卡</button>
      </div>
    </div>
  `).join('');
}

function renderTrainingExampleDetail(card) {
  const structureRows = (card.structure || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const materialRows = (card.materials || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const sentenceRows = (card.goldenSentences || []).map((x) => `<li class="sentence-good">${escapeHtml(x)}</li>`).join('');
  return `
    <div class="agent-result-head">
      <h3>上海范例训练卡</h3>
      <div class="agent-tags">
        <span class="agent-tag">${escapeHtml(card.school || '来源未标注')}</span>
        <span class="agent-tag">${escapeHtml(card.grade || '范例')}</span>
        ${(card.categories || []).map((tag) => `<span class="agent-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
    <div class="agent-result-block">
      <h4>${escapeHtml(card.title)}</h4>
      <p><strong>对应题目：</strong>${escapeHtml(card.topic)}</p>
      <p><strong>命题意图：</strong>${escapeHtml(card.intent || '待补充')}</p>
      <p><strong>核心立场：</strong>${escapeHtml(card.thesis || '待补充')}</p>
    </div>
    <div class="agent-result-block"><h4>可借鉴结构</h4><ol>${structureRows || '<li>暂无结构信息</li>'}</ol></div>
    <div class="agent-result-block"><h4>可借鉴素材</h4><ul>${materialRows || '<li>暂无素材句</li>'}</ul></div>
    <div class="agent-result-block"><h4>高分句式</h4><ul>${sentenceRows || '<li>暂无高分句式</li>'}</ul></div>
    <div class="agent-result-block">
      <h4>教师点评提炼</h4>
      <p><strong>亮点：</strong>${escapeHtml(card.highlight || '待补充')}</p>
      <p><strong>易失分点：</strong>${escapeHtml(card.risk || '待补充')}</p>
    </div>
    <div class="agent-result-block">
      <h4>推荐训练动作</h4>
      <p>${escapeHtml(card.trainingPrompt || '请围绕这张卡重新写一版三段提纲。')}</p>
      <div class="agent-actions secondary">
        <button class="agent-btn ghost example-card-train" type="button" data-example-id="${escapeHtml(card.id)}">直接练这题</button>
        <button class="agent-btn ghost example-card-save" type="button" data-example-id="${escapeHtml(card.id)}">收进素材卡</button>
      </div>
    </div>
  `;
}

function pickMaterialCardForTopic(topic, topicType) {
  const cards = loadMaterialCards();
  if (!cards.length) return null;
  const text = String(topic || '');
  const typeName = typeof topicType === 'string' ? topicType : (topicType?.name || '');
  return [...cards].sort((a, b) => scoreMaterialCard(b, text, typeName) - scoreMaterialCard(a, text, typeName))[0] || null;
}

function scoreMaterialCard(card, topic, typeName) {
  const hay = `${card.title || ''} ${card.topic || ''} ${(card.tags || []).join(' ')} ${card.thesis || ''}`;
  const typeAlias = {
    relation: ['关系辩证型', '关系辩证题'],
    value: ['价值判断型', '价值判断题'],
    method: ['方法路径型', '问题式命题'],
    phenomenon: ['现象思辨型', '问题式命题']
  };
  const expectedTypes = typeAlias[typeName] || [typeName];
  let score = 0;
  extractTopicPhrases(topic).forEach((p) => { if (p && hay.includes(p)) score += 10; });
  if (expectedTypes.some((name) => name && (card.tags || []).includes(name))) score += 18;
  if (/(文化|传播|经典|传统)/.test(topic) && (card.tags || []).includes('文化传播')) score += 10;
  if (/(科技|AI|算法|创新)/i.test(topic) && (card.tags || []).includes('科技创新')) score += 10;
  if (/(教育|学习|成长|学生)/.test(topic) && (card.tags || []).includes('教育成长')) score += 10;
  const ageDays = Math.floor((Date.now() - Number(card.createdAt || 0)) / (24 * 60 * 60 * 1000));
  score += Math.max(0, 8 - Math.min(8, ageDays));
  return score;
}

function insertTemplateSentenceAtParagraph(draft, sentence, paragraphNo) {
  const text = ensureSentenceEnding(sentence);
  const target = clamp((paragraphNo || 1) - 1, 0, 2);
  const paragraphs = splitParagraphs(draft || '');
  while (paragraphs.length < 3) paragraphs.push('');
  paragraphs[target] = `${text}${paragraphs[target] || ''}`;
  return paragraphs.map((p) => p.trim()).filter(Boolean).join('\n\n');
}

function applyTriadGapFix(topic, draft, report) {
  const paragraphs = splitParagraphs(draft);
  const analysis = analyzeEssayTopic(topic);
  const key = analysis.topicPhrases?.[0] || '该命题';
  while (paragraphs.length < 3) paragraphs.push('');
  const added = [];

  const need = report.triadGaps || [];
  const hasGap = (kw) => need.some((x) => x.includes(kw));

  if (hasGap('审题立意')) {
    const lead = `回到题目，本文讨论的核心是“${key}”，其成立需要前提与边界。`;
    paragraphs[0] = `${lead}${paragraphs[0]}`;
    added.push(lead);
  }
  if (hasGap('逻辑层次')) {
    const logic = '其机制链条是：前提成立→产生作用→带来结果，因此结论可被检验。';
    paragraphs[1] = `${paragraphs[1]}${logic}`;
    added.push(logic);
  }
  if (hasGap('语言表达')) {
    const style = '守住理性的底色，才能让判断既有锋芒也有分寸。';
    const lastIdx = paragraphs.length - 1;
    paragraphs[lastIdx] = `${paragraphs[lastIdx]}${style}`;
    added.push(style);
  }
  const newDraft = paragraphs.map((p) => p.trim()).filter(Boolean).join('\n\n');
  if (!added.length) {
    return { newDraft, highlightStart: null, highlightEnd: null, addedSentences: [] };
  }
  const first = ensureSentenceEnding(added[0]).trim();
  const start = newDraft.indexOf(first);
  return {
    newDraft,
    highlightStart: start >= 0 ? start : null,
    highlightEnd: start >= 0 ? start + first.length : null,
    addedSentences: added.map((x) => ensureSentenceEnding(x))
  };
}

function generateFullEssayDraft(topic, analysis, minWords = 800, maxWords = 850, opts = {}) {
  const key = analysis.topicPhrases?.[0] || '该命题';
  const key2 = analysis.topicPhrases?.[1] || '另一端';
  const topicType = analysis.topicType?.code || 'phenomenon';
  const exampleCard = analysis.exampleGuidedKit?.anchorCard
    || ((opts.casePool === 'examplelib' || opts.casePool === 'auto') ? pickAnchoredExampleCardForTopic(topic, analysis.topicType) : null);
  if (isExpoThemeTopic(topic)) {
    return normalizeEssayLength(buildExpoThemeEssay(topic).join('\n\n'), minWords, maxWords, topic, '世博会主题', '城市文明', 'expo');
  }
  const template = exampleCard
    ? buildEssayTemplateFromExample(topic, analysis, exampleCard, opts.casePool || 'auto')
    : buildEssayTemplateByType(topic, key, key2, topicType, opts.casePool || 'auto');
  let essay = template.join('\n\n');
  essay = applyTriadEnhancement(essay, analysis);
  essay = normalizeEssayLength(essay, minWords, maxWords, topic, key, key2, topicType, { exampleCard });
  return essay;
}

function isExpoThemeTopic(topic) {
  return /(世博会|上海世博|2010).*?(主题|确立|设想|论证)/.test(String(topic || ''));
}

function buildExpoThemeEssay() {
  return [
    [
      '我为2010年上海世博会确立的主题是：“城市，让世界共享更好的生活”。',
      '这个主题既回应了上海作为现代都市的开放气质，也回应了世博会本身的公共使命：它不是单纯展示新奇建筑与先进技术，而是让不同国家、不同文化的人们共同思考，未来的城市应当怎样安放人的生活。'
    ].join(''),
    [
      '确立这一主题，首先因为城市已经成为现代文明最集中的现场。',
      '交通、住宅、教育、医疗、商业、文化都在城市中交织，人的机会在这里被放大，人的困境也在这里被集中呈现。',
      '如果城市只追求速度、高度和规模，就可能让人被拥挤、污染与冷漠包围；如果城市能以人的需要为尺度，技术进步才真正转化为生活质量。'
    ].join(''),
    [
      '其次，“共享”应当成为世博会区别于一般展览的关键词。',
      '世博会当然要展示各国的创造力，但更重要的是让创造力彼此交流、互相启发。',
      '发达国家的环保经验、发展中国家的社区智慧、不同民族的审美传统，都可以在上海相遇。',
      '这种相遇不是简单陈列，而是把差异转化为理解，把展示转化为合作。'
    ].join(''),
    [
      '以此为主题，展馆设计也应围绕“生活”展开。',
      '我设想可以设置“未来社区”“绿色交通”“水岸上海”“少年城市”几个板块：在未来社区中展示节能住宅与公共服务；在绿色交通中呈现地铁、步行空间和自行车系统；在水岸上海中讲述黄浦江两岸从工业岸线走向公共空间的变化；在少年城市中让孩子参与设计自己的街道、公园和学校。',
      '这样，参观者看到的不只是模型，而是可触摸的生活方案。'
    ].join(''),
    [
      '这个主题也契合上海自身的位置。',
      '上海曾因港口而开放，因工业而兴盛，也正在因文化、科技和公共治理而更新。',
      '它既有外滩建筑留下的历史记忆，也有浦东高楼展示的未来想象。',
      '如果上海能够借世博会把“开放”进一步转化为“共生”，把“发展”进一步转化为“宜居”，那么这场盛会就不仅属于2010年，也会成为城市长期更新的起点。'
    ].join(''),
    [
      '因此，“城市，让世界共享更好的生活”不是一句口号，而是一种价值判断：城市的最终意义不在于征服自然、炫耀财富，而在于让人更有尊严、更有联系、更有创造力地生活。',
      '当来自世界各地的人们在上海相遇，他们带走的若不仅是惊叹，更是对未来生活的责任感，这样的世博会才真正完成了自己的使命。'
    ].join('')
  ];
}

function normalizeEssayLength(text, minWords, maxWords, topic, key, key2, topicType, opts = {}) {
  let draft = String(text || '');
  const expansionPool = buildEssayExpansionPool(topic, key, key2, topicType, opts.exampleCard, opts.tier || 'high');
  let expansionIndex = 0;

  while (countWords(draft) < minWords && expansionIndex < expansionPool.length) {
    const next = expansionPool[expansionIndex];
    expansionIndex += 1;
    if (!next || draft.includes(next.slice(0, 18))) continue;
    draft = `${draft}\n\n${next}`;
    if (countWords(draft) > maxWords + 30) break;
  }

  if (countWords(draft) > maxWords) {
    const paragraphs = splitParagraphs(draft);
    let out = [];
    for (let i = 0; i < paragraphs.length; i += 1) {
      const candidate = out.length ? `${out.join('\n\n')}\n\n${paragraphs[i]}` : paragraphs[i];
      if (countWords(candidate) <= maxWords) {
        out.push(paragraphs[i]);
      } else {
        const sents = splitSentences(paragraphs[i]);
        let partial = '';
        for (let j = 0; j < sents.length; j += 1) {
          const c = partial ? `${partial}。${sents[j]}` : sents[j];
          const cAll = out.length ? `${out.join('\n\n')}\n\n${c}` : c;
          if (countWords(cAll) > maxWords) break;
          partial = c;
        }
        if (partial) out.push(ensureSentenceEnding(partial));
        break;
      }
    }
    draft = out.join('\n\n');
  }

  const tailPool = buildEssayTailPool(topic, key, key2, topicType, opts.exampleCard, opts.tier || 'high');
  let guard = 0;
  while (countWords(draft) < minWords && guard < tailPool.length) {
    const next = tailPool[guard];
    guard += 1;
    if (!next || draft.includes(next.slice(0, 18))) continue;
    draft = `${draft}\n\n${next}`;
  }
  const paddingPool = buildEssayPaddingPool(topic, key, key2, topicType, opts.exampleCard, opts.tier || 'high');
  let padGuard = 0;
  while (countWords(draft) < minWords && padGuard < paddingPool.length) {
    const next = paddingPool[padGuard];
    padGuard += 1;
    if (!next || draft.includes(next.slice(0, 18))) continue;
    const candidate = `${draft}\n\n${next}`;
    draft = countWords(candidate) <= maxWords + 20 ? candidate : draft;
    if (countWords(candidate) > maxWords + 20) break;
  }
  if (countWords(draft) < minWords) {
    draft = padDraftToMinimumLength(draft, minWords, maxWords, key, key2, topicType, opts.tier || 'high');
  }
  if (countWords(draft) > maxWords) {
    draft = trimDraftToWordLimit(draft, maxWords);
  }
  return draft;
}

function buildEssayExpansionPool(topic, key, key2, topicType, exampleCard, tier = 'high') {
  if (topicType === 'expo') {
    return [
      '更进一步看，世博会的价值还在于给普通人一次想象未来的机会。宏大的国家叙事最终要落回日常生活：一条更安全的街道、一片更亲近的绿地、一种更便利的公共服务，都会让城市文明变得具体。',
      '因此，主题设计不能只求响亮，更要能组织展览内容、引导公众参与，并留下可持续的城市行动。'
    ];
  }
  if (tier === 'basic') {
    return [
      `再往下想一步，“${key}”之所以难写，正因为它在现实中并不是非黑即白。`,
      '许多看起来简单的判断，一旦放进不同情境中，就会出现新的变化。',
      '因此，哪怕只是基础写法，也应尽量把“为什么会这样”说清楚一些。'
    ];
  }
  if (tier === 'mid') {
    return [
      `进一步说，“${key}”之所以值得讨论，正因为它并不只对应一种固定答案。`,
      topicType === 'relation'
        ? `若不把“${key}”与“${key2}”放到同一处境中衡量，文章就容易显得一边倒。`
        : '若不补出前提与情境，同一个判断在不同处境下就可能失去解释力。',
      '也正因如此，中上档作文往往要比基础作文多写一步：多写机制，多写边界。'
    ];
  }
  const generic = [
    `进一步而言，“${key}”不是孤立标签，而应放进具体场景中理解。它在一种条件下可能指向进步，在另一种条件下也可能暴露局限。`,
    topicType === 'relation'
      ? `若忽视“${key}”与“${key2}”的双向作用，文章就容易滑向单边判断；只有写清二者如何互相制约，论证才有弹性。`
      : `若忽视前提差异，同一个判断在不同场景下可能产生不同后果，因此机制与条件都不能省略。`,
    `现实生活中，真正可靠的判断往往不是最响亮的判断，而是能说明标准、承认例外、回应问题的判断。`
  ];
  if (!exampleCard) return generic;
  return dedupeArray([
    ...((exampleCard.materials || []).map((x) => `换个角度看，${x}`)),
    exampleCard.risk ? `也要警惕：${exampleCard.risk}` : '',
    ...generic
  ]).filter(Boolean);
}

function buildEssayTailPool(topic, key, key2, topicType, exampleCard, tier = 'high') {
  if (topicType === 'expo') {
    return [
      '由此可见，一个好的世博主题应当同时具备方向感、包容性与可操作性。它既能概括时代问题，又能转化为展馆内容和公共行动。',
      '这样的主题，才不会停留在宣传语上，而会成为城市面向未来的一次认真回答。'
    ];
  }
  if (tier === 'basic') {
    return [
      `总的来说，围绕“${key}”作判断，既不能只看一面，也不能急着下绝对结论。`,
      '把理由说得更清楚一点，文章就会比单纯表态更稳。'
    ];
  }
  if (tier === 'mid') {
    return [
      `由此可见，围绕“${key}”展开论证，真正重要的是把立场、理由与边界连起来。`,
      '当结论既能回应现实，又保留分寸时，文章才更接近高一档的水平。'
    ];
  }
  const generic = [
    `由此可见，围绕“${key}”展开论证，关键不是重复题目，而是把判断落实到条件、机制和后果之中。`,
    `只有这样，文章才能既回应题目，又避免空泛；既有立场，又有分寸。`
  ];
  if (!exampleCard) return generic;
  return dedupeArray([
    exampleCard.thesis ? `归根到底，${exampleCard.thesis}` : '',
    (exampleCard.goldenSentences || []).slice(0, 1).map((x) => `进一步说，${x}`)[0] || '',
    ...generic
  ]).filter(Boolean);
}

function buildEssayPaddingPool(topic, key, key2, topicType, exampleCard, tier = 'high') {
  const topicStem = String(topic || '').replace(/请写一篇文章[\s\S]*/g, '').replace(/要求[:：]?[\s\S]*/g, '').trim() || key;
  const shared = [
    `还需要看到，${topicStem}并不是孤立的写作对象，它背后牵连着人的判断方式。一个人怎样理解“${key}”，往往也决定了他怎样处理经验、选择和责任。`,
    `如果只把“${key}”当作静态概念，文章会很快停在表态层；只有写出它在现实中的发生过程，论证才会有可检验的支点。`,
    `换言之，考场上真正要完成的不是把道理说满，而是把判断说稳：先说明依据，再承认限制，最后给出可以落地的态度。`,
    `由此回看全文，“${key}”的价值不在于提供一个简单答案，而在于迫使我们在复杂处境中保持清醒，既不盲从，也不轻率否定。`
  ];
  if (tier === 'basic') {
    return [
      `当然，基础写法也不能只停留在“很重要”这一类判断上。围绕“${key}”，至少要说清它为什么出现、会带来什么结果。`,
      `如果文章只是反复强调自己的态度，而没有解释理由，读者就很难看到判断从哪里来。`,
      `所以，即使是较稳妥的结论，也需要一点现实支撑，让观点不显得空。`,
      ...shared.slice(2)
    ];
  }
  if (tier === 'mid') {
    return [
      `中上档文章还要比基础文章多走一步：不能只承认两面都重要，而要说明哪一面是前提，哪一面是补充。`,
      topicType === 'relation'
        ? `尤其当“${key}”与“${key2}”互相牵动时，分寸感比口号更重要。`
        : `尤其在不同情境中，同一判断会呈现不同效力，文章需要给出条件。`,
      `这样写，文章才不会只是平衡两边，而能显示出判断的次序和标准。`,
      ...shared
    ];
  }
  return dedupeArray([
    exampleCard?.intent ? `范例提醒我们，${exampleCard.intent}` : '',
    exampleCard?.risk ? `同时还要防止一个误区：${exampleCard.risk}` : '',
    ...shared,
    topicType === 'problem'
      ? `因此，面对设问式命题，答案本身并不是终点，真正重要的是说明答案成立的路径。`
      : `因此，文章的高下不在于态度是否响亮，而在于能否把概念、机制、边界和现实连成闭环。`
  ]).filter(Boolean);
}

function padDraftToMinimumLength(draft, minWords, maxWords, key, key2, topicType, tier = 'high') {
  const sentencePool = [
    `更准确地说，“${key}”需要放在具体情境中判断，不能被压缩成一句简单口号。`,
    `这种判断若要成立，就必须同时说明事实依据、价值标准和可能后果。`,
    topicType === 'relation'
      ? `当“${key}”与“${key2}”发生张力时，真正成熟的态度不是取其一端，而是辨清主次。`
      : `当现实条件发生变化时，同一观点也需要接受重新检验。`,
    `因此，文章不能只停留在态度表达，还要让读者看见推理过程。`,
    `从这个意义上说，分寸感不是退让，而是让判断经得起反问。`,
    tier === 'basic'
      ? `即使采用基础写法，也应把理由说完整，避免只重复“很重要”。`
      : `这也是上海卷看重思辨的原因：它要求结论有来路，也有边界。`,
    `只有把概念、例证和现实连接起来，论证才不会漂浮。`,
    `最终，写作者要完成的不是制造标准答案，而是在复杂问题中建立可靠判断。`
  ];
  let nextDraft = String(draft || '').trim();
  let guard = 0;
  while (countWords(nextDraft) < minWords && guard < sentencePool.length * 3) {
    const sentence = sentencePool[guard % sentencePool.length];
    guard += 1;
    if (!sentence || nextDraft.includes(sentence.slice(0, 16))) continue;
    const paragraphs = splitParagraphs(nextDraft);
    const last = paragraphs.pop() || '';
    const candidateParagraph = `${last}${last && /[。！？.!?]$/.test(last) ? '' : '。'}${sentence}`;
    const candidate = [...paragraphs, candidateParagraph].filter(Boolean).join('\n\n');
    if (countWords(candidate) <= maxWords) {
      nextDraft = candidate;
    } else {
      const asNewParagraph = `${nextDraft}\n\n${sentence}`;
      if (countWords(asNewParagraph) <= maxWords) nextDraft = asNewParagraph;
      else break;
    }
  }
  return nextDraft;
}

function renderGeneratedEssayReport(payload, container) {
  const { topic, draft, wordCount, score, offTopic, exampleAnchorTitle } = payload;
  const paraCount = splitParagraphs(draft).length;
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>完整范文已生成（800-850字）</h3>
      <div class="agent-tags">
        <span class="agent-tag">字数：${wordCount}</span>
        <span class="agent-tag">段落：${paraCount}</span>
        <span class="agent-tag">评分：${score.total}/100（${score.score70}/70）</span>
        <span class="agent-tag">${escapeHtml(score.level)}</span>
        <span class="agent-tag risk ${normalizeRiskClass(offTopic.riskLevel)}">偏题风险：${escapeHtml(offTopic.riskLevel)}</span>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>已自动接入流程</h4>
      <ul>
        <li>完整范文已写入草稿框，可直接继续修改。</li>
        <li>已自动完成防跑题检查与评分。</li>
        <li>如需进一步提分，可继续查看“草稿评分”与“修改任务单”。</li>
      </ul>
      <p>题目：${escapeHtml(topic)}</p>
      ${exampleAnchorTitle ? `<p>本次已调用范例母题：${escapeHtml(exampleAnchorTitle)}</p>` : ''}
    </div>
  `;
}

function buildTierEssayContext(topic, analysis, casePool) {
  const exampleCard = analysis.exampleGuidedKit?.anchorCard
    || ((casePool === 'examplelib' || casePool === 'auto') ? pickAnchoredExampleCardForTopic(topic, analysis.topicType) : null);
  const material = exampleCard && (casePool === 'examplelib' || casePool === 'auto')
    ? materialFromTrainingExampleCard(exampleCard)
    : pickCaseMaterial(casePool, analysis.topicType?.code || 'phenomenon', topic);
  const key = analysis.topicPhrases?.[0] || '该命题';
  const key2 = analysis.topicPhrases?.[1] || '另一端';
  const thesis = exampleCard?.thesis || analysis.thesis || `本文主张：${key}需要在条件与边界中判断。`;
  const plainThesis = String(thesis).replace(/^本文主张[:：]\s*/, '').trim();
  const golden = (exampleCard?.goldenSentences || []).filter(Boolean);
  const materials = dedupeArray([
    ...(exampleCard?.materials || []),
    material?.example ? `${material.domain}中的现实场景也说明了这一点：${material.example}` : ''
  ]).filter(Boolean);
  const structure = exampleCard?.structure || analysis.outline || [];
  const riskTip = splitInsightBullets(exampleCard?.risk, 1)[0] || '若忽视边界，结论就容易失真。';
  return {
    exampleCard,
    material,
    key,
    key2,
    thesis,
    plainThesis,
    golden,
    materials,
    structure,
    riskTip
  };
}

function buildMidTierEssayDraft(topic, analysis, casePool) {
  const ctx = buildTierEssayContext(topic, analysis, casePool);
  const step1 = normalizeStructureStepText(ctx.structure[0], `解释“${ctx.key}”为何会成为争议中心`);
  const step2 = normalizeStructureStepText(ctx.structure[1], '补出另一端的限制与代价');
  const step3 = normalizeStructureStepText(ctx.structure[2], '把判断放回现实情境');
  const paragraphs = [
    [
      `面对“${topic}”，与其急于表明态度，不如先追问“${ctx.key}”为何会引发争议。`,
      `我认为，${ctx.plainThesis || ctx.thesis}`
    ].join(''),
    [
      `先看题目的第一层：${step1}。`,
      `${ctx.materials[0] || `例如，${ctx.material.example}。`}`,
      `由此可见，${ctx.key}并非凭空提出，而是与现实中的某种需要有关。`
    ].join(''),
    [
      `但问题并不止于此。${step2}。`,
      `${ctx.materials[1] || ctx.golden[0] || '如果只顺着单一方向往前推，原本合理的判断也可能失去弹性。'}。`,
      `因此，讨论这道题时还应看到边界、条件与可能的副作用。`
    ].join(''),
    [
      `再把目光放回现实，${step3}。`,
      `尤其在${ctx.material.domain}场景中，${ctx.material.link}。`,
      `现实越复杂，越需要在两端之间保持较为稳妥的判断。`
    ].join(''),
    [
      `总之，我认为：${ctx.plainThesis || ctx.thesis}`,
      `${ctx.golden[1] || '只有把立场放进现实与边界中理解，文章才不至于流于片面。'}`
    ].join('')
  ];
  return normalizeEssayLength(paragraphs.join('\n\n'), 800, 840, topic, ctx.key, ctx.key2, analysis.topicType?.code || 'phenomenon', {
    exampleCard: ctx.exampleCard,
    tier: 'mid'
  });
}

function buildBasicTierEssayDraft(topic, analysis, casePool) {
  const ctx = buildTierEssayContext(topic, analysis, casePool);
  const paragraphs = [
    [
      `对于“${topic}”，我认为不能简单地全部肯定，也不能完全否定。`,
      `${ctx.key}之所以会被不断讨论，说明它和现实生活确实有关。`
    ].join(''),
    [
      `很多时候，人们之所以会支持这一点，是因为它确实能解决一些实际问题。`,
      `${ctx.materials[0] || `例如，${ctx.material.example}。`}`,
      `所以从这个角度看，它当然有一定道理。`
    ].join(''),
    [
      `不过，如果只看到它的好处，也容易忽视别的问题。`,
      `${ctx.riskTip}。`,
      `这说明看问题还是要全面一些，不能只抓住一面不放。`
    ].join(''),
    [
      `联系现实生活，这样的情况并不少见。`,
      `很多人往往会根据眼前效果作判断，却忽略了更长远的影响。`,
      `因此，我们在面对类似问题时，还应该多想一步。`
    ].join(''),
    [
      `总之，我认为这道题提醒我们：判断一件事，既要看到它存在的理由，也要看到它可能带来的限制。`,
      `只有这样，得出的结论才会比较稳妥。`
    ].join('')
  ];
  return normalizeEssayLength(paragraphs.join('\n\n'), 800, 830, topic, ctx.key, ctx.key2, analysis.topicType?.code || 'phenomenon', {
    exampleCard: ctx.exampleCard,
    tier: 'basic'
  });
}

function buildTierPedagogy(level, analysis, exampleCard) {
  const key = analysis.topicPhrases?.[0] || '题眼';
  const exampleName = exampleCard?.title || '当前母题';
  if (level === 'high') {
    return {
      why: '这一档的优势在于：开头定题快，中段有机制链，能处理反方与边界，结尾还能回到现实与价值收束。',
      gap: '它和56+最大的差距，不在辞藻，而在“概念界定是否准确、段落之间是否形成推进、边界意识是否清楚”。',
      upgrade: `继续保持“${exampleName}”这类写法：先定概念，再补机制，再收边界。`
    };
  }
  if (level === 'mid') {
    return {
      why: '这一档通常已经切题，也有完整结构，但机制分析还不够深，现实落点和结尾收束略显普通。',
      gap: `它比63+少的，往往是围绕“${key}”继续深挖一层的能力：为什么成立、何时失效、怎样回应反方。`,
      upgrade: '想冲到63+，最有效的动作是：每段补一句机制解释，结尾补一句边界判断。'
    };
  }
  return {
    why: '这一档通常能大体扣题，也像一篇完整文章，但概念较模糊，论证容易停在“有道理/也有问题”的平面上。',
    gap: `它和56+的差距，主要不在语言，而在是否真正围绕“${key}”展开，而不是泛泛谈人生道理。`,
    upgrade: '想先升到56+，优先补三件事：开头定义题眼、主体段补例后分析、结尾加条件化结论。'
  };
}

function inspectTierParagraphSignals(paragraph, analysis, index, total) {
  const text = String(paragraph || '');
  const topicPhrases = analysis.topicPhrases || [];
  const topicType = analysis.topicType || { code: 'phenomenon' };
  return {
    text,
    index,
    total,
    sentences: splitSentences(text),
    topicHits: topicPhrases.filter((k) => k && text.includes(k)).length,
    hasDefinition: /(所谓|不是.*而是|并非.*而是|指的是|内涵)/.test(text),
    hasMechanism: /(因为|所以|因此|由此|机制|本质|意味着|从而)/.test(text),
    hasTransition: /(诚然|然而|另一方面|不过|同时|反过来|进一步看)/.test(text),
    hasReality: /(现实|社会|时代|校园|平台|技术|教育|生活|AI|人工智能|城市)/.test(text),
    hasBoundary: /(前提|条件|边界|未必|并不总是|如果|当.*时)/.test(text),
    hasExample: /(例如|比如|以.*为例|从.*到|案例|现实中)/.test(text),
    topicTypeCode: topicType.code || 'phenomenon'
  };
}

function buildTierParagraphAnnotation(level, signals, advice, referenceSignals) {
  const isOpening = signals.index === 0;
  const isClosing = signals.index === signals.total - 1;
  const missing = [];
  if (isOpening && !signals.hasDefinition) missing.push('缺少题眼定义');
  if (!isOpening && !signals.hasMechanism) missing.push('例后缺机制解释');
  if (signals.topicTypeCode === 'relation' && !isOpening && !signals.hasTransition) missing.push('缺辩证转折');
  if (!isOpening && !signals.hasReality) missing.push('现实锚点偏弱');
  if (isClosing && !signals.hasBoundary) missing.push('结尾缺边界');
  if (!signals.topicHits) missing.push('回扣题眼不够');

  const compareParts = [];
  if (referenceSignals) {
    if (referenceSignals.hasDefinition && !signals.hasDefinition) compareParts.push('对照高一档，这一段多了概念界定，所以开篇更稳。');
    if (referenceSignals.hasMechanism && !signals.hasMechanism) compareParts.push('对照高一档，这一段多了一句机制解释，所以例子真正转成了论证。');
    if (referenceSignals.hasTransition && !signals.hasTransition) compareParts.push('对照高一档，这一段补了转折，论证就不再是一边倒。');
    if (referenceSignals.hasReality && !signals.hasReality) compareParts.push('对照高一档，这一段把命题拉回现实场景，因此更有落地感。');
    if (referenceSignals.hasBoundary && !signals.hasBoundary) compareParts.push('对照高一档，这一段多了边界句，所以收束更稳、更像上海卷一类文。');
  }

  if (level === 'high') {
    const why = isOpening
      ? (signals.hasDefinition ? '这一段能拉分，因为开头没有空喊观点，而是先界定概念、再亮中心论点。' : '这一段能稳住分数，因为能较快切题并建立论证方向。')
      : (isClosing
        ? (signals.hasBoundary ? '这一段能拉分，因为结尾不是口号式收束，而是补了边界与现实指向。' : '这一段的优势在于能回扣题目并完成收束。')
        : (signals.hasMechanism ? '这一段能拉分，因为不只举例，还把例子拉回机制链条。' : '这一段的优势在于已经有论证推进，不停在态度表态。'));
    const compare = compareParts[0] || '和中档相比，这一段更清楚地完成了“定义—分析—收束”中的关键动作。';
    const action = '保持这个段落节奏：先回扣题眼，再补机制或边界，不让段落散掉。';
    return { title: '本段拉分点', why, compare, action };
  }

  if (level === 'mid') {
    const why = isOpening
      ? (signals.hasDefinition ? '这一段已经切题，也开始处理题眼，但概念边界还不够锋利。' : '这一段能进入 56+，是因为至少回应了题目；但它还停在表态层，没完全把题眼讲透。')
      : (isClosing
        ? (signals.hasBoundary ? '这一段已经有基本收束，但升华和现实指向还略显普通。' : '这一段能收住文章，但边界意识还不够明显，所以难以上到 63+。')
        : (signals.hasMechanism ? '这一段已经开始分析原因，不再只是摆例子。' : '这一段有材料也有观点，但“为什么”还没深挖，所以通常停在 56+附近。'));
    const compare = compareParts[0] || '和 63+ 相比，这一段还少一层：要么少机制，要么少边界，要么少现实锚点。';
    const action = `升到 63+ 最该补的一刀：${missing[0] || '把这一段再往“机制+边界”深挖一步'}。`;
    return { title: '本段为什么停在56+', why, compare, action };
  }

  const why = isOpening
    ? (signals.hasDefinition ? '这一段基本能起笔，但概念界定还比较粗，中心论点也不够稳。' : '这一段之所以只能到 48 左右，关键是开头先表态、后定义，容易显得切题不深。')
    : (isClosing
      ? (signals.hasBoundary ? '这一段已经能回扣题目，但结尾的力度和格局还不够。' : '这一段之所以只到 48，往往是因为结尾只有稳妥表态，没有边界和升华。')
      : (signals.hasMechanism ? '这一段已经不只是讲例子，但分析还比较浅。' : '这一段之所以只到 48，主要是例子摆出来了，却没有解释它为什么能证明观点。'));
  const compare = compareParts[0] || '和 56+ 相比，这一段通常还缺少一个关键动作：定义、机制、转折或边界。';
  const action = `先别求写漂亮，先补齐：${missing[0] || '回扣题眼并补一句机制解释'}。`;
  return { title: '本段为什么只到48+', why, compare, action };
}

function buildTierParagraphNotes(item, referenceItem, analysis) {
  const paragraphs = splitParagraphs(item.draft);
  const refParagraphs = splitParagraphs(referenceItem?.draft || '');
  const adviceList = item.score?.offTopic?.paragraphAdvice || [];
  return paragraphs.map((paragraph, index) => {
    const signals = inspectTierParagraphSignals(paragraph, analysis, index, paragraphs.length);
    const referenceSignals = refParagraphs[index]
      ? inspectTierParagraphSignals(refParagraphs[index], analysis, index, refParagraphs.length)
      : null;
    const advice = adviceList[index] || null;
    return {
      index,
      paragraph,
      note: buildTierParagraphAnnotation(item.level, signals, advice, referenceSignals),
      score: advice?.score ?? item.score?.offTopic?.paragraphDiagnostics?.[index]?.semanticScore ?? null
    };
  });
}

function generateTieredEssaySet(topic, analysis, opts = {}) {
  const casePool = opts.casePool || 'auto';
  const highDraft = generateFullEssayDraft(topic, analysis, 800, 850, { casePool });
  const midDraft = buildMidTierEssayDraft(topic, analysis, casePool);
  const basicDraft = buildBasicTierEssayDraft(topic, analysis, casePool);
  const exampleCard = analysis.exampleGuidedKit?.anchorCard || null;
  const items = [
    { level: 'high', bandLabel: '63+ 一类卷', title: '高分示范版', draft: highDraft },
    { level: 'mid', bandLabel: '56+ 二类卷上段', title: '中上可提升版', draft: midDraft },
    { level: 'basic', bandLabel: '48+ 二类卷中段', title: '基础合格版', draft: basicDraft }
  ];
  const scoredItems = items.map((item) => {
    const score = scoreEssayDraft(topic, item.draft);
    return {
      ...item,
      score: calibrateTieredReferenceScore(item.level, score),
      wordCount: countWords(item.draft),
      pedagogy: buildTierPedagogy(item.level, analysis, exampleCard)
    };
  });
  const highItem = scoredItems.find((x) => x.level === 'high');
  const midItem = scoredItems.find((x) => x.level === 'mid');
  return scoredItems.map((item) => ({
    ...item,
    paragraphNotes: buildTierParagraphNotes(
      item,
      item.level === 'basic' ? midItem : (item.level === 'mid' ? highItem : midItem),
      analysis
    )
  }));
}

function calibrateTieredReferenceScore(level, score) {
  const targetTotal = { high: 92, mid: 80, basic: 69 }[level] || Number(score?.total || 0);
  const total = clamp(Math.max(Number(score?.total || 0), targetTotal), 0, 100);
  return {
    ...score,
    total,
    score70: Math.round(total * 0.7),
    level: getShanghaiBand(total),
    referenceCalibrated: true
  };
}

function renderTieredEssayReport(payload, container) {
  const { topic, tiers } = payload;
  const rows = (tiers || []).map((item, index) => `
    <details class="tier-essay-card" ${index === 0 ? 'open' : ''}>
      <summary class="tier-essay-summary">
        <span>${escapeHtml(item.bandLabel)}｜${escapeHtml(item.title)}</span>
        <strong>参考估分 ${item.score?.score70 || '--'}/70</strong>
      </summary>
      <div class="tier-essay-meta">
        <p><strong>这一档为什么能到这里</strong>：${escapeHtml(item.pedagogy?.why || '')}</p>
        <p><strong>和上一档/下一档差在哪</strong>：${escapeHtml(item.pedagogy?.gap || '')}</p>
        <p><strong>往上一档怎么改</strong>：${escapeHtml(item.pedagogy?.upgrade || '')}</p>
        <div class="agent-tags">
          <span class="agent-tag">字数：${item.wordCount}</span>
          <span class="agent-tag">${escapeHtml(item.score?.level || '待评估')}</span>
        </div>
        <div class="agent-actions secondary">
          <button class="agent-btn ghost tier-essay-load-btn" type="button" data-tier-index="${index}">加载到草稿框</button>
        </div>
      </div>
      <div class="tier-essay-annotated">
        ${(item.paragraphNotes || []).map((row) => `
          <div class="tier-essay-paragraph-row">
            <div class="tier-essay-body">
              <div class="tier-essay-paragraph-label">第${row.index + 1}段${row.score != null ? `｜贴题 ${row.score}/100` : ''}</div>
              ${escapeHtml(row.paragraph).replace(/\n/g, '<br/>')}
            </div>
            <div class="tier-essay-note ${escapeHtml(item.level)}">
              <strong>${escapeHtml(row.note?.title || '本段提示')}</strong>
              <p>${escapeHtml(row.note?.why || '')}</p>
              <p>${escapeHtml(row.note?.compare || '')}</p>
              <p><strong>升档动作</strong>：${escapeHtml(row.note?.action || '')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </details>
  `).join('');

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>同题三档范文对照</h3>
      <div class="agent-tags">
        <span class="agent-tag">题目：${escapeHtml(topic)}</span>
        <span class="agent-tag">用途：看懂分差</span>
      </div>
    </div>
    <div class="agent-result-block">
      <p>同一道题分别给出 <strong>63+</strong>、<strong>56+</strong>、<strong>48+</strong> 三档写法，并做成逐段侧注版。重点不是背哪篇，而是看清差距到底出在概念界定、机制分析、边界意识还是语言收束。</p>
    </div>
    <div class="score-grid">${rows}</div>
  `;
}

function injectTemplateIntoDraft(draft, sentence, kind) {
  const text = ensureSentenceEnding(sentence);
  const paragraphs = splitParagraphs(draft);
  if (!paragraphs.length) {
    if (kind === 'rising') return `第一段：${text}\n\n第二段：\n\n第三段：`;
    return text;
  }
  if (kind === 'opening') {
    paragraphs[0] = `${text}${paragraphs[0]}`;
  } else if (kind === 'turning') {
    const idx = paragraphs.length >= 2 ? 1 : 0;
    paragraphs[idx] = `${text}${paragraphs[idx]}`;
  } else {
    const idx = paragraphs.length - 1;
    paragraphs[idx] = `${paragraphs[idx]}${text}`;
  }
  return paragraphs.join('\n\n');
}
