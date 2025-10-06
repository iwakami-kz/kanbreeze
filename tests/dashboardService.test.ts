import { describe, expect, it } from 'vitest';

import {
  addWidgetToLayout,
  analyseCommentEngagement,
  applyBrandThemeCustomisation,
  applyDashboardSecurityGuards,
  applyGuestRestrictions,
  applyNotificationMuteRules,
  buildAccessibilitySupport,
  buildAlertBannerState,
  buildCommandPalette,
  buildEmbeddedWidgetConfig,
  buildHomeExperience,
  buildNotificationInbox,
  buildPresetUpdateNotification,
  buildPresetUpdateNotification,
  buildProjectComparison,
  buildQuickFilterState,
  buildResponsiveWidgetPresentations,
  buildSemanticThemeTokens,
  buildServiceStatusWidget,
  buildSprintInsightCharts,
  buildSprintSummary,
  buildThemePalette,
  buildUnifiedSearchSuggestions,
  buildWidgetGallery,
  calculateFlowIndicators,
  createShareableDashboardLink,
  diffPresetAgainstLayout,
  evaluateBacklogHealth,
  evaluateSearchAndFilterPerformance,
  generateDailyDigest,
  getWidgetDragPreview,
  getWidgetSizePresets,
  mergePresetIntoLayout,
  moveWidgetWithKeyboard,
  optimiseDashboardLoading,
  planResponsiveDashboardLayout,
  prepareCsvExportPlan,
  prepareSnapshotExport,
  removeWidgetWithUndo,
  reorderWidgetPosition,
  resolveMotionPreferences,
  resolveRealtimeDataState,
  resolveThemeMode,
  resizeWidgetInLayout,
  saveDashboardFilter,
  scheduleDashboardPdfDelivery,
  summariseOverdueTickets,
  toggleSectionPresentation,
  undoWidgetRemoval,
} from '../src/dashboard/dashboardService';

