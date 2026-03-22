const PHILOSOPHY_CARDS = [
  { category: 'dialectics', categoryLabel: '辩证法', icon: '⚖️', title: '对立统一', subtitle: 'Unity of Opposites', description: '事物内部或事物之间存在着普遍对立统一关系。矛盾双方在一定条件下相互转化，推动事物发展。', years: ['2011Y', '2014Y', '2015Y'], frequency: 5, backTitle: '落地写法', backPoints: ['先界定两端概念，再给出“并非二选一”判断。', '用“条件变化-关系转化”推进论证。', '结尾回到现实情境，给出可执行立场。'] },
  { category: 'dialectics', categoryLabel: '辩证法', icon: '🎲', title: '必然与偶然', subtitle: 'Necessity and Contingency', description: '必然性是事物发展的稳定趋势，偶然性是发展中的具体触发。偶然中含必然，必然通过偶然显现。', years: ['2017Y', '2020Y'], frequency: 4, backTitle: '落地写法', backPoints: ['把“意外”拆为触发因素，把“趋势”拆为长期结构。', '承认不确定性，但强调人的应对与组织能力。', '避免“全能论”与“宿命论”两个极端。'] },
  { category: 'dialectics', categoryLabel: '辩证法', icon: '📈', title: '量变与质变', subtitle: 'Quantitative to Qualitative Change', description: '事物发展常经历积累到跃迁的过程。量的持续变化达到阈值后，会引发结构性的性质变化。', years: ['2010Y', '2025Y'], frequency: 3, backTitle: '落地写法', backPoints: ['提出“阈值”概念，说明何时从改良走向创新。', '举一个长期积累后突变的案例。', '结尾指出质变后如何反过来塑造新量变。'] },
  { category: 'epistemology', categoryLabel: '认识论', icon: '🔎', title: '现象与本质', subtitle: 'Appearance and Essence', description: '现象是外在可见层，本质是深层机制。高分议论文要从“看到什么”进一步写到“为什么如此”。', years: ['2016Y', '2019Y', '2023Y'], frequency: 4, backTitle: '落地写法', backPoints: ['每段至少有一句“机制解释句”。', '不要只停留在价值表态，要补因果链。', '可用“表层现象-深层驱动-现实后果”三步。'] },
  { category: 'axiology', categoryLabel: '价值论', icon: '💎', title: '价值排序', subtitle: 'Value Hierarchy', description: '面对冲突性目标时，需要建立价值排序标准，说明“为何此优先级更合理”，而非只做空泛赞同。', years: ['2013Y', '2018Y', '2024Y'], frequency: 4, backTitle: '落地写法', backPoints: ['先给排序维度：长期性、公平性、可持续性。', '比较两种排序方案及其代价。', '结论给出“在何条件下可调整排序”。'] },
  { category: 'ethics', categoryLabel: '伦理学', icon: '🤝', title: '个人与社会', subtitle: 'Individual and Society', description: '个人自由与公共责任并非天然冲突。优质文章要写出二者如何在制度与行动中实现协调。', years: ['2008Y', '2016Y', '2021Y'], frequency: 3, backTitle: '落地写法', backPoints: ['先写个人处境，再接社会规则和公共后果。', '避免单向道德绑架，强调双向责任。', '结尾提出可操作的协同路径。'] },
  { category: 'thinking', categoryLabel: '思维模型', icon: '🧩', title: '因果链', subtitle: 'Causal Chain', description: '观点需要放在因果链里展开：前提条件、触发机制、结果与反馈，避免“观点-例子-观点”松散拼接。', years: ['2022Y', '2023Y', '2025Y'], frequency: 5, backTitle: '落地写法', backPoints: ['每段都要有“因为-所以-因此”结构。', '补充反向因果或副作用，增强深度。', '用一条主链串起三段，避免段落割裂。'] },
  { category: 'thinking', categoryLabel: '思维模型', icon: '🧱', title: '条件化判断', subtitle: 'Conditional Reasoning', description: '高分文章通常避免绝对化表达，通过条件限定建立判断边界，让观点更稳健、更经得住反驳。', years: ['2014Y', '2020Y', '2024Y'], frequency: 4, backTitle: '落地写法', backPoints: ['使用“在……条件下”表达边界。', '给出一条例外情形，防止论证过满。', '结尾回到“总体成立+局部修正”的平衡。'] },
  { category: 'other', categoryLabel: '其他', icon: '🌍', title: '传承与创新', subtitle: 'Inheritance and Innovation', description: '创新常建基于既有资源。关键在于“是否发生新解释、新结构、新问题解决”，而非简单拼接旧知识。', years: ['2009Y', '2012Y', '2025Y'], frequency: 3, backTitle: '落地写法', backPoints: ['定义“综合”是拼接还是生成。', '用“旧要素-新结构-新效用”三点证明创新。', '对AI整合作反思，提升时代感。'] }
];

