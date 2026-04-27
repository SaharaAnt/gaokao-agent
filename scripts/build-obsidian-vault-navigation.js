const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VAULT = path.join(ROOT, 'obsidian_vault');
const META_DIR = path.join(VAULT, '_meta');
const INDEX_FILE = path.join(META_DIR, 'obsidian-entry-index.json');
const PROFILE_FILE = path.join(META_DIR, 'obsidian-support-profile.json');

const OUT_FILES = {
  home: path.join(VAULT, '00-范文库总入口.md'),
  year: path.join(META_DIR, '01-按年份找范文.md'),
  type: path.join(META_DIR, '02-按题型找范文.md'),
  theme: path.join(META_DIR, '03-按母题找范文.md'),
  score: path.join(META_DIR, '04-按分数档找范文.md'),
  use: path.join(META_DIR, '05-按用途找范文.md'),
  cluster: path.join(META_DIR, '06-同题聚合索引.md'),
  keyword: path.join(META_DIR, '07-高频关键词索引.md')
};

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, text) {
  fs.writeFileSync(file, `${text.trim()}\n`, 'utf8');
}

function cleanCell(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '｜')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortText(value, limit = 34) {
  const text = cleanCell(value);
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function wikiLink(entry, label = '') {
  const target = entry.wikiPath || entry.relativePath?.replace(/\.md$/, '') || entry.title || '未命名';
  const text = label || entry.title || entry.topicKey || target;
  return `[[${cleanCell(target)}|${cleanCell(shortText(text, 38))}]]`;
}

function scoreLabel(entry) {
  const band = entry.scoreBand || {};
  if (band.score) return `${band.label || ''}${band.score}分`;
  if (band.label) return band.label;
  return band.isHighScore ? '高分标杆' : '未标';
}

function sortEntries(items) {
  return [...items].sort((a, b) => {
    const y = String(b.yearLabel || '').localeCompare(String(a.yearLabel || ''), 'zh-Hans-CN');
    if (y) return y;
    const ah = a.scoreBand?.isHighScore ? 1 : 0;
    const bh = b.scoreBand?.isHighScore ? 1 : 0;
    if (ah !== bh) return bh - ah;
    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN');
  });
}

function groupBy(items, getter) {
  const map = new Map();
  for (const item of items) {
    const key = getter(item) || '未分类';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return [...map.entries()].sort((a, b) => {
    const diff = b[1].length - a[1].length;
    return diff || String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN');
  });
}

function entryLine(entry) {
  const uses = (entry.trainingUses || []).slice(0, 3).join('、') || '资料归档';
  return `- ${wikiLink(entry)} ｜ ${cleanCell(entry.docRole || '未标角色')} ｜ ${cleanCell(entry.topicType || '未标题型')} ｜ ${cleanCell(entry.themeTag || '未标母题')} ｜ ${cleanCell(scoreLabel(entry))} ｜ 用途：${cleanCell(uses)}`;
}

function entryTable(items, limit = Infinity) {
  const rows = sortEntries(items).slice(0, limit).map((entry) => {
    const uses = (entry.trainingUses || []).slice(0, 2).join('、') || '资料归档';
    return `| ${wikiLink(entry)} | ${cleanCell(entry.yearLabel || '未标')} | ${cleanCell(entry.docRole || '未标')} | ${cleanCell(entry.topicType || '未标')} | ${cleanCell(entry.themeTag || '未标')} | ${cleanCell(scoreLabel(entry))} | ${cleanCell(uses)} |`;
  }).join('\n');
  return `| 范文/资料 | 年份 | 类型 | 题型 | 母题 | 分档 | 适合用来 |\n|---|---:|---|---|---|---|---|\n${rows || '| 暂无 |  |  |  |  |  |  |'}`;
}

function countHighScore(items) {
  return items.filter((entry) => entry.scoreBand?.isHighScore).length;
}

function topTags(items, key, limit = 3) {
  return groupBy(items, (entry) => entry[key] || '未标')
    .slice(0, limit)
    .map(([name, rows]) => `${name}${rows.length}`)
    .join('、');
}

function makeHome(index, profile) {
  const highScore = countHighScore(index);
  const recentHigh = sortEntries(index.filter((entry) => entry.scoreBand?.isHighScore)).slice(0, 12);
  return `# 范文库总入口

> 目标：打开这一页，就能按“年份、题型、母题、分数档、用途、同题”快速找到要看的范文。

## 一眼总览

- 总档案：${index.length} 篇
- 高分/佳作/下水标杆：${highScore} 篇
- 主要题型：${topTags(index, 'topicType', 5)}
- 主要母题：${topTags(index, 'themeTag', 5)}
- 主要用途：${profile?.trainingUseCounts ? Object.entries(profile.trainingUseCounts).slice(0, 6).map(([k, v]) => `${k}${v}`).join('、') : '未生成画像'}

## 你想找什么？

- 按年份找：[[_meta/01-按年份找范文|01-按年份找范文]]
- 按题型找：[[_meta/02-按题型找范文|02-按题型找范文]]
- 按母题找：[[_meta/03-按母题找范文|03-按母题找范文]]
- 按分数档找：[[_meta/04-按分数档找范文|04-按分数档找范文]]
- 按用途找：[[_meta/05-按用途找范文|05-按用途找范文]]
- 找同题/近题：[[_meta/06-同题聚合索引|06-同题聚合索引]]
- 按关键词找：[[_meta/07-高频关键词索引|07-高频关键词索引]]

## 最常用入口

- 想学一类卷节奏：先看 [[_meta/04-按分数档找范文#高分标杆]]
- 写关系辩证题：先看 [[_meta/02-按题型找范文#关系辩证题]]
- 写问题式命题：先看 [[_meta/02-按题型找范文#问题式命题]]
- 写价值判断题：先看 [[_meta/02-按题型找范文#价值判断题]]
- 想批改自己的作文：先看 [[_meta/05-按用途找范文#习作精批]]
- 想生成范文骨架：先看 [[_meta/05-按用途找范文#范文生成]]

## 近期高分标杆速览

${entryTable(recentHigh, 12)}
`;
}

function makeGroupedPage(title, intro, groups, options = {}) {
  const mode = options.mode || 'list';
  const sections = groups.map(([name, items]) => {
    const sorted = sortEntries(items);
    const summary = `共 ${items.length} 篇｜高分标杆 ${countHighScore(items)} 篇｜${topTags(items, 'themeTag', 3)}`;
    const body = mode === 'table'
      ? entryTable(sorted)
      : sorted.map(entryLine).join('\n');
    return `## ${cleanCell(name)}

${summary}

${body}`;
  }).join('\n\n');
  return `# ${title}

${intro}

${sections || '暂无资料。'}
`;
}

function makeYearPage(index) {
  const groups = groupBy(index, (entry) => entry.yearLabel || '未标注');
  return makeGroupedPage('按年份找范文', '适合按考试年份、学年、春考/秋考快速定位范文。', groups);
}

function makeTypePage(index) {
  const order = ['问题式命题', '关系辩证题', '价值判断题', '现象思辨题', '方法路径题', '材料作文', '话题作文', '未分类'];
  const groups = groupBy(index, (entry) => entry.topicType || '未分类')
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return makeGroupedPage('按题型找范文', '适合拿到新题后，先找到同题型文章，观察审题和结构。', groups);
}

function makeThemePage(index) {
  const groups = groupBy(index, (entry) => entry.themeTag || '综合思辨');
  return makeGroupedPage('按母题找范文', '适合围绕一个长期母题积累素材与论证模型。', groups);
}

function scoreBucket(entry) {
  const score = Number(entry.scoreBand?.score || 0);
  const label = String(entry.scoreBand?.label || '');
  if (score >= 63 || /一类上|一类中|一类|上等/.test(label)) return '一类卷与上等文';
  if (score >= 52 || /二类|中上/.test(label)) return '二类卷与中上文';
  if (score >= 39 || /三类|中等/.test(label)) return '三类卷与可修改样本';
  if (entry.scoreBand?.isHighScore || /佳作|优秀|下水/.test(label)) return '高分标杆';
  return '未标分但可参考';
}

function makeScorePage(index) {
  const order = ['一类卷与上等文', '高分标杆', '二类卷与中上文', '三类卷与可修改样本', '未标分但可参考'];
  const groups = groupBy(index, scoreBucket).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return makeGroupedPage('按分数档找范文', '适合看“同一类文章为什么能上档”，也适合做升档对照。', groups, { mode: 'table' });
}

function makeUsePage(index) {
  const uses = new Map();
  for (const entry of index) {
    for (const use of entry.trainingUses || ['资料归档']) {
      if (!uses.has(use)) uses.set(use, []);
      uses.get(use).push(entry);
    }
  }
  const order = ['分析题目', '防跑题检查', '范文生成', '草稿评分', '习作精批', '修改任务单', '专项训练', 'Obsidian范文推荐', '模考训练', '同题对照', '评分校准', '资料归档'];
  const groups = [...uses.entries()].sort((a, b) => {
    const ai = order.includes(a[0]) ? order.indexOf(a[0]) : 999;
    const bi = order.includes(b[0]) ? order.indexOf(b[0]) : 999;
    return ai - bi || b[1].length - a[1].length;
  });
  return makeGroupedPage('按用途找范文', '适合按训练动作找资料：审题、防跑题、生成范文、批改、专项训练。', groups);
}

const CLUSTER_RULES = [
  ['认可度', /认可度|大众认可|区分高下/],
  ['专转传', /由.?专.?到.?传|专转传|专业文章|通俗文章|传世文章/],
  ['好奇心与陌生世界', /好奇心|陌生世界|探索陌生/],
  ['发问与结论', /小时候.{0,16}发问|长大后.{0,16}结论|发问.{0,12}结论|结论.{0,12}发问/],
  ['时间与价值', /经过时间.{0,8}沉淀|时间的沉淀|事物的价值.{0,20}认识|价值.{0,8}才能被.{0,8}认识|不尽如此/],
  ['断舍离与真实所求', /断舍离|真实所求/],
  ['综合与创新', /已有知识|综合.{0,12}创新|创新.{0,12}综合/],
  ['自由与不自由', /自由.{0,12}不自由|不自由.{0,12}自由|穿越.{0,8}沙漠|沙漠/],
  ['被需要与自我价值', /被需要|自身.*需要|体现.*价值/],
  ['中国味与认识事物', /中国味|异域音调|音乐/],
  ['旧与新/以旧维新', /以旧维新|旧.{0,8}新|新.{0,8}旧|生生不息/],
  ['真相与真理', /真相|真理/],
  ['共情与道德', /共情|道德/],
  ['有用与无用', /有用.{0,12}无用|无用.{0,12}有用|无用之用/],
  ['坚持与效果', /坚持一件事|这样做.{0,8}正确|效果.{0,8}正确|坚信.{0,8}正确/],
  ['分析问题与解决问题', /分析问题|解决问题/],
  ['评价他人与认可标准', /评价他人|评价.{0,8}生活|认可标准|常用认可度/]
];

function makeClusterPage(index) {
  const groups = [];
  for (const [name, regex] of CLUSTER_RULES) {
    const items = index.filter((entry) => regex.test(`${entry.title || ''}\n${entry.topicKey || ''}\n${(entry.anchorTerms || []).join(' ')}`));
    if (items.length) groups.push([name, items]);
  }
  return makeGroupedPage('同题与近题聚合索引', '适合写某一道题前，先找同题、近题、同母题的范文和点评。', groups, { mode: 'table' });
}

function makeKeywordPage(index) {
  const stop = new Set(['作文', '文章', '思考', '认识', '有人说', '对此', '材料', '问题', '生活', '观点', '一个人', '人们']);
  const map = new Map();
  for (const entry of index) {
    for (const term of entry.anchorTerms || []) {
      const key = cleanCell(term);
      if (key.length < 2 || key.length > 10 || stop.has(key)) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
  }
  const groups = [...map.entries()]
    .filter(([, items]) => items.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .slice(0, 80);
  const sections = groups.map(([term, items]) => {
    const links = sortEntries(items).slice(0, 10).map((entry) => wikiLink(entry)).join('、');
    return `| ${cleanCell(term)} | ${items.length} | ${links} |`;
  }).join('\n');
  return `# 高频关键词索引

适合不知道题目该归到哪一类时，直接按关键词找范文。

| 关键词 | 篇数 | 代表资料 |
|---|---:|---|
${sections || '| 暂无 | 0 |  |'}
`;
}

function main() {
  ensureDir(META_DIR);
  const index = readJson(INDEX_FILE, []);
  const profile = readJson(PROFILE_FILE, null);
  if (!Array.isArray(index) || !index.length) {
    throw new Error('未找到 obsidian-entry-index.json，请先运行 build-obsidian-support-index.js');
  }
  write(OUT_FILES.home, makeHome(index, profile));
  write(OUT_FILES.year, makeYearPage(index));
  write(OUT_FILES.type, makeTypePage(index));
  write(OUT_FILES.theme, makeThemePage(index));
  write(OUT_FILES.score, makeScorePage(index));
  write(OUT_FILES.use, makeUsePage(index));
  write(OUT_FILES.cluster, makeClusterPage(index));
  write(OUT_FILES.keyword, makeKeywordPage(index));
  console.log(`Obsidian navigation generated: ${Object.keys(OUT_FILES).length} files`);
}

main();
