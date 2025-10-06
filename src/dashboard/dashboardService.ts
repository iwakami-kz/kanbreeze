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

export type ThemePresetId = 'soft-light' | 'warm-pastel' | 'calm-mint';

export type ThemeMode = 'light' | 'dark';

export interface ThemePaletteOptions {
  mode?: ThemeMode;
  targetContrast?: number;
}

export interface ThemePaletteAdjustment {
  token: string;
  from: string;
  to: string;
}

export interface ThemePaletteCompliance {
  targetContrast: number;
  surfaceContrast: number;
  textOnPrimaryContrast: number;
  adjustments: ThemePaletteAdjustment[];
  warnings: string[];
}

export interface ThemePalette {
  id: ThemePresetId;
  name: string;
  mode: ThemeMode;
  core: {
    primary: string;
    primarySoft: string;
    primaryStrong: string;
    neutralSurface: string;
    neutralSurfaceAlt: string;
    neutralText: string;
    neutralTextInverse: string;
    accent: string;
    accentSoft: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  semantic: {
    surface: string;
    surfaceElevated: string;
    textPrimary: string;
    textInverse: string;
    border: string;
    focusRing: string;
    info: string;
    success: string;
    warning: string;
    danger: string;
  };
  compliance: ThemePaletteCompliance;
}

export interface ThemeModeResolutionInput {
  userPreference?: 'light' | 'dark' | 'auto' | 'high-contrast';
  systemColorScheme?: 'light' | 'dark';
  systemContrast?: 'no-preference' | 'more' | 'high';
  reduceMotion?: boolean;
  lastMode?: 'light' | 'dark' | 'high-contrast';
}

export interface ThemeModeResolution {
  mode: 'light' | 'dark' | 'high-contrast';
  animate: boolean;
  transitionDuration: number;
  changed: boolean;
  source: 'user' | 'system-color' | 'system-contrast';
}

export interface SemanticTokenSet {
  tokens: Record<string, string>;
  grid: {
    baseUnit: number;
    scale: number[];
  };
  focusRing: {
    color: string;
    width: number;
    offset: number;
    style: string;
  };
}

export interface MotionPreferencesInput {
  userSetting?: 'calm' | 'standard' | 'expressive';
  prefersReducedMotion?: boolean;
}

export interface MotionPreferences {
  motionEnabled: boolean;
  durations: {
    gentle: number;
    standard: number;
    emphasized: number;
  };
  easing: {
    enter: string;
    exit: string;
  };
}

export interface TenantThemeTarget {
  id: string;
  allowBranding?: boolean;
  preferredMode?: 'light' | 'dark' | 'high-contrast';
}

export interface BrandCustomisationInput {
  brandName: string;
  primaryColor: string;
  accentColor?: string;
  tenants: TenantThemeTarget[];
  contrastTarget?: number;
}

export interface BrandCustomisationResult {
  palette: ThemePalette;
  issues: string[];
  distribution: Array<{
    tenantId: string;
    applied: boolean;
    reason?: string;
  }>;
}

const THEME_PRESETS: Record<
  ThemePresetId,
  {
    name: string;
    primary: string;
    accent: string;
    neutral: {
      lightSurface: string;
      lightSurfaceAlt: string;
      lightText: string;
      darkSurface: string;
      darkSurfaceAlt: string;
      darkText: string;
    };
    status: {
      success: string;
      warning: string;
      danger: string;
      info: string;
    };
  }
> = {
  'soft-light': {
    name: 'Soft Light',
    primary: '#5B7BDA',
    accent: '#89CFF0',
    neutral: {
      lightSurface: '#F7F9FF',
      lightSurfaceAlt: '#ECF2FF',
      lightText: '#1F2933',
      darkSurface: '#14161C',
      darkSurfaceAlt: '#1E222C',
      darkText: '#F5F7FF',
    },
    status: {
      success: '#3FA17F',
      warning: '#C97A10',
      danger: '#C94F4F',
      info: '#3B82F6',
    },
  },
  'warm-pastel': {
    name: 'Warm Pastel',
    primary: '#F08475',
    accent: '#FFB88C',
    neutral: {
      lightSurface: '#FFF7F4',
      lightSurfaceAlt: '#FFE8DF',
      lightText: '#432B1F',
      darkSurface: '#211613',
      darkSurfaceAlt: '#2D1C18',
      darkText: '#FFF5F1',
    },
    status: {
      success: '#48A37C',
      warning: '#C47C2B',
      danger: '#D05B5B',
      info: '#4C7BD9',
    },
  },
  'calm-mint': {
    name: 'Calm Mint',
    primary: '#3FA17F',
    accent: '#67C8A3',
    neutral: {
      lightSurface: '#F3FBF7',
      lightSurfaceAlt: '#E1F4EA',
      lightText: '#13392D',
      darkSurface: '#0F1E1A',
      darkSurfaceAlt: '#173229',
      darkText: '#E8FFF5',
    },
    status: {
      success: '#3FA17F',
      warning: '#C3A032',
      danger: '#CA5C5C',
      info: '#2F9AA6',
    },
  },
};

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

export interface SprintChartPoint {
  date: string;
  value: number | null;
}

export interface SprintInsightSeries {
  id: string;
  label: string;
  points: SprintChartPoint[];
}

export interface SprintInsightChart {
  id: 'burndown' | 'burnup' | 'cumulative-flow';
  title: string;
  series: SprintInsightSeries[];
  missingRanges: Array<{ start: string; end: string }>;
  interactions: { zoom: boolean; rangeSelection: boolean };
}

export interface SprintInsightInput {
  burndown: Array<{ date: string; remaining?: number | null }>;
  burnup: Array<{ date: string; completed?: number | null; scope?: number | null }>;
  cumulativeFlow: Array<{
    date: string;
    backlog?: number | null;
    inProgress?: number | null;
    done?: number | null;
  }>;
  focusRange?: { start: string; end: string };
}

export interface SprintInsightState {
  charts: SprintInsightChart[];
  focusRange?: { start: string; end: string };
}

export interface KanbanLaneStatus {
  id: string;
  name: string;
  wipLimit?: number;
  currentWip: number;
}

export interface FlowMetricSample {
  leadTimeHours: number;
  cycleTimeHours: number;
}

export interface FlowIndicatorOptions {
  now?: Date;
  filters?: Record<string, unknown>;
}

export interface FlowIndicatorWarning {
  laneId: string;
  laneName: string;
  currentWip: number;
  wipLimit?: number;
  severity: 'warning' | 'critical';
  message: string;
}

export interface FlowIndicatorMetric {
  median: number;
  p90: number;
  sampleSize: number;
}

export interface FlowIndicatorState {
  warnings: FlowIndicatorWarning[];
  leadTime: FlowIndicatorMetric;
  cycleTime: FlowIndicatorMetric;
  refreshedAt: string;
  filters?: Record<string, unknown>;
}

export interface TicketInsight {
  id: string;
  title: string;
  dueDate?: string;
  completed?: boolean;
  assigneeId?: string;
  assigneeName?: string;
  labels?: string[];
}

export interface OverdueTicketSummaryOptions {
  now?: Date;
  aggregation?: 'assignee' | 'label';
  filters?: Record<string, unknown>;
}

export interface OverdueTicketBadge {
  id: string;
  title: string;
  overdueDays: number;
  badge: '超過';
}

export interface OverdueAggregationRow {
  key: string;
  label: string;
  count: number;
  overdueDays: number;
}

export interface OverdueTicketSummary {
  tickets: OverdueTicketBadge[];
  aggregation: OverdueAggregationRow[];
  export: {
    metadata: {
      generatedAt: string;
      filters: Record<string, unknown>;
      aggregation: 'assignee' | 'label';
    };
  };
}

export interface CommentEngagementTrendPoint {
  weekStart: string;
  commentCount: number;
  averageThreadDurationHours: number;
}

export interface CommentThreadSummary {
  id: string;
  lastCommentAt: string;
  lastRespondedAt?: string;
  unreadMentions: number;
  weeklyActivity: CommentEngagementTrendPoint[];
}

export interface CommentEngagementOptions {
  now?: Date;
}

export interface CommentEngagementState {
  needsResponse: Array<{ threadId: string; pendingHours: number }>;
  trend: {
    labels: string[];
    commentCount: number[];
    averageThreadDurationHours: number[];
  };
  unreadMentionCount: number;
  generatedAt: string;
}

export interface BacklogItemSummary {
  id: string;
  title: string;
  estimate?: number | null;
  updatedAt: string;
  priority?: string | null;
  url?: string;
}

export interface BacklogHealthOptions {
  now?: Date;
  maxDetail?: number;
}

export interface BacklogHealthState {
  unestimated: {
    count: number;
    topItems: Array<{ id: string; title: string; url?: string }>;
  };
  stale: {
    count: number;
    items: Array<{ id: string; title: string; daysSinceUpdate: number }>;
  };
  priorityMissing: {
    count: number;
    ratio: number;
    warning: boolean;
  };
  summary: {
    total: number;
    evaluatedAt: string;
  };
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

function normaliseDate(value: string): number {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return timestamp;
}

function sortByDateAscending<T extends { date: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => normaliseDate(a.date) - normaliseDate(b.date));
}

function clampRange(
  range?: { start: string; end: string },
): { start: string; end: string } | undefined {
  if (!range) {
    return undefined;
  }
  const startTime = normaliseDate(range.start);
  const endTime = normaliseDate(range.end);
  if (startTime <= endTime) {
    return range;
  }
  return { start: range.end, end: range.start };
}

function filterByRange<T extends { date: string }>(
  points: T[],
  range?: { start: string; end: string },
): T[] {
  if (!range) {
    return points;
  }

  const start = normaliseDate(range.start);
  const end = normaliseDate(range.end);
  return points.filter((point) => {
    const time = normaliseDate(point.date);
    return time >= start && time <= end;
  });
}

function toChartPoints(
  entries: Array<{ date: string; value?: number | null }>,
): SprintChartPoint[] {
  return sortByDateAscending(entries).map((entry) => ({
    date: entry.date,
    value: entry.value ?? null,
  }));
}

function detectMissingRanges(points: SprintChartPoint[]): Array<{ start: string; end: string }> {
  const ranges: Array<{ start: string; end: string }> = [];
  let currentStart: string | undefined;

  for (const point of points) {
    if (point.value === null || Number.isNaN(point.value)) {
      if (!currentStart) {
        currentStart = point.date;
      }
    } else if (currentStart) {
      ranges.push({ start: currentStart, end: point.date });
      currentStart = undefined;
    }
  }

  if (currentStart) {
    const lastPoint = points[points.length - 1];
    ranges.push({ start: currentStart, end: lastPoint?.date ?? currentStart });
  }

  return ranges;
}

export function buildSprintInsightCharts(input: SprintInsightInput): SprintInsightState {
  const focusRange = clampRange(input.focusRange);

  const burndownPoints = filterByRange(
    toChartPoints(input.burndown.map((point) => ({ date: point.date, value: point.remaining }))),
    focusRange,
  );

  const burnupCompleted = filterByRange(
    toChartPoints(input.burnup.map((point) => ({ date: point.date, value: point.completed }))),
    focusRange,
  );

  const burnupScope = filterByRange(
    toChartPoints(input.burnup.map((point) => ({ date: point.date, value: point.scope }))),
    focusRange,
  );

  const cumulativeBacklog = filterByRange(
    toChartPoints(input.cumulativeFlow.map((point) => ({ date: point.date, value: point.backlog }))),
    focusRange,
  );

  const cumulativeInProgress = filterByRange(
    toChartPoints(input.cumulativeFlow.map((point) => ({ date: point.date, value: point.inProgress }))),
    focusRange,
  );

  const cumulativeDone = filterByRange(
    toChartPoints(input.cumulativeFlow.map((point) => ({ date: point.date, value: point.done }))),
    focusRange,
  );

  const charts: SprintInsightChart[] = [
    {
      id: 'burndown',
      title: 'バーンダウン',
      series: [
        {
          id: 'remaining',
          label: '残ポイント',
          points: burndownPoints,
        },
      ],
      missingRanges: detectMissingRanges(burndownPoints),
      interactions: { zoom: true, rangeSelection: true },
    },
    {
      id: 'burnup',
      title: 'バーンアップ',
      series: [
        {
          id: 'completed',
          label: '完了ポイント',
          points: burnupCompleted,
        },
        {
          id: 'scope',
          label: '総スコープ',
          points: burnupScope,
        },
      ],
      missingRanges: [
        ...detectMissingRanges(burnupCompleted),
        ...detectMissingRanges(burnupScope),
      ],
      interactions: { zoom: true, rangeSelection: true },
    },
    {
      id: 'cumulative-flow',
      title: '累積フロー',
      series: [
        { id: 'backlog', label: 'バックログ', points: cumulativeBacklog },
        { id: 'in-progress', label: '進行中', points: cumulativeInProgress },
        { id: 'done', label: '完了', points: cumulativeDone },
      ],
      missingRanges: [
        ...detectMissingRanges(cumulativeBacklog),
        ...detectMissingRanges(cumulativeInProgress),
        ...detectMissingRanges(cumulativeDone),
      ],
      interactions: { zoom: true, rangeSelection: true },
    },
  ];

  return {
    charts,
    focusRange,
  };
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (sorted.length - 1) * ratio;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  const weight = rank - lowerIndex;
  return lower + (upper - lower) * weight;
}

function buildMetric(samples: number[]): FlowIndicatorMetric {
  return {
    median: percentile(samples, 0.5),
    p90: percentile(samples, 0.9),
    sampleSize: samples.length,
  };
}

export function calculateFlowIndicators(
  lanes: KanbanLaneStatus[],
  samples: FlowMetricSample[],
  options: FlowIndicatorOptions = {},
): FlowIndicatorState {
  const now = options.now ?? new Date();

  const warnings: FlowIndicatorWarning[] = lanes
    .filter((lane) => lane.wipLimit !== undefined && lane.wipLimit !== null)
    .filter((lane) => lane.wipLimit !== undefined && lane.currentWip > (lane.wipLimit ?? 0))
    .map((lane) => {
      const limit = lane.wipLimit ?? 0;
      const ratio = limit === 0 ? Infinity : lane.currentWip / limit;
      const severity: FlowIndicatorWarning['severity'] = ratio >= 1.2 ? 'critical' : 'warning';
      return {
        laneId: lane.id,
        laneName: lane.name,
        currentWip: lane.currentWip,
        wipLimit: lane.wipLimit,
        severity,
        message: `WIP制限${lane.wipLimit}を${lane.currentWip}件で超過しています`,
      };
    });

  const leadSamples = samples.map((sample) => sample.leadTimeHours).filter((value) => value >= 0);
  const cycleSamples = samples
    .map((sample) => sample.cycleTimeHours)
    .filter((value) => value >= 0);

  return {
    warnings,
    leadTime: buildMetric(leadSamples),
    cycleTime: buildMetric(cycleSamples),
    refreshedAt: now.toISOString(),
    filters: options.filters && Object.keys(options.filters).length > 0 ? { ...options.filters } : undefined,
  };
}

function daysBetween(now: Date, target: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = now.getTime() - normaliseDate(target);
  return Math.max(0, Math.ceil(diff / msPerDay));
}

export function summariseOverdueTickets(
  tickets: TicketInsight[],
  options: OverdueTicketSummaryOptions = {},
): OverdueTicketSummary {
  const now = options.now ?? new Date();
  const aggregationMode = options.aggregation ?? 'assignee';

  const overdueTickets = tickets
    .filter((ticket) => !!ticket.dueDate && !ticket.completed && normaliseDate(ticket.dueDate) < now.getTime())
    .map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      overdueDays: daysBetween(now, ticket.dueDate!),
      badge: '超過' as const,
      assigneeId: ticket.assigneeId ?? 'unassigned',
      assigneeName: ticket.assigneeName ?? '未割り当て',
      labels: ticket.labels ?? ['未設定'],
    }));

  const aggregationMap = new Map<string, { label: string; count: number; overdueDays: number }>();

  for (const ticket of overdueTickets) {
    if (aggregationMode === 'assignee') {
      const key = ticket.assigneeId ?? 'unassigned';
      const label = ticket.assigneeName ?? '未割り当て';
      const entry = aggregationMap.get(key) ?? { label, count: 0, overdueDays: 0 };
      entry.count += 1;
      entry.overdueDays += ticket.overdueDays;
      aggregationMap.set(key, entry);
    } else {
      const labels = ticket.labels && ticket.labels.length > 0 ? ticket.labels : ['未設定'];
      for (const label of labels) {
        const key = label;
        const entry = aggregationMap.get(key) ?? { label, count: 0, overdueDays: 0 };
        entry.count += 1;
        entry.overdueDays += ticket.overdueDays;
        aggregationMap.set(key, entry);
      }
    }
  }

  const aggregation: OverdueAggregationRow[] = [...aggregationMap.entries()]
    .map(([key, value]) => ({ key, label: value.label, count: value.count, overdueDays: value.overdueDays }))
    .sort((a, b) => b.count - a.count || b.overdueDays - a.overdueDays);

  return {
    tickets: overdueTickets.map(({ id, title, overdueDays }) => ({ id, title, overdueDays, badge: '超過' as const })),
    aggregation,
    export: {
      metadata: {
        generatedAt: now.toISOString(),
        filters: options.filters ? { ...options.filters } : {},
        aggregation: aggregationMode,
      },
    },
  };
}

