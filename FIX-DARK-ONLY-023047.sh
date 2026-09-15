#!/bin/bash
set -e
cd /Users/mac/Documents/Projects/Pirahanmardane/Pirahanemardaneir-pro
if [ ! -f package.json ] || [ ! -d app ]; then echo "❌ فولدر پروژه پیدا نشد"; exit 1; fi
echo "✅ پروژه: $(pwd)"
echo "🔒 فقط دارک | لایت دست نخورده"

python3 << 'PY'
from pathlib import Path
import re
css_path = Path("app/globals.css")
if not css_path.exists():
    raise SystemExit("❌ app/globals.css پیدا نشد")
text = css_path.read_text(encoding="utf-8")
original = text

def restore_light(s):
    lines = s.splitlines(keepends=True)
    out, i, n = [], 0, len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()
        if re.search(r"html\|\\s*,|\\s*\{|\[data-theme=[\"']dark[\"']\]", stripped) and "{" in line:
            depth = line.count("{") - line.count("}")
            out.append(line); i += 1
            while i < n and depth > 0:
                out.append(lines[i])
                depth += lines[i].count("{") - lines[i].count("}")
                i += 1
            continue
        new_line = line
        recent = "".join(out[-30:])
        if "html:not()" not in recent and "" not in recent[-200:]:
            for prop in ("--pm-accent:", "--pm-primary:", "--color-apple-blue:", "--color-grok-orange:", "--pm-brand-red:"):
                if re.match(rf"\s*{re.escape(prop)}\s*#13ABC4", new_line):
                    new_line = re.sub(r"#13ABC4", "#023047", new_line, count=1)
        out.append(new_line); i += 1
    return "".join(out)

text = restore_light(text)

def patch_dark(s):
    lines = s.splitlines(keepends=True)
    out, i, n = [], 0, len(lines)
    def is_dark(line):
        t = line.strip()
        if "html:not()" in t: return False
        return bool(re.search(r"html\|(?:^|[,+\s])\\b|\[data-theme=[\"']dark[\"']\]", t))
    while i < n:
        line = lines[i]
        if "{" in line and is_dark(line):
            block = [line]; depth = line.count("{") - line.count("}"); i += 1
            while i < n and depth > 0:
                block.append(lines[i]); depth += lines[i].count("{") - lines[i].count("}"); i += 1
            bt = "".join(block); protected = []
            def protect(m):
                protected.append(m.group(0)); return f"__PROT{len(protected)-1}__"
            tmp = re.sub(r"\[[^\]]*(?:023047)[^\]]*\]", protect, bt, flags=re.I)
            tmp = re.sub(r"#023047\b", "#13ABC4", tmp, flags=re.I)
            for idx, frag in enumerate(protected):
                tmp = tmp.replace(f"__PROT{idx}__", frag)
            out.append(tmp); continue
        out.append(line); i += 1
    return "".join(out)

text = patch_dark(text)

MARKER = "FORCE DARK ONLY: #023047 → #13ABC4"
FORCE = """

/* ==========================================================================
   FORCE DARK ONLY: #023047 → #13ABC4
   لایت عمداً دست نخورده — فقط html:not()
   ========================================================================== */
html:not() [class*="bg-[#023047]"],
html:not() [class*="bg-\\[#023047\\]"],
html:not() .bg-\\[\\#023047\\],
html:not() button[class*="bg-[#023047]"],
html:not() a[class*="bg-[#023047]"],
html:not() [style*="#023047"],
html:not() [style*="023047"] {
  background-color: #13ABC4 !important;
  background: #13ABC4 !important;
  border-color: #13ABC4 !important;
}
html:not() [class*="text-[#023047]"],
html:not() [class*="text-\\[#023047\\]"],
html:not() .text-\\[\\#023047\\] {
  color: #13ABC4 !important;
  -webkit-text-fill-color: #13ABC4 !important;
}
html:not() [class*="border-[#023047]"],
html:not() [class*="border-\\[#023047\\]"],
html:not() [class*="ring-[#023047]"],
html:not() [class*="ring-\\[#023047\\]"] {
  border-color: #13ABC4 !important;
  --tw-ring-color: rgba(19, 171, 196, 0.45) !important;
  outline-color: #13ABC4 !important;
}
html:not(), ,  {
  --pm-brand-red: #13ABC4;
  --pm-brand-red- #0D91A7;
  --pm-brand-red-darker: #087F91;
  --color-apple-blue: #13ABC4;
  --color-grok-orange: #13ABC4;
  --pm-accent: #13ABC4;
  --pm-primary: #13ABC4;
}
"""
if MARKER not in text:
    text = re.sub(r"/\* =+\s*\n\s*FORCE DARK:.*?(?=\n/\* =+\n|\Z)", "", text, flags=re.S)
    text = text.rstrip() + "\n" + FORCE + "\n"
    print("  ✓ FORCE دارک اضافه شد")
else:
    print("  ℹ️ FORCE از قبل بود")

css_path.write_text(text, encoding="utf-8")
print("  ✓ globals.css — فقط دارک / لایت قفل")

exts = {".jsx", ".js", ".tsx", ".ts", ".css", ".mjs"}
skip = {"node_modules", ".git", ".next", "dist", "build", "coverage", "e2e"}
pats = [
    (re.compile(r"bg-\[#023047\]", re.I), "bg-[#13ABC4]"),
    (re.compile(r"text-\[#023047\]", re.I), "text-[#13ABC4]"),
    (re.compile(r"border-\[#023047\]", re.I), "border-[#13ABC4]"),
    (re.compile(r"ring-\[#023047\]", re.I), "ring-[#13ABC4]"),
    (re.compile(r"([a-z-]+-)#023047\b", re.I), r"\1#13ABC4"),
]
for path in Path(".").rglob("*"):
    if not path.is_file() or path.suffix not in exts: continue
    if any(p in skip for p in path.parts): continue
    if path.resolve() == css_path.resolve(): continue
    try: c = path.read_text(encoding="utf-8")
    except Exception: continue
    n = c
    for rx, repl in pats: n = rx.sub(repl, n)
    if n != c:
        path.write_text(n, encoding="utf-8")
        print(f"  ✓ {path}")
print("\n✅ لایت دست نخورده | دارک: #023047 → #13ABC4")
PY

git add -A
if git diff --cached --quiet 2>/dev/null; then
  git commit --allow-empty -m "chore: force vercel redeploy (dark-only color, light untouched)"
else
  git commit -m "fix(dark-only): #023047 → #13ABC4; light mode untouched/restored"
fi
git push origin "$(git rev-parse --abbrev-ref HEAD)"
echo "✅ پوش شد. لایت=#023047 | دارک=#13ABC4"
