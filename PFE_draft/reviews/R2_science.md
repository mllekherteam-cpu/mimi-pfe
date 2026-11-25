# R2 : relecture scientifique (rapporteur, génie des eaux usées)

Périmètre : Introduction générale (04, l. 80-138), Parties I à IV, Discussion, Conclusion, Résumé/Abstract/ملخص, `bilan_energetique.py`. Aucun fichier de la thèse n'a été modifié.

## 0. Recalcul des chiffres (tous vérifiés)

| Grandeur | Texte | Recalcul | Verdict |
|---|---|---|---|
| CH₄ nominal = 6 700 × 0,70 | 4 690 Nm³/j | 4 690 | OK |
| E primaire = 4 690 × 9,97 | 46 760 kWh/j | 46 759 | OK |
| E él. (38 %) | 17 770 kWh/j ; 740 kW ; 6 490 MWh/an | 17 769 ; 740,4 ; 6 486 | OK |
| E th. (45 %) | 21 040 kWh/j | 21 042 | OK |
| kWh él./m³ (54 000 m³/j) | 0,33 | 0,329 | OK |
| Couverture 0,30/0,40/0,50/0,60 kWh/m³ | 110/82/66/55 % | 109,7/82,3/65,8/54,8 | OK |
| E primaire à 65 % CH₄ | 43 420 kWh/j | 43 419 | OK |
| Biogaz juin 2021 = 4 864/0,70 | ≈ 6 950 | 6 949 | OK (valeur calculée, pas mesurée : voir n° 5) |
| Écart 4 864 / 4 690 | ≈ 4 % | 3,7 % | OK |
| CH₄ 2025 = 5 737 × 0,65-0,70 | 3 730-4 020 | 3 729-4 016 | OK |
| Écart 5 737 / 6 700 | −14 % | −14,4 % | OK |
| Productivité volumique 6 700/9 226 | 0,73 | 0,726 | OK |
| L biogaz/EH/j | 20 | 20,1 | OK |
| Couverture réelle 9 302 / (16 200-32 400) | 29-57 % | 28,7-57,4 | OK |
| Consommation 9 302/0,659 | 14 100 kWh/j | 14 115 | OK |
| Csp = 14 115/54 000 | 0,26 kWh/m³ | 0,261 | OK |
| Plafond à 14 115 kWh/j | 126 % | 125,9 | OK |
| kWh/Nm³ biogaz 2025 | 1,6 | 1,62 | OK |
| η él. apparent | 23-25 % | 23,2-25,0 | OK |
| CO₂ évité 2025 (0,62 / 0,57 / 0,72) | 2 100 / 1 900 / 2 400 t | 2 105 / 1 935 / 2 445 | OK |
| CO₂ évité au potentiel (0,62) | 4 000 t | 4 021 | OK |
| CO₂ évité H3 (IV l. 203, 0,7) | 2 400 t | 2 377 | calcul juste, mais **facteur incohérent** (n° 1) |
| DCO convertie = 4 690/0,35 | 13 400 kg/j | 13 400 | OK |
| MV/MS D1 / D2 | 72,9 / 71,4 % | 72,93 / 71,41 | OK |
| AGV/TAC D1 / D2 (médianes) | 0,13 / 0,15 | 0,134 / 0,145 | OK |
| Rendement DBO5 (300→24) ; 120/24 | 92 % ; 5× | 92 % ; 5,0 | OK |
| TAC = V×0,1×50/25 ; AGV = V×0,1×60/25 | V×0,2 ; V×0,24 | idem | OK |
| `bilan_energetique.py` | EF = 0,70 | donne 4 540 t/an au potentiel | **incohérent avec 0,62** (n° 1) |

Numérotation après `assemble.py` : tableaux 1-2 (I), 3-4 (II_a, sources « 4, 5 »), 5-6 (II_b, sources « X, 7 »), 7-8 (III), 9-17 (IV), 18 (Discussion) ; figures 1-3 (I), 4 (II_b), 5 (FIG MES/DBO/DCO), 6 (stabilité), 7 (couverture). Tous les renvois « tableau N » / « figure N » du texte tombent juste après renumérotation. Voir n° 20 pour les fragilités.

