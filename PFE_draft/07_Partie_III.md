# Partie III : Matériels et méthodes

Cette partie précise l'origine de chaque donnée utilisée dans la quatrième partie : mesures réalisées au laboratoire de la station pendant le stage, données journalières extraites du SCADA, et, pour la digestion et le biogaz, données publiées (Lihi et al., 2023a) ou issues d'un mémoire antérieur ([NOM], 2025). Elle décrit ensuite les méthodes d'analyse des eaux et des boues, puis les formules employées pour les rendements épuratoires, le bilan énergétique et les émissions évitées.

## I. Cadre et déroulement de l'étude

L'étude a été réalisée au sein de la STEP de Kénitra, exploitée par Waterleau, pendant la période de stage du [date de début] au [date de fin]. Elle a combiné :

- l'observation du fonctionnement des ouvrages et la participation aux activités du laboratoire et de l'exploitation ;
- la collecte des résultats d'analyses physico-chimiques des eaux et des boues réalisées par le laboratoire de la station ;
- l'extraction des données d'exploitation enregistrées par le système de supervision (débits, production de biogaz, énergie produite et consommée) ;
- le traitement statistique de ces données et le calcul des indicateurs de performance.

Les filières eau, boues et biogaz ont été étudiées simultanément, afin de relier la qualité du traitement de l'eau, la production de boues et la production d'énergie. Une étude limitée à une seule filière n'aurait pas permis de répondre à la problématique, qui porte sur leur intégration.

## II. Matériels expérimentaux

Les analyses ont été réalisées au laboratoire de la station, à l'aide des équipements présentés dans le tableau 8.

**Tableau 8 : Matériels et équipements de laboratoire utilisés**

| Équipement | Usage |
|---|---|
| pH-mètre et sonde de température | Mesure du pH et de la température des eaux et des boues |
| Conductimètre | Mesure de la conductivité |
| Rampe de filtration sous vide et filtres en fibre de verre | Dosage des MES |
| Étuve réglée à 105 °C | Séchage pour la détermination des MES, de la matière sèche et de la siccité |
| Four à moufle réglé à 550 °C | Calcination pour la détermination des matières volatiles |
| Balance analytique (précision 0,1 mg) | Pesées |
| Dessiccateur | Refroidissement des échantillons à l'abri de l'humidité |
| Réacteur thermostaté et spectrophotomètre | Dosage de la DCO, de l'azote et du phosphore (méthodes en tubes) |
| Système manométrique de DBO5 et incubateur à 20 °C | Mesure de la DBO5 |
| Centrifugeuse de laboratoire | Préparation des échantillons de boues pour le TAC et les AGV |
| Burette et agitateur magnétique | Titrages (TAC et AGV) |
| Verrerie (éprouvettes, béchers, fioles jaugées, capsules) | Préparation et pesée des échantillons |

[À compléter : marques et modèles réels des appareils du laboratoire.]

## III. Système de suivi industriel (SCADA)

La station est pilotée par un système de supervision et d'acquisition de données (SCADA). Ce système centralise en temps réel les mesures des capteurs installés sur les ouvrages : débits d'entrée et de sortie, niveaux, concentrations en oxygène dissous dans les bassins d'aération, températures et pressions des digesteurs, débit de biogaz produit, état de fonctionnement des équipements, énergie électrique produite par les moteurs de cogénération et énergie consommée par la station. Il permet aux opérateurs de piloter les équipements à distance et de déclencher des alarmes en cas d'anomalie (observations de stage).

Dans le cadre de ce travail, les données journalières du SCADA ont été extraites pour la période d'étude afin de constituer les séries de débits, de production de biogaz et d'énergie utilisées dans les calculs.

## IV. Échantillonnage

### 1. Points de prélèvement

Le tableau 9 précise, pour chaque point de prélèvement, la nature de l'échantillon et les paramètres analysés.

**Tableau 9 : Points de prélèvement et paramètres analysés**

| Point de prélèvement | Nature de l'échantillon | Paramètres analysés |
|---|---|---|
| Entrée de la station (après prétraitement) | Eau usée brute | pH, température, MES, DBO5, DCO, NTK, Pt |
| Sortie de la station (eau traitée) | Eau épurée | pH, température, MES, DBO5, DCO, NTK, NO₃⁻, Pt |
| Sortie des épaississeurs et du flottateur | Boues épaissies | MS, MV, pH |
| Digesteurs D1 et D2 | Boues en digestion | MS, MV, pH, température, TAC, AGV |
| Sortie de la déshydratation | Boues déshydratées | Siccité, MV |
| Ligne de biogaz | Biogaz | Débit, teneur en CH₄ |

### 2. Méthodes de prélèvement

Pour les eaux usées, des **échantillons composites** ont été constitués sur 24 heures par des préleveurs automatiques réfrigérés, qui prélèvent un volume proportionnel au débit à intervalles réguliers. Ce mode de prélèvement donne une image représentative de la qualité moyenne de l'eau sur la journée, en lissant les variations horaires de la charge polluante (APHA, 2023).

