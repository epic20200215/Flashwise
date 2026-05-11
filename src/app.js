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

const storageKey = 'flashwise-state-v3';
const ipImage = './images/ip_ocki.png';
const avatarFemale = './images/profilepicture-female.png';
const avatarMale = './images/profilepicture-male.png';

const courseOptions = ['History', 'Geography', 'Biology', 'English', '考研政治', '大学英语四级', '教师资格证', '公务员行测', '法考民法'];

const publicDecks = [
  ['考研英语 高频词根', 86, '考研', '英语', '+3', '#7c83ff'],
  ['中国近现代史纲要', 72, '考研', '政治', '+2', '#97eb2f'],
  ['教资 科目二教育心理', 54, '教资', '教育学', '+2', '#ff9a3d'],
  ['公考常识 判断推理', 128, '公考', '行测', '+4', '#ff5b73'],
  ['大学英语四级核心短语', 93, 'CET4', '英语', '+1', '#32c9f4'],
  ['法考 民法基础概念', 64, '法考', '民法', '+2', '#21d6b5'],
  ['高中生物 细胞代谢', 110, '高中', '生物', '+2', '#f971c8']
];

const leaderboard = [
  ['alicia', '155k XP', avatarFemale, '1'],
  ['Scarlett', '55k XP', avatarMale, '2'],
  ['Sophia wu', '9.8k XP', avatarFemale, '3'],
  ['Isa Chen', '1.5k XP', avatarMale, '4'],
  ['Alex Chiu', '815 XP', avatarFemale, '5'],
  ['Rachel Park', '450 XP', avatarMale, '6'],
  ['Neela S', '400 XP', avatarFemale, '7'],
  ['evan g', '355 XP', avatarMale, '8']
];

const defaultState = {
  tab: 'home',
  deckTab: 'my',
  mode: 'choice',
  activeSubject: 'History',
  subjectQuery: '',
  addSheetOpen: false,
  subjectSheetOpen: false,
  createType: 'cards',
  selectedSource: 'paste',
  importText: seedText,
  urlDraft: '',
  noteTitle: '',
  noteBody: '',
  photoDraft: null,
  materialName: '',
  quizIndex: 0,
  answerDraft: '',
  selectedOption: '',
  showResult: false,
  lastCorrect: null,
  editingCardId: '',
  minorMode: false,
  xp: 150,
  level: 3,
  streak: 1,
  notes: [],
  cards: generateCardsFromText(seedText, 'History')
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || !Array.isArray(saved.cards)) return defaultState;
    return { ...defaultState, ...saved, notes: Array.isArray(saved.notes) ? saved.notes : [] };
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
  document.querySelector('#app').innerHTML = `
    <main class="app-shell">
      ${renderScreen()}
      ${renderOverlays()}
      ${renderBottomNav()}
    </main>
  `;
  bindEvents();
}

function renderScreen() {
  if (state.tab === 'progress') return renderProgress();
  if (state.tab === 'add') return renderAdd();
  if (state.tab === 'decks') return renderDecks();
  if (state.tab === 'profile') return renderProfile();
  if (state.tab === 'quiz') return renderQuiz();
  return renderHome();
}

function renderOverlays() {
  return `${state.subjectSheetOpen ? renderSubjectSheet() : ''}${state.addSheetOpen ? renderAddSheet() : ''}`;
}

function renderBottomNav() {
  const tabs = [
    ['home', '🏠', 'Home'],
    ['progress', '🔥', 'Progress'],
    ['add', state.addSheetOpen ? '×' : '✚', state.addSheetOpen ? 'Close' : 'Add'],
    ['decks', '📁', 'Decks'],
    ['profile', '🐙', 'Profile']
  ];
  return `
    <nav class="bottom-nav" aria-label="主导航">
      ${tabs
        .map(([key, icon, label]) => {
          const active = state.tab === key || (key === 'add' && state.addSheetOpen);
          const action = key === 'add' ? 'data-action="toggle-add-sheet"' : `data-tab="${key}"`;
          return `
            <button class="${active ? 'active' : ''} ${key === 'add' ? 'add-tab' : ''}" ${action}>
              <span>${icon}</span>
              <small>${label}</small>
            </button>
          `;
        })
        .join('')}
    </nav>
  `;
}