---

## Critique

### 1. Facteur d'émission et CO₂ évité contradictoires dans la vérification de H3
- **Fichiers** : `08_Partie_IV.md:203` ; `bilan_energetique.py:25-27` (contre `07_Partie_III.md:190`, `08_Partie_IV.md:199`, `08b_Discussion.md:25`, `09_Conclusion_Recommandations.md:11`).
- **Problème** : la Partie III fixe FE = 0,62 kg CO₂/kWh (FNH, 2025) et le § IV.4 calcule 2 100 t/an ; la phrase de conclusion de H3, trois lignes plus bas, annonce « de l'ordre de 2 400 t … avec un facteur d'émission provisoire de 0,7 ». Le script utilise aussi 0,70 (et donnerait 4 540 t/an au potentiel au lieu de 4 000). Un jury verra deux chiffres pour la même grandeur dans le paragraphe qui conclut l'hypothèse.
- **Remplacement (IV:203, phrase centrale)** : « Sur la base des données d'exploitation de l'été 2025, l'hypothèse H3 est confirmée pour cette période : la cogénération a couvert environ les deux tiers des besoins en électricité de la station et a évité environ 2 100 t de CO₂ par an (facteur d'émission de 0,62 kg CO₂/kWh ; 1 900 à 2 400 t selon le facteur retenu). »
- **Script** : remplacer `EF = 0.70` par `EF = 0.62  # FNH (2025), intensité carbone 2024` et le commentaire de la ligne 25 en conséquence.

## Majeur

### 2. Critère « temps de séjour des solides supérieur au temps de séjour hydraulique » faux pour un digesteur de boues
- **Fichiers** : `06_Partie_II_b.md:178` et `06_Partie_II_b.md:193` (Tableau 7).
- **Problème** : un digesteur de boues infiniment mélangé sans recirculation (cas de Kénitra) a un TSS **égal** au TSH. La condition de stabilité porte sur un TSS (= TSH) nettement supérieur au temps de doublement des méthanogènes, soit en pratique 15 à 20 j en mésophile (minimum de l'ordre de 10 j). Écrit ainsi, le critère est impossible à satisfaire et un examinateur le relèvera.
- **Remplacement (l. 178, première phrase)** : « Le temps de séjour hydraulique est le rapport entre le volume du digesteur et le débit de boues qui l'alimente. Dans un digesteur infiniment mélangé sans recirculation, comme ceux de Kénitra, le temps de séjour des solides lui est égal ; il doit rester nettement supérieur au temps de doublement des méthanogènes, à croissance lente, ce qui conduit à retenir en pratique 15 à 20 jours en régime mésophile, et jamais moins d'une dizaine de jours [référence à ajouter, par exemple Metcalf & Eddy]. »
- **Remplacement (Tableau 7, ligne)** : « | Temps de séjour (TSH = TSS en digesteur infiniment mélangé) | 15 à 20 j (minimum ≈ 10 j) | »

### 3. AGV de D2 : un dépassement de la médiane n'est pas « ponctuel »
- **Fichiers** : `08_Partie_IV.md:102`, `:104`, `:106` ; `09_Conclusion_Recommandations.md:9`.
- **Problème** : la médiane d'AGV de D2 (0,52 g/L) dépasse le seuil de 0,5 g/L du Tableau 7 : le seuil est donc dépassé dans au moins la moitié des prélèvements de D2. Les parler de « dépassements ponctuels » (l. 106 et Conclusion) contredit le Tableau 14 et la Discussion (l. 24, « sauf AGV de D2 »). La confirmation de H2 pour 2025 repose de plus sur la seule conclusion qualitative de [NOM] (2025), sans aucune valeur.
- **Remplacement (IV:106, 1re phrase)** : « Le pH, la température, le TAC et le rapport AGV/TAC se situent dans les domaines de fonctionnement recommandés. Les AGV font exception : leur médiane atteint le seuil de 0,5 g/L dans le digesteur D1 (0,47 g/L) et le dépasse dans le digesteur D2 (0,52 g/L), ce qui signifie que ce seuil est franchi dans environ la moitié des prélèvements de D2 ; ces teneurs restent absorbées par une alcalinité élevée. S'y ajoute un pic de pH isolé (8,56 dans le digesteur D1 au début du mois de mai), attribué à un surdosage de soude. »
- **Remplacement (IV:106, fin)** : « … l'hypothèse H2 est confirmée pour mai et juin 2021 ; pour l'été 2025, elle n'est étayée que par la conclusion qualitative de [NOM] (2025) [reporter ici les valeurs de pH, d'AGV et de TAC de 2025 si elles sont disponibles]. »
- **Remplacement (Conclusion l. 9)** : « … et le rapport AGV/TAC, de l'ordre de 0,13 à 0,15 en valeurs médianes, est resté bien inférieur au seuil de 0,3, alors même que les AGV ont avoisiné ou dépassé le seuil de 0,5 g/L, en particulier dans le digesteur D2. »

