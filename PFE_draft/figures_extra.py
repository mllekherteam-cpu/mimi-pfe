import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
FR=FuncFormatter(lambda v,p: f"{v:g}".replace(".",","))
from matplotlib.patches import FancyBboxPatch
plt.rcParams["font.family"]="Times New Roman"
# Fig: 4 étapes de la digestion anaérobie
fig,ax=plt.subplots(figsize=(7.2,4.6),dpi=200); ax.axis("off"); ax.set_xlim(0,10); ax.set_ylim(-0.4,10)
def box(x,y,w,h,t,c): 
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle="round,pad=0.08",fc=c,ec="#333",lw=0.8)); ax.text(x+w/2,y+h/2,t,ha="center",va="center",fontsize=9)
def arr(x1,y1,x2,y2,t=None,side=0):
    ax.annotate("",xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle="->",lw=1,color="#333"))
    if t: ax.text((x1+x2)/2+side,(y1+y2)/2,t,fontsize=8,style="italic",ha="left" if side>=0 else "right",va="center",color="#444")
box(2.5,8.6,5,1,"Matière organique complexe\n(protéines, lipides, polysaccharides)","#e8eef3")
box(2.5,6.4,5,1,"Monomères\n(acides aminés, acides gras, sucres)","#e8eef3")
box(2.5,4.2,5,1,"Acides gras volatils, alcools","#e8eef3")
box(0.3,2.0,4,1,"Acétate","#e8eef3"); box(5.7,2.0,4,1,"H₂ + CO₂","#e8eef3")
box(2.5,0.0,5,1,"Biogaz : CH₄ + CO₂","#cfe3d4")
arr(5,8.6,5,7.4,"1. Hydrolyse (bactéries hydrolytiques)",0.15)
arr(5,6.4,5,5.2,"2. Acidogenèse (bactéries acidogènes)",0.15)
arr(4.2,4.2,2.5,3.0); arr(5.8,4.2,7.5,3.0)
ax.text(5,3.55,"3. Acétogenèse (bactéries acétogènes)",fontsize=8,style="italic",color="#444",ha="center")
arr(2.3,2.0,3.6,1.0); arr(7.7,2.0,6.4,1.0)
ax.text(0.3,1.45,"4. Méthanogenèse acétoclaste\n(≈ 70 % du CH₄)",fontsize=8,style="italic",color="#444",va="center")
ax.text(9.7,1.45,"4. Méthanogenèse\nhydrogénotrophe",fontsize=8,style="italic",color="#444",va="center",ha="right")
fig.tight_layout(); fig.savefig("figures/fig_etapes_digestion.png")
# Fig: stabilité des digesteurs (médianes Lihi et al., 2023)
P=[("pH",7.82,7.93,(6.5,8.5),"–"),("Température",36.70,37.10,(35,38),"°C"),("TAC",3.52,3.58,(2,None),"g/L"),("AGV",0.47,0.52,(None,0.5),"g/L"),("AGV/TAC",0.47/3.52,0.52/3.58,(None,0.3),"–")]
fig,axs=plt.subplots(1,5,figsize=(8.6,3.2),dpi=200)
for a,(n,d1,d2,(lo,hi),u) in zip(axs,P):
    a.bar(["D1","D2"],[d1,d2],color=["#3b6e8f","#7ea6c0"],width=0.6)
    top=max(d1,d2,hi or 0)*1.25; bot=0
    if n=="pH": bot=6; top=9
    if n=="Température": bot=33; top=39
    a.set_ylim(bot,top)
    if lo is not None and hi is not None: a.axhspan(lo,hi,color="#cfe3d4",alpha=0.5,zorder=0)
    elif lo is not None: a.axhspan(lo,top,color="#cfe3d4",alpha=0.5,zorder=0)
    else: a.axhspan(bot,hi,color="#cfe3d4",alpha=0.5,zorder=0)
    for i,v in enumerate([d1,d2]): a.text(i,v+(top-bot)*0.02,f"{v:.2f}".replace(".",","),ha="center",fontsize=8)
    a.set_title(f"{n} ({u})" if u!="–" else n,fontsize=9); a.tick_params(labelsize=8); a.yaxis.set_major_formatter(FR); a.spines[["top","right"]].set_visible(False)
fig.text(0.5,0.01,"Zone verte : domaine de fonctionnement recommandé",ha="center",fontsize=8,color="#2e6b3e")
fig.tight_layout(rect=(0,0.05,1,1)); fig.savefig("figures/fig_stabilite_digesteurs.png")
print("ok")
