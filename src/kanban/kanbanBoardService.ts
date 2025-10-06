export type ThemePresetId = 'sunlight' | 'tea-latte' | 'mist-green';

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textOnAccent: string;
  accent: string;
  accentMuted: string;
  warning: string;
  success: string;
  patterns?: string[];
  iconography?: string[];
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  mode: 'light' | 'dark';
  tokens: ThemeTokens;
  transitionMs: number;
}

export interface ThemeState {
  presetId: ThemePresetId;
  tokens: ThemeTokens;
  needsSavePrompt: boolean;
  lastAppliedAt: string;
  pendingPresetId?: ThemePresetId;
}

export interface ThemeAdjustmentSession {
  base: ThemeTokens;
  current: ThemeTokens;
  history: ThemeTokens[];
}

export interface ThemeAdjustmentOptions {
  minBodyContrast?: number;
  minUiContrast?: number;
}

export interface ThemeAdjustmentResult {
  session: ThemeAdjustmentSession;
  compliance: ThemePaletteCompliance;
  applyDelayMs: number;
}

export interface ThemePaletteCompliance {
  targetContrast: number;
  textContrast: number;
  surfaceContrast: number;
  warnings: string[];
  canSave: boolean;
}

export interface ThemeModeResolutionOptions {
  auto: boolean;
  osPreference: 'light' | 'dark';
  userSelection?: 'light' | 'dark';
  printing?: boolean;
}

export interface ThemeModeResolutionResult {
  mode: 'light' | 'dark';
  animationMs: number;
  source: 'os' | 'user' | 'print';
}

export interface AccessibilityPaletteOptions {
  enable: boolean;
  baseTokens: ThemeTokens;
}

export interface AccessibilityPaletteResult {
  tokens: ThemeTokens;
  legend: Array<{ id: string; color: string; pattern: string; label: string }>;
}

export interface KanbanChecklistItem {
  id: string;
  title: string;
  done: boolean;
  order: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  completed?: boolean;
  checklist?: KanbanChecklistItem[];
  swimlaneId?: string;
  priority?: 'low' | 'medium' | 'high';
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  name: string;
  cardIds: string[];
  wipLimit?: number;
  wipPolicy?: 'enforced' | 'allow-exception';
  width?: number;
  swimlaneId?: string;
}

export interface BoardSnapshot {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
}

export interface HistoryStack {
  past: BoardSnapshot[];
  future: BoardSnapshot[];
}

export interface BoardPreferences {
  colorBlindMode: boolean;
  reducedMotion: boolean;
  animationDisabled: boolean;
  sound: 'on' | 'off';
  toastDurationMs: number;
  autoTheme: boolean;
  savedPresetId?: ThemePresetId;
  wipNotificationsEnabled?: boolean;
}

export interface KanbanBoardState {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  history: HistoryStack;
  preferences: BoardPreferences;
}

export interface DragState {
  cardId: string;
  originColumnId: string;
  originIndex: number;
  placeholderIndex: number;
  liftShadow: number;
}

export interface MoveCardOptions {
  targetIndex: number;
  now?: Date;
  allowUndo?: boolean;
  reason?: string;
}

export interface MoveCardResult {
  board: KanbanBoardState;
  undoSnapshot?: BoardSnapshot;
  toast?: ToastMessage;
}

export interface ToastMessage {
  id: string;
  tone: 'positive' | 'negative' | 'warning' | 'info';
  message: string;
  actionLabel?: string;
  action?: () => void;
  durationMs: number;
}

export interface InlineDraftOptions {
  continuous?: boolean;
  now?: Date;
}

export interface InlineDraftResult {
  card: KanbanCard;
  autoSaveDueAt: string;
  focusNext: boolean;
}

export interface InlineSaveFailureResult {
  error: string;
  retryAvailable: boolean;
  draftRetained: boolean;
}

export interface KeyboardNavigationOptions {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  focus: { columnId: string; index: number };
}

export interface KeyboardNavigationResult {
  nextFocus: { columnId: string; index: number };
  action?: 'edit' | 'cancel';
}

export type KeyboardCommand =
  | { type: 'move'; direction: 'up' | 'down' | 'left' | 'right'; withModifier?: boolean }
  | { type: 'enter' }
  | { type: 'escape' };

export interface TagPresentation {
  visible: Array<{ id: string; label: string; color: string }>;
  overflow?: { count: number; tags: Array<{ id: string; label: string; color: string }> };
}

export interface TagPaletteEntry {
  id: string;
  label: string;
  color: string;
}

