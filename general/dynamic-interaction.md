---
id: dynamic-interaction
tier: general
triggers: ["hover", "drag", "complex interaction", "dropdown", "menu", "slider"]
tools: ["browser_pointer", "browser_map", "browser_click", "browser_evaluate"]
weavetab: ">=2.5.0"
---
# 🖱️ Complex UI Interactions
**Core Philosophy:** Modern web apps require more than just clicking and typing.

- **Hover States:** Mega-menus and tooltips require hovering. Use `browser_pointer` to move the mouse over elements to reveal hidden interactions.
- **Drag and Drop:** Sliders, kanban boards, and reorderable lists require drag-and-drop. Calculate the coordinates and execute smooth pointer movements.
- **Be Human-Like:** When interacting with highly dynamic UI components, sometimes it helps to pause briefly between actions to allow animations and transitions to complete.
