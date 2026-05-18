# SpecJournalism — Phase 7: Executive Summary

## When to run this phase

Only after completing:
- Phase 5 (HTML page with all sections and charts rendered and verified)
- Phase 6 accountability check (pre-publication checklist passed)
- SJ-5 cross-check (all blocks PASS)

The summary is written **last** and positioned **first** on the page, inside the
`introExtra` field of `initShell()`.

**The summary must answer the journalistic angle in `story-brief.md` — not describe
whatever the data happened to show.** If the data only partially answers the brief,
say so. If the null hypothesis was not rejected, say so. (Constitution Article 10)

---

## Step 1 — Pattern inventory (record in `notes.md`)

Before writing, systematically identify the available patterns. Record exact values.

**Temporal** — available if at least one line chart has 5+ years of data:
- What is the delta between the first and last year for the primary series?
- Is there a peak or minimum? In which year?
- Is the trend monotonic, or has it reversed?
- Source: Chart.js data arrays in the script block, `.transform` blocks in HTML sections.

**Cross-entity comparison** — available if at least one horizontal bar chart has 5+ entities:
- What is the range between the highest and lowest value (most recent year)?
- What is the ratio between first and last? (e.g. "3.2× higher")
- Are there outliers that surprise by geographic location or reputation?
- Source: Chart.js data arrays for the ranking chart.

**Surprise finding** — actively identify it:
- Is there a result that contradicts the common assumption about the topic?
- Does a country behave opposite to its reputation?
- Does the expected "disadvantaged" group turn out to be favoured?
- Is there an unexpected relationship between two different sections?
- Source: cross-section comparison, not a single section.

Record in `notes.md`:

```markdown
## [DATE] — Phase 7: Patterns for executive summary
- Temporal: [description + exact value with year and unit]
- Country: [range + ratio + named outlier]
- Surprise: [finding with two exact values from different sections, with section IDs]
- Null hypothesis result: [REJECTED / NOT REJECTED / AMBIGUOUS — tie to story-brief.md]
```

---

## Step 2 — Writing rules

- **3–4 paragraphs**, 4–6 lines each. No more.
- Each paragraph must integrate **at least 2 angles** from: temporal, cross-entity,
  surprise. Do not write mono-thematic paragraphs.
- **Every claim must cite an exact number** with year and unit, directly traceable to
  a row in `output/`. Zero invented or memory-approximated values.
- **Every cited section must have a link** `<a href="#section-id">` to the corresponding
  HTML section. Do not cite data without indicating where to find it.
- Do not repeat values already present in `findingCards`.
- The summary must explicitly state whether the null hypothesis was rejected.
  If not rejected: "The data does not support [the journalistic angle as stated]:
  [specific explanation]." This is not a failure — it is accountability.

**Adapting to available patterns:**

| Pattern | Available if... | If not available |
|---|---|---|
| Temporal | ≥1 line chart with 5+ years | Add depth to comparison or surprise paragraphs |
| Cross-entity | ≥1 horizontal bar with 5+ entities | Use internal granularity (by age, sector, region) |
| Surprise | A result inverts a common assumption | If genuinely absent, do not invent one — use two temporal and two comparison paragraphs |

Do not write generic paragraphs to fill a schema.

---

## Step 3 — HTML template for `introExtra`

Insert the summary in the `introExtra` field of `initShell()`.

```js
introExtra: `
  <div class="summary mb-5">
    <h3 class="mb-3">What the data says</h3>
    <p>
      [Paragraph 1: opens with the main finding or strongest trend.
      Integrates at least one value with year and one cross-entity or group comparison.
      States whether the null hypothesis is supported.
      Closes with an unresolved tension that invites the reader to continue.]
      → <a href="#[section-id]">chart A</a>
    </p>
    <p>
      [Paragraph 2: introduces a second dimension (country, age, sector, region).
      Shows where the pattern changes. Cites at least two concrete values
      from different sections.]
      → <a href="#[section-id]">chart B</a>
    </p>
    <p>
      [Paragraph 3: the 'surprise' finding. A result that contradicts the prevailing
      assumption. Supported by at least two concrete values with section links.
      If no genuine surprise exists, describe the cross-entity range instead.]
      → <a href="#[section-id-1]">chart A</a>,
         <a href="#[section-id-2]">chart B</a>
    </p>
    <!-- Optional paragraph 4: implications or open question -->
    <p>
      [If the null hypothesis was not rejected: explicit disclosure here.
      "The data does not support [angle]: [explanation]. The analysis is published
      as a description of the current state, not as confirmation of the stated angle."]
    </p>
  </div>
`,
```

---

## Null hypothesis disclosure (mandatory when not rejected)

If C3 from SJ-5 was LIKELY FAIL TO REJECT, or if the full analysis confirms it,
add this block to the summary (can be paragraph 4 or a callout before paragraph 1):

```html
<div class="callout mb-4" style="border-left: 3px solid #e67e22; padding: 0.75rem 1rem;">
  <strong>Null hypothesis not rejected</strong> — The pre-registered condition was:
  "[falsifiability condition from story-brief.md]". The data shows [actual result].
  This analysis is published as a descriptive record. Results should not be interpreted
  as confirming the original journalistic angle.
</div>
```

This callout appears inside `introExtra`, before or after the summary paragraphs,
and is also referenced in the Scope Limit (`scopeLimit` field).