### 4. H1 déclarée « confirmée » sur une seule moyenne bibliographique
- **Fichiers** : `08_Partie_IV.md:45` ; `08b_Discussion.md:23` ; `09_Conclusion_Recommandations.md:9`.
- **Problème** : H1 porte sur trois paramètres et sur le critère de 10 échantillons sur 12. Une moyenne de DBO5 publiée (Nizar et al., 2022, qui est d'ailleurs un article de modélisation de l'estuaire) ne vérifie ni la DCO, ni les MES, ni le critère de fréquence. « Les résultats ont permis de vérifier les trois hypothèses » est donc une surinterprétation.
- **Remplacement (IV:45)** : « **Vérification de l'hypothèse H1.** Les données publiées (Nizar et al., 2022) indiquent une DBO5 moyenne de 24 mg/L en sortie, nettement inférieure à la valeur limite de 120 mg O₂/L (Maroc, 2006). Elles étayent H1 pour la DBO5 sans permettre de la vérifier, puisqu'elles ne portent ni sur la DCO, ni sur les MES, ni sur le critère de dix échantillons conformes sur douze. »
- **Remplacement (Discussion, Tableau 19, colonne Conclusion de H1)** : « Étayée pour la DBO5 ; non vérifiée pour la DCO et les MES »
- **Remplacement (Conclusion l. 9, 1re phrase)** : « Les résultats permettent de confirmer H2 et H3 pour les périodes étudiées, et d'étayer H1 pour la DBO5. » Remplacer aussi « H1 est ainsi confirmée pour la DBO5 » par « H1 est ainsi étayée pour la DBO5 ».

### 5. Biogaz de juin 2021 (≈ 6 950 Nm³/j) présenté comme une mesure dans la Conclusion et les résumés
- **Fichiers** : `09_Conclusion_Recommandations.md:9`, `:60`, `:70`, `:80`.
- **Problème** : 6 950 Nm³/j n'est pas mesuré. Il est recalculé à partir du CH₄ mesuré (4 864 Nm³/j) en supposant 70 % de CH₄ (Tableau 15). Le résumé l'affiche comme une borne de production observée.
- **Remplacement (Résumé l. 60)** : « La production de biogaz a été de 5 737 Nm³/j en moyenne à l'été 2025, contre environ 6 950 Nm³/j en juin 2021 (valeur déduite des 4 864 Nm³/j de méthane mesurés, à 70 % de CH₄). Si tout le biogaz était valorisé en cogénération, il couvrirait de 55 à 110 % des besoins électriques pour une consommation spécifique de 0,3 à 0,6 kWh/m³ ; le taux d'autoproduction mesuré a atteint 65,9 % en moyenne à l'été 2025. »
- **Abstract (l. 70)** : « Biogas production averaged 5,737 Nm³/d in summer 2025, compared with about 6,950 Nm³/d in June 2021 (derived from the 4,864 Nm³/d of methane measured, assuming 70% CH₄). … the electricity self-production rate averaged 65.9% in summer 2025. »
- **ملخص (l. 80)** : après « (يونيو 2021) » ajouter « (قيمة محسوبة انطلاقًا من 4864 مترًا مكعبًا عاديًّا من الميثان بافتراض نسبة 70 في المائة) » ; remplacer « 55 و110 في المائة من حاجيات المحطة » par « 55 و110 في المائة من حاجيات المحطة حسب استهلاكها النوعي (0,3 إلى 0,6 كيلوواط ساعة للمتر المكعب) » ; après « 65,9 في المائة » ajouter « في صيف 2025 ».
- **Conclusion l. 9** : remplacer « à environ 6 950 Nm³/j en juin 2021 » par « à environ 6 950 Nm³/j en juin 2021 (valeur déduite du méthane mesuré) ».

