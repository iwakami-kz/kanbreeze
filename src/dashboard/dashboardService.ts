export type UserRole = 'admin' | 'member' | 'guest';

export type SubscriptionPlan = 'free' | 'standard' | 'premium' | 'enterprise';

export interface UserContext {
  id: string;
  role: UserRole;
  savedLayout?: LayoutState;
  plan?: SubscriptionPlan;
  permissions?: string[];
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TaskSummary {
  id: string;
  assigneeId: string;
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'done';
}

export interface MentionSummary {
  id: string;
  read: boolean;
  createdAt: string;
}

export interface KPICardDefinition {
  id: string;
  label: string;
  value: number;
  unit?: string;
  importance: number;
}

export interface LayoutState {
  id: string;
  positions: Record<string, WidgetPosition>;
  savedAt: string;
}

export interface HomeExperienceInput {
  user: UserContext;
  tasks: TaskSummary[];
  mentions: MentionSummary[];
  kpiCards: KPICardDefinition[];
  defaultLayout: LayoutState;
  isLoading: boolean;
  now: Date;
}

export interface HomeCard<T = unknown> {
  id: string;
  title: string;
  items: T[];
  type: 'list' | 'metric';
  metadata?: Record<string, unknown>;
}

export interface HomeExperienceState {
  primaryCards: HomeCard[];
  kpiCards: HomeCard[];
  layout: LayoutState;
  showSkeleton: boolean;
}

export interface SprintSummaryInput {
  status: 'active' | 'not_planned' | 'completed';
  remainingDays?: number;
  committedPoints?: number;
  completedPoints?: number;
  burndown?: number[];
  reviewUrl?: string;
  summary?: string;
}

export interface SprintSummaryState {
  status: SprintSummaryInput['status'];
  content: Record<string, unknown>;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  progress: number;
  riskLevel: 'low' | 'medium' | 'high';
  resourceUtilisation: number;
  accessible: boolean;
  detailUrl: string;
}

export interface ProjectComparisonState {
  cards: Array<{
    id: string;
    name: string;
    progress: number;
    riskLevel: 'low' | 'medium' | 'high';
    resourceUtilisation: number;
    detailUrl: string;
  }>;
  restrictedCount: number;
}

export interface SectionState {
  id: string;
  isOpen: boolean;
  unreadCount: number;
  lastUpdated: string;
}

export interface SectionPresentation {
  id: string;
  isOpen: boolean;
  animationDuration: number;
  showUnreadBadge: boolean;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  requiresNonGuest?: boolean;
  isPrivate?: boolean;
  minimumPlan?: SubscriptionPlan;
  availablePlans?: SubscriptionPlan[];
  requiredPermissions?: string[];
  summaryFallback?: unknown[];
  content: Record<string, unknown>;
}

export interface WidgetPresentation {
  id: string;
  title: string;
  content: Record<string, unknown>;
  masked: boolean;
  locked?: boolean;
  accessRestriction?: WidgetAccessRestrictionInfo;
  sizeVariant?: WidgetSizeVariant;
  layoutMode?: 'full' | 'compact';
  columns?: number;
  sections?: WidgetSectionPresentation[];
}

export interface WidgetAccessRestrictionInfo {
  type: 'plan' | 'permission';
  message: string;
  fallbackMode: 'locked' | 'summary' | 'hidden';
  requiredPlan?: SubscriptionPlan;
  missingPermissions?: string[];
}

export interface WidgetAccessOptions {
  plan?: SubscriptionPlan;
  lockedWidgetIds?: string[];
  permissions?: string[];
}

export type WidgetSizeVariant = 's' | 'm' | 'l' | 'xl';

export interface WidgetSizePreset {
  id: WidgetSizeVariant;
  label: string;
  description: string;
  grid: { w: number; h: number };
  minViewportWidth: number;
}

export interface WidgetSectionPresentation {
  id: string;
  items: unknown[];
  column?: number;
}

export interface ResponsiveWidgetOptions extends WidgetPlacementOptions {
  viewportWidth: number;
  minColumnWidth?: number;
  user?: UserContext;
  subscriptionPlan?: SubscriptionPlan;
  lockedWidgetIds?: string[];
  permissions?: string[];
}

export interface WidgetCatalogEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  preview: Record<string, unknown>;
}

export interface WidgetGalleryOptions {
  query?: string;
  selectedId?: string;
  limit?: number;
}

export interface WidgetGalleryListItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  matchedKeywords: string[];
}

export interface WidgetGalleryState {
  query: string;
  results: WidgetGalleryListItem[];
  preview?: {
    id: string;
    title: string;
    content: Record<string, unknown>;
  };
}

const BASE_WIDGET_SIZE_PRESETS: WidgetSizePreset[] = [
  {
    id: 's',
    label: 'S',
    description: 'コンパクト情報カード',
    grid: { w: 3, h: 2 },
    minViewportWidth: 320,
  },
  {
    id: 'm',
    label: 'M',
    description: '標準的な統計カード',
    grid: { w: 4, h: 3 },
    minViewportWidth: 480,
  },
  {
    id: 'l',
    label: 'L',
    description: 'チャートと指標のハイブリッド',
    grid: { w: 6, h: 3 },
    minViewportWidth: 640,
  },
  {
    id: 'xl',
    label: 'XL',
    description: '詳細チャートとリストの大型表示',
    grid: { w: 8, h: 4 },
    minViewportWidth: 960,
  },
];

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'standard', 'premium', 'enterprise'];

