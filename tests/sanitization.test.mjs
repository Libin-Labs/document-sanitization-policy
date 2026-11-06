import test from 'node:test';
import assert from 'node:assert/strict';
import { createSanitizationPlan } from '../dist/esm/index.js';

test('combines inventory into explicit actions without applying modifications', () => {
  const plan = createSanitizationPlan(
    [
      { category: 'metadata', count: 2 },
      { category: 'metadata', count: 1, details: 'author fields' },
      { category: 'javascript-actions', count: 1 },
    ],
    { actions: { metadata: 'remove' } },
  );
  assert.equal(plan.items.find((item) => item.category === 'metadata').count, 3);
  assert.equal(plan.items.find((item) => item.category === 'metadata').action, 'remove');
  assert.equal(plan.requiresReview, true);
  assert.equal(plan.changesApplied, false);
  assert.match(plan.scopeNotice, /does not modify bytes/);
});

test('policy can explicitly retain or review categories', () => {
  const plan = createSanitizationPlan(
    [
      { category: 'annotations', count: 4 },
      { category: 'unknown-content', count: 1 },
    ],
    { defaultAction: 'retain', actions: { 'unknown-content': 'review' } },
  );
  assert.equal(plan.items[0].action, 'retain');
  assert.equal(plan.requiresReview, true);
});

test('rejects invalid inventory, policy action and detail values', () => {
  assert.throws(() => createSanitizationPlan([{ category: 'metadata', count: -1 }]), /counts/);
  assert.throws(
    () => createSanitizationPlan([{ category: 'metadata', count: 1, details: 'x\u0000y' }]),
    /plain text/,
  );
  assert.throws(
    () =>
      createSanitizationPlan([{ category: 'javascript-actions', count: 1 }], {
        actions: { 'javascript-actions': 'erase' },
      }),
    /Invalid policy action/,
  );
});
