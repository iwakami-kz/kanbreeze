import { describe, expect, it } from 'vitest';

import {
  adjustThemeAccent,
  applyFilters,
  applyOptimisticChange,
  applyScrollBehaviour,
  applyThemePreset,
  buildAccessibilityPalette,
  buildDueBadge,
  buildWipHeatmap,
  changeWipLimit,
  changeWipPolicy,
  confirmDangerousAction,
  configureSwimlanes,
  confirmThemePreset,
  createAdjustmentSession,
  createInlineCard,
  enqueueToast,
  evaluateWip,
  getThemePreset,
  handleGesture,
  handleKeyboardNavigation,
  handleSaveFailure,
  initialiseThemeState,
  moveCard,
  planVirtualisation,
  presentAssignee,
  presentTags,
  queueOfflineChange,
  redoLastUndo,
  resetThemeAdjustments,
  restoreBoardState,
  resolveAnimationSettings,
  resolveThemeMode,
  resizeColumn,
  saveView,
  searchCards,
  startCardDrag,
  summariseChecklist,
  toggleSound,
  undoLastChange,
  undoThemeAdjustment,
} from '../src/kanban/kanbanBoardService';

import type {
  AnimationPreferences,
  BoardPreferences,
  FilterCondition,
  KanbanBoardState,
  KanbanCard,
  KanbanColumn,
  KeyboardNavigationOptions,
  OptimisticChange,
  OfflineChange,
  ScrollState,
  SwimlaneState,
  TagPaletteEntry,
  ToastMessage,
  ToastQueue,
  ViewDefinition,
  VirtualisationOptions,
} from '../src/kanban/kanbanBoardService';

function createBoard(): KanbanBoardState {
  const columns: KanbanColumn[] = [
    { id: 'todo', name: 'To Do', cardIds: ['c1'], wipLimit: 5, wipPolicy: 'allow-exception' },
    { id: 'doing', name: 'Doing', cardIds: ['c2'], wipLimit: 1, wipPolicy: 'enforced' },
    { id: 'done', name: 'Done', cardIds: [], wipLimit: 10 },
  ];
  const cards: Record<string, KanbanCard> = {
    c1: {
      id: 'c1',
      title: 'Card 1',
      tags: ['frontend', 'ux', 'priority'],
      dueDate: '2024-04-01',
      updatedAt: '2024-03-20T00:00:00Z',
      checklist: [
        { id: 'i1', title: 'Item 1', done: true, order: 1 },
        { id: 'i2', title: 'Item 2', done: false, order: 2 },
      ],
    },
    c2: {
      id: 'c2',
      title: 'Card 2',
      tags: ['backend'],
      dueDate: '2024-03-15',
      updatedAt: '2024-03-18T00:00:00Z',
      assigneeId: 'u1',
      assigneeName: '田中',
      checklist: [],
    },
  };
  const preferences: BoardPreferences = {
    colorBlindMode: false,
    reducedMotion: false,
    animationDisabled: false,
    sound: 'on',
    toastDurationMs: 4000,
    autoTheme: true,
    savedPresetId: 'sunlight',
    wipNotificationsEnabled: true,
  };
  return {
    columns,
    cards,
    history: { past: [], future: [] },
    preferences,
  };
}

describe('Epic 1: テーマ制御', () => {
  it('デフォルトのテーマはサンライトで保存確認不要', () => {
    const state = initialiseThemeState(new Date('2024-03-01T00:00:00Z'));
    expect(state.presetId).toBe('sunlight');
    expect(state.needsSavePrompt).toBe(false);
    expect(state.tokens.background).toBe('#FDF9F3');
  });

  it('プリセット切替時は保存確認を促し、確定で保存される', () => {
    const initial = initialiseThemeState(new Date('2024-03-01T00:00:00Z'));
    const preview = applyThemePreset(initial, 'mist-green', new Date('2024-03-02T00:00:00Z'));
    expect(preview.needsSavePrompt).toBe(true);
    expect(preview.pendingPresetId).toBe('mist-green');
    const confirmed = confirmThemePreset(preview, new Date('2024-03-03T00:00:00Z'));
    expect(confirmed.presetId).toBe('mist-green');
    expect(confirmed.needsSavePrompt).toBe(false);
  });

  it('アクセント調整はコントラストを検証し、警告時は保存不可', () => {
    const preset = getThemePreset('sunlight');
    const session = createAdjustmentSession(preset.tokens);
    const result = adjustThemeAccent(session, { accent: '#2C1900' }, { minBodyContrast: 4.5 });
    expect(result.compliance.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.compliance.canSave).toBe(false);
    const undoSession = undoThemeAdjustment(result.session);
    expect(undoSession.current.accent).toBe(session.current.accent);
    const resetSession = resetThemeAdjustments(result.session);
    expect(resetSession.current.accent).toBe(session.base.accent);
  });

  it('OS連動のテーマ切替と印刷時のライト固定を行う', () => {
    const resolved = resolveThemeMode({ auto: true, osPreference: 'dark' });
    expect(resolved.mode).toBe('dark');
    const manual = resolveThemeMode({ auto: false, osPreference: 'light', userSelection: 'light' });
    expect(manual.source).toBe('user');
    const print = resolveThemeMode({ auto: true, osPreference: 'dark', printing: true });
    expect(print.mode).toBe('light');
    expect(print.source).toBe('print');
  });

  it('色覚配慮モードではパターン付き凡例を提供する', () => {
    const preset = getThemePreset('tea-latte');
    const palette = buildAccessibilityPalette({ enable: true, baseTokens: preset.tokens });
    expect(palette.tokens.patterns).toContain('diagonal-stripe');
    expect(palette.legend).toHaveLength(3);
  });
});

