import json, os, sys, re
D = r"C:\Users\user\Documents\Mimi\Nov 2026\PFE_draft"
R = sys.argv[1]
for name in (sys.argv[2].split(",") if len(sys.argv)>2 and not sys.argv[2].startswith("-") else ["science", "sources", "jury"]):
    raw = open(os.path.join(D, "reviews", f"api_R{R}_{name}.json"), encoding="utf-8").read()
    raw = raw[raw.index("["):]
    raw = raw[:raw.rindex("]")+1] if raw.rstrip().endswith("]") else raw
    try: items = json.loads(raw)
    except Exception:
        raw = raw[:raw.rindex("},")+1] + "]"; items = json.loads(raw)
    print(f"=== {name}: {len(items)}")
    for i, it in enumerate(items):
        p = os.path.join(D, it["file"])
        ok = os.path.exists(p) and open(p, encoding="utf-8").read().count(it["old"]) == 1
        full = "-v" in sys.argv
        print(f"{name[:3]}{i} [{it['sev'][:4]}] {'OK ' if ok else 'NOMATCH'} {it['file'][:12]} | {it['why'][:150]}")
        if full: print("   OLD:", it["old"][:200], "\n   NEW:", it["new"][:300])
