const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VAULT = path.join(ROOT, 'obsidian_vault');
const META_DIR = path.join(VAULT, '_meta');
const JSON_OUT = path.join(META_DIR, 'obsidian-entry-index.json');
const PROFILE_OUT = path.join(META_DIR, 'obsidian-support-profile.json');
const PROFILE_MD_OUT = path.join(META_DIR, 'obsidian-support-profile.md');
const JS_OUT = path.join(ROOT, 'obsidian_index.js');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
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

function compact(text, limit = 220) {
  const s = normalizeText(text).replace(/\s+/g, ' ').trim();
  return s.length > limit ? `${s.slice(0, limit)}...` : s;
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function countMatches(text, regex) {
  return (String(text || '').match(regex) || []).length;
}

function inferDocRole(relativePath, text) {
  const p = relativePath.replace(/\\/g, '/');
  if (/评分标准/.test(p)) return '评分标准库';
  if (/议论文写作/.test(p)) return '议论文方法库';
  if (/历年高考回顾|20\d{2}上海.*题/.test(p)) return '历年真题与命题回顾';
  if (/高考作文/.test(p) && /下水|师生同写|高考/.test(p)) return '高考同题高分范文';
  if (/春考作文/.test(p)) return '春考题解析与范文';
  if (/年-\d{2}学年/.test(p) || /一模|二模|联考|期末/.test(text)) return '区模考佳作点评';
  if (/拔尖教师|问答|评述|题解读|题评析/.test(p)) return '命题观察与教师评析';
  return '作文资料档案';
}

function inferTrainingUses(role, text) {
  const uses = [];
  if (/评分标准/.test(role)) uses.push('草稿评分', '习作精批', '评分校准');
  if (/方法/.test(role)) uses.push('分析题目', '习作精批', '修改任务单', '专项训练');
  if (/高分范文|佳作|下水|师生同写/.test(role)) uses.push('范文生成', '草稿评分', '习作精批', 'Obsidian范文推荐');
  if (/真题|命题|评析|回顾|春考/.test(role)) uses.push('分析题目', '防跑题检查', '范文生成');
  if (/一模|二模|联考/.test(text)) uses.push('模考训练', '同题对照');
  return unique(uses.length ? uses : ['资料归档']);
}

function inferTopicType(text) {
  const t = String(text || '');
  const scores = [
    {
      name: '关系辩证题',
      score:
        countMatches(t, /有人说[\s\S]{0,80}(也有人|有人则|也有)/g) * 3 +
        countMatches(t, /(既.*又|一方面.*另一方面|一边.*另一边|不是.*而是|并非.*而是|与|和|之间|对立|统一|相互|平衡|比.*更|优于|劣于|专.*转.*传|自由.*不自由|坚硬.*柔软)/g)
    },
    {
      name: '价值判断题',
      score: countMatches(t, /(价值|意义|认可度|有用|无用|高下|重要|标准|判断|值得|传世|真实所求|底色|目的|手段)/g)
    },
    {
      name: '问题式命题',
      score:
        countMatches(t, /(是否|吗？|吗\?|怎样|如何|为什么|何以|必定|仅仅|意味着|你怎么看|有怎样|何以|何为)/g) +
        countMatches(t, /请写一篇文章，谈谈你(?:对这个问题)?的认识和思考/g)
    },
    {
      name: '现象思辨题',
      score: countMatches(t, /(现象|生活中|当下|社会|时代|人们常|越来越|普遍|公共|群体)/g)
    },
    {
      name: '方法路径题',
      score: countMatches(t, /(怎么做|如何做|路径|方法|训练|写法|修改|论证|审题|立意|结构|语言|段落)/g)
    }
  ].sort((a, b) => b.score - a.score);
  if (scores[0]?.score > 0) return scores[0].name;
  if (/话题|以.*为题/.test(t)) return '话题作文';
  return '材料作文';
}

function inferThemeTag(text) {
  const t = String(text || '');
  const rules = [
    ['技术与传播', /(专.*转.*传|专业文章|转发|传播|媒介|短视频|互联网|AI|人工智能|流量|平台|公共传播|知识生产)/g],
    ['认知与判断', /(认可度|判断|常识|真理|真实|知识|综合|创新|发问|结论|好奇心|陌生世界|预测|理解|质疑|相信)/g],
    ['价值与意义', /(价值|意义|有用|无用|重要|获得感|认可|高下|传世|沉淀|底色|真实所求)/g],
    ['自我与成长', /(自我|成长|内心|断舍离|被需要|主体|选择|青年|存在价值|人生)/g],
    ['关系与责任', /(责任|规则|自由|不自由|共识|对话|底线|道德|他们|我们|坚持|变通)/g],
    ['生活现象与时代', /(生活|社会|时代|现实|评价|忙|流行|公共|群体|个人|校园|朋友圈|社交)/g],
    ['语言与表达', /(语言|论证|说理|概念|结构|段落|修改|议论文|写作|作文|范文)/g]
  ];
  const ranked = rules
    .map(([tag, re]) => ({ tag, score: countMatches(t, re) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].tag : '综合思辨';
}

function inferScoreBand(text) {
  const t = String(text || '');
  const score = t.match(/([1-6]\d|70)\s*分/);
  const level = t.match(/一类上|一类中|一类下|一类|二类上|二类中|二类|三类|四类|五类|上等|佳作|优秀|下水作文/);
  if (score || level) {
    return {
      label: level ? level[0] : '',
      score: score ? Number(score[1]) : null,
      isHighScore: /(一类|上等|佳作|优秀|下水作文)|6[3-9]\s*分|70\s*分/.test(t)
    };
  }
  return { label: '', score: null, isHighScore: /教师点评|佳作点评|下水作文|师生同写/.test(t) };
}

function extractTitle(file, text) {
  const body = stripFrontMatter(text);
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const markerTitle = body.match(/【(?:作文题|高考作文题|春考作文题|作文题目)】\s*\n?(.{8,120})/);
  if (markerTitle) return markerTitle[1].replace(/\s+/g, ' ').trim();
  return path.basename(file, '.md');
}

function extractPromptSamples(text, limit = 3) {
  const body = normalizeText(stripFrontMatter(text));
  const samples = [];
  const marker = /(【(?:作文题|作文题目|高考作文题|春考作文题|作文原题)】|(?:20\d{2}.*?作文题))([\s\S]{0,420})/g;
  let m;
  while ((m = marker.exec(body)) && samples.length < limit) {
    const sample = compact(m[2] || m[0], 260);
    if (sample.length >= 12) samples.push(sample);
  }
  const quoted = [...body.matchAll(/[“"]([^”"]{2,24})[”"]/g)].map((x) => x[1]).slice(0, 6);
  return unique([...samples, ...quoted]).slice(0, limit);
}

function extractAnchorTerms(text) {
  const dictionary = [
    '认可度', '断舍离', '真实所求', '专', '转', '传', '好奇心', '陌生世界', '时间', '价值',
    '发问', '结论', '创新', '综合', '自由', '不自由', '被需要', '中国味', '常识', '底线',
    '共识', '理解', '对话', '传播', '流量', '公共', '责任', '规则', '有用', '无用',
    '自我', '成长', '判断', '实践', '论证', '概念', '结构', '语言', '说理'
  ];
  const hits = dictionary.filter((kw) => String(text || '').includes(kw));
  const quoted = [...String(text || '').matchAll(/[“"]([^”"]{2,12})[”"]/g)].map((x) => x[1]);
  return unique([...hits, ...quoted]).slice(0, 16);
}

function getYearLabel(relativePath, text) {
  const p = relativePath.replace(/\\/g, '/');
  const y = p.match(/20\d{2}(?:年)?(?:-\d{2}学年)?/);
  if (y) return y[0].replace('年', '');
  const t = String(text || '').match(/20\d{2}/);
  return t ? t[0] : '未标注';
}

function buildEntry(file, index) {
  const raw = fs.readFileSync(file, 'utf8');
  const text = normalizeText(raw);
  const relativePath = path.relative(VAULT, file);
  const role = inferDocRole(relativePath, text);
  const title = extractTitle(file, text);
  const promptSamples = extractPromptSamples(text);
  const scoreBand = inferScoreBand(text);
  const anchorTerms = extractAnchorTerms(`${title}\n${text}`);
  const topicType = inferTopicType(`${title}\n${promptSamples.join('\n')}\n${text.slice(0, 1600)}`);
  const themeTag = inferThemeTag(`${title}\n${promptSamples.join('\n')}\n${text.slice(0, 2200)}`);
  const trainingUses = inferTrainingUses(role, text);
  const markerCounts = {
    prompt: countMatches(text, /【(?:作文题|作文题目|高考作文题|春考作文题|作文原题)】/g),
    teacherComment: countMatches(text, /(?:教师点评|老师点评|总评|互评|点评)/g),
    sampleEssay: countMatches(text, /(?:下水作文|考场佳作|学生佳作|高三版|师生同写|一类上|佳作)/g),
    method: countMatches(text, /(?:概念|论证|结构|语言|修改|审题|立意|思辨|训练|任务)/g)
  };
  return {
    id: `ob-${String(index + 1).padStart(3, '0')}`,
    title,
    notePath: relativePath.replace(/\\/g, '/'),
    wikiPath: relativePath.replace(/\\/g, '/').replace(/\.md$/, ''),
    relativePath: relativePath.replace(/\\/g, '/'),
    sourceFile: path.basename(file),
    folder: path.dirname(relativePath).replace(/\\/g, '/'),
    yearLabel: getYearLabel(relativePath, text),
    docRole: role,
    trainingUses,
    topicType,
    themeTag,
    topicKey: promptSamples[0] || title,
    promptSamples,
    anchorTerms,
    scoreBand,
    markerCounts,
    wordCount: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
    preview: compact(text, 260),
    supportWeight: {
      scoring: trainingUses.some((x) => /评分|精批|校准/.test(x)) ? 3 : 1,
      generation: trainingUses.some((x) => /范文|推荐/.test(x)) ? 3 : 1,
      topicAnalysis: trainingUses.some((x) => /分析|防跑题|真题/.test(x)) ? 3 : 1,
      method: trainingUses.some((x) => /方法|修改|专项/.test(x)) ? 3 : 1
    }
  };
}

function buildProfile(entries) {
  const by = (key) => entries.reduce((acc, item) => {
    const value = item[key] || '未分类';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const useCounts = entries.reduce((acc, item) => {
    for (const use of item.trainingUses || []) acc[use] = (acc[use] || 0) + 1;
    return acc;
  }, {});
  const highScoreCount = entries.filter((x) => x.scoreBand?.isHighScore).length;
  return {
    generatedAt: new Date().toISOString(),
    total: entries.length,
    highScoreCount,
    byRole: by('docRole'),
    byTopicType: by('topicType'),
    byTheme: by('themeTag'),
    byYear: by('yearLabel'),
    trainingUseCounts: useCounts,
    systemSupport: [
      '草稿评分：用评分标准库 + 高分范文标杆修正过严/过松',
      '习作精批：按题型/母题召回同类范文，给可见修改建议',
      '防跑题检查：用题目解析与命题观察补充题眼/边界判断',
      '范文生成：按同题高分文和议论文方法库补足段落节奏',
      '专项训练：从议论文写作目录抽取概念、论证、语言、修改训练'
    ]
  };
}

function renderCountList(title, counts, limit = 20) {
  const rows = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => `- ${name}: ${count}`)
    .join('\n');
  return `## ${title}\n${rows || '- 暂无'}\n`;
}

function buildProfileMarkdown(profile) {
  return [
    '# Obsidian 范文库系统支持画像',
    '',
    `生成时间：${profile.generatedAt}`,
    '',
    '## 总览',
    `- 档案总数：${profile.total}`,
    `- 高分/可作标杆档案：${profile.highScoreCount}`,
    `- 高分占比：${profile.total ? Math.round(profile.highScoreCount / profile.total * 100) : 0}%`,
    '',
    renderCountList('按档案角色', profile.byRole),
    renderCountList('按题型', profile.byTopicType),
    renderCountList('按母题', profile.byTheme),
    renderCountList('按年份/学年', profile.byYear),
    renderCountList('系统功能支撑', profile.trainingUseCounts),
    '## 系统接入说明',
    ...profile.systemSupport.map((line) => `- ${line}`),
    '',
    '## 使用原则',
    '- OB 范文库只作为标杆校准和可见对照，不直接替孩子改作文。',
    '- 评分模块用它降低误判：高分范文命中同题/同母题时，不再因为少数形式信号缺失而过度压分。',
    '- 精批模块用它给“看哪篇、看什么、改哪一项”的建议。',
    '- 范文生成模块用它学习段落节奏、题眼回扣和边界收束，而不是照搬原句。',
    ''
  ].join('\n');
}

function main() {
  if (!fs.existsSync(META_DIR)) fs.mkdirSync(META_DIR, { recursive: true });
  const files = walk(VAULT)
    .filter((file) => !file.includes(`${path.sep}.obsidian${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}_meta${path.sep}`))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const entries = files.map(buildEntry);
  const profile = buildProfile(entries);
  fs.writeFileSync(JSON_OUT, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  fs.writeFileSync(PROFILE_OUT, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  fs.writeFileSync(PROFILE_MD_OUT, buildProfileMarkdown(profile), 'utf8');
  fs.writeFileSync(
    JS_OUT,
    `// Auto-generated by scripts/build-obsidian-support-index.js. Do not edit by hand.\nwindow.OBSIDIAN_ENTRY_INDEX = ${JSON.stringify(entries, null, 2)};\nwindow.OBSIDIAN_SUPPORT_PROFILE = ${JSON.stringify(profile, null, 2)};\n`,
    'utf8'
  );
  console.log(JSON.stringify({
    entries: entries.length,
    highScoreCount: profile.highScoreCount,
    roles: profile.byRole,
    output: [
      path.relative(ROOT, JSON_OUT),
      path.relative(ROOT, PROFILE_OUT),
      path.relative(ROOT, PROFILE_MD_OUT),
      path.relative(ROOT, JS_OUT)
    ]
  }, null, 2));
}

main();