export interface DueBadgeOptions {
  now: Date;
  colorBlindMode?: boolean;
}

export interface DueBadgePresentation {
  tone: 'neutral' | 'soon' | 'overdue';
  accent: string;
  icon: string;
  emphasised: boolean;
  label: string;
}

export interface AssigneePresentation {
  label: string;
  avatarUrl?: string;
  placeholderIcon: string;
}

export interface ChecklistSummary {
  completed: number;
  total: number;
  progress: number;
  status: 'empty' | 'in-progress' | 'completed';
}

export interface SearchResult {
  id: string;
  matchedFields: string[];
  highlight: string;
}

export interface FilterCondition {
  type: 'assignee' | 'tag' | 'due' | 'status';
  value: string;
}

export interface FilterState {
  cards: KanbanCard[];
  chips: Array<{ label: string; value: string }>;
  emptyState: boolean;
}

export type SortCriterion = 'dueDate' | 'priority' | 'updatedAt';

export interface ViewDefinition {
  id: string;
  name: string;
  conditions: FilterCondition[];
  sharedWith?: string[];
  auditLog: Array<{ by: string; at: string; action: string }>;
}

export interface SaveViewOptions {
  name: string;
  actorId: string;
  sharedWith?: string[];
}

export interface ColumnResizeOptions {
  minWidth?: number;
  maxWidth?: number;
}

export interface ColumnResizeResult {
  column: KanbanColumn;
  persisted: boolean;
}

export interface ScrollState {
  columnId: string;
  scrollTop: number;
}

export interface ScrollBehaviourResult {
  snaps: Array<{ columnId: string; position: number }>;
  restored: boolean;
}

export interface GestureInput {
  type: 'swipe' | 'long-press' | 'drag';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface GestureHandlingResult {
  action: 'open-card' | 'start-drag' | 'open-menu' | 'none';
  accessible: boolean;
}

export interface SwimlaneState {
  id: string;
  name: string;
  collapsed: boolean;
}

export interface SwimlaneConfigResult {
  swimlanes: SwimlaneState[];
  persistenceKey: string;
}

export interface WipLimitChangeOptions {
  actorId: string;
  now: Date;
}

export interface WipLimitChangeResult {
  column: KanbanColumn;
  auditLogEntry: { columnId: string; actorId: string; at: string; limit: number };
  warning?: string;
}

export interface WipEvaluationResult {
  columnId: string;
  exceeded: boolean;
  display: { tone: 'normal' | 'warning'; icon?: string; pattern?: string };
  disableAddCard: boolean;
  toast?: ToastMessage;
}

export interface WipPolicyChangeResult {
  column: KanbanColumn;
  policy: 'enforced' | 'allow-exception';
  requiresReason: boolean;
  auditLogEntry: { columnId: string; policy: string; actorId: string; at: string; reasonRequired: boolean };
}

export interface WipHeatmapCell {
  columnId: string;
  ratio: number;
  tone: 'calm' | 'elevated' | 'hot';
  pattern?: string;
}

export interface WipHeatmapResult {
  cells: WipHeatmapCell[];
  legend: Array<{ tone: string; meaning: string }>;
}

export interface AnimationPreferences {
  reducedMotion: boolean;
  animationDisabled: boolean;
  environment?: 'low-power' | 'normal';
}

export interface AnimationSettings {
  liftDuration: number;
  easing: string;
  enabled: boolean;
}

export interface ToastQueue {
  messages: ToastMessage[];
}

export interface ConfirmationOptions {
  actorId: string;
  now: Date;
  accessibleMode?: boolean;
}

export interface ConfirmationResult {
  confirmed: boolean;
  defaultAction: 'confirm' | 'cancel';
  recoveryAvailable: boolean;
}

export interface SoundToggleResult {
  mode: 'on' | 'off';
  obeysSystemVolume: boolean;
}

export interface VirtualisationOptions {
  viewportHeight: number;
  itemHeight: number;
}

export interface VirtualisationSlice {
  columnId: string;
  start: number;
  end: number;
}

export interface VirtualisationPlan {
  slices: VirtualisationSlice[];
  lightweightMode: boolean;
}

export interface OptimisticChange<T = unknown> {
  id: string;
  apply: (board: KanbanBoardState) => KanbanBoardState;
  rollback: (board: KanbanBoardState) => KanbanBoardState;
  payload: T;
}

export interface OptimisticUpdateResult {
  board: KanbanBoardState;
  pending: OptimisticChange;
}

export interface OfflineChange {
  id: string;
  apply: (board: KanbanBoardState) => KanbanBoardState;
  retries: number;
}

export interface OfflineQueueResult {
  queue: OfflineChange[];
  bannerVisible: boolean;
}

export interface RestoreStateOptions {
  stored?: {
    scroll?: ScrollState;
    viewId?: string;
    openedCardId?: string;
  };
  availableViews: ViewDefinition[];
  sessionIsPrivate?: boolean;
}

export interface RestoreStateResult {
  scroll?: ScrollState;
  view?: ViewDefinition;
  openedCardId?: string;
  fallbackToDefault: boolean;
  toast?: ToastMessage;
}

const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  sunlight: {
    id: 'sunlight',
    name: 'サンライト',
    mode: 'light',
    transitionMs: 180,
    tokens: {
      background: '#FDF9F3',
      surface: '#FFFFFF',
      surfaceAlt: '#F6F1E6',
      border: '#E3D8C4',
      text: '#3A2E1F',
      textOnAccent: '#2C1900',
      accent: '#F5B041',
      accentMuted: '#F9D7A0',
      warning: '#D98880',
      success: '#7FB77E',
    },
  },
  'tea-latte': {
    id: 'tea-latte',
    name: 'ティーラテ',
    mode: 'light',
    transitionMs: 180,
    tokens: {
      background: '#F8F5F2',
      surface: '#FFFFFF',
      surfaceAlt: '#EFEAE6',
      border: '#D7CEC7',
      text: '#3E2F2F',
      textOnAccent: '#2A1710',
      accent: '#D0A678',
      accentMuted: '#E9C9A7',
      warning: '#D6A280',
      success: '#88B89F',
    },
  },
  'mist-green': {
    id: 'mist-green',
    name: 'ミストグリーン',
    mode: 'light',
    transitionMs: 180,
    tokens: {
      background: '#F4FBF6',
      surface: '#FFFFFF',
      surfaceAlt: '#EAF4ED',
      border: '#CDE3D2',
      text: '#2F3B2F',
      textOnAccent: '#142111',
      accent: '#7CC29B',
      accentMuted: '#BCE3CC',
      warning: '#C4A883',
      success: '#6FBF8F',
    },
  },
};

