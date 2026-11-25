"""Assemble le mémoire complet en .docx (format de la Faculté des Sciences de Kénitra)."""
import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

IMGS = {
 "localisation": ("figures/fig_localisation_gmaps.png", "Localisation de la STEP de Kénitra, entre la ville de Kénitra et l'oued Sebou, dans la région Rabat-Salé-Kénitra (source : Google Maps, 2026)"),
 "satellite": ("figures/fig_satellite_gmaps.png", "Vue satellite de la STEP de Kénitra et de l'aire de séchage solaire des boues voisine (source : Google Maps, 2026)"),
 "schema": ("figures/fig_schema_station.png", "Schéma général des filières eau, boues et biogaz de la STEP de Kénitra et des flux d'énergie entre elles (réalisation personnelle, d'après Lihi et al., 2023a)"),
 "digestion": ("figures/fig_etapes_digestion.png", "Les quatre étapes de la digestion anaérobie (d'après Mitraka et al., 2022)"),
 "stabilite": ("figures/fig_stabilite_digesteurs.png", "Paramètres de stabilité des digesteurs D1 et D2, valeurs médianes de mai et juin 2021 (d'après Lihi et al., 2023a)"),
 "couverture": ("figures/fig_couverture_energetique.png", "Taux de couverture théorique des besoins électriques de la station par la cogénération du biogaz, selon sa consommation spécifique (calcul personnel à partir des données de Lihi et al., 2023a)"),
}
NB, NNB = " ", " "

def typo(t):
    t = t.replace("'", "’")
    t = re.sub(r" ([:;?!%])", NNB + r"\1", t)
    t = re.sub(r"« ", "«" + NNB, t); t = re.sub(r" »", NNB + "»", t)
    t = re.sub(r"(\d) (\d{3})(?!\d)", r"\1" + NB + r"\2", t)
    t = re.sub(r"(\d) (?=(°C|m³|m3|Nm³|kWh|MWh|kW|g/L|mg|kg|t |t/|L |L/|km|h\b|j\b|ans?\b|mL|EH|%))", r"\1" + NB, t)
    t = t.replace("DBO5", "DBO₅")
    return t

d = Document(); sec = d.sections[0]; sec.page_height = Cm(29.7); sec.page_width = Cm(21)
for m in ("left_margin", "right_margin", "top_margin", "bottom_margin"): setattr(sec, m, Cm(2.5))
st = d.styles["Normal"]; st.font.name = "Times New Roman"; st.font.size = Pt(12)
st.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman"); st.element.rPr.rFonts.set(qn("w:cs"), "Times New Roman")
st.paragraph_format.line_spacing = 1.0; st.paragraph_format.space_after = Pt(6); st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
for i, sz in ((1, 16), (2, 14), (3, 12)):
    h = d.styles[f"Heading {i}"]; h.font.name = "Times New Roman"; h.font.size = Pt(sz); h.font.bold = True; h.font.color.rgb = RGBColor(0, 0, 0)
    h.element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman"); h.element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    h.paragraph_format.space_before = Pt(12); h.paragraph_format.space_after = Pt(6)
cap = d.styles.add_style("Légende mémoire", 1); cap.base_style = st; cap.font.italic = True; cap.font.size = Pt(11)
cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER

def field(run, instr):
    for t, txt in (("begin", None), (None, instr), ("separate", None)):
        if t: e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), t)
        else: e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = txt
        run._r.append(e)
def field_end(run):
    e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end"); run._r.append(e)
fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = fp.add_run(); field(r, " PAGE "); field_end(r)

# ---- liens cliquables : citations -> bibliographie, bibliographie -> articles en ligne
import unicodedata
from docx.opc.constants import RELATIONSHIP_TYPE as RT
def norm(x): return unicodedata.normalize("NFKD", x).encode("ascii", "ignore").decode().upper().replace("-", "").replace("'", "")
BIBKEYS = set()
BIBURL = {}
_c = open("09_Conclusion_Recommandations.md", encoding="utf-8").read()
for _e in _c[_c.index("# Références bibliographiques"):].split("\n")[1:]:
    _m = re.match(r"\[?([^ ,.(\]]+)", _e.strip()); _y = re.search(r"\. ((?:19|20)\d\d[ab]?)\.", _e)
    if _e.strip() and _m and _y:
        _k = f"ref_{norm(_m.group(1))}_{_y.group(1)}"; BIBKEYS.add(_k)
        _u = re.search(r"(https?://[^\s\]]+[^\s\].,;)])|DOI\s*:\s*(10\.[^\s\]]+[^\s\].,;)])", _e)
        if _u and _k not in BIBURL: BIBURL[_k] = _u.group(1) or "https://doi.org/" + _u.group(2)
