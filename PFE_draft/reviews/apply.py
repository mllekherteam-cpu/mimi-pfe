import json, os, sys, re
D = r"C:\Users\user\Documents\Mimi\Nov 2026\PFE_draft"
R = sys.argv[1]; SKIP = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else set()
DRY = "--dry" in sys.argv
def load(name):
    raw = open(os.path.join(D, "reviews", f"api_R{R}_{name}.json"), encoding="utf-8").read()
    raw = raw[raw.index("["):]
    try: return json.loads(raw[:raw.rindex("]")+1])
    except Exception: return json.loads(raw[:raw.rindex("},")+1] + "]")
applied, skipped = 0, []
for name in ["science", "sources", "jury"]:
    for i, it in enumerate(load(name)):
        tag = f"{name[:3]}{i}"
        if tag in SKIP or it["old"] == it["new"]: continue
        p = os.path.join(D, it["file"]); s = open(p, encoding="utf-8").read()
        if s.count(it["old"]) != 1: skipped.append(tag); continue
        newtok = set(re.findall(r"\d[\d ,.]*|\([^()]*\d{4}[^()]*\)", it["new"])) - set(re.findall(r"\d[\d ,.]*|\([^()]*\d{4}[^()]*\)", it["old"]))
        if DRY:
            if newtok: print(tag, "NEW TOKENS:", newtok, "|", it["new"][:220])
            continue
        open(p, "w", encoding="utf-8").write(s.replace(it["old"], it["new"], 1)); applied += 1
print("applied", applied, "skipped(nomatch)", skipped)
