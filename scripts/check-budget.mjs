/**
 * یادآور بودجه عملکرد — برای اندازه‌گیری واقعی:
 * npx lighthouse http://127.0.0.1:3000 --only-categories=performance --form-factor=mobile
 * خروجی را با performance-budget.json مقایسه کنید.
 */
import { readFileSync } from 'fs';
const budget = JSON.parse(readFileSync(new URL('../performance-budget.json', import.meta.url), 'utf8'));
console.log('Performance budget (mobile IR targets):');
for (const b of budget.budgets) {
  console.log(`  ${b.path}: LCP<=${b.lcpMs}ms TBT<=${b.tbtMs}ms CLS<=${b.cls}`);
}
console.log(budget.notes);
console.log('\nRun Lighthouse against a running dev/prod server to measure.');
