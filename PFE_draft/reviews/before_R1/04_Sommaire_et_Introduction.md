# Table des matières

Remerciements
Résumé
Abstract
ملخص
Liste des figures
Liste des tableaux
Liste des abréviations

**Introduction générale**

**Partie I : Généralités sur la Station d'Épuration de Kénitra – Waterleau**
I. L'organisme d'accueil : Waterleau
II. La STEP de Kénitra : historique, situation géographique et fiche technique
III. Le parcours de l'eau
  1. Station de pompage SP3 et prétraitement
  2. Décantation primaire
  3. Traitement biologique par boues activées et aération
  4. Dégazage, clarification et rejet
IV. Le parcours des boues
  1. Épaississement et flottation
  2. Digestion anaérobie
  3. Déshydratation et destination des boues
V. La chaîne de valorisation du biogaz
  1. Désulfuration et séchage du biogaz
  2. Gazomètre, cogénération et torchère
VI. Les postes consommateurs d'énergie de la station

**Partie II : Synthèse bibliographique**
I. Les eaux usées urbaines
  1. Origine et composition
  2. Paramètres de pollution
  3. Cadre réglementaire marocain
II. Le traitement biologique des eaux usées
  1. Principe de l'épuration biologique
  2. Les procédés biologiques
  3. Le procédé à boues activées
  4. Élimination de l'azote et du phosphore
  5. Le coût énergétique du traitement biologique
III. Les boues d'épuration
  1. Origine et types de boues
  2. Caractéristiques physiques et chimiques
  3. Filières de traitement : épaississement, stabilisation, déshydratation
  4. Destinations des boues et situation au Maroc
IV. La valorisation énergétique des boues
  1. La digestion anaérobie : étapes et micro-organismes
  2. Paramètres de contrôle de la digestion
  3. Le biogaz : composition, traitement et usages
  4. La cogénération
  5. Autres voies de valorisation énergétique
V. Vers des stations d'épuration autosuffisantes en énergie
  1. Indicateurs de performance énergétique
  2. Leviers d'économie et de production d'énergie
  3. Expériences internationales et marocaines

**Partie III : Matériels et méthodes**
I. Matériels expérimentaux
II. Système de suivi industriel (SCADA)
III. Échantillonnage
IV. Analyses des eaux usées : pH, température, MES, DBO5, DCO, azote et phosphore
V. Analyses des boues : siccité, matières volatiles, pH, TAC et AGV
VI. Suivi de la production de biogaz
VII. Méthodes de calcul : rendements épuratoires, bilan énergétique et taux d'autoproduction

**Partie IV : Résultats et discussion**
I. Performances de la filière eau
II. Stabilité de la digestion anaérobie
III. Production de biogaz
IV. Bilan énergétique de la station
V. Discussion générale et vérification des hypothèses

**Conclusion générale**
**Recommandations**
**Références bibliographiques**
**Annexes**

---

# Introduction générale

## Contexte et importance du traitement des eaux usées

Le Maroc fait face à une raréfaction durable de ses ressources en eau, sous l'effet conjugué de sécheresses récurrentes, de la croissance urbaine et de la hausse des besoins agricoles et industriels. Dans ce contexte, les eaux usées urbaines ne peuvent plus être considérées uniquement comme un rejet à éliminer. Elles constituent un gisement d'eau réutilisable, de matière organique et d'énergie. Pourtant, ce potentiel reste peu exploité : à la fin de l'année 2024, le pays ne réutilisait qu'environ 52 millions de m³ d'eaux usées traitées par an, soit près de 7 % du volume des eaux usées urbaines (Medias24, 2026). Un objectif de 100 millions de m³ d'eaux usées traitées réutilisés par an a été fixé à l'horizon 2027, dans le cadre du Programme national pour l'approvisionnement en eau potable et l'irrigation (PNAEPI 2020–2027) et du Programme national d'assainissement mutualisé (PNAM 2019–2040), qui fait de la réutilisation l'un de ses piliers (Medias24, 2026).

