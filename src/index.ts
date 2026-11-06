export type SanitizationCategory =
  | 'metadata'
  | 'annotations'
  | 'attachments'
  | 'javascript-actions'
  | 'embedded-files'
  | 'form-values'
  | 'unknown-content';

export type SanitizationAction = 'retain' | 'remove' | 'review';

export interface SanitizationInventoryItem {
  category: SanitizationCategory;
  count: number;
  details?: string;
}

export interface SanitizationPolicy {
  actions?: Partial<Record<SanitizationCategory, SanitizationAction>>;
  defaultAction?: SanitizationAction;
}

export interface SanitizationPlanItem extends SanitizationInventoryItem {
  action: SanitizationAction;
}

export interface SanitizationPlan {
  readonly items: readonly SanitizationPlanItem[];
  readonly requiresReview: boolean;
  readonly changesApplied: false;
  readonly scopeNotice: string;
}

const CATEGORIES = new Set<SanitizationCategory>([
  'metadata',
  'annotations',
  'attachments',
  'javascript-actions',
  'embedded-files',
  'form-values',
  'unknown-content',
]);
const ACTIONS = new Set<SanitizationAction>(['retain', 'remove', 'review']);
const NOTICE =
  'This is an inventory-based plan only; it does not modify bytes or sanitize opaque PDF content.';

export function createSanitizationPlan(
  inventory: readonly SanitizationInventoryItem[],
  policy: SanitizationPolicy = {},
): SanitizationPlan {
  if (!Array.isArray(inventory) || inventory.length > 10_000)
    throw new RangeError('Inventory must be an array of at most 10000 entries.');
  if (!policy || typeof policy !== 'object')
    throw new TypeError('Sanitization policy must be an object.');
  const defaultAction = policy.defaultAction ?? 'review';
  if (!ACTIONS.has(defaultAction)) throw new TypeError('Unknown default sanitization action.');
  const actions = policy.actions ?? {};
  const combined = new Map<SanitizationCategory, SanitizationPlanItem>();
  for (const item of inventory) {
    if (!item || !CATEGORIES.has(item.category))
      throw new TypeError('Unknown sanitization category.');
    const category = item.category as SanitizationCategory;
    if (!Number.isSafeInteger(item.count) || item.count < 0 || item.count > 1_000_000)
      throw new RangeError('Inventory counts must be between zero and one million.');
    if (
      item.details !== undefined &&
      (typeof item.details !== 'string' ||
        item.details.length > 512 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(item.details))
    )
      throw new TypeError('Inventory details must be plain text up to 512 characters.');
    const action = actions[category] ?? defaultAction;
    if (!ACTIONS.has(action)) throw new TypeError(`Invalid policy action for ${item.category}.`);
    const previous = combined.get(category);
    const count = (previous?.count ?? 0) + item.count;
    if (count > 1_000_000)
      throw new RangeError(`Combined count for ${category} exceeds the limit.`);
    const details = [previous?.details, item.details].filter(Boolean).join('; ').slice(0, 512);
    combined.set(
      category,
      Object.freeze({
        category,
        count,
        action,
        ...(details ? { details } : {}),
      }),
    );
  }
  const items = Object.freeze(
    [...combined.values()].sort((a, b) => a.category.localeCompare(b.category)),
  );
  return Object.freeze({
    items,
    requiresReview: items.some((item) => item.action === 'review'),
    changesApplied: false,
    scopeNotice: NOTICE,
  });
}