function renderHome() {
  const due = dueCards(state.cards);
  const cardsByDeck = deckGroups();
  return `
    <section class="screen home-screen">
      ${statusBar('8:42')}
      <button class="subject-chip" data-action="open-subject-sheet">⏱️ ${escapeHtml(state.activeSubject)}</button>
      <img class="home-mascot" src="${ipImage}" alt="闪学 IP" />
      <h1 class="home-title">今天学什么？</h1>
      <section class="study-prompt" data-action="toggle-add-sheet">
        <div>
          <span>我想学习...</span>
          <strong>${state.importText ? shortText(state.importText, 18) : '上传课件、笔记或错题'}</strong>
        </div>
        <b>＋</b>
      </section>
      <div class="upload-grid">
        ${uploadButton('📁', 'Deck', 'decks')}
        ${sourceButton('⬆️', 'Upload', 'file')}
        ${sourceButton('📷', 'Photo', 'photo')}
        ${sourceButton('🎬', 'Video', 'video')}
        ${sourceButton('📋', 'Paste', 'paste')}
        ${sourceButton('⌄', 'More', 'paste')}
      </div>
      <section class="section-block">
        <h2>Jump back in</h2>
        <article class="jump-card" data-tab="quiz">
          <div class="progress-ring">${mastery(state.cards)}%</div>
          <div>
            <strong>${cardsByDeck[0]?.title || '智能导入卡组'}</strong>
            <span>${due.length || state.cards.length} questions ready</span>
          </div>
        </article>
      </section>
      <section class="section-block">
        <div class="section-row">
          <h2>热门课程卡组</h2>
          <button data-tab="decks">查看</button>
        </div>
        <div class="deck-carousel">${publicDecks.slice(0, 3).map(renderDeckMini).join('')}</div>
      </section>
      <section class="section-block">
        <div class="section-row">
          <h2>我的卡组</h2>
          <button data-action="toggle-add-sheet">＋</button>
        </div>
        ${cardsByDeck.map(renderDeckRow).join('')}
      </section>
      ${state.notes.length ? renderRecentNotes() : ''}
    </section>
  `;
}

