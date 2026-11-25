import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
plt.rcParams["font.family"] = "Times New Roman"

# ---------- Figure 3 : schéma général des filières
fig, ax = plt.subplots(figsize=(10, 6.2), dpi=200); ax.axis("off"); ax.set_xlim(0, 20); ax.set_ylim(-0.6, 12.4)
WATER, SLUDGE, GAS, ENERGY = "#dbe9f4", "#f1e3cf", "#d8ecd9", "#f6d8d8"
def box(x, y, w, h, t, c, fs=8.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06", fc=c, ec="#333", lw=0.8))
    ax.text(x + w / 2, y + h / 2, t, ha="center", va="center", fontsize=fs)
def arr(x1, y1, x2, y2, c="#333", ls="-", lw=1.1):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="->", color=c, lw=lw, ls=ls))
def lab(x, y, t, c="#333", ha="center"):
    ax.text(x, y, t, fontsize=7.5, style="italic", color=c, ha=ha, va="center")

ax.text(0.2, 11.9, "FILIÈRE EAU", fontsize=10, weight="bold", color="#2b5d82")
ax.text(0.2, 7.55, "FILIÈRE BOUES", fontsize=10, weight="bold", color="#8a5a1f")
ax.text(0.2, 3.35, "FILIÈRE BIOGAZ ET ÉNERGIE", fontsize=10, weight="bold", color="#2e6b3e")
# water line
xs = [0.3, 3.2, 6.1, 9.0, 11.9, 14.8, 17.6]
names = ["Eaux usées\nbrutes", "Station de\npompage SP3", "Prétraitement\n(dégrillage,\ndessablage-déshuilage)", "Décantation\nprimaire", "Bassins d'aération\n(boues activées)", "Dégazage et\nclarification", "Rejet de\nl'eau traitée"]
for i, (x, n) in enumerate(zip(xs, names)):
    box(x, 9.6, 2.3, 1.7, n, WATER)
    if i: arr(xs[i - 1] + 2.3, 10.45, x, 10.45)
# recirculation
ax.annotate("", xy=(12.8, 9.6), xytext=(15.4, 9.6), arrowprops=dict(arrowstyle="->", color="#2b5d82", lw=1, connectionstyle="arc3,rad=-0.5"))
lab(14.1, 8.55, "recirculation des boues", "#2b5d82")
# sludge line
box(6.0, 5.7, 2.6, 1.4, "Épaississement\ngravitaire", SLUDGE)
box(14.3, 5.7, 2.6, 1.4, "Flottation\n(FAD)", SLUDGE)
box(10.0, 5.7, 3.0, 1.4, "Fosse à boues\nnon digérées", SLUDGE)
box(10.0, 3.9, 3.0, 1.3, "Digesteurs D1 et D2\n(2 × 4 613 m³, 37 °C)", SLUDGE, 8)
box(5.6, 3.9, 3.0, 1.3, "Fosse à boues digérées\npuis déshydratation", SLUDGE, 8)
box(1.2, 3.9, 3.0, 1.3, "Boues déshydratées\n(destination)", SLUDGE, 8)
arr(10.15, 9.6, 7.3, 7.1); lab(9.7, 8.95, "boues primaires", "#8a5a1f", ha="left")
arr(15.95, 9.6, 15.6, 7.1); lab(16.6, 8.1, "boues biologiques\nen excès", "#8a5a1f")
arr(8.6, 6.4, 10.0, 6.4); arr(14.3, 6.4, 13.0, 6.4)
arr(11.5, 5.7, 11.5, 5.2); arr(10.0, 4.55, 8.6, 4.55); arr(5.6, 4.55, 4.2, 4.55)
arr(7.0, 9.6, 10.4, 7.1, c="#8a5a1f", ls="--", lw=0.8); lab(7.75, 8.55, "graisses", "#8a5a1f", ha="right")
# biogas line
box(10.0, 1.2, 3.0, 1.2, "Désulfuration\net séchage", GAS)
box(14.0, 1.2, 2.4, 1.2, "Gazomètre", GAS)
box(17.2, 1.9, 2.5, 1.2, "Cogénération\n(électricité + chaleur)", ENERGY, 8)
box(17.2, 0.25, 2.5, 1.0, "Torchère\n(excédent)", GAS, 8)
box(5.6, 1.2, 3.0, 1.2, "Chaudières", ENERGY)
arr(11.5, 3.9, 11.5, 2.4); lab(12.6, 3.2, "biogaz ≈ 6 700 Nm³/j", "#2e6b3e")
arr(13.0, 1.8, 14.0, 1.8); arr(16.4, 2.0, 17.2, 2.4); arr(16.4, 1.5, 17.2, 0.8)
ax.annotate("", xy=(7.1, 1.2), xytext=(15.2, 1.2), arrowprops=dict(arrowstyle="->", color="#2e6b3e", lw=0.8, ls="--", connectionstyle="arc3,rad=-0.25"))
lab(11.5, -0.2, "biogaz vers les chaudières", "#2e6b3e")
# energy back to water line and digesters
ax.annotate("", xy=(13.05, 9.6), xytext=(18.45, 3.1), arrowprops=dict(arrowstyle="->", color="#b03a2e", lw=1.4, connectionstyle="arc3,rad=0.25"))
lab(18.2, 6.6, "électricité vers\nl'aération et\nles équipements", "#b03a2e")
ax.annotate("", xy=(13.0, 4.3), xytext=(17.2, 2.6), arrowprops=dict(arrowstyle="->", color="#b03a2e", lw=1.1, ls="--"))
arr(7.1, 2.4, 10.0, 4.0, c="#b03a2e", ls="--", lw=0.9); lab(7.9, 3.35, "chaleur vers\nles digesteurs", "#b03a2e", ha="right")
fig.tight_layout(); fig.savefig("figures/fig_schema_station.png")

print("ok")