export function analyseCommentEngagement(
  threads: CommentThreadSummary[],
  options: CommentEngagementOptions = {},
): CommentEngagementState {
  const now = options.now ?? new Date();
  const needsResponse: Array<{ threadId: string; pendingHours: number }> = [];
  let unreadMentionCount = 0;

  for (const thread of threads) {
    unreadMentionCount += thread.unreadMentions;
    const lastCommentAt = normaliseDate(thread.lastCommentAt);
    const lastResponseAt = thread.lastRespondedAt ? normaliseDate(thread.lastRespondedAt) : undefined;
    const pending = !lastResponseAt || lastResponseAt < lastCommentAt;
    const pendingHours = (now.getTime() - lastCommentAt) / (1000 * 60 * 60);
    if (pending && pendingHours >= 24) {
      needsResponse.push({ threadId: thread.id, pendingHours: Math.round(pendingHours * 10) / 10 });
    }
  }

  needsResponse.sort((a, b) => b.pendingHours - a.pendingHours);

  const trendPoints = sortByDateAscending(
    threads.flatMap((thread) =>
      thread.weeklyActivity.map((point) => ({ ...point, date: point.weekStart })),
    ),
  );

  const trendMap = new Map<string, { commentCount: number; averageThreadDurationHours: number[] }>();
  for (const point of trendPoints) {
    const existing = trendMap.get(point.weekStart) ?? { commentCount: 0, averageThreadDurationHours: [] };
    existing.commentCount += point.commentCount;
    existing.averageThreadDurationHours.push(point.averageThreadDurationHours);
    trendMap.set(point.weekStart, existing);
  }

  const trendLabels = [...trendMap.keys()].sort((a, b) => normaliseDate(a) - normaliseDate(b));
  const commentCountSeries: number[] = [];
  const durationSeries: number[] = [];

  for (const label of trendLabels) {
    const entry = trendMap.get(label)!;
    const averageDuration = entry.averageThreadDurationHours.length
      ? entry.averageThreadDurationHours.reduce((sum, value) => sum + value, 0) /
        entry.averageThreadDurationHours.length
      : 0;
    commentCountSeries.push(entry.commentCount);
    durationSeries.push(Math.round(averageDuration * 10) / 10);
  }

  return {
    needsResponse,
    trend: {
      labels: trendLabels,
      commentCount: commentCountSeries,
      averageThreadDurationHours: durationSeries,
    },
    unreadMentionCount,
    generatedAt: now.toISOString(),
  };
}