LINK_CITES = [True]
CITE_RE = re.compile(r"([A-Z][A-Za-zÀ-ÿ'’\-]+[0-9]*)((?: et al\.| et [A-Z][A-Za-zÀ-ÿ\-]+)?)(,? \(?)((?:19|20)\d\d[ab]?)")
LINK_RE = re.compile(r"(https?://[^\s\]]+[^\s\].,;)])|DOI[   ]*:[  ]*(10\.[^\s\]]+[^\s\].,;)])")
_hl_id = [0]
def _hyperlink(p, text, url=None, anchor=None, italic=False, size=None):
    h = OxmlElement("w:hyperlink")
    if url: h.set(qn("r:id"), p.part.relate_to(url, RT.HYPERLINK, is_external=True))
    else: h.set(qn("w:anchor"), anchor)
    r = OxmlElement("w:r"); rPr = OxmlElement("w:rPr")
    c = OxmlElement("w:color"); c.set(qn("w:val"), "1F4E9A"); rPr.append(c)
    if url: u = OxmlElement("w:u"); u.set(qn("w:val"), "single"); rPr.append(u)
    if italic: rPr.append(OxmlElement("w:i"))
    if size: sz = OxmlElement("w:sz"); sz.set(qn("w:val"), str(int(size * 2))); rPr.append(sz)
    r.append(rPr); t = OxmlElement("w:t"); t.set(qn("xml:space"), "preserve"); t.text = text; r.append(t)
    h.append(r); p._p.append(h)
def _plain(p, text, italic=False, bold=False, size=None):
    pos = 0
    pat = re.compile(LINK_RE.pattern + ("|" + CITE_RE.pattern if LINK_CITES[0] else ""))
    for m in pat.finditer(text):
        url = None; anchor = None
        if m.group(1): url = m.group(1)
        elif m.group(2): url = "https://doi.org/" + m.group(2)
        else:
            key = f"ref_{norm(m.group(3))}_{m.group(6)}"
            if key in BIBURL: url = BIBURL[key]
        if not (url or anchor): continue
        if m.start() > pos:
            x = p.add_run(text[pos:m.start()]); x.italic = italic; x.bold = bold
            if size: x.font.size = Pt(size)
        _hyperlink(p, m.group(0), url=url, anchor=anchor, italic=italic, size=size)
        pos = m.end()
    if pos < len(text):
        x = p.add_run(text[pos:]); x.italic = italic; x.bold = bold
        if size: x.font.size = Pt(size)
def runs(p, text, size=None, bold_all=False):
    text = typo(text)
    for part in re.split(r"(\*\*[^*]+\*\*|\*[^*]+\*)", text):
        if not part: continue
        if part.startswith("**"): x = p.add_run(part[2:-2]); x.bold = True
        elif part.startswith("*"): _plain(p, part[1:-1], italic=True, bold=bold_all, size=size); continue
        else: _plain(p, part, bold=bold_all, size=size); continue
        if size: x.font.size = Pt(size)
        if bold_all: x.bold = True
def bookmark(p, name):
    _hl_id[0] += 1
    s = OxmlElement("w:bookmarkStart"); s.set(qn("w:id"), str(_hl_id[0])); s.set(qn("w:name"), name)
    e = OxmlElement("w:bookmarkEnd"); e.set(qn("w:id"), str(_hl_id[0]))
    p._p.insert(1 if p._p.pPr is not None else 0, s); p._p.append(e)
def centre(t, b=False, s=12, space=0):
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before = Pt(space)
    x = p.add_run(typo(t)); x.bold = b; x.font.size = Pt(s)
def page_heading(t):
    d.add_page_break(); h = d.add_heading(typo(t), 1); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