describe('Epic 2: 基本操作', () => {
  it('ドラッグ開始でプレースホルダー情報を返す', () => {
    const board = createBoard();
    const drag = startCardDrag(board, 'c1');
    expect(drag.originColumnId).toBe('todo');
    expect(drag.liftShadow).toBe(4);
  });

  it('WIP制限を超える移動はトーストで拒否する', () => {
    const board = createBoard();
    const drag = startCardDrag(board, 'c1');
    const result = moveCard(board, drag, 'doing', { targetIndex: 1, allowUndo: true });
    expect(result.toast?.message).toContain('WIP制限');
    expect(result.board.columns[1].cardIds).toHaveLength(1);
  });

  it('移動成功時は履歴に追加され取り消し可能', () => {
    const board = createBoard();
    const drag = startCardDrag(board, 'c1');
    const result = moveCard(board, drag, 'done', { targetIndex: 0, allowUndo: true, now: new Date('2024-03-21T00:00:00Z') });
    expect(result.board.columns[2].cardIds[0]).toBe('c1');
    const undone = undoLastChange(result.board);
    expect(undone.columns[0].cardIds).toContain('c1');
    const redone = redoLastUndo(undone);
    expect(redone.columns[2].cardIds).toContain('c1');
  });

  it('インライン作成は5秒毎の自動保存目安と連続作成フラグを返す', () => {
    const column: KanbanColumn = { id: 'todo', name: 'To Do', cardIds: [], wipLimit: 5 };
    const result = createInlineCard(column, '新規カード', { continuous: true, now: new Date('2024-03-21T09:00:00Z') });
    expect(result.card.title).toBe('新規カード');
    expect(new Date(result.autoSaveDueAt).getTime()).toBe(new Date('2024-03-21T09:00:05Z').getTime());
    expect(result.focusNext).toBe(true);
    const failure = handleSaveFailure();
    expect(failure.retryAvailable).toBe(true);
    expect(failure.draftRetained).toBe(true);
  });

  it('キーボード操作で上下左右や編集/キャンセルに対応する', () => {
    const board = createBoard();
    const options: KeyboardNavigationOptions = { columns: board.columns, cards: board.cards, focus: { columnId: 'todo', index: 0 } };
    const down = handleKeyboardNavigation(options, { type: 'move', direction: 'down' });
    expect(down.nextFocus.index).toBe(0);
    const right = handleKeyboardNavigation(options, { type: 'move', direction: 'right' });
    expect(right.nextFocus.columnId).toBe('doing');
    const edit = handleKeyboardNavigation(options, { type: 'enter' });
    expect(edit.action).toBe('edit');
    const cancel = handleKeyboardNavigation(options, { type: 'escape' });
    expect(cancel.action).toBe('cancel');
  });
});