export function evaluateBacklogHealth(
  items: BacklogItemSummary[],
  options: BacklogHealthOptions = {},
): BacklogHealthState {
  const now = options.now ?? new Date();
  const maxDetail = Math.max(1, Math.floor(options.maxDetail ?? 5));

  const unestimatedItems = items.filter((item) => item.estimate === undefined || item.estimate === null);

  const staleItems = items.filter((item) => daysBetween(now, item.updatedAt) > 30);

  const priorityMissingItems = items.filter((item) => !item.priority);

  const sortedUnestimated = [...unestimatedItems].sort(
    (a, b) => normaliseDate(a.updatedAt) - normaliseDate(b.updatedAt),
  );

  const sortedStale = [...staleItems].sort(
    (a, b) => normaliseDate(b.updatedAt) - normaliseDate(a.updatedAt),
  );

  return {
    unestimated: {
      count: unestimatedItems.length,
      topItems: sortedUnestimated.slice(0, maxDetail).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
      })),
    },
    stale: {
      count: staleItems.length,
      items: sortedStale.slice(0, maxDetail).map((item) => ({
        id: item.id,
        title: item.title,
        daysSinceUpdate: daysBetween(now, item.updatedAt),
      })),
    },
    priorityMissing: {
      count: priorityMissingItems.length,
      ratio: items.length === 0 ? 0 : priorityMissingItems.length / items.length,
      warning: items.length === 0 ? false : priorityMissingItems.length / items.length > 0.2,
    },
    summary: {
      total: items.length,
      evaluatedAt: now.toISOString(),
    },
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