import type {
  LayoutState,
  KeyboardMoveResult,
  HomeExperienceInput,
  DashboardPreset,
  ProjectSnapshot,
  SectionState,
  WidgetCatalogEntry,
  WidgetDefinition,
  WidgetAuditLogEntry,
  WidgetRemovalResult,
  SprintInsightInput,
  KanbanLaneStatus,
  FlowMetricSample,
  TicketInsight,
  CommentThreadSummary,
  BacklogItemSummary,
  NotificationEvent,
  NotificationMuteRule,
  CriticalAlertEvent,
  DailyDigestInput,
  UnifiedSearchEntity,
  DashboardFilterDefinition,
  FilterShareOptions,
  CommandDefinition,
  QuickFilterInput,
  SearchPerformanceMetrics,
  ShareLinkOptions,
  SnapshotExportInput,
  PdfScheduleInput,
  EmbedWidgetInput,
  CsvExportOptions,
  LoadingDiagnosticsInput,
  SecurityDataRequest,
  SecurityContext,
  AccessibilityInput,
  ResponsiveLayoutInput,
  RealtimeStateOptions,
  ServiceIncident,
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

describe('buildSprintInsightCharts', () => {
  const input: SprintInsightInput = {
    burndown: [
      { date: '2024-03-01', remaining: 40 },
      { date: '2024-03-02', remaining: null },
      { date: '2024-03-03', remaining: 28 },
      { date: '2024-03-04', remaining: 20 },
    ],
    burnup: [
      { date: '2024-03-01', completed: 0, scope: 40 },
      { date: '2024-03-02', completed: null, scope: 44 },
      { date: '2024-03-03', completed: 18, scope: null },
      { date: '2024-03-04', completed: 26, scope: 45 },
    ],
    cumulativeFlow: [
      { date: '2024-03-01', backlog: 25, inProgress: 10, done: 5 },
      { date: '2024-03-02', backlog: null, inProgress: 12, done: 6 },
      { date: '2024-03-03', backlog: 24, inProgress: null, done: 8 },
      { date: '2024-03-04', backlog: 23, inProgress: 14, done: 9 },
    ],
    focusRange: { start: '2024-03-04', end: '2024-03-02' },
  };

  it('3種類のチャートと欠損範囲、インタラクション設定を返す', () => {
    const state = buildSprintInsightCharts(input);

    expect(state.charts).toHaveLength(3);
    expect(state.focusRange).toEqual({ start: '2024-03-02', end: '2024-03-04' });

    const burndown = state.charts.find((chart) => chart.id === 'burndown');
    expect(burndown?.series[0].points).toHaveLength(3);
    expect(burndown?.series[0].points.some((point) => point.value === null)).toBe(true);
    expect(burndown?.missingRanges[0]).toEqual({ start: '2024-03-02', end: '2024-03-03' });
    expect(burndown?.interactions).toEqual({ zoom: true, rangeSelection: true });

    const burnup = state.charts.find((chart) => chart.id === 'burnup');
    expect(burnup?.series).toHaveLength(2);
    expect(burnup?.missingRanges.length).toBeGreaterThan(0);
  });
});

describe('calculateFlowIndicators', () => {
  const lanes: KanbanLaneStatus[] = [
    { id: 'todo', name: 'To Do', wipLimit: 5, currentWip: 4 },
    { id: 'doing', name: 'Doing', wipLimit: 3, currentWip: 5 },
  ];

  const samples: FlowMetricSample[] = [
    { leadTimeHours: 24, cycleTimeHours: 12 },
    { leadTimeHours: 30, cycleTimeHours: 15 },
    { leadTimeHours: 48, cycleTimeHours: 20 },
  ];

  it('WIP超過の警告と指標統計を返す', () => {
    const state = calculateFlowIndicators(lanes, samples, {
      now: new Date('2024-03-10T00:00:00Z'),
    });

    expect(state.warnings).toHaveLength(1);
    expect(state.warnings[0]).toMatchObject({
      laneId: 'doing',
      severity: 'critical',
    });

    expect(state.leadTime).toMatchObject({ median: 30, sampleSize: 3 });
    expect(state.cycleTime.p90).toBeCloseTo(19, 0);
    expect(state.refreshedAt).toBe('2024-03-10T00:00:00.000Z');
  });

  it('フィルタ適用時に統計を再計算し、フィルタ情報を保持する', () => {
    const state = calculateFlowIndicators(lanes, samples.slice(0, 1), {
      now: new Date('2024-03-11T00:00:00Z'),
      filters: { projectId: 'alpha' },
    });

    expect(state.leadTime).toMatchObject({ median: 24, p90: 24, sampleSize: 1 });
    expect(state.filters).toEqual({ projectId: 'alpha' });
  });
});

describe('summariseOverdueTickets', () => {
  const tickets: TicketInsight[] = [
    {
      id: 't1',
      title: 'テストチケット1',
      dueDate: '2024-03-01',
      completed: false,
      assigneeId: 'u1',
      assigneeName: 'Alice',
      labels: ['frontend', 'bug'],
    },
    {
      id: 't2',
      title: 'テストチケット2',
      dueDate: '2024-02-28',
      completed: false,
      assigneeId: 'u2',
      assigneeName: 'Bob',
      labels: [],
    },
    {
      id: 't3',
      title: '完了済み',
      dueDate: '2024-02-27',
      completed: true,
    },
    {
      id: 't4',
      title: '未来期日',
      dueDate: '2024-03-10',
      completed: false,
      assigneeId: 'u3',
      assigneeName: 'Carol',
    },
  ];

  it('期日超過チケットと担当者別集計、エクスポートメタを生成する', () => {
    const summary = summariseOverdueTickets(tickets, {
      now: new Date('2024-03-05T00:00:00Z'),
      filters: { sprint: '2024-03' },
    });

    expect(summary.tickets).toHaveLength(2);
    expect(summary.tickets[0]).toMatchObject({ badge: '超過' });
    expect(summary.aggregation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'u1', count: 1 }),
        expect.objectContaining({ key: 'u2', count: 1 }),
      ]),
    );
    expect(summary.export.metadata).toMatchObject({
      filters: { sprint: '2024-03' },
      aggregation: 'assignee',
    });
  });

  it('ラベル別集計を返す', () => {
    const summary = summariseOverdueTickets(tickets, {
      now: new Date('2024-03-05T00:00:00Z'),
      aggregation: 'label',
    });

    expect(summary.aggregation.map((row) => row.label)).toEqual(
      expect.arrayContaining(['frontend', 'bug', '未設定']),
    );
  });
});