describe('Epic 3: 視覚メタファ', () => {
  it('タグは3件まで表示し、溢れは+Nで保持する', () => {
    const board = createBoard();
    const palette: TagPaletteEntry[] = [
      { id: 'frontend', label: 'フロント', color: '#FFD180' },
      { id: 'ux', label: 'UX', color: '#F8BBD0' },
      { id: 'priority', label: '優先', color: '#FFAB91' },
    ];
    const presentation = presentTags(board.cards.c1, palette);
    expect(presentation.visible).toHaveLength(3);
    expect(presentation.overflow).toBeUndefined();
    const extraCard: KanbanCard = { ...board.cards.c1, tags: ['frontend', 'ux', 'priority', 'backend'] };
    const overflow = presentTags(extraCard, palette);
    expect(overflow.visible).toHaveLength(3);
    expect(overflow.overflow?.count).toBe(1);
  });

  it('期限バッジは期日近接・超過・未設定を穏やかに表現する', () => {
    const board = createBoard();
    const soon = buildDueBadge(board.cards.c1, { now: new Date('2024-03-29T00:00:00Z') });
    expect(soon.tone).toBe('soon');
    const overdue = buildDueBadge(board.cards.c2, { now: new Date('2024-03-29T00:00:00Z'), colorBlindMode: true });
    expect(overdue.icon).toBe('warning-pattern');
    const none = buildDueBadge({ ...board.cards.c1, dueDate: undefined }, { now: new Date('2024-03-29T00:00:00Z') });
    expect(none.label).toBe('期限なし');
  });

  it('担当者は未割当時にプレースホルダーを返す', () => {
    const board = createBoard();
    expect(presentAssignee(board.cards.c2).label).toBe('田中');
    expect(presentAssignee(board.cards.c1).label).toBe('未割り当て');
  });

  it('チェックリスト進捗を整列し比率として返す', () => {
    const board = createBoard();
    const summary = summariseChecklist(board.cards.c1);
    expect(summary.total).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.status).toBe('in-progress');
  });
});

describe('Epic 4: 検索・フィルタ・ビュー', () => {
  it('タイトル・説明・タグを横断検索する', () => {
    const board = createBoard();
    const results = searchCards(Object.values(board.cards), 'Card');
    expect(results).toHaveLength(2);
    const tagResults = searchCards(Object.values(board.cards), 'front');
    expect(tagResults[0].matchedFields).toContain('tags');
  });

  it('フィルタと条件チップ、空状態を返す', () => {
    const board = createBoard();
    const conditions: FilterCondition[] = [{ type: 'assignee', value: 'u1' }];
    const state = applyFilters(Object.values(board.cards), conditions);
    expect(state.cards).toHaveLength(1);
    expect(state.chips[0].label).toBe('assignee');
  });

  it('並び替えと保存ビューを提供する', () => {
    const board = createBoard();
    const sorted = [...Object.values(board.cards)];
    const byDue = sorted.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
    expect(byDue[0].id).toBe('c2');
    const views: ViewDefinition[] = [];
    const saved = saveView(views, [{ type: 'tag', value: 'frontend' }], {
      name: 'フロントビュー',
      actorId: 'u-admin',
      sharedWith: ['team'],
    });
    expect(saved.sharedWith).toContain('team');
    expect(saved.auditLog).toHaveLength(1);
  });
});

describe('Epic 5: レイアウト・操作性', () => {
  it('列幅リサイズは範囲内で保持される', () => {
    const column: KanbanColumn = { id: 'todo', name: 'To Do', cardIds: [] };
    const resized = resizeColumn(column, 800, { minWidth: 200, maxWidth: 600 });
    expect(resized.column.width).toBe(600);
  });

  it('スクロール状態をスナップし復元可否を示す', () => {
    const scrolls: ScrollState[] = [
      { columnId: 'todo', scrollTop: 123 },
      { columnId: 'doing', scrollTop: 456 },
    ];
    const result = applyScrollBehaviour(scrolls, { columnId: 'todo', scrollTop: 123 });
    expect(result.restored).toBe(true);
    expect(result.snaps[0].position).toBe(128);
  });

  it('モバイルジェスチャを操作にマッピングする', () => {
    expect(handleGesture({ type: 'long-press' }).action).toBe('open-menu');
    expect(handleGesture({ type: 'swipe', direction: 'right' }).action).toBe('open-card');
  });

  it('スイムレーン設定を永続化キー付きで返す', () => {
    const swimlanes: SwimlaneState[] = [
      { id: 'lane-1', name: '優先', collapsed: false },
      { id: 'lane-2', name: '通常', collapsed: true },
    ];
    const config = configureSwimlanes(swimlanes);
    expect(config.persistenceKey).toBe('kanban-swimlane-state');
    expect(config.swimlanes[1].collapsed).toBe(true);
  });
});