def note(t):
    p = d.add_paragraph(); x = p.add_run(typo(t)); x.italic = True

# ---- numérotation automatique des tableaux et figures
ORDER = ["05_Partie_I.md", "06_Partie_II_a.md", "06_Partie_II_b.md", "07_Partie_III.md", "08_Partie_IV.md", "08b_Discussion.md"]
tabmap, n = {}, 0
for f in ORDER:
    for m in re.finditer(r"\*\*Tableau (\w+) :", open(f, encoding="utf-8").read()):
        n += 1; tabmap.setdefault((f, m.group(1)), n)
def renumber(f, text):
    local = {k[1]: v for k, v in tabmap.items() if k[0] == f}
    allmap = {k[1]: v for k, v in tabmap.items()}
    def one(m):
        if m.group(1):  # titre de tableau
            return f"**Tableau {tabmap[(f, m.group(3))]} :"
        num = m.group(3)
        if not (num.isdigit() or num == 'X'): return m.group(0)
        return f"{m.group(2)} {local.get(num, allmap.get(num, num))}"
    return re.sub(r"(\*\*)?\b([Tt]ableaux?) (\w+)(?(1) :)", one, text)
fig = [0]

def render(lines, f=None):
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if s == "---" or not s: i += 1; continue
        m = re.match(r"^\((IMG|FIG): ?(.*)\)$", s)
        if m:
            fig[0] += 1
            if m.group(1) == "IMG":
                img, leg = IMGS[m.group(2)]
                d.add_picture(img, width=Cm(15)); d.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                leg = m.group(2); p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                x = p.add_run("[Image à insérer]"); x.italic = True
            p = d.add_paragraph(style=cap); p.add_run(typo(f"Figure {fig[0]} : {leg}"))
            i += 1; continue
        if s.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells): rows.append(cells)
                i += 1
            ncol = len(rows[0]); t = d.add_table(rows=len(rows), cols=ncol); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
            for ri, row in enumerate(rows):
                for ci in range(ncol):
                    c = row[ci] if ci < len(row) else ""
                    cell = t.cell(ri, ci); cell.text = ""; p = cell.paragraphs[0]
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after = Pt(0)
                    runs(p, c, size=10, bold_all=(ri == 0))
            d.add_paragraph(); continue
        if s.startswith("# "): page_heading(s[2:])
        elif s.startswith("## "): d.add_heading(typo(s[3:]), 2)
        elif s.startswith("### "): d.add_heading(typo(s[4:]), 3)
        elif s.startswith("> "): note(s[2:].replace("**", ""))
        elif s.startswith("- "): p = d.add_paragraph(style="List Bullet"); runs(p, s[2:])
        elif re.match(r"^\d+\. ", s): p = d.add_paragraph(style="List Number"); runs(p, re.sub(r"^\d+\. ", "", s))
        elif s.startswith("**Tableau"): p = d.add_paragraph(style=cap); runs(p, s.replace("**", ""))
        else: p = d.add_paragraph(); runs(p, s)
        i += 1

def lines_of(f): return renumber(f, open(f, encoding="utf-8").read()).split("\n") if f in ORDER else open(f, encoding="utf-8").read().split("\n")
def section(lines, start, stop=None):
    out, on = [], False
    for l in lines:
        if l.startswith(start): on = True
        elif stop and l.startswith(stop) and on: break
        if on: out.append(l)
    return out

# ---- Page de garde (format du département, d'après les mémoires du Master 2025-2026)
p = d.add_paragraph(); x = p.add_run("N° d'ordre : M........ / 26"); x.font.size = Pt(11)
centre("Université Ibn Tofail", True, 14); centre("Faculté des Sciences – Kénitra", True, 14)
centre("Département des Sciences de la Vie", False, 13)
centre("[logo de l'université]          [logo Waterleau]", space=12)
centre("Master « Ingénierie d'Environnement et Développement Durable »", True, 13, 18)
centre("Mémoire de Fin d'Études", True, 16, 18)
centre("Présenté par", False, 12, 12); centre("[Mlle Prénom NOM]", True, 13)
centre("Sous le thème", False, 12, 18)
centre("Étude intégrée de la filière eau et boues : traitement biologique des eaux usées et valorisation énergétique des boues d'épuration – Cas de la STEP de Kénitra (Waterleau)", True, 16, 6)
centre("Soutenu le [date] devant le jury", False, 12, 24)
for role in ["Pr. [NOM Prénom]     Président(e)", "Pr. [NOM Prénom]     Examinateur(trice)", "Pr. AUAJJAR Nabila     Encadrante", "M./Mme [NOM Prénom] (Waterleau)     Co-encadrant(e)"]:
    centre(role)
