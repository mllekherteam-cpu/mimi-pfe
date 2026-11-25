from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
d=Document(); sec=d.sections[0]; sec.page_height=Cm(29.7); sec.page_width=Cm(21)
for m in ("left_margin","right_margin","top_margin","bottom_margin"): setattr(sec,m,Cm(2.5))
st=d.styles["Normal"]; st.font.name="Times New Roman"; st.font.size=Pt(12)
st.element.rPr.rFonts.set(qn("w:eastAsia"),"Times New Roman")
st.paragraph_format.line_spacing=1.0; st.paragraph_format.space_after=Pt(6); st.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
for i,sz in ((1,16),(2,14),(3,12)):
    h=d.styles[f"Heading {i}"]; h.font.name="Times New Roman"; h.font.size=Pt(sz); h.font.bold=True; h.font.color.rgb=None
    h.element.rPr.rFonts.set(qn("w:ascii"),"Times New Roman"); h.element.rPr.rFonts.set(qn("w:hAnsi"),"Times New Roman")
p=sec.footer.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run()
for t,txt in (("begin",None),(None," PAGE "),("end",None)):
    if t: e=OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"),t)
    else: e=OxmlElement("w:instrText"); e.set(qn("xml:space"),"preserve"); e.text=txt
    r._r.append(e)
def c(t,b=False,s=12):
    p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; x=p.add_run(t); x.bold=b; x.font.size=Pt(s)
c("Université Ibn Tofail\nFaculté des Sciences – Kénitra",True,14); c("[logo de l'université]  [logo Waterleau]")
c("\nMémoire de fin d'études\nen vue de l'obtention du Master Ingénierie de l'Environnement et Développement Durable",False,13)
c("\nÉtude intégrée de la filière eau et boues : traitement biologique des eaux usées et valorisation énergétique des boues d'épuration",True,16)
c("\nCas de la station d'épuration de Kénitra (Waterleau)",False,13)
c("\nRéalisé par : [Prénom NOM]\nEncadré par : [Pr. …] (Faculté des Sciences) et [M./Mme …] (Waterleau, STEP de Kénitra)\n\nSoutenu le [date] devant le jury :\n[Pr. …], Président\n[Pr. …], Examinateur\n[Pr. …], Encadrant\n\nAnnée universitaire 2025-2026")
def page(title, note=None):
    d.add_page_break(); d.add_heading(title,1)
    if note: p=d.add_paragraph(); x=p.add_run(note); x.italic=True
for t,n in [("Dédicaces","[À écrire toi-même.]"),("Remerciements","[À écrire toi-même : encadrant(e)s, chef de station et équipe Waterleau (laboratoire, exploitation), jury.]"),
            ("Résumé","[½ page. Contexte, objectif, méthode, résultats chiffrés, conclusion.]\n\nMots-clés : STEP de Kénitra ; boues activées ; digestion anaérobie ; biogaz ; cogénération ; bilan énergétique."),
            ("Abstract","[½ page, English.]\n\nKeywords: Kenitra WWTP; activated sludge; anaerobic digestion; biogas; cogeneration; energy balance."),
            ("ملخص","[نصف صفحة بالعربية]\n\nالكلمات المفتاحية: محطة معالجة المياه العادمة بالقنيطرة؛ الحمأة المنشطة؛ الهضم اللاهوائي؛ الغاز الحيوي؛ التوليد المشترك"),
            ("Liste des figures",None),("Liste des tableaux",None),("Liste des abréviations",None),("Table des matières","[Références > Table des matières, à la fin.]"),
            ("Introduction générale",None)]:
    page(t,n)
for h in ["Contexte et importance du traitement des eaux usées","Problématique","Hypothèses de recherche","Objectifs du travail","Méthodologie générale","Organisation du mémoire"]: d.add_heading(h,2)
plan=[("Partie I : Généralités sur la Station d'Épuration de Kénitra – Waterleau",
       [("I. L'organisme d'accueil : Waterleau",[]),("II. La STEP de Kénitra : historique, situation et fiche technique",[]),
        ("III. Le parcours de l'eau",["Station de pompage SP3 et prétraitement","Décantation primaire","Traitement biologique et aération","Dégazage, clarification et rejet"]),
        ("IV. Le parcours des boues",["Épaississement et flottation","Digestion anaérobie","Déshydratation et destination des boues"]),
        ("V. La chaîne de valorisation du biogaz",["Désulfuration et séchage","Gazomètre, cogénération et torchère"]),
        ("VI. Les postes consommateurs d'énergie de la station",[])]),
      ("Partie II : Synthèse bibliographique",
       [("I. Les eaux usées urbaines et la réglementation marocaine",[]),("II. Le traitement biologique des eaux usées",[]),("III. Les boues d'épuration",[]),("IV. La valorisation énergétique des boues",[]),("V. L'autosuffisance énergétique des stations d'épuration",[])]),
      ("Partie III : Matériels et méthodes",
       [("I. Matériels expérimentaux",[]),("II. Système de suivi industriel (SCADA)",[]),("III. Échantillonnage",[]),("IV. Analyses de l'eau (pH, MES, DBO5, DCO, N, P)",[]),("V. Analyses des boues (siccité NF EN 12880, MV NF EN 12879, pH NF EN 12176, TAC, AGV)",[]),("VI. Production de biogaz",[]),("VII. Bilan énergétique et taux d'autoproduction",[])]),
      ("Partie IV : Résultats et discussion",
       [("I. Performance de la filière eau",[]),("II. Stabilité de la digestion anaérobie",[]),("III. Production de biogaz",[]),("IV. Bilan énergétique de la station",[]),("V. Discussion générale",[])])]
for P,chs in plan:
    page(P)
    for ch,subs in chs:
        d.add_heading(ch,2)
        for sb in subs: d.add_heading(sb,3)
        if ch.startswith("IV. Bilan"):
            d.add_picture("figures/fig_couverture_energetique.png",width=Cm(15)); d.paragraphs[-1].alignment=WD_ALIGN_PARAGRAPH.CENTER
            p=d.add_paragraph("Figure X : Taux de couverture des besoins électriques de la station par la cogénération du biogaz, selon sa consommation spécifique (calcul personnel à partir des données de Lihi et al., 2023)."); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.runs[0].italic=True
page("Conclusion générale"); d.add_heading("Bilan",2); d.add_heading("Perspectives",2)
page("Recommandations")
page("Références bibliographiques","[Format NF Z 44-005, ordre alphabétique : voir 02_Kit_de_redaction.md]")
page("Annexes")
d.save("03_Memoire_modele.docx"); print("saved")