Cette ambition repose sur les stations d'épuration (STEP), dont le fonctionnement soulève deux difficultés majeures. La première est énergétique. Le traitement biologique par boues activées, procédé le plus répandu dans les grandes agglomérations, consomme en moyenne entre 0,3 et 0,6 kWh d'électricité par mètre cube traité, et l'aération des bassins en représente généralement plus de la moitié (Gallo et al., 2024 ; Mainardis et Kegl, 2026). L'électricité constitue ainsi l'un des premiers postes de dépense d'une station, et une source indirecte d'émissions de gaz à effet de serre. La seconde difficulté concerne les boues d'épuration, sous-produit inévitable du traitement. Leur gestion est coûteuse et, au Maroc, leur mise en décharge reste une pratique courante, malgré les nuisances olfactives et les risques de contamination qu'elle entraîne (An-nori et al., 2022).

La digestion anaérobie permet de répondre à ces deux difficultés à la fois. En dégradant la matière organique des boues en l'absence d'oxygène, elle réduit leur volume et leur pouvoir fermentescible, tout en produisant un biogaz riche en méthane, valorisable sous forme de chaleur et d'électricité par cogénération (Mitraka et al., 2022). Le gain se mesure, à l'échelle d'une station, par un indicateur simple : le taux d'autoproduction électrique, rapport entre l'électricité produite à partir du biogaz et l'électricité consommée. Plusieurs stations européennes atteignent déjà l'autosuffisance énergétique, voire produisent plus d'énergie qu'elles n'en consomment, lorsque la digestion est renforcée par un prétraitement des boues ou une co-digestion (Mainardis et Kegl, 2026). Au Maroc, cette approche a été adoptée par de grandes stations comme celles de Marrakech (WWD, s. d.) et de Kénitra (Lihi et al., 2023a).

La station d'épuration de Kénitra, exploitée par Waterleau, constitue le cas étudié dans ce travail. Dimensionnée pour 334 000 équivalents-habitants et un débit de 53 900 m³ par jour, elle associe un traitement biologique par boues activées à une filière de digestion anaérobie des boues comprenant deux digesteurs mésophiles. Le biogaz produit, d'environ 6 700 Nm³ par jour et composé à près de 70 % de méthane, est valorisé par cogénération et couvrirait plus de la moitié des besoins énergétiques de la station (Lihi et al., 2023a).

## Problématique

Si l'intérêt de la digestion anaérobie est bien établi dans la littérature (Mitraka et al., 2022 ; Mainardis et Kegl, 2026), son apport réel dépend du fonctionnement de l'ensemble de la station : la qualité du traitement de l'eau conditionne la quantité et la nature des boues produites, et la stabilité des digesteurs détermine la production de biogaz. Les filières eau et boues doivent donc être étudiées ensemble. Ce travail s'articule autour de la question suivante :

**Dans quelle mesure l'intégration du traitement biologique des eaux usées et de la valorisation énergétique des boues améliore-t-elle la performance environnementale et énergétique de la STEP de Kénitra ?**

Cette question en soulève trois autres. La filière eau de la station atteint-elle les valeurs limites de rejet fixées par la réglementation marocaine ? La digestion anaérobie des boues fonctionne-t-elle dans des conditions stables ? Quelle part des besoins électriques de la station la valorisation du biogaz permet-elle de couvrir ?

## Hypothèses de recherche

Trois hypothèses ont été formulées :

- **H1 :** le traitement biologique par boues activées permet d'atteindre les valeurs limites spécifiques de rejet domestique fixées par l'arrêté conjoint n° 1607-06, à savoir 120 mg O₂/L pour la DBO5, 250 mg O₂/L pour la DCO et 150 mg/L pour les MES (Maroc, 2006).
- **H2 :** la digestion anaérobie mésophile des boues fonctionne dans un domaine de stabilité, caractérisé par un pH compris entre 6,5 et 8,5, une température voisine de 37 °C et un rapport AGV/TAC inférieur à 0,3 (Lihi et al., 2023a).
- **H3 :** la valorisation du biogaz par cogénération couvre au moins la moitié des besoins en électricité de la station, ce qui se traduit par des émissions de CO₂ évitées chiffrables à partir du facteur d'émission du réseau électrique national (FNH, 2025).