### 6. Consommation spécifique de 0,26 kWh/m³ : « fourchette basse » inexacte et indicateur circulaire
- **Fichiers** : `08b_Discussion.md:13` ; `08_Partie_IV.md:187`.
- **Problème** : 0,26 kWh/m³ est **en dessous** de la plage de 0,33-0,41 kWh/m³ et même sous la valeur de la très grande station de 378 500 m³/j (0,272). Ce n'est pas la « fourchette basse ». De plus, cette valeur est déduite (9 302 / 0,659 / débit nominal) et non mesurée. La présenter comme un indicateur « favorable » est circulaire, et elle gonfle mécaniquement le taux d'autoproduction (dénominateur faible). En IV:187, « plausible pour une station de cette taille » est suivi de références qui la contredisent.
- **Remplacement (Discussion l. 13, 2e phrase)** : « Sa consommation spécifique apparente, d'environ 0,26 kWh/m³, est inférieure à celle des grandes stations recensées par Gallo et al. (2024), 0,33 à 0,41 kWh/m³ au-delà de 5 000 m³/j et 0,272 kWh/m³ pour une station de 378 500 m³/j. Comme elle est déduite du taux d'autoproduction et du débit nominal, et non mesurée, elle signale plus probablement un débit réellement traité inférieur au débit nominal qu'une sobriété exceptionnelle ; tant que ce point n'est pas vérifié, le taux d'autoproduction de 66 % doit être lu avec la même prudence, puisqu'il dépend directement de cette consommation. »
- **Remplacement (IV:187, 2e phrase)** : « Cette valeur est inférieure à la plage habituelle des stations à boues activées, et même à celle des plus grandes stations (0,33 à 0,41 kWh/m³ au-delà de 5 000 m³/j ; 0,272 kWh/m³ pour une station de 378 500 m³/j ; Gallo et al., 2024). »

### 7. Le rendement apparent de 23-25 % ne s'explique pas par les chaudières en été
- **Fichiers** : `08_Partie_IV.md:185` ; `08b_Discussion.md:29` ; `09_Conclusion_Recommandations.md:11`.
- **Problème** : pour produire 9 302 kWh/j à η = 38 %, il faut 2 455 Nm³/j de CH₄, soit 3 500 à 3 780 Nm³/j de biogaz (61 à 66 % des 5 737 Nm³/j). Ces moteurs restituent alors environ 11 000 kWh/j de chaleur, ce qui couvre normalement en été le chauffage de boues déjà tièdes et les pertes des digesteurs. Les 34 à 39 % de biogaz non convertis s'expliquent donc plus vraisemblablement par la torchère, des arrêts de moteur ou un fonctionnement à charge partielle que par les chaudières. Le jury demandera ce bilan thermique.
- **Remplacement (IV:185, 2e et 3e phrases)** : « L'écart ne traduit pas nécessairement une mauvaise performance des moteurs. À 38 % de rendement, la production de 9 302 kWh/j ne mobilise que 3 500 à 3 780 Nm³/j de biogaz, soit 61 à 66 % de la production ; ces moteurs restituent alors environ 11 000 kWh/j de chaleur, a priori suffisants en été pour maintenir les digesteurs à 37 °C. Le tiers restant du biogaz a donc plus probablement été brûlé en torchère, ou valorisé lors d'arrêts ou de fonctionnements à charge partielle des moteurs, que consommé par les chaudières. Seule la répartition mesurée du biogaz entre moteurs, chaudières et torchère permettra de le confirmer. »

