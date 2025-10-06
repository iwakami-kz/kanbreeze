import { describe, expect, it } from 'vitest';

import {
  addWidgetToLayout,
  applyGuestRestrictions,
  buildHomeExperience,
  buildProjectComparison,
  buildSprintSummary,
  buildWidgetGallery,
  buildPresetUpdateNotification,
  buildResponsiveWidgetPresentations,
  diffPresetAgainstLayout,
  getWidgetDragPreview,
  getWidgetSizePresets,
  mergePresetIntoLayout,
  moveWidgetWithKeyboard,
  removeWidgetWithUndo,
  reorderWidgetPosition,
  resizeWidgetInLayout,
  toggleSectionPresentation,
  undoWidgetRemoval,
  type LayoutState,
  type KeyboardMoveResult,
  type HomeExperienceInput,
  type DashboardPreset,
  type ProjectSnapshot,
  type SectionState,
  type WidgetCatalogEntry,
  type WidgetDefinition,
  type WidgetAuditLogEntry,
  type WidgetRemovalResult,
} from '../src/dashboard/dashboardService';

describe('buildHomeExperience', () => {
  const baseInput: HomeExperienceInput = {
    user: { id: 'user-1', role: 'member' },
    tasks: [
      { id: 't1', assigneeId: 'user-1', status: 'todo', dueDate: '2024-04-01' },
      { id: 't2', assigneeId: 'user-2', status: 'in-progress', dueDate: '2024-04-02' },
      { id: 't3', assigneeId: 'user-1', status: 'done', dueDate: '2024-04-03' },
      { id: 't4', assigneeId: 'user-1', status: 'todo', dueDate: '2024-03-29' },
    ],
    mentions: [
      { id: 'm1', read: false, createdAt: '2024-03-28' },
      { id: 'm2', read: true, createdAt: '2024-03-27' },
    ],
    kpiCards: [
      { id: 'k1', label: '進捗率', value: 0.7, importance: 10 },
      { id: 'k2', label: '未完了数', value: 8, importance: 9 },
      { id: 'k3', label: '期日超過', value: 2, importance: 8 },
      { id: 'k4', label: 'バーンダウン', value: 0.4, importance: 7 },
      { id: 'k5', label: 'ベロシティ', value: 35, importance: 6 },
      { id: 'k6', label: '品質', value: 98, importance: 5 },
      { id: 'k7', label: '集中度', value: 0.9, importance: 4 },
    ],
    defaultLayout: {
      id: 'layout-default',
      positions: {
        'my-tasks': { x: 0, y: 0, w: 4, h: 3 },
      },
      savedAt: '2024-03-01',
    },
    isLoading: false,
    now: new Date('2024-03-29T00:00:00Z'),
  };

  it('必須カードとKPIを含み、レイアウトとスケルトンを正しく返す', () => {
    const state = buildHomeExperience(baseInput);

    expect(state.primaryCards.map((card) => card.id)).toEqual([
      'my-tasks',
      'due-soon',
      'unread-mentions',
    ]);

    const myTasks = state.primaryCards.find((card) => card.id === 'my-tasks');
    expect(myTasks?.items).toHaveLength(2);

    const dueSoon = state.primaryCards.find((card) => card.id === 'due-soon');
    expect(dueSoon?.items).toHaveLength(2);
    expect((dueSoon?.items as Array<{ id: string }>).map((item) => item.id)).toEqual([
      't1',
      't4',
    ]);

    const mentions = state.primaryCards.find((card) => card.id === 'unread-mentions');
    expect(mentions?.items).toHaveLength(1);

    expect(state.kpiCards).toHaveLength(6);
    expect(state.kpiCards.map((card) => card.id)).not.toContain('k7');
    expect(state.layout.id).toBe('layout-default');
    expect(state.showSkeleton).toBe(false);
  });

  it('保存済みレイアウトとスケルトン表示を優先する', () => {
    const state = buildHomeExperience({
      ...baseInput,
      user: {
        id: 'user-1',
        role: 'member',
        savedLayout: {
          id: 'layout-custom',
          positions: {
            'my-tasks': { x: 1, y: 1, w: 4, h: 3 },
          },
          savedAt: '2024-03-15',
        },
      },
      isLoading: true,
    });

    expect(state.layout.id).toBe('layout-custom');
    expect(state.showSkeleton).toBe(true);
  });
});

