# Notes — Labour Market Indicators

## 2026-05-01 — Phase 0: Research question

**Research question**
How does the labour market look from the worker's perspective across countries, genders, age groups, and sectors — and how has it changed over time?

**Statistical proxies**
- Unemployment rate (UNE_RT_A, Eurostat) — % of active population
- Labour force participation rate (LFSA_ARGAN, Eurostat) — % of working-age population active
- Employment rate / E-P ratio (LFSA_ERGAN, Eurostat)
- Temporary employment % (LFSA_ETPGAN + LFSA_ETGAN2, Eurostat)
- Involuntary part-time % (LFSA_EPPGAI, Eurostat)
- Employment by sector (LFSA_EGAN2, Eurostat)
- Average annual real wages (OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE, OECD)
- Gender wage gap (OECD.ELS.SAE,DSD_EARNINGS@GENDER_WAGE_GAP, OECD)
- Job vacancy rate (JVS_A_RATE_R2, Eurostat)

**Scope limits**
- Informal employment: ILO not available via opensdmx. Proxy: temporary employment by main reason.
- Wage data: OECD covers 38 countries only; no EU-27 harmonised real wage series.
- Sector breakdown for wages: Eurostat SES is wave-based (not annual), latest wave 2022.

**Language**: English

## 2026-05-01 — Phase 1: Provider check

Ran `opensdmx providers` — 11 providers available.
Multi-provider strategy confirmed:
- Eurostat: unemployment, LFPR, employment rate, temporary work, part-time, job vacancies
- OECD: real wages, gender wage gap (longer series, constant-price methodology)

## 2026-05-01 — Phase 1: Dataset discovery

Navigated Eurostat thematic tree: popul → labour → employ → lfsa.
Navigated OECD tree: OECDCS1 → JOB → JOB_BW + JOB_EMP.

Datasets selected:
- UNE_RT_A: unemployment by sex, age, geo (annual)
- LFSA_ARGAN: LFPR by citizenship (filter TOTAL), sex, age, geo
- LFSA_ERGAN: employment rate by citizenship (filter TOTAL), sex, age, geo
- LFSA_ETPGAN: temporary employees % by citizenship (filter TOTAL), sex, geo
- LFSA_ETGAN2: temporary employees by NACE Rev.2, sex, geo
- LFSA_EPPGAI: involuntary part-time % of total part-time, sex, age, geo
- LFSA_EGAN2: employed persons by NACE Rev.2, sex, age, geo
- JVS_A_RATE_R2: job vacancy rate by NACE Rev.2 annual
- OECD AV_AN_WAGE: average annual wages (real, constant prices)
- OECD GENDER_WAGE_GAP: gender wage gap by country

Datasets excluded:
- MET_LFU3RT: metropolitan region level — not needed for country comparison
- ENPE_LFSA_URGAN / ENPS_LFSA_URGAN: ENP countries only — out of scope
- EARN_GR_GPGR2: SES methodology (wave-based), replaced by OECD GENDER_WAGE_GAP for trend

## 2026-05-01 — Phase 2: Download

All 9 datasets downloaded. Notes on constraint issues encountered:
- UNE_RT_A: initial query used `TOTAL` as age code → HTTP 400. Corrected to `Y15-74` after `opensdmx constraints UNE_RT_A age`.
- LFSA_EGAN2: initial NACE compound codes (B_E, G_I) → HTTP 400. Corrected to individual NACE letters.
- OECD AV_AN_WAGE: initial filter PRICE_BASE=V with UNIT_MEASURE=USD_PPP → HTTP 404. USD_PPP is only available with PRICE_BASE=Q (current prices). Downloaded PRICE_BASE=Q; noted in methodology.
- OECD GENDER_WAGE_GAP: PAY_PERIOD=A not valid for this dataset (PAY_PERIOD=_Z only). Corrected.

Row counts:
- A_unemployment.csv: 7,169 data rows
- B_lfpr.csv: 7,929 rows
- C_employment_rate.csv: 7,929 rows
- C_employment_rate_age.csv: separate file for Y15-24/Y25-54/Y55-64
- D_temporary_pct.csv: 26,430 rows
- E_involuntary_parttime.csv: 62,532 rows
- F_job_vacancy.csv: 49,175 rows
- G_employment_sector.csv: 4,380 rows
- H_avg_wages.csv: 966 rows
- I_gender_wage_gap.csv: 802 rows

## 2026-05-01 — Double check

- Run 1 (opensdmx get): UNE_RT_A → 7,170 lines (incl. header) = 7,169 data rows
- Run 2 (URL direct): `curl` to Eurostat API → 7,170 lines
- Result: MATCH ✓

- Run 1 (opensdmx get): LFSA_ARGAN → 7,930 lines = 7,929 data rows
- Run 2 (URL direct): Eurostat API → 7,930 lines
- Result: MATCH ✓

OECD data: no public REST URL. Documented via CLI commands only.

## 2026-05-01 — Phase 3: Key findings

- EU27 unemployment 2024: 5.9% (total, Y15-74)
- Highest unemployment: Spain 11.4%, Greece 10.1%
- Lowest: Czech Republic 2.6%, Poland 2.9%
- EU27 youth unemployment 2024: 14.9%
- Largest M–F LFPR gap (EU27): Italy 18.0pp (M:75.6%, F:57.6%), Romania 18.0pp
- Smallest gap: Estonia 1.0pp, Finland 1.9pp
- Highest temporary employment: Netherlands 26.3%, Spain 16.0%, Portugal 16.0%
- Lowest: Lithuania 1.6%, Romania 1.8%
- EU27 involuntary part-time 2023 (total Y15-64): 19.5%
- Highest wages (OECD, USD PPP 2024): Luxembourg 94k, Iceland 90k, Switzerland 87k
- Lowest: Colombia 29k, India lower
- Gender wage gap 2024: Korea 29.0% (highest), Belgium 0.8%, Colombia 0.3% (lowest)
- Highest job vacancy sector EU27 2024: Admin & support (N) 4.0%, Accommodation & food (I) 3.2%

## 2026-05-01 — Phase 4: Charts

- A1: roughViz.BarH — unemployment ranking by country (35 countries, horizontal bars)
- A2: chart.xkcd.XY — unemployment EU27 trend by sex 2003–2024
- A3: roughViz.BarH — youth unemployment ranking (35 countries)
- B1/B1b: roughViz.BarH — LFPR ranking female/male separately (36 countries)
- B2: chart.xkcd.XY — LFPR EU27 trend by sex 2000–2024
- C1: chart.xkcd.Bar — employment rate by age group and sex (3 groups, multi-dataset)
- C2: roughViz.BarH — employed persons by NACE sector EU27 (11 sectors, millions)
- D1: roughViz.BarH — temporary employment % by country (36 countries)
- D2: chart.xkcd.XY — involuntary part-time trend EU27 by sex 2000–2024
- E1: roughViz.BarH — average wages ranking by country (38 OECD, USD PPP)
- E2: chart.xkcd.XY — wage index 2010=100 for 7 countries
- F1: roughViz.BarH — gender wage gap ranking by country (41 countries)
- G1: roughViz.BarH — job vacancy rate by NACE sector EU27 (13 sectors)
