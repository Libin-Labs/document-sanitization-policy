# @lp-labs/document-sanitization-policy

Turn a known document-content inventory and explicit policy into a bounded review/removal plan.
The plan is advisory: no file bytes are changed and opaque PDF scripts or metadata are never
claimed to have been removed.

## Install

```bash
npm install @lp-labs/document-sanitization-policy
```

No runtime or peer dependencies. ESM, CommonJS and TypeScript declarations are included.

## Quickstart

```js
import { createSanitizationPlan } from '@lp-labs/document-sanitization-policy';

const plan = createSanitizationPlan(
  [
    { category: 'metadata', count: 3 },
    { category: 'javascript-actions', count: 1 },
  ],
  { actions: { metadata: 'remove' }, defaultAction: 'review' },
);
if (plan.changesApplied) throw new Error('This planner must not modify document bytes');
```

## API and customization

`createSanitizationPlan(inventory, policy?)` combines repeated inventory categories, orders results,
and returns frozen `items`, `requiresReview`, `changesApplied: false`, and a scope notice.
Categories are `metadata`, `annotations`, `attachments`, `javascript-actions`, `embedded-files`,
`form-values`, and `unknown-content`. Actions are `retain`, `remove`, or `review`; defaults to
`review`. Use per-category `actions` to override the default. TypeScript-only exports:
`SanitizationCategory`, `SanitizationAction`, `SanitizationInventoryItem`, `SanitizationPolicy`,
`SanitizationPlanItem`, `SanitizationPlan`.

At most 10,000 inventory records are accepted; each count is 0–1,000,000, and detail text is limited
to 512 control-free characters. Invalid categories, actions, counts, or details throw. Categories
are only as reliable as the inventory supplied by the caller.

## Runtime and scope

Pure synchronous logic with no PDF parser or sanitizer. It cannot inspect unknown metadata, remove
active content, flatten annotations/forms, delete attachments, redact visible text, or guarantee a
document is safe. Use a format-aware sanitizer, apply the plan, and independently validate the
result. No security or compliance certification is implied.

## Exports

Runtime: `createSanitizationPlan`.
Types: `SanitizationCategory`, `SanitizationAction`, `SanitizationInventoryItem`,
`SanitizationPolicy`, `SanitizationPlanItem`, `SanitizationPlan`.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
