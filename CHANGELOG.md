# Changelog

All notable changes are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The project has no tagged releases; version 1.0.1 is the current `package.json` version.

## [Unreleased]

### Fixed

- README: endpoint list, authentication header, tool descriptions and licence section brought in line with the code.

## [1.0.1] - 2026-01-28

### Added

- Authentication through `INTERNAL_SERVICE_SECRET` (`X-Internal-Service` header).
- Asynchronous embedding on save, background `memory_save` and per-call API timeouts.
- Info-level logging of `memory_search` calls.

### Changed

- Duplicate `configSchema` removed, `uiHints` added, versions synchronised.

### Fixed

- Defensive guards so undefined or non-array memory fields no longer break `.filter` / `.some`.
- Authentication header format corrected for the MemOS API.

## 2026-01-26

### Added

- First version of the MemOS memory plugin, written for Clawdbot and renamed to Moltbot on 2026-01-27.
