// Essay diagnosis, Shanghai scoring, teacher reports, and regression checks.
const TRAINING_SCORE_MAX_70 = 65;

const OB_SHANGHAI_SCORE_STANDARD = {
  source: 'OB《上海高考作文评分标准》',
  bands: {
    class1: {
      key: 'class1',
      label: '一类卷（63-70分）',
      min: 63,
      max: 70,
      baseline: 67,
      rule: '准确理解材料，立意深刻，中心突出，内容充实，结构严谨，有文采，论证层次丰富。'
    },
    class2: {
      key: 'class2',
      label: '二类卷（52-62分）',
      min: 52,
      max: 62,
      baseline: 57,
      rule: '符合题意，中心明确，内容较充实，结构完整，语言通顺。'
    },
    class3: {
      key: 'class3',
      label: '三类卷（39-51分）',
      min: 39,
      max: 51,
      baseline: 45,
      rule: '基本符合题意，中心尚明确，内容尚充实，结构基本完整，语言基本通顺。'
    },
    class4: {
      key: 'class4',
      label: '四类卷（21-38分）',
      min: 21,
      max: 38,
      baseline: 29,
      rule: '偏离题意，立意或选材不当，中心不明确，内容单薄，结构不够完整，语言欠通顺。'
    },
    class5: {
      key: 'class5',
      label: '五类卷（20分以下）',
      min: 0,
      max: 20,
      baseline: 14,
      rule: '脱离题意、文理不通，或全文不足400字。'
    }
  },
  secondClassLanes: {
    upper: {
      key: 'upper',
      label: '二类上（59-62分）',
      min: 59,
      max: 62,
      baseline: 60,
      rule: '有灵气、有新意，但在思想内容、行文结构、语言表达等某一方面有不足。'
    },
    middle: {
      key: 'middle',
      label: '二类中（55-58分）',
      min: 55,
      max: 58,
      baseline: 57,
      rule: '基本符合总体标准；有独特思考但某一方面有缺陷，或新意不够但平稳充实。'
    },
    lower: {
      key: 'lower',
      label: '二类下（52-54分）',
      min: 52,
      max: 54,
      baseline: 53,
      rule: '符合题意，中心明确，但论证、结构或语言较平。'
    }
  },
  penalties: {
    noTitle: 2,
    typoEvery: 3,
    typoMax: 5,
    under600Cap: 36,
    under400Class5: true
  },
  notes: {
    class1: '议论文进一类，通常要么思想深刻、结构严谨、语言较好，要么角度独特且整体完成度高。',
    class2: '二类卷不是“好作文”，而是比较合格的过关作文。',
    general: '先定档，再在档内给分；OB高分范文只用于校准，不直接替代阅卷标准。',
    research: '参考谢圆梦《高考网络化评卷模式下作文评分标准的研究》：网络化评卷需要更细化、分文体、可复核的评分标准，并通过双评/三评控制误差。'
  }
};

const SHANGHAI_SCORE_CALIBRATION_ANCHORS = [
  {
    id: 'class1-upper-ob',
    label: '一类上锚点：思想深度与结构节奏都成立',
    bandKey: 'class1',
    expectedScore: 68,
    tolerance: 4,
    profile: {
      topicAccuracy: 84,
      thoughtDepth: 88,
      thesisStable: 76,
      logicStrength: 82,
      structureStable: 82,
      languageStable: 76,
      materialFit: 72,
      fullness: 96,
      innovation: 82
    },
    note: '适合校准“老师下水文/OB一类文被规则误压”的情况。'
  },
  {
    id: 'class1-entry',
    label: '一类入口锚点：扣题稳定且有边界反思',
    bandKey: 'class1',
    expectedScore: 63,
    tolerance: 4,
    profile: {
      topicAccuracy: 80,
      thoughtDepth: 82,
      thesisStable: 68,
      logicStrength: 76,
      structureStable: 74,
      languageStable: 66,
      materialFit: 66,
      fullness: 92,
      innovation: 74
    },
    note: '适合校准“能进一类但语言或素材不算拔尖”的作文。'
  },
  {
    id: 'class2-upper',
    label: '二类上锚点：合格完整，有局部新意',
    bandKey: 'class2',
    expectedScore: 60,
    tolerance: 4,
    profile: {
      topicAccuracy: 72,
      thoughtDepth: 68,
      thesisStable: 64,
      logicStrength: 66,
      structureStable: 66,
      languageStable: 62,
      materialFit: 58,
      fullness: 88,
      innovation: 64
    },
    note: '适合校准“基本会写、但还没有一类深度”的作文。'
  },
  {
    id: 'class2-middle',
    label: '二类中锚点：符合题意，平稳过关',
    bandKey: 'class2',
    expectedScore: 56,
    tolerance: 4,
    profile: {
      topicAccuracy: 64,
      thoughtDepth: 58,
      thesisStable: 58,
      logicStrength: 58,
      structureStable: 60,
      languageStable: 58,
      materialFit: 52,
      fullness: 84,
      innovation: 54
    },
    note: '适合校准“中心明确、论证较平”的普通过关卷。'
  },
  {
    id: 'class3-upper',
    label: '三类上锚点：基本符合题意但展开不足',
    bandKey: 'class3',
    expectedScore: 48,
    tolerance: 5,
    profile: {
      topicAccuracy: 50,
      thoughtDepth: 44,
      thesisStable: 44,
      logicStrength: 42,
      structureStable: 48,
      languageStable: 48,
      materialFit: 42,
      fullness: 72,
      innovation: 38
    },
    note: '适合校准“能碰题但中心轴不稳、例后分析少”的作文。'
  },
  {
    id: 'class4',
    label: '四类锚点：偏离题意或内容空转',
    bandKey: 'class4',
    expectedScore: 31,
    tolerance: 6,
    profile: {
      topicAccuracy: 30,
      thoughtDepth: 24,
      thesisStable: 24,
      logicStrength: 22,
      structureStable: 34,
      languageStable: 38,
      materialFit: 24,
      fullness: 56,
      innovation: 20
    },
    note: '适合校准“写得像文章但没抓材料核心”的作文。'
  }
];

function runOffTopicCheck(topic, draft) {
  const topicType = detectTopicType(topic);
  const topicPhrases = extractTopicPhrases(topic);
  const reviewInfo = getReviewDraftInfo(topic, draft);
  const reviewDraft = reviewInfo.draft;
  const scoringDraft = [reviewInfo.titleHint, reviewDraft].filter(Boolean).join('\n\n');
  const paragraphs = splitParagraphs(reviewDraft);
  const lower = reviewDraft.toLowerCase();
  const matched = topicPhrases.filter((p) => lower.includes(p.toLowerCase()));
  const missed = topicPhrases.filter((p) => !lower.includes(p.toLowerCase()));
  const coverageMatrix = buildTopicEyeCoverageMatrix({ topic, topicType, topicPhrases, paragraphs });

  const diagnostics = paragraphs.map((p, i) => {
    const hits = topicPhrases.filter((k) => p.toLowerCase().includes(k.toLowerCase()));
    const matrixRow = coverageMatrix.rows[i];
    const lexicalScore = clamp(Math.round((hits.length / Math.max(topicPhrases.length, 1)) * 100), 0, 100);
    const score = matrixRow ? Math.max(lexicalScore, matrixRow.score) : lexicalScore;
    return {
      index: i,
      semanticScore: score,
      level: score >= 70 ? '良好' : (score >= 45 ? '可改进' : '偏题风险'),
      matchedTopicPhrases: hits,
      role: matrixRow?.role || inferParagraphRole(i, paragraphs.length),
      evidenceSentence: matrixRow?.evidenceSentence || '',
      missing: matrixRow?.missing || []
    };
  });

  const weak = diagnostics.filter((x) => x.level === '偏题风险').length;
  const scaffold = buildOffTopicScaffold({ topic, draft: reviewDraft, topicType, topicPhrases, paragraphs });
  const precision = buildPrecisionChecks({ topic, draft: reviewDraft, topicType, topicPhrases, paragraphs, diagnostics });
  const baseRiskPoints = (missed.length * 8) + (weak * 10) + (paragraphs.length < 3 ? 10 : 0);
  const qualityScore = Math.round(
    (scaffold.dimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(scaffold.dimensions.length, 1)) * 0.72
      + (100 - baseRiskPoints) * 0.28
  );
  const precisionPenalty = Math.round((100 - precision.avgScore) * 0.18);
  const semanticBridgeScore = buildTopicSemanticBridgeScore(topic, scoringDraft, topicPhrases);
  const expertSignals = assessExpertEssaySignals(topic, scoringDraft, { topicType, topicPhrases, semanticBridgeScore });
  let riskScore = clamp(qualityScore - precisionPenalty + Math.round(semanticBridgeScore * 0.12), 0, 100);
  if (expertSignals.score >= 72 && semanticBridgeScore >= 60) {
    riskScore = Math.max(riskScore, Math.min(82, Math.round(expertSignals.score * 0.62 + semanticBridgeScore * 0.28)));
  }
  if (expertSignals.score >= 82 && semanticBridgeScore >= 72) {
    riskScore = Math.max(riskScore, 76);
  }
  const riskLevel = riskScore < 50 ? '高风险' : (riskScore < 75 ? '中风险' : '低风险');
  const flawScan = scanArgumentFlaws({ topic, topicType, draft: reviewDraft, topicPhrases, paragraphDiagnostics: diagnostics, paragraphs, scaffold, precision });
  const paragraphAdvice = buildParagraphAdvice({ topic, topicType, draft: reviewDraft, topicPhrases, paragraphs, diagnostics, scaffold, precision, coverageMatrix });
  const lowDims = scaffold.dimensions.filter((d) => d.score < 65);
  const autoSuggestions = lowDims.slice(0, 4).map((d) => d.fix);
  const triadGaps = buildTriadGapTips({ topic, draft: reviewDraft, topicPhrases, scaffold, precision, missedCount: missed.length });

  return {
    topic,
    draft: reviewDraft,
    originalDraft: draft,
    reviewInfo,
    topicType,
    topicPhrases,
    expectedCategories: ['thinking', 'dialectics'],
    matchedPhrases: matched,
    missedPhrases: missed,
    semanticAvg: diagnostics.length ? Math.round(diagnostics.reduce((s, x) => s + x.semanticScore, 0) / diagnostics.length) : 0,
    paragraphDiagnostics: diagnostics,
    riskLevel,
    riskScore,
    coverageMatrix,
    precision,
    scaffold,
    semanticBridgeScore,
    expertSignals,
    flawScan,
    paragraphAdvice,
    triadGaps,
    evidence: [
      reviewInfo.removedHeadings.length ? `已忽略标题/题记：${reviewInfo.removedHeadings.join('、')}` : '',
      `题眼覆盖：${matched.length}/${Math.max(topicPhrases.length, 1)}`,
      `语义关联：${semanticBridgeScore}/100`,
      `段落数量：${paragraphs.length}`,
      `偏题段落：${weak}段`,
      `思辨脚手架：${scaffold.summary}`,
      `精准度核验：核心一致性${precision.coreConsistency.score} / 对立覆盖${precision.oppositionCoverage.score} / 升华质量${precision.risingQuality.score}`
    ].filter(Boolean),
    suggestions: [
      missed.length ? `补齐缺失题眼：${missed.slice(0, 3).join('、')}` : '题眼覆盖基本达标。',
      '每段首句都显式回扣题眼。',
      '至少加入1个例证并说明其证明机制。',
      ...autoSuggestions
    ]
  };
}

function inferParagraphRole(index, total) {
  if (index === 0) return '开篇定向';
  if (index === total - 1) return '结尾收束';
  if (index === 1) return '主体展开';
  if (index === total - 2) return '边界转折';
  return '递进论证';
}

function findEvidenceSentenceInParagraph(paragraph, tests) {
  const sentences = splitSentences(paragraph);
  const hit = sentences.find((sentence) => tests.some((test) => {
    if (test instanceof RegExp) return test.test(sentence);
    return sentence.includes(String(test || ''));
  }));
  return ensureSentenceEnding(hit || sentences[0] || '');
}