export function getThemePreset(presetId: ThemePresetId): ThemePreset {
  return THEME_PRESETS[presetId];
}

export function initialiseThemeState(now: Date = new Date()): ThemeState {
  const preset = THEME_PRESETS.sunlight;
  return {
    presetId: preset.id,
    tokens: { ...preset.tokens },
    needsSavePrompt: false,
    lastAppliedAt: now.toISOString(),
  };
}

export function applyThemePreset(
  state: ThemeState,
  presetId: ThemePresetId,
  now: Date = new Date(),
): ThemeState {
  const preset = getThemePreset(presetId);
  const needsSavePrompt = state.presetId !== presetId;
  return {
    presetId: needsSavePrompt ? state.presetId : presetId,
    pendingPresetId: needsSavePrompt ? presetId : undefined,
    tokens: needsSavePrompt ? { ...preset.tokens } : { ...preset.tokens },
    needsSavePrompt,
    lastAppliedAt: now.toISOString(),
  };
}

export function confirmThemePreset(state: ThemeState, now: Date = new Date()): ThemeState {
  if (!state.pendingPresetId) {
    return state;
  }
  const preset = getThemePreset(state.pendingPresetId);
  return {
    presetId: preset.id,
    tokens: { ...preset.tokens },
    needsSavePrompt: false,
    lastAppliedAt: now.toISOString(),
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const normalised = hex.replace('#', '');
  const bigint = parseInt(normalised, 16);
  if (normalised.length === 3) {
    const r = ((bigint >> 8) & 0xf) * 17;
    const g = ((bigint >> 4) & 0xf) * 17;
    const b = (bigint & 0xf) * 17;
    return [r, g, b];
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground) + 0.05;
  const l2 = relativeLuminance(background) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

export function createAdjustmentSession(tokens: ThemeTokens): ThemeAdjustmentSession {
  return {
    base: { ...tokens },
    current: { ...tokens },
    history: [],
  };
}

export function adjustThemeAccent(
  session: ThemeAdjustmentSession,
  adjustments: Partial<Pick<ThemeTokens, 'accent' | 'accentMuted'>>,
  options: ThemeAdjustmentOptions = {},
): ThemeAdjustmentResult {
  const updated: ThemeTokens = { ...session.current, ...adjustments };
  const textContrast = contrastRatio(updated.textOnAccent, updated.accent);
  const surfaceContrast = contrastRatio(updated.text, updated.background);
  const minBody = options.minBodyContrast ?? 4.5;
  const minUi = options.minUiContrast ?? 3;
  const warnings: string[] = [];
  if (textContrast < minBody) {
    warnings.push(`アクセントのコントラストが基準(${minBody})を下回っています`);
  }
  if (surfaceContrast < minUi) {
    warnings.push(`本文のコントラストが基準(${minUi})を下回っています`);
  }
  const sessionHistory = [...session.history, session.current];
  const canSave = warnings.length === 0;

  return {
    session: {
      base: session.base,
      current: updated,
      history: sessionHistory,
    },
    compliance: {
      targetContrast: minBody,
      textContrast: Math.round(textContrast * 100) / 100,
      surfaceContrast: Math.round(surfaceContrast * 100) / 100,
      warnings,
      canSave,
    },
    applyDelayMs: 180,
  };
}

export function undoThemeAdjustment(session: ThemeAdjustmentSession): ThemeAdjustmentSession {
  if (session.history.length === 0) {
    return session;
  }
  const previous = session.history[session.history.length - 1];
  return {
    base: session.base,
    current: { ...previous },
    history: session.history.slice(0, -1),
  };
}

export function resetThemeAdjustments(session: ThemeAdjustmentSession): ThemeAdjustmentSession {
  return {
    base: session.base,
    current: { ...session.base },
    history: [],
  };
}

export function resolveThemeMode(options: ThemeModeResolutionOptions): ThemeModeResolutionResult {
  if (options.printing) {
    return { mode: 'light', animationMs: 0, source: 'print' };
  }
  if (options.auto) {
    return { mode: options.osPreference, animationMs: 200, source: 'os' };
  }
  return {
    mode: options.userSelection ?? 'light',
    animationMs: 200,
    source: 'user',
  };
}

export function buildAccessibilityPalette(options: AccessibilityPaletteOptions): AccessibilityPaletteResult {
  if (!options.enable) {
    return {
      tokens: { ...options.baseTokens },
      legend: [],
    };
  }
  const tokens: ThemeTokens = {
    ...options.baseTokens,
    patterns: ['diagonal-stripe', 'dot', 'underline'],
    iconography: ['triangle', 'square', 'circle'],
  };
  const legend = [
    { id: 'todo', color: options.baseTokens.accent, pattern: 'diagonal-stripe', label: '未着手' },
    { id: 'doing', color: options.baseTokens.warning, pattern: 'dot', label: '進行中' },
    { id: 'done', color: options.baseTokens.success, pattern: 'underline', label: '完了' },
  ];
  return { tokens, legend };
}

export function startCardDrag(board: KanbanBoardState, cardId: string): DragState {
  const column = board.columns.find((col) => col.cardIds.includes(cardId));
  if (!column) {
    throw new Error('カードが見つかりません');
  }
  return {
    cardId,
    originColumnId: column.id,
    originIndex: column.cardIds.indexOf(cardId),
    placeholderIndex: column.cardIds.indexOf(cardId),
    liftShadow: board.preferences.reducedMotion ? 2 : 4,
  };
}

function cloneBoard(board: KanbanBoardState): KanbanBoardState {
  return {
    columns: board.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
    cards: Object.fromEntries(Object.entries(board.cards).map(([id, card]) => [id, { ...card }])),
    history: {
      past: board.history.past.map((snapshot) => ({
        columns: snapshot.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
        cards: Object.fromEntries(Object.entries(snapshot.cards).map(([id, card]) => [id, { ...card }])),
      })),
      future: board.history.future.map((snapshot) => ({
        columns: snapshot.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
        cards: Object.fromEntries(Object.entries(snapshot.cards).map(([id, card]) => [id, { ...card }])),
      })),
    },
    preferences: { ...board.preferences },
  };
}

export function moveCard(
  board: KanbanBoardState,
  drag: DragState,
  targetColumnId: string,
  options: MoveCardOptions,
): MoveCardResult {
  const originColumn = board.columns.find((col) => col.id === drag.originColumnId);
  if (!originColumn) {
    throw new Error('元の列が見つかりません');
  }
  const targetColumn = board.columns.find((col) => col.id === targetColumnId);
  if (!targetColumn) {
    throw new Error('移動先の列が見つかりません');
  }
  if (targetColumn.wipPolicy === 'enforced' && targetColumn.wipLimit !== undefined) {
    const projected = targetColumn.cardIds.length + (targetColumnId === originColumn.id ? 0 : 1);
    if (projected > targetColumn.wipLimit) {
      return {
        board,
        toast: {
          id: `wip-${targetColumn.id}`,
          tone: 'warning',
          message: 'WIP制限を超えています',
          durationMs: board.preferences.toastDurationMs,
          actionLabel: '確認',
          action: undefined,
        },
      };
    }
  }

  const beforeSnapshot: BoardSnapshot = {
    columns: board.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
    cards: Object.fromEntries(Object.entries(board.cards).map(([id, card]) => [id, { ...card }])),
  };

  const boardCopy = cloneBoard(board);
  const originIdx = boardCopy.columns.findIndex((col) => col.id === originColumn.id);
  const targetIdx = boardCopy.columns.findIndex((col) => col.id === targetColumn.id);
  boardCopy.columns[originIdx].cardIds = boardCopy.columns[originIdx].cardIds.filter((id) => id !== drag.cardId);
  const insertionIndex = Math.min(Math.max(options.targetIndex, 0), boardCopy.columns[targetIdx].cardIds.length);
  boardCopy.columns[targetIdx].cardIds = [
    ...boardCopy.columns[targetIdx].cardIds.slice(0, insertionIndex),
    drag.cardId,
    ...boardCopy.columns[targetIdx].cardIds.slice(insertionIndex),
  ];
  boardCopy.cards[drag.cardId] = {
    ...boardCopy.cards[drag.cardId],
    swimlaneId: boardCopy.columns[targetIdx].swimlaneId,
    updatedAt: (options.now ?? new Date()).toISOString(),
  };

  const toast: ToastMessage | undefined = options.reason
    ? {
        id: `move-${drag.cardId}`,
        tone: 'info',
        message: options.reason,
        durationMs: board.preferences.toastDurationMs,
      }
    : undefined;

  if (options.allowUndo) {
    boardCopy.history = {
      past: [...board.history.past, beforeSnapshot],
      future: [],
    };
  }

  return { board: boardCopy, undoSnapshot: beforeSnapshot, toast };
}

export function undoLastChange(board: KanbanBoardState): KanbanBoardState {
  if (board.history.past.length === 0) {
    return board;
  }
  const previous = board.history.past[board.history.past.length - 1];
  return {
    columns: previous.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
    cards: Object.fromEntries(Object.entries(previous.cards).map(([id, card]) => [id, { ...card }])),
    history: {
      past: board.history.past.slice(0, -1),
      future: [
        {
          columns: board.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
          cards: Object.fromEntries(Object.entries(board.cards).map(([id, card]) => [id, { ...card }])),
        },
        ...board.history.future,
      ],
    },
    preferences: { ...board.preferences },
  };
}

export function redoLastUndo(board: KanbanBoardState): KanbanBoardState {
  if (board.history.future.length === 0) {
    return board;
  }
  const next = board.history.future[0];
  return {
    columns: next.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
    cards: Object.fromEntries(Object.entries(next.cards).map(([id, card]) => [id, { ...card }])),
    history: {
      past: [
        ...board.history.past,
        {
          columns: board.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] })),
          cards: Object.fromEntries(Object.entries(board.cards).map(([id, card]) => [id, { ...card }])),
        },
      ],
      future: board.history.future.slice(1),
    },
    preferences: { ...board.preferences },
  };
}

