#!/usr/bin/env python3
"""UX clarity: product seller badge + add-to-cart contrast in App.jsx"""
from pathlib import Path

p = Path('components/App.jsx')
t = p.read_text(encoding='utf-8')
n = 0

# Seller badge — stronger contrast (class product-seller-badge already targeted in CSS)
old1 = 'className="product-seller-badge inline-flex items-center gap-1 h-6 sm:h-7 px-1.5 sm:px-2 rounded-md bg-primary-100 dark:bg-primary-700 text-primary-900 dark:!text-white text-xs font-semibold whitespace-nowrap max-w-full transition border border-primary-200/80 dark:border-white/25 cursor-pointer hover:opacity-90"'
new1 = 'className="product-seller-badge inline-flex items-center gap-1 h-6 sm:h-7 px-1.5 sm:px-2 rounded-md bg-primary-900 dark:bg-white text-white dark:!text-primary-900 text-xs font-bold whitespace-nowrap max-w-full transition border border-primary-900 dark:border-white cursor-pointer hover:opacity-90"'
if old1 in t:
    t = t.replace(old1, new1)
    n += 1
    print('seller badge OK')
else:
    print('WARN seller badge')

# Compact add buttons on cards
old2 = 'className="w-full text-xs py-1 rounded-full bg-apple-blue text-white font-medium hover:opacity-90">افزودن</button>'
new2 = 'className="product-card-add-btn w-full text-xs py-2 rounded-xl bg-[#0A84FF] text-white font-bold hover:opacity-95">افزودن به سبد</button>'
c2 = t.count(old2)
if c2:
    t = t.replace(old2, new2)
    n += c2
    print('add btn compact', c2)
else:
    print('WARN compact add')

# Another common pattern
old3 = 'className="w-full text-xs py-1.5 rounded-full bg-apple-blue text-white font-medium hover:opacity-90">افزودن</button>'
if old3 in t:
    t = t.replace(old3, new2)
    n += 1
    print('add btn alt OK')

# PDP primary add if weak
old4 = '>افزودن به سبد</button>'
# don't mass replace

p.write_text(t, encoding='utf-8')
print('changes', n)
print('DONE')
