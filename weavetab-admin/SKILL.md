---
name: weavetab-admin
description: Publishes changelog updates, release notes, and product announcements directly to Weavetab using Cloudflare D1.
---

# Weavetab Admin & Release Management Skill

Use this skill when the user asks to publish a new release, changelog entry, or update to the Weavetab website.

## Tools Available

- `submit_changelog`: Publishes a structured changelog entry to the live Cloudflare D1 database.
- `list_changelogs`: Inspects existing changelogs to review published versions.
- `delete_changelog`: Removes an entry if a rollback is requested.

## Usage Workflow

When asked to write or publish a changelog:

1. **Determine the Version & Kind**:
   - `version`: e.g., `v1.4.0` (Semantic Versioning).
   - `kind`: `release` (major/minor releases), `feature` (new capability), `bug` (fix patch), or `security`.
   - `product`: The component or suite name (e.g. `Weavetab Core`, `Chrome Extension`, `MCP Server`, `CLI`).

2. **Structure the Sections**:
   Organize changes under clear headers:
   - `Added`: New tools, features, or UI elements.
   - `Changed`: Enhancements or updated behaviors.
   - `Fixed`: Bug fixes and stability improvements.
   - `Security`: Security hardening or token updates.

3. **Format Bullet Points**:
   - Use bold markdown for key terms: `**Feature Name**: Description of what was added.`
   - Use code backticks for commands and parameters: `submit_changelog`.

4. **Call `submit_changelog`**:
   Execute the tool with the structured parameters. The entry will immediately appear on the `/changelog` route.