export function createInlineCard(
  column: KanbanColumn,
  title: string,
  options: InlineDraftOptions = {},
): InlineDraftResult {
  const now = options.now ?? new Date();
  const card: KanbanCard = {
    id: `card-${now.getTime()}`,
    title,
    tags: [],
    updatedAt: now.toISOString(),
    checklist: [],
    swimlaneId: column.swimlaneId,
  };
  return {
    card,
    autoSaveDueAt: new Date(now.getTime() + 5000).toISOString(),
    focusNext: Boolean(options.continuous),
  };
}

export function handleSaveFailure(): InlineSaveFailureResult {
  return {
    error: '保存に失敗しました',
    retryAvailable: true,
    draftRetained: true,
  };
}

export function handleKeyboardNavigation(
  options: KeyboardNavigationOptions,
  command: KeyboardCommand,
): KeyboardNavigationResult {
  const { columns, focus } = options;
  const columnIndex = columns.findIndex((col) => col.id === focus.columnId);
  if (columnIndex === -1) {
    throw new Error('列が見つかりません');
  }
  if (command.type === 'move') {
    if (command.direction === 'up') {
      const nextIndex = Math.max(0, focus.index - 1);
      return { nextFocus: { columnId: focus.columnId, index: nextIndex } };
    }
    if (command.direction === 'down') {
      const column = columns[columnIndex];
      const nextIndex = Math.min(column.cardIds.length - 1, focus.index + 1);
      return { nextFocus: { columnId: focus.columnId, index: nextIndex } };
    }
    if (command.direction === 'left') {
      const targetColumn = columns[Math.max(0, columnIndex - 1)];
      const index = Math.min(focus.index, targetColumn.cardIds.length - 1);
      return { nextFocus: { columnId: targetColumn.id, index: Math.max(0, index) } };
    }
    if (command.direction === 'right') {
      const targetColumn = columns[Math.min(columns.length - 1, columnIndex + 1)];
      const index = Math.min(focus.index, targetColumn.cardIds.length - 1);
      return { nextFocus: { columnId: targetColumn.id, index: Math.max(0, index) } };
    }
  }
  if (command.type === 'enter') {
    return { nextFocus: focus, action: 'edit' };
  }
  if (command.type === 'escape') {
    return { nextFocus: focus, action: 'cancel' };
  }
  return { nextFocus: focus };
}

