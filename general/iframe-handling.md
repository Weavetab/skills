---
id: iframe-handling
tier: general
triggers: ["iframe", "frame", "embed", "embedded content", "cross origin"]
tools: ["browser_map", "browser_find", "browser_click", "browser_snapshot", "browser_navigate"]
weavetab: ">=2.5.0"
---
# 🖼️ iFrame & Embedded Contexts
**Core Philosophy:** iFrames are websites within websites. You must traverse them intelligently.

- **Spot the Frame:** Payment gateways, video players, and embedded widgets live in iFrames. If you can't find an element that you *know* is on screen, it's probably in an iFrame.
- **Navigate the Hierarchy:** Use your tools to target elements *inside* the iFrame context. 
- **Creative Extraction:** If an iFrame is being particularly stubborn, consider extracting its `src` attribute and using `browser_navigate` to visit the embedded page directly in a new tab.