function renderSubjectSheet() {
  const query = state.subjectQuery.trim().toLowerCase();
  const options = courseOptions.filter((item) => item.toLowerCase().includes(query));
  return `
    <div class="sheet-dim">
      <section class="bottom-sheet subject-sheet">
        <header class="sheet-header">
          <span></span>
          <h2>${escapeHtml(state.activeSubject)}</h2>
          <button data-action="close-subject-sheet">×</button>
        </header>
        <label class="search-box">
          <span>⌕</span>
          <input id="subjectSearch" value="${escapeAttr(state.subjectQuery)}" placeholder="Search" />
        </label>
        <div class="subject-results">
          ${options
            .map(
              (item) => `
                <button class="${item === state.activeSubject ? 'selected' : ''}" data-subject="${escapeAttr(item)}">
                  <strong>${escapeHtml(item)}</strong>
                  <span>${item === state.activeSubject ? '当前课程' : '切换课程'}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>
    </div>
  `;
}

function renderAddSheet() {
  return `
    <div class="sheet-dim">
      <section class="bottom-sheet add-choice-sheet">
        <button class="sheet-close-float" data-action="toggle-add-sheet">×</button>
        <button class="create-choice ${state.createType === 'cards' ? 'selected' : ''}" data-create-type="cards">
          <span>▱</span>
          <div><strong>Cards</strong><small>Create flashcards</small></div>
        </button>
        <button class="create-choice ${state.createType === 'notes' ? 'selected' : ''}" data-create-type="notes">
          <span>✎</span>
          <div><strong>Notes</strong><small>Create freeform notes</small></div>
        </button>
        <button class="dark-cta" data-action="continue-create">Continue</button>
      </section>
    </div>
  `;
}

function statusBar(time) {
  return `
    <div class="status-bar">
      <span>${time}</span>
      <span>HD ▮▮▮  WiFi  87% ●</span>
    </div>
  `;
}

function uploadButton(icon, label, tab) {
  return `
    <button class="upload-pill" data-tab="${tab}">
      <span>${icon}</span>
      <strong>${label}</strong>
    </button>
  `;
}

function sourceButton(icon, label, source) {
  return `
    <button class="upload-pill" data-open-source="${source}">
      <span>${icon}</span>
      <strong>${label}</strong>
    </button>
  `;
}

function renderDeckMini(deck) {
  const [title, count, level, subject, extra, color] = deck;
  return `
    <article class="deck-mini">
      <i style="background:${color}"></i>
      <strong>${title}</strong>
      <span>${count} cards</span>
      <div><small>${level}</small><small>${subject}</small><small>${extra}</small></div>
    </article>
  `;
}

function renderDeckRow(deck) {
  return `
    <article class="deck-row" data-tab="quiz">
      <i style="background:${deck.color}"></i>
      <div>
        <strong>${escapeHtml(deck.title)}</strong>
        <span>${deck.count} cards</span>
      </div>
      <b>⋮</b>
    </article>
  `;
}

function renderRecentNotes() {
  return `
    <section class="section-block">
      <div class="section-row"><h2>Notes</h2><button data-tab="add">＋</button></div>
      ${state.notes.slice(0, 3).map(renderNoteCard).join('')}
    </section>
  `;
}

function renderNoteCard(note) {
  return `
    <article class="note-card">
      ${note.image ? `<img src="${note.image}" alt="${escapeAttr(note.title)}" />` : ''}
      <div>
        <strong>${escapeHtml(note.title)}</strong>
        <span>${escapeHtml(shortText(note.body, 42))}</span>
      </div>
    </article>
  `;
}

function renderProgress() {
  return `
    <section class="screen progress-screen">
      ${statusBar('8:42')}
      <header class="level-card">
        <img src="${ipImage}" alt="闪学 IP" />
        <div>
          <strong>Novice</strong>
          <span>${state.xp % 100 || 50} XP</span>
        </div>
        <b>Level ${state.level}: ${state.xp} XP</b>
      </header>
      <section class="section-block">
        <h2>Start your streak!</h2>
        <article class="streak-card">
          <div>🔥</div>
          <strong>2 questions</strong>
          <span>to start your streak</span>
        </article>
        <div class="calendar-row">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => `<b>${day}</b>`).join('')}</div>
        <div class="calendar-grid">${Array.from({ length: 14 }, (_, index) => `<span class="${index === 8 ? 'today' : ''}">${index + 3}</span>`).join('')}</div>
        <button class="dark-cta" data-tab="quiz">🎮 Start streak</button>
      </section>
      <section class="section-block">
        <h2>Jump back in</h2>
        <article class="jump-card" data-tab="quiz">
          <div class="progress-ring">${mastery(state.cards)}%</div>
          <div><strong>${deckGroups()[0]?.title || '我的卡组'}</strong><span>Quiz</span></div>
        </article>
      </section>
      <section class="section-block">
        <h2>Deck progress</h2>
        <article class="jump-card">
          <div class="progress-ring">${mastery(state.cards)}%</div>
          <div><strong>${deckGroups()[0]?.title || '我的卡组'}</strong><span>${masteryCount()} of ${state.cards.length} cards mastered</span></div>
        </article>
      </section>
      <section class="section-block">
        <h2>Your friends leaderboard</h2>
        <div class="leader-tabs"><button>Day</button><button>Week</button><button>Month</button><button class="active">All Time</button></div>
        <div class="leaderboard">${leaderboard.map(renderLeader).join('')}</div>
        <button class="dark-cta">👥 Find friends</button>
      </section>
      <section class="section-block">
        <div class="section-row"><h2>Your study groups</h2><button>＋</button></div>
        <article class="group-card">
          <div class="faces"><span>🐬</span><span>🧠</span><span>🐸</span><span>💀</span></div>
          <strong>Study with friends</strong>
          <span>Learn and study together</span>
          <button class="dark-cta">Create group</button>
        </article>
      </section>
      <section class="section-block">
        <h2>Following</h2>
        ${renderFeed('tianxuo chen', 'Level 2!', '💎', '10 days ago')}
        ${renderFeed('alicia', '2 day streak!', '🔥', '58 days ago', 'emerald')}
        ${renderFeed('Isa Chen', '1 day streak!', '🔥', '81 days ago', 'gold')}
      </section>
    </section>
  `;
}

function renderLeader(item) {
  const [name, xp, avatar, rank] = item;
  return `
    <div class="leader-row">
      <b>${rank}</b>
      <img src="${avatar}" alt="${name}" />
      <strong>${name}</strong>
      <span>${xp}</span>
    </div>
  `;
}

function renderFeed(name, text, icon, time, variant = '') {
  return `
    <article class="feed-card">
      <header><img src="${avatarFemale}" alt="${name}" /><div><strong>${name}</strong><span>${time}</span></div></header>
      <div class="feed-badge ${variant}"><strong>${text}</strong><b>${icon}</b></div>
      <footer><button>♡ 1</button><button>☺︎</button></footer>
    </article>
  `;
}

function renderAdd() {
  const isNotes = state.createType === 'notes';
  return `
    <section class="screen add-screen">
      ${statusBar('8:42')}
      <header class="page-title">
        <button data-tab="home">‹</button>
        <h1>${isNotes ? 'Create notes' : 'Create flashcards'}</h1>
        <button data-action="toggle-add-sheet">＋</button>
      </header>
      <section class="add-hero">
        <div class="plus-orb">${isNotes ? '✎' : '＋'}</div>
        <h2>${isNotes ? '写下自由笔记' : '上传资料，马上开考'}</h2>
        <p>${isNotes ? 'Notes 会保存为可复习材料，稍后可一键转成卡片。' : 'Cards 会把资料变成可追溯闪卡和 Quiz。'}</p>
      </section>
      ${isNotes ? renderNotesComposer() : renderCardsComposer()}
    </section>
  `;
}

function renderCardsComposer() {
  return `
    <div class="source-grid">
      ${sourceTile('📄', '文件上传', 'PDF / Word / TXT', 'file')}
      ${sourceTile('📷', '拍照识别', '手写笔记 / 错题', 'photo')}
      ${sourceTile('📋', '粘贴文本', '课堂笔记 / 公众号', 'paste')}
      ${sourceTile('🎬', '视频链接', 'B 站 / 网课摘要', 'video')}
    </div>
    <section class="upload-composer">
      ${renderSourceInput()}
      <button class="primary-cta" data-action="generate">AI 生成闪卡和测验</button>
    </section>
    <section class="pipeline">
      <h2>生成后你会得到</h2>
      <div><span>1</span><strong>关键知识点</strong><small>自动拆分章节和概念</small></div>
      <div><span>2</span><strong>多题型 Quiz</strong><small>选择、填空、翻卡主动回忆</small></div>
      <div><span>3</span><strong>游戏化复习</strong><small>XP、streak、排行榜、到期复习</small></div>
    </section>
  `;
}

function renderSourceInput() {
  if (state.selectedSource === 'file') {
    return `
      <label class="file-button">
        ${state.materialName ? escapeHtml(state.materialName) : '选择文本文件'}
        <input id="fileInput" type="file" accept=".txt,.md,.csv,.json,.html,text/plain,text/markdown,text/csv" />
      </label>
      <textarea id="importText" rows="7" placeholder="文件读取后会显示在这里，也可以直接编辑...">${escapeHtml(state.importText)}</textarea>
    `;
  }
  if (state.selectedSource === 'photo') {
    return `
      <label class="file-button">
        ${state.photoDraft?.name ? escapeHtml(state.photoDraft.name) : '选择照片'}
        <input id="photoInput" type="file" accept="image/*" />
      </label>
      ${state.photoDraft?.image ? `<img class="photo-preview" src="${state.photoDraft.image}" alt="${escapeAttr(state.photoDraft.name)}" />` : ''}
      <textarea id="importText" rows="6" placeholder="补充图片中的文字或要记忆的内容...">${escapeHtml(state.importText)}</textarea>
    `;
  }
  if (state.selectedSource === 'video') {
    return `
      <input id="urlInput" class="answer-input" value="${escapeAttr(state.urlDraft)}" placeholder="粘贴 B 站 / 网课 / YouTube 链接" />
      <textarea id="importText" rows="6" placeholder="补充视频标题、字幕、笔记或要学习的片段...">${escapeHtml(state.importText)}</textarea>
    `;
  }
  return `
    <textarea id="importText" rows="9" placeholder="粘贴课堂笔记、错题解析、讲义正文...">${escapeHtml(state.importText)}</textarea>
  `;
}

function renderNotesComposer() {
  return `
    <section class="upload-composer">
      <input id="noteTitle" class="answer-input" value="${escapeAttr(state.noteTitle)}" placeholder="笔记标题" />
      <textarea id="noteBody" rows="10" placeholder="写自由笔记，可以稍后转成闪卡...">${escapeHtml(state.noteBody)}</textarea>
      <button class="primary-cta" data-action="save-note">保存 Notes</button>
    </section>
    <section class="section-block">
      <h2>已有 Notes</h2>
      ${state.notes.length ? state.notes.map(renderNoteCard).join('') : '<p class="empty-copy">还没有笔记，先创建一条。</p>'}
    </section>
  `;
}

function sourceTile(icon, title, subtitle, source) {
  return `
    <button class="source-tile ${state.selectedSource === source ? 'selected' : ''}" data-select-source="${source}">
      <b>${icon}</b>
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </button>
  `;
}

function renderDecks() {
  return `
    <section class="screen decks-screen">
      ${statusBar('8:42')}
      <header class="page-title">
        <span></span>
        <h1>Decks</h1>
        <button>⌕</button>
      </header>
      <div class="deck-tabs">
        <button class="${state.deckTab === 'my' ? 'active' : ''}" data-deck-tab="my">My decks</button>
        <button class="${state.deckTab === 'public' ? 'active' : ''}" data-deck-tab="public">Public decks</button>
      </div>
      ${state.deckTab === 'public' ? renderPublicDecks() : renderMyDecks()}
      <button class="floating-add" data-action="toggle-add-sheet">＋</button>
    </section>
  `;
}

function renderMyDecks() {
  const groups = deckGroups();
  return `
    <div class="deck-list">
      ${groups.map(renderDeckRow).join('')}
      ${state.notes.length ? '<h2 class="deck-subtitle">Notes</h2>' : ''}
      ${state.notes.map(renderNoteCard).join('')}
      <button class="official-search">⌕ Find official course decks</button>
    </div>
  `;
}

function renderPublicDecks() {
  return `
    <div class="filter-row"><button>Level⌄</button><button>Subject⌄</button><button>School⌄</button></div>
    <div class="popular-chip">📈 Popular at “中国大陆学习社区”</div>
    <div class="deck-list">${publicDecks.map(renderDeckMini).join('')}</div>
  `;
}

function renderProfile() {
  return `
    <section class="screen profile-screen">
      ${statusBar('8:42')}
      <header class="page-title">
        <button data-tab="home">‹</button>
        <h1>Edit profile</h1>
        <span></span>
      </header>
      <section class="avatar-edit">
        <img src="${ipImage}" alt="闪学头像" />
        <button>✎</button>
      </section>
      <section class="settings-card">
        ${settingRow('👤', 'Name', '闪学用户')}
        ${settingRow('🇨🇳', 'Country', 'China Mainland')}
      </section>
      <section class="settings-card">
        ${settingRow('🏫', 'School', '未设置')}
        ${settingRow('📚', 'Course', state.activeSubject)}
        ${settingRow('🧭', 'Year', '2026 备考')}
      </section>
      <button class="outline-wide">Remove education</button>
      <section class="privacy-row">
        <span>🔒 Private profile</span>
        <label><input type="checkbox" data-action="minor" ${state.minorMode ? 'checked' : ''} /><i></i></label>
      </section>
      <section class="settings-card">
        ${settingRow('🤖', 'AI 标识', '生成内容仅供学习参考')}
        ${settingRow('🧹', '本地数据', `${state.cards.length} cards / ${state.notes.length} notes`)}
      </section>
      <div class="profile-actions">
        <button class="outline-wide" data-action="export">导出 CSV</button>
        <button class="outline-wide danger" data-action="reset">清空数据</button>
      </div>
    </section>
  `;
}

function settingRow(icon, label, value) {
  return `
    <div class="setting-row">
      <b>${icon}</b>
      <div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>
      <i>›</i>
    </div>
  `;
}

function renderQuiz() {
  const queue = dueCards(state.cards);
  const cards = queue.length ? queue : state.cards;
  const card = cards[state.quizIndex % Math.max(cards.length, 1)];
  if (!card) return `<section class="screen">${statusBar('8:42')}<button data-action="toggle-add-sheet">先上传资料</button></section>`;
  const options = makeOptions(card, state.cards);
  return `
    <section class="screen quiz-screen">
      ${statusBar('8:42')}
      <header class="quiz-header">
        <button data-tab="home">‹</button>
        <div><strong>${state.quizIndex + 1}/${cards.length}</strong><span>+10 XP</span></div>
        <b>🔥 ${state.streak}</b>
      </header>
      <article class="quiz-card">
        <div class="tag-row">${card.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <h1>${card.question}</h1>
        ${renderAnswerInput(card, options)}
        ${state.showResult ? renderResult(card) : ''}
      </article>
      <section class="quiz-tools">
        <button class="${state.mode === 'choice' ? 'active' : ''}" data-mode="choice">选择</button>
        <button class="${state.mode === 'type' ? 'active' : ''}" data-mode="type">填空</button>
        <button class="${state.mode === 'flip' ? 'active' : ''}" data-mode="flip">翻卡</button>
      </section>
      <section class="card-management">
        <h2>卡片管理</h2>
        ${state.cards.slice(0, 4).map(renderManagedCard).join('')}
      </section>
      ${renderEditor()}
    </section>
  `;
}

function renderAnswerInput(card, options) {
  if (state.mode === 'choice') {
    return `
      <div class="options">
        ${options.map((option) => `<button class="${state.selectedOption === option ? 'selected' : ''}" data-option="${escapeAttr(option)}">${escapeHtml(option)}</button>`).join('')}
      </div>
      <button class="primary-cta" data-action="submit-choice">Check answer</button>
    `;
  }
  if (state.mode === 'type') {
    return `
      <input id="answerInput" class="answer-input" value="${escapeAttr(state.answerDraft)}" placeholder="输入你回忆出的答案" />
      <button class="primary-cta" data-action="submit-type">Check answer</button>
    `;
  }
  return `<button class="primary-cta" data-action="reveal">Reveal answer</button>`;
}

function renderResult(card) {
  return `
    <div class="result ${state.lastCorrect ? 'correct' : 'wrong'}">
      <strong>${state.lastCorrect ? 'Correct!' : 'Try again'}</strong>
      <p>答案：${escapeHtml(card.answer)}</p>
      <blockquote>${escapeHtml(card.source)}</blockquote>
      <p>${escapeHtml(card.explanation)}</p>
      <div class="rating-row">
        <button data-rating="1">Again</button>
        <button data-rating="2">Hard</button>
        <button data-rating="3">Good</button>
        <button data-rating="4">Easy</button>
      </div>
    </div>
  `;
}

function renderManagedCard(card) {
  return `
    <article class="managed-card">
      <strong>${escapeHtml(shortText(card.question, 28))}</strong>
      <span>${escapeHtml(card.answer)}</span>
      <div><button data-edit="${card.id}">编辑</button><button class="danger" data-delete="${card.id}">删除</button></div>
    </article>
  `;
}

function renderEditor() {
  const card = state.cards.find((item) => item.id === state.editingCardId);
  if (!card) return '';
  return `
    <div class="editor-backdrop">
      <section class="editor-card">
        <div class="section-row"><h2>编辑卡片</h2><button data-action="close-editor">关闭</button></div>
        <label>题干<textarea id="editQuestion" rows="3">${escapeHtml(card.question)}</textarea></label>
        <label>答案<input id="editAnswer" class="answer-input" value="${escapeAttr(card.answer)}" /></label>
        <label>解释<textarea id="editExplanation" rows="3">${escapeHtml(card.explanation)}</textarea></label>
        <label>来源<textarea id="editSource" rows="3">${escapeHtml(card.source)}</textarea></label>
        <button class="primary-cta" data-action="save-card">保存卡片</button>
      </section>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setState({ tab: button.dataset.tab, showResult: false, addSheetOpen: false }));
  });
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setState({ mode: button.dataset.mode, showResult: false }));
  });
  document.querySelectorAll('[data-deck-tab]').forEach((button) => {
    button.addEventListener('click', () => setState({ deckTab: button.dataset.deckTab }));
  });
  document.querySelectorAll('[data-option]').forEach((button) => {
    button.addEventListener('click', () => setState({ selectedOption: button.dataset.option }));
  });
  document.querySelectorAll('[data-create-type]').forEach((button) => {
    button.addEventListener('click', () => setState({ createType: button.dataset.createType }));
  });
  document.querySelectorAll('[data-select-source]').forEach((button) => {
    button.addEventListener('click', () => setState({ selectedSource: button.dataset.selectSource }));
  });
  document.querySelectorAll('[data-open-source]').forEach((button) => {
    button.addEventListener('click', () => setState({ selectedSource: button.dataset.openSource, createType: 'cards', tab: 'add', addSheetOpen: false }));
  });
  document.querySelectorAll('[data-subject]').forEach((button) => {
    button.addEventListener('click', () => setState({ activeSubject: button.dataset.subject, subjectSheetOpen: false, subjectQuery: '' }));
  });
  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => setState({ editingCardId: button.dataset.edit }));
  });
  document.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteCard(button.dataset.delete));
  });
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleAction(button.dataset.action));
  });
  document.querySelectorAll('[data-rating]').forEach((button) => {
    button.addEventListener('click', () => applyRating(Number(button.dataset.rating)));
  });
  const importText = document.querySelector('#importText');
  if (importText) importText.addEventListener('input', (event) => (state.importText = event.target.value));
  const urlInput = document.querySelector('#urlInput');
  if (urlInput) urlInput.addEventListener('input', (event) => (state.urlDraft = event.target.value));
  const noteTitle = document.querySelector('#noteTitle');
  if (noteTitle) noteTitle.addEventListener('input', (event) => (state.noteTitle = event.target.value));
  const noteBody = document.querySelector('#noteBody');
  if (noteBody) noteBody.addEventListener('input', (event) => (state.noteBody = event.target.value));
  const answerInput = document.querySelector('#answerInput');
  if (answerInput) answerInput.addEventListener('input', (event) => (state.answerDraft = event.target.value));
  const subjectSearch = document.querySelector('#subjectSearch');
  if (subjectSearch) subjectSearch.addEventListener('input', (event) => setState({ subjectQuery: event.target.value }));
  const fileInput = document.querySelector('#fileInput');
  if (fileInput) fileInput.addEventListener('change', handleFileImport);
  const photoInput = document.querySelector('#photoInput');
  if (photoInput) photoInput.addEventListener('change', handlePhotoImport);
}