describe('buildSprintSummary', () => {
  it('進行中スプリントの指標を返す', () => {
    const state = buildSprintSummary({
      status: 'active',
      remainingDays: 5,
      committedPoints: 40,
      completedPoints: 12,
      burndown: [40, 35, 28],
    });

    expect(state.status).toBe('active');
    expect(state.content).toMatchObject({
      remainingDays: 5,
      committedPoints: 40,
      completedPoints: 12,
      burndown: [40, 35, 28],
    });
  });

  it('未設定スプリントの導線を返す', () => {
    const state = buildSprintSummary({ status: 'not_planned' });
    expect(state.status).toBe('not_planned');
    expect(state.content).toMatchObject({ actions: expect.any(Array) });
  });

  it('完了スプリントのレビュー情報を返す', () => {
    const state = buildSprintSummary({
      status: 'completed',
      reviewUrl: '/reviews/1',
      summary: '実績サマリー',
    });

    expect(state.status).toBe('completed');
    expect(state.content).toMatchObject({
      reviewUrl: '/reviews/1',
      summary: '実績サマリー',
    });
  });
});

describe('buildProjectComparison', () => {
  const projects: ProjectSnapshot[] = [
    {
      id: 'p1',
      name: 'Alpha',
      progress: 0.6,
      riskLevel: 'medium',
      resourceUtilisation: 0.75,
      accessible: true,
      detailUrl: '/projects/p1',
    },
    {
      id: 'p2',
      name: 'Beta',
      progress: 0.4,
      riskLevel: 'high',
      resourceUtilisation: 0.8,
      accessible: false,
      detailUrl: '/projects/p2',
    },
  ];

  it('アクセス可能なプロジェクトカードと制限件数を返す', () => {
    const state = buildProjectComparison(projects);
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({ id: 'p1', detailUrl: '/projects/p1' });
    expect(state.restrictedCount).toBe(1);
  });
});

describe('toggleSectionPresentation', () => {
  const sections: SectionState[] = [
    { id: 'home', isOpen: true, unreadCount: 2, lastUpdated: '2024-03-01' },
    { id: 'reports', isOpen: false, unreadCount: 0, lastUpdated: '2024-03-01' },
  ];

  it('開閉状態とアニメーション、バッジ表示を制御する', () => {
    const { updatedStates, presentation } = toggleSectionPresentation(sections, 'home');
    const toggled = updatedStates.find((section) => section.id === 'home');
    expect(toggled?.isOpen).toBe(false);
    expect(presentation.animationDuration).toBeCloseTo(0.25, 2);
    expect(presentation.showUnreadBadge).toBe(true);
  });
});

describe('applyGuestRestrictions', () => {
  const widgets: WidgetDefinition[] = [
    {
      id: 'velocity',
      title: 'ベロシティ',
      requiresNonGuest: true,
      content: { value: 32 },
    },
    {
      id: 'private',
      title: '非公開メモ',
      requiresNonGuest: true,
      isPrivate: true,
      content: { notes: 'secret' },
    },
    {
      id: 'public',
      title: '公開情報',
      content: { value: 10 },
    },
  ];

  it('ゲストにはマスキングと非表示制御を適用する', () => {
    const presented = applyGuestRestrictions(widgets, {
      id: 'guest-1',
      role: 'guest',
    });

    expect(presented).toHaveLength(2);
    const velocity = presented.find((widget) => widget.id === 'velocity');
    expect(velocity?.masked).toBe(true);
    expect(velocity?.content).toMatchObject({ message: 'アクセス権が必要です' });
    expect(presented.find((widget) => widget.id === 'private')).toBeUndefined();
  });

  it('メンバーには制限を適用しない', () => {
    const presented = applyGuestRestrictions(widgets, {
      id: 'member-1',
      role: 'member',
    });

    expect(presented).toHaveLength(3);
    expect(presented.every((widget) => widget.masked === false)).toBe(true);
  });

  it('契約プラン不足のウィジェットにロックを付与する', () => {
    const planWidgets: WidgetDefinition[] = [
      {
        id: 'advanced',
        title: '高度分析',
        minimumPlan: 'premium',
        content: { description: 'advanced analytics' },
      },
    ];

    const presented = applyGuestRestrictions(planWidgets, {
      id: 'member-2',
      role: 'member',
      plan: 'standard',
    });

    expect(presented).toHaveLength(1);
    expect(presented[0].locked).toBe(true);
    expect(presented[0].accessRestriction).toMatchObject({ type: 'plan' });
  });

  it('権限不足時はサマリーのみ表示し、サマリーがない場合は非表示にする', () => {
    const permissionWidgets: WidgetDefinition[] = [
      {
        id: 'admin-only',
        title: '管理レポート',
        requiredPermissions: ['dashboard.manage'],
        content: {
          compactSummary: [
            { id: 'metric', label: '指標', value: 42 },
            { id: 'trend', label: '推移', value: '+3' },
          ],
        },
      },
      {
        id: 'sensitive',
        title: '秘匿ログ',
        requiredPermissions: ['dashboard.audit'],
        content: { note: 'secret' },
      },
    ];

    const presented = applyGuestRestrictions(
      permissionWidgets,
      {
        id: 'member-3',
        role: 'member',
        permissions: ['dashboard.view'],
      },
      { permissions: ['dashboard.view'] },
    );

    const summaryOnly = presented.find((widget) => widget.id === 'admin-only');
    expect(summaryOnly?.accessRestriction).toMatchObject({ type: 'permission' });
    expect(summaryOnly?.content).toMatchObject({ summary: expect.any(Array) });
    expect(presented.find((widget) => widget.id === 'sensitive')).toBeUndefined();
  });
});