describe('analyseCommentEngagement', () => {
  const threads: CommentThreadSummary[] = [
    {
      id: 'thread-1',
      lastCommentAt: '2024-03-01T00:00:00Z',
      lastRespondedAt: '2024-02-29T12:00:00Z',
      unreadMentions: 2,
      weeklyActivity: [
        { weekStart: '2024-02-26', commentCount: 4, averageThreadDurationHours: 12 },
      ],
    },
    {
      id: 'thread-2',
      lastCommentAt: '2024-03-04T12:00:00Z',
      lastRespondedAt: '2024-03-04T13:00:00Z',
      unreadMentions: 1,
      weeklyActivity: [
        { weekStart: '2024-02-26', commentCount: 2, averageThreadDurationHours: 8 },
        { weekStart: '2024-03-04', commentCount: 5, averageThreadDurationHours: 10 },
      ],
    },
  ];

  it('要返信リスト、トレンド、未読メンション数を集計する', () => {
    const state = analyseCommentEngagement(threads, {
      now: new Date('2024-03-05T12:00:00Z'),
    });

    expect(state.needsResponse).toEqual([
      expect.objectContaining({ threadId: 'thread-1' }),
    ]);
    expect(state.unreadMentionCount).toBe(3);
    expect(state.trend.labels).toEqual(['2024-02-26', '2024-03-04']);
    expect(state.trend.commentCount).toEqual([6, 5]);
    expect(state.trend.averageThreadDurationHours[0]).toBeCloseTo(10, 1);
    expect(state.generatedAt).toBe('2024-03-05T12:00:00.000Z');
  });
});

describe('evaluateBacklogHealth', () => {
  const items: BacklogItemSummary[] = [
    {
      id: 'b1',
      title: '古い未見積',
      estimate: null,
      updatedAt: '2024-01-01T00:00:00Z',
      priority: 'high',
    },
    {
      id: 'b2',
      title: '優先度未設定',
      estimate: 3,
      updatedAt: '2024-02-20T00:00:00Z',
      priority: null,
    },
    {
      id: 'b3',
      title: '古い優先度未設定',
      estimate: 5,
      updatedAt: '2023-12-15T00:00:00Z',
      priority: null,
    },
    {
      id: 'b4',
      title: '新しい未見積',
      updatedAt: '2024-03-01T00:00:00Z',
      priority: 'low',
    },
  ];

  it('バックログ健全性の指標と詳細リストを返す', () => {
    const state = evaluateBacklogHealth(items, {
      now: new Date('2024-03-31T00:00:00Z'),
    });

    expect(state.unestimated.count).toBe(2);
    expect(state.unestimated.topItems[0].id).toBe('b1');
    expect(state.stale.count).toBe(3);
    expect(state.priorityMissing).toMatchObject({ warning: true, count: 2 });
    expect(state.summary).toMatchObject({ total: 4, evaluatedAt: '2024-03-31T00:00:00.000Z' });
  });
});

