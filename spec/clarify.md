# JournAI — Phase SJ-2: Clarify

## Purpose

Surface underspecified areas in `story-brief.md` through structured sequential questioning.
Record every answer in the `Clarifications` section of `story-brief.md`.
A brief with unresolved ambiguities produces a flawed `data-design.md` — fix it here.

Do not proceed to Phase SJ-3 until all mandatory questions are answered.

---

## Instructions

### Step 1 — Read the Story Brief

Load `reports/NN_slug/story-brief.md`. Identify:
- Scope boundaries that are approximate or ambiguous
- Claims of comparison that lack a stated baseline
- Time references that are relative ("last decade", "recent years")
- Geographic scope that is implied but not explicit
- Units of analysis that could be interpreted multiple ways

### Step 2 — Ask mandatory questions

Ask these questions in sequence. Wait for an answer before asking the next one.
Do not batch all questions at once — sequential questioning produces more precise answers.

**Q1 — Geographic scope**
> "Which specific countries, regions or geographic units should the analysis cover?
> Is there a specific subset (e.g. EU27 only, G7, Mediterranean countries, Italian NUTS2)?
> Or should it cover all available entities and then highlight a specific subset?"

**Q2 — Time period**
> "What is the time period of interest? Is there a specific start year?
> Should the analysis use the most recent available data, or a fixed end year?
> Is a comparison between two specific periods (before/after a policy, before/after a crisis) needed?"

**Q3 — Comparison baseline**
> "If the analysis involves a comparison (e.g. Italy vs. EU average, 2020 vs. 2024),
> what is the reference baseline? Is the baseline explicit in the story, or should
> it be determined from the data?"

**Q4 — Unit of analysis**
> "Should the data be presented as absolute values (counts, totals in euros),
> as rates or percentages of a reference (% of GDP, per 100k population),
> or as an index (base year = 100)? Each choice implies a different story."

**Q5 — Audience calibration**
> "How much statistical context needs to be explained inline?
> Should the report define what 'percentage point difference' or 'index number' means,
> or can these be used without explanation?"

### Step 3 — Ask conditional questions

Ask these only if triggered by the brief or by answers to mandatory questions.

**C1 — Triggered if the brief mentions a trend or change over time**
> "Is there a specific turning point or event year that the analysis should
> treat as a structural break (e.g. 2008 crisis, 2020 pandemic, a specific policy)?
> Should the analysis test for it, or just annotate it visually?"

**C2 — Triggered if the brief mentions a comparison between groups**
> "Should the comparison be between countries, between demographic groups,
> between sectors, or between time periods? Can it involve more than one level simultaneously?"

**C3 — Triggered if the brief involves Italy or Italian regions**
> "Should the Italian data be presented at national level, at NUTS1 (macro-regions),
> at NUTS2 (regions), or at NUTS3 (provinces)? Does the story require regional breakdown?"

**C4 — Triggered if the brief involves a policy claim**
> "Is the analysis intended to evaluate a policy outcome, or to describe a phenomenon?
> If evaluating a policy, which policy, and what is the measurable target it set?"

### Step 4 — Record answers

For every question answered, record in the `Clarifications` section of `story-brief.md`:

```markdown
## Clarifications

### Geographic scope
[Answer to Q1 — verbatim or paraphrased with user approval]

### Time period
[Answer to Q2]

### Comparison baseline
[Answer to Q3]

### Unit of analysis
[Answer to Q4]

### Audience calibration
[Answer to Q5]

### [Conditional: structural break / comparison level / regional breakdown / policy framing]
[Answer if triggered]
```

---

## Output check before moving to SJ-3

Before running `/sj.nullhyp`, verify:

- [ ] All five mandatory questions have been answered and recorded
- [ ] Conditional questions triggered by the brief have been asked and recorded
- [ ] No answer contradicts the `scope` section of the Story Brief
  (if it does, update `story-brief.md` and add a version note: `v1.1 — scope updated after clarification`)
- [ ] The geographic scope is now expressed as a specific list or rule, not as an approximation
- [ ] The time period is now expressed as specific years, not as relative references
- [ ] The unit of analysis is unambiguous