describe('buildWidgetGallery', () => {
  const catalog: WidgetCatalogEntry[] = [
    {
      id: 'burndown',
      title: 'バーンダウンチャート',
      description: 'スプリントの進捗を確認する折れ線チャート',
      tags: ['進捗', 'チャート'],
      preview: { type: 'line', dataset: 'burndown' },
    },
    {
      id: 'velocity',
      title: 'ベロシティトラッカー',
      description: '完了ポイントを追跡するメトリクス',
      tags: ['進捗', 'メトリクス'],
      preview: { type: 'metric', value: 32 },
    },
    {
      id: 'inbox',
      title: '通知インボックス',
      description: '重要なアクションを逃さないリスト',
      tags: ['通知'],
      preview: { type: 'list' },
    },
  ];

  it('検索語に一致するウィジェットとプレビューを返す', () => {
    const state = buildWidgetGallery(catalog, {
      query: '進捗',
      selectedId: 'velocity',
    });

    expect(state.results).toHaveLength(2);
    expect(state.results.map((item) => item.id)).toEqual(['burndown', 'velocity']);
    expect(state.results.every((item) => item.matchedKeywords.includes('進捗'))).toBe(
      true,
    );
    expect(state.preview?.id).toBe('velocity');
    expect(state.preview?.content).toMatchObject({ type: 'metric', value: 32 });
  });

  it('検索語が空の場合は全件をアルファベット順で返す', () => {
    const state = buildWidgetGallery(catalog);
    expect(state.results.map((item) => item.id)).toEqual([
      'burndown',
      'velocity',
      'inbox',
    ]);
    expect(state.preview?.id).toBe('burndown');
  });
});

describe('addWidgetToLayout', () => {
  const baseLayout: LayoutState = {
    id: 'layout-1',
    positions: {
      alpha: { x: 0, y: 0, w: 6, h: 3 },
      beta: { x: 6, y: 0, w: 6, h: 3 },
      gamma: { x: 0, y: 3, w: 6, h: 3 },
    },
    savedAt: '2024-03-01T00:00:00.000Z',
  };

  it('空き枠を探して即時配置する', () => {
    const updated = addWidgetToLayout(baseLayout, 'delta', {
      size: { w: 6, h: 3 },
      now: new Date('2024-03-02T00:00:00Z'),
    });

    expect(updated.positions.delta).toEqual({ x: 6, y: 3, w: 6, h: 3 });
    expect(updated.savedAt).toBe('2024-03-02T00:00:00.000Z');
    expect(baseLayout.positions.delta).toBeUndefined();
  });

  it('余白がない場合は新しい行の先頭に配置する', () => {
    const denseLayout: LayoutState = {
      ...baseLayout,
      positions: {
        alpha: { x: 0, y: 0, w: 6, h: 3 },
        beta: { x: 6, y: 0, w: 6, h: 3 },
        gamma: { x: 0, y: 3, w: 6, h: 3 },
        delta: { x: 6, y: 3, w: 6, h: 3 },
      },
    };

    const updated = addWidgetToLayout(denseLayout, 'epsilon', {
      size: { w: 4, h: 2 },
      gridColumns: 12,
      now: new Date('2024-03-03T00:00:00Z'),
    });

    expect(updated.positions.epsilon).toEqual({ x: 0, y: 6, w: 4, h: 2 });
  });

  it('配置操作を監査ログに記録する', () => {
    const audit: WidgetAuditLogEntry[] = [];
    const updated = addWidgetToLayout(baseLayout, 'zeta', {
      size: { w: 3, h: 2 },
      now: new Date('2024-03-02T12:00:00Z'),
      auditLog: audit,
      actorId: 'user-2',
    });

    expect(updated.positions.zeta).toBeDefined();
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      action: 'add',
      widgetId: 'zeta',
      actorId: 'user-2',
      timestamp: '2024-03-02T12:00:00.000Z',
    });
  });
});

