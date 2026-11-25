"""Bilan énergétique de la STEP de Kénitra à partir des données publiées.
Sources des données d'entrée : Lihi et al. (2023), EEET 24(1):165-174 ;
plages de consommation : Maktabifard et al. (2018) ; rendements CHP : hypothèses usuelles à justifier."""
import json
Q = 53900          # m3/j, capacité hydraulique (Lihi et al., 2023)
Q_moy = 2250*24    # m3/j, débit moyen 2250 m3/h
biogaz = 6700      # Nm3/j
xCH4 = 0.70        # fraction de méthane
PCI_CH4 = 9.97     # kWh/Nm3 (PCI du méthane)
eta_el, eta_th = 0.38, 0.45   # rendements cogénération (hypothèse moteurs à gaz)
conso_specs = [0.30, 0.40, 0.50, 0.60]   # kWh/m3 (plage boues activées)

CH4 = biogaz*xCH4
E_prim = CH4*PCI_CH4
E_el = E_prim*eta_el
E_th = E_prim*eta_th
res = {"Q_moy_m3j":Q_moy, "CH4_Nm3j":CH4, "E_primaire_kWhj":round(E_prim),
       "E_elec_kWhj":round(E_el), "E_therm_kWhj":round(E_th),
       "P_elec_moy_kW":round(E_el/24), "E_elec_MWh_an":round(E_el*365/1000)}
cov = {}
for c in conso_specs:
    besoin = c*Q_moy
    cov[c] = {"besoin_kWhj":round(besoin), "couverture_%":round(100*E_el/besoin,1)}
res["couverture"] = cov
# CO2 évité : électricité réseau marocaine ~0.7 kgCO2/kWh (à vérifier, facteur ONEE/IEA)
EF = 0.70
res["CO2_evite_t_an"] = round(E_el*365*EF/1000)
# Production spécifique
res["kWh_el_par_m3"] = round(E_el/Q_moy,3)
res["L_biogaz_par_EH_j"] = round(biogaz*1000/334000,1)
print(json.dumps(res, indent=1, ensure_ascii=False))

import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.family"]="Times New Roman"
fig, ax = plt.subplots(figsize=(6.3,3.6), dpi=200)
xs=[f"{c:.2f}" for c in conso_specs]; ys=[cov[c]["couverture_%"] for c in conso_specs]
b=ax.bar(xs, ys, color="#3b6e8f", width=0.55)
ax.axhline(100, ls="--", color="#555", lw=1, label="Autosuffisance électrique (100 %)")
ax.axhline(50, ls=":", color="#a33", lw=1.2, label="Couverture annoncée pour la station (> 50 %)")
for r,y in zip(b,ys): ax.text(r.get_x()+r.get_width()/2,y+2,f"{y:.0f} %",ha="center",fontsize=9)
ax.set_xlabel("Consommation électrique spécifique de la station (kWh/m³)")
ax.set_xticks(range(4)); ax.set_xticklabels([x.replace(".",",") for x in xs])
ax.set_ylabel("Taux de couverture électrique (%)")
ax.set_ylim(0,max(ys)+35); ax.legend(loc="upper right", fontsize=8.5, frameon=False); ax.spines[["top","right"]].set_visible(False)
fig.tight_layout(); fig.savefig(r"C:\Users\user\Documents\Mimi\Nov 2026\PFE_draft\figures\fig_couverture_energetique.png")
