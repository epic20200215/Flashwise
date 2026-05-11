import {
  dueCards,
  exportCsv,
  generateCardsFromText,
  gradeAnswer,
  makeOptions,
  mastery,
  scheduleCard,
  seedText
} from './core.js';

const storageKey = 'flashwise-state-v1';
const avatarFemale = './images/profilepicture-female.png';
const avatarMale = './images/profilepicture-male.png';
const ipImage = './images/ip_ocki.png';

const defaultState = {
  tab: 'today',
  mode: 'choice',
  importText: seedText,
  selectedDeck: 'deck_ai',
  quizIndex: 0,
  answerDraft: '',
  selectedOption: '',
  showResult: false,
  lastCorrect: null,
  minorMode: false,
  cards: generateCardsFromText(seedText, '闪学示例卡组'),
  groups: [
    {
      id: 'group_1',
      name: '考前 10 分钟小组',
      challenge: '今晚每人完成 12 张到期卡',
      members: [
        { name: '林同学', xp: 1280, avatar: avatarFemale },
        { name: '周同学', xp: 1185, avatar: avatarMale },
        { name: '我', xp: 1360, avatar: ipImage }
      ]
    }
  ]
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || !Array.isArray(saved.cards)) return defaultState;
    return { ...defaultState, ...saved, importText: saved.importText || seedText };
  } catch {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function render() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <main class="shell">
      ${renderHeader()}
      ${renderTabs()}
      <section class="screen">${renderScreen()}</section>
      ${renderMobileNav()}
    </main>
  `;
  bindEvents();
}

function renderHeader() {
  const due = dueCards(state.cards).length;
  return `
    <header class="topbar">
      <div class="brand">
        <img src="./images/icon.png" alt="闪学图标" />
        <div>
          <strong>闪学</strong>
          <span>Flashwise</span>
        </div>
      </div>
      <div class="top-actions">
        <button class="ghost" data-action="export">导出</button>
        <button class="pill" data-tab="import">导入资料</button>
      </div>
      <div class="due-badge">${due} 到期</div>
    </header>
  `;
}

function renderTabs() {
  const tabs = [
    ['today', '今日'],
    ['import', '导入'],
    ['study', '练习'],
    ['group', '小组'],
    ['profile', '我的']
  ];
  return `
    <nav class="tabs" aria-label="主导航">
      ${tabs
        .map(
          ([key, label]) =>
            `<button class="${state.tab === key ? 'active' : ''}" data-tab="${key}">${label}</button>`
        )
        .join('')}
    </nav>
  `;
}

function renderMobileNav() {
  return renderTabs().replace('class="tabs"', 'class="bottom-tabs"');
}

function renderScreen() {
  if (state.tab === 'import') return renderImport();
  if (state.tab === 'study') return renderStudy();
  if (state.tab === 'group') return renderGroup();
  if (state.tab === 'profile') return renderProfile();
  return renderToday();
}

function renderToday() {
  const due = dueCards(state.cards);
  const mastered = mastery(state.cards);
  return `
    <div class="hero-grid">
      <section class="panel hero-panel">
        <div class="hero-copy">
          <p class="eyebrow">今天的学习任务</p>
          <h1>上传资料，马上开考。</h1>
          <p>闪学会把资料拆成可追溯卡片，用 FSRS 风格调度和考试日期权重帮你复习。</p>
          <div class="hero-actions">
            <button class="primary" data-tab="study">开始 ${Math.max(due.length, 1)} 张复习</button>
            <button class="secondary" data-tab="import">生成新卡组</button>
          </div>
        </div>
        <img class="mascot" src="${ipImage}" alt="闪学 IP 形象" />
      </section>
      <aside class="panel stats-panel">
        ${stat('掌握率', `${mastered}%`, '来源可追溯')}
        ${stat('到期卡片', `${due.length}`, '优先复习')}
        ${stat('连续学习', '7 天', state.minorMode ? '未成年人保护中' : '成人模式')}
      </aside>
    </div>
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">复习队列</p>
          <h2>先处理快遗忘的卡片</h2>
        </div>
        <button class="ghost" data-tab="study">查看全部</button>
      </div>
      <div class="card-list">
        ${(due.length ? due : state.cards.slice(0, 4)).map(renderCardPreview).join('')}
      </div>
    </section>
  `;
}

function stat(label, value, note) {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

function renderCardPreview(card) {
  return `
    <article class="study-card">
      <div class="tag-row">${card.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <h3>${card.question}</h3>
      <p>${card.source}</p>
      <div class="card-meta">
        <span>稳定度 ${card.stability}</span>
        <span>难度 ${card.difficulty}</span>
      </div>
    </article>
  `;
}

function renderImport() {
  return `
    <section class="panel import-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">智能导入</p>
          <h2>粘贴笔记，生成带来源的闪卡</h2>
        </div>
        <span class="safe-label">AI 生成仅供学习参考</span>
      </div>
      <textarea id="importText" rows="10" placeholder="粘贴课堂笔记、PDF 文字、错题解析或考试资料...">${escapeHtml(
        state.importText
      )}</textarea>
      <div class="import-actions">
        <button class="primary" data-action="generate">生成闪卡</button>
        <button class="secondary" data-action="sample">填入示例</button>
      </div>
    </section>
    <section class="panel">
      <h2>最近生成</h2>
      <div class="card-list">${state.cards.slice(0, 6).map(renderCardPreview).join('')}</div>
    </section>
  `;
}

function renderStudy() {
  const queue = dueCards(state.cards);
  const cards = queue.length ? queue : state.cards;
  const card = cards[state.quizIndex % cards.length];
  if (!card) return `<section class="panel empty">还没有卡片。<button class="primary" data-tab="import">去导入</button></section>`;
  const options = makeOptions(card, state.cards);
  return `
    <section class="panel quiz-panel">
      <div class="quiz-top">
        <div>
          <p class="eyebrow">主动回忆</p>
          <h2>${state.mode === 'flip' ? '先想答案，再翻卡' : state.mode === 'type' ? '输入答案' : '选择正确答案'}</h2>
        </div>
        <div class="mode-switch">
          ${['choice', 'type', 'flip']
            .map((mode) => `<button class="${state.mode === mode ? 'active' : ''}" data-mode="${mode}">${modeLabel(mode)}</button>`)
            .join('')}
        </div>
      </div>
      <article class="question-card">
        <div class="tag-row">${card.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <h1>${card.question}</h1>
        ${renderAnswerInput(card, options)}
        ${state.showResult ? renderResult(card) : ''}
      </article>
    </section>
  `;
}

function modeLabel(mode) {
  return { choice: '选择', type: '填空', flip: '翻卡' }[mode];
}

function renderAnswerInput(card, options) {
  if (state.mode === 'choice') {
    return `
      <div class="options">
        ${options
          .map(
            (option) => `
              <button class="${state.selectedOption === option ? 'selected' : ''}" data-option="${escapeAttr(option)}">
                ${option}
              </button>
            `
          )
          .join('')}
      </div>
      <button class="primary full" data-action="submit-choice">提交答案</button>
    `;
  }
  if (state.mode === 'type') {
    return `
      <input id="answerInput" class="answer-input" value="${escapeAttr(state.answerDraft)}" placeholder="输入你回忆出的关键词" />
      <button class="primary full" data-action="submit-type">提交答案</button>
    `;
  }
  return `
    <button class="primary full" data-action="reveal">显示答案</button>
  `;
}

function renderResult(card) {
  const correct = state.lastCorrect;
  return `
    <div class="result ${correct ? 'correct' : 'wrong'}">
      <strong>${correct ? '答对了' : '需要回炉'}</strong>
      <p>答案：${card.answer}</p>
      <p>${card.explanation}</p>
      <blockquote>${card.source}</blockquote>
      <div class="rating-row">
        <button data-rating="1">再来</button>
        <button data-rating="2">困难</button>
        <button data-rating="3">记住</button>
        <button data-rating="4">很熟</button>
      </div>
    </div>
  `;
}

function renderGroup() {
  const group = state.groups[0];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">学习小组</p>
          <h2>${group.name}</h2>
        </div>
        <button class="secondary">邀请同学</button>
      </div>
      <div class="challenge">${group.challenge}</div>
      <div class="leaderboard">
        ${group.members
          .sort((a, b) => b.xp - a.xp)
          .map(
            (member, index) => `
              <div class="leader">
                <span class="rank">${index + 1}</span>
                <img src="${member.avatar}" alt="${member.name}" />
                <strong>${member.name}</strong>
                <span>${member.xp} XP</span>
              </div>
            `
          )
          .join('')}
      </div>
    </section>
    <section class="panel">
      <h2>小组共享卡组</h2>
      <div class="card-list">${state.cards.slice(0, 3).map(renderCardPreview).join('')}</div>
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="panel profile-panel">
      <div class="profile-head">
        <img src="${ipImage}" alt="闪学 IP" />
        <div>
          <p class="eyebrow">数据与合规</p>
          <h2>我的闪学</h2>
          <p>本版本为本地优先体验，学习数据保存在浏览器本机。</p>
        </div>
      </div>
      <div class="settings-list">
        <label><input type="checkbox" data-action="minor" ${state.minorMode ? 'checked' : ''} /> 未成年人保护模式</label>
        <div><strong>AI 标识</strong><span>所有生成内容均标记为学习参考，并保留来源片段。</span></div>
        <div><strong>隐私</strong><span>上传资料不用于训练模型；可一键清空本地数据。</span></div>
      </div>
      <div class="import-actions">
        <button class="secondary" data-action="reset">清空本地数据</button>
        <button class="ghost" data-action="export">导出 CSV</button>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setState({ tab: button.dataset.tab, showResult: false }));
  });
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setState({ mode: button.dataset.mode, showResult: false }));
  });
  document.querySelectorAll('[data-option]').forEach((button) => {
    button.addEventListener('click', () => setState({ selectedOption: button.dataset.option }));
  });
  const importText = document.querySelector('#importText');
  if (importText) importText.addEventListener('input', (event) => (state.importText = event.target.value));
  const answerInput = document.querySelector('#answerInput');
  if (answerInput) answerInput.addEventListener('input', (event) => (state.answerDraft = event.target.value));
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleAction(button.dataset.action));
  });
  document.querySelectorAll('[data-rating]').forEach((button) => {
    button.addEventListener('click', () => applyRating(Number(button.dataset.rating)));
  });
}

function handleAction(action) {
  if (action === 'generate') {
    const text = document.querySelector('#importText')?.value || state.importText;
    const cards = generateCardsFromText(text, '我的智能卡组');
    setState({ cards: [...cards, ...state.cards], importText: text, tab: 'study', quizIndex: 0, showResult: false });
  }
  if (action === 'sample') setState({ importText: seedText });
  if (action === 'submit-choice') {
    const card = currentCard();
    setState({ showResult: true, lastCorrect: state.selectedOption === card.answer });
  }
  if (action === 'submit-type') {
    const card = currentCard();
    setState({ showResult: true, lastCorrect: gradeAnswer(state.answerDraft, card.answer) });
  }
  if (action === 'reveal') setState({ showResult: true, lastCorrect: true });
  if (action === 'minor') setState({ minorMode: !state.minorMode });
  if (action === 'reset' && confirm('确定清空本地学习数据？')) {
    localStorage.removeItem(storageKey);
    state = defaultState;
    saveState();
    render();
  }
  if (action === 'export') downloadCsv();
}

function currentCard() {
  const cards = dueCards(state.cards);
  const queue = cards.length ? cards : state.cards;
  return queue[state.quizIndex % queue.length];
}

function applyRating(rating) {
  const card = currentCard();
  const updated = scheduleCard(card, rating);
  const cards = state.cards.map((item) => (item.id === card.id ? updated : item));
  setState({
    cards,
    quizIndex: state.quizIndex + 1,
    answerDraft: '',
    selectedOption: '',
    showResult: false,
    lastCorrect: null
  });
}

function downloadCsv() {
  const blob = new Blob([exportCsv(state.cards)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'flashwise-cards.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

render();
