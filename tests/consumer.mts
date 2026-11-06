import { createSanitizationPlan } from '@lp-labs/document-sanitization-policy';
import type {
  SanitizationCategory,
  SanitizationAction,
  SanitizationInventoryItem,
  SanitizationPolicy,
  SanitizationPlanItem,
  SanitizationPlan,
} from '@lp-labs/document-sanitization-policy';
const runtimeExports: unknown[] = [createSanitizationPlan];
type PublicTypes =
  | SanitizationCategory
  | SanitizationAction
  | SanitizationInventoryItem
  | SanitizationPolicy
  | SanitizationPlanItem
  | SanitizationPlan;
void runtimeExports;
let publicType!: PublicTypes;
void publicType;