export function buildThemePalette(
  preset: ThemePresetId,
  options: ThemePaletteOptions = {},
): ThemePalette {
  const base = THEME_PRESETS[preset];
  if (!base) {
    throw new Error(`Unknown theme preset: ${preset}`);
  }

  const mode: ThemeMode = options.mode ?? 'light';
  const targetContrast = options.targetContrast ?? 4.5;
  const adjustments: ThemePaletteAdjustment[] = [];
  const warnings: string[] = [];

  const neutralSurface = mode === 'light' ? base.neutral.lightSurface : base.neutral.darkSurface;
  const neutralSurfaceAlt = mode === 'light' ? base.neutral.lightSurfaceAlt : base.neutral.darkSurfaceAlt;
  const neutralTextBase = mode === 'light' ? base.neutral.lightText : base.neutral.darkText;
  const neutralInverseBase = mode === 'light' ? base.neutral.darkText : base.neutral.lightText;

  let primary = mode === 'light' ? base.primary : mixColors(base.primary, '#0B1020', 0.25);
  const accent = mode === 'light' ? base.accent : mixColors(base.accent, '#10161F', 0.2);

  primary = ensureContrast(
    primary,
    neutralInverseBase,
    targetContrast,
    true,
    'core.primary',
    adjustments,
  );

  const primarySoft = mixColors(primary, '#FFFFFF', mode === 'light' ? 0.6 : 0.3);
  const primaryStrong = mixColors(primary, '#000000', mode === 'light' ? 0.25 : 0.45);
  const accentSoft = mixColors(accent, '#FFFFFF', mode === 'light' ? 0.5 : 0.25);

  const semanticSurface = adjustSurfaceForBrightness(neutralSurface, mode);
  const semanticSurfaceElevated = mode === 'light'
    ? mixColors(semanticSurface, '#000000', 0.06)
    : mixColors(semanticSurface, '#FFFFFF', 0.12);

  const textPrimary = ensureContrast(
    neutralTextBase,
    semanticSurface,
    targetContrast,
    true,
    'semantic.textPrimary',
    adjustments,
  );
  const textInverse = ensureContrast(
    neutralInverseBase,
    primary,
    targetContrast,
    false,
    'semantic.textInverse',
    adjustments,
  );

  const focusRing = ensureContrast(
    primary,
    semanticSurface,
    3,
    true,
    'semantic.focusRing',
    adjustments,
  );

  const border = ensureContrast(
    mode === 'light' ? mixColors(textPrimary, semanticSurface, 0.1) : mixColors(textPrimary, semanticSurface, 0.25),
    semanticSurface,
    1.2,
    true,
    'semantic.border',
    adjustments,
  );

  const palette: ThemePalette = {
    id: preset,
    name: base.name,
    mode,
    core: {
      primary,
      primarySoft,
      primaryStrong,
      neutralSurface: semanticSurface,
      neutralSurfaceAlt: semanticSurfaceElevated,
      neutralText: textPrimary,
      neutralTextInverse: textInverse,
      accent,
      accentSoft,
      success: base.status.success,
      warning: base.status.warning,
      danger: base.status.danger,
      info: base.status.info,
    },
    semantic: {
      surface: semanticSurface,
      surfaceElevated: semanticSurfaceElevated,
      textPrimary,
      textInverse,
      border,
      focusRing,
      info: base.status.info,
      success: base.status.success,
      warning: base.status.warning,
      danger: base.status.danger,
    },
    compliance: {
      targetContrast,
      surfaceContrast: calculateContrast(textPrimary, semanticSurface),
      textOnPrimaryContrast: calculateContrast(textInverse, primary),
      adjustments,
      warnings,
    },
  };

  if (palette.compliance.surfaceContrast < targetContrast) {
    warnings.push(
      `テキストと背景のコントラストが基準(${targetContrast})を下回っています: ${palette.compliance.surfaceContrast.toFixed(2)}`,
    );
  }

  if (palette.compliance.textOnPrimaryContrast < targetContrast) {
    warnings.push(
      `ボタン上のテキストコントラストが基準(${targetContrast})を下回っています: ${palette.compliance.textOnPrimaryContrast.toFixed(2)}`,
    );
  }

  return palette;
}

