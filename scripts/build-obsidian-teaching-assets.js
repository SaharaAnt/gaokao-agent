const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VAULT = path.join(ROOT, 'obsidian_vault');
const META_DIR = path.join(VAULT, '_meta');
const INDEX_FILE = path.join(META_DIR, 'obsidian-entry-index.json');
const JSON_OUT = path.join(META_DIR, 'obsidian-teaching-assets.json');
const JS_OUT = path.join(ROOT, 'obsidian_teaching_assets.js');

const MOVE_TYPES = [
  {
    key: 'definition',
    label: '概念界定句',
    pattern: /(所谓|指的是|并不是|不是.{0,18}而是|并非.{0,18}而是|内涵|本质|可理解为)/
  },
  {
    key: 'transition',
    label: '转折推进句',
    pattern: /(诚然|然而|但是|不过|另一方面|同时|反过来|进一步看|进一步而言|换言之)/
  },
  {
    key: 'mechanism',
    label: '机制解释句',
    pattern: /(因为|所以|因此|由此可见|这说明|意味着|关键在于|其机制在于|原因在于|本质上|从而)/
  },
  {
    key: 'boundary',
    label: '边界收束句',
    pattern: /(前提|条件|边界|如果|若|当.{0,12}时|并不意味着|未必|不能简单|并非绝对|限度)/
  },
  {
    key: 'reality',
    label: '现实关联句',
    pattern: /(现实|社会|时代|校园|平台|技术|AI|人工智能|青年|公共生活|信息|媒介|消费|教育|城市)/
  }
];

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripFrontMatter(text) {
  return String(text || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
}

function cleanInline(text) {
  return normalizeText(text).replace(/\s+/g, ' ').replace(/\|/g, '｜').trim();
}

function compact(text, limit = 90) {
  const clean = cleanInline(text);
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function splitParagraphs(text) {
  return normalizeText(text)
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter((item) => item.replace(/\s+/g, '').length >= 18);
}

function splitSentences(text) {
  return cleanInline(text)
    .split(/(?<=[。！？!?；;])\s*/g)
    .map((item) => item.trim())
    .filter((item) => item.replace(/\s+/g, '').length >= 8);
}

function inferParagraphRole(index, total) {
  if (index === 0) return '开篇定向';
  if (index === total - 1) return '结尾收束';
  if (index === total - 2) return '边界转折';
  if (index === 1) return '主体展开';
  return '递进论证';
}

function detectMoves(text) {
  return MOVE_TYPES
    .filter((type) => type.pattern.test(text))
    .map((type) => type.key);
}

function moveLabels(keys) {
  return keys.map((key) => MOVE_TYPES.find((type) => type.key === key)?.label || key);
}

function learnPointFor(role, moves) {
  const labels = moveLabels(moves);
  if (role === '开篇定向') return labels.includes('概念界定句') ? '学习它如何先界定概念，再立中心判断。' : '学习它如何快速入题，避免空泛抒情。';
  if (role === '结尾收束') return labels.includes('边界收束句') ? '学习它如何把结论写成有条件、有边界的判断。' : '学习它如何回扣题眼，完成收束。';
  if (labels.includes('机制解释句')) return '学习它如何把例子推进成“原因-机制-结果”的分析。';
  if (labels.includes('转折推进句')) return '学习它如何承认一面，再推出另一面，形成思辨张力。';
  if (labels.includes('现实关联句')) return '学习它如何把抽象概念落到真实社会或校园场景。';
  return '学习这一段承担的结构功能，不照搬具体句子。';
}

function extractPrompt(entry, body) {
  const text = cleanInline(body);
  const marker = text.match(/(?:作文题|作文题目|高考作文题|春考作文题|作文原题)[：:】\s]*(.{20,220}?)(?:要求|请写|$)/);
  if (marker) return compact(marker[1], 160);
  const sample = (entry.promptSamples || []).find((item) => /请写|谈谈|作文|认识|思考|是否|吗/.test(item));
  if (sample) return compact(sample, 160);
  return compact(entry.topicKey || entry.title || '', 160);
}

function extractThesis(entry, paragraphs) {
  const anchorTerms = entry.anchorTerms || [];
  const thesisPattern = /(我认为|在我看来|关键在于|真正|并非|不是.{0,18}而是|不在于.{0,18}而在于|因此|由此可见|可见|应当|需要|取决于|意味着|本质上)/;
  let best = '';
  let bestScore = -1;
  paragraphs.slice(0, 6).forEach((paragraph, paragraphIndex) => {
    splitSentences(paragraph).forEach((sentence) => {
      const len = sentence.replace(/\s+/g, '').length;
      if (len < 16 || len > 120) return;
      const termHits = anchorTerms.filter((term) => term && sentence.includes(term)).length;
      const score = termHits * 10 + (thesisPattern.test(sentence) ? 18 : 0) + (paragraphIndex <= 1 ? 8 : 0) + (/(前提|条件|边界|关系|机制|价值|标准)/.test(sentence) ? 8 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = sentence;
      }
    });
  });
  return compact(best || splitSentences(paragraphs[0] || '')[0] || entry.title || '', 120);
}

function buildParagraphDissection(paragraphs) {
  const usable = paragraphs.slice(0, 9);
  return usable.map((paragraph, index) => {
    const role = inferParagraphRole(index, usable.length);
    const sentences = splitSentences(paragraph);
    const lead = compact(sentences[0] || paragraph, 90);
    const moveKeys = unique(detectMoves(paragraph));
    const evidence = compact(sentences.find((sentence) => detectMoves(sentence).length) || sentences[0] || paragraph, 100);
    return {
      index: index + 1,
      role,
      lead,
      moveKeys,
      moveLabels: moveLabels(moveKeys),
      evidence,
      learnPoint: learnPointFor(role, moveKeys)
    };
  });
}

function collectMoves(entry, paragraphs) {
  if (!entry.scoreBand?.isHighScore && !/高分|佳作|下水|一类|优秀|上等/.test(String(`${entry.docRole || ''}${entry.sourceFile || ''}`))) {
    return [];
  }
  const out = [];
  paragraphs.slice(0, 10).forEach((paragraph, pIndex) => {
    splitSentences(paragraph).forEach((sentence) => {
      const len = sentence.replace(/\s+/g, '').length;
      if (len < 16 || len > 110) return;
      MOVE_TYPES.forEach((type) => {
        if (!type.pattern.test(sentence)) return;
        out.push({
          type: type.key,
          label: type.label,
          sentence: compact(sentence, 86),
          sourceTitle: compact(entry.title || entry.topicKey || '', 46),
          wikiPath: entry.wikiPath || '',
          paragraphIndex: pIndex + 1,
          topicType: entry.topicType || '',
          themeTag: entry.themeTag || '',
          why: learnPointFor(inferParagraphRole(pIndex, paragraphs.length), [type.key])
        });
      });
    });
  });
  return out;
}

function buildEssay(entry) {
  const file = path.join(VAULT, entry.relativePath || entry.notePath || '');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const body = normalizeText(stripFrontMatter(raw));
  const paragraphs = splitParagraphs(body);
  if (!paragraphs.length) return null;
  const paragraphDissection = buildParagraphDissection(paragraphs);
  return {
    id: entry.id,
    title: entry.title || entry.topicKey || entry.sourceFile,
    notePath: entry.notePath,
    wikiPath: entry.wikiPath,
    relativePath: entry.relativePath,
    sourceFile: entry.sourceFile,
    folder: entry.folder,
    yearLabel: entry.yearLabel,
    docRole: entry.docRole,
    trainingUses: entry.trainingUses || [],
    topicType: entry.topicType,
    themeTag: entry.themeTag,
    topicKey: entry.topicKey,
    promptSamples: entry.promptSamples || [],
    anchorTerms: entry.anchorTerms || [],
    scoreBand: entry.scoreBand || {},
    wordCount: entry.wordCount,
    prompt: extractPrompt(entry, body),
    thesis: extractThesis(entry, paragraphs),
    paragraphDissection,
    highScoreMoves: unique(paragraphDissection.flatMap((row) => row.moveLabels)).slice(0, 6),
    learnPoints: unique(paragraphDissection.map((row) => row.learnPoint)).slice(0, 6),
    preview: compact(body, 180)
  };
}

function capMoves(moves) {
  const seen = new Set();
  const grouped = {};
  MOVE_TYPES.forEach((type) => {
    grouped[type.key] = [];
  });
  for (const item of moves) {
    const key = `${item.type}|${item.sentence}|${item.sourceTitle}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!grouped[item.type]) grouped[item.type] = [];
    if (grouped[item.type].length < 80) grouped[item.type].push(item);
  }
  return grouped;
}

function main() {
  const index = readJson(INDEX_FILE, []);
  if (!Array.isArray(index) || !index.length) throw new Error('请先生成 obsidian-entry-index.json');
  const essays = [];
  const moves = [];
  for (const entry of index) {
    const essay = buildEssay(entry);
    if (!essay) continue;
    essays.push(essay);
    const file = path.join(VAULT, entry.relativePath || entry.notePath || '');
    const body = normalizeText(stripFrontMatter(fs.readFileSync(file, 'utf8')));
    moves.push(...collectMoves(entry, splitParagraphs(body)));
  }
  const assets = {
    generatedAt: new Date().toISOString(),
    moveTypes: MOVE_TYPES.map(({ key, label }) => ({ key, label })),
    total: essays.length,
    highScoreCount: essays.filter((item) => item.scoreBand?.isHighScore).length,
    essays,
    moves: capMoves(moves)
  };
  fs.writeFileSync(JSON_OUT, `${JSON.stringify(assets, null, 2)}\n`, 'utf8');
  fs.writeFileSync(JS_OUT, `// Auto-generated by scripts/build-obsidian-teaching-assets.js. Do not edit by hand.\nwindow.OBSIDIAN_TEACHING_ASSETS = ${JSON.stringify(assets, null, 2)};\n`, 'utf8');
  console.log(`Obsidian teaching assets generated: ${essays.length} essays`);
}

main();