Les boues ont été prélevées de manière **ponctuelle** au niveau des vannes d'échantillonnage des ouvrages, après une purge permettant d'éliminer les boues stagnantes dans les conduites. Les échantillons ont été recueillis dans des flacons propres, étiquetés (point, date, heure) et analysés le jour même ; à défaut, ils ont été conservés à 4 °C (APHA, 2023).

## V. Analyses des eaux usées

### 1. pH et température

Le pH et la température ont été mesurés directement à l'aide d'un pH-mètre muni d'une sonde de température, étalonné quotidiennement au moyen de solutions tampons de pH 4, 7 et 10 (APHA, 2023).

### 2. Matières en suspension (MES)

Les MES ont été déterminées par filtration d'un volume connu d'échantillon sur un filtre en fibre de verre préalablement séché et pesé, puis séchage du filtre à 105 °C jusqu'à masse constante (NF EN 872). La concentration est obtenue par (AFNOR, 2005):

MES (mg/L) = (M1 − M0) × 1 000 / V

où M0 est la masse du filtre vide (mg), M1 la masse du filtre après filtration et séchage (mg), et V le volume filtré (mL).

### 3. Demande chimique en oxygène (DCO)

La DCO a été mesurée par la méthode en tubes fermés : l'échantillon est oxydé par un excès de dichromate de potassium en milieu sulfurique, en présence de sulfate d'argent comme catalyseur et de sulfate de mercure pour masquer les chlorures, pendant deux heures à 150 °C. La quantité de dichromate consommée est ensuite déterminée par spectrophotométrie et convertie en mg d'O₂/L (ISO 15705) (ISO, 2002).

### 4. Demande biochimique en oxygène (DBO5)

La DBO5 a été mesurée par la méthode manométrique. L'échantillon est placé dans un flacon brun fermé par une tête de mesure, en présence d'un inhibiteur de nitrification, et incubé cinq jours à 20 °C sous agitation, le CO₂ produit étant piégé par des pastilles d'hydroxyde de sodium placées dans le bouchon. La consommation d'oxygène par les micro-organismes entraîne une baisse de pression, enregistrée par la tête de mesure et convertie directement en mg d'O₂/L. Le volume d'échantillon est choisi en fonction de la DBO5 attendue, estimée à partir de la DCO. La méthode de référence, par dilution, est décrite par la norme NF EN ISO 5815-1 (APHA, 2023).

### 5. Azote et phosphore

L'azote Kjeldahl, les nitrates et le phosphore total ont été dosés par des méthodes spectrophotométriques (APHA, 2023) en tubes, après minéralisation lorsque la méthode l'exige. [À compléter ou à supprimer selon les analyses réellement réalisées par le laboratoire pendant le stage.]

## VI. Analyses des boues

### 1. Matière sèche et siccité (NF EN 15934, anciennement NF EN 12880)

Une capsule en aluminium est pesée vide (P1). Un volume connu de boue (V) y est introduit, puis la capsule est placée à l'étuve à 105 °C pendant 24 heures. Après refroidissement au dessiccateur pendant trente minutes, elle est pesée à nouveau (P2). La matière sèche est donnée par (AFNOR, 2012 ; Lihi et al., 2023a):

MS (g/L) = (P2 − P1) × 1 000 / V, où P1 et P2 sont exprimés en g et V en mL

Pour les boues déshydratées, on pèse une masse de boue humide (Mh) et la siccité s'exprime en pourcentage :

Siccité (%) = (P2 − P1) / Mh × 100

### 2. Matières volatiles (NF EN 15935, anciennement NF EN 12879)

La capsule contenant le résidu sec est placée dans un four à moufle à 550 °C pendant deux heures, puis refroidie au dessiccateur et pesée (P3). La matière organique est brûlée et seule la fraction minérale subsiste. On obtient (AFNOR, 2012 ; Lihi et al., 2023a):

MV (g/L) = (P2 − P3) × 1 000 / V et MV/MS (%) = (P2 − P3) / (P2 − P1) × 100

### 3. pH des boues (NF EN 15933, anciennement NF EN 12176)

Le pH des boues a été mesuré directement dans l'échantillon homogénéisé, à l'aide du pH-mètre étalonné (AFNOR, 2012).

### 4. Titre alcalimétrique complet (TAC) et acides gras volatils (AGV)

Le TAC et les AGV ont été déterminés par titrage sur la phase liquide de la boue, selon la méthode utilisée par le laboratoire de la station et décrite par Lihi et al. (2023a) :

- un volume de 25 mL de boue est centrifugé à 5 000 tr/min pendant 10 minutes ; le surnageant est recueilli et le culot lavé à l'eau distillée, l'opération étant répétée afin d'extraire la phase liquide (Lihi et al., 2023a);
- pour le **TAC**, la solution obtenue est titrée par l'acide sulfurique 0,1 N jusqu'à pH 4 (Lihi et al., 2023a). Le TAC, exprimé en g d'équivalent CaCO₃ par litre, est calculé par TAC = V × 0,1 × 50 / 25 = V × 0,2, où V est le volume d'acide versé (mL). Le titrage jusqu'à pH 4 inclut une partie des AGV ;
- pour les **AGV**, l'échantillon est acidifié jusqu'à pH 3,5, porté à ébullition pendant trois minutes pour éliminer le CO₂, refroidi, ramené à pH 4 par ajout de soude, puis titré par la soude 0,1 N jusqu'à pH 7. Les AGV, exprimés en g d'équivalent acide acétique par litre, sont calculés par AGV = V(B) × 0,1 × 60 / 25 = V(B) × 0,24, où V(B) est le volume de soude versé entre pH 4 et pH 7 (mL). Cette méthode dérive du titrage de Nordmann (FOS/TAC), dont les limites et les corrections ont été discutées récemment par Liu et al. (2021).