### 8. Marge de progrès principale : la Discussion et la Conclusion se contredisent
- **Fichiers** : `08b_Discussion.md:13` (« c'est là que se trouve la principale marge de progrès », c'est-à-dire la conversion du gisement par la digestion) contre `09_Conclusion_Recommandations.md:11` (« … dans la répartition du biogaz et la conduite des moteurs, plus que dans la production de biogaz elle-même ») ; `08_Partie_IV.md:74` (digestion « incomplète »).
- **Remplacement (Conclusion l. 11, dernière phrase)** : « Le rendement électrique apparent de 23 à 25 %, inférieur à celui d'un moteur moderne, montre qu'une part importante du biogaz produit, de l'ordre du tiers, n'est pas convertie en électricité. La station dispose ainsi de deux marges de progrès complémentaires : à court terme, la répartition du biogaz et la disponibilité des moteurs ; à plus long terme, la conversion de la matière organique des boues, dont la biodégradabilité de 52 % et le rapport MV/MS élevé des boues digérées indiquent qu'elle reste incomplète. »
- **Remplacement (Discussion l. 13, dernière phrase)** : « … indiquent qu'une part importante de ce gisement n'est pas encore convertie : c'est, avec la répartition du biogaz entre moteurs, chaudières et torchère (Partie IV, § V.3), l'une des deux principales marges de progrès de la station. »

### 9. Recommandation photovoltaïque « comme prévu dans le projet initial » sans source
- **Fichier** : `09_Conclusion_Recommandations.md:47`.
- **Problème** : aucun passage du mémoire ni aucune référence ne mentionne un projet photovoltaïque à Kénitra.
- **Remplacement** : « - Étudier un complément de production photovoltaïque sur les emprises disponibles de la station (Mainardis et Kegl, 2026). » (ou citer la source du « projet initial »).

## Mineur

### 10. Méthode AGV mal attribuée
`07_Partie_III.md:122` : la séquence décrite (acidification à pH 3,5, ébullition de 3 min, titrage à la soude de pH 4 à 7) est la méthode de DiLallo et Albertson (1961), pas le titrage de Nordmann (FOS/TAC à deux points, pH 5,0 et 4,4). Remplacement : « Cette méthode est celle de DiLallo et Albertson (1961) ; elle diffère du titrage de Nordmann (FOS/TAC), dont les limites et les corrections ont été discutées par Liu et al. (2021). » (ajouter la référence DiLallo R., Albertson O.E. 1961, *J. Water Pollut. Control Fed.*, 33(4), 356-365.) Le point final du TAC à pH 4 (l. 121) diffère aussi du point usuel de 4,3-4,5 : à préciser.

### 11. Rendement global de cogénération retenu hors de la plage citée
`06_Partie_II_b.md:230` annonce un rendement global de 70 à 80 %, alors que les hypothèses (38 + 45) donnent 83 %. Remplacement : « Le rendement global atteint ainsi 70 à 85 % (Lima et al., 2023) » si la source le permet ; sinon, ajouter en `07_Partie_III.md:170` : « soit un rendement global de 83 %, en limite haute des valeurs usuelles. »

### 12. Justification du PCI du méthane
`07_Partie_III.md:156` : la cohérence avec « 16 à 28 MJ/m³ de biogaz » ne justifie pas le PCI du CH₄ pur. Remplacement : « … pris égal à 9,97 kWh/Nm³, soit environ 35,9 MJ/Nm³, valeur usuelle du pouvoir calorifique inférieur du méthane pur aux conditions normales (0 °C ; 101,325 kPa). »