describe('Epic 6: WIP制限', () => {
  it('WIP制限変更で監査ログと警告を返す', () => {
    const column: KanbanColumn = { id: 'doing', name: 'Doing', cardIds: ['a', 'b'] };
    const result = changeWipLimit(column, 1, { actorId: 'u1', now: new Date('2024-03-21T00:00:00Z') });
    expect(result.auditLogEntry.limit).toBe(1);
    expect(result.warning).toContain('超過');
  });

  it('WIP超過時は控えめな警告とトーストを返す', () => {
    const board = createBoard();
    const column = { ...board.columns[1], cardIds: ['c2', 'c3'] };
    const evaluation = evaluateWip(column, board.preferences, 'toast1');
    expect(evaluation.exceeded).toBe(true);
    expect(evaluation.display.tone).toBe('warning');
    expect(evaluation.toast?.id).toBe('toast1');
  });

  it('ポリシー変更で理由必須フラグを返す', () => {
    const column: KanbanColumn = { id: 'doing', name: 'Doing', cardIds: [] };
    const result = changeWipPolicy(column, 'allow-exception', 'u1', new Date('2024-03-22T00:00:00Z'));
    expect(result.policy).toBe('allow-exception');
    expect(result.requiresReason).toBe(true);
  });

  it('ヒートマップは穏やかな階調とパターンで構成される', () => {
    const board = createBoard();
    const heatmap = buildWipHeatmap(board.columns, { ...board.preferences, colorBlindMode: true });
    expect(heatmap.cells).toHaveLength(3);
    expect(heatmap.cells[0].tone).toBe('calm');
    expect(heatmap.legend[2].meaning).toBe('超過');
  });
});

describe('Epic 7: フィードバック', () => {
  it('アニメーション設定は環境/設定に応じて抑制される', () => {
    const normal = resolveAnimationSettings({ reducedMotion: false, animationDisabled: false });
    expect(normal.liftDuration).toBe(200);
    const reduced = resolveAnimationSettings({ reducedMotion: true, animationDisabled: false });
    expect(reduced.liftDuration).toBeLessThan(normal.liftDuration);
    const disabled = resolveAnimationSettings({ reducedMotion: false, animationDisabled: true });
    expect(disabled.enabled).toBe(false);
  });

  it('トーストキューへ非破壊に追加する', () => {
    const queue: ToastQueue = { messages: [] };
    const toast: ToastMessage = { id: 't1', tone: 'info', message: '保存しました', durationMs: 3000 };
    const updated = enqueueToast(queue, toast);
    expect(updated.messages).toHaveLength(1);
  });

  it('危険操作はキャンセルを既定にする', () => {
    const confirmation = confirmDangerousAction({ actorId: 'u1', now: new Date() });
    expect(confirmation.defaultAction).toBe('cancel');
    expect(confirmation.recoveryAvailable).toBe(true);
  });

  it('操作音のオン/オフを切替えてもOS音量に追従する', () => {
    const toggled = toggleSound('off');
    expect(toggled.mode).toBe('off');
    expect(toggled.obeysSystemVolume).toBe(true);
  });
});

describe('Epic 8: パフォーマンス・永続化', () => {
  it('仮想化プランで軽量表示モードを判断する', () => {
    const board = createBoard();
    board.columns[0].cardIds = Array.from({ length: 50 }, (_, i) => `card-${i}`);
    const plan = planVirtualisation(board, { viewportHeight: 600, itemHeight: 80 });
    expect(plan.slices[0].end).toBeLessThanOrEqual(1200);
    expect(plan.lightweightMode).toBe(true);
  });

  it('楽観的更新でpending変更を保持する', () => {
    const board = createBoard();
    const change: OptimisticChange = {
      id: 'chg1',
      payload: {},
      apply: (b) => ({ ...b, preferences: { ...b.preferences, sound: 'off' } }),
      rollback: (b) => ({ ...b, preferences: { ...b.preferences, sound: 'on' } }),
    };
    const result = applyOptimisticChange(board, change);
    expect(result.board.preferences.sound).toBe('off');
    expect(result.pending.id).toBe('chg1');
  });

  it('オフライン変更をキューに追加しバナーを表示する', () => {
    const queue: OfflineChange[] = [];
    const change: OfflineChange = { id: 'offline-1', retries: 0, apply: (b) => b };
    const result = queueOfflineChange(queue, change);
    expect(result.queue).toHaveLength(1);
    expect(result.bannerVisible).toBe(true);
  });

  it('状態復元はプライベートモードで既定に戻し通知する', () => {
    const views: ViewDefinition[] = [
      { id: 'view-1', name: '既定', conditions: [], auditLog: [] },
    ];
    const privateResult = restoreBoardState({ availableViews: views, sessionIsPrivate: true });
    expect(privateResult.fallbackToDefault).toBe(true);
    expect(privateResult.toast?.message).toContain('プライベート');
    const storedResult = restoreBoardState({
      availableViews: views,
      stored: { viewId: 'view-1', openedCardId: 'c1', scroll: { columnId: 'todo', scrollTop: 120 } },
    });
    expect(storedResult.view?.id).toBe('view-1');
    expect(storedResult.openedCardId).toBe('c1');
    expect(storedResult.fallbackToDefault).toBe(false);
  });
});