Le rapport AGV/TAC est calculé pour chaque prélèvement réalisé pendant le stage ; pour les données publiées de 2021, seules les médianes et les moyennes étant disponibles, il a été calculé comme rapport des médianes (0,47/3,52 = 0,13 pour D1 ; 0,52/3,58 = 0,15 pour D2) et comme rapport des moyennes (Partie IV, § III).

### 5. Consommation de polymère

La consommation de polymère de la déshydratation a été calculée à partir des quantités de polymère préparées et de la masse de matière sèche traitée, et exprimée en kg de polymère par tonne de matière sèche (kg/t MS) (Rao et al., 2022).

## VII. Suivi de la production de biogaz

Le débit de biogaz produit par chaque digesteur est mesuré en continu par des débitmètres et enregistré par le SCADA, en Nm³ (normomètres cubes, ramenés à 0 °C et 101,325 kPa) (observations de stage). La teneur en méthane est mesurée par un analyseur de gaz en ligne [À compléter : méthode réelle]. Les volumes journaliers de biogaz et de méthane ont été calculés pour toute la période d'étude.

## VIII. Méthodes de calcul

### 1. Rendement épuratoire

Le rendement d'élimination de chaque paramètre a été calculé par :

R (%) = (Ce − Cs) / Ce × 100

où Ce est la concentration en entrée et Cs la concentration en sortie (mg/L).

### 2. Charges polluantes

La charge journalière d'un paramètre est obtenue en multipliant sa concentration par le débit :

Charge (kg/j) = C (mg/L) × Q (m³/j) / 1000

### 3. Énergie contenue dans le biogaz

Le volume de méthane est déduit du volume de biogaz et de sa teneur en méthane :

V(CH₄) = V(biogaz) × %CH₄

L'énergie primaire contenue dans ce méthane est calculée à partir du pouvoir calorifique inférieur du méthane, pris égal à 9,97 kWh/Nm³, valeur cohérente avec le pouvoir calorifique de 16 à 28 MJ/m³ rapporté pour le biogaz selon sa teneur en méthane (Commission européenne, s. d.) :

E(primaire) = V(CH₄) × 9,97

### 4. Énergie produite par cogénération

Lorsque l'énergie électrique produite par les moteurs n'est pas directement disponible, elle est estimée à partir de l'énergie primaire et du rendement électrique du moteur (Lima et al., 2023):

E(élec) = E(primaire) × η(élec)

La chaleur récupérable est estimée de la même façon avec le rendement thermique :

E(th) = E(primaire) × η(th)

Les rendements retenus sont η(élec) = 38 % et η(th) = 45 %, valeurs situées dans les plages de 30 à 40 % et de 40 à 50 % rapportées pour les moteurs à combustion interne de cogénération (Lima et al., 2023) ; à défaut des caractéristiques constructeur des moteurs de la station [à compléter], elles fixent un plafond théorique et non une performance mesurée. Le rendement électrique réel de la station a été calculé lorsque les données de production électrique étaient disponibles :

η(élec, réel) = E(élec, mesurée) / E(primaire)

### 5. Consommation spécifique et taux d'autoproduction

La consommation spécifique de la station est obtenue en divisant l'énergie électrique consommée par le volume d'eau traité (Gallo et al., 2024):

Csp (kWh/m³) = E(consommée) / Q

Le taux d'autoproduction électrique, qui mesure la part des besoins couverte par l'énergie produite sur site, est calculé par (Mainardis et Kegl, 2026):

Taux d'autoproduction (%) = E(élec, produite) / E(consommée) × 100

### 6. Émissions de CO₂ évitées

Les émissions de CO₂ évitées par l'autoproduction d'électricité sont estimées en multipliant l'électricité produite par le facteur d'émission du réseau électrique national (FNH, 2025) :

CO₂ évité (t/an) = E(élec, produite) (kWh/an) × FE (kg CO₂/kWh) / 1000

Le Maroc ne publie pas de facteur d'émission officiel unique pour son réseau électrique. La valeur retenue est l'intensité carbone de la production électrique nationale en 2024, soit 0,62 kg CO₂/kWh (FNH, 2025).

### 7. Traitement des données

Les données ont été saisies et traitées sous Microsoft Excel. Pour chaque paramètre, la moyenne, l'écart-type, le minimum et le maximum ont été calculés sur la période d'étude. Les résultats sont présentés sous forme de tableaux et de graphiques d'évolution, puis comparés aux valeurs limites réglementaires et aux valeurs de référence de la littérature.