function buildTopicEyeCoverageMatrix({ topic, topicType, topicPhrases, paragraphs }) {
  const quotedTerms = [...String(topic || '').matchAll(/“([^”]{1,12})”/g)].map((m) => m[1]);
  const topicQuestionWords = String(topic || '').match(/(是否|必定|仅仅|意味着|对此|认识|思考|请联系社会生活|为什么|如何|怎样)/g) || [];
  const coreTerms = dedupeArray([...quotedTerms, ...(topicPhrases || [])])
    .filter((x) => x && x.length <= 12)
    .slice(0, 6);
  const relationPattern = topicType.code === 'relation'
    ? /(关系|之间|既.*又|一方面|另一方面|同时|相互|制约|统一|张力|转化|并非|不是.*而是)/
    : /(是否|必定|仅仅|意味着|不是.*而是|并非|未必|条件|前提|边界|价值|标准|意义|判断)/;
  const rows = (paragraphs || []).map((paragraph, index) => {
    const text = String(paragraph || '');
    const hitTerms = coreTerms.filter((term) => text.includes(term));
    const hasQuestionResponse = relationPattern.test(text) || topicQuestionWords.some((word) => text.includes(word));
    const hasLogicChain = /(因为|所以|因此|由此|从而|意味着|导致|说明|可见|关键在于|其机制在于|本质上)/.test(text);
    const hasDialectic = /(诚然|然而|但是|不过|另一方面|反过来|同时|并非|未必|也要看到)/.test(text);
    const hasBoundary = /(前提|条件|边界|如果|若|当.*时|并不总是|不能简单|不能绝对|未必)/.test(text);
    const hasReality = /(现实|社会|时代|生活|校园|平台|算法|技术|家庭|青年|公共|信息|媒体|消费|学习)/.test(text);
    const hasDefinition = /(所谓|指的是|并不是|不是.*而是|内涵|本质|可理解为)/.test(text);
    const role = inferParagraphRole(index, paragraphs.length);
    const missing = [];

    if (!hitTerms.length) missing.push('缺题眼词');
    if (!hasQuestionResponse) missing.push('未回应设问关系');
    if (index === 0 && !hasDefinition) missing.push('开头未界定概念');
    if (index > 0 && index < paragraphs.length - 1 && !hasLogicChain) missing.push('缺机制解释');
    if ((topicType.code === 'relation' || topicQuestionWords.length) && index > 0 && !hasDialectic) missing.push('缺辩证转折');
    if (index > 0 && index < paragraphs.length - 1 && !hasReality) missing.push('缺现实锚点');
    if (index === paragraphs.length - 1 && !hasBoundary) missing.push('结尾缺边界条件');

    const score = clamp(
      hitTerms.length * 18
      + (hasQuestionResponse ? 18 : 0)
      + (hasLogicChain ? 16 : 0)
      + (hasDialectic ? 14 : 0)
      + (hasBoundary ? 12 : 0)
      + (hasReality ? 10 : 0)
      + (index === 0 && hasDefinition ? 12 : 0),
      0,
      100
    );
    const evidenceSentence = findEvidenceSentenceInParagraph(text, [
      ...hitTerms,
      relationPattern,
      /(因为|所以|因此|由此|意味着|本质|机制|前提|条件|边界|现实|社会|时代)/
    ]);
    return {
      index,
      role,
      score,
      hitTerms,
      checks: {
        hitTopic: hitTerms.length > 0,
        questionResponse: hasQuestionResponse,
        logicChain: hasLogicChain,
        dialectic: hasDialectic,
        boundary: hasBoundary,
        reality: hasReality,
        definition: hasDefinition
      },
      missing,
      evidenceSentence
    };
  });
  const summary = {
    coreTerms,
    questionWords: dedupeArray(topicQuestionWords),
    avgScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0,
    weakCount: rows.filter((row) => row.score < 60).length
  };
  return { summary, rows };
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

function buildPrecisionChecks({ topic, draft, topicType, topicPhrases, paragraphs, diagnostics }) {
  const core = (topicPhrases || []).slice(0, 3);
  const paraCoreHits = (paragraphs || []).map((p) => core.filter((k) => p.includes(k)).length);
  const coreCoverage = paraCoreHits.filter((n) => n > 0).length / Math.max((paragraphs || []).length, 1);
  const weakParas = (diagnostics || []).filter((d) => d.semanticScore < 45).length;
  const coreScore = clamp(Math.round(coreCoverage * 75 + Math.max(0, 25 - weakParas * 8)), 0, 100);

  const text = String(draft || '');
  const oppositeSignals = countMatches(text, /(另一方面|然而|诚然|但是|反过来|并非|未必|同时)/gi);
  const dualTerms = topicType.code === 'relation'
    ? countMatches(topic, /与|和|还是|对立|之间/gi)
    : 1;
  const oppositionScore = clamp(Math.round(Math.min(100, oppositeSignals * 12 + dualTerms * 18)), 0, 100);

  const lastParagraph = (paragraphs || []).length ? paragraphs[(paragraphs || []).length - 1] : '';
  const risingSignals = countMatches(lastParagraph, /(回到题目|因此|总之|由此|意义|价值|时代|实践|公共)/gi);
  const boundarySignals = countMatches(lastParagraph, /(条件|前提|边界|未必|并不总是)/gi);
  const risingScore = clamp(Math.round(Math.min(100, risingSignals * 12 + boundarySignals * 16 + 20)), 0, 100);

  const avgScore = Math.round((coreScore + oppositionScore + risingScore) / 3);
  return {
    avgScore,
    coreConsistency: {
      score: coreScore,
      detail: `核心概念在段落中的连续覆盖率：${Math.round(coreCoverage * 100)}%`
    },
    oppositionCoverage: {
      score: oppositionScore,
      detail: `对立面与转折信号词出现：${oppositeSignals}次`
    },
    risingQuality: {
      score: risingScore,
      detail: `结尾升华信号：${risingSignals}次，边界词：${boundarySignals}次`
    }
  };
}

function buildParagraphAdvice({ topic, topicType, draft, topicPhrases, paragraphs, diagnostics, coverageMatrix }) {
  const key = topicPhrases[0] || '核心概念';
  return (paragraphs || []).map((paragraph, index) => {
    const text = String(paragraph || '');
    const matrixRow = coverageMatrix?.rows?.[index] || null;
    const hits = (topicPhrases || []).filter((k) => text.includes(k));
    const hasMechanism = /(因为|所以|因此|由此|机制|本质|说明|意味着)/.test(text);
    const hasTransition = /(诚然|然而|另一方面|同时|反过来|不过|进一步)/.test(text);
    const hasReality = /(现实|社会|时代|校园|平台|技术|教育|生活|AI|人工智能)/.test(text);
    const hasBoundary = /(前提|条件|边界|如果|当.*时|未必|并不总是)/.test(text);
    const hasDefinition = /(所谓|不是.*而是|并非.*而是|内涵|指的是)/.test(text);
    const issues = [];

    if (!hits.length) issues.push('题眼回扣不足');
    if (index === 0 && !hasDefinition) issues.push('开篇未界定概念');
    if (index > 0 && !hasMechanism) issues.push('缺少机制解释');
    if (topicType.code === 'relation' && index > 0 && !hasTransition) issues.push('缺少辩证转折');
    if (index === (paragraphs.length - 1) && !hasBoundary) issues.push('收束缺少边界');
    if (index > 0 && !hasReality) issues.push('现实关联偏弱');
    (matrixRow?.missing || []).forEach((item) => {
      if (!issues.includes(item)) issues.push(item);
    });

    const focus = issues[0] || '本段基础较稳，可继续精炼表达。';
    const score = matrixRow?.score ?? diagnostics?.[index]?.semanticScore ?? 70;
    const role = matrixRow?.role || inferParagraphRole(index, paragraphs.length);
    const evidenceSentence = matrixRow?.evidenceSentence || findEvidenceSentenceInParagraph(text, [key]);
    const task = buildParagraphTeacherTask({ role, issues, key, index, total: paragraphs.length });
    const rewrite = buildParagraphRewriteParagraph({ topic, key, topicType, paragraph: text, index, total: paragraphs.length, hits, hasMechanism, hasTransition, hasReality, hasBoundary, hasDefinition });
    return {
      index,
      score,
      role,
      evidenceSentence,
      focus,
      issues,
      task,
      suggestion: issues.length ? `优先处理：${issues.join('、')}` : '可保持结构不变，只精炼语言。',
      rewrite
    };
  });
}

function buildParagraphTeacherTask({ role, issues, key, index, total }) {
  if (!issues?.length) return `保留本段职责“${role}”，只把句子压短，避免重复表述。`;
  if (issues.includes('题眼回扣不足') || issues.includes('缺题眼词')) {
    return `先在第${index + 1}段首句补回“${key}”，让阅卷老师一眼看到本段没有离题。`;
  }
  if (issues.includes('开篇未界定概念')) {
    return `第1段先界定“${key}”的内涵和误区，再亮出中心判断。`;
  }
  if (issues.includes('缺机制解释') || issues.includes('缺少机制解释')) {
    return `本段材料后补一句“它为什么能证明观点”，把现象推进到原因或机制。`;
  }
  if (issues.includes('缺辩证转折') || issues.includes('缺少辩证转折')) {
    return `本段补出另一面：承认其合理处，再指出边界或副作用。`;
  }
  if (issues.includes('现实关联偏弱') || issues.includes('缺现实锚点')) {
    return `补一个真实场景，不写“例如”，直接把校园、平台或社会现象嵌进判断。`;
  }
  if (issues.includes('收束缺少边界') || issues.includes('结尾缺边界条件')) {
    return `结尾不要喊口号，改成“在什么前提下成立、离开什么条件会失效”。`;
  }
  return index === total - 1
    ? `末段回到“${key}”，完成条件化收束。`
    : `围绕“${key}”补一条观点、依据、分析的闭环。`;
}

function buildParagraphRewriteParagraph(payload) {
  const { key, topicType, paragraph, index, total, hits, hasMechanism, hasTransition, hasReality, hasBoundary, hasDefinition } = payload;
  let next = String(paragraph || '').trim();
  if (!next) next = `本段仍需围绕“${key}”展开具体论证。`;

  if (!hits.length) {
    next = `回到题目，本文讨论的核心仍是“${key}”。${next}`;
  }
  if (index === 0 && !hasDefinition) {
    next = `所谓“${key}”，并不是表面化的直觉判断，而是在具体条件下成立的概念。${next}`;
  }
  if (index > 0 && !hasMechanism) {
    next = `${next} 其关键机制在于：前提一旦成立，判断便会通过具体作用链条转化为现实结果。`;
  }
  if (topicType.code === 'relation' && index > 0 && !hasTransition) {
    next = `诚然，只写单一一端会让论证更直接；然而，忽视另一端会让结论失衡。${next}`;
  }
  if (index > 0 && !hasReality) {
    next = `${next} 放到当下的校园、平台和社会情境中看，这一问题并不抽象，而是持续影响具体选择。`;
  }
  if (index === total - 1 && !hasBoundary) {
    next = `${next} 当然，这一判断并非绝对成立，它仍受前提、边界与现实条件制约。`;
  }
  return next.trim();
}

function scanArgumentFlaws(payload) {
  const { topic, topicType, draft, topicPhrases, paragraphDiagnostics, scaffold, precision } = payload;
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
  if ((precision?.coreConsistency?.score || 100) < 60) flaws.push({ name: '核心概念一致性偏弱', level: '高', evidence: precision.coreConsistency.detail, fix: '每段首句回扣核心概念并保持同义链一致。', paragraphIndex: 0 });
  if ((precision?.oppositionCoverage?.score || 100) < 60) flaws.push({ name: '对立面覆盖不足', level: '中', evidence: precision.oppositionCoverage.detail, fix: '补一段“诚然-然而”双边论证。', paragraphIndex: 1 });
  if ((precision?.risingQuality?.score || 100) < 60) flaws.push({ name: '升华质量不足', level: '中', evidence: precision.risingQuality.detail, fix: '结尾增加“价值意义+边界条件”双句收束。', paragraphIndex: Math.max(0, (paragraphDiagnostics?.length || 1) - 1) });

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
  const coverageMatrixRows = renderTopicEyeCoverageMatrix(report.coverageMatrix);
  const precisionRows = report.precision ? `
    <div class="score-row">
      <div class="score-row-top"><span>核心概念一致性</span><strong>${report.precision.coreConsistency.score}/100</strong></div>
      <div class="score-bar"><span style="width:${report.precision.coreConsistency.score}%"></span></div>
      <p class="agent-para-issues">${escapeHtml(report.precision.coreConsistency.detail)}</p>
    </div>
    <div class="score-row">
      <div class="score-row-top"><span>对立面覆盖</span><strong>${report.precision.oppositionCoverage.score}/100</strong></div>
      <div class="score-bar"><span style="width:${report.precision.oppositionCoverage.score}%"></span></div>
      <p class="agent-para-issues">${escapeHtml(report.precision.oppositionCoverage.detail)}</p>
    </div>
    <div class="score-row">
      <div class="score-row-top"><span>升华质量</span><strong>${report.precision.risingQuality.score}/100</strong></div>
      <div class="score-bar"><span style="width:${report.precision.risingQuality.score}%"></span></div>
      <p class="agent-para-issues">${escapeHtml(report.precision.risingQuality.detail)}</p>
    </div>
  ` : '';
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
  const paragraphAdviceRows = renderParagraphAdviceRows(report.paragraphAdvice || [], 'offtopic');
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.topicPhrases);
  const goodSentences = renderSentenceQualityItems(sentenceQuality.goodItems || [], 'good');
  const badSentences = renderSentenceQualityItems(sentenceQuality.badItems || [], 'bad');
  const triadGapRows = (report.triadGaps || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const errorBookPanel = renderErrorBookTrainingPanel(buildErrorBookSummary(report));

  container.innerHTML = `
    <div class="agent-result-head"><h3>防跑题诊断报告</h3><div class="agent-tags"><span class="agent-tag risk ${normalizeRiskClass(report.riskLevel)}">偏题风险：${report.riskLevel}</span><span class="agent-tag">扣题指数：${report.riskScore}/100</span></div></div>
    ${renderOffTopicTeacherPriorityPanel(report)}
    ${renderOffTopicRedLinePanel(report)}
    ${renderOffTopicObsidianCalibrationPanel(report)}
    <div class="agent-result-block"><h4>题眼覆盖矩阵</h4>${coverageMatrixRows}</div>
    <div class="agent-result-block"><h4>精准度核验（3项）</h4><div class="score-grid">${precisionRows}</div></div>
    <div class="agent-result-block"><h4>思辨脚手架（6维）</h4><div class="score-grid">${dimensionCards}</div></div>
    <div class="agent-result-block"><h4>诊断依据</h4><ul>${evidenceItems}</ul></div>
    <div class="agent-result-block">
      <h4>三维训练缺口提示</h4>
      <ul>${triadGapRows || '<li>当前三维表现较均衡。</li>'}</ul>
      <p class="agent-para-issues">请根据以上缺口，自己补写对应段落中的概念界定、机制解释或边界句。</p>
    </div>
    <div class="agent-result-block"><h4>修正建议</h4><ul>${suggestionItems}</ul></div>
    <div class="agent-result-block"><h4>段落贴合图</h4><div class="score-grid">${paragraphCards || '<p>暂无段落</p>'}</div></div>
    <div class="agent-result-block"><h4>段落级诊断</h4>${paragraphAdviceRows}</div>
    <div class="agent-result-block"><h4>句子质量提示</h4><p>高分句候选</p><ul>${goodSentences || '<li>暂无</li>'}</ul><p>低分句预警</p><ul>${badSentences || '<li>暂无</li>'}</ul></div>
    <div class="agent-result-block"><h4>论证漏洞扫描</h4>${renderFlawScanRows(report.flawScan || [])}</div>
    ${errorBookPanel}`;
}

function renderOffTopicObsidianCalibrationPanel(report) {
  const cal = report.obsidianCalibration;
  if (!cal) return '';
  const profile = cal.supportProfile || getEmbeddedObsidianSupportProfile();
  const profileLine = profile?.total
    ? `OB库${profile.total}篇，其中高分标杆${profile.highScoreCount || 0}篇；当前题型支撑：${escapeHtml(cal.signal?.topicTypeName || '未识别')}，母题：${escapeHtml(cal.signal?.theme || '未识别')}`
    : `OB库加载${cal.indexSize || 0}篇`;
  const matchedRows = (cal.matched || []).slice(0, 3).map((item) => `
    <li>${escapeHtml(item.title)}｜${escapeHtml(item.docRole || item.sourceFile || 'OB档案')}｜${escapeHtml(item.topicType || '题型未标')}｜${escapeHtml(item.themeTag || '母题未标')}｜匹配${Math.round(item.matchScore || 0)}｜${escapeHtml((item.reasons || []).join('、') || '同型参考')}</li>
  `).join('');
  const anchorRows = (cal.teacherAnchors || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const warningRows = (cal.weakWarnings || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <div class="agent-result-block">
      <h4>OB高分范文防跑题校准</h4>
      <p><strong>校准指数</strong>：${Math.round(cal.score || 0)}/100｜可信度：${Math.round(cal.confidence || 0)}/100｜${profileLine}</p>
      <p><strong>相近标杆</strong></p>
      <ul>${matchedRows || '<li>暂未命中相近OB范文；本次只按题眼矩阵判断。</li>'}</ul>
      <p><strong>老师式对照动作</strong></p>
      <ul>${anchorRows || '<li>先检查题眼、关系、边界三项。</li>'}</ul>
      <p><strong>仍需警惕</strong></p>
      <ul>${warningRows || '<li>OB校准未发现额外硬伤，继续看逐段证据。</li>'}</ul>
      <p class="agent-para-issues">OB标杆只用于“校准判断标准”，不直接替代原文证据；若高分文和当前习作同型，系统会适度降低误判风险，但仍保留段落缺口。</p>
    </div>
  `;
}

function renderSentenceQualityItems(items, type = 'good') {
  const cls = type === 'good' ? 'sentence-good' : 'sentence-bad';
  return (items || []).map((item) => {
    const where = item.paragraphIndex != null ? `第${item.paragraphIndex + 1}段` : '定位未知';
    const reasons = (item.reasons || []).slice(0, 3).join('、') || (type === 'good' ? '可保留' : '需自改');
    return `<li class="${cls}"><strong>${escapeHtml(where)}</strong>：${escapeHtml(takeSentencePreview(item.sentence, 48))}<br><span class="agent-para-issues">判定依据：${escapeHtml(reasons)}｜句质 ${Math.round(item.score || 0)}/100</span></li>`;
  }).join('');
}

function renderTopicEyeCoverageMatrix(matrix) {
  const rows = matrix?.rows || [];
  const summary = matrix?.summary || {};
  const mark = (ok) => ok ? '通过' : '缺口';
  const rowHtml = rows.map((row) => `
    <div class="score-row">
      <div class="score-row-top"><span>第${row.index + 1}段｜${escapeHtml(row.role)}</span><strong>${row.score}/100</strong></div>
      <div class="score-bar"><span style="width:${row.score}%"></span></div>
      <p class="agent-para-issues">题眼：${escapeHtml((row.hitTerms || []).join('、') || '未命中')}｜证据句：${escapeHtml(takeSentencePreview(row.evidenceSentence || '', 42) || '暂无')}</p>
      <p class="agent-para-issues">
        题眼${mark(row.checks?.hitTopic)}；
        设问${mark(row.checks?.questionResponse)}；
        机制${mark(row.checks?.logicChain)}；
        辩证${mark(row.checks?.dialectic)}；
        边界${mark(row.checks?.boundary)}；
        现实${mark(row.checks?.reality)}
      </p>
      <p class="agent-para-issues">缺口：${escapeHtml((row.missing || []).join('、') || '暂无明显缺口')}</p>
    </div>
  `).join('');
  return `
    <p class="agent-para-issues">核心题眼：${escapeHtml((summary.coreTerms || []).join('、') || '未识别')}｜平均覆盖：${summary.avgScore || 0}/100｜薄弱段落：${summary.weakCount || 0}段</p>
    <div class="score-grid">${rowHtml || '<p>暂无段落。</p>'}</div>
  `;
}

function classifyOffTopicRedLine(report) {
  const dims = report.scaffold?.dimensions || [];
  const d = (id) => dims.find((item) => item.id === id)?.score ?? 100;
  const checks = [
    { type: '题眼漏答型', score: d('d1'), detail: '核心概念没有持续出现，文章容易从题目滑向泛谈。' },
    { type: '单边表态型', score: d('d2'), detail: '只写一端合理性，缺少另一端、限制或转化条件。' },
    { type: '现象停留型', score: d('d3'), detail: '例子或现象较多，但缺少“为什么会这样”的机制解释。' },
    { type: '现实脱节型', score: d('d4'), detail: '判断没有落到校园、技术、社会或生活场景中。' },
    { type: '边界缺失型', score: d('d5'), detail: '结论偏绝对，缺少前提、条件和例外。' },
    { type: '结构平面型', score: d('d6'), detail: '段落推进缺少转折和递进信号，像平铺观点。' }
  ];
  return checks.sort((a, b) => a.score - b.score)[0] || checks[0];
}

function renderOffTopicRedLinePanel(report) {
  const redLine = classifyOffTopicRedLine(report);
  const weakRows = (report.coverageMatrix?.rows || []).filter((row) => row.score < 72);
  const firstWeak = weakRows[0] || (report.coverageMatrix?.rows || [])[0];
  const coreTerms = report.coverageMatrix?.summary?.coreTerms || report.topicPhrases || [];
  const questionWords = report.coverageMatrix?.summary?.questionWords || [];
  const mustAnswer = questionWords.length
    ? `本题必须回应“${questionWords.slice(0, 2).join(' / ')}”这一设问。`
    : '本题必须把核心概念转化成一个明确判断。';
  return `
    <div class="agent-result-block">
      <h4>考场防跑题红线</h4>
      <div class="score-grid">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>红线类型</span><strong>${escapeHtml(redLine.type)}</strong></div>
          <p>${escapeHtml(redLine.detail)}</p>
          <p><strong>本次证据</strong>：${escapeHtml(firstWeak ? `第${firstWeak.index + 1}段 ${takeSentencePreview(firstWeak.evidenceSentence || '', 34) || '未识别到稳定扣题句'}` : '暂无段落')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>题眼三问</span><strong>考前核验</strong></div>
          <p>1. 我是否反复回应了：${escapeHtml((coreTerms || []).slice(0, 4).join('、') || '核心题眼')}？</p>
          <p>2. ${escapeHtml(mustAnswer)}</p>
          <p>3. 结尾是否写清“何时成立、何时失效、现实中怎么做”？</p>
        </div>
      </div>
    </div>
  `;
}

function renderOffTopicTeacherPriorityPanel(report) {
  const weakRow = (report.coverageMatrix?.rows || []).find((row) => row.score < 72)
    || (report.coverageMatrix?.rows || [])[0];
  const weakDimension = (report.scaffold?.dimensions || [])
    .slice()
    .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
  const currentTags = extractErrorTags({ draft: report.draft, offTopic: report });
  const tagLine = currentTags.slice(0, 3).join('、') || '暂无明显高频错因';
  return `
    <div class="agent-result-block">
      <h4>阅卷老师先看三处</h4>
      <div class="score-grid">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>1. 先看题眼是否守住</span><strong>${weakRow ? `第${weakRow.index + 1}段` : '全篇'}</strong></div>
          <p><strong>证据句</strong>：${escapeHtml(takeSentencePreview(weakRow?.evidenceSentence || '', 46) || '未识别到稳定扣题句')}</p>
          <p><strong>判断</strong>：${escapeHtml((weakRow?.missing || []).join('、') || '题眼覆盖基本稳定')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>2. 再看最弱维度</span><strong>${escapeHtml(weakDimension?.name || '暂无')}</strong></div>
          <p><strong>依据</strong>：${escapeHtml(weakDimension?.evidence || '当前维度差异不明显')}</p>
          <p><strong>动作</strong>：${escapeHtml(weakDimension?.fix || '保持每段回扣题目，不整篇重写。')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>3. 最后转成专项训练</span><strong>错因</strong></div>
          <p><strong>本次错因</strong>：${escapeHtml(tagLine)}</p>
          <p><strong>训练原则</strong>：只练一个动作，例如“补机制解释”或“补边界句”，不要泛泛重写。</p>
        </div>
      </div>
    </div>
  `;
}

function renderParagraphAdviceRows(adviceList, reportType = 'offtopic') {
  if (!adviceList.length) return '<p>暂无段落级诊断。</p>';
  return adviceList.map((item) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>第${item.index + 1}段｜${escapeHtml(item.role || inferParagraphRole(item.index, adviceList.length))}</span><strong>${item.score}/100</strong></div>
      <p><strong>证据句</strong>：${escapeHtml(takeSentencePreview(item.evidenceSentence || '', 46) || '未识别到稳定证据句')}</p>
      <p><strong>诊断</strong>：${escapeHtml(item.focus)}</p>
      <p>建议：${escapeHtml(item.suggestion)}</p>
      <p><strong>自改任务</strong>：${escapeHtml(item.task || '请学生自己重写这一段。')}</p>
      <div class="flaw-actions">
        <span class="flaw-target">${escapeHtml((item.issues || []).join(' / ') || '本段基础较稳')}</span>
        <span class="flaw-target">请学生自己重写这一段，不替写。</span>
      </div>
    </div>`).join('');
}

function buildTopicRadar(analysis) {
  const topic = analysis?.topic || '';
  const type = analysis?.topicType?.code || detectTopicType(topic).code;
  const core = (analysis?.topicPhrases || normalizeTopicPhrases(extractTopicPhrases(topic))).slice(0, 5);
  const relation = type === 'relation'
    ? `重点不是二选一，而是写清“${core[0] || '概念A'}—${core[1] || '概念B'}”如何互相制约、转化或统一。`
    : (type === 'value'
      ? `重点是判断“${core[0] || '该价值标准'}”的可靠性、代价和适用边界。`
      : `重点是把问题拆成“前提—机制—结果”，避免只凭直觉表态。`);
  const questionFocus = /是否|吗|必定|仅仅|意味着/.test(topic)
    ? '设问重心：不能只回答“是/否”，必须说明在什么前提下成立、在什么情况下不成立。'
    : (/认识|思考|怎么看|怎样/.test(topic)
      ? '设问重心：不是讲道理，而是给出可检验的判断标准。'
      : '设问重心：先界定题目任务，再完成论证。');
  const driftRisks = dedupeArray([
    ...(analysis?.pitfalls || []),
    '把题目写成泛泛人生感悟，丢掉核心概念。',
    '只写态度，不写成立条件和现实机制。'
  ]).slice(0, 4);
  return {
    core,
    relation,
    questionFocus,
    driftRisks,
    hiddenPremise: analysis?.hiddenPremise || detectHiddenPremise(topic, analysis?.topicType || detectTopicType(topic), core)
  };
}

function buildThesisHealthCheck(analysis, report = null) {
  const sentence = report?.thesis?.thesisSentence || analysis?.thesis || '';
  const topicPhrases = analysis?.topicPhrases || [];
  const hasTopic = topicPhrases.some((term) => term && sentence.includes(term));
  const hasStance = /(主张|认为|关键|应当|需要|可以|不能|取决于|不在于|而在于|并非|未必)/.test(sentence);
  const hasCondition = /(前提|条件|边界|若|如果|当.*时|在.*下|并非|未必|不必|不能绝对)/.test(sentence);
  const hasRelation = topicPhrases.length < 2
    ? /(关系|机制|标准|价值|结果|代价|路径)/.test(sentence)
    : (topicPhrases.slice(0, 2).every((term) => sentence.includes(term)) || /(关系|张力|制约|转化|统一|平衡|桥梁)/.test(sentence));
  const hasBoundary = /(然而|但|不是.*而是|并不|未必|避免|限度|边界|不能简单)/.test(sentence);
  const checks = [
    { label: '有题眼', ok: hasTopic, fix: '中心句至少带回1个核心题眼。' },
    { label: '有立场', ok: hasStance, fix: '不要只说“要理性看待”，要写清你的判断。' },
    { label: '有条件', ok: hasCondition, fix: '补“在什么前提下成立”。' },
    { label: '有关系', ok: hasRelation, fix: '写清概念之间的制约、转化或判断标准。' },
    { label: '有边界', ok: hasBoundary, fix: '补一句“但并不意味着……”或“并非绝对”。' }
  ];
  const score = Math.round(checks.filter((x) => x.ok).length / checks.length * 100);
  return {
    sentence,
    score,
    checks,
    verdict: score >= 80 ? '中心论点有一类卷雏形' : (score >= 60 ? '中心论点基本可用，但还不够稳' : '中心论点偏空，需要先重写判断句')
  };
}

function buildLeadSentenceTrainingRows(analysis, report = null) {
  const draft = report?.draft || '';
  const paragraphs = splitParagraphs(draft);
  if (!paragraphs.length) {
    return [{
      index: 0,
      role: '草稿未输入',
      lead: '输入作文后，这里会逐段检查段首句。',
      duty: '段首句要承担“界定、推进、转折、升华”的功能。',
      issue: '暂无草稿',
      action: '先写4段，每段第一句都显式回扣题眼。'
    }];
  }
  const topicPhrases = analysis?.topicPhrases || [];
  return paragraphs.slice(0, 6).map((paragraph, index) => {
    const role = inferParagraphRole(index, paragraphs.length);
    const lead = ensureSentenceEnding(splitSentences(paragraph)[0] || '');
    const hasTopic = topicPhrases.some((term) => term && lead.includes(term));
    const hasLogic = /(然而|但|因此|进一步|换言之|由此|回到|诚然|首先|其次|最后)/.test(lead);
    const duty = role === '开篇定向'
      ? '界定核心概念并亮出中心判断。'
      : (role === '结尾收束'
        ? '回扣题眼，补边界和价值收束。'
        : (role === '边界转折' ? '处理反面、例外和限制条件。' : '推进一层论证，不重复上一段。'));
    const issue = hasTopic && hasLogic ? '段首句功能较清楚' : (!hasTopic ? '段首句未明显回扣题眼' : '段首句缺少推进信号');
    const action = !hasTopic
      ? '把题眼词放回段首句，并写成判断句。'
      : (!hasLogic ? '补“然而/因此/进一步看”等推进词。' : '保留段首句，重点补段内分析。');
    return { index, role, lead, duty, issue, action };
  });
}

function buildMechanismCompletionRows(analysis, report = null) {
  const draft = report?.draft || '';
  const paragraphs = splitParagraphs(draft);
  if (!paragraphs.length) {
    return [{ label: '未输入草稿', evidence: '输入正文后，会检查每个例证后是否有机制解释。', action: '例证后必须补一句“这说明/其机制在于/由此可见”。' }];
  }
  const examplePattern = /(例如|比如|以.+?为例|案例|譬如|从.+?看|正如|孔子|鲁迅|司马迁|AI|人工智能|短视频|平台|航天|疫情|ChatGPT)/;
  const mechanismPattern = /(这说明|由此可见|其机制在于|本质上|原因在于|意味着|所以|因此|从而|关键在于|证明了)/;
  const rows = paragraphs.map((paragraph, index) => {
    const hasExample = examplePattern.test(paragraph);
    const hasMechanism = mechanismPattern.test(paragraph);
    if (!hasExample) return null;
    return {
      label: `第${index + 1}段`,
      evidence: takeSentencePreview(findEvidenceSentenceInParagraph(paragraph, [examplePattern]), 52),
      action: hasMechanism ? '例证后已有解释，可继续压缩叙事。' : '例子后缺机制解释：补“这个例子为什么能证明观点”。',
      weak: !hasMechanism
    };
  }).filter(Boolean);
  return rows.length ? rows : [{ label: '例证不足', evidence: '全文未识别到稳定例证。', action: '至少补1个现实场景或材料，并紧跟机制解释。', weak: true }];
}

function buildBoundaryConditionRows(report = null) {
  const draft = report?.draft || '';
  const rows = splitParagraphs(draft).flatMap((paragraph, paragraphIndex) =>
    splitSentences(paragraph)
      .filter((sentence) => /(一定|必须|只有|完全|永远|绝对|必然|唯一|都|从来)/.test(sentence))
      .map((sentence) => ({
        paragraphIndex,
        sentence: ensureSentenceEnding(sentence),
        action: '把绝对判断改成条件判断：补“在……前提下 / 未必 / 需要警惕”。'
      }))
  ).slice(0, 4);
  if (rows.length) return rows;
  return [{ paragraphIndex: null, sentence: '暂未发现明显绝对化表达。', action: '结尾仍建议主动补一句边界条件，防止立意过满。' }];
}

function buildTierUpgradeMiniRows(analysis) {
  const key = analysis?.topicPhrases?.[0] || '题眼';
  const key2 = analysis?.topicPhrases?.[1] || '另一端';
  return [
    {
      band: '48分常见写法',
      thesis: `要正确看待${key}。`,
      gap: '只表态，概念没有界定，也看不出条件和边界。'
    },
    {
      band: '56分稳定写法',
      thesis: `${key}有其合理性，但也需要看到局限。`,
      gap: `已有转折，但“${key}${key2 !== key ? `—${key2}` : ''}”之间的机制还不清楚。`
    },
    {
      band: '63+冲刺写法',
      thesis: analysis?.thesis || `${key}应放入前提、机制与边界中作条件化判断。`,
      gap: '能界定概念、解释机制、回应反方，并把结论落到现实选择。'
    }
  ];
}

function buildClassOneSentenceLibrary(analysis) {
  const key = analysis?.topicPhrases?.[0] || '该命题';
  const key2 = analysis?.topicPhrases?.[1] || '另一端';
  return [
    {
      type: '概念界定句',
      target: 1,
      items: [
        `所谓“${key}”，并不是一个可以直接套用的标签，而需要放回具体情境中辨析。`,
        `讨论“${key}”之前，首先要区分它的表层表现与深层机制。`
      ]
    },
    {
      type: '转折推进句',
      target: 2,
      items: [
        `诚然，${key}回应了现实中的某种需要；然而，若忽视其边界，判断便会滑向片面。`,
        `进一步看，${key}${key2 !== key ? `与${key2}` : ''}并非互相取消，而是在具体条件中彼此校正。`
      ]
    },
    {
      type: '机制解释句',
      target: 2,
      items: [
        `这一现象之所以能支撑上述判断，是因为它揭示了从外部条件到主体选择的转化机制。`,
        `换言之，例子真正证明的不是表面结果，而是背后的价值排序与行动逻辑。`
      ]
    },
    {
      type: '边界收束句',
      target: 3,
      items: [
        `因此，${key}并非绝对成立，它只有在明确前提、承认限制时才具有解释力。`,
        `真正成熟的判断，不在于给出唯一答案，而在于能说明何时成立、何时需要保留分寸。`
      ]
    }
  ];
}

function buildWeeklyClosureMini(report = null) {
  const book = loadErrorBook();
  const tags = report ? extractErrorTags({ draft: report.draft, score: teacherReportToScoreLike(report), offTopic: report.offTopic }) : [];
  const top = Object.entries(book.tags || {})
    .map(([tag, info]) => ({ tag, count: Number(info.count || 0), drill: buildErrorDrillFromTag(tag).drill }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return {
    total: (book.records || []).length,
    currentTags: tags,
    top
  };
}

function renderTeacherEightTrainingPanel(analysis, report = null) {
  const radar = buildTopicRadar(analysis);
  const thesis = buildThesisHealthCheck(analysis, report);
  const leadRows = buildLeadSentenceTrainingRows(analysis, report);
  const mechanismRows = buildMechanismCompletionRows(analysis, report);
  const boundaryRows = buildBoundaryConditionRows(report);
  const tierRows = buildTierUpgradeMiniRows(analysis);
  const weekly = buildWeeklyClosureMini(report);
  const sentenceLib = buildClassOneSentenceLibrary(analysis);

  const radarPitfalls = (radar.driftRisks || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const thesisChecks = (thesis.checks || []).map((x) => `<li><strong>${escapeHtml(x.label)}</strong>：${x.ok ? '通过' : escapeHtml(x.fix)}</li>`).join('');
  const leadHtml = leadRows.map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${row.index != null ? `第${row.index + 1}段` : ''}${escapeHtml(row.role)}</span><strong>${escapeHtml(row.issue)}</strong></div>
      <p><strong>段首句</strong>：${escapeHtml(row.lead)}</p>
      <p><strong>本段职责</strong>：${escapeHtml(row.duty)}</p>
      <p><strong>训练动作</strong>：${escapeHtml(row.action)}</p>
    </div>
  `).join('');
  const mechanismHtml = mechanismRows.map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(row.label)}</span><strong>${row.weak ? '需补机制' : '基本通过'}</strong></div>
      <p><strong>证据</strong>：${escapeHtml(row.evidence)}</p>
      <p><strong>动作</strong>：${escapeHtml(row.action)}</p>
    </div>
  `).join('');
  const boundaryHtml = boundaryRows.map((row) => `
    <li>${row.paragraphIndex == null ? '' : `第${row.paragraphIndex + 1}段：`}${escapeHtml(takeSentencePreview(row.sentence, 54))}<br><span class="agent-para-issues">${escapeHtml(row.action)}</span></li>
  `).join('');
  const tierHtml = tierRows.map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(row.band)}</span></div>
      <p><strong>中心论点</strong>：${escapeHtml(row.thesis)}</p>
      <p><strong>分差原因</strong>：${escapeHtml(row.gap)}</p>
    </div>
  `).join('');
  const weeklyHtml = (weekly.top || []).map((row, index) => `<li>${index + 1}. ${escapeHtml(row.tag)}（${row.count}次）：${escapeHtml(row.drill)}</li>`).join('');
  const currentTagHtml = (weekly.currentTags || []).map((tag) => `<span class="agent-tag risk medium">${escapeHtml(tag)}</span>`).join('');
  const sentenceHtml = sentenceLib.map((group) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(group.type)}</span><strong>插入第${group.target}段</strong></div>
      <ol>${group.items.map((sentence) => `<li>${escapeHtml(sentence)} <button class="agent-btn ghost triad-template-btn" type="button" data-template-sentence="${escapeHtml(sentence)}" data-target-paragraph="${group.target}">插入</button></li>`).join('')}</ol>
    </div>
  `).join('');

  return `
    <div class="agent-result-block">
      <h4>上海阅卷八项训练面板</h4>
      <p class="agent-para-issues">目标不是替孩子改作文，而是像老师一样指出：题怎么审、句怎么立、段怎么推进、分差在哪里。</p>
      <details class="tier-essay-card" open>
        <summary class="tier-essay-summary"><strong>1. 题目审题雷达</strong><span>核心概念 / 隐含关系 / 设问重心 / 易偏方向</span></summary>
        <p><strong>核心概念</strong>：${escapeHtml((radar.core || []).join('、') || '未识别')}</p>
        <p><strong>隐含关系</strong>：${escapeHtml(radar.relation)}</p>
        <p><strong>设问重心</strong>：${escapeHtml(radar.questionFocus)}</p>
        <p><strong>隐含前提</strong>：${escapeHtml(radar.hiddenPremise || '暂无')}</p>
        <ul>${radarPitfalls}</ul>
      </details>
      <details class="tier-essay-card" open>
        <summary class="tier-essay-summary"><strong>2. 中心论点体检</strong><span>有立场 / 有条件 / 有关系 / 有边界</span></summary>
        <p><strong>检测句</strong>：${escapeHtml(thesis.sentence || '未形成中心判断句')}</p>
        <p><strong>体检结果</strong>：${escapeHtml(thesis.verdict)}（${thesis.score}/100）</p>
        <ul>${thesisChecks}</ul>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>3. 段首句训练器</strong><span>界定 / 推进 / 转折 / 升华</span></summary>
        <div class="score-grid">${leadHtml}</div>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>4. 论证机制补全器</strong><span>例子后必须解释为什么</span></summary>
        <div class="score-grid">${mechanismHtml}</div>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>5. 边界条件检查器</strong><span>防止绝对化、单边化</span></summary>
        <ul>${boundaryHtml}</ul>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>6. 同题升档对照</strong><span>48 / 56 / 63+ 的分差</span></summary>
        <div class="score-grid">${tierHtml}</div>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>7. 错因闭环周报</strong><span>累计错因与下次训练</span></summary>
        <p>错因本累计：${weekly.total}次</p>
        <div class="agent-tags">${currentTagHtml || '<span class="agent-tag">本次暂无明显新增错因</span>'}</div>
        <ul>${weeklyHtml || '<li>暂未形成高频错因画像，完成几次评分后会更准。</li>'}</ul>
      </details>
      <details class="tier-essay-card">
        <summary class="tier-essay-summary"><strong>8. 一类卷句式库</strong><span>按功能插入，不背空话</span></summary>
        <div class="score-grid">${sentenceHtml}</div>
      </details>
    </div>
  `;
}

function buildParagraphTeacherQuestion(row) {
  const issues = row.issues || [];
  if (issues.some((x) => /题眼|扣题|概念/.test(x))) return '这一段第一句是否能让阅卷老师看出你还在回答原题？';
  if (issues.some((x) => /机制|分析|逻辑/.test(x))) return '这一段有没有解释“为什么这个例子能证明观点”？';
  if (issues.some((x) => /现实|场景/.test(x))) return '这一段是否有一个具体生活或时代场景支撑判断？';
  if (issues.some((x) => /边界|收束/.test(x))) return '这一段是否写清结论成立的前提和例外？';
  return '这一段和上一段之间是否形成递进，而不是重复同一个意思？';
}

function buildParagraphSingleFix(row) {
  const issues = row.issues || [];
  if (issues.some((x) => /题眼|扣题|概念/.test(x))) return '只改段首句：补回题眼词和判断关系。';
  if (issues.some((x) => /机制|分析|逻辑/.test(x))) return '只补一句机制解释：这个现象为什么能推出你的观点。';
  if (issues.some((x) => /现实|场景/.test(x))) return '只补一个现实场景：校园、平台、技术或社会观察任选一个。';
  if (issues.some((x) => /边界|收束/.test(x))) return '只补一句边界条件：在什么前提下成立，在哪些情况下要保留分寸。';
  if (Number(row.score || 0) < 76) return '只做一件事：删掉重复表态，换成一处分析。';
  return '本段先不大改，只压缩空话并保留清楚判断。';
}

function buildObsidianParagraphCoach(row, report) {
  const top = report?.obsidianBenchmark?.matched?.[0] || report?.obsidianSuggestions?.[0] || null;
  const title = top?.title || '暂无明确OB对照文';
  const issues = row?.issues || [];
  let action = '对照OB高分文同类段落，只学它的功能，不抄它的句子。';
  if (issues.some((x) => /题眼|概念|扣题/.test(x))) {
    action = '看它第1段或主体段首句怎样反复回扣题眼，把自己的段首句改成“题眼+判断”的形式。';
  } else if (issues.some((x) => /机制|逻辑|分析/.test(x))) {
    action = '看它例证后紧跟的解释句，学习“现象为什么推出结论”的机制，而不是再加例子。';
  } else if (issues.some((x) => /现实|场景/.test(x))) {
    action = '看它如何把抽象概念落到校园、媒介、技术或公共生活场景，给自己的段落补一个真实观察。';
  } else if (issues.some((x) => /边界|收束/.test(x))) {
    action = '看它末段如何写“并非绝对/在何条件下成立”，给自己的结论补边界。';
  }
  return {
    title,
    meta: [top?.docRole || top?.meta || '', top?.topicType || '', top?.themeTag || ''].filter(Boolean).join('｜'),
    action,
    reason: top ? `OB匹配度 ${Math.round(top.matchScore || 0)}，可作为同题型段落功能参照。` : '当前OB未命中强对照，先按题眼矩阵自改。'
  };
}

function renderCritiqueParagraphCoachRows(report) {
  const rows = report.paragraphRows || [];
  if (!rows.length) return '<p>暂无逐段批注。</p>';
  return rows.map((row) => {
    const paragraph = splitParagraphs(report.draft)[row.index] || '';
    const lead = takeSentencePreview((splitSentences(paragraph)[0] || ''), 28);
    const role = row.role || inferParagraphRole(row.index, rows.length);
    const level = Number(row.score || 0) >= 82 ? '本段可保留' : (Number(row.score || 0) >= 68 ? '本段可提档' : '本段先抢救');
    const obCoach = buildObsidianParagraphCoach(row, report);
    return `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>第${row.index + 1}段｜${escapeHtml(role)}</span><strong>${escapeHtml(level)} ${row.score}/100</strong></div>
        <p><strong>本段职责</strong>：${escapeHtml(role === '开篇定向' ? '界定概念并亮出中心判断。' : (role === '结尾收束' ? '回扣题眼，补边界与价值收束。' : '展开论证，完成“观点-依据-分析-回扣”。'))}</p>
        <p><strong>定位句</strong>：${escapeHtml(lead || '本段开头未成句')}</p>
        <p><strong>证据句</strong>：${escapeHtml(takeSentencePreview(row.evidenceSentence || '', 54) || '未识别到稳定证据句')}</p>
        <p><strong>老师追问</strong>：${escapeHtml(buildParagraphTeacherQuestion(row))}</p>
        <p><strong>只改一处</strong>：${escapeHtml(buildParagraphSingleFix(row))}</p>
        <p><strong>OB对照</strong>：${escapeHtml(obCoach.title)}｜${escapeHtml(obCoach.reason)}</p>
        <p><strong>看完后做什么</strong>：${escapeHtml(obCoach.action)}</p>
      </div>
    `;
  }).join('');
}

function renderFlawScanRows(flawScan) {
  if (!flawScan.length) return '<p>未发现明显漏洞。</p>';
  return flawScan.map((item, idx) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(item.name)}</span><strong class="flaw-level ${item.level === '高' ? 'high' : 'medium'}">${item.level}优先级</strong></div>
      <p>识别依据：${escapeHtml(item.evidence)}</p>
      <p>修复动作：${escapeHtml(item.fix)}</p>
      <div class="flaw-actions"><span class="flaw-target">定位：第${item.paragraphIndex + 1}段首句，请学生自己改。</span></div>
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

function getObsidianMatchedEntriesFromIndex(index, topic, draft, analysis, limit = 8) {
  return (index || [])
    .map((entry) => {
      const matched = scoreObsidianEntryForEssay(entry, topic, draft, analysis);
      return { ...entry, matchScore: matched.score, matchReasons: matched.reasons || [] };
    })
    .filter((entry) => entry.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function buildObsidianCorpusSupportSignal(matches, analysis, topic, draft) {
  const topicTypeName = normalizeObsidianTopicTypeName(analysis?.topicType?.name || detectTopicType(topic).name);
  const theme = inferObsidianThemeTag(topic, draft);
  const highScoreMatches = matches.filter((entry) => entry.scoreBand?.isHighScore || /高分|佳作|下水|一类|师生同写/.test(String(entry.docRole || entry.sourceFile || '')));
  const typeMatches = matches.filter((entry) => normalizeObsidianTopicTypeName(entry.topicType) === topicTypeName);
  const themeMatches = matches.filter((entry) => theme && entry.themeTag === theme);
  const methodMatches = matches.filter((entry) => /(方法|解析|评分|命题|议论文|点评)/.test(String(`${entry.docRole || ''}${entry.folder || ''}${entry.sourceFile || ''}`)));
  return {
    topicTypeName,
    theme,
    topMatch: clamp(matches[0]?.matchScore || 0, 0, 100),
    highScoreCount: highScoreMatches.length,
    typeSupport: typeMatches.length,
    themeSupport: themeMatches.length,
    methodSupport: methodMatches.length,
    topTitle: matches[0]?.title || matches[0]?.topicKey || '',
    topRole: matches[0]?.docRole || matches[0]?.sourceFile || ''
  };
}

function buildObsidianTeacherAnchors(signal, offTopic) {
  const dims = offTopic?.scaffold?.dimensions || [];
  const lowDims = dims.filter((item) => Number(item.score || 0) < 68).slice(0, 3);
  const anchors = [];
  if (signal.typeSupport) {
    anchors.push(`同题型OB标杆有${signal.typeSupport}篇，先对照它们如何把“核心概念-设问关系-中心判断”写成一条线。`);
  }
  if (signal.themeSupport) {
    anchors.push(`同母题OB标杆有${signal.themeSupport}篇，重点看它们如何把抽象概念落到现实场景，而不是泛泛表态。`);
  }
  if (signal.methodSupport) {
    anchors.push(`OB方法档案命中${signal.methodSupport}篇，说明本题适合用“概念辨析-分类讨论-现实关联”的三步审题法。`);
  }
  lowDims.forEach((dim) => {
    anchors.push(`当前“${dim.name}”偏弱：对照高分文时只看这一项，检查它如何完成“${dim.fix}”`);
  });
  if (!anchors.length) anchors.push('暂未命中强标杆，仍按本地题眼矩阵与逐段诊断判断。');
  return dedupeArray(anchors).slice(0, 4);
}

async function buildObsidianOffTopicCalibration(topic, draft, analysis, offTopic) {
  const index = await loadObsidianEntryIndex();
  const supportProfile = getEmbeddedObsidianSupportProfile();
  const matches = getObsidianMatchedEntriesFromIndex(index, topic, draft, analysis, 8);
  const signal = buildObsidianCorpusSupportSignal(matches, analysis, topic, draft);
  const scaffoldAvg = Math.round((offTopic?.scaffold?.dimensions || []).reduce((sum, item) => sum + Number(item.score || 0), 0) / Math.max((offTopic?.scaffold?.dimensions || []).length, 1));
  const bridge = Number(offTopic?.semanticBridgeScore || 0);
  const highScoreBonus = Math.min(18, signal.highScoreCount * 4);
  const supportBonus = Math.min(18, signal.typeSupport * 4 + signal.themeSupport * 3 + signal.methodSupport * 2);
  const score = clamp(Math.round(signal.topMatch * 0.36 + scaffoldAvg * 0.26 + bridge * 0.18 + highScoreBonus + supportBonus), 0, 100);
  const confidence = clamp(Math.round(signal.topMatch * 0.55 + signal.typeSupport * 12 + signal.themeSupport * 8 + signal.highScoreCount * 7), 0, 100);
  const weakWarnings = (offTopic?.scaffold?.dimensions || [])
    .filter((item) => Number(item.score || 0) < 62)
    .map((item) => `OB标杆常见做法会补足“${item.name}”；当前证据显示：${item.evidence}`)
    .slice(0, 3);
  return {
    score,
    confidence,
    indexSize: index.length,
    supportProfile,
    signal,
    matched: matches.slice(0, 5).map((entry) => ({
      title: entry.title || entry.topicKey || '未命名范文',
      docRole: entry.docRole || '',
      topicType: entry.topicType || '',
      themeTag: entry.themeTag || '',
      sourceFile: entry.sourceFile || '',
      scoreBand: entry.scoreBand || null,
      matchScore: entry.matchScore,
      reasons: entry.matchReasons || []
    })),
    teacherAnchors: buildObsidianTeacherAnchors(signal, offTopic),
    weakWarnings
  };
}

function applyObsidianOffTopicCalibration(report, calibration) {
  if (!report || !calibration) return report;
  report.obsidianCalibration = calibration;
  const lowDimCount = (report.scaffold?.dimensions || []).filter((item) => Number(item.score || 0) < 58).length;
  let lift = 0;
  if (calibration.confidence >= 55 && calibration.score >= 66) {
    lift = clamp(Math.round((calibration.score - 58) / 6), 1, 7);
  }
  if (lowDimCount >= 2) lift = Math.min(lift, 3);
  if (calibration.confidence < 35) lift = 0;
  if (lift) {
    report.riskScore = clamp(Number(report.riskScore || 0) + lift, 0, 100);
    report.riskLevel = report.riskScore < 50 ? '高风险' : (report.riskScore < 75 ? '中风险' : '低风险');
  }
  report.evidence = [
    ...(report.evidence || []),
    calibration.indexSize
      ? `OB标杆校准：加载${calibration.indexSize}篇，命中${calibration.matched.length}篇，校准可信度${calibration.confidence}/100。`
      : 'OB标杆校准：未加载到范文索引，本次只使用规则引擎。'
  ];
  if (calibration.teacherAnchors?.length) {
    report.suggestions = dedupeArray([
      ...(report.suggestions || []),
      `OB对照动作：${calibration.teacherAnchors[0]}`
    ]);
  }
  return report;
}

async function buildOffTopicCheckReport(topic, draft) {
  const report = runOffTopicCheck(topic, draft);
  const analysis = analyzeEssayTopic(topic);
  try {
    const calibration = await buildObsidianOffTopicCalibration(topic, report.draft || draft, analysis, report);
    applyObsidianOffTopicCalibration(report, calibration);
  } catch (error) {
    report.obsidianCalibration = {
      score: 0,
      confidence: 0,
      indexSize: 0,
      matched: [],
      teacherAnchors: ['OB范文库暂未完成校准，本次按题眼矩阵与本地规则判断。'],
      weakWarnings: [`OB校准失败：${error?.message || '未知错误'}`]
    };
  }
  return report;
}

function buildEmbeddedObsidianBenchmarkSync(topic, draft, analysis, offTopic) {
  const index = getEmbeddedObsidianEntryIndex();
  const supportProfile = getEmbeddedObsidianSupportProfile();
  const matches = getObsidianMatchedEntriesFromIndex(index, topic, draft, analysis, 5);
  const signal = buildObsidianCorpusSupportSignal(matches, analysis, topic, draft);
  const signals = offTopic?.expertSignals || assessExpertEssaySignals(topic, draft, {
    topicPhrases: analysis?.topicPhrases || offTopic?.topicPhrases || [],
    semanticBridgeScore: offTopic?.semanticBridgeScore || 0
  });
  const highScoreProfile = buildHighScoreEssayProfile(topic, draft, analysis, offTopic);
  const corpusScore = clamp(Math.round(signal.topMatch * 0.4 + Number(signals.score || 0) * 0.32 + Number(offTopic?.semanticBridgeScore || 0) * 0.18 + Math.min(10, signal.highScoreCount * 3)), 0, 100);
  const score = clamp(Math.max(corpusScore, supportProfile?.highScoreCount ? Math.round(highScoreProfile.score * 0.88) : 0), 0, 100);
  return {
    score,
    corpusScore,
    indexSize: index.length,
    supportProfile,
    highScoreProfile,
    matched: matches.map((entry) => ({
      title: entry.title || entry.topicKey || '未命名范文',
      docRole: entry.docRole || '',
      topicType: entry.topicType || '',
      themeTag: entry.themeTag || '',
      sourceFile: entry.sourceFile || '',
      scoreBand: entry.scoreBand || null,
      matchScore: entry.matchScore,
      reasons: entry.matchReasons || []
    })),
    traits: [
      `高分画像：${highScoreProfile.label}（${highScoreProfile.score}/100）`,
      signal.typeSupport ? `同题型OB标杆${signal.typeSupport}篇` : '',
      signal.themeSupport ? `同母题OB标杆${signal.themeSupport}篇` : '',
      signal.highScoreCount ? `命中高分档案${signal.highScoreCount}篇` : '',
      score >= 68 ? '与高分文题意推进较接近' : 'OB标杆仅作参考，仍需看原文证据'
    ].filter(Boolean)
  };
}

function scoreEssayDraft(topic, draft) {
  const offTopic = runOffTopicCheck(topic, draft);
  const reviewDraft = offTopic.draft || normalizeDraftForReview(topic, draft);
  const analysis = analyzeEssayTopic(topic);
  const obsidianBenchmark = buildEmbeddedObsidianBenchmarkSync(topic, reviewDraft, analysis, offTopic);
  offTopic.obsidianBenchmark = obsidianBenchmark;
  const paragraphs = splitParagraphs(reviewDraft);
  const sentenceCount = splitSentences(reviewDraft).length;
  const wordCount = countWords(reviewDraft);
  const dims = offTopic.scaffold?.dimensions || [];
  const d1 = dims.find((d) => d.id === 'd1')?.score || 0;
  const d2 = dims.find((d) => d.id === 'd2')?.score || 0;
  const d3 = dims.find((d) => d.id === 'd3')?.score || 0;
  const d5 = dims.find((d) => d.id === 'd5')?.score || 0;
  const d6 = dims.find((d) => d.id === 'd6')?.score || 0;
  const logicCount = countMatches(reviewDraft, /(因为|所以|因此|由此|意味着|从而|这说明|关键在于|本质上|机制)/gi);
  const evidenceCount = countMatches(reviewDraft, /(例如|比如|案例|以.*为例|数据|正如|从.*看|短视频|平台|人工智能|校园|社会)/gi);
  const turnCount = countMatches(reviewDraft, /(诚然|然而|另一方面|同时|反过来|不过|并非|未必|但是)/gi);

  const relevance = clamp(Math.round((d1 * 0.45 + d2 * 0.25 + d5 * 0.3) / 5), 0, 20);
  const structure = clamp(Math.round(((paragraphs.length >= 3 ? 70 : 45) + Math.min(20, sentenceCount * 1.8) + Math.min(10, d6 * 0.1)) / 5), 0, 20);
  const argument = clamp(Math.round((Math.min(45, logicCount * 8) + Math.min(30, evidenceCount * 10) + Math.min(25, turnCount * 8)) / 5), 0, 20);
  const language = clamp(wordCount >= 850 ? 15 : wordCount >= 760 ? 18 : wordCount >= 620 ? 16 : wordCount >= 450 ? 13 : 10, 0, 20);
  const depth = clamp(Math.round((d2 * 0.3 + d3 * 0.45 + d5 * 0.25) / 5), 0, 20);
  const benchmarkLift = wordCount >= 600 && obsidianBenchmark.score >= 68 && relevance >= 11
    ? clamp(Math.round((obsidianBenchmark.score - 60) / 12), 1, 4)
    : 0;
  const total = clamp(relevance + structure + argument + language + depth + benchmarkLift, 0, 100);
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
    obsidianBenchmark,
    actions: [
      relevance < 15 ? '审题立意偏弱：先界定概念，再明确成立条件。' : '审题扣题较稳。',
      argument < 15 ? '论证链不足：每个例子后补“机制解释句”。' : '论证基础可用。',
      depth < 15 ? '思辨深度待提升：补“诚然-然而-因此”并写边界。' : '思辨层次基本达标。',
      benchmarkLift ? `OB高分库命中同型标杆，维度评分补偿${benchmarkLift}分。` : 'OB高分库暂未给出额外补偿。'
    ]
  };
}

const STALE_MATERIAL_PATTERNS = [
  '司马迁', '屈原', '苏武', '爱迪生', '海伦凯勒', '居里夫人', '霍金', '贝多芬', '牛顿', '达芬奇'
];

const CURRENT_MATERIAL_PATTERNS = [
  '人工智能', 'AI', '算法', '平台', '短视频', '社交媒体', 'ChatGPT', '芯片', '航天', '碳中和', '外卖', '直播'
];

function getDraftSentenceMap(draft) {
  return splitParagraphs(draft).map((paragraph, index) => ({
    index,
    text: paragraph,
    sentences: splitSentences(paragraph)
  }));
}

function takeSentencePreview(sentence, maxLen = 26) {
  const clean = String(sentence || '').replace(/\s+/g, '').trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen)}…`;
}

function findSentenceLocation(draft, sentence) {
  const sentenceMap = getDraftSentenceMap(draft);
  const target = String(sentence || '').trim();
  for (const row of sentenceMap) {
    const hit = row.sentences.find((x) => target && x.includes(target));
    if (hit) return { paragraphIndex: row.index, sentence: hit };
  }
  return null;
}

function getCoreIntentBand(offTopic) {
  const riskScore = Number(offTopic?.riskScore || 0);
  const topicFit = Number((offTopic?.scaffold?.dimensions || []).find((d) => d.id === 'd1')?.score || 0);
  const bridge = Number(offTopic?.semanticBridgeScore || 0);
  const expert = Number(offTopic?.expertSignals?.score || 0);
  const calibratedFit = Math.max(topicFit, Math.round(bridge * 0.72 + expert * 0.18));
  const calibratedRisk = Math.max(riskScore, expert >= 78 && bridge >= 65 ? 72 : 0);
  const score = Math.round((calibratedRisk * 0.48 + calibratedFit * 0.36 + expert * 0.16) / 100 * 18);
  if (calibratedRisk >= 80 && calibratedFit >= 75) {
    return { band: '一类', score: clamp(score, 15, 18), detail: '紧扣材料核心问法，未见明显偏题。' };
  }
  if (calibratedRisk >= 60 && calibratedFit >= 55) {
    const note = offTopic?.reviewInfo?.removedHeadings?.length ? '系统已忽略标题/题记后评分；' : '';
    return { band: '二类', score: clamp(score, 11, 15), detail: `${note}基本扣住材料，但局部段落还需更显性回扣题眼。` };
  }
  if (calibratedRisk >= 40 && calibratedFit >= 35) {
    return { band: '三类', score: clamp(score, 7, 11), detail: '能碰到材料边缘，但核心立意不稳，容易写散。' };
  }
  return { band: '四类', score: clamp(score, 0, 7), detail: '偏离材料核心明显，文章主要在自说自话。' };
}

function assessThesisLine(topic, draft, analysis) {
  const paragraphs = splitParagraphs(draft);
  const sentenceMap = getDraftSentenceMap(draft);
  const topicPhrases = analysis.topicPhrases || [];
  const thesisPattern = /(我认为|在我看来|我更倾向于|本文|主张|关键在于|真正|不是|而是|不在于|取决于|因此|可见|应当|需要|可以|不能|并非|未必|意义|本质)/;
  let thesisSentence = '';
  let thesisParagraph = -1;
  let bestScore = -1;
  sentenceMap.slice(0, Math.min(4, sentenceMap.length)).forEach((row) => {
    row.sentences.forEach((sentence) => {
      const compactLen = String(sentence || '').replace(/\s+/g, '').length;
      if (compactLen < 10 || compactLen > 130) return;
      const topicHits = topicPhrases.filter((phrase) => phrase && sentence.includes(phrase)).length;
      const stance = thesisPattern.test(sentence) ? 1 : 0;
      const condition = /(前提|条件|边界|若|如果|当.*时|在.*下|并非|未必|不必|不能绝对|并不意味着)/.test(sentence) ? 1 : 0;
      const relation = /(关系|机制|标准|价值|结果|代价|路径|张力|制约|转化|统一|平衡)/.test(sentence) ? 1 : 0;
      const score = topicHits * 18 + stance * 20 + condition * 14 + relation * 12 + (row.index <= 1 ? 8 : 0) + (compactLen >= 22 ? 6 : 0);
      if (score > bestScore) {
        bestScore = score;
        thesisSentence = sentence;
        thesisParagraph = row.index;
      }
    });
  });
  if (bestScore < 18) {
    thesisSentence = '';
    thesisParagraph = -1;
  }
  const thesisKeywords = normalizeTopicPhrases(extractTopicPhrases(thesisSentence || analysis.thesis || topic));
  const carryingParagraphs = paragraphs.filter((paragraph) =>
    [...topicPhrases.slice(0, 4), ...thesisKeywords.slice(0, 3)].some((kw) => kw && paragraph.includes(kw))
  ).length;
  const carryRatio = paragraphs.length ? carryingParagraphs / paragraphs.length : 0;
  const qualityBonus = thesisSentence && /(前提|条件|边界|不是.*而是|不在于.*而在于|取决于|并非|未必|关系|机制|标准)/.test(thesisSentence) ? 1 : 0;
  const score = clamp((thesisSentence ? 5 : 1) + Math.round(carryRatio * 4) + qualityBonus, 0, 10);
  return {
    score,
    max: 10,
    thesisSentence,
    thesisParagraph,
    carryRatio,
    detail: thesisSentence
      ? `中心论点已出现，位于第${thesisParagraph + 1}段；但是否贯穿，要看后文是否持续回扣。`
      : '开头两段没有稳定立住中心论点，读者需要替你猜观点。'
  };
}

function assessArgumentLogic(draft) {
  const quoteCount = countMatches(draft, /(“[^”]{2,24}”|曾言|曾说|曾指出|正如|正所谓|孔子|鲁迅)/g);
  const exampleCount = countMatches(draft, /(例如|比如|以.+?为例|案例|譬如|从.+?看|屈原|司马迁|AI|人工智能|短视频|社交媒体|航天|校园|平台|技术|社会)/g);
  const metaphorCount = countMatches(draft, /(像|如同|仿佛|恰似|好比|不是.+而是.+)/g);
  const turnCount = countMatches(draft, /(诚然|然而|但是|不过|另一方面|同时|反过来)/g);
  const logicCount = countMatches(draft, /(因为|所以|因此|由此|从而|意味着|这说明|可见|关键在于|其机制|本质上|原因在于|换言之)/g);
  const abstractCount = countMatches(draft, /(价值|标准|机制|本质|关系|边界|前提|条件|主体|公共|现实|时代)/g);
  const score = clamp(
    Math.min(4, logicCount) +
    Math.min(3, turnCount) +
    (quoteCount > 0 ? 1 : 0) +
    (exampleCount > 0 ? 2 : 0) +
    Math.min(2, Math.floor(abstractCount / 3)) +
    (metaphorCount > 0 ? 1 : 0),
    0,
    12
  );
  return {
    score,
    max: 12,
    quoteCount,
    exampleCount,
    metaphorCount,
    detail: `引证${quoteCount}处，例证${exampleCount}处，比喻论证${metaphorCount}处；逻辑转折${turnCount}处，因果推进${logicCount}处，抽象分析词${abstractCount}处。`
  };
}

function assessMaterialFreshness(draft) {
  const staleHits = STALE_MATERIAL_PATTERNS.filter((name) => draft.includes(name));
  const freshHits = CURRENT_MATERIAL_PATTERNS.filter((name) => draft.includes(name));
  const realityHits = ['现实', '时代', '社会', '校园', '青年', '公共', '媒介', '传播', '消费', '技术'].filter((name) => draft.includes(name));
  let score = 6;
  if (freshHits.length) score += 2;
  else if (realityHits.length >= 2) score += 1;
  if (staleHits.length && !freshHits.length) score -= 2;
  if (!staleHits.length && !freshHits.length && realityHits.length < 2) score -= 1;
  return {
    score: clamp(score, 0, 8),
    max: 8,
    staleHits,
    freshHits,
    detail: staleHits.length && !freshHits.length
      ? `检测到较常见素材：${staleHits.join('、')}；按约定扣2分。`
      : (freshHits.length
        ? `能看到较新的现实材料：${freshHits.join('、')}。`
        : (realityHits.length >= 2 ? `虽未出现热点名词，但有现实语境：${realityHits.slice(0, 4).join('、')}。` : '未见明显过时素材，但现实材料的新鲜度还不够高。'))
  };
}

function assessLanguageExpression(topic, draft, analysis) {
  const sentenceQuality = analyzeSentenceQuality(topic, draft, analysis.topicPhrases || []);
  const duplicated = splitSentences(draft).filter((sentence, idx, arr) => sentence && arr.indexOf(sentence) !== idx);
  const tooLong = splitSentences(draft).filter((sentence) => sentence.replace(/\s+/g, '').length >= 60);
  const punctuationIssue = countMatches(draft, /(。。|，，|；；|！！|？？|、，|，。)/g);
  const quoteMismatch = (countMatches(draft, /“/g) !== countMatches(draft, /”/g)) ? 1 : 0;
  const typoEstimate = duplicated.length + punctuationIssue + quoteMismatch;
  let score = 6 + Math.min(2, (sentenceQuality.good || []).length) - Math.min(3, typoEstimate) - Math.min(2, tooLong.length > 2 ? 2 : tooLong.length);
  score = clamp(score, 0, 10);
  return {
    score,
    max: 10,
    typoEstimate,
    goodSentences: sentenceQuality.good || [],
    weakSentences: dedupeArray([...(sentenceQuality.bad || []), ...tooLong.slice(0, 2), ...duplicated.slice(0, 1)]).slice(0, 3),
    detail: `疑似病句/冗长句${tooLong.length}处，重复句${duplicated.length}处，标点或引号问题${punctuationIssue + quoteMismatch}处。`
  };
}

function assessStructureDraft(draft, analysis) {
  const paragraphs = splitParagraphs(draft);
  const intro = paragraphs[0] || '';
  const ending = paragraphs[paragraphs.length - 1] || '';
  const turnCount = countMatches(draft, /(然而|但|不过|另一方面|同时|进一步说|再看|最后)/g);
  const hasOpening = intro.length >= 30;
  const hasEnding = ending.length >= 25 && /(因此|所以|总之|回到题目|可见|由此看来)/.test(ending);
  const hasMiddle = paragraphs.length >= 4;
  const score = clamp((hasOpening ? 2 : 1) + (hasMiddle ? 3 : 1) + (turnCount >= 2 ? 2 : 1) + (hasEnding ? 1 : 0), 0, 8);
  return {
    score,
    max: 8,
    paragraphs: paragraphs.length,
    detail: `当前共${paragraphs.length}段；${hasOpening ? '起段已入题' : '起段入题偏慢'}，${hasEnding ? '结尾有收束' : '结尾收束偏弱'}。`
  };
}

async function assessHandwritingByOCR(draft) {
  if (!HANDWRITING_SCAN_STATE.pages.length) {
    return {
      score: 2,
      max: 4,
      detail: '当前只输入了文本，未上传手写作文图片，OCR无法判断涂改与书写；本项暂按中档估计。'
    };
  }
  try {
    const ocr = await runHandwritingOcrAnalysis(draft);
    let score = 4;
    if (ocr.confidence < 74) score -= 1;
    if (ocr.noiseRatio > 0.12) score -= 1;
    if (ocr.overwriteRisk === '中') score -= 1;
    if (ocr.overwriteRisk === '高') score -= 2;
    if (ocr.overlapRatio > 0 && ocr.overlapRatio < 0.45) score -= 1;
    score = clamp(score, 1, 4);
    const detail = [
      `已识别${HANDWRITING_SCAN_STATE.pages.length}页手写图片，平均置信度约${Math.round(ocr.confidence)}%。`,
      `疑似噪音率约${Math.round(ocr.noiseRatio * 100)}%，文本匹配度约${Math.round(ocr.overlapRatio * 100)}%。`,
      `疑似涂改风险：${ocr.overwriteRisk}。`
    ].join('');
    return { score, max: 4, detail };
  } catch (error) {
    HANDWRITING_SCAN_STATE.status = 'error';
    HANDWRITING_SCAN_STATE.error = error?.message || 'OCR识别失败';
    updateHandwritingUi('error', `OCR识别失败：${HANDWRITING_SCAN_STATE.error}`);
    return {
      score: 2,
      max: 4,
      detail: `已上传手写图片，但OCR识别失败：${HANDWRITING_SCAN_STATE.error}；本项暂按中档估计。`
    };
  }
}

function buildParagraphIssueRowsForTeacher(topic, draft, offTopic, thesisCheck) {
  const adviceList = offTopic?.paragraphAdvice || [];
  return adviceList.map((item) => ({
    index: item.index,
    paragraph: item.index + 1,
    score: item.score,
    role: item.role,
    evidenceSentence: item.evidenceSentence,
    issue: item.focus,
    suggestion: item.suggestion,
    task: item.task,
    issues: item.issues || []
  })).slice(0, 5);
}

function getTeacherScoreCalibrationFloor({ draft, offTopic, thesis, argument, material, language, structure }) {
  const signals = offTopic?.expertSignals || assessExpertEssaySignals(offTopic?.topic || '', draft, {
    topicPhrases: offTopic?.topicPhrases || [],
    semanticBridgeScore: offTopic?.semanticBridgeScore || 0
  });
  const rubric = buildShanghaiOfficialRubricSignals({ offTopic, thesis, argument, material, language, structure, wordCount: countWords(draft) });
  const bridge = Number(offTopic?.semanticBridgeScore || signals.bridge || 0);
  const benchmarkScore = Number(offTopic?.obsidianBenchmark?.score || 0);
  const profile = offTopic?.obsidianBenchmark?.highScoreProfile || null;
  const profileScore = Number(profile?.score || 0);
  const sourceGrade = offTopic?.reviewInfo?.sourceGrade || null;
  const sourceHighScore = Number(sourceGrade?.score || 0) >= 63 || /一类|上等/.test(String(sourceGrade?.label || ''));
  const highScoreAnchor = (offTopic?.obsidianBenchmark?.matched || []).some((item) => item.scoreBand?.isHighScore || /高分|佳作|一类|下水/.test(String(`${item.docRole || ''}${item.sourceFile || ''}`)));
  const wordCount = countWords(draft);
  if (wordCount < 500) return 0;
  const stableThesis = Number(thesis?.score || 0) >= 7;
  const stableArgument = Number(argument?.score || 0) >= 8;
  const stableStructure = Number(structure?.score || 0) >= 6;
  const languageOk = Number(language?.score || 0) >= 7;
  if (wordCount >= 760 && sourceHighScore && profileScore >= 84 && benchmarkScore >= 80 && highScoreAnchor && rubric.topicAccuracy >= 78 && rubric.thoughtDepth >= 76 && stableThesis && stableArgument && stableStructure && languageOk) {
    return clamp(Number(sourceGrade?.score || 67) - 2, 63, 68);
  }
  if (wordCount >= 780 && profileScore >= 88 && Number(profile?.moveScore || 0) >= 76 && rubric.topicAccuracy >= 80 && rubric.innovation >= 82 && stableThesis && stableArgument && stableStructure && languageOk) return 63;
  if (wordCount >= 680 && benchmarkScore >= 76 && highScoreAnchor && signals.score >= 76 && bridge >= 58 && rubric.topicAccuracy >= 66 && Number(thesis?.score || 0) >= 6 && Number(argument?.score || 0) >= 7 && Number(structure?.score || 0) >= 5 && Number(language?.score || 0) >= 6) return 58;
  if (signals.score >= 78 && bridge >= 64 && rubric.qualityScore >= 66 && Number(thesis?.score || 0) >= 6 && Number(argument?.score || 0) >= 7 && Number(structure?.score || 0) >= 5 && Number(language?.score || 0) >= 6) return 55;
  if (signals.score >= 68 && bridge >= 52 && stableStructure) return 45;
  return 0;
}

function detectMissingTitle(originalDraft, reviewInfo = {}) {
  const removed = reviewInfo?.removedHeadings || [];
  if (removed.length) return false;
  const first = splitParagraphs(originalDraft)[0] || '';
  const compact = first.replace(/\s+/g, '');
  if (!compact) return true;
  if (compact.length <= 26 && splitSentences(first).length <= 1 && !/[，,；;。！？!?]/.test(first)) return false;
  return true;
}

function parseSourceGradeMetadata(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return null;
  const scoreMatch = raw.match(/([1-6]\d|70)\s*分/);
  const levelMatch = raw.match(/(一类上|一类中|一类下|一类|二类|三类|四类|五类|上等|中上|中等|下等)/);
  if (!scoreMatch && !levelMatch) return null;
  let score = scoreMatch ? clamp(parseInt(scoreMatch[1], 10), 0, 70) : 0;
  const label = levelMatch ? levelMatch[1] : getShanghaiOfficialBand(score);
  if (!score) {
    if (/一类上|上等/.test(label)) score = 66;
    else if (/一类中|一类/.test(label)) score = 62;
    else if (/一类下/.test(label)) score = 58;
    else if (/二类|中上/.test(label)) score = 56;
    else if (/三类|中等/.test(label)) score = 45;
    else if (/四类/.test(label)) score = 30;
    else score = 18;
  }
  return {
    score,
    label,
    text: raw
  };
}

function stripSourceGradeText(text) {
  return String(text || '')
    .replace(/[（(][^）)]*(?:一类上|一类中|一类下|一类|二类|三类|四类|五类|上等|中上|中等|下等|[1-6]\d\s*分|70\s*分)[^）)]*[）)]/g, '')
    .replace(/(?:一类上|一类中|一类下|一类|二类|三类|四类|五类|上等|中上|中等|下等)\s*(?:[1-6]\d|70)?\s*分?/g, '')
    .replace(/(?:[1-6]\d|70)\s*分/g, '')
    .replace(/^(标题|题目)[:：]/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyAuthorHeading(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  return /(学校|中学|高中|班|姓名|作者|指导老师|高[一二三]|初[一二三]|同学|大学|实验学校)/.test(raw)
    && !/(不是.*而是|关键|本质|价值|关系|因此|然而|所谓|可见)/.test(raw);
}

function estimateTypoAndPunctuationPenalty(draft) {
  const punctuationIssue = countMatches(draft, /(。。|，，|；；|！！|？？|、，|，。|,,|!!|\?\?)/g);
  const quoteMismatch = countMatches(draft, /“/g) !== countMatches(draft, /”/g) ? 1 : 0;
  const obviousTypos = countMatches(draft, /(的地得的|因该|再次|布冯在心底|错别字占位)/g);
  const typoPenalty = Math.min(
    OB_SHANGHAI_SCORE_STANDARD.penalties.typoMax,
    Math.floor(Math.max(0, obviousTypos) / OB_SHANGHAI_SCORE_STANDARD.penalties.typoEvery)
  );
  const punctuationPenalty = punctuationIssue >= 3 ? 1 : 0;
  return clamp(typoPenalty + punctuationPenalty + quoteMismatch, 0, OB_SHANGHAI_SCORE_STANDARD.penalties.typoMax);
}

function getShanghaiOfficialBand(score) {
  const n = Number(score || 0);
  if (n >= 63) return '一类卷（63-70分）';
  if (n >= 52) return '二类卷（52-62分）';
  if (n >= 39) return '三类卷（39-51分）';
  if (n >= 21) return '四类卷（21-38分）';
  return '五类卷（20分以下）';
}

function getShanghaiBandProfile(key = 'class3') {
  return OB_SHANGHAI_SCORE_STANDARD.bands[key] || OB_SHANGHAI_SCORE_STANDARD.bands.class3;
}

function getShanghaiSecondClassLaneProfile(key = 'middle') {
  return OB_SHANGHAI_SCORE_STANDARD.secondClassLanes[key] || OB_SHANGHAI_SCORE_STANDARD.secondClassLanes.middle;
}

function buildShanghaiOfficialRubricSignals({ offTopic, thesis, argument, material, language, structure, wordCount }) {
  const riskScore = Number(offTopic?.riskScore || 0);
  const bridge = Number(offTopic?.semanticBridgeScore || 0);
  const expert = Number(offTopic?.expertSignals?.score || 0);
  const selfAxis = Number(offTopic?.expertSignals?.selfAxisScore || 0);
  const benchmark = offTopic?.obsidianBenchmark || null;
  const profileScore = Number(benchmark?.highScoreProfile?.score || 0);
  const moveScore = Number(benchmark?.highScoreProfile?.moveScore || 0);
  const topicAccuracy = clamp(Math.round(riskScore * 0.44 + bridge * 0.34 + expert * 0.12 + (Number(thesis?.score || 0) / Math.max(Number(thesis?.max || 1), 1)) * 10), 0, 100);
  const thesisStable = clamp(Math.round((Number(thesis?.score || 0) / Math.max(Number(thesis?.max || 1), 1)) * 100), 0, 100);
  const logicStrength = clamp(Math.round((Number(argument?.score || 0) / Math.max(Number(argument?.max || 1), 1)) * 100), 0, 100);
  const structureStable = clamp(Math.round((Number(structure?.score || 0) / Math.max(Number(structure?.max || 1), 1)) * 100), 0, 100);
  const languageStable = clamp(Math.round((Number(language?.score || 0) / Math.max(Number(language?.max || 1), 1)) * 100), 0, 100);
  const materialFit = clamp(Math.round((Number(material?.score || 0) / Math.max(Number(material?.max || 1), 1)) * 100), 0, 100);
  const fullness = clamp(wordCount >= 860 ? 100 : Math.round((Math.max(0, wordCount) / 860) * 100), 0, 100);
  const thoughtDepth = clamp(Math.round(logicStrength * 0.4 + bridge * 0.22 + expert * 0.18 + selfAxis * 0.2), 0, 100);
  const innovation = clamp(Math.round(selfAxis * 0.5 + profileScore * 0.22 + moveScore * 0.18 + languageStable * 0.1), 0, 100);
  const topicTypeCode = offTopic?.topicType?.code || 'phenomenon';
  const weights = getTopicTypeScoringWeights(topicTypeCode);
  const qualityScore = clamp(Math.round(
    topicAccuracy * weights.topicAccuracy
    + thoughtDepth * weights.thoughtDepth
    + thesisStable * weights.thesisStable
    + structureStable * weights.structureStable
    + languageStable * weights.languageStable
    + materialFit * weights.materialFit
    + fullness * weights.fullness
  ), 0, 100);
  return {
    riskScore,
    bridge,
    expert,
    selfAxis,
    profileScore,
    moveScore,
    topicAccuracy,
    thesisStable,
    logicStrength,
    structureStable,
    languageStable,
    materialFit,
    fullness,
    thoughtDepth,
    innovation,
    qualityScore,
    topicTypeCode,
    topicTypeFocus: describeTopicTypeScoringFocus(topicTypeCode)
  };
}

function getShanghaiBandKeyByScore(score) {
  const n = Number(score || 0);
  if (n >= 63) return 'class1';
  if (n >= 52) return 'class2';
  if (n >= 39) return 'class3';
  if (n >= 21) return 'class4';
  return 'class5';
}

function getShanghaiBandKeyFromLabel(label) {
  const text = String(label || '');
  if (/一类/.test(text)) return 'class1';
  if (/二类/.test(text)) return 'class2';
  if (/三类/.test(text)) return 'class3';
  if (/四类/.test(text)) return 'class4';
  if (/五类/.test(text)) return 'class5';
  return '';
}

function getTopicTypeScoringWeights(topicTypeCode = 'phenomenon') {
  const base = {
    topicAccuracy: 0.26,
    thoughtDepth: 0.18,
    thesisStable: 0.12,
    structureStable: 0.14,
    languageStable: 0.14,
    materialFit: 0.08,
    fullness: 0.08
  };
  if (topicTypeCode === 'problem') {
    return { ...base, topicAccuracy: 0.29, thoughtDepth: 0.2, thesisStable: 0.14, structureStable: 0.12, languageStable: 0.11, materialFit: 0.06, fullness: 0.08 };
  }
  if (topicTypeCode === 'relation') {
    return { ...base, topicAccuracy: 0.24, thoughtDepth: 0.22, thesisStable: 0.11, structureStable: 0.16, languageStable: 0.11, materialFit: 0.06, fullness: 0.1 };
  }
  if (topicTypeCode === 'value') {
    return { ...base, topicAccuracy: 0.27, thoughtDepth: 0.19, thesisStable: 0.13, structureStable: 0.12, languageStable: 0.12, materialFit: 0.09, fullness: 0.08 };
  }
  return { ...base, topicAccuracy: 0.24, thoughtDepth: 0.2, thesisStable: 0.1, structureStable: 0.13, languageStable: 0.12, materialFit: 0.11, fullness: 0.1 };
}

function describeTopicTypeScoringFocus(topicTypeCode = 'phenomenon') {
  if (topicTypeCode === 'problem') return '问题式命题：重点看是否正面回应设问、给出条件判断，并处理“是/否/仅仅/必定”等问法。';
  if (topicTypeCode === 'relation') return '关系辩证题：重点看双方价值、相互制约与边界平衡，不能只写一端。';
  if (topicTypeCode === 'value') return '价值判断题：重点看标准辨析、价值来源、现实代价与长期后果。';
  return '现象思辨题：重点看能否从现象进入本质机制，再落回现实问题。';
}

function scoreCalibrationAnchorDistance(anchor, signals = {}) {
  const profile = anchor.profile || {};
  const weights = {
    topicAccuracy: 1.28,
    thoughtDepth: 1.22,
    thesisStable: 1,
    logicStrength: 1.05,
    structureStable: 0.9,
    languageStable: 0.78,
    materialFit: 0.7,
    fullness: 0.74,
    innovation: 0.86
  };
  const keys = Object.keys(weights).filter((key) => typeof profile[key] === 'number');
  const totalWeight = keys.reduce((sum, key) => sum + weights[key], 0) || 1;
  const distance = keys.reduce((sum, key) => {
    const current = Number(signals[key] || 0);
    const target = Number(profile[key] || 0);
    return sum + Math.abs(current - target) * weights[key];
  }, 0) / totalWeight;
  return clamp(Math.round(distance), 0, 100);
}

function findShanghaiScoreCalibrationAnchor({ signals, sourceGrade, benchmark, rawScore }) {
  const sourceBandKey = sourceGrade?.score ? getShanghaiBandKeyByScore(sourceGrade.score) : '';
  const rawBandKey = getShanghaiBandKeyByScore(rawScore);
  const benchmarkScore = Number(benchmark?.score || 0);
  const profileScore = Number(benchmark?.highScoreProfile?.score || 0);
  const scored = SHANGHAI_SCORE_CALIBRATION_ANCHORS
    .map((anchor) => {
      const distance = scoreCalibrationAnchorDistance(anchor, signals);
      let confidence = clamp(100 - distance, 0, 100);
      if (sourceBandKey && sourceBandKey === anchor.bandKey) confidence += 8;
      if (!sourceBandKey && rawBandKey === anchor.bandKey) confidence += 4;
      if (anchor.bandKey === 'class1' && (benchmarkScore >= 78 || profileScore >= 82)) confidence += 5;
      if (anchor.bandKey === 'class2' && benchmarkScore >= 66) confidence += 3;
      return { ...anchor, distance, confidence: clamp(Math.round(confidence), 0, 100) };
    })
    .sort((a, b) => b.confidence - a.confidence);
  return scored[0] || null;
}

function buildShanghaiScoreCalibrationDecision({ signals, sourceGrade, benchmark, rawScore, wordCount }) {
  const anchor = findShanghaiScoreCalibrationAnchor({ signals, sourceGrade, benchmark, rawScore });
  const sourceScore = Number(sourceGrade?.score || 0);
  const sourceHighScore = sourceScore >= 63 || /一类|上等/.test(String(sourceGrade?.label || ''));
  const rawBandKey = getShanghaiBandKeyByScore(rawScore);
  const profile = benchmark?.highScoreProfile || null;
  const supportHighScore = Number(profile?.score || 0) >= 78
    || Number(benchmark?.score || 0) >= 74
    || Number(signals?.thoughtDepth || 0) >= 74
    || Number(signals?.innovation || 0) >= 76;
  const strongHighScoreSupport = Number(profile?.score || 0) >= 84
    || Number(benchmark?.score || 0) >= 80
    || (
      Number(signals?.topicAccuracy || 0) >= 82
      && Number(signals?.thoughtDepth || 0) >= 82
      && Number(signals?.innovation || 0) >= 78
      && Number(signals?.structureStable || 0) >= 72
    );
  let target = rawScore;
  let effect = '只做参照，不调整';
  let confidence = Number(anchor?.confidence || 0);
  const evidence = [];
  if (anchor) {
    evidence.push(`最接近“${anchor.label}”，置信度${confidence}/100，预期${anchor.expectedScore}分。`);
  }
  if (sourceGrade?.score) {
    evidence.push(`检测到资料原评：${sourceGrade.label} ${sourceGrade.score}分。`);
  }
  if (profile) {
    evidence.push(`OB高分画像${Math.round(profile.score || 0)}/100。`);
  }

  if (sourceHighScore && wordCount >= 720 && supportHighScore && rawScore < sourceScore - 5) {
    target = clamp(sourceScore - 3, 63, Math.min(68, sourceScore));
    effect = '资料原评+OB画像复核：防止一类样本被规则误压';
    confidence = Math.max(confidence, 86);
  } else if (anchor && confidence >= 86 && (
    anchor.bandKey === rawBandKey
    || sourceGrade?.score
    || (strongHighScoreSupport && (anchor.bandKey !== 'class1' || wordCount >= 760))
  ) && Math.abs(rawScore - anchor.expectedScore) >= 5) {
    const maxStep = anchor.bandKey === 'class1' ? 4 : 3;
    target = rawScore + clamp(anchor.expectedScore - rawScore, -maxStep, maxStep);
    effect = rawScore < anchor.expectedScore ? '锚点校准：当前偏严，小幅上调' : '锚点校准：当前偏松，小幅下调';
  } else if (anchor && confidence >= 80 && anchor.bandKey === 'class1' && rawScore < 63 && wordCount >= 760 && strongHighScoreSupport) {
    target = 63;
    effect = '一类入口锚点复核：先放入一类下限人工复核';
  }

  const bandProfile = getShanghaiBandProfile(getShanghaiBandKeyByScore(target) || anchor?.bandKey);
  if (anchor?.bandKey && bandProfile) {
    target = clamp(target, bandProfile.min, bandProfile.max);
  }

  return {
    anchorId: anchor?.id || '',
    anchorLabel: anchor?.label || '暂无稳定锚点',
    expectedScore: anchor?.expectedScore || 0,
    expectedBand: anchor ? getShanghaiBandProfile(anchor.bandKey).label : '',
    confidence,
    effect,
    adjustedScore: Math.round(target),
    evidence: evidence.join(' ')
  };
}

function determineShanghaiSecondClassLane(signals) {
  if (signals.qualityScore >= 74 && (signals.innovation >= 72 || signals.thoughtDepth >= 70)) {
    return getShanghaiSecondClassLaneProfile('upper');
  }
  if (signals.qualityScore >= 62) {
    return getShanghaiSecondClassLaneProfile('middle');
  }
  return getShanghaiSecondClassLaneProfile('lower');
}

function scoreWithinShanghaiBand(assessment) {
  const bandKey = assessment?.bandKey || assessment?.key || 'class3';
  const signals = assessment?.signals || {};
  const lane = assessment?.lane || null;
  if (bandKey === 'class1') {
    let score = getShanghaiBandProfile('class1').baseline;
    if (signals.thoughtDepth >= 88) score += 1;
    if (signals.innovation >= 86) score += 1;
    if (signals.languageStable >= 82) score += 1;
    if (signals.structureStable >= 88) score += 1;
    if (signals.materialFit >= 80) score += 1;
    if (signals.thesisStable < 80) score -= 1;
    if (signals.languageStable < 76) score -= 1;
    if (signals.structureStable < 82) score -= 1;
    if (signals.fullness < 84) score -= 1;
    return clamp(score, 63, 70);
  }
  if (bandKey === 'class2') {
    const laneProfile = lane || getShanghaiSecondClassLaneProfile('middle');
    let score = laneProfile.baseline;
    if (signals.innovation >= 78) score += 1;
    if (signals.thoughtDepth >= 74) score += 1;
    if (signals.languageStable < 60) score -= 1;
    if (signals.structureStable < 60) score -= 1;
    if (signals.thesisStable < 58) score -= 1;
    return clamp(score, laneProfile.min, laneProfile.max);
  }
  if (bandKey === 'class3') {
    let score = getShanghaiBandProfile('class3').baseline;
    if (signals.qualityScore >= 58) score += 3;
    else if (signals.qualityScore >= 50) score += 1;
    if (signals.languageStable < 40) score -= 2;
    if (signals.structureStable < 40) score -= 2;
    if (signals.topicAccuracy < 46) score -= 2;
    return clamp(score, 39, 51);
  }
  if (bandKey === 'class4') {
    let score = getShanghaiBandProfile('class4').baseline;
    if (signals.topicAccuracy >= 34) score += 3;
    if (signals.structureStable >= 42) score += 2;
    if (signals.languageStable < 30) score -= 3;
    if (signals.fullness < 55) score -= 2;
    return clamp(score, 21, 38);
  }
  let score = getShanghaiBandProfile('class5').baseline;
  if (signals.topicAccuracy < 20) score -= 3;
  if (signals.fullness < 45) score -= 2;
  return clamp(score, 0, 20);
}

function getHighScoreMoveCounts(draft) {
  const text = String(draft || '');
  return {
    definition: countMatches(text, /(所谓|不是.+而是|并非|不在于.+而在于|关键在于|本质上|这并不意味着|真正)/g),
    transition: countMatches(text, /(诚然|然而|但|但是|不过|另一方面|与此同时|进一步看|反过来|当然)/g),
    mechanism: countMatches(text, /(因为|所以|因此|由此|从而|意味着|机制|原因在于|这说明|可见|正因如此|取决于)/g),
    boundary: countMatches(text, /(边界|前提|条件|并不|未必|不能|不是绝对|并非必然|在.+情况下|若|如果|只有当)/g),
    reality: countMatches(text, /(现实|当下|时代|社会|校园|技术|平台|媒介|公共|青年|生活中|今天)/g)
  };
}

function calculateParagraphRhythmScore(paragraphs, wordCount) {
  const count = paragraphs.length;
  const compactLengths = paragraphs.map((p) => p.replace(/\s+/g, '').length).filter(Boolean);
  const avg = compactLengths.length ? compactLengths.reduce((sum, n) => sum + n, 0) / compactLengths.length : 0;
  const longEnough = compactLengths.filter((n) => n >= 70).length;
  const tooShort = compactLengths.filter((n) => n > 0 && n < 35).length;
  let score = 36;
  if (count >= 5 && count <= 9) score += 26;
  else if (count >= 4 && count <= 11) score += 16;
  if (wordCount >= 780 && wordCount <= 1150) score += 22;
  else if (wordCount >= 650) score += 14;
  if (avg >= 90 && avg <= 190) score += 12;
  else if (avg >= 65 && avg <= 230) score += 7;
  if (longEnough >= Math.min(4, count)) score += 8;
  if (tooShort >= 3) score -= 12;
  return clamp(Math.round(score), 0, 100);
}

function calculateTopicCoverageScore(topic, draft, analysis, offTopic) {
  const paragraphs = splitParagraphs(draft);
  const terms = normalizeTopicPhrases(dedupeArray([
    ...(analysis?.topicPhrases || []),
    ...extractTopicPhrases(topic),
    ...(offTopic?.topicPhrases || [])
  ])).filter((term) => term && term.length >= 2).slice(0, 8);
  const termHits = terms.filter((term) => draft.includes(term)).length;
  const paragraphHits = paragraphs.filter((paragraph) => terms.some((term) => paragraph.includes(term))).length;
  const termRatio = terms.length ? termHits / terms.length : 0;
  const paraRatio = paragraphs.length ? paragraphHits / paragraphs.length : 0;
  const bridge = Number(offTopic?.semanticBridgeScore || 0);
  const expert = Number(offTopic?.expertSignals?.score || 0);
  return clamp(Math.round(termRatio * 36 + paraRatio * 28 + bridge * 0.22 + expert * 0.14), 0, 100);
}

function calculateHighScoreMoveScore(moveCounts) {
  const definition = Math.min(18, Number(moveCounts.definition || 0) * 7);
  const transition = Math.min(22, Number(moveCounts.transition || 0) * 6);
  const mechanism = Math.min(26, Number(moveCounts.mechanism || 0) * 4);
  const boundary = Math.min(18, Number(moveCounts.boundary || 0) * 5);
  const reality = Math.min(16, Number(moveCounts.reality || 0) * 5);
  return clamp(definition + transition + mechanism + boundary + reality, 0, 100);
}

function calculateLanguageDensityScore(draft) {
  const sentences = splitSentences(draft);
  const compactLength = String(draft || '').replace(/\s+/g, '').length;
  const abstractHits = countMatches(draft, /(价值|机制|本质|关系|边界|前提|条件|主体|公共|现实|标准|判断|结构|秩序|责任|意义|尺度|转化|生成)/g);
  const logicHits = countMatches(draft, /(因此|然而|由此|进一步|换言之|可见|正因如此|与此同时|并非|不是.+而是)/g);
  const repeated = sentences.filter((sentence, index, arr) => sentence && arr.indexOf(sentence) !== index).length;
  const overLong = sentences.filter((sentence) => sentence.replace(/\s+/g, '').length > 78).length;
  const density = compactLength ? ((abstractHits + logicHits) / compactLength) * 1000 : 0;
  let score = 45 + Math.min(28, density * 8) + Math.min(18, logicHits * 3);
  if (repeated) score -= Math.min(18, repeated * 5);
  if (overLong >= 3) score -= Math.min(14, overLong * 3);
  return clamp(Math.round(score), 0, 100);
}

function buildHighScoreEssayProfile(topic, draft, analysis, offTopic, checks = {}) {
  const paragraphs = splitParagraphs(draft).filter((p) => p.replace(/\s+/g, '').length >= 12);
  const wordCount = countWords(draft);
  const moveCounts = getHighScoreMoveCounts(draft);
  const topicCoverage = calculateTopicCoverageScore(topic, draft, analysis, offTopic);
  const moveScore = calculateHighScoreMoveScore(moveCounts);
  const rhythmScore = calculateParagraphRhythmScore(paragraphs, wordCount);
  const languageScore = calculateLanguageDensityScore(draft);
  const thesisRatio = checks.thesis?.max ? Number(checks.thesis.score || 0) / Number(checks.thesis.max || 1) : 0;
  const argumentRatio = checks.argument?.max ? Number(checks.argument.score || 0) / Number(checks.argument.max || 1) : 0;
  const structureRatio = checks.structure?.max ? Number(checks.structure.score || 0) / Number(checks.structure.max || 1) : 0;
  const selfAxis = Number(offTopic?.expertSignals?.selfAxisScore || 0);
  const expert = Number(offTopic?.expertSignals?.score || 0);
  const thesisAxisScore = clamp(Math.round(selfAxis * 0.42 + expert * 0.24 + thesisRatio * 20 + argumentRatio * 8 + structureRatio * 6), 0, 100);
  const score = clamp(Math.round(
    topicCoverage * 0.22 +
    moveScore * 0.24 +
    rhythmScore * 0.17 +
    thesisAxisScore * 0.2 +
    languageScore * 0.17
  ), 0, 100);
  const strengths = [];
  if (topicCoverage >= 72) strengths.push('题眼覆盖稳定');
  if (moveScore >= 70) strengths.push('思辨动作密集');
  if (rhythmScore >= 72) strengths.push('段落节奏接近一类卷');
  if (thesisAxisScore >= 72) strengths.push('中心轴较稳');
  if (languageScore >= 72) strengths.push('语言有论证密度');
  const gaps = [];
  if (topicCoverage < 62) gaps.push('题眼回扣不足');
  if (moveScore < 58) gaps.push('机制/转折/边界动作不足');
  if (rhythmScore < 58) gaps.push('段落节奏不像完整考场文');
  if (thesisAxisScore < 60) gaps.push('中心轴不够持续');
  if (languageScore < 58) gaps.push('语言密度偏低或重复');
  return {
    score,
    topicCoverage,
    moveScore,
    rhythmScore,
    thesisAxisScore,
    languageScore,
    moveCounts,
    wordCount,
    paragraphCount: paragraphs.length,
    strengths,
    gaps,
    label: score >= 84 ? '一类卷相似度高' : (score >= 74 ? '二类上/一类候选' : (score >= 62 ? '基本符合高分动作' : '高分画像不足'))
  };
}

function determineOfficialScoreBand({ offTopic, thesis, argument, language, structure, material, wordCount }) {
  const signals = buildShanghaiOfficialRubricSignals({ offTopic, thesis, argument, material, language, structure, wordCount });
  const openReflection = isOpenReflectionTopic(offTopic?.topic || '');
  if (wordCount < 120) {
    const profile = getShanghaiBandProfile('class5');
    return { ...profile, band: profile.label, reason: profile.rule, lane: null, signals };
  }
  if (OB_SHANGHAI_SCORE_STANDARD.penalties.under400Class5 && wordCount < 400) {
    const profile = getShanghaiBandProfile('class5');
    return { ...profile, band: profile.label, reason: '全文不足400字，按五类卷处理。', lane: null, signals };
  }
  const deepTrack = wordCount >= 760
    && signals.topicAccuracy >= 80
    && signals.thoughtDepth >= 84
    && signals.structureStable >= 75
    && signals.languageStable >= 60
    && signals.thesisStable >= 55;
  const innovationTrack = wordCount >= 760
    && signals.topicAccuracy >= 80
    && signals.innovation >= 84
    && signals.structureStable >= 72
    && signals.thoughtDepth >= 80
    && signals.thesisStable >= 55
    && (signals.languageStable >= 58 || openReflection);
  if (deepTrack || innovationTrack) {
    const profile = getShanghaiBandProfile('class1');
    const reason = deepTrack
      ? `${OB_SHANGHAI_SCORE_STANDARD.notes.class1} 当前更接近“思想深刻、结构严谨”的一类路径。`
      : `${OB_SHANGHAI_SCORE_STANDARD.notes.class1} 当前更接近“角度独特、整体完成度高”的一类路径。`;
    return { ...profile, band: profile.label, reason, lane: null, signals };
  }
  const class2Ready = wordCount >= 600
    && signals.topicAccuracy >= 60
    && signals.thesisStable >= 50
    && signals.logicStrength >= 50
    && signals.structureStable >= 50
    && signals.languageStable >= 50;
  if (class2Ready) {
    const profile = getShanghaiBandProfile('class2');
    const lane = determineShanghaiSecondClassLane(signals);
    return {
      ...profile,
      band: profile.label,
      reason: `${OB_SHANGHAI_SCORE_STANDARD.notes.class2} 当前更接近${lane.label}口径。`,
      lane,
      signals
    };
  }
  const class3Ready = wordCount >= 450
    && signals.topicAccuracy >= 42
    && signals.thesisStable >= 35
    && signals.structureStable >= 35
    && signals.languageStable >= 38;
  if (class3Ready) {
    const profile = getShanghaiBandProfile('class3');
    return { ...profile, band: profile.label, reason: profile.rule, lane: null, signals };
  }
  if (signals.topicAccuracy >= 24 || signals.structureStable >= 24 || signals.languageStable >= 24) {
    const profile = getShanghaiBandProfile('class4');
    return { ...profile, band: profile.label, reason: profile.rule, lane: null, signals };
  }
  const profile = getShanghaiBandProfile('class5');
  return { ...profile, band: profile.label, reason: profile.rule, lane: null, signals };
}

function buildObsidianScoreEngineDecision({ benchmark, sourceGrade, expert, bridge, wordCount, rawScore }) {
  const benchmarkScore = Number(benchmark?.score || 0);
  const matchedCount = (benchmark?.matched || []).length;
  const top = benchmark?.matched?.[0] || null;
  const profile = benchmark?.highScoreProfile || null;
  const profileScore = Number(profile?.score || 0);
  const highScoreAnchor = (benchmark?.matched || []).some((entry) => entry.scoreBand?.isHighScore || /高分|佳作|一类|下水|师生同写/.test(String(`${entry.docRole || ''}${entry.sourceFile || ''}`)));
  let effect = '不调整';
  let floor = 0;
  const evidence = [];
  if (matchedCount) {
    evidence.push(`命中${matchedCount}篇OB标杆，最高匹配${Math.round(top?.matchScore || 0)}。`);
  } else {
    evidence.push('未命中可用OB标杆。');
  }
  if (profile) {
    evidence.push(`高分画像${profileScore}/100：${profile.strengths?.slice(0, 3).join('、') || profile.label}。`);
  }
  if (benchmarkScore >= 84 && highScoreAnchor && wordCount >= 760 && expert >= 82 && bridge >= 68) {
    effect = '强标杆复核：仅在一类条件基本成立时保住一类入口';
    floor = 63;
  } else if (profileScore >= 88 && Number(profile?.moveScore || 0) >= 76 && wordCount >= 780) {
    effect = '高分画像复核：仅做一类入口保底，不直接抬分';
    floor = 63;
  } else if (sourceGrade?.score >= 63 && profileScore >= 82 && wordCount >= 760) {
    effect = '资料原评+高分画像双校准：防止高分样本被误压太低';
    floor = Math.max(floor, 61);
  } else if (benchmarkScore >= 76 && highScoreAnchor && wordCount >= 650 && expert >= 74 && bridge >= 58) {
    effect = '同型高分校准：允许进入二类上复核';
    floor = 58;
  } else if (profileScore >= 78 && Number(profile?.moveScore || 0) >= 62 && wordCount >= 680) {
    effect = '高分画像轻校准：先保住合格二类';
    floor = 55;
  } else if (benchmarkScore >= 66 && highScoreAnchor && wordCount >= 600 && expert >= 68) {
    effect = '轻度校准：防止误压低档';
    floor = 52;
  }
  if (sourceGrade?.score >= 63 && benchmarkScore >= 70 && wordCount >= 700 && expert >= 72 && bridge >= 56) {
    effect = '资料原评+OB双校准：保留人工复核参考';
    floor = Math.max(floor, Math.min(62, Number(sourceGrade.score || 0) - 4));
  }
  return {
    benchmarkScore,
    profileScore,
    matchedCount,
    highScoreAnchor,
    topTitle: top?.title || '',
    effect,
    floor,
    rawScore,
    evidence: evidence.join(' ')
  };
}

function computeShanghaiOfficialScore({ originalDraft, draft, offTopic, intent, thesis, argument, material, language, structure, handwriting, calibrationFloor }) {
  const wordCount = countWords(draft);
  const band = determineOfficialScoreBand({ offTopic, intent, thesis, argument, material, language, structure, wordCount });
  const sourceGrade = offTopic?.reviewInfo?.sourceGrade || parseSourceGradeMetadata(originalDraft);
  const bandSignals = band.signals || buildShanghaiOfficialRubricSignals({ offTopic, thesis, argument, material, language, structure, wordCount });
  const ratios = [
    Number(intent?.score || 0) / Math.max(Number(intent?.max || 18), 1),
    Number(thesis?.score || 0) / Math.max(Number(thesis?.max || 10), 1),
    Number(argument?.score || 0) / Math.max(Number(argument?.max || 12), 1),
    Number(material?.score || 0) / Math.max(Number(material?.max || 8), 1),
    Number(language?.score || 0) / Math.max(Number(language?.max || 10), 1),
    Number(structure?.score || 0) / Math.max(Number(structure?.max || 8), 1),
    Number(handwriting?.score || 0) / Math.max(Number(handwriting?.max || 4), 1)
  ];
  const avgRatio = ratios.reduce((sum, x) => sum + clamp(x, 0, 1), 0) / ratios.length;
  const qualityRatio = clamp(avgRatio * 0.45 + (bandSignals.qualityScore / 100) * 0.55, 0, 1);
  let rawScore = scoreWithinShanghaiBand(band);
  rawScore = Math.max(rawScore, Number(calibrationFloor || 0));

  const deductions = [];
  const adjustments = [];
  if (wordCount < 600) {
    rawScore = Math.min(rawScore, OB_SHANGHAI_SCORE_STANDARD.penalties.under600Cap);
    deductions.push(`字数不足600字，上限控制在${OB_SHANGHAI_SCORE_STANDARD.penalties.under600Cap}分以内。`);
  } else if (wordCount < 800) {
    const gapPenalty = Math.min(6, Math.ceil((800 - wordCount) / 60));
    rawScore -= gapPenalty;
    deductions.push(`未满800字，扣${gapPenalty}分。`);
  }
  if (detectMissingTitle(originalDraft, offTopic?.reviewInfo)) {
    rawScore -= OB_SHANGHAI_SCORE_STANDARD.penalties.noTitle;
    deductions.push(`未识别到标题，扣${OB_SHANGHAI_SCORE_STANDARD.penalties.noTitle}分。`);
  }
  const typoPenalty = estimateTypoAndPunctuationPenalty(draft);
  if (typoPenalty) {
    rawScore -= typoPenalty;
    deductions.push(`疑似错别字/标点问题扣${typoPenalty}分。`);
  }

  const benchmark = offTopic?.obsidianBenchmark || null;
  const benchmarkDecision = buildObsidianScoreEngineDecision({
    benchmark,
    sourceGrade,
    expert: Number(offTopic?.expertSignals?.score || 0),
    bridge: Number(offTopic?.semanticBridgeScore || 0),
    wordCount,
    rawScore
  });
  if (benchmarkDecision.floor && rawScore < benchmarkDecision.floor && benchmarkDecision.floor <= band.max) {
    rawScore = benchmarkDecision.floor;
    adjustments.push(`${benchmarkDecision.effect}，设置复核下限${benchmarkDecision.floor}分。`);
  }
  const benchmarkLift = wordCount >= 600
    && rawScore >= 45
    && Number(benchmark?.score || 0) >= 74
    && Number(offTopic?.expertSignals?.score || 0) >= 76
    ? clamp(Math.round((Number(benchmark.score || 0) - 68) / 10), 1, 2)
    : 0;
  if (benchmarkLift && rawScore + benchmarkLift <= band.max) {
    rawScore += benchmarkLift;
    adjustments.push(`OB高分范文标杆命中，按高分特征补偿${benchmarkLift}分。`);
  }
  const profile = benchmark?.highScoreProfile || null;
  const profileScore = Number(profile?.score || 0);
  const sourceHighScore = Number(sourceGrade?.score || 0) >= 63 || /一类|上等/.test(String(sourceGrade?.label || ''));
  if (sourceHighScore && wordCount >= 760 && profileScore >= 84 && band.max >= 63) {
    const sourceFloor = clamp(Number(sourceGrade?.score || 67) - 3, 63, 68);
    if (rawScore < sourceFloor && sourceFloor <= band.max) {
      rawScore = sourceFloor;
      adjustments.push(`资料原评与高分画像同时成立，独立分低于标杆过多，回调到${sourceFloor}分复核线。`);
    }
  }
  if (!sourceGrade && wordCount >= 780 && profileScore >= 88 && Number(profile?.moveScore || 0) >= 76 && band.max >= 63 && rawScore < 63) {
    rawScore = 63;
    adjustments.push('无资料原评但高分画像强，先给一类入口复核线63分。');
  }

  const calibrationDecision = buildShanghaiScoreCalibrationDecision({
    signals: bandSignals,
    sourceGrade,
    benchmark,
    rawScore,
    wordCount
  });
  if (calibrationDecision && calibrationDecision.adjustedScore !== rawScore) {
    rawScore = calibrationDecision.adjustedScore;
    adjustments.push(`${calibrationDecision.effect}：${calibrationDecision.anchorLabel}，校准到${rawScore}分。`);
  }

  let finalScore = clamp(rawScore, 0, 70);
  if (sourceGrade?.score && wordCount >= 600 && finalScore > Number(sourceGrade.score || 0) + 1) {
    finalScore = clamp(Number(sourceGrade.score || 0) + 1, 0, 70);
    adjustments.push('检测到资料原评，系统分数高于原评过多时自动收束到接近原评区间。');
  }
  if (finalScore > TRAINING_SCORE_MAX_70) {
    finalScore = TRAINING_SCORE_MAX_70;
    adjustments.push(`训练评分上限：本系统当前用于修改训练，显示分最高控制在${TRAINING_SCORE_MAX_70}分；不否定资料原评或真实阅卷可能更高。`);
  }
  const sourceComparison = sourceGrade ? {
    score: sourceGrade.score,
    label: sourceGrade.label,
    gap: Number(sourceGrade.score || 0) - finalScore,
    status: Math.abs(Number(sourceGrade.score || 0) - finalScore) <= 5 ? '接近' : (Number(sourceGrade.score || 0) > finalScore ? '系统偏严' : '系统偏松')
  } : null;
  if (sourceComparison && Math.abs(sourceComparison.gap) >= 8) {
    adjustments.push(`资料原评与系统独立分相差${Math.abs(sourceComparison.gap)}分，建议结合OB标杆人工复核。`);
  }
  if (sourceGrade && wordCount < 600) {
    adjustments.push(`检测到资料原评“${sourceGrade.label}${sourceGrade.score ? ` ${sourceGrade.score}分` : ''}”，但当前正文不足600字，仍受字数上限约束。`);
  }
  return {
    score: finalScore,
    independentScore: finalScore,
    band: getShanghaiOfficialBand(finalScore),
    initialBand: band.band,
    bandReason: band.reason,
    bandBaseline: band.baseline,
    bandLane: band.lane?.label || '',
    standardSource: OB_SHANGHAI_SCORE_STANDARD.source,
    wordCount,
    deductions,
    adjustments,
    qualityRatio: Math.round(bandSignals.qualityScore),
    noTitle: detectMissingTitle(originalDraft, offTopic?.reviewInfo),
    typoPenalty,
    sourceGrade,
    sourceComparison,
    obsidianBenchmark: benchmark,
    benchmarkDecision,
    calibrationDecision,
    signals: bandSignals
  };
}

function mapRubricQualityToShanghaiScore(quality, wordCount = 800) {
  const q = clamp(Math.round(Number(quality || 0)), 0, 100);
  if (wordCount < 400) return clamp(Math.round(q * 0.2), 0, 20);
  if (wordCount < 600) return clamp(Math.round(21 + q * 0.18), 0, 36);
  const segments = [
    { minQ: 88, maxQ: 100, minScore: 67, maxScore: 70 },
    { minQ: 80, maxQ: 87, minScore: 63, maxScore: 66 },
    { minQ: 72, maxQ: 79, minScore: 59, maxScore: 62 },
    { minQ: 62, maxQ: 71, minScore: 55, maxScore: 58 },
    { minQ: 54, maxQ: 61, minScore: 52, maxScore: 54 },
    { minQ: 38, maxQ: 53, minScore: 39, maxScore: 51 },
    { minQ: 22, maxQ: 37, minScore: 21, maxScore: 38 },
    { minQ: 0, maxQ: 21, minScore: 0, maxScore: 20 }
  ];
  const segment = segments.find((item) => q >= item.minQ && q <= item.maxQ) || segments[segments.length - 1];
  const ratio = segment.maxQ === segment.minQ ? 0 : (q - segment.minQ) / (segment.maxQ - segment.minQ);
  return clamp(Math.round(segment.minScore + ratio * (segment.maxScore - segment.minScore)), segment.minScore, segment.maxScore);
}

function buildNetworkMarkingReviewSimulation(report) {
  const official = report.officialScore || {};
  const signals = official.signals || buildShanghaiOfficialRubricSignals({
    offTopic: report.offTopic,
    thesis: report.thesis,
    argument: report.argument,
    material: report.material,
    language: report.language,
    structure: report.structure,
    wordCount: countWords(report.draft || '')
  });
  const wordCount = Number(official.wordCount || countWords(report.draft || ''));
  const handwritingRatio = Number(report.handwriting?.score || 0) / Math.max(Number(report.handwriting?.max || 1), 1);
  const contentQuality = clamp(Math.round(
    signals.topicAccuracy * 0.28
    + signals.thoughtDepth * 0.24
    + signals.thesisStable * 0.18
    + signals.logicStrength * 0.18
    + signals.materialFit * 0.06
    + signals.fullness * 0.06
  ), 0, 100);
  const expressionQuality = clamp(Math.round(
    signals.structureStable * 0.32
    + signals.languageStable * 0.28
    + signals.fullness * 0.16
    + signals.materialFit * 0.08
    + handwritingRatio * 100 * 0.16
  ), 0, 100);
  const contentMapped = mapRubricQualityToShanghaiScore(contentQuality, wordCount);
  const expressionMapped = mapRubricQualityToShanghaiScore(expressionQuality, wordCount);
  const finalScore = Number(official.score || report.total70 || 0);
  const contentScore = clamp(Math.round(contentMapped * 0.62 + finalScore * 0.38), 0, TRAINING_SCORE_MAX_70);
  const expressionScore = clamp(Math.round(expressionMapped * 0.62 + finalScore * 0.38), 0, TRAINING_SCORE_MAX_70);
  const gap = Math.abs(contentScore - expressionScore);
  const triggerThirdReview = gap >= 6;
  const thirdScore = triggerThirdReview
    ? clamp(Math.round(finalScore * 0.55 + ((contentScore + expressionScore) / 2) * 0.45), 0, TRAINING_SCORE_MAX_70)
    : finalScore;
  const sourceGap = Math.abs(Number(official.sourceComparison?.gap || 0));
  const riskExtra = /高/.test(String(report.offTopic?.riskLevel || '')) ? 2 : 0;
  const uncertainty = clamp(2 + Math.ceil(gap / 3) + (sourceGap >= 8 ? 2 : 0) + riskExtra, 2, 8);
  return {
    contentQuality,
    expressionQuality,
    contentScore,
    expressionScore,
    thirdScore,
    finalScore,
    gap,
    triggerThirdReview,
    scoreRange: {
      low: clamp(finalScore - uncertainty, 0, 70),
      high: clamp(finalScore + uncertainty, 0, TRAINING_SCORE_MAX_70),
      uncertainty
    },
    comments: [
      `一评偏内容：重点看题意、中心、思辨与论证，模拟分${contentScore}/70。`,
      `二评偏表达：重点看结构、语言、卷面与完成度，模拟分${expressionScore}/70。`,
      triggerThirdReview
        ? `两评差${gap}分，按网络化评卷思路应触发三评复核。`
        : `两评差${gap}分，暂未超过复核阈值，分数相对稳定。`
    ]
  };
}

function buildDevelopmentGradeProfile(report) {
  const signals = report.officialScore?.signals || buildShanghaiOfficialRubricSignals({
    offTopic: report.offTopic,
    thesis: report.thesis,
    argument: report.argument,
    material: report.material,
    language: report.language,
    structure: report.structure,
    wordCount: countWords(report.draft || '')
  });
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.analysis?.topicPhrases || report.offTopic?.topicPhrases || []);
  const mechanismEvidence = findLocatedSentence(report.draft, [/本质|机制|原因在于|意味着|取决于|关键在于/]);
  const boundaryEvidence = findLocatedSentence(report.draft, [/边界|前提|条件|并非|未必|不是绝对|如果|只有当/]);
  const realityEvidence = findLocatedSentence(report.draft, [/现实|当下|时代|社会|校园|技术|平台|媒介|公共|青年/]);
  const goodEvidence = sentenceQuality.goodItems?.[0] ? {
    paragraphIndex: sentenceQuality.goodItems[0].paragraphIndex,
    sentence: sentenceQuality.goodItems[0].sentence
  } : null;
  const profile = [
    {
      key: 'deep',
      label: '深刻',
      score: clamp(Math.round(signals.thoughtDepth * 0.68 + signals.logicStrength * 0.18 + signals.topicAccuracy * 0.14), 0, 100),
      evidence: mechanismEvidence ? `第${mechanismEvidence.paragraphIndex + 1}段“${takeSentencePreview(mechanismEvidence.sentence, 34)}”` : '暂未定位到稳定的机制/本质句',
      action: '高分不是多讲道理，而是写清“为什么会这样”。'
    },
    {
      key: 'rich',
      label: '丰富',
      score: clamp(Math.round(signals.materialFit * 0.42 + signals.fullness * 0.28 + signals.topicAccuracy * 0.16 + (realityEvidence ? 14 : 0)), 0, 100),
      evidence: realityEvidence ? `第${realityEvidence.paragraphIndex + 1}段“${takeSentencePreview(realityEvidence.sentence, 34)}”` : '现实关联或材料层次还不够显性',
      action: '材料不求多，关键是材料能进入现实语境并服务中心。'
    },
    {
      key: 'literary',
      label: '有文采',
      score: clamp(Math.round(signals.languageStable * 0.55 + calculateLanguageDensityScore(report.draft || '') * 0.3 + (goodEvidence ? 15 : 0)), 0, 100),
      evidence: goodEvidence ? `第${goodEvidence.paragraphIndex + 1}段“${takeSentencePreview(goodEvidence.sentence, 34)}”` : '暂未识别到兼具判断与表达密度的句子',
      action: '议论文文采不是堆辞藻，而是判断准确、转折自然、句子有压缩感。'
    },
    {
      key: 'creative',
      label: '有创新',
      score: clamp(Math.round(signals.innovation * 0.64 + signals.selfAxis * 0.2 + (boundaryEvidence ? 16 : 0)), 0, 100),
      evidence: boundaryEvidence ? `第${boundaryEvidence.paragraphIndex + 1}段“${takeSentencePreview(boundaryEvidence.sentence, 34)}”` : '边界反思不足，见解还不容易和普通卷拉开',
      action: '创新不是怪，而是在题目常规答案之外补出条件、限度和新解释。'
    }
  ];
  const total20 = clamp(Math.round(profile.reduce((sum, item) => sum + item.score, 0) / profile.length / 5), 0, 20);
  return {
    total20,
    profile,
    label: total20 >= 17 ? '发展等级较强' : (total20 >= 13 ? '发展等级可用' : '发展等级偏弱'),
    note: '发展等级不要求四项全满；一项特别突出，也可能拉开档内分差。'
  };
}

function renderNetworkMarkingReviewPanel(report) {
  const sim = report.networkReview || buildNetworkMarkingReviewSimulation(report);
  return `
    <div class="agent-result-block">
      <h4>双评 / 三评模拟</h4>
      <p class="agent-para-issues">${escapeHtml(OB_SHANGHAI_SCORE_STANDARD.notes.research)}</p>
      <div class="score-calibration-kpi">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>一评：内容立意阅卷</span><strong>${sim.contentScore}/70</strong></div>
          <p>质量指数：${sim.contentQuality}/100。看题意、中心、论证机制和思辨深度。</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>二评：表达结构阅卷</span><strong>${sim.expressionScore}/70</strong></div>
          <p>质量指数：${sim.expressionQuality}/100。看结构、语言、卷面和完成度。</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>${sim.triggerThirdReview ? '触发三评复核' : '无需三评复核'}</span><strong>差${sim.gap}分</strong></div>
          <p>建议分数区间：${sim.scoreRange.low}-${sim.scoreRange.high}/70；最终仍以原文证据定档。</p>
        </div>
      </div>
      <ul>${sim.comments.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </div>
  `;
}

function renderDevelopmentGradePanel(report) {
  const dev = report.developmentGrade || buildDevelopmentGradeProfile(report);
  const rows = (dev.profile || []).map((item) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(item.label)}</span><strong>${item.score}/100</strong></div>
      <p><strong>证据</strong>：${escapeHtml(item.evidence)}</p>
      <p><strong>阅卷动作</strong>：${escapeHtml(item.action)}</p>
    </div>
  `).join('');
  return `
    <div class="agent-result-block">
      <h4>发展等级画像</h4>
      <p><strong>${escapeHtml(dev.label)}</strong>：参考发展等级 ${dev.total20}/20。${escapeHtml(dev.note)}</p>
      <div class="score-grid">${rows}</div>
    </div>
  `;
}

function buildTeacherShortComment(report) {
  const goodSentence = report.language.goodSentences[0] || report.thesis.thesisSentence || '';
  const goodLocation = findSentenceLocation(report.draft, goodSentence);
  const weakPara = report.paragraphRows.find((row) => row.score < 78) || report.paragraphRows[0];
  const weakLead = weakPara ? takeSentencePreview((splitSentences(splitParagraphs(report.draft)[weakPara.index] || '')[0] || '')) : '';
  const parts = [];
  if (goodLocation && goodSentence) {
    parts.push(`第${goodLocation.paragraphIndex + 1}段“${takeSentencePreview(goodSentence, 18)}”能扣题。`);
  }
  if (weakPara && weakLead) {
    parts.push(`第${weakPara.index + 1}段“${weakLead}”只起话头，分析没跟上。`);
  }
  parts.push(report.structure.score >= 6 ? '结构顺序基本看得清。' : '起承转合还没完全站稳。');
  return parts.join('').slice(0, 80);
}

function buildTeacherRevisionSuggestions(report) {
  const suggestions = [];
  const weakRows = report.paragraphRows || [];
  const firstWeak = weakRows[0];
  const secondWeak = weakRows[1] || weakRows[0];
  const lastWeak = weakRows[weakRows.length - 1] || weakRows[0];
  if (report.thesis.score < 7) {
    const thesisParagraph = Math.max(1, (report.thesis.thesisParagraph ?? 0) + 1);
    suggestions.push(`先改第${thesisParagraph}段中心句，把总判断写成一句完整判断句，不要只摆态度。`);
  } else {
    suggestions.push(`先看第${firstWeak ? firstWeak.paragraph : 2}段，把中心论点中的关键词再回扣一次，避免开头说过、后文散掉。`);
  }
  if (report.argument.exampleCount === 0 || report.argument.quoteCount === 0) {
    suggestions.push(`重点改第${secondWeak ? secondWeak.paragraph : 2}段，补一处引证或例证，补完后紧跟一句“为什么这个例子能证明你的判断”。`);
  } else {
    suggestions.push(`检查第${secondWeak ? secondWeak.paragraph : 2}段材料后面有没有分析句，别让论据停在“讲完故事就结束”。`);
  }
  if (report.language.typoEstimate > 0 || report.structure.score < 6) {
    suggestions.push(`最后回看第${lastWeak ? lastWeak.paragraph : 5}段，专改长句、重复句和结尾空话，不追求新写一段，只把原文压紧。`);
  } else {
    suggestions.push(`最后收一收第${lastWeak ? lastWeak.paragraph : 5}段，结尾缩短半段，回到题眼，不要在末段再铺新意思。`);
  }
  return suggestions.slice(0, 3);
}

async function buildShanghaiTeacherReviewReport(topic, draft, options = {}) {
  const analysis = analyzeEssayTopic(topic);
  const offTopic = runOffTopicCheck(topic, draft);
  const reviewDraft = offTopic.draft || normalizeDraftForReview(topic, draft);
  const intent = getCoreIntentBand(offTopic);
  const thesis = assessThesisLine(topic, reviewDraft, analysis);
  const argument = assessArgumentLogic(reviewDraft);
  const material = assessMaterialFreshness(reviewDraft);
  const language = assessLanguageExpression(topic, reviewDraft, analysis);
  const structure = assessStructureDraft(reviewDraft, analysis);
  const handwriting = options.precomputedHandwriting || await assessHandwritingByOCR(reviewDraft);
  let obsidianBenchmark = null;
  try {
    obsidianBenchmark = await buildObsidianHighScoreBenchmark(topic, reviewDraft, analysis, offTopic, { thesis, argument, language, structure });
  } catch (_) {
    obsidianBenchmark = { score: 0, indexSize: 0, matched: [], traits: ['OB标杆暂未加载，使用本地规则评分。'] };
  }
  offTopic.obsidianBenchmark = obsidianBenchmark;
  const calibratedFloor = getTeacherScoreCalibrationFloor({ draft: reviewDraft, offTopic, intent, thesis, argument, material, language, structure });
  const officialScore = computeShanghaiOfficialScore({
    originalDraft: draft,
    draft: reviewDraft,
    offTopic,
    intent,
    thesis,
    argument,
    material,
    language,
    structure,
    handwriting,
    calibrationFloor: calibratedFloor
  });
  const paragraphRows = buildParagraphIssueRowsForTeacher(topic, reviewDraft, offTopic, thesis);
  const report = {
    topic,
    draft: reviewDraft,
    originalDraft: draft,
    analysis,
    offTopic,
    intent,
    thesis,
    argument,
    material,
    language,
    structure,
    handwriting,
    paragraphRows,
    calibrationFloor: calibratedFloor,
    obsidianBenchmark,
    officialScore,
    total70: officialScore.score
  };
  report.networkReview = buildNetworkMarkingReviewSimulation(report);
  report.developmentGrade = buildDevelopmentGradeProfile(report);
  report.officialScore.scoreRange = report.networkReview.scoreRange;
  report.comment80 = buildTeacherShortComment(report);
  report.suggestions = buildTeacherRevisionSuggestions(report);
  try {
    report.obsidianSuggestions = await buildVisibleObsidianSuggestions(topic, draft, analysis, report);
  } catch (_) {
    report.obsidianSuggestions = buildFallbackVisibleExampleSuggestions(topic, analysis, report);
  }
  return report;
}

function findLocatedSentence(draft, tests) {
  const paragraphs = splitParagraphs(draft);
  for (let p = 0; p < paragraphs.length; p += 1) {
    const sentences = splitSentences(paragraphs[p]);
    for (const sentence of sentences) {
      const ok = tests.some((test) => {
        if (test instanceof RegExp) return test.test(sentence);
        return sentence.includes(String(test || ''));
      });
      if (ok) return { paragraphIndex: p, sentence: ensureSentenceEnding(sentence) };
    }
  }
  return null;
}

function buildTeacherScoreEvidenceMap(report) {
  const weakParagraph = (report.paragraphRows || []).find((row) => row.score < 70) || (report.paragraphRows || [])[0];
  const obTop = report.obsidianBenchmark?.matched?.[0] || null;
  const obLine = obTop ? `；OB参照：${obTop.title || '相近标杆'}（${Math.round(obTop.matchScore || 0)}）` : '';
  const weakEvidence = weakParagraph?.evidenceSentence
    ? `第${weakParagraph.index + 1}段“${takeSentencePreview(weakParagraph.evidenceSentence, 30)}”`
    : '未定位到稳定段落证据';
  const thesisEvidence = report.thesis?.thesisSentence
    ? `第${report.thesis.thesisParagraph + 1}段“${takeSentencePreview(report.thesis.thesisSentence, 30)}”`
    : '开头两段未找到稳定中心判断句';
  const logicSentence = findLocatedSentence(report.draft, [/(因为|所以|因此|由此|这说明|意味着|关键在于|本质上|机制)/]);
  const materialTerms = [...(report.material?.freshHits || []), ...(report.material?.staleHits || [])];
  const materialSentence = materialTerms.length ? findLocatedSentence(report.draft, materialTerms) : null;
  const languageWeak = (report.language?.weakSentences || [])[0];
  const languageGood = (report.language?.goodSentences || [])[0];
  const languageEvidence = languageWeak
    ? `优先改“${takeSentencePreview(languageWeak, 30)}”`
    : (languageGood ? `可保留“${takeSentencePreview(languageGood, 30)}”` : '未识别到明显句子证据');
  const structureSentence = findLocatedSentence(report.draft, [/(然而|但是|另一方面|进一步|因此|回到题目|总之)/]);
  return {
    '材料核心立意': {
      evidence: weakEvidence,
      task: `${weakParagraph?.task || '检查每段是否持续围绕题眼，不让材料滑向泛论。'}${obLine}`
    },
    '中心论点': {
      evidence: thesisEvidence,
      task: report.thesis?.score >= 7 ? '保持中心句贯穿，主体段段首继续回扣。' : '把中心论点改成一句完整判断句，写清条件与立场。'
    },
    '论证逻辑': {
      evidence: logicSentence ? `第${logicSentence.paragraphIndex + 1}段“${takeSentencePreview(logicSentence.sentence, 30)}”` : '未找到明显“原因-机制-结果”推进句',
      task: `每个材料后补一句“为什么它能证明观点”，不要只摆例子。${obTop ? `可对照OB标杆“${obTop.title}”的例后分析方式。` : ''}`
    },
    '论据新旧': {
      evidence: materialSentence ? `第${materialSentence.paragraphIndex + 1}段“${takeSentencePreview(materialSentence.sentence, 30)}”` : '未定位到鲜明材料句',
      task: report.material?.staleHits?.length ? '老素材可以保留，但必须写出新解释或现实对应。' : '补一个当下生活场景，让论据不只停在抽象判断。'
    },
    '语言表达': {
      evidence: languageEvidence,
      task: '删口号、压长句，把漂亮话改成“判断+依据”。'
    },
    '结构章法': {
      evidence: structureSentence ? `第${structureSentence.paragraphIndex + 1}段“${takeSentencePreview(structureSentence.sentence, 30)}”` : `当前${report.structure?.paragraphs || 0}段，转折/收束信号不足`,
      task: '确认文章顺序是否完成“界定-展开-边界-收束”。'
    },
    '书写规范（OCR）': {
      evidence: report.handwriting?.detail || '未上传图片时本项只能估计',
      task: '书写项只作为卷面提醒，重点仍是正文逻辑。'
    }
  };
}

function getTeacherNextScoreBand(score70) {
  const current = Number(score70 || 0);
  const bands = [
    { target: 42, label: '三类卷稳定线' },
    { target: 49, label: '二类卷入口' },
    { target: 56, label: '一类下入口' },
    { target: 60, label: '一类中入口' },
    { target: 63, label: '一类上冲刺线' },
    { target: 66, label: '高分卷上限区' }
  ];
  return bands.find((band) => current < band.target) || { target: 70, label: '满分上限' };
}

function buildTeacherScoreGapPanel(report) {
  const nextBand = getTeacherNextScoreBand(report.total70);
  const gap = Math.max(0, nextBand.target - Number(report.total70 || 0));
  const dimensionRows = [
    { label: '材料核心立意', score: report.intent.score, max: report.intent.max, action: '先把题眼关系写成一句完整判断。' },
    { label: '中心论点', score: report.thesis.score, max: report.thesis.max, action: '让中心论点出现在前两段，并在主体段反复回扣。' },
    { label: '论证逻辑', score: report.argument.score, max: report.argument.max, action: '每个材料后补一句机制解释。' },
    { label: '论据新旧', score: report.material.score, max: report.material.max, action: '补一个贴近当下的现实场景。' },
    { label: '语言表达', score: report.language.score, max: report.language.max, action: '删口号句，把长句压成判断句。' },
    { label: '结构章法', score: report.structure.score, max: report.structure.max, action: '检查是否完成“界定-展开-边界-收束”。' }
  ];
  const weakest = dimensionRows
    .map((item) => ({ ...item, ratio: Number(item.score || 0) / Math.max(Number(item.max || 1), 1) }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 2);
  const weakRows = weakest.map((item, index) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${index + 1}. ${escapeHtml(item.label)}</span><strong>${item.score}/${item.max}</strong></div>
      <p><strong>卡分原因</strong>：${escapeHtml(item.ratio >= 0.75 ? '本项基本稳，但还缺少一处能拉开差距的细节。' : '本项是当前最影响档次的部分。')}</p>
      <p><strong>提档动作</strong>：${escapeHtml(item.action)}</p>
    </div>
  `).join('');
  return `
    <div class="agent-result-block">
      <h4>离下一档还差什么</h4>
      <p>当前 ${report.total70}/70，下一目标：${escapeHtml(nextBand.label)} ${nextBand.target}/70，还差 ${gap} 分。</p>
      <div class="score-grid">${weakRows}</div>
      <p class="agent-para-issues">先补最弱两项，不建议整篇推倒重写。</p>
    </div>
  `;
}

function buildDimensionUpgradeHint(label, score, max) {
  const ratio = Number(score || 0) / Math.max(Number(max || 1), 1);
  if (ratio >= 0.88) return '本项已接近高档，注意保持稳定，不要为了炫技破坏清晰度。';
  if (ratio >= 0.72) return '本项能保住基本分，若要升档，需要增加一个可见的分析动作。';
  if (label === '材料核心立意') return '先改审题：把题眼、设问和立场合成一句判断。';
  if (label === '中心论点') return '先改中心句：不要只表态，要写清“在什么条件下成立”。';
  if (label === '论证逻辑') return '先改例后分析：每个例子后追问“为什么能证明”。';
  if (label === '论据新旧') return '先改素材：保留经典素材也可以，但要补当下语境。';
  if (label === '语言表达') return '先改句子：删空话、压长句、保留判断句。';
  if (label === '结构章法') return '先改段落顺序：界定、展开、转折、收束要能看出来。';
  return '先补一个最容易看见的提档动作。';
}

function renderTeacherDimensionRows(report) {
  const evidenceMap = buildTeacherScoreEvidenceMap(report);
  const rows = [
    { label: '材料核心立意', score: report.intent.score, max: report.intent.max, detail: `判定：${report.intent.band}｜${report.intent.detail}` },
    { label: '中心论点', score: report.thesis.score, max: report.thesis.max, detail: report.thesis.detail },
    { label: '论证逻辑', score: report.argument.score, max: report.argument.max, detail: report.argument.detail },
    { label: '论据新旧', score: report.material.score, max: report.material.max, detail: report.material.detail },
    { label: '语言表达', score: report.language.score, max: report.language.max, detail: report.language.detail },
    { label: '结构章法', score: report.structure.score, max: report.structure.max, detail: report.structure.detail },
    { label: '书写规范（OCR）', score: report.handwriting.score, max: report.handwriting.max, detail: report.handwriting.detail }
  ];
  return rows.map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(`${row.score}/${row.max}`)}</strong></div>
      <p>${escapeHtml(row.detail)}</p>
      <p><strong>证据句</strong>：${escapeHtml(evidenceMap[row.label]?.evidence || '暂无证据')}</p>
      <p><strong>扣分/保分依据</strong>：${escapeHtml(evidenceMap[row.label]?.task || '继续核对原文。')}</p>
      <p><strong>升档提示</strong>：${escapeHtml(buildDimensionUpgradeHint(row.label, row.score, row.max))}</p>
    </div>
  `).join('');
}

function teacherReportToScoreLike(report) {
  const to20 = (score, max) => clamp(Math.round((Number(score || 0) / Math.max(Number(max || 1), 1)) * 20), 0, 20);
  return {
    dimensions: [
      { label: '审题立意', score: to20(report.intent?.score, report.intent?.max) },
      { label: '结构章法', score: to20(report.structure?.score, report.structure?.max) },
      { label: '论证与材料', score: to20(report.argument?.score, report.argument?.max) },
      { label: '语言表达', score: to20(report.language?.score, report.language?.max) },
      { label: '思辨深度', score: to20(Number(report.intent?.score || 0) + Number(report.argument?.score || 0), Number(report.intent?.max || 1) + Number(report.argument?.max || 1)) }
    ],
    stats: { wordCount: countWords(report.draft || '') },
    offTopic: report.offTopic
  };
}

function buildTeacherErrorBookSummary(report) {
  const scoreLike = teacherReportToScoreLike(report);
  const currentTags = extractErrorTags({ draft: report.draft, score: scoreLike, offTopic: report.offTopic });
  const book = loadErrorBook();
  const top = Object.entries(book.tags || {})
    .map(([tag, info]) => ({ tag, count: Number(info.count || 0), lastTopic: info.lastTopic || '' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const drills = top.slice(0, 3).map((item) => ({ ...item, ...buildErrorDrillFromTag(item.tag) }));
  const recent = (book.records || []).slice(-5).reverse();
  return { currentTags, top, drills, recent, total: (book.records || []).length };
}

function renderErrorBookTrainingPanel(summary) {
  const currentTags = (summary.currentTags || []).map((tag) => `<span class="agent-tag risk high">${escapeHtml(tag)}</span>`).join('');
  const immediateRows = (summary.currentTags || []).slice(0, 3).map((tag, i) => {
    const item = buildErrorDrillFromTag(tag);
    return `<li><strong>${i + 1}. ${escapeHtml(tag)}</strong>：${escapeHtml(item.drill)}
      <button class="agent-btn ghost error-drill-btn" type="button" data-training-prompt="${escapeHtml(item.prompt)}">立刻练这一项</button>
    </li>`;
  }).join('');
  const drillRows = (summary.drills || []).map((item, i) => `
    <li><strong>${i + 1}. ${escapeHtml(item.tag)}</strong>（累计${item.count}次）：${escapeHtml(item.drill)}
      <button class="agent-btn ghost error-drill-btn" type="button" data-training-prompt="${escapeHtml(item.prompt)}">推送专项</button>
    </li>
  `).join('');
  const recentRows = (summary.recent || []).map((item) => `<li>${escapeHtml(item.topic)}｜${escapeHtml((item.tags || []).join('、'))}</li>`).join('');
  return `
    <div class="agent-result-block">
      <h4>错因本与高频专项训练</h4>
      <p class="agent-para-issues">本次自动记录错因，系统会优先推送最近最常出现的问题，而不是泛泛刷题。</p>
      <div class="agent-tags">${currentTags || '<span class="agent-tag">本次未识别明显硬伤</span>'}</div>
      <p>累计记录：${summary.total || 0}次</p>
      <p class="agent-para-issues">本次错因即刻训练</p>
      <ul>${immediateRows || '<li>本次基础较稳，可改做限时审题训练。</li>'}</ul>
      <p class="agent-para-issues">高频错因长期训练</p>
      <ul>${drillRows || '<li>暂无高频错因画像，完成2-3次评分后会更准。</li>'}</ul>
      <p class="agent-para-issues">最近记录</p>
      <ul>${recentRows || '<li>暂无最近错因记录。</li>'}</ul>
    </div>
  `;
}

function renderTeacherClosedLoopPanel(report, mode = 'score') {
  const evidenceMap = buildTeacherScoreEvidenceMap(report);
  const weakPara = (report.paragraphRows || []).find((row) => row.score < 76) || (report.paragraphRows || [])[0];
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.analysis?.topicPhrases || report.offTopic?.topicPhrases || []);
  const weakSentence = (sentenceQuality.badItems || [])[0];
  const currentTags = extractErrorTags({ draft: report.draft, score: teacherReportToScoreLike(report), offTopic: report.offTopic });
  const firstDrill = currentTags.length ? buildErrorDrillFromTag(currentTags[0]) : null;
  const title = mode === 'critique' ? '阅卷老师逐段改进路线' : '阅卷证据链总览';
  return `
    <div class="agent-result-block">
      <h4>${title}</h4>
      <div class="score-grid">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>1. 分数必须有证据</span><strong>${report.intent.band}</strong></div>
          <p><strong>立意证据</strong>：${escapeHtml(evidenceMap['材料核心立意']?.evidence || '暂无')}</p>
          <p><strong>中心论点证据</strong>：${escapeHtml(evidenceMap['中心论点']?.evidence || '暂无')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>2. 先改最弱段</span><strong>${weakPara ? `第${weakPara.index + 1}段` : '暂无'}</strong></div>
          <p><strong>段落证据句</strong>：${escapeHtml(takeSentencePreview(weakPara?.evidenceSentence || '', 46) || '未识别到稳定证据句')}</p>
          <p><strong>学生自改任务</strong>：${escapeHtml(weakPara?.task || weakPara?.suggestion || '先补段首题眼回扣。')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>3. 再处理句子</span><strong>${weakSentence ? `第${weakSentence.paragraphIndex + 1}段` : '句质'}</strong></div>
          <p><strong>低分句定位</strong>：${escapeHtml(weakSentence ? takeSentencePreview(weakSentence.sentence, 46) : '暂无明显低分句')}</p>
          <p><strong>判定依据</strong>：${escapeHtml((weakSentence?.reasons || []).join('、') || '保持判断句清楚、分析句跟上。')}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>4. 最后进入专项</span><strong>${escapeHtml(currentTags[0] || '综合训练')}</strong></div>
          <p><strong>本次错因</strong>：${escapeHtml(currentTags.slice(0, 3).join('、') || '暂无明显硬伤')}</p>
          <p><strong>专项动作</strong>：${escapeHtml(firstDrill?.drill || '做一组限时审题：题眼、关系、边界各写一句。')}</p>
        </div>
      </div>
      <p class="agent-para-issues">这块只告诉孩子“先改哪儿、为什么改、练什么”，不替孩子改正文。</p>
    </div>
  `;
}

function getTeacherPriorityDimensions(report) {
  const items = [
    { label: '材料核心立意', score: report.intent?.score, max: report.intent?.max, fallback: '先确认题眼、关系和设问重心没有偏。' },
    { label: '中心论点', score: report.thesis?.score, max: report.thesis?.max, fallback: '把中心判断写成“立场+条件+关系+边界”。' },
    { label: '论证逻辑', score: report.argument?.score, max: report.argument?.max, fallback: '每个例证后补一句机制解释。' },
    { label: '论据新旧', score: report.material?.score, max: report.material?.max, fallback: '补一个贴近当下生活的观察场景。' },
    { label: '语言表达', score: report.language?.score, max: report.language?.max, fallback: '删空泛形容词，保留判断句和分析句。' },
    { label: '结构章法', score: report.structure?.score, max: report.structure?.max, fallback: '检查段落是否完成界定、推进、转折、收束。' }
  ];
  return items
    .map((item) => ({
      ...item,
      score: Number(item.score || 0),
      max: Number(item.max || 1),
      ratio: Number(item.score || 0) / Math.max(Number(item.max || 1), 1)
    }))
    .sort((a, b) => a.ratio - b.ratio);
}

function renderTeacherOneScreenConclusion(report, mode = 'score') {
  const evidenceMap = buildTeacherScoreEvidenceMap(report);
  const boundary = buildScoreBandBoundaryExplanation(report);
  const realSummary = getRealScoreCalibrationSummary();
  const networkReview = report.networkReview || buildNetworkMarkingReviewSimulation(report);
  const rangeText = networkReview?.scoreRange
    ? `${networkReview.scoreRange.low}-${networkReview.scoreRange.high}/70`
    : `${report.total70}/70`;
  const priorityRows = getTeacherPriorityDimensions(report).slice(0, 3).map((item, index) => {
    const evidence = evidenceMap[item.label]?.evidence || '暂无稳定证据句';
    const task = evidenceMap[item.label]?.task || item.fallback;
    return `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>${index + 1}. 先改${escapeHtml(item.label)}</span><strong>${item.score}/${item.max}</strong></div>
        <p><strong>证据句</strong>：${escapeHtml(evidence)}</p>
        <p><strong>学生动作</strong>：${escapeHtml(task)}</p>
      </div>
    `;
  }).join('');
  const sourceGrade = report.officialScore?.sourceGrade
    ? `${report.officialScore.sourceGrade.label} ${report.officialScore.sourceGrade.score}分`
    : '未检测到资料原评';
  const notHigher = boundary.whyNotHigher?.[0] || '上一档卡点不明显，继续看中心深度、机制解释和边界处理。';
  const notLower = boundary.whyNotLower?.[0] || '仍有基本扣题和结构完成度，暂不宜继续下压。';
  const calibrationLine = realSummary.loaded
    ? `真实老师样本${realSummary.total}/${realSummary.targetCount}篇已接入；当前仍以规则+OB高分特征+人工复核共同校准。`
    : '真实评分样本文件未加载；当前主要依赖规则锚点与OB高分特征。';
  return `
    <div class="agent-result-block teacher-one-screen">
      <h4>${mode === 'critique' ? '一屏精批结论' : '一屏阅卷结论'}</h4>
      <div class="score-calibration-kpi">
        <div class="flaw-row">
          <div class="flaw-row-top"><span>当前判定</span><strong>${report.total70}/70</strong></div>
          <p>${escapeHtml(report.officialScore?.band || report.intent?.band || '')}${report.officialScore?.bandLane ? `｜${escapeHtml(report.officialScore.bandLane)}` : ''}</p>
          <p>合理区间：${escapeHtml(rangeText)}｜${networkReview.triggerThirdReview ? '建议三评复核' : '双评差距可控'}</p>
          <p>训练口径：当前系统最高显示${TRAINING_SCORE_MAX_70}分，重点服务修改与提档。</p>
          <p>资料原评：${escapeHtml(sourceGrade)}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>为什么不是上一档</span><strong>卡点</strong></div>
          <p>${escapeHtml(notHigher)}</p>
        </div>
        <div class="flaw-row">
          <div class="flaw-row-top"><span>为什么不再下压</span><strong>保分</strong></div>
          <p>${escapeHtml(notLower)}</p>
        </div>
      </div>
      <p class="agent-para-issues">${escapeHtml(calibrationLine)}</p>
      <div class="score-grid">${priorityRows}</div>
      <p class="agent-para-issues">先处理这三项即可；系统只指出问题和证据，不替孩子改正文。</p>
    </div>
  `;
}

function renderTeacherScoreReport(report, container) {
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.analysis?.topicPhrases || report.offTopic?.topicPhrases || []);
  const goodRows = renderSentenceQualityItems(sentenceQuality.goodItems || [], 'good');
  const weakRows = renderSentenceQualityItems(sentenceQuality.badItems || [], 'bad');
  const suggestionRows = (report.suggestions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const deductionRows = (report.officialScore?.deductions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const adjustmentRows = (report.officialScore?.adjustments || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const errorBookPanel = renderErrorBookTrainingPanel(buildTeacherErrorBookSummary(report));
  const eightTrainingPanel = renderTeacherEightTrainingPanel(report.analysis, report);

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>上海模考阅卷报告</h3>
      <div class="agent-tags">
        <span class="agent-tag">总分：${report.total70}/70</span>
        <span class="agent-tag">分档：${escapeHtml(report.officialScore?.band || report.intent.band)}</span>
        <span class="agent-tag">初判：${escapeHtml(report.officialScore?.initialBand || report.intent.band)}</span>
        <span class="agent-tag risk ${normalizeRiskClass(report.offTopic?.riskLevel || '中')}">偏题风险：${escapeHtml(report.offTopic?.riskLevel || '中')}</span>
      </div>
    </div>
    ${renderTeacherOneScreenConclusion(report, 'score')}
    <div class="agent-result-block">
      <h4>上海分档赋分依据</h4>
      <p><strong>先定档</strong>：${escapeHtml(report.officialScore?.initialBand || report.intent.band)}｜${escapeHtml(report.officialScore?.bandReason || report.intent.detail)}</p>
      <p><strong>评分尺</strong>：${escapeHtml(report.officialScore?.standardSource || OB_SHANGHAI_SCORE_STANDARD.source)}｜基准分：${escapeHtml(String(report.officialScore?.bandBaseline ?? '--'))}${report.officialScore?.bandLane ? `｜档位：${escapeHtml(report.officialScore.bandLane)}` : ''}</p>
      <p><strong>档内质量</strong>：${escapeHtml(String(report.officialScore?.qualityRatio ?? '--'))}/100｜字数：${escapeHtml(String(report.officialScore?.wordCount ?? countWords(report.draft)))}</p>
      <p><strong>资料原评</strong>：${escapeHtml(report.officialScore?.sourceGrade ? `${report.officialScore.sourceGrade.label} ${report.officialScore.sourceGrade.score}分` : '未检测到')}</p>
      <p><strong>扣分项</strong></p>
      <ul>${deductionRows || '<li>暂无标题、字数、错别字类硬扣分。</li>'}</ul>
      <p><strong>校准说明</strong></p>
      <ul>${adjustmentRows || '<li>暂无额外校准说明。</li>'}</ul>
      <p class="agent-para-issues">评分按上海卷五档：一类63-70、二类52-62、三类39-51、四类21-38、五类20以下；先判档，再档内赋分。</p>
    </div>
    ${renderNetworkMarkingReviewPanel(report)}
    ${renderDevelopmentGradePanel(report)}
    ${renderObsidianBenchmarkPanel(report)}
    ${renderObsidianScoreEngineDecision(report)}
    ${renderScoreBandBoundaryPanel(report)}
    ${renderSameTopicCalibrationPanel(report)}
    ${renderObsidianReverseFeaturePanel(report)}
    ${renderTeacherClosedLoopPanel(report, 'score')}
    ${eightTrainingPanel}
    ${buildTeacherScoreGapPanel(report)}
    <div class="agent-result-block">
      <h4>分项得分</h4>
      <div class="score-grid">${renderTeacherDimensionRows(report)}</div>
    </div>
    <div class="agent-result-block">
      <h4>手写识别结果</h4>
      <p>${escapeHtml(report.handwriting.detail)}</p>
    </div>
    <div class="agent-result-block">
      <h4>中心论点与论证方式检查</h4>
      <p>中心论点：${escapeHtml(report.thesis.thesisSentence ? `第${report.thesis.thesisParagraph + 1}段“${takeSentencePreview(report.thesis.thesisSentence, 24)}”` : '开头两段未稳定立论')}</p>
      <p>引证：${report.argument.quoteCount > 0 ? `有 ${report.argument.quoteCount} 处` : '未见明显引证'} ｜ 例证：${report.argument.exampleCount > 0 ? `有 ${report.argument.exampleCount} 处` : '未见明显例证'} ｜ 比喻论证：${report.argument.metaphorCount > 0 ? `有 ${report.argument.metaphorCount} 处` : '未见明显比喻论证'}</p>
    </div>
    <div class="agent-result-block">
      <h4>高分句 / 低分句标注</h4>
      <p><strong>可保留的高分句候选</strong></p>
      <ul>${goodRows || '<li>暂未识别出可直接保留的亮句。</li>'}</ul>
      <p><strong>优先自改的低分风险句</strong></p>
      <ul>${weakRows || '<li>暂未识别出明显病句，但仍建议逐段压短句子。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>80字点评</h4>
      <p>${escapeHtml(report.comment80)}</p>
    </div>
    <div class="agent-result-block">
      <h4>3条修改建议</h4>
      <ul>${suggestionRows}</ul>
      <p class="agent-para-issues">这里只指出问题和修改任务，不替孩子改写正文。</p>
    </div>
    ${errorBookPanel}
    ${renderVisibleObsidianSuggestionBlock(report.obsidianSuggestions || [])}
  `;
}

function renderTeacherCritiqueReport(report, container) {
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.analysis?.topicPhrases || report.offTopic?.topicPhrases || []);
  const goodRows = renderSentenceQualityItems(sentenceQuality.goodItems || [], 'good');
  const badRows = renderSentenceQualityItems(sentenceQuality.badItems || [], 'bad');
  const deductionRows = (report.officialScore?.deductions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const adjustmentRows = (report.officialScore?.adjustments || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const errorBookPanel = renderErrorBookTrainingPanel(buildTeacherErrorBookSummary(report));
  const paragraphCoachRows = renderCritiqueParagraphCoachRows(report);
  const eightTrainingPanel = renderTeacherEightTrainingPanel(report.analysis, report);
  const paragraphRows = (report.paragraphRows || []).map((row) => {
    const lead = takeSentencePreview((splitSentences(splitParagraphs(report.draft)[row.index] || '')[0] || ''), 22);
    return `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>第${row.index + 1}段｜${escapeHtml(row.role || inferParagraphRole(row.index, report.paragraphRows.length))}</span><strong>${row.score}/100</strong></div>
        <p><strong>定位句</strong>：${escapeHtml(lead || '本段开头未成句')}</p>
        <p><strong>证据句</strong>：${escapeHtml(takeSentencePreview(row.evidenceSentence || '', 46) || '未识别到稳定证据句')}</p>
        <p><strong>问题</strong>：${escapeHtml(row.issue)}</p>
        <p><strong>缺口</strong>：${escapeHtml((row.issues || []).join('、') || '暂无明显硬伤')}</p>
        <p><strong>学生自改任务</strong>：${escapeHtml(row.task || row.suggestion)}</p>
      </div>
    `;
  }).join('');
  const suggestionRows = (report.suggestions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>阅卷老师精批</h3>
      <div class="agent-tags">
        <span class="agent-tag">总分：${report.total70}/70</span>
        <span class="agent-tag">分档：${escapeHtml(report.officialScore?.band || report.intent.band)}</span>
        <span class="agent-tag">书写项：${report.handwriting.score}/${report.handwriting.max}</span>
      </div>
    </div>
    ${renderTeacherOneScreenConclusion(report, 'critique')}
    <div class="agent-result-block">
      <h4>上海分档赋分依据</h4>
      <p><strong>先定档</strong>：${escapeHtml(report.officialScore?.initialBand || report.intent.band)}｜${escapeHtml(report.officialScore?.bandReason || report.intent.detail)}</p>
      <p><strong>评分尺</strong>：${escapeHtml(report.officialScore?.standardSource || OB_SHANGHAI_SCORE_STANDARD.source)}｜基准分：${escapeHtml(String(report.officialScore?.bandBaseline ?? '--'))}${report.officialScore?.bandLane ? `｜档位：${escapeHtml(report.officialScore.bandLane)}` : ''}</p>
      <p><strong>资料原评</strong>：${escapeHtml(report.officialScore?.sourceGrade ? `${report.officialScore.sourceGrade.label} ${report.officialScore.sourceGrade.score}分` : '未检测到')}</p>
      <p><strong>硬扣分</strong></p>
      <ul>${deductionRows || '<li>暂无标题、字数、错别字类硬扣分。</li>'}</ul>
      <p><strong>校准说明</strong></p>
      <ul>${adjustmentRows || '<li>暂无额外校准说明。</li>'}</ul>
    </div>
    ${renderNetworkMarkingReviewPanel(report)}
    ${renderDevelopmentGradePanel(report)}
    ${renderObsidianBenchmarkPanel(report)}
    ${renderObsidianScoreEngineDecision(report)}
    ${renderScoreBandBoundaryPanel(report)}
    ${renderSameTopicCalibrationPanel(report)}
    ${renderObsidianReverseFeaturePanel(report)}
    ${renderTeacherClosedLoopPanel(report, 'critique')}
    ${eightTrainingPanel}
    <div class="agent-result-block">
      <h4>总评</h4>
      <p>${escapeHtml(report.comment80)}</p>
      <p>材料核心：${escapeHtml(report.intent.detail)}</p>
    </div>
    <div class="agent-result-block">
      <h4>分项得分</h4>
      <div class="score-grid">${renderTeacherDimensionRows(report)}</div>
    </div>
    <div class="agent-result-block">
      <h4>手写识别结果</h4>
      <p>${escapeHtml(report.handwriting.detail)}</p>
    </div>
    <div class="agent-result-block">
      <h4>逐段老师批注</h4>
      ${paragraphCoachRows}
    </div>
    <div class="agent-result-block">
      <h4>逐段问题明细</h4>
      ${paragraphRows || '<p>暂无逐段问题定位。</p>'}
    </div>
    <div class="agent-result-block">
      <h4>高分句 / 低分句标注</h4>
      <p><strong>可以保留的句子</strong></p>
      <ul>${goodRows || '<li>暂无明显高分句，先稳住段落逻辑。</li>'}</ul>
      <p><strong>需要学生自己重写的句子</strong></p>
      <ul>${badRows || '<li>暂无明显低分句。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>修改任务单</h4>
      <ul>${suggestionRows}</ul>
      <p class="agent-para-issues">AI只指出问题，正文请学生自己改。</p>
    </div>
    ${errorBookPanel}
    ${renderVisibleObsidianSuggestionBlock(report.obsidianSuggestions || [])}
  `;
}

function renderRevisionTaskList(report, container) {
  const suggestionRows = (report.suggestions || []).map((item, index) => `<li><strong>任务${index + 1}</strong>：${escapeHtml(item)}</li>`).join('');
  const paragraphRows = (report.paragraphRows || []).map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>第${row.paragraph}段</span><strong>${row.score}/100</strong></div>
      <p><strong>要处理的问题</strong>：${escapeHtml((row.issues || []).join('、') || '本段暂无明显硬伤')}</p>
      <p><strong>自己修改时先看</strong>：${escapeHtml(row.suggestion || '先核对题眼是否回扣，再补机制解释。')}</p>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>修改任务单</h3>
      <div class="agent-tags">
        <span class="agent-tag">总分：${report.total70}/70</span>
        <span class="agent-tag">立意档次：${escapeHtml(report.intent.band)}</span>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>总提醒</h4>
      <p>${escapeHtml(report.comment80)}</p>
    </div>
    <div class="agent-result-block">
      <h4>本次只做这3件事</h4>
      <ol>${suggestionRows || '<li>先把中心论点写成一句完整判断，再检查每段是否回扣题眼。</li>'}</ol>
    </div>
    <div class="agent-result-block">
      <h4>逐段自改任务</h4>
      ${paragraphRows || '<p>当前未识别出逐段任务。</p>'}
      <p class="agent-para-issues">这里只列任务，不替孩子改正文。改，由学生自己完成。</p>
    </div>
    ${renderVisibleObsidianSuggestionBlock(report.obsidianSuggestions || [])}
  `;
}

function detectLectureTone(draft) {
  const metaCount = countMatches(draft, /(先看第一层|进一步看|回到题目|从备考角度看|这就要求写作者|高质量作文|写作者|本文讨论的核心是|如果说上一层|这一层要回答的便是)/g);
  const score = clamp(100 - metaCount * 18, 0, 100);
  const detail = metaCount === 0
    ? '成文腔较稳定，基本没有明显讲评提纲痕迹。'
    : `检测到${metaCount}处“讲评腔/提纲腔”信号，文章容易像老师分析题，而不像学生在交卷。`;
  return { score, metaCount, detail };
}

function buildCritiqueTeacherSummary(score, analysis, lectureTone) {
  const band = score.score70;
  const topicKey = analysis.topicPhrases?.[0] || '题眼';
  if (band >= 63) {
    return `这篇文章已经具备一类卷的基本气质：扣题较稳，论证有层次，结尾也能回到“${topicKey}”完成收束。接下来真正拉高上限的，不是再堆素材，而是继续统一语势，让每段之间更有牵引感。`;
  }
  if (band >= 56) {
    return `这篇文章已经站上中上档，说明你不是“不会想”，而是“还没完全写透”。目前最大差距通常不在观点，而在成文完成度：机制分析再深一层，边界意识再亮一度，整篇就有机会冲到63+。${lectureTone.metaCount ? '另外，文中仍有一些讲评腔，需要改成自然推进的正式议论文语气。' : ''}`;
  }
  return `这篇文章目前还停在基础合格到二类卷之间，说明方向感已有，但文章还没有真正立起来。最关键的问题不是“没观点”，而是观点还没组织成高水平作文：开头定义不够稳，中段分析不够深，结尾收束也偏虚。先把文章写成“像交卷文章”，分数就会明显上来。`;
}

function buildCritiqueStrengths(score, sentenceQuality) {
  const topDims = [...(score.dimensions || [])].sort((a, b) => b.score - a.score).slice(0, 2);
  const strengths = topDims.map((item) => {
    if (item.label === '审题立意') return `审题立意相对稳定，至少知道文章该围绕什么核心概念展开。`;
    if (item.label === '结构章法') return '结构感初步具备，段落已经不是完全散乱堆砌。';
    if (item.label === '论证与材料') return '论证基础尚可，至少能看出你在尝试用例子支撑观点。';
    if (item.label === '语言表达') return '语言底子不错，部分句子已有上海卷喜欢的判断感。';
    return '思辨意识已经露头，知道不能只停在表态。';
  });
  if ((sentenceQuality.good || []).length) {
    strengths.push(`文中已有可保留的好句，说明表达不是从零开始，而是需要统一提升。`);
  }
  return dedupeArray(strengths).slice(0, 3);
}

function buildCritiqueProblems(score, lectureTone) {
  const problems = [];
  const sorted = [...(score.dimensions || [])].sort((a, b) => a.score - b.score).slice(0, 3);
  sorted.forEach((item) => {
    if (item.label === '审题立意') problems.push('立意还不够聚焦，概念边界与题眼回扣需要更稳。');
    if (item.label === '结构章法') problems.push('结构推进还偏平，段与段之间缺少明显的递进与牵引。');
    if (item.label === '论证与材料') problems.push('例子与分析之间还没完全咬合，容易出现“举了例但没论透”。');
    if (item.label === '语言表达') problems.push('表达还不够成文，句子里有说明腔，缺少卷面上的整篇语势。');
    if (item.label === '思辨深度') problems.push('思辨深度不足，前提、边界与反向检验还没真正写出来。');
  });
  (score.offTopic?.flawScan || []).slice(0, 2).forEach((item) => {
    problems.push(`${item.name}：${item.fix}`);
  });
  if (lectureTone.metaCount) {
    problems.push('文章存在“讲评腔”，像在分析这道题，而不是像学生在正式写这篇文章。');
  }
  return dedupeArray(problems).slice(0, 5);
}

function buildCritiquePromotionPlan(score, analysis, lectureTone, methodGuidedKit) {
  const nextTarget = score.score70 >= 63 ? '稳住63+并继续抬升上限' : (score.score70 >= 56 ? '从56+冲到63+' : '先稳定到56+');
  const topicKey = analysis.topicPhrases?.[0] || '题眼';
  const steps = [
    `第一步先稳扣题：每段首句都要回到“${topicKey}”，不让段落滑向泛泛而谈。`,
    '第二步补机制：每个例子后都追问“为什么这个例子支持我的判断”。',
    '第三步加边界：在倒数第二段或结尾补一句“何时成立、何时失效”。'
  ];
  if (lectureTone.metaCount) {
    steps.push('第四步去讲评腔：删掉“进一步看/回到题目/从备考角度看”这类老师口吻。');
  } else {
    steps.push('第四步统一语势：把散点好句收拢成稳定的卷面语言。');
  }
  const methodStep = methodGuidedKit?.critiqueActions?.[0];
  if (methodStep) {
    steps.push(`第五步按方法论复盘：${methodStep}`);
  }
  return { target: nextTarget, steps: steps.slice(0, 5) };
}

function buildCritiqueParagraphRows(score) {
  const adviceList = score.offTopic?.paragraphAdvice || [];
  if (!adviceList.length) return [];
  return adviceList.map((item) => ({
    index: item.index,
    score: item.score,
    level: item.score >= 78 ? '本段较稳' : (item.score >= 60 ? '本段可提档' : '本段是失分点'),
    comment: item.score >= 78
      ? '这一段已经能承担应有任务，接下来主要是把语言再压实一些。'
      : (item.score >= 60
        ? '这一段方向基本对，但“说透”和“写满”的程度还不够，是最适合提档的位置。'
        : '这一段目前拖分较明显，问题不只是表达弱，而是题眼、机制或边界没有站稳。'),
    suggestion: item.suggestion,
    issues: item.issues || [],
    rewrite: item.rewrite
  }));
}

function buildMasterCritiqueReport(topic, draft) {
  const score = scoreEssayDraft(topic, draft);
  const analysis = analyzeEssayTopic(topic);
  const sentenceQuality = analyzeSentenceQuality(topic, draft, score.offTopic?.topicPhrases || analysis.topicPhrases || []);
  const lectureTone = detectLectureTone(draft);
  const methodGuidedKit = analysis.methodGuidedKit || buildMethodGuidedKit(topic, analysis.topicType, analysis.topicPhrases || []);
  return {
    topic,
    draft,
    score,
    analysis,
    methodGuidedKit,
    sentenceQuality,
    lectureTone,
    summary: buildCritiqueTeacherSummary(score, analysis, lectureTone),
    strengths: buildCritiqueStrengths(score, sentenceQuality),
    problems: buildCritiqueProblems(score, lectureTone),
    paragraphRows: buildCritiqueParagraphRows(score),
    promotionPlan: buildCritiquePromotionPlan(score, analysis, lectureTone, methodGuidedKit)
  };
}

function renderMasterCritiqueReport(report, container) {
  const { score, lectureTone, sentenceQuality, summary, strengths, problems, paragraphRows, promotionPlan, analysis, methodGuidedKit } = report;
  const strengthRows = strengths.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const problemRows = problems.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const goodRows = (sentenceQuality.good || []).map((x) => `<li class="sentence-good">${escapeHtml(x)}</li>`).join('');
  const badRows = (sentenceQuality.bad || []).map((x) => `<li class="sentence-bad">${escapeHtml(x)}</li>`).join('');
  const promotionRows = (promotionPlan.steps || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const methodRows = (methodGuidedKit?.notes || []).map((note) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(note.title)}</span><strong>${escapeHtml(note.source || '')}</strong></div>
      <p>${escapeHtml(note.focus || '')}</p>
    </div>
  `).join('');
  const methodActionRows = (methodGuidedKit?.critiqueActions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const paraRows = paragraphRows.length
    ? paragraphRows.map((item) => `
      <div class="flaw-row">
        <div class="flaw-row-top"><span>第${item.index + 1}段｜${escapeHtml(item.level)}</span><strong>${item.score}/100</strong></div>
        <p><strong>老师批注</strong>：${escapeHtml(item.comment)}</p>
        <p><strong>当前问题</strong>：${escapeHtml((item.issues || []).join('、') || '本段基础较稳')}</p>
        <p><strong>升档动作</strong>：${escapeHtml(item.suggestion)}</p>
        <div class="flaw-actions">
          <span class="flaw-target">目标：把这一段推向更像一类卷的写法；请学生自己重写。</span>
        </div>
      </div>
    `).join('')
    : '<p>暂无逐段批注。</p>';
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>习作精批报告</h3>
      <div class="agent-tags">
        <span class="agent-tag">折算：${score.score70}/70</span>
        <span class="agent-tag">分档：${escapeHtml(score.level)}</span>
        <span class="agent-tag risk ${normalizeRiskClass(score.offTopic?.riskLevel || '中')}">偏题风险：${escapeHtml(score.offTopic?.riskLevel || '中')}</span>
        <span class="agent-tag">讲评腔指数：${lectureTone.score}/100</span>
      </div>
    </div>
    <div class="agent-result-block">
      <h4>总评</h4>
      <p>${escapeHtml(summary)}</p>
      <p>当前命中的范例母题：${escapeHtml(analysis.exampleGuidedKit?.anchorCard?.title || '未命中')}</p>
    </div>
    <div class="agent-result-block">
      <h4>这篇习作已经有的优点</h4>
      <ul>${strengthRows || '<li>暂未识别出稳定优势，需要先把结构站稳。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>眼下最影响提分的 4 个问题</h4>
      <ul>${problemRows || '<li>当前未识别出显著问题。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>按 22-23 方法论看这篇</h4>
      <div class="score-grid">${methodRows || '<p>当前未命中额外方法论提醒。</p>'}</div>
      <ul>${methodActionRows || '<li>当前未补出新的方法动作。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>逐段批注</h4>
      ${paraRows}
    </div>
    <div class="agent-result-block">
      <h4>句子层提醒</h4>
      <p><strong>可保留的好句</strong></p>
      <ul>${goodRows || '<li>暂无明显高分句，可先把段落逻辑做稳。</li>'}</ul>
      <p><strong>需要重写的句子</strong></p>
      <ul>${badRows || '<li>暂无明显低分句。</li>'}</ul>
    </div>
    <div class="agent-result-block">
      <h4>升档路线</h4>
      <p>当前目标：${escapeHtml(promotionPlan.target)}</p>
      <ul>${promotionRows}</ul>
      <p class="agent-para-issues">以上路线只用于指出问题，不替学生改写正文。</p>
    </div>
  `;
}

function renderScoreReport(report, container) {
  const rows = report.dimensions.map((x) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(x.label)}</span><strong>${x.score}/${x.max}</strong></div>
      <div class="score-bar"><span style="width:${Math.round((x.score / x.max) * 100)}%"></span></div>
    </div>`).join('');
  const actions = report.actions.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const boostActions = buildScoreBoostActions(report).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const weakPlan = buildWeakTrainingPlan(report);
  const weakRows = (weakPlan.weak || []).map((w, i) => `<li><strong>${i + 1}. ${escapeHtml(w.label)}</strong>：${escapeHtml(w.drill)} <button class="agent-btn ghost weak-training-btn" type="button" data-training-prompt="${escapeHtml(w.prompt)}">推送练习</button></li>`).join('');
  const errorBook = buildErrorBookSummary(report);
  const currentErrorTags = (errorBook.currentTags || []).map((tag) => `<span class="agent-tag risk high">${escapeHtml(tag)}</span>`).join('');
  const topErrorRows = (errorBook.drills || []).map((item, i) => `<li><strong>${i + 1}. ${escapeHtml(item.tag)}</strong>（${item.count}次）：${escapeHtml(item.drill)} <button class="agent-btn ghost error-drill-btn" type="button" data-training-prompt="${escapeHtml(item.prompt)}">推送专项</button></li>`).join('');
  const recentErrorRows = (errorBook.recent || []).map((item) => `<li>${escapeHtml(item.topic)} ｜ ${escapeHtml((item.tags || []).join('、'))}</li>`).join('');
  const paragraphAdviceRows = renderParagraphAdviceRows(report.offTopic?.paragraphAdvice || [], 'score');
  container.innerHTML = `
    <div class="agent-result-head"><h3>上海作文维度评分报告</h3><div class="agent-tags"><span class="agent-tag">总分：${report.total}/100</span><span class="agent-tag">折算：${report.score70}/70</span><span class="agent-tag">分档：${escapeHtml(report.level)}</span><span class="agent-tag risk ${normalizeRiskClass(report.offTopic.riskLevel)}">偏题风险：${escapeHtml(report.offTopic.riskLevel)}</span></div></div>
    ${renderObsidianBenchmarkPanel(report)}
    <div class="agent-result-block"><h4>分维度得分</h4><div class="score-grid">${rows}</div></div>
    <div class="agent-result-block"><h4>文本统计</h4><p>字数：${report.stats.wordCount} ｜ 句子：${report.stats.sentenceCount} ｜ 段落：${report.stats.paragraphCount}</p></div>
    <div class="agent-result-block"><h4>提分动作</h4><ul>${actions}${boostActions}</ul><p class="agent-para-issues">这里只列提分动作，请学生自己改。</p></div>
    <div class="agent-result-block"><h4>错因本（当前草稿）</h4><div class="agent-tags">${currentErrorTags || '<span class="agent-tag">当前未识别明显高频错因</span>'}</div><p>已累计记录：${errorBook.total}次</p></div>
    <div class="agent-result-block"><h4>高频错因专项训练</h4><ul>${topErrorRows || '<li>暂未形成高频错因画像</li>'}</ul><p>最近记录</p><ul>${recentErrorRows || '<li>暂无错因记录</li>'}</ul></div>
    <div class="agent-result-block"><h4>段落级诊断</h4>${paragraphAdviceRows}</div>
    <div class="agent-result-block"><h4>薄弱维度专项训练（已累计${weakPlan.count}次评分）</h4><ul>${weakRows || '<li>暂无训练建议</li>'}</ul></div>`;
}

function buildScoreBoostActions(report) {
  const picks = [];
  const sorted = [...(report.dimensions || [])].sort((a, b) => a.score - b.score);
  sorted.slice(0, 3).forEach((d) => {
    if (d.label === '审题立意') picks.push('每段首句加入题眼词，并在段末回扣题目问法。');
    if (d.label === '论证与材料') picks.push('每个案例后补1句“机制解释”，避免只讲故事。');
    if (d.label === '思辨深度') picks.push('补“诚然-然而-因此”三步转折，加入边界条件。');
    if (d.label === '结构章法') picks.push('强化三段结构：界定概念→展开论证→条件化结论。');
    if (d.label === '语言表达') picks.push('删口号句，改成短句+判断句，提升表达清晰度。');
  });
  return dedupeArray(picks).slice(0, 3);
}

function trimDraftToWordLimit(draft, limit) {
  const paragraphs = splitParagraphs(draft);
  const out = [];
  for (let i = 0; i < paragraphs.length; i += 1) {
    const p = paragraphs[i];
    if (countWords(`${out.join('\n\n')}\n\n${p}`) <= limit) {
      out.push(p);
      continue;
    }
    const sentences = splitSentences(p);
    let keep = '';
    for (let j = 0; j < sentences.length; j += 1) {
      const candidate = keep ? `${keep}。${sentences[j]}` : sentences[j];
      if (countWords(`${out.join('\n\n')}\n\n${candidate}`) > limit) break;
      keep = candidate;
    }
    if (keep) out.push(ensureSentenceEnding(keep));
    break;
  }
  return out.join('\n\n').trim();
}

async function runBaselineHealthCheck() {
  const checks = [];
  const requiredIds = [
    'essayTopicInput',
    'essayDraftInput',
    'handwritingImageInput',
    'handwritingOcrFillBtn',
    'clearHandwritingImageBtn',
    'handwritingPreviewList',
    'analyzeTopicBtn',
    'generateFullEssayBtn',
    'generateTieredEssayBtn',
    'offTopicCheckBtn',
    'scoreDraftBtn',
    'masterCritiqueBtn',
    'improveDraftBtn',
    'weeklyDashboardBtn',
    'exampleTrainingList',
    'obEssaySelect',
    'obDissectBtn',
    'obRecommendBtn',
    'obActionTypeSelect',
    'obActionBankBtn',
    'obTutorPanel',
    'obKnowledgeSearchInput',
    'obKnowledgeFolderSelect',
    'obKnowledgeTypeSelect',
    'obKnowledgeThemeSelect',
    'obKnowledgeScoreSelect',
    'obKnowledgePurposeSelect',
    'obKnowledgeTopicFilterBtn',
    'obKnowledgeSearchBtn',
    'obKnowledgeResetBtn',
    'obKnowledgePanel',
    'manualScoreInput',
    'manualCalibrationBtn',
    'regressionTestBtn',
    'baselineCheckBtn',
    'agentResult'
  ];
  const missing = requiredIds.filter((id) => !document.getElementById(id));
  checks.push({
    name: '页面核心元素',
    ok: missing.length === 0,
    detail: missing.length ? `缺失：${missing.join('、')}` : '关键元素齐全'
  });

  const functionMap = [
    'analyzeEssayTopic',
    'runOffTopicCheck',
    'scoreEssayDraft',
    'buildShanghaiTeacherReviewReport'
  ];
  const missingFns = functionMap.filter((fn) => typeof window[fn] !== 'function');
  checks.push({
    name: '关键函数可用',
    ok: missingFns.length === 0,
    detail: missingFns.length ? `缺失：${missingFns.join('、')}` : '核心函数可调用'
  });

  const genBtn = document.getElementById('generateFullEssayBtn');
  const genBound = !!(genBtn && (genBtn.dataset.boundGenerate === '1' || typeof genBtn.onclick === 'function'));
  checks.push({
    name: '一键范文按钮绑定',
    ok: genBound,
    detail: genBound ? '已绑定（主生成链路）' : '未检测到有效绑定'
  });

  const localStorageOK = testLocalStorage();
  checks.push({
    name: '本地存储读写',
    ok: localStorageOK.ok,
    detail: localStorageOK.message
  });

  const versionCheck = checkScriptVersions();
  checks.push({
    name: '脚本版本一致性',
    ok: versionCheck.ok,
    detail: versionCheck.message
  });

  const realCalibration = getRealScoreCalibrationSummary();
  checks.push({
    name: '真实评分样本结构',
    ok: realCalibration.loaded,
    detail: realCalibration.loaded
      ? `已接入${realCalibration.source}：真实样本${realCalibration.total}/${realCalibration.targetCount}篇，模板${realCalibration.templateCount}个。`
      : '未加载 score_calibration_samples.js，人工真实评分样本无法沉淀。'
  });

  const featureCheck = runFeatureFlowChecks();
  checks.push(...featureCheck);
  const regression = await runRegressionSuite();
  checks.push({
    name: '回归测试样例',
    ok: regression.passed === regression.total,
    detail: `通过 ${regression.passed}/${regression.total}`
  });

  const passed = checks.filter((x) => x.ok).length;
  return {
    checks,
    passed,
    total: checks.length,
    level: passed === checks.length ? '通过' : (passed >= checks.length - 1 ? '基本通过' : '未通过'),
    suggestions: checks.filter((x) => !x.ok).map((x) => buildBaselineFixSuggestion(x.name))
  };
}

function getShanghaiScoreRegressionSamples() {
  const recognitionTopic = '生活中，人们常用认可度判别事物，区分高下。请写一篇文章，谈谈你对“认可度”的认识和思考。';
  const newOldTopic = '这段话可以启发人们如何去认识事物。请写一篇文章，谈谈你的思考和感悟。';
  return [
    {
      id: 'anchor-class1-source-68',
      label: '一类上原评样本',
      topic: newOldTopic,
      expectedScore: 68,
      tolerance: 4,
      draft: [
        '以旧维新 生生不息（一类上 68分）',
        '',
        '曹杨二中 高三 石英娜',
        '',
        '旧并不是停滞的同义词，新也不是凭空冒出的口号。真正有生命力的更新，往往是在对旧有经验的理解、辨析和转化中完成的。若只把旧看成负担，便会失去文化与经验的根；若只把新看成装饰，又会让改变停在表面。所谓以旧维新，正在于在继承中辨认可再生的力量，在更新中保留生命延续的脉络。',
        '',
        '从个人成长看，一个人并不是靠否定过去来获得新生。旧经验中有惯性，也有积累；有束缚，也有方法。学习中的错题、阅读中的旧见、生活中的习惯，若只被一概抛弃，就难以形成真正的反思。它们只有经过重新解释，才会成为新的判断力。由此可见，维新不是断裂，而是对旧有材料的再组织。',
        '',
        '从社会文化看，许多更新也不是抛开传统另起炉灶。传统戏曲进入新的舞台空间，古典诗词借由新的媒介被重新理解，城市街区在保护旧貌的同时更新公共功能，这些现象说明，旧并非只能被保存，也可以被激活。关键在于更新是否尊重原有肌理，是否让旧的价值在新的现实中继续发挥解释力。',
        '',
        '这种关系在今天尤其值得讨论。技术更新很快，观念变化也快，人们容易把速度误认为进步，把新鲜误认为创造。可是没有旧经验的校正，新常常只是短暂的热闹；没有新问题的召唤，旧也可能变成僵硬的陈列。真正的生长，恰恰发生在二者彼此照亮的时候。',
        '',
        '由此可见，旧与新的关系并不是时间先后的关系，而是价值生成的关系。旧提供沉淀、尺度和记忆，新提供问题、方法和可能。一个社会若只有旧，便缺少面向未来的勇气；若只有新，又容易失去判断的根基。二者相互校正，才构成持续更新的生命形态。',
        '',
        '当然，强调以旧维新，并不意味着守旧。若把旧物、旧制、旧观念都神圣化，更新就会变成保守的外衣。真正成熟的态度，是区分旧中可承续者与应被淘汰者：前者需要被转译，后者必须被扬弃。只有这样，新才不是轻浮的替换，旧也不是沉重的包袱。',
        '',
        '对青年而言，这种判断同样重要。学习传统，不是为了背负过去，而是为了获得更宽的坐标；拥抱新知，也不是为了抛弃来处，而是为了让旧有经验在新的现实中继续发生作用。当一个人能够在旧中发现可更新的资源，在新中守住不被流行裹挟的尺度，他才真正拥有面向未来的主体性。',
        '',
        '回到题目，生生不息的生命力，正在于旧与新之间并非简单对立。旧为新提供根系，新使旧获得再生。面对快速变化的时代，我们需要的不是盲目逐新，也不是固守旧壳，而是在辨析、转化与创造中完成延续。以旧维新，方能生生不息。'
      ].join('\n')
    },
    {
      id: 'anchor-class1-entry-63',
      label: '一类入口样本',
      topic: recognitionTopic,
      expectedScore: 63,
      tolerance: 5,
      draft: [
        '认可度不是价值本身，而是社会对价值的一种临时投票。它之所以常被用来判别事物，是因为现代生活充满选择，人们需要借助公共反馈降低判断成本；但它之所以值得警惕，也正在于公共反馈会把复杂价值压缩成单一数字。',
        '',
        '认可度首先具有工具意义。在陌生领域里，一个人的知识有限，完全脱离他人的经验并不现实。课程评分、医学科普的同行评价、城市公共服务的满意度，都能帮助我们快速发现较可靠的选项。这种认可并非真理，却是通向判断的入口。',
        '',
        '然而，把入口误认为终点，认可度就会反过来支配判断。社交平台上的热搜、排名和点赞，常把可传播性包装成价值本身。一个观点被大量转发，可能只是因为它足够刺激情绪；一个作品被暂时冷落，也可能只是因为它尚未遇到合适的理解者。认可度在这里暴露的不是价值的高下，而是传播机制的偏向。',
        '',
        '因此，问题的核心不在认可度，而在使用认可度的人是否保有主体意识。若把认可度当作参照，人仍会追问它的来源、范围和标准；若把认可度当作裁判，人便把自己的判断权交给了多数。二者只差一步，却决定了人是在借助社会经验，还是被社会目光规训。',
        '',
        '这种区分在今天尤其重要。校园里，有人根据热门专业选择道路，却忽略自己的能力结构；消费中，有人追逐爆款，却很少询问它是否真的适合自身生活。认可度提供了可见的安全感，也制造了隐蔽的同质化。它让人少走弯路，也可能让人不再走自己的路。',
        '',
        '当然，警惕认可度并不意味着崇拜小众。把不被认可等同于深刻，同样是一种反向依赖。真正值得追求的，是在公共意见与个人判断之间建立可反思的距离：既承认多数经验的参考价值，也保留对少数可能性的耐心。',
        '',
        '这种距离并不容易建立。越是在信息快速流动的环境里，人越容易把“大家都说好”当成省力的答案，也越容易把“不被理解”误认为自己的独特。认可度的复杂性正在于，它既可能是经验的沉淀，也可能是情绪的扩散；既可能帮助我们进入公共生活，也可能让我们失去独立判断的耐心。',
        '',
        '由此看来，认可度可以帮助我们判别事物，却不能最终决定事物的高下。它只有在标准清楚、来源可靠、主体不放弃思考的前提下，才具有合理性。一个人若能借认可度进入世界，又能超越认可度完成判断，才可能在众声喧哗中守住清醒。'
      ].join('\n')
    },
    {
      id: 'anchor-class2-middle-56',
      label: '二类中样本',
      topic: recognitionTopic,
      expectedScore: 56,
      tolerance: 5,
      draft: [
        '认可度是现代社会中常见的判断工具。它能帮助人们在大量选择中迅速作出决定，但它并不能等同于事物本身的价值。我们既不能完全拒绝认可度，也不能把认可度当成唯一标准。',
        '',
        '在信息过载的环境里，认可度有现实意义。一本书、一门课程、一项服务如果获得较多认可，至少说明它经过了一定范围的检验。对普通人来说，这种公共反馈可以降低选择成本，也能形成基本信任。',
        '',
        '但是，认可度也可能遮蔽独立判断。许多平台用点赞、转发和排名制造热度，人们容易把多数人的选择直接当成正确答案。此时，认可度不再是参考，而变成外部标准对主体思考的替代。',
        '',
        '所以，看待认可度需要条件意识。面对陌生领域，我们可以把它当作入口；面对价值判断，则应追问它来自哪些人、基于什么标准、是否经得起时间和实践检验。这样才能避免被单一指标牵着走。',
        '',
        '从校园生活看，这种问题并不遥远。有同学选择社团时只看人数多少，有同学选书时只看排行榜，也有同学把一次考试后的排名当成对自身价值的全部说明。这些做法都有现实原因，因为认可度能给人一种安全感；但如果缺少追问，它也会让人把外部评价误认为内在方向。',
        '',
        '进一步说，认可度的合理性取决于它是否能被解释。若一个选择受到认可，是因为它确实解决了问题、经受了检验，那么这种认可值得参考；若认可只是来自流量、从众或短暂情绪，它就不能承担判别高下的责任。这里的关键，不是认可度高不高，而是它背后的评价标准是否清楚。',
        '',
        '对青年而言，真正成熟的态度不是拒绝认可度，也不是被认可度牵引，而是在参考公共意见的同时保持自己的判断能力。只有这样，认可度才会成为认识世界的工具，而不是束缚自我的尺度。',
        '',
        '回到题目，认可度可以参与判断，却不应替代判断。它在信息不足时提供入口，在标准清楚时提供参考，在主体清醒时提供帮助；但一旦人放弃追问，它就会从工具变成枷锁。因此，面对认可度，我们更需要的是使用它的能力，而不是服从它的习惯。'
      ].join('\n')
    },
    {
      id: 'anchor-class3-boundary-41',
      label: '三四类临界样本',
      topic: recognitionTopic,
      expectedScore: 41,
      tolerance: 6,
      draft: [
        '认可度在人们生活中经常出现，很多人都会根据认可度来判断一件事好不好。认可度高的东西往往被更多人看见，也更容易获得机会。一本书被很多人推荐，一家店被很多人打高分，一个学生被老师和同学表扬，都会让人觉得它们比较好。这种想法有一定道理，因为别人的看法可以给我们参考，也可以让我们少走弯路。',
        '',
        '可是认可度也不一定完全可靠。大家喜欢的东西，有时只是因为它比较热闹，或者大家都在说。生活里有些人买东西只看销量，有些人选择兴趣只看别人学什么，这样虽然方便，却容易忽略自己的真实需要。有些暂时不被认可的事物，也可能在以后被人发现价值。因此，认可度不能成为唯一答案。',
        '',
        '在校园里也有类似情况。有人看到一个学习方法被很多同学推荐，就马上照着做；有人看到某个活动参加的人很多，就认为它一定很有价值。这些选择有时候是对的，但也可能只是大家互相影响。每个人的情况不一样，别人认可的东西不一定适合自己。',
        '',
        '社会上也常有这样的现象。一个话题被很多人讨论，就会让人觉得它重要；一个商品被很多人购买，就会让人觉得它好。可是热闹不一定代表真实价值，冷清也不一定代表没有意义。我们看待认可度时，不能只看人数多少，还要想一想自己真正需要什么。',
        '',
        '如果把认可度当成唯一标准，人的判断就会变得简单。很多事情需要亲自了解，需要比较，也需要时间。只看别人怎么评价，虽然快，却可能错过更适合自己的东西。',
        '',
        '所以我认为，我们既要看到认可度的作用，也要看到它的局限。认可度可以帮助人们判断，但最后还是要靠自己思考。面对大家都认可的东西，我们不能盲目跟从；面对暂时不被认可的东西，也不能轻易否定。只有这样，才能在生活中作出更适合自己的选择。'
      ].join('\n')
    },
    {
      id: 'anchor-class4-31',
      label: '四类样本',
      topic: recognitionTopic,
      expectedScore: 31,
      tolerance: 7,
      draft: [
        '人生需要努力。一个人只要努力，就能得到别人的认可。被认可会让人高兴，也会让人更有动力。',
        '',
        '从小到大，我们都希望得到老师和家长的表扬。表扬说明我们做得好，所以我们应该继续努力，争取更多人的认可。',
        '',
        '如果一个人不努力，就不会被别人喜欢。社会也是这样，大家都要积极向上，不能懒惰。只要坚持奋斗，就能成功。',
        '',
        '生活中还有很多事情都需要认可。比如一个人参加比赛，如果大家认可他，他就会更有信心；如果没有人认可，他就可能失去动力。所以我们要多鼓励别人，也要努力让别人看到自己的优点。',
        '',
        '当然，有时候别人不认可我们，我们也不能放弃。只要心中有目标，就应当一直坚持。因为成功往往属于努力的人，只要每天进步一点，最后就会得到回报。',
        '',
        '在学校里，成绩好的同学常常会得到认可，参加活动积极的同学也会得到认可。这些认可都能鼓励我们继续进步。因此，认可度可以让人看到自己的不足，也可以让人找到努力方向。',
        '',
        '但是，认可度有时也不一定准确。有的人努力了很久却暂时没有被看见，有的人只是表现得很热闹却容易被表扬。所以我们不能因为没有认可就否定自己，也不能因为获得认可就骄傲。',
        '',
        '所以，我认为认可度说明一个人是否努力，也说明社会是否公平。我们应该追求更高认可度，让自己变得更优秀。只有这样，人生才会更有意义，社会也会更加美好。'
      ].join('\n')
    }
  ];
}

function getCalibrationTopicSet() {
  return [
    {
      id: 'recognition',
      topic: '生活中，人们常用认可度判别事物，区分高下。请写一篇文章，谈谈你对“认可度”的认识和思考。',
      type: '价值判断题',
      key: '认可度',
      relation: '公共评价与真实价值'
    },
    {
      id: 'special-transfer-classic',
      topic: '由“专”到“传”，必定要经过“转”吗？请联系社会生活，写一篇文章，谈谈你的认识与思考。',
      type: '问题式命题',
      key: '专转传',
      relation: '专业深度、公共传播与时间沉淀'
    },
    {
      id: 'question-conclusion',
      topic: '小时候人们喜欢发问，长大后往往看重结论。对此，有人感到担忧，有人觉得正常，你有怎样的思考？',
      type: '关系辩证题',
      key: '发问与结论',
      relation: '开放追问与阶段性判断'
    },
    {
      id: 'freedom-limit',
      topic: '你可以选择穿越沙漠的道路和方式，所以你是自由的；你必须穿越这片沙漠，所以你又是不自由的。请写一篇文章，谈谈你的思考。',
      type: '关系辩证题',
      key: '自由与不自由',
      relation: '选择空间与现实约束'
    }
  ];
}

function getCalibrationTierSet() {
  return [
    { key: 'class1-upper', label: '一类上', score: 68, band: '一类卷', reason: '立意能从题目关系进入价值机制，段落推进稳定，边界与现实落点都较完整。', deduction: '若语言略有密集，通常不影响一类上判断。' },
    { key: 'class1-middle', label: '一类中', score: 65, band: '一类卷', reason: '中心判断较成熟，能持续回扣题眼，有条件意识，但局部例证或语言还未完全打开。', deduction: '现实材料或结尾升华略薄，限制上限。' },
    { key: 'class1-lower', label: '一类下', score: 63, band: '一类卷', reason: '能进入一类入口，关系处理清楚，有边界判断，但论证密度不够均衡。', deduction: '中段机制解释还可再深一层。' },
    { key: 'class2-upper', label: '二类上', score: 60, band: '二类卷', reason: '符合题意且结构完整，有少量新意或思辨动作，但思想深度未持续拉开。', deduction: '部分段落仍停留在“说明合理”而非“解释机制”。' },
    { key: 'class2-middle', label: '二类中', score: 56, band: '二类卷', reason: '中心明确、内容较充实、语言通顺，是较稳定的过关卷。', deduction: '缺少能够冲一类的独到判断和层层递进。' },
    { key: 'class2-lower', label: '二类下', score: 53, band: '二类卷', reason: '基本符合题意，文章完整，但分析较平，段首推进功能弱。', deduction: '例后分析不足，边界意识不够明显。' },
    { key: 'class3', label: '三类卷', score: 46, band: '三类卷', reason: '能碰到题意，中心尚可辨认，但论证薄、材料泛，容易滑向常识表态。', deduction: '核心概念覆盖不连续，主体段缺少机制解释。' },
    { key: 'class4', label: '四类卷', score: 31, band: '四类卷', reason: '文章形式完整，但材料核心被偷换或明显写偏。', deduction: '题眼没有贯穿，内容多为口号或泛泛人生道理。' }
  ];
}

function buildCalibrationSampleDraft(topicInfo, tier) {
  const key = topicInfo.key;
  const relation = topicInfo.relation;
  if (tier.key.startsWith('class1')) {
    return [
      `讨论“${key}”，不能只给出赞成或反对的姿态，而要辨认它背后的关系结构。${relation}并非简单并列，而是在不同条件下互相制约、彼此校正的过程。真正成熟的判断，应当承认其现实功能，也看见它可能带来的遮蔽。`,
      `首先，${key}之所以会成为一个问题，是因为它回应了真实生活中的某种需要。人们面对复杂世界时，总要借助经验、制度、他人评价或已有路径来降低判断成本。若完全否认这一点，文章就会变成脱离生活的空论。`,
      `然而，现实功能并不等于价值本身。一旦人把工具当作目的，把阶段性答案当作终极尺度，${key}就可能从帮助判断的入口变成限制思考的框架。这里的关键不在于简单否定它，而在于追问它何时有效、何时失真。`,
      `进一步看，${relation}的深层矛盾，正体现了上海卷常考的主体意识问题。一个人不是被动接受外部标准，而是在外部标准与内在判断之间建立距离：既不任性拒绝公共经验，也不把公共经验奉为不可追问的答案。`,
      `这种判断放在今天尤其必要。平台排名、热门选择、效率逻辑和社会期待不断塑造我们的眼光，许多看似自然的选择，背后其实包含价值排序。若没有反思，人就容易把“多数如此”误作“理应如此”。`,
      `当然，强调反思并不意味着追求孤立的小众立场。真正的清醒不是为了显示自己不同，而是为了让判断经得起理由、边界与现实后果的检验。只有这样，${key}才不会沦为口号，也不会被简单化处理。`,
      `所以，面对“${key}”，高分立意应落在条件化判断上：承认其现实价值，限制其越界风险，并让主体在复杂关系中完成选择。这样的文章不追求单一答案，而追求把答案说得有前提、有机制、有分寸。`
    ].join('\n\n');
  }
  if (tier.key.startsWith('class2')) {
    return [
      `我认为，看待“${key}”需要辩证。它在生活中有一定作用，但不能被绝对化。只有把它放到具体情境中，才能判断它是否合理。`,
      `${key}首先有积极意义。面对复杂选择，人们不可能每次都从头判断，所以需要借助某种标准或经验。这样可以提高效率，也能减少盲目尝试。`,
      `但是，${key}也可能带来问题。如果只相信它，就容易忽视自己的真实判断，也可能让不同的人走向相似选择。现实中很多人跟随热门意见，就是因为缺少进一步追问。`,
      `因此，关键不是完全接受或完全否定，而是要保持独立思考。我们可以参考外部标准，但不能让它替代自己的判断。`,
      `对青年而言，这种态度很重要。学习、选科、阅读和生活选择中，我们都需要听取意见，也需要结合自身情况。只有这样，${key}才会成为帮助我们成长的工具，而不是限制我们的框架。`,
      `总之，${key}有价值，也有限度。我们应当在承认其作用的同时保持清醒，让判断既有现实依据，也有自己的立场。`
    ].join('\n\n');
  }
  if (tier.key === 'class3') {
    return [
      `${key}在生活中很常见，很多人都会遇到这个问题。我觉得它有好的一面，也有不好的一面，所以要理性看待。`,
      `它好的地方在于能给人帮助。比如我们做选择时，可以参考别人的经验，这样就不会太盲目。大家都认为好的东西，往往也有一定道理。`,
      `但是它也有不好的地方。如果所有人都这样想，就可能没有自己的想法，也可能盲目跟风。有些事情不能只看表面，还要自己判断。`,
      `所以我们既要看到${key}的作用，也要看到它的问题。面对生活中的选择，要多思考，不要完全听别人怎么说。`,
      `总之，只要我们保持理性，就能更好地处理${key}带来的影响，让自己不断成长。`
    ].join('\n\n');
  }
  return [
    `人生需要努力，也需要被别人认可。只要我们积极向上，就能得到更多机会。`,
    `生活中很多事情都说明了这一点。老师表扬学生，家长鼓励孩子，社会奖励成功的人，这些都能让人更有信心。所以我们要争取得到更多人的肯定。`,
    `如果一个人不努力，就很难成功。无论遇到什么困难，都应该坚持到底。只有这样，人生才会越来越好。`,
    `所以我认为，我们要相信自己，也要努力得到别人的认可。这样社会会更和谐，个人也会更幸福。`
  ].join('\n\n');
}

function getShanghaiScoreCalibrationSamples() {
  const syntheticSamples = getCalibrationTopicSet().flatMap((topicInfo) =>
    getCalibrationTierSet().map((tier) => ({
      id: `${topicInfo.id}-${tier.key}`,
      label: `${topicInfo.key}｜${tier.label}`,
      topic: topicInfo.topic,
      topicType: topicInfo.type,
      expectedScore: tier.score,
      expectedBand: tier.band,
      teacherReason: tier.reason,
      deductions: tier.deduction,
      sourceKind: '系统同题多档样本',
      draft: buildCalibrationSampleDraft(topicInfo, tier)
    }))
  );
  return [...getRealScoreCalibrationSamples(), ...syntheticSamples];
}

function getRealScoreCalibrationRegistry() {
  const fallback = {
    loaded: false,
    version: 0,
    source: 'score_calibration_samples.js',
    samples: [],
    sampleTemplates: []
  };
  try {
    if (typeof window !== 'undefined' && window.REAL_SCORE_CALIBRATION_REGISTRY) {
      return { ...fallback, loaded: true, ...window.REAL_SCORE_CALIBRATION_REGISTRY };
    }
    if (typeof REAL_SCORE_CALIBRATION_REGISTRY !== 'undefined' && REAL_SCORE_CALIBRATION_REGISTRY) {
      return { ...fallback, loaded: true, ...REAL_SCORE_CALIBRATION_REGISTRY };
    }
  } catch (_) {}
  return fallback;
}

function normalizeRealScoreCalibrationSample(sample, index) {
  if (!sample || sample.status !== 'verified') return null;
  const teacherScore = Number(sample.teacherScore);
  if (!Number.isFinite(teacherScore) || teacherScore < 0 || teacherScore > 70) return null;
  const topic = String(sample.topic || '').trim();
  const draft = String(sample.essay || sample.draft || '').trim();
  if (!topic || !draft) return null;
  return {
    id: sample.id || `real-score-sample-${index + 1}`,
    label: sample.label || `${sample.teacherBand || getShanghaiOfficialBand(teacherScore)}｜真实老师评分样本`,
    topic,
    topicType: sample.topicType || detectTopicType(topic).name,
    expectedScore: teacherScore,
    expectedBand: sample.teacherBand || getShanghaiOfficialBand(teacherScore),
    teacherReason: (sample.scoreReasons || []).join('；') || sample.teacherComment || '真实老师评分样本，待补充得分理由。',
    deductions: (sample.deductions || []).join('；') || sample.deductionNotes || '暂无明确扣分点。',
    sourceKind: sample.source || '真实老师评分样本',
    draft,
    raw: sample
  };
}

function getRealScoreCalibrationSamples() {
  const registry = getRealScoreCalibrationRegistry();
  return (registry.samples || [])
    .map((sample, index) => normalizeRealScoreCalibrationSample(sample, index))
    .filter(Boolean);
}

function getRealScoreCalibrationSummary() {
  const registry = getRealScoreCalibrationRegistry();
  const samples = getRealScoreCalibrationSamples();
  const byBand = {};
  const byType = {};
  samples.forEach((sample) => {
    const band = sample.expectedBand || getShanghaiOfficialBand(sample.expectedScore);
    byBand[band] = (byBand[band] || 0) + 1;
    const type = sample.topicType || '未分类';
    byType[type] = (byType[type] || 0) + 1;
  });
  return {
    loaded: !!registry.loaded,
    source: registry.source || 'score_calibration_samples.js',
    version: registry.version || 0,
    total: samples.length,
    byBand,
    byType,
    templateCount: (registry.sampleTemplates || []).length,
    targetCount: registry.targetCount || 30
  };
}

async function runShanghaiScoreCalibrationSuite() {
  const samples = getShanghaiScoreRegressionSamples();
  const sampleBank = getShanghaiScoreCalibrationSamples();
  const realSummary = getRealScoreCalibrationSummary();
  const cases = [];
  for (const sample of samples) {
    try {
      const report = await buildShanghaiTeacherReviewReport(sample.topic, sample.draft);
      const predicted = Number(report.total70 || 0);
      const error = predicted - Number(sample.expectedScore || 0);
      const bandOk = getShanghaiBandKeyByScore(predicted) === getShanghaiBandKeyByScore(sample.expectedScore);
      const scoreOk = Math.abs(error) <= Number(sample.tolerance || 5);
      const boundaryOk = scoreOk && Math.abs(error) <= 6 && /临界/.test(sample.label || '');
      cases.push({
        id: sample.id,
        name: sample.label,
        ok: (bandOk && scoreOk) || boundaryOk,
        predicted,
        expected: sample.expectedScore,
        tolerance: sample.tolerance,
        error,
        predictedBand: getShanghaiOfficialBand(predicted),
        expectedBand: getShanghaiOfficialBand(sample.expectedScore),
        detail: `${predicted}/70，期望${sample.expectedScore}±${sample.tolerance}；${report.officialScore?.calibrationDecision?.anchorLabel || '无锚点'}`
      });
    } catch (err) {
      cases.push({
        id: sample.id,
        name: sample.label,
        ok: false,
        predicted: 0,
        expected: sample.expectedScore,
        tolerance: sample.tolerance,
        error: 0,
        predictedBand: '异常',
        expectedBand: getShanghaiOfficialBand(sample.expectedScore),
        detail: `异常：${err?.message || '未知错误'}`
      });
    }
  }
  const passed = cases.filter((x) => x.ok).length;
  const meanAbsError = cases.length ? Math.round(cases.reduce((sum, item) => sum + Math.abs(Number(item.error || 0)), 0) / cases.length * 10) / 10 : 0;
  const bias = cases.length ? Math.round(cases.reduce((sum, item) => sum + Number(item.error || 0), 0) / cases.length * 10) / 10 : 0;
  const bandAccuracy = cases.length ? Math.round((cases.filter((x) => x.predictedBand === x.expectedBand).length / cases.length) * 100) : 0;
  return {
    cases,
    passed,
    total: cases.length,
    meanAbsError,
    bias,
    bandAccuracy,
    sampleBankSize: sampleBank.length,
    realSampleCount: realSummary.total,
    sameTopicGroupCount: getCalibrationTopicSet().length,
    level: passed === cases.length ? '通过' : (passed >= cases.length - 1 ? '基本通过' : '需校准'),
    summary: `档位准确率${bandAccuracy}%，平均误差${meanAbsError}分，整体${bias > 0 ? '偏松' : (bias < 0 ? '偏严' : '基本平衡')}${Math.abs(bias)}分；真实老师样本${realSummary.total}/${realSummary.targetCount}篇。`
  };
}

function renderBaselineCheckReport(report, container) {
  const rows = report.checks.map((c) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(c.name)}</span><strong>${c.ok ? '通过' : '失败'}</strong></div>
      <p class="agent-para-issues">${escapeHtml(c.detail)}</p>
    </div>
  `).join('');
  const fixes = (report.suggestions || []).length
    ? `<ul>${report.suggestions.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
    : '<p>当前无需修复，基础稳定性达标。</p>';
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>基础自检报告（稳定性）</h3>
      <div class="agent-tags">
        <span class="agent-tag">结果：${escapeHtml(report.level)}</span>
        <span class="agent-tag">通过项：${report.passed}/${report.total}</span>
      </div>
    </div>
    <div class="agent-result-block"><h4>检查明细</h4><div class="score-grid">${rows}</div></div>
    <div class="agent-result-block"><h4>修复建议</h4>${fixes}</div>
  `;
}

function testLocalStorage() {
  try {
    const key = '__gaokao_health_test__';
    localStorage.setItem(key, 'ok');
    const v = localStorage.getItem(key);
    localStorage.removeItem(key);
    return { ok: v === 'ok', message: v === 'ok' ? '读写正常' : '读写异常' };
  } catch (err) {
    return { ok: false, message: `不可用：${err?.message || '未知错误'}` };
  }
}

function checkScriptVersions() {
  const resources = [
    ...[...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') || ''),
    ...[...document.querySelectorAll('link[rel="stylesheet"][href]')].map((s) => s.getAttribute('href') || '')
  ];
  const required = [
    'styles.css',
    'data.js',
    'score_calibration_samples.js',
    'ocr.js',
    'obsidian.js',
    'scoring.js',
    'generation.js',
    'app.js'
  ];
  const pickV = (name) => {
    const hit = resources.find((src) => src.includes(name));
    if (!hit) return null;
    const m = hit.match(/[?&]v=(\d+)/);
    return m ? Number(m[1]) : null;
  };
  const versions = required.map((name) => ({ name, version: pickV(name) }));
  const missing = versions.filter((item) => item.version == null);
  const ok = missing.length === 0;
  return {
    ok,
    message: ok
      ? `资源版本号齐全：${versions.map((item) => `${item.name} v${item.version}`).join(' / ')}`
      : `以下资源缺少 ?v=数字：${missing.map((item) => item.name).join('、')}`
  };
}

function runFeatureFlowChecks() {
  const checks = [];
  try {
    const seed = '第一段原文。\n\n第二段原文。\n\n第三段原文。';
    const patched = insertTemplateSentenceAtParagraph(seed, '测试模板句', 2);
    const ps = splitParagraphs(patched);
    const ok = ps[1] && ps[1].startsWith('测试模板句');
    checks.push({
      name: '模板句分段插入',
      ok: !!ok,
      detail: ok ? '插入第2段生效' : '未按段位插入'
    });
  } catch (err) {
    checks.push({ name: '模板句分段插入', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '有人担忧，有人觉得正常，你有怎样的思考？';
    const draft = '这是一段草稿。\n\n第二段内容。\n\n第三段收束。';
    const report = runOffTopicCheck(topic, draft);
    const fixed = applyTriadGapFix(topic, draft, report);
    const ok = typeof fixed.highlightStart === 'number' && typeof fixed.highlightEnd === 'number';
    checks.push({
      name: '补缺自动高亮',
      ok: !!ok,
      detail: ok ? '已返回新增句高亮范围' : '未返回高亮范围'
    });
  } catch (err) {
    checks.push({ name: '补缺自动高亮', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？';
    const analysis = analyzeEssayTopic(topic);
    const a = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'tech' });
    const b = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'culture' });
    const ok = a !== b && /科技创新|模型|技术|算法/.test(a) && /文化传播|戏曲|导赏/.test(b);
    checks.push({
      name: '案例素材池分流',
      ok: !!ok,
      detail: ok ? '不同素材池生成差异已生效' : '素材池差异不明显'
    });
  } catch (err) {
    checks.push({ name: '案例素材池分流', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const data = buildWeeklyTrainingDashboard();
    const ok = Array.isArray(data.dayRows) && data.dayRows.length === 7 && typeof data.recommendation?.prompt === 'string';
    checks.push({
      name: '周训练看板生成',
      ok,
      detail: ok ? '近7天走势与推荐动作可生成' : '周看板数据结构异常'
    });
  } catch (err) {
    checks.push({ name: '周训练看板生成', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const card = createMaterialCardFromArticle('【王老师教作文67】佳作评析', '作文题：一个人乐意去探索陌生世界，仅仅是因为好奇心吗？中心立意：探索并非只来自好奇心，而来自责任、问题意识与价值追求。首先界定好奇心，其次分析责任感，最后回到现实。比如科学家面对疾病难题持续研究，这说明探索需要公共责任。真正的探索不是浅层尝鲜，而是把未知转化为新的理解。');
    const ok = !!card.topic && !!card.thesis && card.structure.length >= 3 && card.goldenSentences.length >= 1;
    checks.push({
      name: '素材卡提取',
      ok,
      detail: ok ? '可从标题和正文提取题目、论点、结构、金句' : '素材卡字段提取不足'
    });
  } catch (err) {
    checks.push({ name: '素材卡提取', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const card = pickExampleTrainingCardForTopic('有人认为共情有助于道德的落实，也有人认为共情会妨碍道德的实施。对此你怎么看？', { name: '关系辩证题' });
    const ok = !!card && /共情与道德/.test(card.title);
    checks.push({
      name: '上海范例训练库',
      ok,
      detail: ok ? '可命中并调用内置范例训练卡' : '未能命中对应范例卡'
    });
  } catch (err) {
    checks.push({ name: '上海范例训练库', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const input = document.getElementById('handwritingImageInput');
    const fillBtn = document.getElementById('handwritingOcrFillBtn');
    const preview = document.getElementById('handwritingPreviewList');
    const status = document.getElementById('handwritingOcrStatus');
    const ok = !!input && !!fillBtn && !!preview && !!status;
    checks.push({
      name: '手写OCR上传区',
      ok,
      detail: ok ? '图片上传、正文识别、状态提示与预览区已接入' : '手写OCR上传区元素不完整'
    });
  } catch (err) {
    checks.push({ name: '手写OCR上传区', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  return checks;
}

async function runRegressionSuite() {
  const cases = [];
  let calibration = null;

  try {
    calibration = await runShanghaiScoreCalibrationSuite();
    cases.push({
      name: '上海评分校准集',
      ok: calibration.passed >= calibration.total - 1 && calibration.meanAbsError <= 5,
      detail: calibration.summary
    });
  } catch (err) {
    cases.push({ name: '上海评分校准集', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const analysis = analyzeEssayTopic('一个人乐意去探索陌生世界，仅仅是因为好奇心吗？');
    const ok = !!analysis && Array.isArray(analysis.outline) && analysis.outline.length >= 3 && Array.isArray(analysis.topicPhrases);
    cases.push({ name: '分析题目主链', ok, detail: ok ? '可稳定产出审题结构' : '分析结果结构不完整' });
  } catch (err) {
    cases.push({ name: '分析题目主链', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const analysis = analyzeEssayTopic('生活中，人们常用认可度判别事物，区分高下。请写一篇文章，谈谈你对“认可度”的认识和思考。');
    const panel = renderTeacherEightTrainingPanel(analysis);
    const ok = /题目审题雷达/.test(panel)
      && /中心论点体检/.test(panel)
      && /论证机制补全器/.test(panel)
      && /一类卷句式库/.test(panel);
    cases.push({ name: '上海阅卷八项训练面板', ok, detail: ok ? '八项训练已接入分析与批改链路' : '八项训练面板缺失关键模块' });
  } catch (err) {
    cases.push({ name: '上海阅卷八项训练面板', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？';
    const focused = '好奇心固然是探索的起点，但真正持久的探索还来自责任感与价值目标。因为面对现实问题，人们需要通过实践不断修正判断。因此，探索不是浅层尝鲜，而是问题意识驱动的深入行动。当然，这一判断也并非绝对成立，不同情境下动因会发生变化。';
    const drifting = '人生需要努力。我们要积极向上，保持热爱，追求梦想。很多事情都值得尝试，这说明成长很重要。';
    const good = runOffTopicCheck(topic, focused).riskScore;
    const bad = runOffTopicCheck(topic, drifting).riskScore;
    cases.push({ name: '扣题风险分层', ok: good > bad, detail: `聚焦稿 ${good} / 漂移稿 ${bad}` });
  } catch (err) {
    cases.push({ name: '扣题风险分层', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '有人担忧，有人觉得正常，你有怎样的思考？';
    const poor = '我认为这个问题很重要。我们应该重视它。生活中有很多类似现象，所以值得思考。';
    const teacherReport = await buildShanghaiTeacherReviewReport(topic, poor);
    cases.push({
      name: '老师评分报告可生成',
      ok: teacherReport.total70 >= 0 && (teacherReport.suggestions || []).length === 3,
      detail: `总分 ${teacherReport.total70}/70，建议 ${(teacherReport.suggestions || []).length} 条`
    });
  } catch (err) {
    cases.push({ name: '老师评分报告可生成', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '由“专”到“传”，必定要经过“转”吗？';
    const draft = [
      '为了精华的浓缩。',
      '',
      '专业表达要成为传世之作，当然需要面对公共世界，但这并不等于必定经过流量式转发。所谓专，是知识共同体内部的精密表达；所谓转，是面向大众的转译和传播；所谓传，则是经由时间、实践和读者反复筛选后留下的价值。',
      '',
      '许多专业文章确实需要转译。高质量的转并不是稀释，而是把证据、概念和因果关系重新组织，使知识能被更多人理解。因此，转的价值在于打开专业知识的公共入口，而不是简单追求点击率。',
      '',
      '然而，转并不天然通向传。短视频平台上有些内容传播极广，却因为迎合情绪而牺牲复杂性；相反，有些思想著作起初只在小范围中流通，却凭借问题意识和解释力长期留下来。',
      '',
      '进一步看，当代社会最需要建设的不是更热闹的转，而是更负责任的转译。它至少包含三个边界：不偷换核心概念，不截断证据链条，不把复杂问题包装成简单立场。只有满足这些条件，转才可能成为公共理性的桥梁，使专不再封闭，也使传不沦为空名。',
      '',
      '现实中的许多争论也说明了这一点。有些科学知识经过耐心解释，能帮助公众形成更清醒的判断；有些内容虽然被大量转发，却因为标题化、情绪化而损害原意。前者让专业知识获得公共生命，后者则让知识沦为噪音。因此，判断转是否有价值，不能看它传播得多快，而要看它是否保留了问题的复杂性和判断的责任感。',
      '',
      '由此再回望“传”，它并不是传播链条的最后一个热度数字，而是作品在不同时代仍能被重新理解、重新使用的能力。专业深度提供了这种能力的根，公共转译提供了可能扩散的枝叶，但真正决定它能否留下来的，是它是否回应了人的长久困惑，是否能在新的现实中继续产生解释力。',
      '',
      '因此，专、转、传之间不是线性流水线，而是一组相互校正的关系。没有专，转容易空心化；没有恰当的转，专可能停留在圈层内部；没有传的尺度，转又容易被流量牵引。高分论证要处理的正是这种张力，而不是把其中任何一环绝对化。',
      '',
      '对今天的写作者而言，这一题也提醒我们：表达不能只追求专业壁垒，也不能只迎合传播效率。真正成熟的表达，应当既有知识的精确度，又有面向公共生活的耐心，还要经得起时间的再次追问。这样的转，才可能服务于传；这样的专，也才不会成为自我封闭的姿态。',
      '',
      '所以，由专到传并不必定经过转，但在今天的传播环境中，高质量的转往往是重要的中介机制。真正值得追求的，是在专业深度与公共可达之间建立张力平衡。'
    ].join('\n');
    const report = await buildShanghaiTeacherReviewReport(topic, draft);
    const ok = report.total70 >= 52
      && (report.offTopic.reviewInfo?.removedHeadings || []).length >= 1
      && report.offTopic.semanticBridgeScore >= 70;
    cases.push({ name: '标题误判校准', ok, detail: ok ? `标题已忽略，校准后 ${report.total70}/70` : `校准不足：${report.total70}/70，标题忽略${(report.offTopic.reviewInfo?.removedHeadings || []).length}项` });
  } catch (err) {
    cases.push({ name: '标题误判校准', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '这段话可以启发人们如何去认识事物。请写一篇文章，谈谈你的思考和感悟。';
    const body = [
      '旧并不是停滞的同义词，新也不是凭空冒出的口号。真正有生命力的更新，往往是在对旧有经验的理解、辨析和转化中完成的。若只把旧看成负担，便会失去文化与经验的根；若只把新看成装饰，又会让改变停在表面。所谓以旧维新，正在于在继承中辨认可再生的力量，在更新中保留生命延续的脉络。',
      '',
      '从个人成长看，一个人并不是靠否定过去来获得新生。旧经验中有惯性，也有积累；有束缚，也有方法。学习中的错题、阅读中的旧见、生活中的习惯，若只被一概抛弃，就难以形成真正的反思。它们只有经过重新解释，才会成为新的判断力。由此可见，维新不是断裂，而是对旧有材料的再组织。',
      '',
      '从社会文化看，许多更新也不是抛开传统另起炉灶。传统戏曲进入新的舞台空间，古典诗词借由新的媒介被重新理解，城市街区在保护旧貌的同时更新公共功能，这些现象说明，旧并非只能被保存，也可以被激活。关键在于更新是否尊重原有肌理，是否让旧的价值在新的现实中继续发挥解释力。',
      '',
      '这种关系在今天尤其值得讨论。技术更新很快，观念变化也快，人们容易把速度误认为进步，把新鲜误认为创造。可是没有旧经验的校正，新常常只是短暂的热闹；没有新问题的召唤，旧也可能变成僵硬的陈列。真正的生长，恰恰发生在二者彼此照亮的时候。',
      '',
      '由此可见，旧与新的关系并不是时间先后的关系，而是价值生成的关系。旧提供沉淀、尺度和记忆，新提供问题、方法和可能。一个社会若只有旧，便缺少面向未来的勇气；若只有新，又容易失去判断的根基。二者相互校正，才构成持续更新的生命形态。',
      '',
      '当然，强调以旧维新，并不意味着守旧。若把旧物、旧制、旧观念都神圣化，更新就会变成保守的外衣。真正成熟的态度，是区分旧中可承续者与应被淘汰者：前者需要被转译，后者必须被扬弃。只有这样，新才不是轻浮的替换，旧也不是沉重的包袱。',
      '',
      '对青年而言，这种判断同样重要。学习传统，不是为了背负过去，而是为了获得更宽的坐标；拥抱新知，也不是为了抛弃来处，而是为了让旧有经验在新的现实中继续发生作用。当一个人能够在旧中发现可更新的资源，在新中守住不被流行裹挟的尺度，他才真正拥有面向未来的主体性。',
      '',
      '回到题目，生生不息的生命力，正在于旧与新之间并非简单对立。旧为新提供根系，新使旧获得再生。面对快速变化的时代，我们需要的不是盲目逐新，也不是固守旧壳，而是在辨析、转化与创造中完成延续。以旧维新，方能生生不息。'
    ].join('\n');
    const draft = `以旧维新 生生不息（一类上 68分）\n\n曹杨二中 高三 石英娜\n\n${body}`;
    const report = await buildShanghaiTeacherReviewReport(topic, draft);
    const ok = report.total70 === TRAINING_SCORE_MAX_70
      && report.officialScore?.sourceGrade?.score === 68
      && report.officialScore?.sourceComparison
      && report.offTopic?.expertSignals?.selfAxisScore >= 70
      && (report.offTopic.reviewInfo?.removedHeadings || []).length >= 2;
    cases.push({ name: 'OB高分文独立复核', ok, detail: ok ? `识别原评${report.officialScore.sourceGrade.score}分，训练口径封顶 ${report.total70}/70，自拟中心轴${report.offTopic.expertSignals.selfAxisScore}` : `复核不足：${report.total70}/70，原评 ${report.officialScore?.sourceGrade?.score || '未识别'}` });
  } catch (err) {
    cases.push({ name: 'OB高分文独立复核', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '由“专”到“传”，必定要经过“转”吗？';
    const analysis = analyzeEssayTopic(topic);
    const tech = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'tech' });
    const culture = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'culture' });
    const ok = tech !== culture && /模型|技术|科技创新/.test(tech) && /戏曲|导赏|文化传播/.test(culture);
    cases.push({ name: '素材池分流', ok, detail: ok ? '科技/文化素材已区分' : '不同素材池输出差异不足' });
  } catch (err) {
    cases.push({ name: '素材池分流', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'auto' });
    const anchorTitle = analysis.exampleGuidedKit?.anchorCard?.title || '';
    const ok = !/坚持自我|多元世界|理想人生/.test(anchorTitle)
      && !/坚持自我|外界意见|理想人生/.test(essay)
      && /好奇心|探索|陌生世界/.test(essay)
      && countWords(essay) >= 800
      && countWords(essay) <= 850;
    cases.push({ name: '范例路由防串题', ok, detail: ok ? `未误套范例，字数 ${countWords(essay)}` : `疑似串题：命中“${anchorTitle || '无'}”` });
  } catch (err) {
    cases.push({ name: '范例路由防串题', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '对已有知识的综合，是创新吗？';
    const analysis = analyzeEssayTopic(topic);
    const ok = /综合已有知识|拼接不是创新/.test(analysis.exampleGuidedKit?.anchorCard?.title || '')
      && /综合过程|综合未必/.test(analysis.thesis || '');
    cases.push({ name: '范例驱动题目解读', ok, detail: ok ? '分析已命中创新母题并提升中心立意' : '分析未正确吃到范例母题' });
  } catch (err) {
    cases.push({ name: '范例驱动题目解读', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '在观点越来越多元的世界里，是否只有坚持自我，才能获得理想的人生？';
    const analysis = analyzeEssayTopic(topic);
    const ok = Array.isArray(analysis.methodGuidedKit?.analysisActions)
      && analysis.methodGuidedKit.analysisActions.length >= 2
      && /隐含关系|现实锚点|旧题资源/.test((analysis.methodGuidedKit.analysisActions || []).join(''));
    cases.push({ name: '22-23方法论接入分析', ok, detail: ok ? '分析结果已补入方法论动作' : '方法论提醒未正常接入分析链路' });
  } catch (err) {
    cases.push({ name: '22-23方法论接入分析', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '请写一篇文章，谈谈你对“简即为美”这个观点的认识与思考。';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'examplelib' });
    const ok = /简即为美|简约/.test(essay) && /丰盈|繁/.test(essay);
    cases.push({ name: '上海范例库接入生成', ok, detail: ok ? '范例库素材可参与生成' : '生成结果未体现范例库特征' });
  } catch (err) {
    cases.push({ name: '上海范例库接入生成', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '对已有知识的综合，是创新吗？';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'examplelib' });
    const paraCount = splitParagraphs(essay).length;
    const metaCount = countMatches(essay, /高质量作文|写作不能|文章必须|只凭第一反应迅速站队|面对“.*?”，若只|从备考角度看/g);
    const ok = /机械拼接|生成式|解释力|结构/.test(essay)
      && countWords(essay) >= 800
      && countWords(essay) <= 850
      && paraCount >= 5
      && metaCount === 0;
    cases.push({ name: '范例驱动完整范文', ok, detail: ok ? `已写出创新题专属骨架，${paraCount}段，字数 ${countWords(essay)}` : `创新题生成仍偏模板化，${paraCount}段，字数 ${countWords(essay)}` });
  } catch (err) {
    cases.push({ name: '范例驱动完整范文', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '有人说，在前行的路上，地图的作用优于指南针。对此你是否认同？';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'examplelib' });
    const ok = /地图.*指南针/.test(essay)
      && /路径|经验/.test(essay)
      && /方向|价值|原则/.test(essay)
      && /更快地偏离|走错方向|方向意识/.test(essay)
      && countWords(essay) >= 800
      && countWords(essay) <= 850;
    cases.push({ name: '地图题专属范文', ok, detail: ok ? `已生成关系隐喻题正式成文，字数 ${countWords(essay)}` : `地图题仍偏泛模板，字数 ${countWords(essay)}` });
  } catch (err) {
    cases.push({ name: '地图题专属范文', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '生活中，人们往往用常识去看待事物，做出判断。对此，你怎么看？';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'examplelib' });
    const ok = /常识/.test(essay)
      && /起点|经验沉淀/.test(essay)
      && /事实|实践|校正|反思/.test(essay)
      && /不是反常识，也不是迷信常识|既不是反常识，也不是迷信常识/.test(essay)
      && countWords(essay) >= 800
      && countWords(essay) <= 850;
    cases.push({ name: '常识题专属范文', ok, detail: ok ? `已生成方法判断题正式成文，字数 ${countWords(essay)}` : `常识题仍偏泛模板，字数 ${countWords(essay)}` });
  } catch (err) {
    cases.push({ name: '常识题专属范文', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '生活中，人们往往用常识去看待事物，做出判断。对此，你怎么看？';
    const analysis = analyzeEssayTopic(topic);
    const tiers = generateTieredEssaySet(topic, analysis, { casePool: 'examplelib' });
    const wordOk = tiers.every((x) => x.wordCount >= 800 && x.wordCount <= 850);
    const countOk = tiers.length === 3;
    const orderOk = tiers[0].score.total >= tiers[1].score.total && tiers[1].score.total >= tiers[2].score.total;
    cases.push({ name: '同题三档范文', ok: countOk && wordOk && orderOk, detail: countOk ? `三档已生成，估分序列 ${tiers.map((x) => x.score.score70).join(' / ')}` : '三档生成数量异常' });
  } catch (err) {
    cases.push({ name: '同题三档范文', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '请为2010年上海世博会确立主题并加以论证。';
    const analysis = analyzeEssayTopic(topic);
    const essay = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'auto' });
    const repeated = countMatches(essay, /从备考角度看|这就要求写作者|请为并非绝对成立/g);
    const ok = /城市，让世界共享更好的生活/.test(essay)
      && /未来社区|绿色交通|水岸上海|少年城市/.test(essay)
      && countWords(essay) >= 800
      && countWords(essay) <= 850
      && repeated === 0;
    cases.push({ name: '世博主题题专属范文', ok, detail: ok ? `字数 ${countWords(essay)}，结构完整` : `字数 ${countWords(essay)}，仍有模板化风险` });
  } catch (err) {
    cases.push({ name: '世博主题题专属范文', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const topic = '生活中，人们往往用常识去看待事物，做出判断。对此，你怎么看？';
    const draft = '我觉得常识很重要。大家一般都会这样想，所以常识应该一直被遵守。\n\n比如很多人都觉得经验很重要，所以常识一定是对的。\n\n总之我们要相信常识。';
    const report = buildMasterCritiqueReport(topic, draft);
    const ok = !!report.summary
      && Array.isArray(report.paragraphRows)
      && report.paragraphRows.length >= 3
      && /习作/.test(report.summary) === false;
    cases.push({ name: '习作精批报告', ok, detail: ok ? `可生成总评与${report.paragraphRows.length}段逐段批注` : '精批报告结构不完整' });
  } catch (err) {
    cases.push({ name: '习作精批报告', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  try {
    const migrated = normalizeTrainingStatsPayload({ count: 2, dims: { '审题立意': { sum: 28, max: 20, times: 2 } } });
    const ok = !!migrated && migrated.count === 2 && Array.isArray(migrated.sessions) && migrated.sessions.length === 0;
    cases.push({ name: '训练统计旧数据兼容', ok, detail: ok ? '旧版统计可平滑迁移到新结构' : '旧版统计结构未兼容' });
  } catch (err) {
    cases.push({ name: '训练统计旧数据兼容', ok: false, detail: `异常：${err?.message || '未知错误'}` });
  }

  const passed = cases.filter((x) => x.ok).length;
  return {
    cases,
    passed,
    total: cases.length,
    level: passed === cases.length ? '通过' : (passed >= cases.length - 1 ? '基本通过' : '未通过'),
    calibration
  };
}

function renderRegressionReport(report, container) {
  const rows = (report.cases || []).map((item) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(item.name)}</span><strong>${item.ok ? '通过' : '失败'}</strong></div>
      <p class="agent-para-issues">${escapeHtml(item.detail)}</p>
    </div>
  `).join('');
  const calibration = report.calibration;
  const calibrationRows = (calibration?.cases || []).map((item) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(item.name)}</span><strong>${item.ok ? '命中' : '需调'}</strong></div>
      <p>系统：${escapeHtml(String(item.predicted))}/70｜标定：${escapeHtml(String(item.expected))}/70｜误差：${item.error > 0 ? '+' : ''}${escapeHtml(String(item.error))}</p>
      <p class="agent-para-issues">${escapeHtml(item.detail)}</p>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>回归测试报告</h3>
      <div class="agent-tags">
        <span class="agent-tag">结果：${escapeHtml(report.level)}</span>
        <span class="agent-tag">通过：${report.passed}/${report.total}</span>
        ${calibration ? `<span class="agent-tag">评分校准：${escapeHtml(calibration.level)}</span>` : ''}
      </div>
    </div>
    <div class="agent-result-block"><h4>回归样例</h4><div class="score-grid">${rows}</div></div>
    ${calibration ? `<div class="agent-result-block"><h4>评分校准锚点验收</h4><p>${escapeHtml(calibration.summary)}</p><p>样本库：${escapeHtml(String(calibration.sampleBankSize || 0))}篇｜真实老师样本：${escapeHtml(String(calibration.realSampleCount || 0))}篇｜同题多档组：${escapeHtml(String(calibration.sameTopicGroupCount || 0))}组</p><div class="score-grid">${calibrationRows}</div><p class="agent-para-issues">这组硬回归样本是评分引擎的“秤砣”；完整样本库提供一类上/中/下、二类上/中/下、三类、四类的同题多档参照。</p></div>` : ''}
  `;
}

function buildBaselineFixSuggestion(name) {
  if (name === '页面核心元素') return '检查 index.html 是否误删按钮或输入框，并确认 id 与脚本一致。';
  if (name === '关键函数可用') return '检查 app.js 是否加载失败或存在语法错误。';
  if (name === '一键范文按钮绑定') return '刷新到带版本号地址，并确认按钮 data-bound-generate=1。';
  if (name === '本地存储读写') return '关闭无痕模式后重试，或检查浏览器隐私策略。';
  if (name === '脚本版本一致性') return '统一 data.js / app.js 的 ?v 参数。';
  if (name === '回归测试样例') return '优先检查 runOffTopicCheck、generateFullEssayDraft、buildShanghaiTeacherReviewReport 三条主链。';
  if (name === '素材卡提取') return '检查素材卡导入器相关函数和 localStorage 是否正常，并确认正文中有题目、立意或例证句。';
  if (name === '上海范例训练库') return '检查 data.js 中的 SHANGHAI_EXAMPLE_LIBRARY 是否正常加载，并确认 exampleTrainingList 容器未丢失。';
  return '根据失败项逐条排查。';
}
