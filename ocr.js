// OCR and handwriting-image support for the Gaokao writing workbench.
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
