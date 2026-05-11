import {
  dueCards,
  exportCsv,
  generateCardsFromText,
  gradeAnswer,
  makeOptions,
  mastery,
  scheduleCard
} from './core.js';

const storageKey = 'flashwise-state-v4';
const ipImage = './images/ip_ocki.png';

const defaultState = {
  tab: 'home',
  deckTab: 'my',
  mode: 'choice',
  historySheetOpen: false,
  historyQuery: '',
  addSheetOpen: false,
  createType: 'cards',
  selectedSource: 'paste',
  importText: '',
  urlDraft: '',
  noteTitle: '',
  noteBody: '',
  photoDraft: null,
  materialName: '',
  message: '',
  quizIndex: 0,
  answerDraft: '',
  selectedOption: '',
  showResult: false,
  lastCorrect: null,
  editingCardId: '',
  minorMode: false,
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: '',
  sourceDocuments: [],
  notes: [],
  cards: [],
  attempts: []
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved) return defaultState;
    return {
      ...defaultState,
      ...saved,
      sourceDocuments: Array.isArray(saved.sourceDocuments) ? saved.sourceDocuments : [],
      notes: Array.isArray(saved.notes) ? saved.notes : [],
      cards: Array.isArray(saved.cards) ? saved.cards : [],
      attempts: Array.isArray(saved.attempts) ? saved.attempts : []
    };
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
  return `${state.historySheetOpen ? renderHistorySheet() : ''}${state.addSheetOpen ? renderAddSheet() : ''}`;
}