describe('buildThemePalette', () => {
  it('ライトテーマでWCAG準拠のコントラストを維持する', () => {
    const palette = buildThemePalette('soft-light', { mode: 'light' });

    expect(palette.mode).toBe('light');
    expect(palette.compliance.surfaceContrast).toBeGreaterThanOrEqual(4.5);
    expect(palette.compliance.textOnPrimaryContrast).toBeGreaterThanOrEqual(4.5);
    expect(palette.core.primarySoft).not.toBe(palette.core.primaryStrong);
    expect(palette.semantic.surface).not.toBe(palette.semantic.surfaceElevated);
    expect(palette.semantic.focusRing).toMatch(/^#/);
  });

  it('ダークテーマでも視認性を確保する', () => {
    const palette = buildThemePalette('warm-pastel', { mode: 'dark' });

    expect(palette.mode).toBe('dark');
    expect(palette.compliance.surfaceContrast).toBeGreaterThanOrEqual(4.5);
    expect(palette.core.neutralSurface).not.toBe(palette.core.neutralSurfaceAlt);
  });
});

describe('resolveThemeMode', () => {
  it('高コントラスト設定を優先しアニメーションを抑制する', () => {
    const resolution = resolveThemeMode({
      userPreference: 'auto',
      systemColorScheme: 'dark',
      systemContrast: 'high',
      reduceMotion: true,
      lastMode: 'high-contrast',
    });

    expect(resolution.mode).toBe('high-contrast');
    expect(resolution.animate).toBe(false);
    expect(resolution.transitionDuration).toBe(0);
    expect(resolution.changed).toBe(false);
    expect(resolution.source).toBe('system-contrast');
  });

  it('ユーザー指定を優先してモードを更新する', () => {
    const resolution = resolveThemeMode({
      userPreference: 'light',
      systemColorScheme: 'dark',
      lastMode: 'dark',
    });

    expect(resolution.mode).toBe('light');
    expect(resolution.animate).toBe(true);
    expect(resolution.transitionDuration).toBeGreaterThanOrEqual(200);
    expect(resolution.changed).toBe(true);
    expect(resolution.source).toBe('user');
  });
});

describe('buildSemanticThemeTokens', () => {
  it('セマンティックトークンと8ptグリッドを生成する', () => {
    const palette = buildThemePalette('calm-mint', { mode: 'dark' });
    const tokens = buildSemanticThemeTokens(palette);

    expect(tokens.tokens['kb-semantic-surface']).toBe(palette.semantic.surface);
    expect(tokens.tokens['kb-semantic-focus-ring']).toBe(palette.semantic.focusRing);
    expect(tokens.grid.baseUnit).toBe(8);
    expect(tokens.grid.scale).toHaveLength(11);
    expect(tokens.grid.scale.every((value, index) => value === index * 8)).toBe(true);
    expect(tokens.focusRing.color).toBe(palette.semantic.focusRing);
    expect(tokens.focusRing.style).toContain(palette.semantic.focusRing);
  });
});

describe('resolveMotionPreferences', () => {
  it('OSのリデュースモーション設定を尊重する', () => {
    const prefs = resolveMotionPreferences({ prefersReducedMotion: true, userSetting: 'expressive' });

    expect(prefs.motionEnabled).toBe(false);
    expect(prefs.durations).toEqual({ gentle: 0, standard: 0, emphasized: 0 });
    expect(prefs.easing).toEqual({ enter: 'linear', exit: 'linear' });
  });

  it('穏やかなモーション設定を返す', () => {
    const prefs = resolveMotionPreferences({ userSetting: 'expressive' });

    expect(prefs.motionEnabled).toBe(true);
    expect(prefs.durations.emphasized).toBeGreaterThan(prefs.durations.standard);
    expect(prefs.durations.standard).toBeGreaterThan(prefs.durations.gentle);
    expect(prefs.easing.enter).toContain('cubic-bezier');
  });
});

describe('applyBrandThemeCustomisation', () => {
  it('ブランドカラーを検証しテナントへ配布する', () => {
    const basePalette = buildThemePalette('soft-light', { mode: 'light' });
    const result = applyBrandThemeCustomisation(basePalette, {
      brandName: 'Acme',
      primaryColor: '#dde5ff',
      accentColor: '#ffeeaa',
      tenants: [
        { id: 'tenant-1', allowBranding: true },
        { id: 'tenant-2', allowBranding: false },
        { id: 'tenant-3', allowBranding: true, preferredMode: 'dark' },
      ],
    });

    expect(result.palette.core.primary).not.toBe('#DDE5FF');
    expect(result.palette.compliance.adjustments.some((adj) => adj.token === 'core.primary')).toBe(true);
    expect(result.palette.compliance.textOnPrimaryContrast).toBeGreaterThanOrEqual(4.5);
    expect(result.issues.some((issue) => issue.includes('ブランドカラー'))).toBe(true);
    expect(result.palette.compliance.warnings).toEqual(result.issues);

    expect(result.distribution).toEqual([
      { tenantId: 'tenant-1', applied: true },
      { tenantId: 'tenant-2', applied: false, reason: 'branding-disabled' },
      { tenantId: 'tenant-3', applied: false, reason: 'mode-mismatch' },
    ]);
  });
});

describe('buildNotificationInbox', () => {
  const events: NotificationEvent[] = [
    {
      id: 'n1',
      projectId: 'p1',
      projectName: 'Alpha',
      type: 'mention',
      importance: 'high',
      title: 'メンション',
      message: 'コメントで言及されました',
      createdAt: '2024-03-30T00:00:00Z',
    },
    {
      id: 'n2',
      projectId: 'p2',
      projectName: 'Beta',
      type: 'due',
      importance: 'medium',
      title: '期日接近',
      message: 'タスクの期限が迫っています',
      createdAt: '2024-03-29T23:00:00Z',
      readAt: '2024-03-29T23:30:00Z',
    },
    {
      id: 'n3',
      projectId: 'p1',
      projectName: 'Alpha',
      type: 'review',
      importance: 'critical',
      title: 'レビュー依頼',
      message: '重要なレビューが割り当てられました',
      createdAt: '2024-03-30T01:00:00Z',
    },
  ];

  it('フィルタと未読数を正しく計算する', () => {
    const state = buildNotificationInbox(events, {
      filters: {
        projectIds: ['p1'],
        types: ['mention', 'review'],
        importance: ['high', 'critical'],
      },
      now: new Date('2024-03-30T02:00:00Z'),
    });

    expect(state.items.map((item) => item.id)).toEqual(['n3', 'n1']);
    expect(state.unreadCount).toBe(2);
    expect(state.filteredUnreadCount).toBe(2);
    expect(state.items[0].receivedAgoMinutes).toBe(60);
    expect(state.facets.projects[0]).toMatchObject({ id: 'p1', count: 2 });
    expect(state.badgeCount).toBe(2);
  });
});

describe('applyNotificationMuteRules', () => {
  const events: NotificationEvent[] = [
    {
      id: 'm1',
      projectId: 'p1',
      type: 'mention',
      importance: 'medium',
      title: '通常メンション',
      message: '通常の通知',
      createdAt: '2024-03-30T00:10:00Z',
    },
    {
      id: 'm2',
      projectId: 'p1',
      type: 'mention',
      importance: 'critical',
      title: '重大メンション',
      message: '必ず確認してください',
      createdAt: '2024-03-30T00:30:00Z',
    },
    {
      id: 'm3',
      projectId: 'p2',
      type: 'digest',
      importance: 'low',
      title: 'ダイジェスト',
      message: 'まとめ情報',
      createdAt: '2024-03-30T00:45:00Z',
    },
  ];

  const rules: NotificationMuteRule[] = [
    {
      type: 'mention',
      createdAt: '2024-03-29T00:00:00Z',
      until: '2024-03-31T00:00:00Z',
    },
    {
      type: 'digest',
      createdAt: '2024-03-29T00:00:00Z',
    },
  ];

  it('重大アラートを除き通知をミュートし、サマリーを生成する', () => {
    const now = new Date('2024-03-30T01:00:00Z');
    const result = applyNotificationMuteRules(events, rules, { now });

    expect(result.delivered.map((event) => event.id)).toEqual(['m2']);
    expect(result.suppressed.map((event) => event.id)).toEqual(['m1', 'm3']);

    const unmutedSummary = applyNotificationMuteRules(events, rules, {
      now,
      unmutedTypes: ['mention'],
    });

    expect(unmutedSummary.summary).toHaveLength(1);
    expect(unmutedSummary.summary[0]).toMatchObject({ type: 'mention', count: 1 });
  });
});

describe('buildAlertBannerState', () => {
  const alerts: CriticalAlertEvent[] = [
    {
      id: 'a1',
      title: 'SLA違反',
      severity: 'critical',
      category: 'sla',
      occurredAt: '2024-03-30T00:00:00Z',
      actionUrl: '/status/sla',
    },
    {
      id: 'a0',
      title: '過去のインシデント',
      severity: 'critical',
      category: 'security',
      occurredAt: '2024-03-29T00:00:00Z',
      resolvedAt: '2024-03-29T01:00:00Z',
      recommendedActions: ['根本原因をレビューする'],
    },
  ];

  it('アクティブな重大アラートと履歴を返す', () => {
    const state = buildAlertBannerState(alerts, {
      now: new Date('2024-03-30T01:00:00Z'),
      historyLimit: 3,
    });

    expect(state.banner?.id).toBe('a1');
    expect(state.banner?.actions[0].url).toBe('/status/sla');
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({ id: 'a0', durationMinutes: 60 });
  });
});

describe('generateDailyDigest', () => {
  const digestInput: DailyDigestInput = {
    schedule: { date: '2024-03-30', hour: 9, minute: 0, timeZone: 'Asia/Tokyo' },
    channels: ['email', 'app', 'email'],
    widgetPreferences: [
      { id: 'progress', title: '進捗', enabled: true },
      { id: 'overdue', title: '期日超過', enabled: false },
      { id: 'comments', title: 'コメント', enabled: true },
      { id: 'blockers', title: 'ブロッカー', enabled: true },
    ],
    progressUpdates: [
      { projectId: 'p1', projectName: 'Alpha', completedPoints: 12, deltaPoints: 5 },
    ],
    overdueTickets: [
      { id: 't1', title: '対応タスク', dueDate: '2024-03-30', assignee: 'U1' },
    ],
    commentHighlights: [
      { threadId: 'c1', excerpt: 'レビューをお願いします', unresolved: true, url: '/comments/1' },
    ],
    blockers: [
      { id: 'b1', description: 'API障害', owner: 'Ops', status: 'open', url: '/blockers/1' },
    ],
    now: new Date('2024-03-29T23:00:00Z'),
  };

  it('選択されたウィジェットのみで日次ダイジェストを生成する', () => {
    const digest = generateDailyDigest(digestInput);

    expect(digest.sections.map((section) => section.id)).toEqual([
      'progress',
      'comments',
      'blockers',
    ]);
    expect(digest.excludedWidgets).toContain('overdue');
    expect(digest.channels).toEqual(['email', 'app']);
    expect(digest.scheduledFor).toContain('2024-03-30T09:00:00');
  });
});

describe('buildUnifiedSearchSuggestions', () => {
  const entities: UnifiedSearchEntity[] = [
    {
      id: 'ticket-1',
      type: 'ticket',
      title: 'Alphaの改善タスク',
      snippet: 'Alphaに関する更新',
      url: '/tickets/1',
      updatedAt: '2024-03-28T00:00:00Z',
      keywords: ['改善', 'alpha'],
    },
    {
      id: 'comment-1',
      type: 'comment',
      title: 'Betaの議論',
      snippet: 'betaでのコメント',
      url: '/comments/1',
      updatedAt: '2024-03-29T00:00:00Z',
      keywords: ['beta'],
    },
  ];

  it('横断検索候補と履歴を提供する', () => {
    const state = buildUnifiedSearchSuggestions('Alpha', entities, {
      history: [{ query: 'retro', executedAt: '2024-03-20T00:00:00Z' }],
    });

    expect(state.suggestions).toHaveLength(1);
    expect(state.suggestions[0].id).toBe('ticket-1');
    expect(state.history[0].query).toBe('Alpha');
    expect(state.activeIndex).toBe(0);
  });
});

describe('saveDashboardFilter', () => {
  const definition: DashboardFilterDefinition = {
    name: '重要フィルタ',
    description: '重要な案件のみ',
    visibility: 'team',
    filters: {
      project: 'p1',
      labels: ['urgent'],
    },
  };

  const previous: FilterShareOptions['previousVersion'] = {
    id: 'filter-1',
    name: '重要フィルタ',
    description: '旧バージョン',
    visibility: 'team',
    filters: { project: 'p2' },
    version: 1,
    updatedAt: '2024-03-20T00:00:00Z',
    updatedBy: 'user-1',
    shareUrl: 'https://app.example.com/dashboard?project=p2',
    watchers: ['user-2'],
  };

  it('フィルタを保存し差分通知を生成する', () => {
    const result = saveDashboardFilter(definition, {
      baseUrl: 'https://app.example.com/dashboard',
      userId: 'user-1',
      watchers: ['user-2'],
      previousVersion: previous,
      now: new Date('2024-03-30T00:00:00Z'),
    });

    expect(result.filter.shareUrl).toContain('project=p1');
    expect(result.filter.version).toBe(2);
    expect(result.diff?.added).toContain('labels');
    expect(result.notify?.recipients).toEqual(['user-2']);
  });
});

describe('buildCommandPalette', () => {
  const commands: CommandDefinition[] = [
    {
      id: 'create-ticket',
      label: 'チケットを作成',
      action: 'ticket:create',
      keywords: ['ticket', 'new'],
      requiredPermissions: ['ticket.create'],
    },
    {
      id: 'admin-only',
      label: '管理者設定',
      action: 'open:admin',
      requiredPermissions: ['admin.manage'],
    },
  ];

  it('権限制御と検索を考慮してコマンド候補を返す', () => {
    const state = buildCommandPalette(commands, {
      query: 'ticket',
      permissions: ['ticket.create'],
    });

    expect(state.commands).toHaveLength(1);
    expect(state.commands[0].id).toBe('create-ticket');
    expect(state.commands[0].matchedKeywords).toContain('ticket');
    expect(state.totalAvailable).toBe(1);
  });
});

describe('buildQuickFilterState', () => {
  const input: QuickFilterInput = {
    periods: [
      { id: 'week', label: '今週', range: { start: '2024-03-25', end: '2024-03-31' } },
      { id: 'month', label: '今月', range: { start: '2024-03-01', end: '2024-03-31' } },
    ],
    assignees: [
      { id: 'a1', name: 'Alice' },
      { id: 'a2', name: 'Bob' },
    ],
    labels: [
      { id: 'bug', name: 'バグ' },
      { id: 'feature', name: '機能' },
    ],
    records: [
      {
        date: '2024-03-26',
        assigneeId: 'a1',
        labelIds: ['bug'],
        metrics: { velocity: 5, wip: 2 },
      },
      {
        date: '2024-03-27',
        assigneeId: 'a2',
        labelIds: ['feature'],
        metrics: { velocity: 3, wip: 1 },
      },
      {
        date: '2024-04-01',
        assigneeId: 'a1',
        labelIds: ['bug'],
        metrics: { velocity: 4, wip: 1 },
      },
    ],
    active: {
      periodId: 'week',
      assigneeIds: ['a1'],
      labelIds: ['bug'],
    },
  };

  it('クイックフィルタ適用後のKPIとチャートを返す', () => {
    const state = buildQuickFilterState(input);

    expect(state.kpis.velocity).toBe(5);
    expect(state.assignees.find((assignee) => assignee.id === 'a1')?.selected).toBe(true);
    expect(state.chart).toHaveLength(1);
    expect(state.chart[0]).toMatchObject({ date: '2024-03-26' });
  });
});

describe('evaluateSearchAndFilterPerformance', () => {
  it('インデックス遅延とエラーを検出する', () => {
    const metrics: SearchPerformanceMetrics = {
      indexUpdatedAt: '2024-03-30T00:00:00Z',
      now: new Date('2024-03-30T00:12:00Z'),
      samples: [
        { query: 'alpha', p95Ms: 1200, errorCount: 0 },
        { query: 'beta', p95Ms: 800, errorCount: 1 },
      ],
      contactUrl: 'https://support.example.com',
    };

    const state = evaluateSearchAndFilterPerformance(metrics);

    expect(state.indexFresh).toBe(false);
    expect(state.failingQueries).toHaveLength(2);
    expect(state.actions[0].url).toContain('support');
  });
});

describe('createShareableDashboardLink', () => {
  it('共有リンクを生成し監査ログを記録する', () => {
    const options: ShareLinkOptions = {
      dashboardId: 'dashboard-1',
      baseUrl: 'https://app.example.com',
      createdBy: 'user-1',
      expiresAt: '2024-04-01T00:00:00Z',
      password: 'secret',
      ipAllowList: ['192.0.2.0/24'],
      now: new Date('2024-03-30T00:00:00Z'),
    };

    const link = createShareableDashboardLink(options);

    expect(link.url).toContain('/share/dashboard-1?token=');
    expect(link.passwordProtected).toBe(true);
    expect(link.auditLog?.[0].details).toMatchObject({ dashboardId: 'dashboard-1' });
  });
});

describe('prepareSnapshotExport', () => {
  it('メタデータ付きでスナップショットのエクスポート計画を返す', () => {
    const input: SnapshotExportInput = {
      dashboardTitle: 'チームダッシュボード',
      format: 'pdf',
      filters: { project: 'p1', privateNotes: '秘密' },
      user: { id: 'user-1', name: 'Alice' },
      includePrivateData: false,
      now: new Date('2024-03-30T00:00:00Z'),
    };

    const plan = prepareSnapshotExport(input);

    expect(plan.filename).toContain('dashboard');
    expect(plan.metadata.filters).not.toHaveProperty('privateNotes');
    expect(plan.printStyles.background).toBe('#FFFFFF');
  });
});

describe('scheduleDashboardPdfDelivery', () => {
  it('定期PDF配信の次回実行とマスキング設定を算出する', () => {
    const input: PdfScheduleInput = {
      dashboardId: 'dashboard-1',
      recipients: [
        { id: 'user-1', email: 'a@example.com', permissions: ['dashboard.export'] },
        { id: 'user-2', email: 'b@example.com', permissions: ['dashboard.view'] },
      ],
      schedule: {
        dayOfWeek: 1,
        hour: 9,
        minute: 0,
        timeZone: 'Asia/Tokyo',
      },
      now: new Date('2024-03-25T10:00:00Z'),
      maskFields: ['cost'],
    };

    const plan = scheduleDashboardPdfDelivery(input);

    expect(plan.recipients).toHaveLength(1);
    expect(plan.maskFields).toContain('private');
    expect(plan.nextRun).toContain('09:00:00');
    expect(plan.notificationOnFailure).toBe(true);
  });
});

describe('buildEmbeddedWidgetConfig', () => {
  it('埋め込みウィジェットの有効性とCSPを返す', () => {
    const now = new Date('2024-03-30T00:10:00Z');
    const input: EmbedWidgetInput = {
      widgetId: 'velocity',
      origin: 'https://example.com',
      token: {
        token: 'signed-token',
        issuedAt: '2024-03-30T00:00:00Z',
        expiresAt: '2024-03-30T00:30:00Z',
        audience: 'velocity',
      },
      now,
    };

    const config = buildEmbeddedWidgetConfig(input);

    expect(config.valid).toBe(true);
    expect(config.headers['X-Embed-Token']).toBe('signed-token');
    expect(config.csp['frame-ancestors']).toBe('https://example.com');
  });
});

describe('prepareCsvExportPlan', () => {
  it('CSVエクスポートの分割計画を生成する', () => {
    const options: CsvExportOptions = {
      columns: [
        { key: 'id', label: 'ID', type: 'string' },
        { key: 'value', label: '値', type: 'number' },
      ],
      rows: [
        { id: '1', value: 10 },
        { id: '2', value: 20 },
        { id: '3', value: 30 },
      ],
      maxRowsPerFile: 2,
      locale: 'ja-JP',
    };

    const plan = prepareCsvExportPlan(options);

    expect(plan.files).toHaveLength(2);
    expect(plan.files[1].rowStart).toBe(2);
    expect(plan.columns[0].sample).toBe('1');
  });
});

describe('optimiseDashboardLoading', () => {
  it('読み込み優先度とアセット最適化を決定する', () => {
    const result = optimiseDashboardLoading({
      widgets: [
        { id: 'kpi', priority: 10, estimatedLoadMs: 200 },
        { id: 'chart', priority: 5, estimatedLoadMs: 500, hasHeavyAssets: true },
        { id: 'inbox', priority: 2, estimatedLoadMs: 150 },
      ],
      networkQuality: 'moderate',
    });

    expect(result.criticalWidgets).toContain('kpi');
    expect(result.lazyWidgets).toContain('inbox');
    expect(result.assetOptimisation[0]).toMatchObject({ id: 'chart', convertTo: 'webp' });
    expect(result.budgets.firstPaintMs).toBeGreaterThan(2000);
  });
});

describe('applyDashboardSecurityGuards', () => {
  it('テナント制御とマスキングを適用する', () => {
    const requests: SecurityDataRequest[] = [
      {
        resourceId: 'r1',
        tenantId: 'tenant-1',
        requiredPermissions: ['dashboard.view'],
      },
      {
        resourceId: 'r2',
        tenantId: 'tenant-2',
        requiredPermissions: ['dashboard.view'],
      },
      {
        resourceId: 'r3',
        tenantId: 'tenant-1',
        requiredPermissions: ['dashboard.admin'],
      },
      {
        resourceId: 'r4',
        tenantId: 'tenant-1',
        requiredPermissions: ['dashboard.view'],
        containsPersonalData: true,
      },
    ];

    const context: SecurityContext = {
      plan: 'standard',
      user: {
        id: 'user-1',
        tenantId: 'tenant-1',
        permissions: ['dashboard.view'],
      },
    };

    const result = applyDashboardSecurityGuards(requests, context);

    expect(result.authorised.map((request) => request.resourceId)).toContain('r1');
    expect(result.blocked.map((request) => request.resourceId)).toEqual(['r2', 'r3']);
    expect(result.masked[0]).toMatchObject({ resourceId: 'r4' });
  });
});

describe('buildAccessibilitySupport', () => {
  it('アクセシビリティの設定を返す', () => {
    const state = buildAccessibilitySupport({
      regions: [
        { id: 'main', role: 'main', label: 'メインコンテンツ' },
        { id: 'nav', role: 'navigation', label: 'ナビゲーション' },
      ],
      supportsReducedMotion: true,
      highContrastMode: true,
    });

    expect(state.landmarks).toHaveLength(2);
    expect(state.focusRing.width).toBe(3);
    expect(state.colorAnnotations[0]).toContain('色だけでなく');
    expect(state.reducedMotion).toBe(true);
  });
});

describe('planResponsiveDashboardLayout', () => {
  it('デバイス別レイアウトを返す', () => {
    const layout = planResponsiveDashboardLayout({
      widgets: [
        { id: 'kpi', minColumns: 1, maxColumns: 3, minHeight: 2 },
        { id: 'chart', minColumns: 2, maxColumns: 4, minHeight: 3 },
      ],
      breakpoints: { mobile: 320, tablet: 768, desktop: 1280 },
    });

    expect(layout.mobile[0].columns).toBe(1);
    expect(layout.tablet[1].columns).toBe(2);
    expect(layout.desktop[1].columns).toBe(4);
  });
});

describe('resolveRealtimeDataState', () => {
  it('リアルタイム状態とフォールバックを判定する', () => {
    const state = resolveRealtimeDataState({
      sources: [
        { id: 'primary', status: 'failed', lastUpdated: '2024-03-30T00:00:00Z' },
        { id: 'secondary', status: 'degraded', lastUpdated: '2024-03-30T00:05:00Z' },
      ],
      now: new Date('2024-03-30T00:10:00Z'),
    });

    expect(state.mode).toBe('fallback');
    expect(state.degradedSources).toHaveLength(1);
    expect(state.message).toContain('最後に取得');
  });
});

describe('buildServiceStatusWidget', () => {
  it('サービス状態とアナウンスを構築する', () => {
    const incidents: ServiceIncident[] = [
      {
        id: 'incident-1',
        status: 'outage',
        title: 'API障害',
        startedAt: '2024-03-30T00:00:00Z',
        updateUrl: 'https://status.example.com/incident-1',
      },
      {
        id: 'incident-0',
        status: 'degraded',
        title: '過去の障害',
        startedAt: '2024-03-29T00:00:00Z',
        resolvedAt: '2024-03-29T02:00:00Z',
        updateUrl: 'https://status.example.com/incident-0',
        impact: '復旧済みです',
      },
    ];

    const widget = buildServiceStatusWidget(incidents);

    expect(widget.status).toBe('outage');
    expect(widget.incidents).toHaveLength(2);
    expect(widget.announcement?.title).toContain('復旧');
  });
});

