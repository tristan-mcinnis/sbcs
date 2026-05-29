---
name: "🍔 New burger rating"
about: "Log a scored burger to the SBCS ledger. Easiest path: use the Score a Burger page, which fills this in for you."
title: "Rating: <Restaurant> — <Burger> (<Your name>)"
labels: ["rating"]
---

<!--
  The club bot reads the JSON block below and adds it to data/ratings.json.
  The friendly way to fill this is the website → "Score a Burger" → "Log to the Ledger",
  which pre-fills everything. Otherwise, edit the values below.

  Scores are integers 1–4. See the methodology page for what each criterion means.
  Leave price / pattyWeight as null if unknown. Set again / recommend to true or false.

  Scoring SUSHI instead? Easiest is the website (pick "Sushi" at the top of the card).
  Or set "category": "sushi" and replace the scores block with the sushi keys:
  riceTemp, riceSeason, riceTexture, riceDensity, riceForm, fishFresh, fishQuality,
  knifework, fishTemp, ratio, wasabi, nikiri, presentation, originality, consistency,
  value, accuracy, hospitality, craveability, xFactor.
-->

```json
{
  "date": "2026-05-29",
  "rater": "Your name",
  "restaurant": "Restaurant name",
  "burger": "Burger / item name",
  "category": "burger",
  "price": null,
  "type": "Smash",
  "pattyWeight": null,
  "scores": {
    "doneness": 3, "seasoning": 3, "crust": 3, "texture": 3, "ratio": 3,
    "bun": 3, "integrity": 3, "distribution": 3,
    "flavor": 3, "sauce": 3, "cheese": 3, "toppings": 3,
    "craveability": 3, "originality": 3, "presentation": 3, "concept": 3,
    "value": 3, "accuracy": 3,
    "postBurger": 3, "xFactor": 3
  },
  "again": true,
  "recommend": true,
  "notes": ""
}
```