describe('removeWidgetWithUndo / undoWidgetRemoval', () => {
  const layout: LayoutState = {
    id: 'layout-undo',
    positions: {
      alpha: { x: 0, y: 0, w: 4, h: 3 },
      beta: { x: 4, y: 0, w: 4, h: 3 },
    },
    savedAt: '2024-03-01T00:00:00.000Z',
  };

  it('削除時にUndoトークンを返し、期限内の復元を許可する', () => {
    const audit: WidgetAuditLogEntry[] = [];
    const now = new Date('2024-03-04T00:00:00Z');
    const result: WidgetRemovalResult = removeWidgetWithUndo(layout, 'beta', {
      now,
      auditLog: audit,
      actorId: 'user-1',
    });

    expect(result.layout.positions.beta).toBeUndefined();
    expect(result.undoToken).toBeDefined();
    expect(result.undoToken?.expiresAt).toBe('2024-03-04T00:00:05.000Z');

    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      action: 'remove',
      widgetId: 'beta',
      actorId: 'user-1',
      timestamp: '2024-03-04T00:00:00.000Z',
    });

    const restored = undoWidgetRemoval(result.layout, result.undoToken!, new Date('2024-03-04T00:00:03Z'));
    expect(restored.positions.beta).toEqual({ x: 4, y: 0, w: 4, h: 3 });
  });

  it('期限切れのUndoは無視する', () => {
    const now = new Date('2024-03-04T00:00:00Z');
    const result = removeWidgetWithUndo(layout, 'beta', { now });
    const expired = undoWidgetRemoval(result.layout, result.undoToken!, new Date('2024-03-04T00:00:06Z'));
    expect(expired.positions.beta).toBeUndefined();
  });
});

describe('Widget drag & keyboard reordering', () => {
  const layout: LayoutState = {
    id: 'layout-dnd',
    positions: {
      alpha: { x: 0, y: 0, w: 4, h: 3 },
      beta: { x: 4, y: 0, w: 4, h: 3 },
      gamma: { x: 8, y: 0, w: 4, h: 3 },
    },
    savedAt: '2024-03-01T00:00:00.000Z',
  };

  it('スナップグリッドで空き枠のプレビューを返す', () => {
    const preview = getWidgetDragPreview(layout, 'alpha', {
      pointer: { x: 6.2, y: 0.4 },
      gridColumns: 12,
    });

    expect(preview.position).toEqual({ x: 6, y: 3, w: 4, h: 3 });
  });

  it('ドラッグ終了時に新しい順序を保存する', () => {
    const reordered = reorderWidgetPosition(layout, 'beta', {
      pointer: { x: 0, y: 3 },
      gridColumns: 12,
      now: new Date('2024-03-05T00:00:00Z'),
    });

    expect(reordered.positions.beta).toEqual({ x: 0, y: 3, w: 4, h: 3 });
    expect(reordered.savedAt).toBe('2024-03-05T00:00:00.000Z');
  });

  it('キーボード操作で隣接ウィジェットと入れ替え、フォーカスを移動する', () => {
    const result: KeyboardMoveResult = moveWidgetWithKeyboard(
      layout,
      'beta',
      'left',
      { now: new Date('2024-03-06T00:00:00Z') },
    );

    expect(result.moved).toBe(true);
    expect(result.focusId).toBe('alpha');
    expect(result.layout.positions.alpha).toEqual({ x: 4, y: 0, w: 4, h: 3 });
    expect(result.layout.positions.beta).toEqual({ x: 0, y: 0, w: 4, h: 3 });
    expect(result.layout.savedAt).toBe('2024-03-06T00:00:00.000Z');
  });

  it('空き枠に移動できる場合はスワップなしで移動する', () => {
    const sparseLayout: LayoutState = {
      ...layout,
      positions: {
        alpha: { x: 0, y: 0, w: 4, h: 3 },
        beta: { x: 4, y: 0, w: 4, h: 3 },
      },
    };

    const result = moveWidgetWithKeyboard(sparseLayout, 'beta', 'right', {
      gridColumns: 12,
      now: new Date('2024-03-07T00:00:00Z'),
    });

    expect(result.moved).toBe(true);
    expect(result.focusId).toBe('beta');
    expect(result.layout.positions.beta).toEqual({ x: 5, y: 0, w: 4, h: 3 });
  });
});

