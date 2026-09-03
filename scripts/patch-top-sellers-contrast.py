#!/usr/bin/env python3
from pathlib import Path

p = Path('components/shop/HomeView.jsx')
t = p.read_text(encoding='utf-8')

old = '''                      <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:opacity-95" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-primary-950/55 dark:bg-primary-950/60" />
                      <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                        <h3 className="text-base font-bold text-white dark:!text-white">{s.name}</h3>
                        <p className="text-xs text-white/90 dark:!text-white mt-0.5">{s.desc}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-white/80 dark:!text-white">{toFa(s.products)} محصول</span>
                          <span className="text-xs font-medium text-white dark:!text-white group-hover:underline">مشاهده محصولات</span>
                        </div>
                      </div>'''

new = '''                      <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />
                      <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                        <h3 className="text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{s.name}</h3>
                        <p className="text-xs text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{s.desc}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{toFa(s.products)} محصول</span>
                          <span className="text-xs font-semibold text-white underline-offset-2 group-hover:underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">مشاهده محصولات</span>
                        </div>
                      </div>'''

if old not in t:
    raise SystemExit('top sellers card block not found')
p.write_text(t.replace(old, new, 1), encoding='utf-8')
print('top sellers contrast OK')
