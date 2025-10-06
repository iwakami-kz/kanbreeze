export type UserRole = 'admin' | 'member' | 'guest';

export interface UserContext {
  id: string;
  role: UserRole;
  savedLayout?: LayoutState;
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
  positions: Record<string, { x: number; y: number; w: number; h: number }>;
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
  content: Record<string, unknown>;
}

export interface WidgetPresentation {
  id: string;
  title: string;
  content: Record<string, unknown>;
  masked: boolean;
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

export function applyGuestRestrictions(
  widgets: WidgetDefinition[],
  user: UserContext,
): WidgetPresentation[] {
  return widgets
    .filter((widget) => !(user.role === 'guest' && widget.isPrivate))
    .map((widget) => {
      const masked = user.role === 'guest' && widget.requiresNonGuest;
      return {
        id: widget.id,
        title: widget.title,
        masked,
        content: masked
          ? {
              ...widget.content,
              masked: true,
              message: 'アクセス権が必要です',
            }
          : widget.content,
      };
    });
}