export function resolveThemeMode(
  input: ThemeModeResolutionInput,
): ThemeModeResolution {
  const userPref = input.userPreference ?? 'auto';
  const systemContrast = input.systemContrast ?? 'no-preference';
  let mode: 'light' | 'dark' | 'high-contrast';
  let source: ThemeModeResolution['source'] = 'user';

  if (userPref === 'high-contrast' || systemContrast === 'high') {
    mode = 'high-contrast';
    source = userPref === 'high-contrast' ? 'user' : 'system-contrast';
  } else if (userPref === 'light' || userPref === 'dark') {
    mode = userPref;
    source = 'user';
  } else {
    mode = input.systemColorScheme === 'dark' ? 'dark' : 'light';
    source = 'system-color';
  }

  const reduceMotion = Boolean(input.reduceMotion);
  const animate = !reduceMotion;
  const transitionDuration = animate ? clamp(240, 200, 300) : 0;
  const changed = mode !== (input.lastMode ?? 'light');

  return { mode, animate, transitionDuration, changed, source };
}

export function buildSemanticThemeTokens(palette: ThemePalette): SemanticTokenSet {
  const baseUnit = 8;
  const scale = Array.from({ length: 11 }, (_, index) => index * baseUnit);

  const tokens: Record<string, string> = {
    'kb-semantic-surface': palette.semantic.surface,
    'kb-semantic-surface-elevated': palette.semantic.surfaceElevated,
    'kb-semantic-text-primary': palette.semantic.textPrimary,
    'kb-semantic-text-inverse': palette.semantic.textInverse,
    'kb-semantic-border': palette.semantic.border,
    'kb-semantic-focus-ring': palette.semantic.focusRing,
    'kb-semantic-info': palette.semantic.info,
    'kb-semantic-success': palette.semantic.success,
    'kb-semantic-warning': palette.semantic.warning,
    'kb-semantic-danger': palette.semantic.danger,
  };

  return {
    tokens,
    grid: {
      baseUnit,
      scale,
    },
    focusRing: {
      color: palette.semantic.focusRing,
      width: 2,
      offset: 2,
      style: `0 0 0 2px ${palette.semantic.focusRing}`,
    },
  };
}