function handleAction(action) {
  if (action === 'toggle-add-sheet') setState({ addSheetOpen: !state.addSheetOpen, subjectSheetOpen: false });
  if (action === 'open-subject-sheet') setState({ subjectSheetOpen: true, addSheetOpen: false });
  if (action === 'close-subject-sheet') setState({ subjectSheetOpen: false, subjectQuery: '' });
  if (action === 'continue-create') setState({ tab: 'add', addSheetOpen: false });
  if (action === 'generate') createCardsFromCurrentSource();
  if (action === 'save-note') saveNote();
  if (action === 'submit-choice') {
    const card = currentCard();
    setState({ showResult: true, lastCorrect: state.selectedOption === card.answer });
  }
  if (action === 'submit-type') {
    const card = currentCard();
    setState({ showResult: true, lastCorrect: gradeAnswer(state.answerDraft, card.answer) });
  }
  if (action === 'reveal') setState({ showResult: true, lastCorrect: true });
  if (action === 'close-editor') setState({ editingCardId: '' });
  if (action === 'save-card') saveEditedCard();
  if (action === 'minor') setState({ minorMode: !state.minorMode });
  if (action === 'export') downloadCsv();
  if (action === 'reset' && confirm('确定清空本地学习数据？')) {
    localStorage.removeItem(storageKey);
    state = defaultState;
    saveState();
    render();
  }
}

