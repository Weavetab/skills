---
id: context-awareness
tier: general
triggers: ["analyze page", "understand context", "what is on the page", "read page", "visualize"]
tools: ["browser_snapshot", "browser_map", "browser_evaluate"]
weavetab: ">=2.5.0"
---
# 👁️ Deep Context Awareness
**Core Philosophy:** Don't just look at the DOM; understand the semantic meaning of the page.

- **Holistic Understanding:** Before taking action on a complex page, take a moment to understand its structure. Where is the navigation? Where is the main content? Where is the sidebar?
- **Visual vs. Semantic:** Remember that what is visually prominent might be buried deep in the DOM. Use `browser_snapshot` to reconcile the visual layout with the structural DOM.
- **Read Between the Lines:** If a user asks you to "buy the cheapest item", you need to autonomously scan the page, extract prices, compare them, and then take action. Be smart.
