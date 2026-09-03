#!/usr/bin/env python3
from pathlib import Path

p = Path('components/shop/SellersListView.jsx')
t = p.read_text(encoding='utf-8')
n = 0

old1 = '''                          <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:opacity-95" loading="lazy" decoding="async" />
                          <div className="absolute inset-0 bg-primary-950/55 dark:bg-primary-950/60" />
                          {idx < 3 && (
                            <span className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-amber-50'}`}>
                              {toFa(idx + 1)}
                            </span>
                          )}
                          <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                            <h3 className="text-base font-bold text-white dark:!text-white">{s.name}</h3>
                            <p className="text-xs text-white/90 dark:!text-white mt-0.5">{s.desc}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-white/80 dark:!text-white">{toFa(s.productsSafe)} محصول · {toFa(Number(s.rating).toFixed(1))}★</span>
                              <span className="text-xs font-medium text-white dark:!text-white group-hover:underline">مشاهده</span>
                            </div>
                          </div>'''

new1 = '''                          <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />
                          {idx < 3 && (
                            <span className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-amber-50'}`}>
                              {toFa(idx + 1)}
                            </span>
                          )}
                          <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                            <h3 className="text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{s.name}</h3>
                            <p className="text-xs text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{s.desc}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{toFa(s.productsSafe)} محصول · {toFa(Number(s.rating).toFixed(1))}★</span>
                              <span className="text-xs font-semibold text-white underline-offset-2 group-hover:underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">مشاهده</span>
                            </div>
                          </div>'''

if old1 not in t:
    raise SystemExit('ranked seller card block not found')
t = t.replace(old1, new1, 1)
n += 1
print('ranked cards OK')

old2 = '<div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />'
new2 = '<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />'
if old2 in t:
    t = t.replace(old2, new2)
    n += 1
    print('grid banner overlay OK')
else:
    print('WARN grid overlay')

p.write_text(t, encoding='utf-8')
print('changes', n)