const TIMELINE_DATA = [
  { year: '2025', topic: '“专”“转”“传”三类文章：由“专”到“传”，必定要经过“转”吗？', philosophy: '传播与价值判断', prompt: '由“专”到“传”，必定要经过“转”吗？请联系社会生活，写一篇文章，谈谈你的认识与思考。' },
  { year: '2024', topic: '生活中常用“认可度”判别事物、区分高下', philosophy: '价值论', prompt: '请写一篇文章，谈谈你对“认可度”的认识和思考。' },
  { year: '2023', topic: '探索陌生世界，仅仅因为好奇心吗？', philosophy: '动机与认知', prompt: '一个人乐意去探索陌生世界，仅仅是因为好奇心吗？' },
  { year: '2022', topic: '小时候喜欢发问，长大后看重结论', philosophy: '认识论', prompt: '对此有人担忧，有人觉得正常，你有怎样的思考？' },
  { year: '2021', topic: '时间沉淀后价值才能被认识吗？', philosophy: '价值与时间', prompt: '有人说价值需时间沉淀，也有人认为不尽如此。你怎么看？' },
  { year: '2020', topic: '意想不到的转折是否意味着人无能为力？', philosophy: '必然与偶然', prompt: '世上许多重要转折在意想不到时发生，这是否意味着人无能为力？' },
  { year: '2019', topic: '“中国味”与认识事物的方法', philosophy: '认识论', prompt: '由异域音乐体验引发对“中国味”的感受，这段话可启发如何认识事物。' },
  { year: '2018', topic: '“被需要”心态与价值体现', philosophy: '价值论', prompt: '“被需要”的心态普遍存在，你有怎样的认识？' },
  { year: '2017', topic: '预测与生活变数', philosophy: '认识论', prompt: '有人乐于接受预测，有人不以为然。请谈思考。' },
  { year: '2016', topic: '评价他人生活现象的影响', philosophy: '伦理学', prompt: '请谈谈你对“评价他人生活”这一现象的思考。' },
  { year: '2015', topic: '坚硬与柔软：和谐自我', philosophy: '人格与辩证', prompt: '人的心中有坚硬也有柔软，如何对待关系到能否造就和谐自我。' },
  { year: '2014', topic: '自由与不自由：穿越沙漠', philosophy: '自由与必然', prompt: '你可选择道路与方式，所以自由；你必须穿越，所以不自由。' },
  { year: '2013', topic: '重要与更重要', philosophy: '价值排序', prompt: '人努力做重要之事，但总有更重要的事。请谈思考。' },
  { year: '2012', topic: '心灵微光与天才作品', philosophy: '自我认知', prompt: '人常舍弃自己的微光，却在天才作品中认出它。' },
  { year: '2011', topic: '“一切都会过去”与“一切都不会过去”', philosophy: '辩证法', prompt: '两句铭文寓有深意，引发怎样思考？' },
  { year: '2010', topic: '小鱼放回河里：可持续之道', philosophy: '长期主义', prompt: '让小鱼长大不更好吗？其中道理也贯穿现实生活。' },
  { year: '2009', topic: '“板桥体”：不可无一，不可有二', philosophy: '个性与共性', prompt: '联系材料谈“板桥体”启示。' },
  { year: '2008', topic: '他们', philosophy: '他者视角', prompt: '把视线从“我们”转向“他们”，你会看到什么想到什么？' },
  { year: '2007', topic: '必须跨过这道坎', philosophy: '成长与突破', prompt: '以“必须跨过这道坎”为题。' },
  { year: '2006', topic: '我想握住你的手', philosophy: '关系伦理', prompt: '以“我想握住你的手”为题。' },
  { year: '2005', topic: '当代文化生活审视与成长影响', philosophy: '文化批判', prompt: '审视与辨析当代文化生活，并谈其对成长的影响。' },
  { year: '2004', topic: '忙', philosophy: '生活价值', prompt: '以“忙”为话题。' },
  { year: '2003', topic: '杂', philosophy: '复杂性思维', prompt: '“杂”有褒有贬，请联系生活、科学、文化、艺术。' },
  { year: '2002', topic: '面对大海', philosophy: '生命体验', prompt: '以“面对大海”为题。' },
  { year: '2001', topic: '文化遗产（物质与非物质）', philosophy: '文化传承', prompt: '谈你对身边文化遗产的了解、认识和思考。' },
  { year: '2000', topic: '为2010上海世博会拟定主题并论证', philosophy: '公共表达', prompt: '请为2010年上海世博会确立主题并加以论证。' }
];

const EVOLUTION_OVERVIEW = {
  headline: '上海高考作文命题演变：从命题史走向思维进阶史',
  core: '2000-2025 的核心趋势，是从社会热点讨论逐步升级到认识论、辩证法、实践观与存在意识的综合考查。',
  models: [
    {
      title: '二元对立与高阶统一',
      summary: '在对立概念中建立条件化统一，反对非黑即白。',
      years: ['2011', '2014', '2015']
    },
    {
      title: '现象与本质剥离',
      summary: '从社会表象进入机制解释，强调批判性判断。',
      years: ['2021', '2024']
    },
    {
      title: '三元递进与动态转化',
      summary: '由二元博弈升级为系统生态，关注传播链闭环。',
      years: ['2025']
    }
  ],
  philosophy: [
    '实践观：价值并非被时间自动沉淀，而在实践中被检验与生成。',
    '存在意识：承认局限但不陷于无力，在不确定中确立主体性。',
    '反异化批判：警惕流量与技术对判断力的稀释，回到人的真实经验。'
  ],
  stages: [
    {
      id: 'stage-1',
      period: '2000-2008',
      startYear: 2000,
      endYear: 2008,
      title: '现实关怀期',
      detail: '命题更具体，重公共参与与社会观察，如世博会、文化遗产、他们。'
    },
    {
      id: 'stage-2',
      period: '2009-2018',
      startYear: 2009,
      endYear: 2018,
      title: '哲理探讨期',
      detail: '命题抽象度提升，重人生辩证智慧与生命境界。'
    },
    {
      id: 'stage-3',
      period: '2019-2025',
      startYear: 2019,
      endYear: 2025,
      title: '思维品质选拔期',
      detail: '命题进入高阶认知与传播议题，强调结构化思辨能力。'
    }
  ]
};

