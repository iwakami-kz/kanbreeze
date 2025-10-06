import { describe, expect, it } from 'vitest';

import {
  applyGuestRestrictions,
  buildHomeExperience,
  buildProjectComparison,
  buildSprintSummary,
  toggleSectionPresentation,
  type HomeExperienceInput,
  type ProjectSnapshot,
  type SectionState,
  type WidgetDefinition,
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
});
