import re, sys
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
src, out = sys.argv[1], sys.argv[2]
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
def runs(p,text):
    for part in re.split(r"(\*\*[^*]+\*\*|\*[^*]+\*)",text):
        if not part: continue
        if part.startswith("**"): p.add_run(part[2:-2]).bold=True
        elif part.startswith("*"): p.add_run(part[1:-1]).italic=True
        else: p.add_run(part)
first=True
for line in open(src,encoding="utf-8").read().splitlines():
    if line.strip()=="---": d.add_page_break(); continue
    if not line.strip(): continue
    if line.startswith("# "):
        d.add_heading(line[2:],1)
    elif line.startswith("## "): d.add_heading(line[3:],2)
    elif line.startswith("- "): p=d.add_paragraph(style="List Bullet"); runs(p,line[2:])
    else:
        ind=len(line)-len(line.lstrip(" ")); p=d.add_paragraph(); runs(p,line.strip())
        if ind: p.paragraph_format.left_indent=Cm(1)
d.save(out); print("saved",out)