describe('Widget size presets and responsive layout', () => {
  const widgets: WidgetDefinition[] = [
    {
      id: 'velocity',
      title: 'ベロシティ',
      content: {
        primaryMetrics: [
          { id: 'current', label: '現在', value: 35 },
          { id: 'target', label: '目標', value: 40 },
        ],
        secondaryMetrics: [{ id: 'trend', label: 'トレンド', value: '+5' }],
        sections: [
          {
            id: 'chart',
            items: [{ type: 'chart', series: [10, 20, 30] }],
          },
          {
            id: 'table',
            items: [{ type: 'table', rows: 4 }],
          },
        ],
        compactSummary: [
          { id: 'current', label: '現在', value: 35 },
          { id: 'trend', label: 'トレンド', value: '+5' },
        ],
      },
    },
    {
      id: 'inbox',
      title: '通知インボックス',
      content: {
        sections: [
          {
            id: 'list',
            items: [
              { id: 'n1', title: 'レビュー依頼', unread: true },
              { id: 'n2', title: '期日接近', unread: false },
            ],
          },
        ],
      },
    },
  ];

  const layout: LayoutState = {
    id: 'layout-responsive',
    positions: {
      velocity: { x: 0, y: 0, w: 6, h: 3 },
      inbox: { x: 6, y: 0, w: 3, h: 2 },
    },
    savedAt: '2024-03-01T00:00:00.000Z',
  };

  it('4種類以上のサイズプリセットを列幅に応じて提供する', () => {
    const presets = getWidgetSizePresets(12);
    expect(presets.map((preset) => preset.id)).toEqual(['s', 'm', 'l', 'xl']);

    const narrowPresets = getWidgetSizePresets(5);
    expect(narrowPresets.map((preset) => preset.id)).toEqual(['s', 'm']);
  });

  it('サイズ変更時に空き枠へ移動しつつ順序を保持する', () => {
    const updated = resizeWidgetInLayout(layout, 'inbox', 'xl', {
      gridColumns: 12,
      now: new Date('2024-03-08T00:00:00Z'),
    });

    expect(updated.positions.inbox).toMatchObject({ w: 8, h: 4 });
    expect(updated.positions.inbox.x).toBeLessThanOrEqual(4);
    expect(updated.savedAt).toBe('2024-03-08T00:00:00.000Z');
  });

  it('ビューポート幅に応じてレイアウトモードとカラムを切り替える', () => {
    const wide = buildResponsiveWidgetPresentations(widgets, layout, {
      viewportWidth: 1280,
      gridColumns: 12,
      user: { id: 'member-1', role: 'member' },
    });

    const wideVelocity = wide.find((widget) => widget.id === 'velocity');
    expect(wideVelocity?.layoutMode).toBe('full');
    expect(wideVelocity?.columns).toBe(4);
    expect(wideVelocity?.sections?.map((section) => section.column)).toEqual([1, 2, 3, 4]);

    const compact = buildResponsiveWidgetPresentations(widgets, layout, {
      viewportWidth: 280,
      gridColumns: 12,
      user: { id: 'member-1', role: 'member' },
    });

    const compactVelocity = compact.find((widget) => widget.id === 'velocity');
    expect(compactVelocity?.layoutMode).toBe('compact');
    expect(compactVelocity?.columns).toBe(1);
    expect(compactVelocity?.sections?.[0].items).toHaveLength(2);
    expect(compactVelocity?.sections?.[0].id).toBe('compact-summary');
  });
});

