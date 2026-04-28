const REAL_SCORE_CALIBRATION_REGISTRY = {
  version: 1,
  source: 'score_calibration_samples.js',
  updatedAt: '2026-04-28',
  targetCount: 30,
  description: '真实老师评分校准样本库。只收已经有老师原评或可信分数来源的作文，用于校准草稿评分、习作精批和同题多档参照。',
  requiredFields: [
    'id',
    'status',
    'topic',
    'essay',
    'teacherScore',
    'teacherBand',
    'teacherComment',
    'scoreReasons',
    'deductions',
    'source'
  ],
  scoringBands: [
    { key: 'class1_upper', label: '一类上', range: '67-70', target: 4 },
    { key: 'class1_middle', label: '一类中', range: '64-66', target: 4 },
    { key: 'class1_entry', label: '一类下/入口', range: '63', target: 4 },
    { key: 'class2_upper', label: '二类上', range: '59-62', target: 4 },
    { key: 'class2_middle', label: '二类中', range: '55-58', target: 4 },
    { key: 'class2_lower', label: '二类下', range: '52-54', target: 4 },
    { key: 'class3', label: '三类', range: '39-51', target: 4 },
    { key: 'class4', label: '四类', range: '21-38', target: 2 }
  ],
  sampleTemplates: [
    {
      id: 'template-class1-upper',
      status: 'template',
      label: '一类上真实样本模板',
      topic: '粘贴原题',
      topicType: '问题式命题 / 关系辩证题 / 价值判断题 / 现象思辨题',
      essay: '粘贴作文全文',
      teacherScore: 68,
      teacherBand: '一类上',
      teacherComment: '粘贴老师原评，尽量保留“为什么给这个分数”。',
      scoreReasons: [
        '准确抓住材料核心与设问重心',
        '中心论点有立场、有条件、有关系、有边界',
        '主体段有机制解释、边界反思和现实关联'
      ],
      deductions: [
        '如果有扣分点，逐条写清；没有则写“暂无明显扣分点”'
      ],
      source: '老师原评 / OB高分范文 / 模考讲评资料',
      notes: '把 status 改成 verified 后，系统才会把它纳入评分校准。'
    },
    {
      id: 'template-class2-middle',
      status: 'template',
      label: '二类中真实样本模板',
      topic: '粘贴原题',
      topicType: '问题式命题 / 关系辩证题 / 价值判断题 / 现象思辨题',
      essay: '粘贴作文全文',
      teacherScore: 56,
      teacherBand: '二类中',
      teacherComment: '说明它为什么过关但没有进入一类。',
      scoreReasons: [
        '符合题意，中心基本明确',
        '结构完整，但论证机制或边界处理不够连续'
      ],
      deductions: [
        '例证后分析不足',
        '中心句偏泛或段首推进不强'
      ],
      source: '老师原评 / 模考样卷',
      notes: '同一道题至少配一篇一类、一篇二类、一篇三类，校准效果最好。'
    },
    {
      id: 'template-class3',
      status: 'template',
      label: '三类真实样本模板',
      topic: '粘贴原题',
      topicType: '问题式命题 / 关系辩证题 / 价值判断题 / 现象思辨题',
      essay: '粘贴作文全文',
      teacherScore: 45,
      teacherBand: '三类',
      teacherComment: '说明它基本符合题意但为什么中心、内容或结构不足。',
      scoreReasons: [
        '能碰到题目，但题眼关系展开较浅',
        '观点有，但论证停在常识层'
      ],
      deductions: [
        '缺少稳定中心判断',
        '材料堆叠或现实关联不足'
      ],
      source: '老师原评 / 模考样卷',
      notes: '三类样本能帮助系统避免把“看起来像作文”的文本误判过高。'
    }
  ],
  samples: []
};

if (typeof window !== 'undefined') {
  window.REAL_SCORE_CALIBRATION_REGISTRY = REAL_SCORE_CALIBRATION_REGISTRY;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = REAL_SCORE_CALIBRATION_REGISTRY;
}