export function resolveMotionPreferences(
  input: MotionPreferencesInput = {},
): MotionPreferences {
  const reduce = Boolean(input.prefersReducedMotion);
  const setting = input.userSetting ?? 'calm';

  if (reduce) {
    return {
      motionEnabled: false,
      durations: {
        gentle: 0,
        standard: 0,
        emphasized: 0,
      },
      easing: {
        enter: 'linear',
        exit: 'linear',
      },
    };
  }

  const baseDurations = {
    calm: { gentle: 120, standard: 200, emphasized: 280 },
    standard: { gentle: 160, standard: 240, emphasized: 320 },
    expressive: { gentle: 200, standard: 280, emphasized: 360 },
  };

  const durations = baseDurations[setting] ?? baseDurations.calm;

  return {
    motionEnabled: true,
    durations,
    easing: {
      enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
      exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  };
}

export function applyBrandThemeCustomisation(
  palette: ThemePalette,
  input: BrandCustomisationInput,
): BrandCustomisationResult {
  const targetContrast = input.contrastTarget ?? palette.compliance.targetContrast;
  const issues: string[] = [];
  const adjustments: ThemePaletteAdjustment[] = [];

  const nextPalette: ThemePalette = {
    ...palette,
    core: { ...palette.core },
    semantic: { ...palette.semantic },
    compliance: { ...palette.compliance, adjustments: [...palette.compliance.adjustments], warnings: [] },
  };

  const primaryResult = ensureContrast(
    input.primaryColor,
    nextPalette.semantic.surface,
    targetContrast,
    calculateLuminance(input.primaryColor) <= calculateLuminance(nextPalette.semantic.surface),
    'core.primary',
    adjustments,
  );

  nextPalette.core.primary = primaryResult;
  nextPalette.core.primarySoft = mixColors(nextPalette.core.primary, '#FFFFFF', nextPalette.mode === 'light' ? 0.6 : 0.3);
  nextPalette.core.primaryStrong = mixColors(nextPalette.core.primary, '#000000', nextPalette.mode === 'light' ? 0.25 : 0.45);
  nextPalette.semantic.focusRing = ensureContrast(
    nextPalette.core.primary,
    nextPalette.semantic.surface,
    3,
    true,
    'semantic.focusRing',
    adjustments,
  );

  const accentColor = input.accentColor ?? nextPalette.core.accent;
  nextPalette.core.accent = ensureContrast(
    accentColor,
    nextPalette.semantic.surface,
    2.5,
    calculateLuminance(accentColor) <= calculateLuminance(nextPalette.semantic.surface),
    'core.accent',
    adjustments,
  );
  nextPalette.core.accentSoft = mixColors(nextPalette.core.accent, '#FFFFFF', nextPalette.mode === 'light' ? 0.5 : 0.25);

  nextPalette.core.neutralTextInverse = ensureContrast(
    nextPalette.core.neutralTextInverse,
    nextPalette.core.primary,
    targetContrast,
    calculateLuminance(nextPalette.core.neutralTextInverse) >= calculateLuminance(nextPalette.core.primary),
    'core.neutralTextInverse',
    adjustments,
  );

  const surfaceContrast = calculateContrast(nextPalette.core.neutralText, nextPalette.semantic.surface);
  const buttonContrast = calculateContrast(nextPalette.core.neutralTextInverse, nextPalette.core.primary);

  if (surfaceContrast < targetContrast) {
    issues.push(
      `ブランド適用後のテキスト/背景コントラストが基準(${targetContrast})を満たしていません (${surfaceContrast.toFixed(2)})。`,
    );
  }

  if (buttonContrast < targetContrast) {
    issues.push(
      `ブランド適用後のボタンテキストコントラストが基準(${targetContrast})を満たしていません (${buttonContrast.toFixed(2)})。`,
    );
  }

  const distribution = input.tenants.map((tenant) => {
    if (tenant.allowBranding === false) {
      return { tenantId: tenant.id, applied: false, reason: 'branding-disabled' };
    }
    if (tenant.preferredMode && tenant.preferredMode !== nextPalette.mode) {
      return { tenantId: tenant.id, applied: false, reason: 'mode-mismatch' };
    }
    return { tenantId: tenant.id, applied: true };
  });

  if (adjustments.length > 0) {
    issues.push(`ブランドカラーを${adjustments.length}件調整してコントラストを確保しました。`);
  }

  nextPalette.compliance = {
    targetContrast,
    surfaceContrast,
    textOnPrimaryContrast: buttonContrast,
    adjustments: [...nextPalette.compliance.adjustments, ...adjustments],
    warnings: issues.slice(),
  };

  return {
    palette: nextPalette,
    issues,
    distribution,
  };
}

function adjustSurfaceForBrightness(surface: string, mode: ThemeMode): string {
  if (mode === 'light') {
    return mixColors(surface, '#FFFFFF', 0.1);
  }
  return mixColors(surface, '#000000', 0.2);
}

function ensureContrast(
  color: string,
  reference: string,
  target: number,
  preferDarkening: boolean,
  token: string,
  adjustments: ThemePaletteAdjustment[],
): string {
  let current = normalizeHex(color);
  const initial = current;
  let contrast = calculateContrast(current, reference);
  const mixTarget = preferDarkening ? '#000000' : '#FFFFFF';
  let step = 0;

  while (contrast < target && step < 12) {
    current = mixColors(current, mixTarget, 0.1);
    contrast = calculateContrast(current, reference);
    step += 1;
  }

  if (current !== initial) {
    adjustments.push({ token, from: initial, to: current });
  }

  return current;
}

function mixColors(color: string, withColor: string, amount: number): string {
  const base = hexToRgb(normalizeHex(color));
  const blend = hexToRgb(normalizeHex(withColor));
  const ratio = clamp(amount, 0, 1);
  const r = Math.round(base.r + (blend.r - base.r) * ratio);
  const g = Math.round(base.g + (blend.g - base.g) * ratio);
  const b = Math.round(base.b + (blend.b - base.b) * ratio);
  return rgbToHex(r, g, b);
}

function normalizeHex(color: string): string {
  if (color.startsWith('#')) {
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
    }
    return color.toUpperCase();
  }
  return color;
}

function hexToRgb(color: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(color);
  const value = normalized.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function calculateLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function calculateContrast(foreground: string, background: string): number {
  const lumA = calculateLuminance(foreground);
  const lumB = calculateLuminance(background);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}
