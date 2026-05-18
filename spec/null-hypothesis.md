# JournAI — Phase SJ-3: Null Hypothesis

## Purpose

Articulate the falsifiability condition of the Story Brief before any data is downloaded.
This is the single most important quality gate in JournAI.

Pre-registering what would make the story false prevents three failure modes:
1. **p-hacking by narrative**: switching methods silently until the data "works"
2. **Confirmation bias**: interpreting ambiguous results as confirmatory
3. **Non-story publication**: publishing a null result as if it were a finding

Record the output in the `Null Hypothesis` section of `story-brief.md`.

---

## Instructions

### Step 1 — Read the Story Brief and Clarifications

Load `reports/NN_slug/story-brief.md`. Read the `Journalistic angle` and `Clarifications`
sections carefully. The null hypothesis must be directly derived from the stated angle —
not from what the data is expected to show.

### Step 2 — Ask the falsifiability question

Ask the user:

> "What result would make this story not worth publishing?
> Concretely: if the data showed [X], would the story fall apart?
> Try to complete this sentence: 'This story is false if the data shows that…'"

Wait for an answer. If the user cannot answer, guide them with Step 3.

### Step 3 — Guided elicitation (if Step 2 produces no answer)

**For trend stories** (the user wants to show that something has changed):
> "If the indicator showed no meaningful change over the period, would the story still be
> publishable? What is the minimum change that would make it a story?"

**For comparison stories** (the user wants to show that one entity differs from another):
> "If the gap between [entity A] and [entity B] turned out to be smaller than [threshold],
> or in the opposite direction from expected, would the story still hold?
> What is the minimum difference that makes the comparison newsworthy?"

**For correlation stories** (the user wants to show that two phenomena are related):
> "If the relationship were near zero, or reversed in a significant subset of the data,
> would the story still hold? What strength of association is required for credibility?"

**For policy evaluation stories** (the user wants to assess a policy outcome):
> "If the outcome did not differ significantly from the counterfactual trend,
> or from comparable countries that did not adopt the policy, would the story still hold?"

### Step 4 — Identify the methodological commitment

Once the null hypothesis is stated, derive the minimum analytical commitment.
Record this as the `methodological_floor`: the weakest test that, if passed, supports publication.

Examples:
- "The trend is newsworthy if the annualised change exceeds [X] percentage points"
- "The comparison is valid if the gap between [A] and [B] exceeds [Y] in the most recent year"
- "The correlation is reportable if r > [Z] across at least [N] entities"

The `methodological_floor` constrains `data-design.md`: the chosen method must be capable
of testing it.

### Step 5 — Identify the scope trigger

State explicitly: if the null hypothesis cannot be rejected, what happens?

- **Story paused**: the analysis is suspended pending better data. Document in `notes.md`.
- **Story reframed**: the null result is itself the story (e.g. "the expected gap does not exist").
  This must be agreed with the user before proceeding.
- **Story scoped down**: a subset of the data shows the effect. The report is scoped
  to that subset with explicit disclosure of what the full dataset shows.

Record the agreed scope trigger in `story-brief.md`.

---

## Null Hypothesis template

Record this in the `Null Hypothesis` section of `story-brief.md`:

```markdown
## Null hypothesis

### Falsifiability condition
[Complete sentence: "This story does not hold if the data shows that…"]

### Methodological floor
[The minimum analytical result required for publication.
Expressed as a concrete threshold: value, direction, or magnitude.]

### Scope trigger
[What happens if the null cannot be rejected: paused / reframed / scoped down.
One sentence explaining the agreed course of action.]

### Pre-registration date
[DATE — this section must be filled before any data is downloaded]
```

---

## Rules

- The null hypothesis must be written **before** running any data query.
  The pre-registration date enforces this.

- The null hypothesis must be specific enough to be testable. "The story is false if
  there is no effect" is not acceptable. State the minimum magnitude, direction or threshold.

- If the user refuses to state a null hypothesis ("I just want to see what the data shows"),
  record this in `notes.md` and flag the analysis as exploratory. Exploratory analyses
  must carry an explicit disclaimer in the Scope Limit callout:
  "This analysis is exploratory. No hypothesis was pre-registered. Results should be
  interpreted as descriptive, not confirmatory."

- Do not mistake the null hypothesis for a pessimistic prediction. It is a logical commitment:
  the conditions under which the analysis would not support the stated journalistic angle.

---

## Output check before moving to SJ-4

Before running `/sj.design`, verify:

- [ ] `Null hypothesis` section in `story-brief.md` is filled (not blank, not "TBD")
- [ ] `Falsifiability condition` is a complete, specific, testable sentence
- [ ] `Methodological floor` specifies a concrete threshold (not "some effect")
- [ ] `Scope trigger` is agreed and recorded
- [ ] `Pre-registration date` is today's date
- [ ] No data has been downloaded yet (check `output/` — must be empty or absent)
