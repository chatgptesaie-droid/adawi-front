import os
import re
import pathlib

root = pathlib.Path(__file__).resolve().parent
exts = {".tsx", ".ts", ".jsx", ".js", ".html", ".css"}
skip_dirs = {"node_modules", ".git", "build", ".cache", "dist", ".remix"}
keep = set("\u2713\u2714\u2715\u2716\u2717\u2718")
pattern = re.compile(
    "["
    "\U0001F1E0-\U0001F1FF"
    "\U0001F300-\U0001F5FF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U0001F700-\U0001F77F"
    "\U0001F780-\U0001F7FF"
    "\U0001F800-\U0001F8FF"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FAFF"
    "\U00002702-\U000027B0"
    "\U00002600-\U000026FF"
    "\U00002B50-\U00002B55"
    "\U0000231A-\U0000231B"
    "\U000023E9-\U000023F3"
    "\U000023F8-\U000023FA"
    "\U000025AA-\U000025FE"
    "\U00002B05-\U00002B07"
    "\U00002B1B-\U00002B1C"
    "\U00002194-\U00002199"
    "\U000021A9-\U000021AA"
    "\U0000FE0F"
    "\U0000200D"
    "]"
)

allowed_roots = {".", "app", "public"}

files_hit = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in skip_dirs and not d.startswith(".")]
    rel = os.path.relpath(dirpath, root)
    parts = pathlib.Path(rel).parts
    if parts and parts[0] not in allowed_roots and rel != ".":
        continue
    for fn in filenames:
        p = pathlib.Path(dirpath) / fn
        if p.name == "_strip_emojis.py":
            continue
        if p.suffix.lower() not in exts:
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except Exception:
            continue
        out = []
        changed = False
        for ch in text:
            if ch in keep or not pattern.fullmatch(ch):
                out.append(ch)
            else:
                changed = True
        if not changed:
            continue
        new = "".join(out)
        p.write_text(new, encoding="utf-8")
        files_hit.append(str(p.relative_to(root)))

print("UPDATED", len(files_hit))
for f in files_hit:
    print(f)
