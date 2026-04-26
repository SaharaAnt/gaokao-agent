const EXAM_MODE_DURATION_SEC = 25 * 60;
const EXAM_MODE_MAX_WORDS = 800;
const ESSAY_FAVORITES_STORAGE_KEY = 'gaokao_essay_favorites_v1';
const TRAINING_STATS_STORAGE_KEY = 'gaokao_training_stats_v1';
const PATH_TRAINING_STORAGE_KEY = 'gaokao_path_training_v1';
const ERROR_BOOK_STORAGE_KEY = 'gaokao_error_book_v1';
const MATERIAL_CARD_STORAGE_KEY = 'gaokao_material_cards_v1';
const TRAINING_SESSION_LIMIT = 120;
const HANDWRITING_OCR_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/tesseract.min.js';
const HANDWRITING_OCR_WORKER = 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js';
const HANDWRITING_OCR_CORE = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0';
const HANDWRITING_OCR_LANG = 'https://tessdata.projectnaptha.com/4.0.0';
const HANDWRITING_MAX_FILES = 5;
const HANDWRITING_ANALYSIS_MAX_WIDTH = 420;
const HANDWRITING_OCR_MAX_WIDTH = 1600;
const HANDWRITING_OCR_MIN_USEFUL_CHARS = 36;
const HANDWRITING_SCAN_STATE = {
  pages: [],
  cacheKey: '',
  ocrResult: null,
  metricsResult: null,
  status: 'idle',
  error: ''
};

let handwritingOcrScriptPromise = null;

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
  safeInit(initAgentWorkbench);
  safeInit(initEvolutionOverview);
  safeInit(initTimeline);
  safeInit(initScrollEffects);
});

function safeInit(fn) { try { fn(); } catch (_) {} }

function updateHandwritingUi(status, message) {
  const badge = document.getElementById('handwritingStatusBadge');
  const statusEl = document.getElementById('handwritingOcrStatus');
  const tone = status || 'ready';
  if (badge) {
    badge.className = `handwriting-status-badge ${tone}`;
    badge.textContent = tone === 'loading'
      ? '识别中'
      : tone === 'done'
        ? '已识别'
        : tone === 'error'
          ? '识别失败'
          : HANDWRITING_SCAN_STATE.pages.length
            ? '已上传'
            : '未上传';
  }
  if (statusEl) {
    statusEl.className = `handwriting-ocr-status ${tone}`;
    statusEl.textContent = message || (HANDWRITING_SCAN_STATE.pages.length ? `已上传手写图片，点击“草稿评分”或“习作精批”时会自动OCR识别；若草稿框为空，会先自动回填正文（最多${HANDWRITING_MAX_FILES}张）。` : `未上传手写图片时，书写项暂按中档估计；最多支持上传${HANDWRITING_MAX_FILES}张。`);
  }
}

function renderHandwritingPreviewList() {
  const preview = document.getElementById('handwritingPreviewList');
  if (!preview) return;
  if (!HANDWRITING_SCAN_STATE.pages.length) {
    preview.innerHTML = '<div class="handwriting-empty">暂未上传图片</div>';
    return;
  }
  preview.innerHTML = HANDWRITING_SCAN_STATE.pages.map((page, index) => `
    <div class="handwriting-preview-card">
      <img src="${page.dataUrl}" alt="手写作文第${index + 1}页预览" />
      <div class="handwriting-preview-meta">
        <strong>第${index + 1}页</strong><br />
        ${escapeHtml(page.name)}<br />
        ${escapeHtml(formatFileSize(page.size))}
      </div>
    </div>
  `).join('');
}