function renderBottomNav() {
  const tabs = [
    ['home', '🏠', '首页'],
    ['progress', '🔥', '进度'],
    ['add', state.addSheetOpen ? '×' : '✚', state.addSheetOpen ? '收起' : '新建'],
    ['decks', '📁', '卡组'],
    ['profile', '🐙', '我的']
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
  const groups = deckGroups();
  const latestDocument = state.sourceDocuments[0];
  return `
    <section class="screen home-screen">
      ${statusBar()}
      <button class="subject-chip" data-action="open-history">⏱️ 历史</button>
      <img class="home-mascot" src="${ipImage}" alt="闪学学习助手" />
      <h1 class="home-title">今天学什么？</h1>
      <section class="study-prompt" data-action="toggle-add-sheet">
        <div>
          <span>我想学习...</span>
          <strong>${latestDocument ? escapeHtml(shortText(latestDocument.title, 18)) : '上传资料或创建笔记'}</strong>
        </div>
        <b>＋</b>
      </section>
      <div class="upload-grid">
        ${uploadButton('📁', '卡组', 'decks')}
        ${sourceButton('⬆️', '上传', 'file')}
        ${sourceButton('📷', '拍照', 'photo')}
        ${sourceButton('🎬', '视频', 'video')}
        ${sourceButton('📋', '粘贴', 'paste')}
        ${sourceButton('⌕', '历史', 'history')}
      </div>
      <section class="section-block">
        <h2>继续学习</h2>
        ${
          state.cards.length
            ? `<article class="jump-card" data-tab="quiz">
                <div class="progress-ring">${mastery(state.cards)}%</div>
                <div><strong>${escapeHtml(groups[0]?.title || '我的卡组')}</strong><span>${due.length || state.cards.length} 道题待复习</span></div>
              </article>`
            : renderEmptyCard('还没有学习记录', '上传资料后会生成记忆卡、测验和历史记录。', '开始上传', 'toggle-add-sheet')
        }
      </section>
      <section class="section-block">
        <div class="section-row"><h2>我的卡组</h2><button data-action="toggle-add-sheet">＋</button></div>
        ${groups.length ? groups.map(renderDeckRow).join('') : renderEmptyCard('暂无卡组', '创建记忆卡后会出现在这里。', '创建记忆卡', 'toggle-add-sheet')}
      </section>
      ${state.notes.length ? renderRecentNotes() : ''}
    </section>
  `;
}

function renderHistorySheet() {
  const results = historyResults();
  return `
    <div class="sheet-dim">
      <section class="bottom-sheet subject-sheet">
        <header class="sheet-header">
          <span></span>
          <h2>历史记录</h2>
          <button data-action="close-history">×</button>
        </header>
        <label class="search-box">
          <span>⌕</span>
          <input id="historySearch" value="${escapeAttr(state.historyQuery)}" placeholder="搜索资料、笔记或答题记录" />
        </label>
        <div class="history-results">
          ${
            results.length
              ? results.map(renderHistoryResult).join('')
              : `<div class="history-empty"><strong>没有找到记录</strong><span>你生成过的卡组、保存的笔记、学习过的资料会出现在这里。</span></div>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderHistoryResult(item) {
  return `
    <button class="history-row" data-history-id="${item.id}" data-history-kind="${item.kind}">
      <b>${item.icon}</b>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.meta)}</span>
      </div>
      <small>${formatDate(item.createdAt)}</small>
    </button>
  `;
}

function renderAddSheet() {
  return `
    <div class="sheet-dim">
      <section class="bottom-sheet add-choice-sheet">
        <button class="sheet-close-float" data-action="toggle-add-sheet">×</button>
        <button class="create-choice ${state.createType === 'cards' ? 'selected' : ''}" data-create-type="cards">
          <span>▱</span>
          <div><strong>记忆卡</strong><small>把资料变成练习题</small></div>
        </button>
        <button class="create-choice ${state.createType === 'notes' ? 'selected' : ''}" data-create-type="notes">
          <span>✎</span>
          <div><strong>自由笔记</strong><small>先记录，再整理</small></div>
        </button>
        <button class="dark-cta" data-action="continue-create">继续</button>
      </section>
    </div>
  `;
}

function statusBar() {
  const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  return `
    <div class="status-bar">
      <span>${time}</span>
      <span>本地版</span>
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
  const action = source === 'history' ? 'data-action="open-history"' : `data-open-source="${source}"`;
  return `
    <button class="upload-pill" ${action}>
      <span>${icon}</span>
      <strong>${label}</strong>
    </button>
  `;
}

function renderDeckRow(deck) {
  return `
    <article class="deck-row" data-deck-title="${escapeAttr(deck.title)}">
      <i style="background:${deck.color}"></i>
      <div>
        <strong>${escapeHtml(deck.title)}</strong>
        <span>${deck.count} 张卡片</span>
      </div>
      <b>⋮</b>
    </article>
  `;
}

function renderEmptyCard(title, text, buttonLabel, action) {
  return `
    <article class="empty-card">
      <strong>${title}</strong>
      <span>${text}</span>
      <button data-action="${action}">${buttonLabel}</button>
    </article>
  `;
}

function renderRecentNotes() {
  return `
    <section class="section-block">
      <div class="section-row"><h2>笔记</h2><button data-tab="add">＋</button></div>
      ${state.notes.slice(0, 3).map(renderNoteCard).join('')}
    </section>
  `;
}

function renderNoteCard(note) {
  return `
    <article class="note-card" data-history-id="${note.id}" data-history-kind="note">
      ${note.image ? `<img src="${note.image}" alt="${escapeAttr(note.title)}" />` : ''}
      <div>
        <strong>${escapeHtml(note.title)}</strong>
        <span>${escapeHtml(shortText(note.body, 42))}</span>
      </div>
    </article>
  `;
}

function renderProgress() {
  const studiedDates = new Set(state.attempts.map((attempt) => dateKey(attempt.createdAt)));
  return `
    <section class="screen progress-screen">
      ${statusBar()}
      <header class="level-card">
        <img src="${ipImage}" alt="闪学学习助手" />
        <div>
          <strong>第 ${state.level} 级</strong>
          <span>${state.xp} 积分</span>
        </div>
        <b>${state.cards.length} 张卡片</b>
      </header>
      <section class="section-block">
        <h2>开始今日学习</h2>
        <article class="streak-card">
          <div>🔥</div>
          <strong>已连续学习 ${state.streak} 天</strong>
          <span>${state.cards.length ? `${dueCards(state.cards).length || state.cards.length} 道题可以复习` : '先创建一组记忆卡'}</span>
        </article>
        <div class="calendar-row">${['日', '一', '二', '三', '四', '五', '六'].map((day) => `<b>${day}</b>`).join('')}</div>
        <div class="calendar-grid">${calendarDays().map((day) => `<span class="${studiedDates.has(day.key) ? 'studied' : ''} ${day.today ? 'today' : ''}">${day.label}</span>`).join('')}</div>
        <button class="dark-cta" data-tab="${state.cards.length ? 'quiz' : 'add'}">🎮 ${state.cards.length ? '开始复习' : '创建记忆卡'}</button>
      </section>
      <section class="section-block">
        <h2>卡组进度</h2>
        ${
          state.cards.length
            ? `<article class="jump-card"><div class="progress-ring">${mastery(state.cards)}%</div><div><strong>已掌握 ${masteryCount()} / ${state.cards.length} 张</strong><span>${dueCards(state.cards).length} 张现在需要复习</span></div></article>`
            : renderEmptyCard('暂无进度', '完成一次资料导入后，这里会显示真实掌握率和复习进度。', '创建记忆卡', 'toggle-add-sheet')
        }
      </section>
      <section class="section-block">
        <h2>学习记录</h2>
        ${state.attempts.length ? state.attempts.slice(0, 8).map(renderAttempt).join('') : renderEmptyCard('没有学习动态', '答题记录会按时间出现在这里。', '开始学习', state.cards.length ? 'start-quiz' : 'toggle-add-sheet')}
      </section>
      <section class="section-block">
        <h2>同伴学习</h2>
        <article class="empty-card locked">
          <strong>好友排行榜和学习小组需要云端账号</strong>
          <span>当前版本不会展示假好友或假排行榜。接入腾讯云、登录和后端后再启用。</span>
          <button data-tab="profile">查看配置需求</button>
        </article>
      </section>
    </section>
  `;
}

function renderAttempt(attempt) {
  return `
    <article class="activity-row">
      <b>${attempt.correct ? '✓' : '↻'}</b>
      <div><strong>${escapeHtml(attempt.title)}</strong><span>${formatDate(attempt.createdAt)} · ${attempt.correct ? '答对' : '需要再复习'}</span></div>
      <small>+${attempt.xp} 积分</small>
    </article>
  `;
}

function renderAdd() {
  const isNotes = state.createType === 'notes';
  return `
    <section class="screen add-screen">
      ${statusBar()}
      <header class="page-title">
        <button data-tab="home">‹</button>
        <h1>${isNotes ? '写笔记' : '生成记忆卡'}</h1>
        <button data-action="toggle-add-sheet">＋</button>
      </header>
      <section class="add-hero">
        <div class="plus-orb">${isNotes ? '✎' : '＋'}</div>
        <h2>${isNotes ? '写下自由笔记' : '上传资料，马上开考'}</h2>
        <p>${isNotes ? '笔记会存入历史记录，也可以作为后续制卡资料。' : '记忆卡会基于你输入或上传的真实资料生成。'}</p>
      </section>
      ${state.message ? `<div class="message">${escapeHtml(state.message)}</div>` : ''}
      ${isNotes ? renderNotesComposer() : renderCardsComposer()}
    </section>
  `;
}

function renderCardsComposer() {
  return `
    <div class="source-grid">
      ${sourceTile('📄', '文件上传', '文本 / 文稿 / 表格', 'file')}
      ${sourceTile('📷', '拍照记录', '图片预览 + 手动文字', 'photo')}
      ${sourceTile('📋', '粘贴文本', '课堂笔记 / 讲义', 'paste')}
      ${sourceTile('🎬', '视频链接', '链接 + 字幕笔记', 'video')}
    </div>
    <section class="upload-composer">
      ${renderSourceInput()}
      <button class="primary-cta" data-action="generate">生成记忆卡和测验</button>
    </section>
    <section class="pipeline">
      <h2>已支持的功能</h2>
      <div><span>1</span><strong>保存资料历史</strong><small>每次生成都会进入历史记录搜索</small></div>
      <div><span>2</span><strong>生成可编辑卡片</strong><small>选择、填空、翻卡都可练习</small></div>
      <div><span>3</span><strong>真实进度记录</strong><small>积分、连续学习天数、到期复习都来自你的学习行为</small></div>
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
      <textarea id="importText" rows="6" placeholder="请手动补充图片中的文字。自动识别图片文字需要接入云服务。">${escapeHtml(state.importText)}</textarea>
    `;
  }
  if (state.selectedSource === 'video') {
    return `
      <input id="urlInput" class="answer-input" value="${escapeAttr(state.urlDraft)}" placeholder="粘贴网课、哔哩哔哩或课程链接" />
      <textarea id="importText" rows="6" placeholder="请粘贴视频字幕、课件摘要或你整理的笔记。自动转写需要接入云服务。">${escapeHtml(state.importText)}</textarea>
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
      <textarea id="noteBody" rows="10" placeholder="先把想法记下来，稍后也可以整理成记忆卡...">${escapeHtml(state.noteBody)}</textarea>
      <button class="primary-cta" data-action="save-note">保存笔记</button>
    </section>
    <section class="section-block">
      <h2>已有笔记</h2>
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
      ${statusBar()}
      <header class="page-title">
        <span></span>
        <h1>卡组</h1>
        <button data-action="open-history">⌕</button>
      </header>
      <div class="deck-tabs">
        <button class="${state.deckTab === 'my' ? 'active' : ''}" data-deck-tab="my">我的卡组</button>
        <button class="${state.deckTab === 'public' ? 'active' : ''}" data-deck-tab="public">公共卡组</button>
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
      ${groups.length ? groups.map(renderDeckRow).join('') : renderEmptyCard('暂无卡组', '创建记忆卡后会在这里显示真实卡组。', '创建记忆卡', 'toggle-add-sheet')}
      ${state.notes.length ? '<h2 class="deck-subtitle">笔记</h2>' : ''}
      ${state.notes.map(renderNoteCard).join('')}
    </div>
  `;
}

function renderPublicDecks() {
  return `
    <div class="deck-list">
      <article class="empty-card locked">
        <strong>公共卡组需要云端内容库</strong>
        <span>当前没有接入后端审核和发布系统，所以不展示假公共卡组。</span>
        <button data-tab="profile">查看配置需求</button>
      </article>
    </div>
  `;
}

function renderProfile() {
  return `
    <section class="screen profile-screen">
      ${statusBar()}
      <header class="page-title">
        <button data-tab="home">‹</button>
        <h1>我的</h1>
        <span></span>
      </header>
      <section class="avatar-edit">
        <img src="${ipImage}" alt="闪学头像" />
      </section>
      <section class="settings-card">
        ${settingRow('👤', '账号', '未登录，本地模式')}
        ${settingRow('📚', '记忆卡', `${state.cards.length}`)}
        ${settingRow('📝', '笔记', `${state.notes.length}`)}
        ${settingRow('🕘', '历史记录', `${historyResults('').length}`)}
      </section>
      <section class="privacy-row">
        <span>🔒 仅自己可见</span>
        <label><input type="checkbox" data-action="minor" ${state.minorMode ? 'checked' : ''} /><i></i></label>
      </section>
      <section class="settings-card">
        ${settingRow('☁️', '云端同步', '未配置')}
        ${settingRow('🤖', '大模型生成', '未配置，当前为本地规则生成')}
        ${settingRow('🧾', '拍照识别 / 语音转写', '未配置，需云服务')}
      </section>
      <div class="profile-actions">
        <button class="outline-wide" data-action="export">导出表格</button>
        <button class="outline-wide danger" data-action="reset">清空本地数据</button>
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
  if (!card) {
    return `
      <section class="screen quiz-screen">
        ${statusBar()}
        ${renderEmptyCard('还没有卡片', '先上传资料或保存笔记，再开始测验。', '创建记忆卡', 'toggle-add-sheet')}
      </section>
    `;
  }
  const options = makeOptions(card, state.cards);
  return `
    <section class="screen quiz-screen">
      ${statusBar()}
      <header class="quiz-header">
        <button data-tab="home">‹</button>
        <div><strong>${state.quizIndex + 1}/${cards.length}</strong><span>+10 积分</span></div>
        <b>🔥 ${state.streak}</b>
      </header>
      <article class="quiz-card">
        <div class="tag-row">${card.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        <h1>${escapeHtml(card.question)}</h1>
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
      <button class="primary-cta" data-action="submit-choice">查看答案</button>
    `;
  }
  if (state.mode === 'type') {
    return `
      <input id="answerInput" class="answer-input" value="${escapeAttr(state.answerDraft)}" placeholder="输入你回忆出的答案" />
      <button class="primary-cta" data-action="submit-type">查看答案</button>
    `;
  }
  return `<button class="primary-cta" data-action="reveal">查看答案</button>`;
}

function renderResult(card) {
  return `
    <div class="result ${state.lastCorrect ? 'correct' : 'wrong'}">
      <strong>${state.lastCorrect ? '答对了' : '再想想'}</strong>
      <p>答案：${escapeHtml(card.answer)}</p>
      <blockquote>${escapeHtml(card.source)}</blockquote>
      <p>${escapeHtml(card.explanation)}</p>
      <div class="rating-row">
        <button data-rating="1">仍不会</button>
        <button data-rating="2">有点难</button>
        <button data-rating="3">记住了</button>
        <button data-rating="4">很轻松</button>
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
    button.addEventListener('click', () => setState({ tab: button.dataset.tab, showResult: false, addSheetOpen: false, historySheetOpen: false, message: '' }));
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
    button.addEventListener('click', () => setState({ selectedSource: button.dataset.selectSource, message: '' }));
  });
  document.querySelectorAll('[data-open-source]').forEach((button) => {
    button.addEventListener('click', () => setState({ selectedSource: button.dataset.openSource, createType: 'cards', tab: 'add', addSheetOpen: false, historySheetOpen: false, message: '' }));
  });
  document.querySelectorAll('[data-history-id]').forEach((button) => {
    button.addEventListener('click', () => openHistoryItem(button.dataset.historyId, button.dataset.historyKind));
  });
  document.querySelectorAll('[data-deck-title]').forEach((button) => {
    button.addEventListener('click', () => openDeck(button.dataset.deckTitle));
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
  const historySearch = document.querySelector('#historySearch');
  if (historySearch) historySearch.addEventListener('input', (event) => setState({ historyQuery: event.target.value }));
  const fileInput = document.querySelector('#fileInput');
  if (fileInput) fileInput.addEventListener('change', handleFileImport);
  const photoInput = document.querySelector('#photoInput');
  if (photoInput) photoInput.addEventListener('change', handlePhotoImport);
}

function handleAction(action) {
  if (action === 'toggle-add-sheet') setState({ addSheetOpen: !state.addSheetOpen, historySheetOpen: false, message: '' });
  if (action === 'open-history') setState({ historySheetOpen: true, addSheetOpen: false, historyQuery: '', message: '' });
  if (action === 'close-history') setState({ historySheetOpen: false, historyQuery: '' });
  if (action === 'continue-create') setState({ tab: 'add', addSheetOpen: false, message: '' });
  if (action === 'generate') createCardsFromCurrentSource();
  if (action === 'save-note') saveNote();
  if (action === 'start-quiz') setState({ tab: 'quiz' });
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
  if (!sourceText.trim()) {
    setState({ message: '请先输入、粘贴或上传真实学习资料。' });
    return;
  }
  const now = Date.now();
  const title = buildDocumentTitle(sourceText);
  const generated = generateCardsFromText(sourceText, title);
  const document = {
    id: `doc_${now}`,
    kind: 'document',
    sourceType: state.selectedSource,
    title,
    body: sourceText,
    cardIds: generated.map((card) => card.id),
    createdAt: now
  };
  setState({
    cards: [...generated, ...state.cards],
    sourceDocuments: [document, ...state.sourceDocuments],
    importText: '',
    urlDraft: '',
    tab: 'quiz',
    quizIndex: 0,
    showResult: false,
    xp: state.xp + 20,
    level: levelForXp(state.xp + 20),
    materialName: '',
    photoDraft: null,
    message: ''
  });
}

function buildSourceText() {
  const text = document.querySelector('#importText')?.value || state.importText || '';
  if (state.selectedSource === 'video') {
    const url = document.querySelector('#urlInput')?.value || state.urlDraft || '';
    if (!url && !text) return '';
    return [url ? `视频链接：${url}` : '', text].filter(Boolean).join('。');
  }
  if (state.selectedSource === 'photo') {
    if (!state.photoDraft && !text) return '';
    return [`图片资料：${state.photoDraft?.name || '未命名图片'}`, text].filter(Boolean).join('。');
  }
  return text;
}

function buildDocumentTitle(text) {
  if (state.materialName) return state.materialName.replace(/\.[^.]+$/, '');
  if (state.urlDraft) return shortText(state.urlDraft.replace(/^https?:\/\//, ''), 24);
  const firstLine = text.split(/[。！？.!?\n]/).find((line) => line.trim().length > 0) || '未命名资料';
  return shortText(firstLine, 18);
}

function saveNote() {
  const title = document.querySelector('#noteTitle')?.value || state.noteTitle;
  const body = document.querySelector('#noteBody')?.value || state.noteBody;
  if (!title.trim() && !body.trim()) {
    setState({ message: '请先填写笔记标题或内容。' });
    return;
  }
  const now = Date.now();
  const note = {
    id: `note_${now}`,
    title: title.trim() || shortText(body, 18),
    body,
    createdAt: now,
    image: state.photoDraft?.image || ''
  };
  setState({
    notes: [note, ...state.notes],
    sourceDocuments: [
      {
        id: `doc_note_${now}`,
        kind: 'note',
        sourceType: 'notes',
        title: note.title,
        body: note.body,
        noteId: note.id,
        createdAt: now
      },
      ...state.sourceDocuments
    ],
    noteTitle: '',
    noteBody: '',
    tab: 'home',
    xp: state.xp + 5,
    level: levelForXp(state.xp + 5),
    message: ''
  });
}

function handleFileImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setState({ importText: String(reader.result || ''), selectedSource: 'file', materialName: file.name, tab: 'add', message: '' });
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
      message: '图片已保存预览。请补充图片文字后生成卡片；自动识别图片文字需要云服务。'
    });
  reader.readAsDataURL(file);
}

function historyResults(query = state.historyQuery) {
  const needle = query.trim().toLowerCase();
  const documents = state.sourceDocuments.map((doc) => ({
    id: doc.id,
    kind: doc.kind || 'document',
    icon: doc.kind === 'note' ? '✎' : '▱',
    title: doc.title,
    meta: `${sourceTypeLabel(doc.sourceType)} · ${shortText(doc.body || '', 36)}`,
    body: doc.body || '',
    createdAt: doc.createdAt
  }));
  const attempts = state.attempts.map((attempt) => ({
    id: attempt.id,
    kind: 'attempt',
    icon: attempt.correct ? '✓' : '↻',
    title: attempt.title,
    meta: attempt.correct ? '答对记录' : '复习记录',
    body: attempt.title,
    createdAt: attempt.createdAt
  }));
  return [...documents, ...attempts]
    .filter((item) => !needle || `${item.title} ${item.meta} ${item.body}`.toLowerCase().includes(needle))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function openHistoryItem(id, kind) {
  if (kind === 'attempt') {
    setState({ tab: 'progress', historySheetOpen: false });
    return;
  }
  const document = state.sourceDocuments.find((item) => item.id === id);
  if (!document) return;
  if (document.kind === 'note') {
    setState({ tab: 'decks', deckTab: 'my', historySheetOpen: false });
    return;
  }
  const firstCardIndex = state.cards.findIndex((card) => document.cardIds?.includes(card.id));
  setState({ tab: 'quiz', quizIndex: Math.max(0, firstCardIndex), historySheetOpen: false, showResult: false });
}

function openDeck(title) {
  const index = state.cards.findIndex((card) => card.deckTitle === title);
  setState({ tab: 'quiz', quizIndex: Math.max(0, index), showResult: false });
}

function currentCard() {
  const queue = dueCards(state.cards);
  const cards = queue.length ? queue : state.cards;
  return cards[state.quizIndex % cards.length];
}

function applyRating(rating) {
  const card = currentCard();
  const correct = rating >= 3;
  const updated = scheduleCard(card, rating);
  const xp = correct ? 10 : 3;
  const now = Date.now();
  const nextXp = state.xp + xp;
  const nextStreak = correct ? updateStreak(now) : state.streak;
  setState({
    cards: state.cards.map((item) => (item.id === card.id ? updated : item)),
    attempts: [
      {
        id: `attempt_${now}`,
        cardId: card.id,
        title: card.question,
        correct,
        rating,
        xp,
        createdAt: now
      },
      ...state.attempts
    ],
    quizIndex: state.quizIndex + 1,
    answerDraft: '',
    selectedOption: '',
    showResult: false,
    lastCorrect: null,
    xp: nextXp,
    level: levelForXp(nextXp),
    streak: nextStreak,
    lastStudyDate: dateKey(now)
  });
}

function updateStreak(now) {
  const today = dateKey(now);
  if (state.lastStudyDate === today) return state.streak;
  const yesterday = dateKey(now - 24 * 60 * 60 * 1000);
  return state.lastStudyDate === yesterday ? state.streak + 1 : 1;
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
  link.download = '闪学卡片.csv';
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

function calendarDays() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 8);
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return { label: day.getDate(), key: dateKey(day.getTime()), today: dateKey(day.getTime()) === dateKey(Date.now()) };
  });
}

function masteryCount() {
  return state.cards.filter((card) => card.stability >= 3).length;
}

function levelForXp(xp) {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function sourceTypeLabel(type) {
  return { file: '文件', photo: '照片', paste: '粘贴', video: '视频', notes: '笔记' }[type] || '资料';
}

function formatDate(time) {
  if (!time) return '';
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(time));
}

function dateKey(time) {
  const date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
