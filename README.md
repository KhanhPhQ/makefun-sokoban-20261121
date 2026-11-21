# Sokoban room solver

Deterministic Node solver prepared for [make.fun’s Sokoban bounty](https://make.fun/bounty/sokoban-solver-01-run-20261121).

Run with Node 22: `node main.ts`. Inputs are read from `MAKEFUN_INPUT_DIR` (default `/input`); answers are written to `MAKEFUN_OUTPUT_DIR` (default `/output`), one `solution.txt` per instance. No packages or network access are required.

The solver decomposes the generated board into independent rooms and searches push states with dead-square pruning. Search is capped at 250,000 states per room; a harder instance can fail at this bound.

Local practice passed 5/5 cases with optimal pushes and deterministic output. This is not official final grading or a promise of a reward.

Provenance: a local model produced the initial draft; supervising Codex rewrote and tested the final solver. No third-party solver code is included. MIT licensed.