function formatFileSize(size) {
  if (!size || Number.isNaN(size)) return '大小未知';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function resetHandwritingScanCache() {
  HANDWRITING_SCAN_STATE.ocrResult = null;
  HANDWRITING_SCAN_STATE.metricsResult = null;
  HANDWRITING_SCAN_STATE.error = '';
}

function clearHandwritingUpload(inputEl) {
  HANDWRITING_SCAN_STATE.pages = [];
  HANDWRITING_SCAN_STATE.cacheKey = '';
  HANDWRITING_SCAN_STATE.status = 'idle';
  resetHandwritingScanCache();
  if (inputEl) inputEl.value = '';
  renderHandwritingPreviewList();
  updateHandwritingUi('ready', '未上传手写图片时，书写项暂按中档估计。');
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

async function handleHandwritingFiles(fileList) {
  const files = Array.from(fileList || []).filter((file) => /^image\//.test(file.type || ''));
  if (!files.length) {
    clearHandwritingUpload(document.getElementById('handwritingImageInput'));
    return;
  }
  updateHandwritingUi('loading', '正在读取手写图片...');
  const pages = [];
  const limitedFiles = files.slice(0, HANDWRITING_MAX_FILES);
  const ignoredCount = Math.max(0, files.length - limitedFiles.length);
  for (const file of limitedFiles) {
    const dataUrl = await readFileAsDataUrl(file);
    pages.push({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified || 0,
      type: file.type || '',
      dataUrl
    });
  }
  HANDWRITING_SCAN_STATE.pages = pages;
  HANDWRITING_SCAN_STATE.cacheKey = pages.map((page) => `${page.name}-${page.size}-${page.lastModified}`).join('|');
  HANDWRITING_SCAN_STATE.status = 'ready';
  resetHandwritingScanCache();
  renderHandwritingPreviewList();
  updateHandwritingUi(
    'ready',
    ignoredCount
      ? `已上传${pages.length}页手写图片，系统只保留前${HANDWRITING_MAX_FILES}张；另外${ignoredCount}张未导入。点击“草稿评分”或“习作精批”时会自动识别。`
      : `已上传${pages.length}页手写图片，点击“草稿评分”或“习作精批”时会自动识别。`
  );
}

function normalizeForOcrCompare(text) {
  return String(text || '')
    .replace(/\s+/g, '')
    .replace(/[，。！？；：“”‘’、,.!?;:'"()\[\]（）【】]/g, '')
    .toLowerCase();
}

function calculateTextOverlapRatio(a, b) {
  const left = normalizeForOcrCompare(a);
  const right = normalizeForOcrCompare(b);
  if (!left || !right) return 0;
  const freq = new Map();
  for (const ch of right) freq.set(ch, (freq.get(ch) || 0) + 1);
  let match = 0;
  for (const ch of left) {
    const count = freq.get(ch) || 0;
    if (count > 0) {
      match += 1;
      freq.set(ch, count - 1);
    }
  }
  return match / Math.max(left.length, right.length, 1);
}

function computeOcrNoiseRatio(text) {
  const raw = String(text || '');
  if (!raw.trim()) return 1;
  const stripped = raw.replace(/\s+/g, '');
  if (!stripped) return 1;
  const weird = (stripped.match(/[^0-9a-zA-Z\u4e00-\u9fa5，。！？；：“”‘’、,.!?;:'"()\[\]（）【】《》—…\-]/g) || []).length;
  return weird / Math.max(stripped.length, 1);
}

function classifyOverwriteRisk(metrics, confidence, noiseRatio) {
  let risk = 0;
  if ((metrics?.tinyComponentRatio || 0) > 0.62) risk += 1;
  if ((metrics?.transitionDensity || 0) > 0.16) risk += 1;
  if ((metrics?.darkPixelRatio || 0) > 0.24) risk += 1;
  if (confidence < 55) risk += 1;
  if (noiseRatio > 0.2) risk += 1;
  return risk >= 4 ? '高' : risk >= 2 ? '中' : '低';
}

async function ensureTesseractLoaded() {
  if (window.Tesseract) return window.Tesseract;
  if (handwritingOcrScriptPromise) return handwritingOcrScriptPromise;
  handwritingOcrScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-role="tesseract-ocr"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Tesseract), { once: true });
      existing.addEventListener('error', () => reject(new Error('OCR脚本加载失败')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = HANDWRITING_OCR_CDN;
    script.async = true;
    script.dataset.role = 'tesseract-ocr';
    script.onload = () => {
      if (window.Tesseract) resolve(window.Tesseract);
      else {
        handwritingOcrScriptPromise = null;
        reject(new Error('OCR库未正确加载'));
      }
    };
    script.onerror = () => {
      handwritingOcrScriptPromise = null;
      reject(new Error('OCR脚本加载失败，请检查网络后重试'));
    };
    document.head.appendChild(script);
  });
  return handwritingOcrScriptPromise;
}

async function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = source;
  });
}

function findPaperCropBounds(imageData, width, height) {
  const data = imageData.data;
  const colCounts = new Array(width).fill(0);
  const rowCounts = new Array(height).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      if (gray > 142 && spread < 72) {
        colCounts[x] += 1;
        rowCounts[y] += 1;
      }
    }
  }

  const colMinRatio = 0.16;
  const rowMinRatio = 0.12;
  let left = 0;
  let right = width - 1;
  let top = 0;
  let bottom = height - 1;
  while (left < right && colCounts[left] / Math.max(height, 1) < colMinRatio) left += 1;
  while (right > left && colCounts[right] / Math.max(height, 1) < colMinRatio) right -= 1;
  while (top < bottom && rowCounts[top] / Math.max(width, 1) < rowMinRatio) top += 1;
  while (bottom > top && rowCounts[bottom] / Math.max(width, 1) < rowMinRatio) bottom -= 1;

  const padX = Math.round(width * 0.025);
  const padY = Math.round(height * 0.025);
  left = Math.max(0, left - padX);
  right = Math.min(width - 1, right + padX);
  top = Math.max(0, top - padY);
  bottom = Math.min(height - 1, bottom + padY);
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const cropArea = (cropWidth * cropHeight) / Math.max(width * height, 1);
  if (cropWidth < width * 0.35 || cropHeight < height * 0.35 || cropArea < 0.22) {
    return { left: 0, top: 0, width, height, cropped: false };
  }
  return { left, top, width: cropWidth, height: cropHeight, cropped: cropArea < 0.94 };
}

async function createProcessedCanvas(source, maxWidth, threshold = 182, mode = 'binary', cropPaper = true) {
  const img = await loadImageElement(source);
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
  const width = Math.max(1, Math.round(img.width * ratio));
  const height = Math.max(1, Math.round(img.height * ratio));
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  sourceCtx.fillStyle = '#ffffff';
  sourceCtx.fillRect(0, 0, width, height);
  sourceCtx.drawImage(img, 0, 0, width, height);
  const rawImageData = sourceCtx.getImageData(0, 0, width, height);
  const bounds = cropPaper ? findPaperCropBounds(rawImageData, width, height) : { left: 0, top: 0, width, height, cropped: false };
  const canvas = document.createElement('canvas');
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, bounds.width, bounds.height);
  ctx.drawImage(sourceCanvas, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
  const imageData = ctx.getImageData(0, 0, bounds.width, bounds.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (mode === 'gray') {
      const boosted = gray < threshold
        ? Math.max(0, gray * 0.55)
        : Math.min(255, 235 + ((gray - threshold) * 0.25));
      data[i] = boosted;
      data[i + 1] = boosted;
      data[i + 2] = boosted;
    } else {
      const boosted = gray < threshold ? 0 : 255;
      data[i] = boosted;
      data[i + 1] = boosted;
      data[i + 2] = boosted;
    }
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function scoreOcrResultCandidate(result) {
  const text = String(result?.data?.text || '');
  const compact = text.replace(/\s+/g, '');
  const chineseCount = (compact.match(/[\u4e00-\u9fa5]/g) || []).length;
  const validCount = (compact.match(/[0-9a-zA-Z\u4e00-\u9fa5，。！？；：“”‘’、,.!?;:'"()\[\]（）【】《》\-]/g) || []).length;
  const noiseRatio = compact.length ? 1 - (validCount / compact.length) : 1;
  const confidence = Number(result?.data?.confidence || 0);
  return (chineseCount * 2.2) + (validCount * 0.25) + (confidence * 0.12) - (noiseRatio * 40);
}

function pickBestOcrResult(candidates) {
  return candidates
    .filter(Boolean)
    .sort((a, b) => scoreOcrResultCandidate(b) - scoreOcrResultCandidate(a))[0] || candidates[0];
}

function analyzeBinaryCanvasMetrics(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const dark = new Uint8Array(total);
  const rowDarkCounts = new Array(height).fill(0);
  let darkPixels = 0;
  let transitions = 0;
  for (let y = 0; y < height; y += 1) {
    let prev = 0;
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const pixel = data[idx * 4];
      const isDark = pixel < 128 ? 1 : 0;
      dark[idx] = isDark;
      if (isDark) {
        darkPixels += 1;
        rowDarkCounts[y] += 1;
      }
      if (x > 0 && isDark !== prev) transitions += 1;
      prev = isDark;
    }
  }
  const visited = new Uint8Array(total);
  const stack = [];
  let components = 0;
  let tinyComponents = 0;
  for (let i = 0; i < total; i += 1) {
    if (!dark[i] || visited[i]) continue;
    components += 1;
    visited[i] = 1;
    stack.push(i);
    let size = 0;
    while (stack.length) {
      const current = stack.pop();
      size += 1;
      const x = current % width;
      const y = Math.floor(current / width);
      const neighbors = [
        current - 1,
        current + 1,
        current - width,
        current + width
      ];
      for (const next of neighbors) {
        if (next < 0 || next >= total) continue;
        const nx = next % width;
        const ny = Math.floor(next / width);
        if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
        if (!dark[next] || visited[next]) continue;
        visited[next] = 1;
        stack.push(next);
      }
    }
    if (size <= 6) tinyComponents += 1;
  }
  const meanRow = rowDarkCounts.reduce((sum, value) => sum + value, 0) / Math.max(height, 1);
  const variance = rowDarkCounts.reduce((sum, value) => sum + ((value - meanRow) ** 2), 0) / Math.max(height, 1);
  return {
    darkPixelRatio: darkPixels / Math.max(total, 1),
    transitionDensity: transitions / Math.max(total, 1),
    componentCount: components,
    tinyComponentRatio: tinyComponents / Math.max(components, 1),
    rowVariance: variance / Math.max(width * width, 1)
  };
}

async function runHandwritingOcrAnalysis(draft) {
  if (!HANDWRITING_SCAN_STATE.pages.length) {
    return {
      text: '',
      confidence: 0,
      overlapRatio: 0,
      noiseRatio: 1,
      overwriteRisk: '中',
      metrics: {
        darkPixelRatio: 0,
        transitionDensity: 0,
        componentCount: 0,
        tinyComponentRatio: 0,
        rowVariance: 0
      }
    };
  }

  if (HANDWRITING_SCAN_STATE.ocrResult && HANDWRITING_SCAN_STATE.metricsResult) {
    const combinedText = HANDWRITING_SCAN_STATE.ocrResult.pages.map((item) => item.text).join('\n');
    return {
      text: combinedText,
      confidence: HANDWRITING_SCAN_STATE.ocrResult.confidence,
      overlapRatio: calculateTextOverlapRatio(combinedText, draft),
      noiseRatio: computeOcrNoiseRatio(combinedText),
      overwriteRisk: classifyOverwriteRisk(HANDWRITING_SCAN_STATE.metricsResult, HANDWRITING_SCAN_STATE.ocrResult.confidence, computeOcrNoiseRatio(combinedText)),
      metrics: HANDWRITING_SCAN_STATE.metricsResult
    };
  }

  updateHandwritingUi('loading', '正在加载OCR模型并识别手写图片，首次可能需要十几秒。');
  const TesseractLib = await ensureTesseractLoaded();
  const ocrPages = [];
  const metricList = [];
  for (let index = 0; index < HANDWRITING_SCAN_STATE.pages.length; index += 1) {
    const page = HANDWRITING_SCAN_STATE.pages[index];
    updateHandwritingUi('loading', `正在识别第${index + 1}/${HANDWRITING_SCAN_STATE.pages.length}页手写图片...`);
    const ocrCanvas = await createProcessedCanvas(page.dataUrl, HANDWRITING_OCR_MAX_WIDTH, 138);
    const grayOcrCanvas = await createProcessedCanvas(page.dataUrl, HANDWRITING_OCR_MAX_WIDTH, 164, 'gray');
    const softBinaryCanvas = await createProcessedCanvas(page.dataUrl, HANDWRITING_OCR_MAX_WIDTH, 178);
    const analysisCanvas = await createProcessedCanvas(page.dataUrl, HANDWRITING_ANALYSIS_MAX_WIDTH, 180);
    metricList.push(analyzeBinaryCanvasMetrics(analysisCanvas));
    const ocrOptions = {
      workerPath: HANDWRITING_OCR_WORKER,
      corePath: HANDWRITING_OCR_CORE,
      langPath: HANDWRITING_OCR_LANG,
      logger: (msg) => {
        if (msg?.status === 'recognizing text' && typeof msg.progress === 'number') {
          const percent = Math.round(msg.progress * 100);
          updateHandwritingUi('loading', `正在识别第${index + 1}/${HANDWRITING_SCAN_STATE.pages.length}页：${percent}%`);
        }
      }
    };
    const result = await TesseractLib.recognize(ocrCanvas, 'chi_sim+eng', {
      ...ocrOptions,
      tessedit_pageseg_mode: '6',
      preserve_interword_spaces: '1',
      user_defined_dpi: '300'
    });
    const candidates = [result];
    const usefulLength = String(result?.data?.text || '').replace(/\s+/g, '').length;
    if (usefulLength < HANDWRITING_OCR_MIN_USEFUL_CHARS || scoreOcrResultCandidate(result) < 55) {
      updateHandwritingUi('loading', `第${index + 1}页标准识别偏弱，正在尝试强化识别...`);
      candidates.push(await TesseractLib.recognize(grayOcrCanvas, 'chi_sim+eng', {
        ...ocrOptions,
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1',
        user_defined_dpi: '300'
      }));
      candidates.push(await TesseractLib.recognize(softBinaryCanvas, 'chi_sim+eng', {
        ...ocrOptions,
        tessedit_pageseg_mode: '11',
        preserve_interword_spaces: '1',
        user_defined_dpi: '300'
      }));
    }
    const finalResult = pickBestOcrResult(candidates);
    ocrPages.push({
      text: String(finalResult?.data?.text || ''),
      confidence: Number(finalResult?.data?.confidence || 0)
    });
  }

  const confidence = ocrPages.reduce((sum, item) => sum + item.confidence, 0) / Math.max(ocrPages.length, 1);
  const metricSummary = metricList.reduce((acc, item) => ({
    darkPixelRatio: acc.darkPixelRatio + item.darkPixelRatio,
    transitionDensity: acc.transitionDensity + item.transitionDensity,
    componentCount: acc.componentCount + item.componentCount,
    tinyComponentRatio: acc.tinyComponentRatio + item.tinyComponentRatio,
    rowVariance: acc.rowVariance + item.rowVariance
  }), {
    darkPixelRatio: 0,
    transitionDensity: 0,
    componentCount: 0,
    tinyComponentRatio: 0,
    rowVariance: 0
  });
  Object.keys(metricSummary).forEach((key) => {
    metricSummary[key] /= Math.max(metricList.length, 1);
  });
  HANDWRITING_SCAN_STATE.ocrResult = { pages: ocrPages, confidence };
  HANDWRITING_SCAN_STATE.metricsResult = metricSummary;
  const text = ocrPages.map((item) => item.text).join('\n');
  const noiseRatio = computeOcrNoiseRatio(text);
  const overlapRatio = calculateTextOverlapRatio(text, draft);
  const overwriteRisk = classifyOverwriteRisk(metricSummary, confidence, noiseRatio);
  const usefulCharCount = text.replace(/\s+/g, '').length;
  const qualityTip = usefulCharCount < HANDWRITING_SCAN_STATE.pages.length * 45
    ? '识别文字偏少，建议正向拍摄、减少阴影，让作文纸占满画面。'
    : '已提取到正文，可继续评分或精批。';
  updateHandwritingUi('done', `OCR完成：平均识别置信度约${Math.round(confidence)}%，识别约${usefulCharCount}字，疑似涂改风险${overwriteRisk}。${qualityTip}`);
  return {
    text,
    confidence,
    overlapRatio,
    noiseRatio,
    overwriteRisk,
    metrics: metricSummary
  };
}

function normalizeRecognizedHandwritingDraft(text) {
  const raw = String(text || '').replace(/\r/g, '\n');
  const cleanLines = raw
    .split('\n')
    .map((line) => line.replace(/\s+/g, '').trim())
    .filter(Boolean);
  if (!cleanLines.length) return '';

  const paragraphs = [];
  let current = '';
  cleanLines.forEach((line) => {
    current += line;
    const shouldBreak = /[。！？；!?]$/.test(line) || current.length >= 130;
    if (shouldBreak) {
      paragraphs.push(current);
      current = '';
    }
  });
  if (current) paragraphs.push(current);
  return paragraphs.join('\n\n');
}

async function resolveDraftFromInputOrHandwriting(draftInput, wordCountEl, resultContainer, actionLabel) {
  const existingDraft = String(draftInput?.value || '').trim();
  if (existingDraft) {
    return {
      draft: existingDraft,
      fromOcr: false,
      ocrText: ''
    };
  }

  if (!HANDWRITING_SCAN_STATE.pages.length) {
    return {
      draft: '',
      fromOcr: false,
      ocrText: ''
    };
  }

  if (resultContainer) {
    resultContainer.innerHTML = `<p class="agent-empty">未检测到草稿正文，正在从${HANDWRITING_SCAN_STATE.pages.length}张手写图片自动识别正文并继续${escapeHtml(actionLabel || '处理')}，请稍候...</p>`;
  }

  try {
    const ocr = await runHandwritingOcrAnalysis('');
    const normalizedDraft = normalizeRecognizedHandwritingDraft(ocr.text);
    if (!normalizedDraft) {
      return {
        draft: '',
        fromOcr: true,
        ocrText: ''
      };
    }

    if (draftInput) draftInput.value = normalizedDraft;
    updateExamWordCountDisplay(draftInput, wordCountEl);
    return {
      draft: normalizedDraft,
      fromOcr: true,
      ocrText: normalizedDraft
    };
  } catch (error) {
    HANDWRITING_SCAN_STATE.status = 'error';
    HANDWRITING_SCAN_STATE.error = error?.message || 'OCR识别失败';
    updateHandwritingUi('error', `OCR识别失败：${HANDWRITING_SCAN_STATE.error}`);
    return {
      draft: '',
      fromOcr: true,
      ocrText: ''
    };
  }
}

async function fillDraftFromHandwritingImages(draftInput, wordCountEl, resultContainer) {
  if (!HANDWRITING_SCAN_STATE.pages.length) {
    if (resultContainer) resultContainer.innerHTML = '<p class="agent-empty">请先上传手写作文图片。</p>';
    return '';
  }
  if (resultContainer) {
    resultContainer.innerHTML = `<p class="agent-empty">正在从${HANDWRITING_SCAN_STATE.pages.length}张手写图片识别正文，请稍候...</p>`;
  }
  try {
    const ocr = await runHandwritingOcrAnalysis('');
    const normalizedDraft = normalizeRecognizedHandwritingDraft(ocr.text);
    if (!normalizedDraft) {
      if (resultContainer) {
        resultContainer.innerHTML = '<p class="agent-empty">OCR已完成，但没有提取到可用正文。请尽量正向拍摄、减少阴影，并让作文纸占满画面后重试。</p>';
      }
      return '';
    }
    if (draftInput) {
      draftInput.value = normalizedDraft;
      draftInput.focus();
    }
    updateExamWordCountDisplay(draftInput, wordCountEl);
    if (resultContainer) {
      resultContainer.innerHTML = `<p class="agent-empty">已从手写图片识别并回填正文，当前约${countWords(normalizedDraft)}字。请先快速核对 OCR 文字，再点击“习作精批”或“草稿评分”。</p>`;
    }
    return normalizedDraft;
  } catch (error) {
    HANDWRITING_SCAN_STATE.status = 'error';
    HANDWRITING_SCAN_STATE.error = error?.message || 'OCR识别失败';
    updateHandwritingUi('error', `OCR识别失败：${HANDWRITING_SCAN_STATE.error}`);
    if (resultContainer) {
      resultContainer.innerHTML = `<p class="agent-empty">OCR识别失败：${escapeHtml(HANDWRITING_SCAN_STATE.error)}。请检查网络，或换一张更清晰的照片再试。</p>`;
    }
    return '';
  }
}

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
            <span class="card-foot-left">出现频次 <em class="freq-dots">${renderFrequencyDots(freq)}</em></span>
            <span class="card-foot-right">点击翻面</span>
          </div>
        </div>
        <div class="card-back">
          <div class="card-back-head">${escapeHtml(data.backTitle || '考场提示')}</div>
          <ol class="card-back-list">${backPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ol>
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
  const resultContainer = document.getElementById('agentResult');
  const essayFilterBar = document.getElementById('essayFilterBar');
  const essaySampleList = document.getElementById('essaySampleList');
  const materialTitleInput = document.getElementById('materialTitleInput');
  const materialBodyInput = document.getElementById('materialBodyInput');
  const createMaterialCardBtn = document.getElementById('createMaterialCardBtn');
  const clearMaterialInputBtn = document.getElementById('clearMaterialInputBtn');
  const materialCardList = document.getElementById('materialCardList');
  const exampleTrainingList = document.getElementById('exampleTrainingList');
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

  offTopicCheckBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const draft = draftInput.value.trim();
    if (!topic) return void (resultContainer.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>');
    if (!draft) return void (resultContainer.innerHTML = '<p class="agent-empty">请先粘贴作文草稿。</p>');
    try {
      const report = runOffTopicCheck(topic, draft);
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

function scoreExampleTrainingCard(card, topic, topicType) {
  const text = String(topic || '');
  let score = 0;
  (card.keywords || []).forEach((kw) => {
    if (kw && text.includes(kw)) score += 16;
  });
  if (card.topic && text.includes(card.topic.slice(0, 8))) score += 26;
  const typeName = typeof topicType === 'string'
    ? ({ relation: '关系辩证题', value: '价值判断题', problem: '问题式命题', phenomenon: '问题式命题' }[topicType] || topicType)
    : topicType?.name;
  if (typeName && (card.categories || []).includes(typeName)) score += 12;
  if (/(如何|怎样|是否|吗|思考)/.test(text) && (card.categories || []).includes('问题式命题')) score += 6;
  return score;
}

function pickRelevantExampleCards(topic, topicType, limit = 3) {
  return loadExampleTrainingLibrary()
    .map((card) => ({ ...card, matchScore: scoreExampleTrainingCard(card, topic, topicType) }))
    .filter((card) => card.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function pickExampleTrainingCardForTopic(topic, topicType) {
  return pickRelevantExampleCards(topic, topicType, 1)[0] || null;
}

function pickAnchoredExampleCards(topic, topicType, limit = 2) {
  const text = String(topic || '');
  return pickRelevantExampleCards(text, topicType, Math.max(limit + 2, 4))
    .filter((card) => {
      const keywordHits = (card.keywords || []).filter((kw) => kw && text.includes(kw)).length;
      return card.matchScore >= 22 || keywordHits >= 2 || (card.topic && text.includes(card.topic.slice(0, 10)));
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

function runOffTopicCheck(topic, draft) {
  const topicType = detectTopicType(topic);
  const topicPhrases = extractTopicPhrases(topic);
  const paragraphs = splitParagraphs(draft);
  const lower = draft.toLowerCase();
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
  const scaffold = buildOffTopicScaffold({ topic, draft, topicType, topicPhrases, paragraphs });
  const precision = buildPrecisionChecks({ topic, draft, topicType, topicPhrases, paragraphs, diagnostics });
  const baseRiskPoints = (missed.length * 8) + (weak * 10) + (paragraphs.length < 3 ? 10 : 0);
  const qualityScore = Math.round(
    (scaffold.dimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(scaffold.dimensions.length, 1)) * 0.72
      + (100 - baseRiskPoints) * 0.28
  );
  const precisionPenalty = Math.round((100 - precision.avgScore) * 0.18);
  const riskScore = clamp(qualityScore - precisionPenalty, 0, 100);
  const riskLevel = riskScore < 50 ? '高风险' : (riskScore < 75 ? '中风险' : '低风险');
  const flawScan = scanArgumentFlaws({ topic, topicType, draft, topicPhrases, paragraphDiagnostics: diagnostics, paragraphs, scaffold, precision });
  const paragraphAdvice = buildParagraphAdvice({ topic, topicType, draft, topicPhrases, paragraphs, diagnostics, scaffold, precision, coverageMatrix });
  const lowDims = scaffold.dimensions.filter((d) => d.score < 65);
  const autoSuggestions = lowDims.slice(0, 4).map((d) => d.fix);
  const triadGaps = buildTriadGapTips({ topic, draft, topicPhrases, scaffold, precision, missedCount: missed.length });

  return {
    topic,
    draft,
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
    flawScan,
    paragraphAdvice,
    triadGaps,
    evidence: [
      `题眼覆盖：${matched.length}/${Math.max(topicPhrases.length, 1)}`,
      `段落数量：${paragraphs.length}`,
      `偏题段落：${weak}段`,
      `思辨脚手架：${scaffold.summary}`,
      `精准度核验：核心一致性${precision.coreConsistency.score} / 对立覆盖${precision.oppositionCoverage.score} / 升华质量${precision.risingQuality.score}`
    ],
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

function scoreEssayDraft(topic, draft) {
  const offTopic = runOffTopicCheck(topic, draft);
  const paragraphs = splitParagraphs(draft);
  const sentenceCount = splitSentences(draft).length;
  const wordCount = countWords(draft);
  const dims = offTopic.scaffold?.dimensions || [];
  const d1 = dims.find((d) => d.id === 'd1')?.score || 0;
  const d2 = dims.find((d) => d.id === 'd2')?.score || 0;
  const d3 = dims.find((d) => d.id === 'd3')?.score || 0;
  const d5 = dims.find((d) => d.id === 'd5')?.score || 0;
  const d6 = dims.find((d) => d.id === 'd6')?.score || 0;
  const logicCount = countMatches(draft, /(因为|所以|因此|由此|意味着|从而)/gi);
  const evidenceCount = countMatches(draft, /(例如|比如|案例|以.*为例|数据)/gi);
  const turnCount = countMatches(draft, /(诚然|然而|另一方面|同时|反过来|不过)/gi);

  const relevance = clamp(Math.round((d1 * 0.45 + d2 * 0.25 + d5 * 0.3) / 5), 0, 20);
  const structure = clamp(Math.round(((paragraphs.length >= 3 ? 70 : 45) + Math.min(20, sentenceCount * 1.8) + Math.min(10, d6 * 0.1)) / 5), 0, 20);
  const argument = clamp(Math.round((Math.min(45, logicCount * 8) + Math.min(30, evidenceCount * 10) + Math.min(25, turnCount * 8)) / 5), 0, 20);
  const language = clamp(wordCount >= 850 ? 15 : wordCount >= 760 ? 18 : wordCount >= 620 ? 16 : wordCount >= 450 ? 13 : 10, 0, 20);
  const depth = clamp(Math.round((d2 * 0.3 + d3 * 0.45 + d5 * 0.25) / 5), 0, 20);
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
      relevance < 15 ? '审题立意偏弱：先界定概念，再明确成立条件。' : '审题扣题较稳。',
      argument < 15 ? '论证链不足：每个例子后补“机制解释句”。' : '论证基础可用。',
      depth < 15 ? '思辨深度待提升：补“诚然-然而-因此”并写边界。' : '思辨层次基本达标。'
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
  const score = Math.round((riskScore * 0.55 + topicFit * 0.45) / 100 * 18);
  if (riskScore >= 80 && topicFit >= 75) {
    return { band: '一类', score: clamp(score, 15, 18), detail: '紧扣材料核心问法，未见明显偏题。' };
  }
  if (riskScore >= 60 && topicFit >= 55) {
    return { band: '二类', score: clamp(score, 11, 15), detail: '基本扣住材料，但局部段落开始离开题眼。' };
  }
  if (riskScore >= 40 && topicFit >= 35) {
    return { band: '三类', score: clamp(score, 7, 11), detail: '能碰到材料边缘，但核心立意不稳，容易写散。' };
  }
  return { band: '四类', score: clamp(score, 0, 7), detail: '偏离材料核心明显，文章主要在自说自话。' };
}

function assessThesisLine(topic, draft, analysis) {
  const paragraphs = splitParagraphs(draft);
  const sentenceMap = getDraftSentenceMap(draft);
  const topicPhrases = analysis.topicPhrases || [];
  const thesisPattern = /(我认为|在我看来|我更倾向于|关键在于|真正|不是|而是|因此|可见)/;
  let thesisSentence = '';
  let thesisParagraph = -1;
  sentenceMap.slice(0, 2).forEach((row) => {
    if (thesisSentence) return;
    const hit = row.sentences.find((sentence) => thesisPattern.test(sentence) || topicPhrases.some((phrase) => phrase && sentence.includes(phrase)));
    if (hit) {
      thesisSentence = hit;
      thesisParagraph = row.index;
    }
  });
  const thesisKeywords = normalizeTopicPhrases(extractTopicPhrases(thesisSentence || analysis.thesis || topic));
  const carryingParagraphs = paragraphs.filter((paragraph) => thesisKeywords.some((kw) => kw && paragraph.includes(kw))).length;
  const carryRatio = paragraphs.length ? carryingParagraphs / paragraphs.length : 0;
  const score = clamp((thesisSentence ? 4 : 1) + Math.round(carryRatio * 6), 0, 10);
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
  const exampleCount = countMatches(draft, /(例如|比如|以.+?为例|案例|譬如|屈原|司马迁|AI|人工智能|短视频|社交媒体|航天)/g);
  const metaphorCount = countMatches(draft, /(像|如同|仿佛|恰似|好比|不是.+而是.+)/g);
  const turnCount = countMatches(draft, /(诚然|然而|但是|不过|另一方面|同时|反过来)/g);
  const logicCount = countMatches(draft, /(因为|所以|因此|由此|从而|意味着|这说明|可见)/g);
  const score = clamp(
    Math.min(4, logicCount) +
    Math.min(3, turnCount) +
    (quoteCount > 0 ? 2 : 0) +
    (exampleCount > 0 ? 2 : 0) +
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
    detail: `引证${quoteCount}处，例证${exampleCount}处，比喻论证${metaphorCount}处；逻辑转折${turnCount}处，因果推进${logicCount}处。`
  };
}

function assessMaterialFreshness(draft) {
  const staleHits = STALE_MATERIAL_PATTERNS.filter((name) => draft.includes(name));
  const freshHits = CURRENT_MATERIAL_PATTERNS.filter((name) => draft.includes(name));
  let score = 6;
  if (freshHits.length) score += 2;
  if (staleHits.length && !freshHits.length) score -= 2;
  if (!staleHits.length && !freshHits.length) score -= 1;
  return {
    score: clamp(score, 0, 8),
    max: 8,
    staleHits,
    freshHits,
    detail: staleHits.length && !freshHits.length
      ? `检测到较常见素材：${staleHits.join('、')}；按约定扣2分。`
      : (freshHits.length
        ? `能看到较新的现实材料：${freshHits.join('、')}。`
        : '未见明显过时素材，但现实材料的新鲜度还不够高。')
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

let OBSIDIAN_ENTRY_INDEX_CACHE = null;
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
  if (/现象|思辨/.test(text)) return '';
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
    entry.packTitle,
    entry.sourceFile,
    entry.typeNoteName,
    entry.themeNoteName,
    entry.clusterNoteName
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
  return {
    rank: index + 1,
    title: entry.title || entry.topicKey || '未命名范文档案',
    meta: `${entry.sourceFile || mode}｜${entry.yearLabel || '年份未标'}｜${entry.topicType || '题型未标'}｜${entry.themeTag || '母题未标'}`,
    why: `${mode}：${reasons}`,
    visibleAction: weakFocus.action,
    selfCheck: `看完后回到自己的第${weakParagraph}段，只检查“${weakFocus.key}”这一项：有没有题眼、有无机制解释、有无边界收束。`,
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

async function buildShanghaiTeacherReviewReport(topic, draft, options = {}) {
  const analysis = analyzeEssayTopic(topic);
  const offTopic = runOffTopicCheck(topic, draft);
  const intent = getCoreIntentBand(offTopic);
  const thesis = assessThesisLine(topic, draft, analysis);
  const argument = assessArgumentLogic(draft);
  const material = assessMaterialFreshness(draft);
  const language = assessLanguageExpression(topic, draft, analysis);
  const structure = assessStructureDraft(draft, analysis);
  const handwriting = options.precomputedHandwriting || await assessHandwritingByOCR(draft);
  const total = intent.score + thesis.score + argument.score + material.score + language.score + structure.score + handwriting.score;
  const paragraphRows = buildParagraphIssueRowsForTeacher(topic, draft, offTopic, thesis);
  const report = {
    topic,
    draft,
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
    total70: clamp(total, 0, 70)
  };
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
      task: weakParagraph?.task || '检查每段是否持续围绕题眼，不让材料滑向泛论。'
    },
    '中心论点': {
      evidence: thesisEvidence,
      task: report.thesis?.score >= 7 ? '保持中心句贯穿，主体段段首继续回扣。' : '把中心论点改成一句完整判断句，写清条件与立场。'
    },
    '论证逻辑': {
      evidence: logicSentence ? `第${logicSentence.paragraphIndex + 1}段“${takeSentencePreview(logicSentence.sentence, 30)}”` : '未找到明显“原因-机制-结果”推进句',
      task: '每个材料后补一句“为什么它能证明观点”，不要只摆例子。'
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

function renderTeacherDimensionRows(report) {
  const evidenceMap = buildTeacherScoreEvidenceMap(report);
  const rows = [
    ['材料核心立意', `${report.intent.score}/${report.intent.max}`, `判定：${report.intent.band}｜${report.intent.detail}`],
    ['中心论点', `${report.thesis.score}/${report.thesis.max}`, report.thesis.detail],
    ['论证逻辑', `${report.argument.score}/${report.argument.max}`, report.argument.detail],
    ['论据新旧', `${report.material.score}/${report.material.max}`, report.material.detail],
    ['语言表达', `${report.language.score}/${report.language.max}`, report.language.detail],
    ['结构章法', `${report.structure.score}/${report.structure.max}`, report.structure.detail],
    ['书写规范（OCR）', `${report.handwriting.score}/${report.handwriting.max}`, report.handwriting.detail]
  ];
  return rows.map((row) => `
    <div class="flaw-row">
      <div class="flaw-row-top"><span>${escapeHtml(row[0])}</span><strong>${escapeHtml(row[1])}</strong></div>
      <p>${escapeHtml(row[2])}</p>
      <p><strong>证据句</strong>：${escapeHtml(evidenceMap[row[0]]?.evidence || '暂无证据')}</p>
      <p><strong>扣分/保分依据</strong>：${escapeHtml(evidenceMap[row[0]]?.task || '继续核对原文。')}</p>
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

function renderTeacherScoreReport(report, container) {
  const sentenceQuality = analyzeSentenceQuality(report.topic, report.draft, report.analysis?.topicPhrases || report.offTopic?.topicPhrases || []);
  const goodRows = renderSentenceQualityItems(sentenceQuality.goodItems || [], 'good');
  const weakRows = renderSentenceQualityItems(sentenceQuality.badItems || [], 'bad');
  const suggestionRows = (report.suggestions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const errorBookPanel = renderErrorBookTrainingPanel(buildTeacherErrorBookSummary(report));

  container.innerHTML = `
    <div class="agent-result-head">
      <h3>上海模考阅卷报告</h3>
      <div class="agent-tags">
        <span class="agent-tag">总分：${report.total70}/70</span>
        <span class="agent-tag">立意档次：${escapeHtml(report.intent.band)}</span>
        <span class="agent-tag risk ${normalizeRiskClass(report.offTopic?.riskLevel || '中')}">偏题风险：${escapeHtml(report.offTopic?.riskLevel || '中')}</span>
      </div>
    </div>
    ${renderTeacherClosedLoopPanel(report, 'score')}
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
  const errorBookPanel = renderErrorBookTrainingPanel(buildTeacherErrorBookSummary(report));
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
        <span class="agent-tag">立意档次：${escapeHtml(report.intent.band)}</span>
        <span class="agent-tag">书写项：${report.handwriting.score}/${report.handwriting.max}</span>
      </div>
    </div>
    ${renderTeacherClosedLoopPanel(report, 'critique')}
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
      <h4>逐段指出问题</h4>
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
  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') || '');
  const pickV = (name) => {
    const hit = scripts.find((src) => src.includes(name));
    if (!hit) return null;
    const m = hit.match(/[?&]v=(\d+)/);
    return m ? Number(m[1]) : null;
  };
  const dv = pickV('data.js');
  const av = pickV('app.js');
  if (dv == null || av == null) {
    return { ok: false, message: '脚本未带版本号，建议统一追加 ?v=数字' };
  }
  const ok = dv === av;
  return {
    ok,
    message: ok ? `版本一致：v=${dv}` : `版本不一致：data v${dv} / app v${av}`
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

  try {
    const analysis = analyzeEssayTopic('一个人乐意去探索陌生世界，仅仅是因为好奇心吗？');
    const ok = !!analysis && Array.isArray(analysis.outline) && analysis.outline.length >= 3 && Array.isArray(analysis.topicPhrases);
    cases.push({ name: '分析题目主链', ok, detail: ok ? '可稳定产出审题结构' : '分析结果结构不完整' });
  } catch (err) {
    cases.push({ name: '分析题目主链', ok: false, detail: `异常：${err?.message || '未知错误'}` });
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
    const analysis = analyzeEssayTopic(topic);
    const tech = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'tech' });
    const culture = generateFullEssayDraft(topic, analysis, 800, 850, { casePool: 'culture' });
    const ok = tech !== culture && /模型|技术|科技创新/.test(tech) && /戏曲|导赏|文化传播/.test(culture);
    cases.push({ name: '素材池分流', ok, detail: ok ? '科技/文化素材已区分' : '不同素材池输出差异不足' });
  } catch (err) {
    cases.push({ name: '素材池分流', ok: false, detail: `异常：${err?.message || '未知错误'}` });
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
    level: passed === cases.length ? '通过' : (passed >= cases.length - 1 ? '基本通过' : '未通过')
  };
}

function renderRegressionReport(report, container) {
  const rows = (report.cases || []).map((item) => `
    <div class="score-row">
      <div class="score-row-top"><span>${escapeHtml(item.name)}</span><strong>${item.ok ? '通过' : '失败'}</strong></div>
      <p class="agent-para-issues">${escapeHtml(item.detail)}</p>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="agent-result-head">
      <h3>回归测试报告</h3>
      <div class="agent-tags">
        <span class="agent-tag">结果：${escapeHtml(report.level)}</span>
        <span class="agent-tag">通过：${report.passed}/${report.total}</span>
      </div>
    </div>
    <div class="agent-result-block"><h4>回归样例</h4><div class="score-grid">${rows}</div></div>
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
  if (total >= 92) return '一类上（约65-70分）';
  if (total >= 85) return '一类中（约60-64分）';
  if (total >= 78) return '一类下（约56-59分）';
  if (total >= 70) return '二类卷（约49-55分）';
  if (total >= 62) return '三类卷（约42-48分）';
  if (total >= 54) return '四类卷（约35-41分）';
  return '五类卷（约34分及以下）';
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