centre("2025 / 2026", True, 13, 30)

page_heading("Dédicace"); note("[À rédiger par l'étudiante.]")
page_heading("Remerciements"); note("[À rédiger par l'étudiante : encadrante universitaire, chef de station et encadrant Waterleau, équipe du laboratoire et de l'exploitation, membres du jury, famille.]")
avp = open("03_Avant_propos_Glossaire.md", encoding="utf-8").read().split("\n")
render(section(avp, "# Avant-propos", "# Glossaire"))
concl = open("09_Conclusion_Recommandations.md", encoding="utf-8").read().split("\n")
render(section(concl, "# Résumé", "# Abstract"))
render(section(concl, "# Abstract", "# ملخص"))
ar_start = len(d.paragraphs)
render(section(concl, "# ملخص", "# Liste des abréviations"))
for p in d.paragraphs[ar_start:]:
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pPr = p._p.get_or_add_pPr(); b = OxmlElement("w:bidi"); pPr.append(b)
    for r_ in p.runs:
        rPr = r_._r.get_or_add_rPr(); rtl = OxmlElement("w:rtl"); rPr.append(rtl)
page_heading("Liste des figures"); p = d.add_paragraph(); r = p.add_run(); field(r, ' TOC \\h \\z \\t "Légende mémoire,1" '); r2 = p.add_run("Clic droit > Mettre à jour le champ."); r2.italic = True; field_end(r2)
page_heading("Liste des tableaux"); note("[Les légendes des tableaux et des figures utilisent le style « Légende mémoire » : la liste ci-dessus les regroupe. Pour deux listes séparées, utiliser Références > Insérer une légende.]")
render(section(concl, "# Liste des abréviations", "# Références"))
render(section(avp, "# Glossaire"))
page_heading("Table des matières"); p = d.add_paragraph(); r = p.add_run(); field(r, ' TOC \\o "1-3" \\h \\z \\u '); r2 = p.add_run("Clic droit > Mettre à jour le champ pour générer la table des matières."); r2.italic = True; field_end(r2)
intro = open("04_Sommaire_et_Introduction.md", encoding="utf-8").read().split("\n")
render(section(intro, "# Introduction générale", "**Références citées"))
for f in ORDER: render(lines_of(f), f)
render(section(concl, "# Conclusion générale", "# Résumé"))
page_heading("Références bibliographiques")
LINK_CITES[0] = False
for _e in section(concl, "# Références bibliographiques")[1:]:
    if not _e.strip(): continue
    p = d.add_paragraph(); p.paragraph_format.left_indent = Cm(0.8); p.paragraph_format.first_line_indent = Cm(-0.8)
    runs(p, _e.strip())
    _m = re.match(r"\[?([^ ,.(\]]+)", _e.strip()); _y = re.search(r"\. ((?:19|20)\d\d[ab]?)\.", _e)
    if _m and _y: bookmark(p, f"ref_{norm(_m.group(1))}_{_y.group(1)}")
LINK_CITES[0] = True
page_heading("Annexes"); note("[Annexe 1 : fiches d'analyse du laboratoire. Annexe 2 : relevés SCADA. Annexe 3 : photographies des ouvrages.]")
d.save("10_Memoire_complet.docx")
print("saved; figures:", fig[0], "tables:", len(tabmap))

# ---- baseline pour vérifier, avant chaque mise à jour du Google Doc, que Mimi n'a rien modifié
import json as _json
_n = lambda s: re.sub(r"\s+", " ", s.replace(" ", " ").replace(" ", " ")).strip()
_p = [p.text for p in d.paragraphs] + [c.text for t in d.tables for r in t.rows for c in r.cells]
_json.dump(sorted(set(_n(x) for x in _p if _n(x))), open("_baseline_paras.json", "w", encoding="utf-8"), ensure_ascii=False)