## Objectifs du travail

Ce travail poursuit les objectifs suivants :

- décrire le fonctionnement des filières eau, boues et biogaz de la STEP de Kénitra ;
- évaluer les performances épuratoires de la filière eau au regard de la réglementation ;
- suivre les paramètres de stabilité de la digestion anaérobie et la production de biogaz ;
- établir le bilan énergétique de la station et calculer son taux d'autoproduction électrique ;
- proposer des pistes d'amélioration de la performance énergétique et environnementale de la station.

## Méthodologie générale

L'étude a été menée dans le cadre d'un stage de fin d'études effectué au sein de la STEP de Kénitra (Waterleau), du [date de début] au [date de fin]. La démarche a combiné trois volets. Une synthèse bibliographique a d'abord fixé les seuils de référence utilisés pour l'interprétation : valeurs limites de rejet, domaines de stabilité de la digestion mésophile et rendements de cogénération. Les données d'exploitation de la station ont ensuite été collectées : analyses physico-chimiques des eaux brutes et traitées, paramètres de suivi des digesteurs, production de biogaz et consommation électrique. Ces données ont enfin été traitées afin de calculer les rendements épuratoires et le bilan énergétique de la station, puis comparées aux normes en vigueur. Pour la digestion et le biogaz, elles ont été complétées par les mesures publiées sur la même station pour mai et juin 2021 (Lihi et al., 2023a) et par les données d'exploitation de l'été 2025 ([NOM], 2025), ce qui permet de comparer trois périodes de fonctionnement.

## Organisation du mémoire

Le mémoire comprend quatre parties. La première présente l'organisme d'accueil et la STEP de Kénitra, en décrivant le parcours de l'eau, des boues et du biogaz ainsi que les principaux postes consommateurs d'énergie ; la deuxième propose une synthèse bibliographique sur les eaux usées, le traitement biologique, les boues d'épuration et leur valorisation énergétique ; la troisième expose les méthodes d'échantillonnage, d'analyse et de calcul ; la dernière présente les résultats, qui sont ensuite discutés dans un chapitre de discussion générale, avant une conclusion générale assortie de recommandations.

---

**Références citées dans l'introduction** (à reporter dans la bibliographie générale) :

- APPELS L., BAEYENS J., DEGRÈVE J., DEWIL R. 2008. Principles and potential of the anaerobic digestion of waste-activated sludge. *Progress in Energy and Combustion Science*, vol. 34, n° 6, 755-781.
- GHACHA A., AMMARI M., BEN ALLAL L. 2020. Sustainable sewage sludge management in Morocco: constraints and solutions. *Journal of Water and Land Development*, n° 46, 71-83.
- LIHI K., AUAJJAR N., NIZAR Y., ATTARASSI B. 2023. Kinetic modeling of methane production from the anaerobic digestion of wastewater sludge from a treatment plant in Kenitra, Morocco. *Ecological Engineering & Environmental Technology*, vol. 24, n° 1, 165-174.
- MAKTABIFARD M., ZABOROWSKA E., MAKINIA J. 2018. Achieving energy neutrality in wastewater treatment plants through energy savings and enhancing renewable energy production. *Reviews in Environmental Science and Bio/Technology*, vol. 17, n° 4, 655-689.
- MAROC. 2006. Arrêté conjoint n° 1607-06 du 25 juillet 2006 portant fixation des valeurs limites spécifiques de rejet domestique. *Bulletin Officiel*, n° 5448 du 17 août 2006.
- MEDIAS24. 2026. Eaux usées : 194 Mm³ rejetées sans valorisation chaque année [en ligne]. Disponible sur : https://medias24.com/2026/01/29/eaux-usees-194-mm3-rejetees-sans-valorisation-chaque-annee-1619251/ (consulté le 24 novembre 2026).
- NOWAK O., ENDERLE P., VARBANOV P. 2015. Ways to optimize the energy balance of municipal wastewater systems: lessons learned from Austrian applications. *Journal of Cleaner Production*, vol. 88, 125-131.

**À compléter par elle :** les dates du stage. **À vérifier :** que l'exploitant est bien Waterleau sur toute la période citée.
