# Shared foundation conventions

- Keep this repository framework- and runtime-independent; consumer page layout, business state, and platform adapters belong to their own repositories.
- Use the checked-in EditorConfig and Prettier settings for supported text files. Exclude generated token outputs and consumer Git submodules from formatting.
- Regenerate token outputs only with `node design-system/scripts/generate-tokens.mjs`; verify them with `node design-system/scripts/generate-tokens.mjs --check`.
- Keep validation proportional to behavior: test generator drift and public contracts, not static CSS/token snapshots or implementation details with no user-visible contract.
- Check the full diff and run `git diff --check` before delivery.
