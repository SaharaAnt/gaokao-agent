(() => {
  window.__quickGenLoaded = true;

  function countWordsLike(text) {
    const cn = (String(text || "").match(/[\u4e00-\u9fa5]/g) || []).length;
    const en = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return cn + en;
  }

  function ensurePeriod(s) {
    const t = String(s || "").trim();
    if (!t) return "";
    return /[。！？.!?]$/.test(t) ? t : `${t}。`;
  }

  function splitSentences(text) {
    return String(text || "")
      .split(/[。！？.!?；;]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function trimToMax(text, maxWords) {
    if (countWordsLike(text) <= maxWords) return text;
    const paragraphs = String(text).split(/\n\n+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < paragraphs.length; i += 1) {
      const candidate = out.length ? `${out.join("\n\n")}\n\n${paragraphs[i]}` : paragraphs[i];
      if (countWordsLike(candidate) <= maxWords) {
        out.push(paragraphs[i]);
      } else {
        const sents = splitSentences(paragraphs[i]);
        let partial = "";
        for (let j = 0; j < sents.length; j += 1) {
          const c = partial ? `${partial}。${sents[j]}` : sents[j];
          const all = out.length ? `${out.join("\n\n")}\n\n${c}` : c;
          if (countWordsLike(all) > maxWords) break;
          partial = c;
        }
        if (partial) out.push(ensurePeriod(partial));
        break;
      }
    }
    return out.join("\n\n");
  }

  function padToMin(text, minWords, pool) {
    let draft = String(text || "");
    const used = new Set();
    for (let i = 0; i < pool.length && countWordsLike(draft) < minWords; i += 1) {
      const line = ensurePeriod(pool[i]);
      if (used.has(line)) continue;
      draft = `${draft}\n\n${line}`;
      used.add(line);
    }
    return draft;
  }

  function isTopic2025(topic) {
    const t = String(topic || "");
    return /专/.test(t) && /转/.test(t) && /传/.test(t);
  }

  function isTopic2022(topic) {
    const t = String(topic || "");
    return /小时候.*发问/.test(t) && /长大后.*结论/.test(t);
  }

  function buildEssayFor2025(topic) {
    const paragraphs = [
      "“由‘专’到‘传’，必定要经过‘转’吗？”这道题看似在问传播路径，实则在考查我们如何理解知识生产、公共传播与文化沉淀之间的关系。所谓“专”，是面向专业共同体的高密度表达；“转”，是被大众转发、转译、再传播的通俗表达；“传”，则是经得起时间筛选、能够持续影响读者与社会的作品。若把三者简单排成流水线，就会忽略传播生态的复杂性。",
      "先看“为什么很多时候要经过‘转’”。专业文章往往有术语门槛和圈层壁垒，普通读者即使有兴趣，也可能因为理解成本过高而止步。恰当的“转”，本质上是知识翻译：把复杂问题说清楚，把关键证据讲明白，把学理价值转成公共可读性。例如，一些医学、法律、科技议题若没有高质量科普，就难以进入公共讨论，更谈不上形成社会共识。从这个意义上说，“转”常常是“专”走向社会的桥梁。",
      "但“常常需要”不等于“必定要”。第一，有些作品并非靠高频转发获得生命力，而是凭借思想密度在教育、研究、出版体系中长期流通，最终完成“传”。第二，若“转”的过程只追求流量效果，专业内容会被切碎、扁平化，甚至被误读。此时，路径虽然经过了“转”，却未必抵达“传”，反而可能让公共讨论停留在情绪层。可见，决定“传”与否的，不是是否被转发，而是转化质量与价值厚度。",
      "进一步看，真正需要追问的是：怎样的“转”能够服务“传”？我认为至少有三条标准。其一，不失真：核心概念、关键证据、因果关系不能被偷换。其二，有结构：不是零散摘句，而是把问题背景、观点争议、适用边界讲完整。其三，有责任：传播者应当意识到自己的公共影响，避免把复杂问题包装成简单对立。只有满足这些条件，“转”才不是噪音放大器，而是公共理性建设的一环。",
      "回到题目，我的结论是：由“专”到“传”，并不必定经过“转”，但在当代传播环境中，高质量“转”是最常见、也最值得建设的中间机制。我们既要反对“唯转发量论”，也要反对“专业自我封闭”。真正有生命力的表达，应当在专业深度与公共可达之间建立张力平衡，让知识既能向下扎根，也能向上沉淀。如此，“专”才能不止于圈层，“传”也才不会沦为空名。"
    ];

    const extPool = [
      "这道题对写作者的要求，不是给出单线答案，而是说明“何时需要转、何时不必转、怎样转得好”。",
      "如果把“转”理解为降格迎合，就会错失“传播即再创造”的积极意义；如果把“专”理解为自我封闭，也会让知识失去公共价值。",
      "所以，高分论证的关键是条件化判断：承认路径的多样性，同时提出可检验的质量标准。"
    ];

    let essay = paragraphs.map(ensurePeriod).join("\n\n");
    essay = padToMin(essay, 800, extPool);
    essay = trimToMax(essay, 850);
    return essay;
  }

  function buildEssayFor2022() {
    const paragraphs = [
      "“小时候人们喜欢发问，长大后往往看重结论。”这句话之所以引发分歧，是因为它触及了成长中的认知变化：我们到底是在变得成熟，还是在变得迟钝？有人担忧“发问力”衰退，有人认为“重结论”只是现实要求。我认为，两种看法都抓住了部分事实，但都不能绝对化。真正的问题不在“发问还是结论”，而在二者是否形成良性循环。",
      "先说“担忧”为何成立。发问并不只是提问题，它代表的是问题意识：敢于追问前提、证据与边界。若一个人长期只接收现成结论，不问来路与适用条件，思考就容易退化成态度选择。尤其在信息密度极高的时代，结论以极快速度涌来，若没有发问能力，个体很容易把“多数声音”当“可靠判断”。从这个意义上说，对“只重结论”的担忧，不是情绪化焦虑，而是对思维质量的保护。",
      "但“觉得正常”也并非没有道理。成长意味着责任增加、任务并行、决策时限压缩，人在现实中确实需要阶段性结论来推动行动。若永远停在追问而不落地，思考会沦为空转，行动也会失去方向。因此，重视结论本身并不是问题，问题在于把结论当终点，拒绝修订与复盘。真正成熟的结论，应当允许被更新，而不是被神圣化。",
      "更可取的路径，是让“发问”与“结论”构成闭环：先通过发问厘清问题，再形成可执行结论，再在实践反馈中继续发问。课堂学习如此，社会生活亦如此。面对任何观点，我们既要问“它是真的吗”，也要问“它在什么条件下成立”。当追问能够进入结论，结论又反哺追问，人的认知才会从被动接受走向主动建构。",
      "回到题目，我的立场是：担忧有必要，正常也成立；关键在于不让任何一端走向绝对。教育真正要培养的，不是“快速作答”，而是“提问力、判断力、修正力”的并行能力。只有既敢发问、又能形成结论、还愿意修正结论，思考才不会浅薄，成长也才真正发生。"
    ];
    const extPool = [
      "这道题筛选的，不是立场是否新奇，而是论证是否完整、边界是否清楚。",
      "高分作文的核心，从来不是“说得响亮”，而是“说得准确”。"
    ];
    let essay = paragraphs.map(ensurePeriod).join("\n\n");
    essay = padToMin(essay, 800, extPool);
    essay = trimToMax(essay, 850);
    return essay;
  }

  function buildGenericEssay(topic) {
    const type = detectType(topic);
    const paragraphs = [
      `面对“${topic}”，最容易出现的写法是快速表态，但这往往会让论证停在直觉层。`,
      "我更倾向于先界定核心概念，再讨论其成立前提、作用机制与适用边界。",
      type === "relation"
        ? "关系题的关键不在二选一，而在解释两端如何互相制约、互相成全。"
        : "高质量判断不应是口号，而应能回答“为何成立、何时成立、何处失效”。",
      "回到题目，真正有效的结论应该是条件化、可检验、可修正的。"
    ];
    const extPool = [
      "因此，审题、立意、论证、收束必须形成闭环，文章才会有说服力。",
      "只有把观点放进现实场景反复检验，写作才能从“会说”走向“会思考”。",
      "这也是上海作文命题的核心：在复杂关系中保持清醒，在真实生活中完成判断。"
    ];
    let essay = paragraphs.map(ensurePeriod).join("\n\n");
    essay = padToMin(essay, 800, extPool);
    essay = trimToMax(essay, 850);
    return essay;
  }

  function buildEssay(topic) {
    if (isTopic2025(topic)) return buildEssayFor2025(topic);
    if (isTopic2022(topic)) return buildEssayFor2022(topic);
    return buildGenericEssay(topic);
  }

  function renderResult(topic, essay) {
    const result = document.getElementById("agentResult");
    if (!result) return;
    const wc = countWordsLike(essay);
    let scoreText = "主评分器未加载";
    let riskText = "主防跑题未加载";

    try {
      if (typeof window.scoreEssayDraft === "function") {
        const s = window.scoreEssayDraft(topic, essay);
        scoreText = `${s.total}/100（${s.score70}/70，${s.level}）`;
      }
    } catch (_) {}

    try {
      if (typeof window.runOffTopicCheck === "function") {
        const r = window.runOffTopicCheck(topic, essay);
        riskText = `${r.riskLevel}（${r.riskScore}/100）`;
      }
    } catch (_) {}

    result.innerHTML = `
      <div class="agent-result-head">
        <h3>完整范文已生成（重构版）</h3>
        <div class="agent-tags">
          <span class="agent-tag">字数：${wc}</span>
          <span class="agent-tag">评分：${scoreText}</span>
          <span class="agent-tag">偏题风险：${riskText}</span>
        </div>
      </div>
      <div class="agent-result-block">
        <p>已写入草稿框，可继续点击“草稿评分/防跑题检查/一键提分改写”。</p>
      </div>
    `;
  }

  window.quickGenerateEssay = () => {
    const topicInput = document.getElementById("essayTopicInput");
    const draftInput = document.getElementById("essayDraftInput");
    const result = document.getElementById("agentResult");
    if (!topicInput || !draftInput) return;

    const topic = String(topicInput.value || "").trim();
    if (!topic) {
      if (result) result.innerHTML = '<p class="agent-empty">请先输入作文题目。</p>';
      return;
    }

    const essay = buildEssay(topic);
    draftInput.value = essay;

    try {
      if (typeof window.updateExamWordCountDisplay === "function") {
        window.updateExamWordCountDisplay(draftInput, document.getElementById("examWordCount"));
      } else {
        const el = document.getElementById("examWordCount");
        if (el) el.textContent = `${countWordsLike(essay)} / 800`;
      }
    } catch (_) {}

    renderResult(topic, essay);
  };

  function hardBindButton() {
    const btn = document.getElementById("generateFullEssayBtn");
    if (!btn) return;
    btn.dataset.quickGen = "ready";
    btn.onclick = () => {
      window.quickGenerateEssay();
      return false;
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hardBindButton);
  } else {
    hardBindButton();
  }
})();

