/**
 * QA استاتیک فرانت — بدون مرورگر
 * node scripts/qa-frontend.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
let failed = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
  else console.log('ok:', msg);
}

const must = [
  'components/App.jsx',
  'components/Hero.jsx',
  'components/panels/SellerPanelContent.jsx',
  'components/panels/AdminPanelContent.jsx',
  'components/AppApiContext.jsx',
  'lib/stores/shopUiStore.js',
  'lib/stores/cartStore.js',
  'lib/client-storage.js',
];
for (const f of must) ok(existsSync(join(root, f)), `exists ${f}`);

const app = readFileSync(join(root, 'components/App.jsx'), 'utf8');
ok(app.includes('AppApiProvider'), 'AppApiProvider in App');
ok(app.includes('SellerPanelContent'), 'SellerPanelContent wired');
ok(app.includes('AdminPanelContent'), 'AdminPanelContent wired');
ok(app.includes('downloadBackupFile') || app.includes('exportClientBackup'), 'backup API referenced');
ok((app.match(/useState\(/g) || []).length <= 5, 'useState largely migrated');
ok(app.includes('useStoreField'), 'useStoreField in use');

const seller = readFileSync(join(root, 'components/panels/SellerPanelContent.jsx'), 'utf8');
const admin = readFileSync(join(root, 'components/panels/AdminPanelContent.jsx'), 'utf8');
ok(seller.length > 10000, 'SellerPanelContent substantial');
ok(admin.length > 10000, 'AdminPanelContent substantial');
ok(seller.includes('useAppApi') || seller.includes('EmptyStateBox'), 'seller panel structure');

// hero lock still present
const heroUtils = existsSync(join(root, 'components/hero/hero.utils.js'))
  ? readFileSync(join(root, 'components/hero/hero.utils.js'), 'utf8')
  : '';
ok(heroUtils.includes('lockScroll') || app.includes('lockScroll'), 'hero scroll lock present');

if (failed) {
  console.error(`\n${failed} QA checks failed`);
  process.exit(1);
}
console.log('\nFrontend static QA passed');