const DEFAULT_PLAN: SubscriptionPlan = 'standard';

export interface WidgetPlacementOptions {
  size?: { w: number; h: number };
  gridColumns?: number;
  now?: Date;
  actorId?: string;
  auditLog?: WidgetAuditLogEntry[];
}

export type WidgetAuditAction = 'add' | 'remove' | 'move' | 'resize';

export interface WidgetAuditLogEntry {
  action: WidgetAuditAction;
  widgetId: string;
  actorId?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface WidgetRemovalToken {
  widgetId: string;
  position: WidgetPosition;
  expiresAt: string;
}

export interface WidgetRemovalResult {
  layout: LayoutState;
  undoToken?: WidgetRemovalToken;
}

export interface WidgetRemovalOptions {
  now?: Date;
  actorId?: string;
  auditLog?: WidgetAuditLogEntry[];
  undoDurationMs?: number;
}

export interface WidgetDragPreviewOptions extends WidgetPlacementOptions {
  pointer: { x: number; y: number };
}

export interface WidgetDragPreview {
  position: WidgetPosition;
}

export interface DashboardPreset {
  id: string;
  name: string;
  version: number;
  layout: LayoutState;
  description?: string;
  publishedAt: string;
}

export interface PresetDiffUpdate {
  widgetId: string;
  from?: WidgetPosition;
  to: WidgetPosition;
  positionChanged: boolean;
  sizeChanged: boolean;
}

export interface PresetDiff {
  additions: Array<{ widgetId: string; to: WidgetPosition }>;
  removals: Array<{ widgetId: string; from: WidgetPosition }>;
  updates: PresetDiffUpdate[];
}

export interface PresetMergeOptions extends WidgetPlacementOptions {
  applyAdditions?: boolean;
  applyUpdates?: boolean;
  applyRemovals?: boolean;
  preserveWidgetIds?: string[];
}

export interface PresetMergeResult {
  layout: LayoutState;
  applied: PresetDiff;
  skipped: PresetDiff;
}

export interface PresetUpdateNotificationChange {
  type: 'added' | 'removed' | 'moved' | 'resized';
  widgetId: string;
  label: string;
  detail: string;
}

export interface PresetUpdateNotification {
  presetId: string;
  version: number;
  publishedAt: string;
  headline: string;
  summary: string;
  changes: PresetUpdateNotificationChange[];
}

export type KeyboardDirection = 'left' | 'right' | 'up' | 'down';

export interface KeyboardMoveResult {
  layout: LayoutState;
  focusId: string;
  moved: boolean;
}

function clampKPICount(cards: KPICardDefinition[]): KPICardDefinition[] {
  if (cards.length < 3) {
    const padded = [...cards];
    while (padded.length < 3) {
      padded.push({
        id: `placeholder-${padded.length}`,
        label: 'Coming soon',
        value: 0,
        importance: 0,
      });
    }
    return padded;
  }

  if (cards.length > 6) {
    return [...cards]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 6);
  }

  return cards;
}

export function buildHomeExperience(input: HomeExperienceInput): HomeExperienceState {
  const primaryCards: HomeCard[] = [
    {
      id: 'my-tasks',
      title: 'マイタスク',
      type: 'list',
      items: input.tasks.filter(
        (task) => task.assigneeId === input.user.id && task.status !== 'done',
      ),
    },
    {
      id: 'due-soon',
      title: '期日接近',
      type: 'list',
      items: input.tasks.filter((task) => {
        if (!task.dueDate) return false;
        if (task.status === 'done') return false;
        const due = new Date(task.dueDate).getTime();
        const now = input.now.getTime();
        const threeDays = 1000 * 60 * 60 * 24 * 3;
        return due >= now && due - now <= threeDays;
      }),
    },
    {
      id: 'unread-mentions',
      title: '未読メンション',
      type: 'list',
      items: input.mentions.filter((mention) => !mention.read),
    },
  ];

  const kpiCards = clampKPICount(input.kpiCards).map((card) => ({
    id: card.id,
    title: card.label,
    type: 'metric',
    items: [card.value],
    metadata: {
      unit: card.unit,
    },
  }));

  const layout = input.user.savedLayout ?? input.defaultLayout;

  const showSkeleton = input.isLoading;

  return {
    primaryCards,
    kpiCards,
    layout,
    showSkeleton,
  };
}

export function buildSprintSummary(input: SprintSummaryInput): SprintSummaryState {
  switch (input.status) {
    case 'active':
      return {
        status: 'active',
        content: {
          remainingDays: input.remainingDays ?? 0,
          committedPoints: input.committedPoints ?? 0,
          completedPoints: input.completedPoints ?? 0,
          burndown: input.burndown ?? [],
        },
      };
    case 'not_planned':
      return {
        status: 'not_planned',
        content: {
          actions: [
            { label: 'スプリントを作成', action: 'create-sprint' },
            { label: 'ヘルプ', action: 'open-help' },
          ],
        },
      };
    case 'completed':
    default:
      return {
        status: 'completed',
        content: {
          reviewUrl: input.reviewUrl ?? '#',
          summary: input.summary ?? 'レビューを確認してください。',
        },
      };
  }
}