export function presentTags(card: KanbanCard, palette: TagPaletteEntry[]): TagPresentation {
  const tags = card.tags.map((tagId) => {
    const paletteEntry = palette.find((entry) => entry.id === tagId);
    return {
      id: tagId,
      label: paletteEntry?.label ?? tagId,
      color: paletteEntry?.color ?? '#CCCCCC',
    };
  });
  if (tags.length <= 3) {
    return { visible: tags };
  }
  const visible = tags.slice(0, 3);
  const overflowTags = tags.slice(3);
  return {
    visible,
    overflow: { count: overflowTags.length, tags: overflowTags },
  };
}

export function buildDueBadge(card: KanbanCard, options: DueBadgeOptions): DueBadgePresentation {
  if (!card.dueDate) {
    return { tone: 'neutral', accent: options.colorBlindMode ? '#6C6C6C' : '#9C9C9C', icon: 'calendar', emphasised: false, label: '期限なし' };
  }
  const due = new Date(card.dueDate);
  const diff = Math.ceil((due.getTime() - options.now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) {
    return {
      tone: 'overdue',
      accent: options.colorBlindMode ? '#555555' : '#C97A63',
      icon: options.colorBlindMode ? 'warning-pattern' : 'warning',
      emphasised: true,
      label: `${Math.abs(diff)}日超過`,
    };
  }
  if (diff <= 3) {
    return {
      tone: 'soon',
      accent: options.colorBlindMode ? '#4F4F4F' : '#E8B778',
      icon: options.colorBlindMode ? 'bell-pattern' : 'bell',
      emphasised: true,
      label: diff === 0 ? '本日' : `${diff}日以内`,
    };
  }
  return {
    tone: 'neutral',
    accent: options.colorBlindMode ? '#6C6C6C' : '#9C9C9C',
    icon: 'calendar',
    emphasised: false,
    label: `${diff}日後`,
  };
}

export function presentAssignee(card: KanbanCard): AssigneePresentation {
  if (card.assigneeId && card.assigneeName) {
    return {
      label: card.assigneeName,
      avatarUrl: card.assigneeAvatarUrl,
      placeholderIcon: 'avatar',
    };
  }
  return {
    label: '未割り当て',
    placeholderIcon: 'avatar-off',
  };
}

export function summariseChecklist(card: KanbanCard): ChecklistSummary {
  const items = [...(card.checklist ?? [])].sort((a, b) => a.order - b.order);
  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  if (total === 0) {
    return { completed: 0, total: 0, progress: 0, status: 'empty' };
  }
  const progress = Math.round((completed / total) * 100);
  const status = completed === total ? 'completed' : 'in-progress';
  return { completed, total, progress, status };
}

export function searchCards(cards: KanbanCard[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }
  const normalised = query.trim().toLowerCase();
  return cards
    .map((card) => {
      const matchedFields: string[] = [];
      if (card.title.toLowerCase().includes(normalised)) {
        matchedFields.push('title');
      }
      if (card.description && card.description.toLowerCase().includes(normalised)) {
        matchedFields.push('description');
      }
      if (card.tags.some((tag) => tag.toLowerCase().includes(normalised))) {
        matchedFields.push('tags');
      }
      if (matchedFields.length === 0) {
        return undefined;
      }
      return {
        id: card.id,
        matchedFields,
        highlight: card.title,
      };
    })
    .filter((result): result is SearchResult => Boolean(result));
}

export function applyFilters(cards: KanbanCard[], conditions: FilterCondition[]): FilterState {
  let filtered = [...cards];
  const chips: Array<{ label: string; value: string }> = [];
  for (const condition of conditions) {
    chips.push({ label: condition.type, value: condition.value });
    if (condition.type === 'assignee') {
      filtered = filtered.filter((card) => card.assigneeId === condition.value);
    } else if (condition.type === 'tag') {
      filtered = filtered.filter((card) => card.tags.includes(condition.value));
    } else if (condition.type === 'status') {
      filtered = filtered.filter((card) => card.swimlaneId === condition.value);
    } else if (condition.type === 'due') {
      if (condition.value === 'none') {
        filtered = filtered.filter((card) => !card.dueDate);
      }
    }
  }
  return { cards: filtered, chips, emptyState: filtered.length === 0 };
}

export function sortCards(cards: KanbanCard[], criterion: SortCriterion): KanbanCard[] {
  const copy = [...cards];
  if (criterion === 'dueDate') {
    return copy.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
  if (criterion === 'priority') {
    const order: Record<NonNullable<KanbanCard['priority']>, number> = { high: 0, medium: 1, low: 2 };
    return copy.sort((a, b) => (order[a.priority ?? 'low'] ?? 3) - (order[b.priority ?? 'low'] ?? 3));
  }
  return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function saveView(
  existingViews: ViewDefinition[],
  conditions: FilterCondition[],
  options: SaveViewOptions,
): ViewDefinition {
  const now = new Date().toISOString();
  const view: ViewDefinition = {
    id: `view-${now}`,
    name: options.name,
    conditions: conditions.map((condition) => ({ ...condition })),
    sharedWith: options.sharedWith?.length ? [...options.sharedWith] : undefined,
    auditLog: [
      {
        by: options.actorId,
        at: now,
        action: 'created',
      },
    ],
  };
  existingViews.push(view);
  return view;
}

export function resizeColumn(
  column: KanbanColumn,
  width: number,
  options: ColumnResizeOptions = {},
): ColumnResizeResult {
  const min = options.minWidth ?? 240;
  const max = options.maxWidth ?? 480;
  const clamped = Math.min(Math.max(width, min), max);
  return {
    column: { ...column, width: clamped },
    persisted: true,
  };
}

export function applyScrollBehaviour(
  scrolls: ScrollState[],
  target: ScrollState,
): ScrollBehaviourResult {
  const snaps = scrolls.map((state) => ({ columnId: state.columnId, position: Math.round(state.scrollTop / 16) * 16 }));
  const restored = scrolls.some((state) => state.columnId === target.columnId && state.scrollTop === target.scrollTop);
  return { snaps, restored };
}

export function handleGesture(gesture: GestureInput): GestureHandlingResult {
  if (gesture.type === 'long-press') {
    return { action: 'open-menu', accessible: true };
  }
  if (gesture.type === 'swipe' && gesture.direction === 'right') {
    return { action: 'open-card', accessible: true };
  }
  if (gesture.type === 'drag') {
    return { action: 'start-drag', accessible: true };
  }
  return { action: 'none', accessible: true };
}

export function configureSwimlanes(swimlanes: SwimlaneState[]): SwimlaneConfigResult {
  return {
    swimlanes: swimlanes.map((lane) => ({ ...lane })),
    persistenceKey: 'kanban-swimlane-state',
  };
}

export function changeWipLimit(
  column: KanbanColumn,
  limit: number,
  options: WipLimitChangeOptions,
): WipLimitChangeResult {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error('WIP制限は正の整数である必要があります');
  }
  const updated: KanbanColumn = { ...column, wipLimit: Math.floor(limit) };
  const warning = column.cardIds.length > updated.wipLimit ? '現在のカード数が制限を超過しています' : undefined;
  return {
    column: updated,
    auditLogEntry: {
      columnId: column.id,
      actorId: options.actorId,
      at: options.now.toISOString(),
      limit: updated.wipLimit,
    },
    warning,
  };
}

export function evaluateWip(
  column: KanbanColumn,
  preferences: BoardPreferences,
  exceededToastId?: string,
): WipEvaluationResult {
  const limit = column.wipLimit ?? Infinity;
  const exceeded = column.cardIds.length > limit;
  const display = exceeded
    ? {
        tone: 'warning' as const,
        icon: preferences.colorBlindMode ? 'pattern-warning' : 'alert',
        pattern: preferences.colorBlindMode ? 'stripe' : undefined,
      }
    : { tone: 'normal' as const };
  const toast = exceeded && preferences.wipNotificationsEnabled
    ? {
        id: exceededToastId ?? `wip-${column.id}`,
        tone: 'warning' as const,
        message: 'WIP制限を超過しています',
        durationMs: preferences.toastDurationMs,
      }
    : undefined;
  return {
    columnId: column.id,
    exceeded,
    display,
    disableAddCard: exceeded,
    toast,
  };
}

export function changeWipPolicy(
  column: KanbanColumn,
  policy: 'enforced' | 'allow-exception',
  actorId: string,
  now: Date,
): WipPolicyChangeResult {
  const requiresReason = policy === 'allow-exception';
  return {
    column: { ...column, wipPolicy: policy },
    policy,
    requiresReason,
    auditLogEntry: {
      columnId: column.id,
      policy,
      actorId,
      at: now.toISOString(),
      reasonRequired: requiresReason,
    },
  };
}

export function buildWipHeatmap(columns: KanbanColumn[], preferences: BoardPreferences): WipHeatmapResult {
  const cells = columns.map((column) => {
    const limit = column.wipLimit ?? Infinity;
    const ratio = limit === Infinity ? 0 : column.cardIds.length / limit;
    let tone: WipHeatmapCell['tone'] = 'calm';
    if (ratio >= 1.2) {
      tone = 'hot';
    } else if (ratio >= 0.8) {
      tone = 'elevated';
    }
    return {
      columnId: column.id,
      ratio,
      tone,
      pattern: preferences.colorBlindMode && tone !== 'calm' ? 'stripe' : undefined,
    };
  });
  return {
    cells,
    legend: [
      { tone: 'calm', meaning: '余裕あり' },
      { tone: 'elevated', meaning: '注意' },
      { tone: 'hot', meaning: '超過' },
    ],
  };
}

export function resolveAnimationSettings(preferences: AnimationPreferences): AnimationSettings {
  if (preferences.animationDisabled) {
    return { liftDuration: 0, easing: 'linear', enabled: false };
  }
  if (preferences.reducedMotion || preferences.environment === 'low-power') {
    return { liftDuration: 120, easing: 'ease-out', enabled: true };
  }
  return { liftDuration: 200, easing: 'ease-in-out', enabled: true };
}

export function enqueueToast(queue: ToastQueue, toast: ToastMessage): ToastQueue {
  return { messages: [...queue.messages, toast] };
}

export function confirmDangerousAction(options: ConfirmationOptions): ConfirmationResult {
  return {
    confirmed: false,
    defaultAction: 'cancel',
    recoveryAvailable: true,
  };
}

export function toggleSound(mode: 'on' | 'off'): SoundToggleResult {
  return { mode, obeysSystemVolume: true };
}

export function planVirtualisation(
  board: KanbanBoardState,
  options: VirtualisationOptions,
): VirtualisationPlan {
  const slices = board.columns.map((column) => {
    const totalHeight = column.cardIds.length * options.itemHeight;
    const end = Math.min(totalHeight, options.viewportHeight * 2);
    return { columnId: column.id, start: 0, end };
  });
  const lightweightMode = slices.some((slice) => slice.end > options.viewportHeight * 1.5);
  return { slices, lightweightMode };
}

export function applyOptimisticChange(
  board: KanbanBoardState,
  change: OptimisticChange,
): OptimisticUpdateResult {
  const updated = change.apply(board);
  return { board: updated, pending: change };
}

export function queueOfflineChange(queue: OfflineChange[], change: OfflineChange): OfflineQueueResult {
  return {
    queue: [...queue, change],
    bannerVisible: true,
  };
}

export function restoreBoardState(options: RestoreStateOptions): RestoreStateResult {
  if (options.sessionIsPrivate) {
    return {
      fallbackToDefault: true,
      toast: {
        id: 'private-mode',
        tone: 'info',
        message: 'プライベートモードでは状態を復元しません',
        durationMs: 4000,
      },
    };
  }
  const view = options.stored?.viewId
    ? options.availableViews.find((candidate) => candidate.id === options.stored?.viewId)
    : undefined;
  return {
    scroll: options.stored?.scroll,
    openedCardId: options.stored?.openedCardId,
    view,
    fallbackToDefault: !view,
  };
}