describe('Dashboard presets management', () => {
  const userLayout: LayoutState = {
    id: 'layout-user',
    positions: {
      alpha: { x: 0, y: 0, w: 4, h: 3 },
      custom: { x: 4, y: 0, w: 4, h: 3 },
    },
    savedAt: '2024-03-01T00:00:00.000Z',
  };

  const preset: DashboardPreset = {
    id: 'preset-team',
    name: 'チーム既定',
    version: 2,
    publishedAt: '2024-03-10T00:00:00.000Z',
    description: '最新の管理者プリセット',
    layout: {
      id: 'layout-team',
      positions: {
        alpha: { x: 2, y: 0, w: 6, h: 3 },
        beta: { x: 0, y: 3, w: 4, h: 2 },
      },
      savedAt: '2024-03-09T00:00:00.000Z',
    },
  };

  it('プリセットとの差分を抽出する', () => {
    const diff = diffPresetAgainstLayout(preset, userLayout);

    expect(diff.additions).toEqual([
      {
        widgetId: 'beta',
        to: { x: 0, y: 3, w: 4, h: 2 },
      },
    ]);
    expect(diff.removals).toEqual([
      {
        widgetId: 'custom',
        from: { x: 4, y: 0, w: 4, h: 3 },
      },
    ]);
    expect(diff.updates).toHaveLength(1);
    expect(diff.updates[0]).toMatchObject({
      widgetId: 'alpha',
      positionChanged: true,
      sizeChanged: true,
    });
  });

  it('差分を適用しつつユーザーカスタムを保持する', () => {
    const audit: WidgetAuditLogEntry[] = [];
    const result = mergePresetIntoLayout(userLayout, preset, {
      gridColumns: 12,
      now: new Date('2024-03-10T01:00:00Z'),
      auditLog: audit,
      actorId: 'admin-1',
    });

    expect(result.layout.savedAt).toBe('2024-03-10T01:00:00.000Z');
    expect(result.layout.positions.beta).toEqual({ x: 0, y: 3, w: 4, h: 2 });
    expect(result.layout.positions.alpha).toMatchObject({ w: 6, h: 3 });
    expect(result.layout.positions.alpha.x).toBeGreaterThanOrEqual(0);
    expect(result.layout.positions.alpha.y).toBeGreaterThanOrEqual(0);
    expect(result.layout.positions.custom).toBeDefined();

    expect(result.applied.additions.map((item) => item.widgetId)).toEqual(['beta']);
    expect(result.applied.updates.map((item) => item.widgetId)).toEqual(['alpha']);
    expect(result.skipped.removals.map((item) => item.widgetId)).toEqual(['custom']);
    expect(result.applied.updates[0]).toMatchObject({
      positionChanged: true,
      sizeChanged: true,
    });

    expect(audit.map((entry) => entry.action)).toEqual(
      expect.arrayContaining(['add', 'move', 'resize']),
    );
  });

  it('プリセット更新通知を生成する', () => {
    const previous: DashboardPreset = {
      id: 'preset-team',
      name: 'チーム既定',
      version: 1,
      publishedAt: '2024-03-01T00:00:00.000Z',
      layout: {
        id: 'layout-team-v1',
        positions: {
          alpha: { x: 0, y: 0, w: 4, h: 3 },
          legacy: { x: 4, y: 0, w: 4, h: 3 },
        },
        savedAt: '2024-03-01T00:00:00.000Z',
      },
    };

    const notification = buildPresetUpdateNotification(previous, preset, [
      { id: 'alpha', title: 'ベロシティ', content: {} },
      { id: 'beta', title: '新しいKPI', content: {} },
      { id: 'legacy', title: '旧ウィジェット', content: {} },
    ]);

    expect(notification.headline).toBe('プリセット「チーム既定」が更新されました');
    expect(notification.summary).toBe('4件の変更があります');
    expect(notification.changes.map((change) => change.type)).toEqual(
      expect.arrayContaining(['added', 'removed', 'moved', 'resized']),
    );
  });
});
