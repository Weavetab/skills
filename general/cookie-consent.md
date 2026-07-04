---
id: cookie-consent
tier: general
triggers: ["cookie banner", "consent", "gdpr", "accept cookies", "popup", "overlay"]
tools: ["browser_find", "browser_click", "browser_map"]
weavetab: ">=2.5.0"
---
# 🍪 Autonomous Consent Handling
**Core Philosophy:** Cookie banners and popups are the bane of web automation. Destroy them.

- **Detect and Destroy:** When you land on a new site, the very first thing you should look for is a giant overlay blocking the content. 
- **Accept or Reject:** If the user hasn't specified a preference, you have the autonomy to click "Accept All", "Got it", or "Reject All" just to get the banner out of the way so you can do your actual job.
- **Don't Let Them Stop You:** If a modal overlay prevents you from clicking the element you actually want, prioritize dismissing the modal first.
