import sys, json, os, re, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ask2 import ask as _ask
def ask(m, c, max_tokens, who):
    t, u, _, _ = _ask(m, c, max_tokens, who, {"thinking": {"type": "between_tools"}}); return t, u
D = r"C:\Users\user\Documents\Mimi\Nov 2026\PFE_draft"
FILES = ["04_Sommaire_et_Introduction.md", "05_Partie_I.md", "06_Partie_II_a.md", "06_Partie_II_b.md",
         "07_Partie_III.md", "08_Partie_IV.md", "08b_Discussion.md", "09_Conclusion_Recommandations.md"]
doc = ""
for f in FILES:
    t = open(os.path.join(D, f), encoding="utf-8").read()
    if f.startswith("04"):
        t = t[t.index("# Introduction générale"):t.index("**Références citées")]
    doc += f"\n\n===== FILE: {f} =====\n{t}"
ROUND = sys.argv[1] if len(sys.argv) > 1 else "1"
COMMON = """Tu relis un mémoire de Master (Université Ibn Tofail, Kénitra) sur la STEP de Kénitra (Waterleau) : boues activées, digestion anaérobie mésophile, cogénération. Règle de l'étudiante : chaque affirmation doit être sourcée (sources 2021–2026, sauf lois et normes) ; ne jamais inventer de source ni de chiffre. Les crochets [À compléter ...] et [NOM] sont des zones volontairement laissées à l'étudiante : ne les signale pas.

RÉPONDS UNIQUEMENT par un tableau JSON (sans texte autour, sans ```), au plus %d éléments, triés du plus grave au moins grave :
[{"file": "nom exact du fichier", "old": "extrait EXACT copié du texte (20 à 300 caractères, unique dans le fichier)", "new": "texte de remplacement complet en français", "why": "raison courte", "sev": "critique|majeur|mineur"}]
Le remplacement ne doit introduire aucune nouvelle source ni aucun chiffre non présent dans le mémoire. Pour supprimer une phrase, mets new = "".
"""
TASKS = {
 "science": COMMON % 30 + """
ANGLE : exactitude scientifique et cohérence des chiffres. Refais chaque calcul (énergie du biogaz, électricité, puissance, taux de couverture, CO2 évité, rendements). Cherche les incohérences entre sections (même grandeur avec des valeurs différentes, Résumé/Abstract vs corps, hypothèses H1–H3 vs leur vérification), les erreurs techniques (biochimie de la digestion, nitrification, unités, Nm³), les numéros de tableau/figure cités qui ne correspondent pas, et les affirmations exagérées qu'un jury attaquerait.""",
 "sources": COMMON % 30 + """
ANGLE : adéquation citation ↔ affirmation, avec ta connaissance de ces articles. Signale : une citation attachée à une affirmation que la source ne fait sans doute pas (ex. un article de modélisation de l'estuaire cité pour un détail de procédé), un chiffre attribué à une source qui ne le donne probablement pas, une même source citée pour tout, une affirmation encore sans source, une entrée bibliographique incohérente avec les citations du texte (auteur, année, a/b). Propose soit une reformulation prudente fidèle à la source, soit la suppression.""",
 "jury": COMMON % 35 + """
ANGLE : le président du jury. Qualité du français académique (grammaire, accords, typographie française, anglicismes, tournures lourdes ou génériques qui sonnent « texte automatique » : réécris-les en phrases précises et naturelles), cohérence des termes (STEP/station, AGV, TAC), répétitions entre parties, logique du plan vis-à-vis de la problématique, sigles non définis à la première occurrence, commentaires de tableaux/figures manquants.""",
}
def run(name):
    text, usd = ask("claude-sonnet-5-5", TASKS[name] + "\n\nMÉMOIRE :\n" + doc, max_tokens=12000, who="mimi-review")
    open(os.path.join(D, "reviews", f"api_R{ROUND}_{name}.json"), "w", encoding="utf-8").write(text)
    return name, usd
with cf.ThreadPoolExecutor(3) as ex:
    tot = 0
    for name, usd in ex.map(run, TASKS):
        tot += usd; print(name, round(usd, 3))
print("total $", round(tot, 3))