function createCardsFromCurrentSource() {
  const sourceText = buildSourceText();
  const deckTitle = `${state.activeSubject} ${sourceLabel(state.selectedSource)}`;
  const cards = generateCardsFromText(sourceText, deckTitle);
  setState({
    cards: [...cards, ...state.cards],
    importText: state.importText,
    tab: 'quiz',
    quizIndex: 0,
    showResult: false,
    xp: state.xp + 20,
    materialName: '',
    photoDraft: null
  });
}

function buildSourceText() {
  const text = document.querySelector('#importText')?.value || state.importText || '';
  if (state.selectedSource === 'video') {
    const url = document.querySelector('#urlInput')?.value || state.urlDraft || '';
    return `视频资料：${url || '未命名视频'}。${text || '请根据视频笔记生成复习卡片。'}`;
  }
  if (state.selectedSource === 'photo') {
    return `图片资料：${state.photoDraft?.name || '拍照资料'}。${text || '请补充图片中的关键文字和知识点。'}`;
  }
  return text || seedText;
}

function sourceLabel(source) {
  return { file: '上传资料', photo: '拍照资料', paste: '粘贴资料', video: '视频资料' }[source] || '学习资料';
}

function saveNote() {
  const title = document.querySelector('#noteTitle')?.value || state.noteTitle || `${state.activeSubject} note`;
  const body = document.querySelector('#noteBody')?.value || state.noteBody || state.importText;
  const note = {
    id: `note_${Date.now()}`,
    title,
    body,
    subject: state.activeSubject,
    createdAt: Date.now(),
    image: state.photoDraft?.image || ''
  };
  setState({
    notes: [note, ...state.notes],
    noteTitle: '',
    noteBody: '',
    tab: 'home',
    xp: state.xp + 5
  });
}

function handleFileImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setState({ importText: String(reader.result || ''), selectedSource: 'file', materialName: file.name, tab: 'add' });
  reader.readAsText(file, 'utf-8');
}

function handlePhotoImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () =>
    setState({
      selectedSource: 'photo',
      photoDraft: { name: file.name, image: String(reader.result || '') },
      importText: state.importText || `图片资料：${file.name}`
    });
  reader.readAsDataURL(file);
}

function currentCard() {
  const queue = dueCards(state.cards);
  const cards = queue.length ? queue : state.cards;
  return cards[state.quizIndex % cards.length];
}

function applyRating(rating) {
  const card = currentCard();
  const updated = scheduleCard(card, rating);
  setState({
    cards: state.cards.map((item) => (item.id === card.id ? updated : item)),
    quizIndex: state.quizIndex + 1,
    answerDraft: '',
    selectedOption: '',
    showResult: false,
    lastCorrect: null,
    xp: state.xp + (rating >= 3 ? 10 : 3),
    streak: rating >= 3 ? state.streak + 1 : state.streak
  });
}

function saveEditedCard() {
  const id = state.editingCardId;
  const patch = {
    question: document.querySelector('#editQuestion')?.value || '',
    answer: document.querySelector('#editAnswer')?.value || '',
    explanation: document.querySelector('#editExplanation')?.value || '',
    source: document.querySelector('#editSource')?.value || ''
  };
  setState({
    cards: state.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    editingCardId: ''
  });
}

function deleteCard(id) {
  if (!confirm('确定删除这张卡片？')) return;
  setState({ cards: state.cards.filter((card) => card.id !== id), quizIndex: 0, showResult: false });
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

function deckGroups() {
  const colors = ['#97eb2f', '#ff9a3d', '#7c83ff', '#2ecdf2'];
  const groups = new Map();
  for (const card of state.cards) {
    const title = card.deckTitle || '我的智能卡组';
    groups.set(title, (groups.get(title) || 0) + 1);
  }
  return [...groups.entries()].map(([title, count], index) => ({ title, count, color: colors[index % colors.length] }));
}

function masteryCount() {
  return state.cards.filter((card) => card.stability >= 3).length;
}

function shortText(text, length) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > length ? `${clean.slice(0, length)}...` : clean;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

render();