export function buildProjectComparison(projects: ProjectSnapshot[]): ProjectComparisonState {
  const cards = projects
    .filter((project) => project.accessible)
    .map((project) => ({
      id: project.id,
      name: project.name,
      progress: Math.max(0, Math.min(1, project.progress)),
      riskLevel: project.riskLevel,
      resourceUtilisation: Math.max(0, Math.min(1, project.resourceUtilisation)),
      detailUrl: project.detailUrl,
    }));

  const restrictedCount = projects.filter((project) => !project.accessible).length;

  return {
    cards,
    restrictedCount,
  };
}

export function toggleSectionPresentation(
  sections: SectionState[],
  sectionId: string,
): { updatedStates: SectionState[]; presentation: SectionPresentation } {
  const updatedStates = sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          isOpen: !section.isOpen,
          lastUpdated: new Date().toISOString(),
        }
      : section,
  );

  const target = updatedStates.find((section) => section.id === sectionId);
  if (!target) {
    throw new Error(`Unknown section: ${sectionId}`);
  }

  const animationDuration = 0.25;

  return {
    updatedStates,
    presentation: {
      id: target.id,
      isOpen: target.isOpen,
      animationDuration,
      showUnreadBadge: target.unreadCount > 0,
    },
  };
}

function normalisePlan(plan: SubscriptionPlan | undefined): SubscriptionPlan {
  if (!plan) {
    return DEFAULT_PLAN;
  }
  return PLAN_ORDER.includes(plan) ? plan : DEFAULT_PLAN;
}

function planRank(plan: SubscriptionPlan): number {
  const index = PLAN_ORDER.indexOf(plan);
  return index === -1 ? PLAN_ORDER.indexOf(DEFAULT_PLAN) : index;
}

function isPlanEligible(plan: SubscriptionPlan, widget: WidgetDefinition): boolean {
  const resolvedPlan = normalisePlan(plan);
  if (widget.availablePlans && widget.availablePlans.length > 0) {
    return widget.availablePlans.includes(resolvedPlan);
  }
  if (widget.minimumPlan) {
    return planRank(resolvedPlan) >= planRank(widget.minimumPlan);
  }
  return true;
}

function getRestrictedSummary(widget: WidgetDefinition): unknown[] | undefined {
  if (Array.isArray(widget.summaryFallback) && widget.summaryFallback.length > 0) {
    return widget.summaryFallback;
  }

  const compact = (widget.content as { compactSummary?: unknown }).compactSummary;
  if (Array.isArray(compact) && compact.length > 0) {
    return compact;
  }

  const primary = (widget.content as { primaryMetrics?: unknown }).primaryMetrics;
  if (Array.isArray(primary) && primary.length > 0) {
    return primary.slice(0, 3);
  }

  const metrics = (widget.content as { metrics?: unknown }).metrics;
  if (Array.isArray(metrics) && metrics.length > 0) {
    return metrics.slice(0, 3);
  }

  const numericEntries = Object.entries(widget.content).filter(([, value]) =>
    typeof value === 'number',
  );

  if (numericEntries.length > 0) {
    return numericEntries.slice(0, 3).map(([key, value]) => ({
      label: key,
      value,
    }));
  }

  return undefined;
}

function recordAudit(
  auditLog: WidgetAuditLogEntry[] | undefined,
  action: WidgetAuditAction,
  widgetId: string,
  options: { actorId?: string; timestamp?: Date; details?: Record<string, unknown> } = {},
): void {
  if (!auditLog) {
    return;
  }

  const timestamp = (options.timestamp ?? new Date()).toISOString();
  auditLog.push({
    action,
    widgetId,
    actorId: options.actorId,
    timestamp,
    details: options.details,
  });
}

export function applyGuestRestrictions(
  widgets: WidgetDefinition[],
  user: UserContext,
  access: WidgetAccessOptions = {},
): WidgetPresentation[] {
  const lockedWidgetIds = new Set(access.lockedWidgetIds ?? []);
  const permissions = new Set([...(user.permissions ?? []), ...(access.permissions ?? [])]);
  const plan = normalisePlan(access.plan ?? user.plan);

  return widgets
    .filter((widget) => !(user.role === 'guest' && widget.isPrivate))
    .map((widget) => {
      if (lockedWidgetIds.has(widget.id) || !isPlanEligible(plan, widget)) {
        return {
          id: widget.id,
          title: widget.title,
          masked: false,
          locked: true,
          accessRestriction: {
            type: 'plan',
            message: '契約プランのアップグレードが必要です',
            fallbackMode: 'locked',
            requiredPlan: widget.minimumPlan ?? widget.availablePlans?.[0],
          },
          content: {
            ...widget.content,
            locked: true,
          },
        };
      }

      const missingPermissions = (widget.requiredPermissions ?? []).filter(
        (permission) => !permissions.has(permission),
      );

      if (missingPermissions.length > 0) {
        const summary = getRestrictedSummary(widget);
        if (!summary) {
          return undefined;
        }

        return {
          id: widget.id,
          title: widget.title,
          masked: false,
          accessRestriction: {
            type: 'permission',
            message: '閲覧権限が不足しています',
            fallbackMode: 'summary',
            missingPermissions,
          },
          content: {
            summary,
            restricted: true,
          },
        };
      }

      const masked = user.role === 'guest' && widget.requiresNonGuest;
      return {
        id: widget.id,
        title: widget.title,
        masked,
        locked: false,
        content: masked
          ? {
              ...widget.content,
              masked: true,
              message: 'アクセス権が必要です',
            }
          : widget.content,
      };
    })
    .filter((presentation): presentation is WidgetPresentation => presentation !== undefined);
}

function normaliseQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function scoreEntry(
  entry: WidgetCatalogEntry,
  terms: string[],
): { score: number; matchedTerms: string[] } {
  if (terms.length === 0) {
    return { score: 0, matchedTerms: [] };
  }

  const haystack = [
    entry.title,
    entry.description,
    ...entry.tags,
  ]
    .join(' ')
    .toLowerCase();

  const matched = new Set<string>();
  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term)) {
      matched.add(term);
      score += 1;
    }
  }

  return { score, matchedTerms: [...matched] };
}

export function buildWidgetGallery(
  catalog: WidgetCatalogEntry[],
  options: WidgetGalleryOptions = {},
): WidgetGalleryState {
  const query = options.query?.trim() ?? '';
  const terms = normaliseQuery(query);

  const evaluated = catalog.map((entry) => ({
    entry,
    ...scoreEntry(entry, terms),
  }));

  const filtered = terms.length
    ? evaluated.filter((item) => item.score > 0)
    : evaluated;

  const sorted = filtered
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.entry.title.localeCompare(b.entry.title, 'ja');
    })
    .slice(0, options.limit ?? catalog.length);

  const results: WidgetGalleryListItem[] = sorted.map((item) => ({
    id: item.entry.id,
    title: item.entry.title,
    description: item.entry.description,
    tags: item.entry.tags,
    matchedKeywords: item.matchedTerms,
  }));

  const previewSource = sorted.find((item) => item.entry.id === options.selectedId)
    ?? sorted[0];

  const preview = previewSource
    ? {
        id: previewSource.entry.id,
        title: previewSource.entry.title,
        content: previewSource.entry.preview,
      }
    : undefined;

  return {
    query,
    results,
    preview,
  };
}

export function getWidgetSizePresets(gridColumns: number = 12): WidgetSizePreset[] {
  const columns = Math.max(1, Math.floor(gridColumns));
  return BASE_WIDGET_SIZE_PRESETS.filter((preset) => preset.grid.w <= columns).map((preset) => ({
    ...preset,
    grid: { ...preset.grid },
  }));
}

function rectanglesOverlap(a: WidgetPosition, b: WidgetPosition): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function findAvailablePosition(
  positions: Record<string, WidgetPosition>,
  size: { w: number; h: number },
  gridColumns: number,
): { x: number; y: number } {
  const entries = Object.values(positions);
  const maxY = entries.reduce((acc, pos) => Math.max(acc, pos.y + pos.h), 0);

  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= gridColumns - size.w; x += 1) {
      const candidate = { x, y, w: size.w, h: size.h };
      const overlaps = entries.some((pos) => rectanglesOverlap(pos, candidate));
      if (!overlaps) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: maxY };
}

export function addWidgetToLayout(
  layout: LayoutState,
  widgetId: string,
  options: WidgetPlacementOptions = {},
): LayoutState {
  if (layout.positions[widgetId]) {
    return layout;
  }

  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const desiredWidth = Math.floor(options.size?.w ?? 4);
  const desiredHeight = Math.floor(options.size?.h ?? 3);
  const width = Math.min(Math.max(desiredWidth, 1), gridColumns);
  const height = Math.max(desiredHeight, 1);

  const position = findAvailablePosition(layout.positions, { w: width, h: height }, gridColumns);

  const timestamp = options.now ?? new Date();
  const nextLayout: LayoutState = {
    ...layout,
    positions: {
      ...layout.positions,
      [widgetId]: {
        x: position.x,
        y: position.y,
        w: width,
        h: height,
      },
    },
    savedAt: timestamp.toISOString(),
  };

  recordAudit(options.auditLog, 'add', widgetId, {
    actorId: options.actorId,
    timestamp,
    details: { position: nextLayout.positions[widgetId] },
  });

  return nextLayout;
}

export function removeWidgetWithUndo(
  layout: LayoutState,
  widgetId: string,
  options: WidgetRemovalOptions = {},
): WidgetRemovalResult {
  const now = options.now ?? new Date();
  const target = layout.positions[widgetId];
  if (!target) {
    return { layout };
  }

  const updatedPositions = { ...layout.positions };
  delete updatedPositions[widgetId];

  const updatedLayout: LayoutState = {
    ...layout,
    positions: updatedPositions,
    savedAt: now.toISOString(),
  };

  recordAudit(options.auditLog, 'remove', widgetId, {
    actorId: options.actorId,
    timestamp: now,
    details: { position: target },
  });

  const undoDuration = options.undoDurationMs ?? 5000;
  return {
    layout: updatedLayout,
    undoToken: {
      widgetId,
      position: target,
      expiresAt: new Date(now.getTime() + undoDuration).toISOString(),
    },
  };
}