### 13. Comparaison de potentiels méthanogènes : unités non homogènes
`08_Partie_IV.md:131` compare 610 NmL **de biogaz**/g MV (Lihi et al., 2023b) à 0,296 Nm³ **de méthane**/kg MV (Calabrò et al., 2025). Remplacement de la dernière phrase : « À titre de comparaison, une revue bibliographique récente donne un rendement moyen de 0,296 Nm³ de méthane par kg de MV pour des boues mixtes (Calabrò et al., 2025), soit, à 65-70 % de CH₄, environ 0,42 à 0,46 Nm³ de biogaz par kg de MV. » Vérifier aussi que le substrat de Lihi et al. (2023b) est bien de la boue « du digesteur » : 610 NmL/g MV est très élevé pour une boue déjà digérée.

### 14. MS des boues en digestion utilisée pour juger l'épaississement
`08_Partie_IV.md:60` : 41-46 g/L est la concentration **dans** les digesteurs, pas celle de l'alimentation. Remplacement : « … à Kénitra, les boues présentes dans les digesteurs ont une matière sèche de 41 à 46 g/L (Lihi et al., 2023a), ce qui suppose une alimentation plus concentrée, puisque la digestion détruit une partie des matières volatiles. »

### 15. Seuil AGV/TAC : source différente entre l'Introduction et la Partie II
`04_Sommaire_et_Introduction.md:105` attribue le seuil de 0,3 à Lihi et al. (2023a), alors que `06_Partie_II_b.md:174` le tire de Pilarski et Pilarska (2025). Remplacement de la fin de H2 : « … et un rapport AGV/TAC inférieur à 0,3 (Lihi et al., 2023a ; Pilarski et Pilarska, 2025). » Les critères de H2 (pH, T, AGV/TAC) diffèrent aussi de ceux du Tableau 19 (pH, T, TAC, AGV/TAC) : aligner en ajoutant « une alcalinité supérieure à 2 g/L éq. CaCO₃ » dans H2, ou en retirant TAC du Tableau 19.

### 16. Part de l'aération : trois fourchettes
`05_Partie_I.md:127` (50 à 60 %), `06_Partie_II_a.md:177` (50 à 70 %), Introduction l. 86 (« plus de la moitié »). Remplacement en I:127 : « (de 50 à 70 % de la consommation d'une station à boues activées, selon Gallo et al., 2024) ».

### 17. Bénéfice « méthane évité » posé comme acquis dans la Conclusion
`09_Conclusion_Recommandations.md:11` : « la combustion d'un méthane qui serait sinon émis dans l'atmosphère » dépend du scénario de référence (IV:201 le dit). Remplacement : « … par la stabilisation des boues et la combustion d'un méthane qui, selon la destination des boues en l'absence de digestion, aurait pu être émis dans l'atmosphère … ».

### 18. Doublons et ponctuation
- `06_Partie_II_b.md:269` : deux phrases successives disent la même chose (« plus de 50 % »). Remplacement : « À Kénitra, la seule valeur publiée indique que le méthane produit couvrirait « plus de 50 % » des besoins énergétiques de la station (Lihi et al., 2023a), sans que son mode de calcul soit détaillé. La suite de ce travail cherche à la remplacer par un bilan chiffré, fondé sur les données d'exploitation de la station. »
- `08_Partie_IV.md:39` et `:43` : le rendement de 92 % (Nizar et al., 2022) est donné deux fois ; supprimer la première phrase de la l. 39.
- `08b_Discussion.md:11` et `:13` : la comparaison avec « les quelque 40 % » est répétée ; supprimer la 3e phrase de la l. 13.
- Les listes se terminent par « ; » au lieu de « . » : `06_Partie_II_a.md:156`, `06_Partie_II_b.md:13`, `06_Partie_II_b.md:240`.

### 19. Abréviations
- `06_Partie_II_a.md:141` : « kg MVS » n'est pas défini et diffère de « MV », utilisé partout ailleurs. Remplacement : « exprimée en kg DBO5/kg MV/j ».
- Abréviations à ajouter à la liste (`09_Conclusion_Recommandations.md:84-111`) : **AOB** (bactéries oxydant l'ammonium), **ETM** (éléments traces métalliques), **HAP**, **PCB**, **PFAS**, **PNAEPI** (Programme national pour l'approvisionnement en eau potable et l'irrigation), **ADM1**, **FE** (facteur d'émission), **Csp** (consommation spécifique), **Nm³** (normomètre cube, à 0 °C et 101,325 kPa), **SP3**, **UV**, **TSH/TSS** si le n° 2 est appliqué.
- Liste : « PNA : Programme National d'Assainissement Liquide » ; harmoniser la casse avec le texte (« Programme national d'assainissement liquide »).

