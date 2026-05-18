# SpecJournalism — Phase SJ-1: Story Brief

## Purpose

Produce `story-brief.md` inside the analysis folder (`reports/NN_slug/story-brief.md`).
The Story Brief captures the journalistic intent of the analysis: what is being investigated
and why it matters. It deliberately excludes data sources, statistical methods, chart types
and tools — those decisions belong to `data-design.md` (Phase SJ-4).

Do not proceed to Phase SJ-2 until this file exists and is complete.

---

## Instructions

### Step 1 — Propose research angles

Before writing the brief, present the user with a numbered list of 3–5 possible
journalistic angles derived from the stated topic. Format:

```
Here are some possible story angles for this topic:

1. [Angle A — what it investigates and why it is newsworthy]
2. [Angle B — what it investigates and why it is newsworthy]
3. [Angle C — what it investigates and why it is newsworthy]

Which angle interests you, or would you like to start from a different one?
```

Wait for the user's choice. Do not proceed until an angle is selected or provided.

### Step 2 — Ask the editorial significance question

Once the angle is selected, ask:

> "Why does this matter now? Is there a specific event, policy decision, publication
> or public debate that makes this analysis timely?"

Record the answer verbatim. This becomes the `editorial_hook` field.

### Step 3 — Ask the audience question

Ask:

> "Who is the primary reader? A general audience with no statistical background,
> a policy-aware reader, or a specialist?"

This determines the narrative register for Phase 7 (executive summary).

### Step 4 — Write the Story Brief

Produce `reports/NN_slug/story-brief.md` using the template below.
Fill every field. Do not leave placeholders. If a field cannot be filled, explain why.

---

## story-brief.md template

```markdown
# Story Brief — [Descriptive title, not a headline]

## Journalistic angle
[2–4 sentences. What is being investigated. What relationship, trend or comparison
is being examined. Written as a statement of intent, not a hypothesis.
No mention of datasets, providers, statistical methods or tools.]

## Editorial hook
[Why this story matters now. The specific event, policy, publication or public debate
that makes this analysis timely. If the hook is not time-sensitive, explain the
structural relevance instead.]

## Primary audience
[General / Policy-aware / Specialist. One sentence on what this implies for
the narrative register: how much statistical context needs to be explained.]

## Scope
### In scope
[What this analysis covers: geography, time period (approximate), unit of analysis.
Do not cite specific datasets — describe the phenomenon being measured.]

### Out of scope
[What this analysis deliberately does not cover, and why. Be specific.
This section prevents scope creep during data-design.]

## Null hypothesis
[Left blank at this stage — filled in Phase SJ-3 (/sj.nullhyp)]

## Clarifications
[Left blank at this stage — filled in Phase SJ-2 (/sj.clarify)]

## Version history
- [DATE] v1.0 — initial brief
```

---

## Rules for writing the Story Brief

- **Describe phenomena, not indicators.** Write "the gap between youth and adult unemployment"
  not "LFSI_EMP_A filtered by AGE=Y15-29". Dataset choices belong in `data-design.md`.

- **Describe approximate scope, not exact filters.** Write "EU countries, last 15 years"
  not "geo=EU27_2020, startPeriod=2010". Exact parameters belong in `data-design.md`.

- **Do not pre-solve the story.** The brief states what is being investigated,
  not what the conclusion is expected to be. If the user already has a conclusion
  in mind, record it in `notes.md` and flag it as a confirmation bias risk.

- **One story per brief.** If the topic naturally splits into two independent
  journalistic angles, produce two separate briefs and two separate analyses.

- **Preserve the user's words.** The `journalistic_angle` section must use
  the user's language as much as possible. Do not translate a vernacular question
  into analytical framing at this stage. That happens in Phase 0 of the execution pipeline.

---

## Output check before moving to SJ-2

Before running `/sj.clarify`, verify:

- [ ] `story-brief.md` exists in `reports/NN_slug/`
- [ ] `journalistic_angle` contains no dataset names, provider names, or method names
- [ ] `editorial_hook` is filled (not "TBD" or empty)
- [ ] `scope` section has both In scope and Out of scope filled
- [ ] `null_hypothesis` section is present and marked as blank (not missing)
- [ ] `clarifications` section is present and marked as blank (not missing)