export function undoWidgetRemoval(
  layout: LayoutState,
  token: WidgetRemovalToken,
  now: Date = new Date(),
): LayoutState {
  if (layout.positions[token.widgetId]) {
    return layout;
  }

  if (new Date(token.expiresAt).getTime() < now.getTime()) {
    return layout;
  }

  return {
    ...layout,
    positions: {
      ...layout.positions,
      [token.widgetId]: token.position,
    },
    savedAt: now.toISOString(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normaliseSize(
  layout: LayoutState,
  widgetId: string,
  size: { w?: number; h?: number } | undefined,
  gridColumns: number,
): { w: number; h: number } {
  const existing = layout.positions[widgetId];
  const width = clamp(
    Math.round(size?.w ?? existing?.w ?? 4),
    1,
    Math.max(1, gridColumns),
  );
  const height = Math.max(1, Math.round(size?.h ?? existing?.h ?? 3));
  return { w: width, h: height };
}

function findNearestAvailablePosition(
  positions: Record<string, WidgetPosition>,
  size: { w: number; h: number },
  gridColumns: number,
  preferred: { x: number; y: number },
  excludeId?: string,
): { x: number; y: number } {
  const entries = Object.entries(positions)
    .filter(([id]) => id !== excludeId)
    .map(([, position]) => position);

  const clampedPreferredX = clamp(preferred.x, 0, Math.max(0, gridColumns - size.w));
  const clampedPreferredY = Math.max(0, preferred.y);

  const maxY = entries.reduce(
    (acc, pos) => Math.max(acc, pos.y + pos.h),
    clampedPreferredY + size.h,
  );

  const candidates: Array<{ x: number; y: number }> = [];
  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= Math.max(0, gridColumns - size.w); x += 1) {
      candidates.push({ x, y });
    }
  }

  candidates.sort((a, b) => {
    const distanceA = Math.abs(a.x - clampedPreferredX) + Math.abs(a.y - clampedPreferredY);
    const distanceB = Math.abs(b.x - clampedPreferredX) + Math.abs(b.y - clampedPreferredY);
    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  for (const candidate of candidates) {
    const area = { x: candidate.x, y: candidate.y, w: size.w, h: size.h };
    const overlaps = entries.some((pos) => rectanglesOverlap(pos, area));
    if (!overlaps) {
      return candidate;
    }
  }

  return { x: clampedPreferredX, y: clampedPreferredY };
}

export function getWidgetDragPreview(
  layout: LayoutState,
  widgetId: string,
  options: WidgetDragPreviewOptions,
): WidgetDragPreview {
  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const size = normaliseSize(layout, widgetId, options.size, gridColumns);

  const desired = {
    x: Math.round(options.pointer.x),
    y: Math.round(options.pointer.y),
  };

  const position = findNearestAvailablePosition(
    layout.positions,
    size,
    gridColumns,
    desired,
    widgetId,
  );

  return {
    position: {
      x: position.x,
      y: position.y,
      w: size.w,
      h: size.h,
    },
  };
}

export function reorderWidgetPosition(
  layout: LayoutState,
  widgetId: string,
  options: WidgetDragPreviewOptions,
): LayoutState {
  if (!layout.positions[widgetId]) {
    return layout;
  }

  const preview = getWidgetDragPreview(layout, widgetId, options);
  const current = layout.positions[widgetId];

  if (
    current.x === preview.position.x &&
    current.y === preview.position.y &&
    current.w === preview.position.w &&
    current.h === preview.position.h
  ) {
    return layout;
  }

  const timestamp = options.now ?? new Date();
  const nextLayout: LayoutState = {
    ...layout,
    positions: {
      ...layout.positions,
      [widgetId]: preview.position,
    },
    savedAt: timestamp.toISOString(),
  };

  recordAudit(options.auditLog, 'move', widgetId, {
    actorId: options.actorId,
    timestamp,
    details: { from: current, to: preview.position },
  });

  return nextLayout;
}

function widgetCenter(position: WidgetPosition): {
  x: number;
  y: number;
} {
  return {
    x: position.x + position.w / 2,
    y: position.y + position.h / 2,
  };
}

export function moveWidgetWithKeyboard(
  layout: LayoutState,
  widgetId: string,
  direction: KeyboardDirection,
  options: WidgetPlacementOptions = {},
): KeyboardMoveResult {
  const current = layout.positions[widgetId];
  if (!current) {
    return { layout, focusId: widgetId, moved: false };
  }

  const entries = Object.entries(layout.positions).filter(([id]) => id !== widgetId);
  const currentCenter = widgetCenter(current);

  const directionalCandidates = entries
    .map(([id, position]) => ({
      id,
      position,
      center: widgetCenter(position),
    }))
    .filter((candidate) => {
      switch (direction) {
        case 'left':
          return candidate.center.x < currentCenter.x - 0.5;
        case 'right':
          return candidate.center.x > currentCenter.x + 0.5;
        case 'up':
          return candidate.center.y < currentCenter.y - 0.5;
        case 'down':
        default:
          return candidate.center.y > currentCenter.y + 0.5;
      }
    })
    .sort((a, b) => {
      const distanceA =
        Math.abs(a.center.x - currentCenter.x) + Math.abs(a.center.y - currentCenter.y);
      const distanceB =
        Math.abs(b.center.x - currentCenter.x) + Math.abs(b.center.y - currentCenter.y);
      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }
      if (direction === 'left' || direction === 'right') {
        return Math.abs(a.center.y - currentCenter.y) - Math.abs(b.center.y - currentCenter.y);
      }
      return Math.abs(a.center.x - currentCenter.x) - Math.abs(b.center.x - currentCenter.x);
    });

  const swapTarget = directionalCandidates[0];

  if (swapTarget) {
    const timestamp = options.now ?? new Date();
    const updatedPositions = {
      ...layout.positions,
      [widgetId]: swapTarget.position,
      [swapTarget.id]: current,
    };

    const nextLayout: LayoutState = {
      ...layout,
      positions: updatedPositions,
      savedAt: timestamp.toISOString(),
    };

    recordAudit(options.auditLog, 'move', widgetId, {
      actorId: options.actorId,
      timestamp,
      details: { from: current, to: swapTarget.position, swappedWith: swapTarget.id },
    });

    return {
      layout: nextLayout,
      focusId: swapTarget.id,
      moved: true,
    };
  }

  const offset = (() => {
    switch (direction) {
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
      case 'up':
        return { x: 0, y: -1 };
      case 'down':
      default:
        return { x: 0, y: 1 };
    }
  })();

  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const pointer = {
    x: current.x + offset.x,
    y: current.y + offset.y,
  };

  const preview = getWidgetDragPreview(layout, widgetId, {
    pointer,
    gridColumns,
    size: current,
  });

  if (
    preview.position.x === current.x &&
    preview.position.y === current.y &&
    preview.position.w === current.w &&
    preview.position.h === current.h
  ) {
    return { layout, focusId: widgetId, moved: false };
  }

  const timestamp = options.now ?? new Date();
  const nextLayout: LayoutState = {
    ...layout,
    positions: {
      ...layout.positions,
      [widgetId]: preview.position,
    },
    savedAt: timestamp.toISOString(),
  };

  recordAudit(options.auditLog, 'move', widgetId, {
    actorId: options.actorId,
    timestamp,
    details: { from: current, to: preview.position },
  });

  return {
    layout: nextLayout,
    focusId: widgetId,
    moved: true,
  };
}

export function resizeWidgetInLayout(
  layout: LayoutState,
  widgetId: string,
  variant: WidgetSizeVariant,
  options: WidgetPlacementOptions = {},
): LayoutState {
  const current = layout.positions[widgetId];
  if (!current) {
    return layout;
  }

  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const preset = getWidgetSizePresets(gridColumns).find((item) => item.id === variant);
  if (!preset) {
    throw new Error(`Unsupported widget size variant: ${variant}`);
  }

  const size = {
    w: Math.min(preset.grid.w, gridColumns),
    h: preset.grid.h,
  };

  const preferredX = clamp(current.x, 0, Math.max(0, gridColumns - size.w));
  const preferred = { x: preferredX, y: current.y };
  const candidate = { x: preferred.x, y: preferred.y, w: size.w, h: size.h };

  const overlaps = Object.entries(layout.positions)
    .filter(([id]) => id !== widgetId)
    .some(([, position]) => rectanglesOverlap(position, candidate));

  const resolved = overlaps
    ? findNearestAvailablePosition(layout.positions, size, gridColumns, preferred, widgetId)
    : preferred;

  const nextPosition = { x: resolved.x, y: resolved.y, w: size.w, h: size.h };

  if (
    current.x === nextPosition.x &&
    current.y === nextPosition.y &&
    current.w === nextPosition.w &&
    current.h === nextPosition.h
  ) {
    return layout;
  }

  const timestamp = options.now ?? new Date();
  const nextLayout: LayoutState = {
    ...layout,
    positions: {
      ...layout.positions,
      [widgetId]: nextPosition,
    },
    savedAt: timestamp.toISOString(),
  };

  recordAudit(options.auditLog, 'resize', widgetId, {
    actorId: options.actorId,
    timestamp,
    details: { from: current, to: nextPosition },
  });

  return nextLayout;
}

export function buildResponsiveWidgetPresentations(
  widgets: WidgetDefinition[],
  layout: LayoutState,
  options: ResponsiveWidgetOptions,
): WidgetPresentation[] {
  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const presets = getWidgetSizePresets(gridColumns);
  const minColumnWidth = Math.max(160, Math.round(options.minColumnWidth ?? 320));
  const viewportColumns = Math.max(1, Math.floor(options.viewportWidth / minColumnWidth));
  const user = options.user ?? { id: 'anonymous', role: 'member' };

  const basePresentations = applyGuestRestrictions(widgets, user, {
    plan: options.subscriptionPlan,
    lockedWidgetIds: options.lockedWidgetIds,
    permissions: options.permissions,
  });

  return basePresentations.map((presentation) => {
    const position = layout.positions[presentation.id];
    const content = { ...presentation.content };
    const sections = extractContentSections(content);

    if (!position) {
      const columns = Math.min(viewportColumns, gridColumns);
      const arranged = distributeSectionsAcrossColumns(sections, columns);
      return {
        ...presentation,
        sizeVariant: presets[1]?.id ?? 'm',
        layoutMode: columns > 1 ? 'full' : 'compact',
        columns,
        sections: arranged,
        content: {
          ...content,
          layoutMode: columns > 1 ? 'full' : 'compact',
        },
      };
    }

    const preset = findClosestPreset(position, presets);
    const compact =
      position.w <= 2 || options.viewportWidth < preset.minViewportWidth || preset.grid.w > gridColumns;

    const columns = compact ? 1 : Math.max(1, Math.min(viewportColumns, preset.grid.w));
    const arranged = compact
      ? buildCompactSections(sections, content, presentation.title)
      : distributeSectionsAcrossColumns(sections, columns);

    return {
      ...presentation,
      sizeVariant: preset.id,
      layoutMode: compact ? 'compact' : 'full',
      columns,
      sections: arranged,
      content: {
        ...content,
        layoutMode: compact ? 'compact' : 'full',
      },
    };
  });
}

function findClosestPreset(
  position: { w: number; h: number },
  presets: WidgetSizePreset[],
): WidgetSizePreset {
  let best = presets[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const preset of presets) {
    const score = Math.abs(preset.grid.w - position.w) + Math.abs(preset.grid.h - position.h);
    if (score < bestScore) {
      best = preset;
      bestScore = score;
    }
  }

  return best;
}

function extractContentSections(
  content: Record<string, unknown>,
): Array<{ id: string; items: unknown[] }> {
  const sections: Array<{ id: string; items: unknown[] }> = [];

  const primary = (content as { primaryMetrics?: unknown }).primaryMetrics;
  if (Array.isArray(primary) && primary.length > 0) {
    sections.push({ id: 'primary-metrics', items: primary });
  }

  const secondary = (content as { secondaryMetrics?: unknown }).secondaryMetrics;
  if (Array.isArray(secondary) && secondary.length > 0) {
    sections.push({ id: 'secondary-metrics', items: secondary });
  }

  const nested = (content as { sections?: unknown }).sections;
  if (Array.isArray(nested)) {
    for (const entry of nested) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const cast = entry as { id?: unknown; items?: unknown };
      if (Array.isArray(cast.items) && cast.items.length > 0) {
        sections.push({
          id: typeof cast.id === 'string' ? cast.id : `section-${sections.length}`,
          items: cast.items,
        });
      }
    }
  }

  if (sections.length === 0) {
    sections.push({ id: 'content', items: [content] });
  }

  return sections;
}

function distributeSectionsAcrossColumns(
  sections: Array<{ id: string; items: unknown[] }>,
  columns: number,
): WidgetSectionPresentation[] {
  if (columns <= 1) {
    return sections.map((section) => ({ ...section, column: 1 }));
  }

  return sections.map((section, index) => ({
    ...section,
    column: (index % columns) + 1,
  }));
}

function buildCompactSections(
  sections: Array<{ id: string; items: unknown[] }>,
  content: Record<string, unknown>,
  title: string,
): WidgetSectionPresentation[] {
  const summary = (content as { compactSummary?: unknown }).compactSummary;
  if (Array.isArray(summary) && summary.length > 0) {
    return [
      {
        id: 'compact-summary',
        items: summary.slice(0, 3),
        column: 1,
      },
    ];
  }

  if (sections.length > 0) {
    return [
      {
        id: `${sections[0].id}-compact`,
        items: sections[0].items.slice(0, 2),
        column: 1,
      },
    ];
  }

  return [
    {
      id: 'compact',
      items: [
        {
          title,
        },
      ],
      column: 1,
    },
  ];
}

function clonePosition(position: WidgetPosition): WidgetPosition {
  return { x: position.x, y: position.y, w: position.w, h: position.h };
}

function emptyPresetDiff(): PresetDiff {
  return { additions: [], removals: [], updates: [] };
}

function resolvePresetPosition(
  positions: Record<string, WidgetPosition>,
  widgetId: string,
  target: WidgetPosition,
  gridColumns: number,
): WidgetPosition {
  const width = Math.min(Math.max(Math.round(target.w), 1), Math.max(1, gridColumns));
  const height = Math.max(1, Math.round(target.h));
  const candidate: WidgetPosition = {
    x: clamp(Math.round(target.x), 0, Math.max(0, gridColumns - width)),
    y: Math.max(0, Math.round(target.y)),
    w: width,
    h: height,
  };

  const working: Record<string, WidgetPosition> = { ...positions };
  delete working[widgetId];

  const overlaps = Object.values(working).some((position) => rectanglesOverlap(position, candidate));
  if (!overlaps) {
    return candidate;
  }

  const nearest = findNearestAvailablePosition(
    working,
    { w: candidate.w, h: candidate.h },
    Math.max(1, gridColumns),
    { x: candidate.x, y: candidate.y },
  );

  return { x: nearest.x, y: nearest.y, w: candidate.w, h: candidate.h };
}

function formatPosition(position: WidgetPosition | undefined): string {
  if (!position) {
    return '不明な位置';
  }
  return `x${position.x}, y${position.y}, w${position.w}, h${position.h}`;
}

export function diffPresetAgainstLayout(preset: DashboardPreset, layout: LayoutState): PresetDiff {
  const additions: Array<{ widgetId: string; to: WidgetPosition }> = [];
  const removals: Array<{ widgetId: string; from: WidgetPosition }> = [];
  const updates: PresetDiffUpdate[] = [];

  for (const [widgetId, position] of Object.entries(preset.layout.positions)) {
    const current = layout.positions[widgetId];
    if (!current) {
      additions.push({ widgetId, to: clonePosition(position) });
      continue;
    }

    const positionChanged = current.x !== position.x || current.y !== position.y;
    const sizeChanged = current.w !== position.w || current.h !== position.h;

    if (positionChanged || sizeChanged) {
      updates.push({
        widgetId,
        from: clonePosition(current),
        to: clonePosition(position),
        positionChanged,
        sizeChanged,
      });
    }
  }

  for (const [widgetId, position] of Object.entries(layout.positions)) {
    if (!preset.layout.positions[widgetId]) {
      removals.push({ widgetId, from: clonePosition(position) });
    }
  }

  return { additions, removals, updates };
}

export function mergePresetIntoLayout(
  layout: LayoutState,
  preset: DashboardPreset,
  options: PresetMergeOptions = {},
): PresetMergeResult {
  const diff = diffPresetAgainstLayout(preset, layout);
  const applied = emptyPresetDiff();
  const skipped = emptyPresetDiff();
  const positions: Record<string, WidgetPosition> = { ...layout.positions };
  const gridColumns = Math.max(1, Math.floor(options.gridColumns ?? 12));
  const preserveIds = new Set(options.preserveWidgetIds ?? []);
  const timestamp = options.now ?? new Date();
  let changed = false;

  if (options.applyAdditions !== false) {
    for (const addition of diff.additions) {
      const resolved = resolvePresetPosition(positions, addition.widgetId, addition.to, gridColumns);
      positions[addition.widgetId] = resolved;
      applied.additions.push({ widgetId: addition.widgetId, to: clonePosition(resolved) });
      changed = true;
      recordAudit(options.auditLog, 'add', addition.widgetId, {
        actorId: options.actorId,
        timestamp,
        details: { position: resolved, source: 'preset' },
      });
    }
  } else {
    for (const addition of diff.additions) {
      skipped.additions.push({ widgetId: addition.widgetId, to: clonePosition(addition.to) });
    }
  }

  if (options.applyUpdates !== false) {
    for (const update of diff.updates) {
      if (preserveIds.has(update.widgetId)) {
        skipped.updates.push({
          ...update,
          from: update.from && clonePosition(update.from),
          to: clonePosition(update.to),
        });
        continue;
      }

      const previous = positions[update.widgetId] ?? update.from;
      const resolved = resolvePresetPosition(positions, update.widgetId, update.to, gridColumns);

      const positionChanged =
        !previous || previous.x !== resolved.x || previous.y !== resolved.y;
      const sizeChanged = !previous || previous.w !== resolved.w || previous.h !== resolved.h;

      if (!positionChanged && !sizeChanged) {
        skipped.updates.push({
          widgetId: update.widgetId,
          from: previous ? clonePosition(previous) : undefined,
          to: clonePosition(resolved),
          positionChanged: false,
          sizeChanged: false,
        });
        continue;
      }

      positions[update.widgetId] = resolved;
      applied.updates.push({
        widgetId: update.widgetId,
        from: previous ? clonePosition(previous) : undefined,
        to: clonePosition(resolved),
        positionChanged,
        sizeChanged,
      });
      changed = true;

      if (positionChanged) {
        recordAudit(options.auditLog, 'move', update.widgetId, {
          actorId: options.actorId,
          timestamp,
          details: { from: previous, to: resolved, source: 'preset' },
        });
      }
      if (sizeChanged) {
        recordAudit(options.auditLog, 'resize', update.widgetId, {
          actorId: options.actorId,
          timestamp,
          details: { from: previous, to: resolved, source: 'preset' },
        });
      }
    }
  } else {
    for (const update of diff.updates) {
      skipped.updates.push({
        ...update,
        from: update.from && clonePosition(update.from),
        to: clonePosition(update.to),
      });
    }
  }

  if (options.applyRemovals) {
    for (const removal of diff.removals) {
      if (preserveIds.has(removal.widgetId)) {
        skipped.removals.push({ widgetId: removal.widgetId, from: clonePosition(removal.from) });
        continue;
      }

      if (positions[removal.widgetId]) {
        delete positions[removal.widgetId];
        applied.removals.push({ widgetId: removal.widgetId, from: clonePosition(removal.from) });
        changed = true;
        recordAudit(options.auditLog, 'remove', removal.widgetId, {
          actorId: options.actorId,
          timestamp,
          details: { position: removal.from, source: 'preset' },
        });
      }
    }
  } else {
    for (const removal of diff.removals) {
      skipped.removals.push({ widgetId: removal.widgetId, from: clonePosition(removal.from) });
    }
  }

  const nextLayout = changed
    ? {
        ...layout,
        positions,
        savedAt: timestamp.toISOString(),
      }
    : layout;

  return {
    layout: nextLayout,
    applied,
    skipped,
  };
}

export function buildPresetUpdateNotification(
  previous: DashboardPreset,
  next: DashboardPreset,
  widgets: WidgetDefinition[] = [],
): PresetUpdateNotification {
  const titleMap = new Map<string, string>(widgets.map((widget) => [widget.id, widget.title]));
  const diff = diffPresetAgainstLayout(next, previous.layout);
  const changes: PresetUpdateNotificationChange[] = [];

  for (const addition of diff.additions) {
    const label = titleMap.get(addition.widgetId) ?? addition.widgetId;
    changes.push({
      type: 'added',
      widgetId: addition.widgetId,
      label,
      detail: `配置先: ${formatPosition(addition.to)}`,
    });
  }

  for (const removal of diff.removals) {
    const label = titleMap.get(removal.widgetId) ?? removal.widgetId;
    changes.push({
      type: 'removed',
      widgetId: removal.widgetId,
      label,
      detail: `削除位置: ${formatPosition(removal.from)}`,
    });
  }

  for (const update of diff.updates) {
    const label = titleMap.get(update.widgetId) ?? update.widgetId;
    if (update.positionChanged) {
      changes.push({
        type: 'moved',
        widgetId: update.widgetId,
        label,
        detail: `${formatPosition(update.from)} → ${formatPosition(update.to)}`,
      });
    }
    if (update.sizeChanged) {
      const from = update.from;
      changes.push({
        type: 'resized',
        widgetId: update.widgetId,
        label,
        detail: `${from ? `${from.w}x${from.h}` : '---'} → ${update.to.w}x${update.to.h}`,
      });
    }
  }

  const changeCount = changes.length;
  const summary = changeCount === 0 ? '変更はありません' : `${changeCount}件の変更があります`;

  return {
    presetId: next.id,
    version: next.version,
    publishedAt: next.publishedAt,
    headline: `プリセット「${next.name}」が更新されました`,
    summary,
    changes,
  };
}