### 20. Numérotation des tableaux et figures : fragilités
- Les sources sautent les numéros 3 et 6 et contiennent « **Tableau X** » (`06_Partie_II_b.md:47`). `assemble.py` renumérote correctement, mais le Markdown seul est trompeur. Remplacement : « **Tableau 6 :** » en l. 47, ou laisser au script et le signaler.
- La figure 5 est un emplacement vide (`08_Partie_IV.md:37`, `(FIG: …)`). Si elle est supprimée, « figure 6 » (IV:92) et « figure 7 » (IV:171) ne correspondront plus aux légendes : il faudra régénérer.
- `09_Conclusion_Recommandations.md` n'est pas dans `ORDER` : tout futur « tableau N » qui y serait ajouté ne sera pas renuméroté.

### 21. Rapport AGV/TAC « sur les moyennes » non traçable
`08_Partie_IV.md:104` : « il atteint 0,16 dans les deux digesteurs » sans que les moyennes d'AGV et de TAC soient données. Ajouter entre parenthèses les moyennes utilisées (AGV / TAC de D1 et de D2).

### 22. Fraction de la DCO récupérée : ordre de grandeur à donner
`08b_Discussion.md:7` : avec une DBO5 brute de 300 mg/L et un rapport DCO/DBO5 de 2 à 3 (Marjaa et al., 2024), la charge en DCO est de 32 000 à 49 000 kg/j pour 54 000 m³/j, et les 13 400 kg/j de DCO convertie en représentent 27 à 41 %. La borne haute est élevée pour une station conventionnelle : à signaler, car elle conforte l'hypothèse d'un débit réel inférieur au débit nominal (n° 6). Ajout proposé : « À titre indicatif, avec une DBO5 brute de 300 mg/L (Nizar et al., 2022) et un rapport DCO/DBO5 de 2 à 3 (Marjaa et al., 2024), la charge entrante serait de 32 000 à 49 000 kg DCO/j, dont 27 à 41 % seraient récupérés sous forme de méthane. »

### 23. Résumés : formulations à préciser
- Abstract l. 70 : « energy self-sufficiency » → « electricity self-production rate » (le glossaire le définit pour l'électricité seule).
- ملخص l. 80 : « مترًا مكعبًا » → « مترًا مكعبًا عاديًّا (Nm³) » pour rester cohérent avec le Nm³ du texte français.

### 24. `bilan_energetique.py` : source des plages de consommation
`bilan_energetique.py:3` cite Maktabifard et al. (2018), absent de la bibliographie, alors que le mémoire tire la plage de 0,3 à 0,6 kWh/m³ de Gallo et al. (2024). Remplacement : « plages de consommation : Gallo et al. (2024) ; rendements CHP : Lima et al. (2023) ».

---

Points vérifiés sans remarque : biochimie des quatre étapes (syntrophie, part acétoclaste d'environ 70 %), nitrification (4,6 g O₂/g N ; Nitrospira, comammox), récupération de la moitié environ de l'alcalinité par dénitrification, équation de Gompertz modifiée, définition du Nm³ (0 °C ; 101,325 kPa), formules MES/MS/MV/siccité et calculs TAC/AGV, ISO 15705 (2 h à 150 °C), valeurs limites de l'arrêté 1607-06, limites de la directive 86/278/CEE, PRG de 27 pour le méthane biogénique (AR6), 0,35 Nm³ CH₄/kg DCO, et tous les calculs des Tableaux 16 et 17.
