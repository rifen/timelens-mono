# Changelog

All notable changes to TimeScope will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Hover provider for integer durations
- Smart unit detection (seconds/ms/µs/ns)
- Configurable output format (compact/verbose/both)
- Context-aware hints via variable names
- Copy-to-clipboard on click

## [0.1.1] - 2025-08-28

### Added
- Expression parsing (`60 * 60 * 24` → `1 day`)
- `_S` suffix support (seconds)
- Confidence boosting for explicit unit words
- Comprehensive test suite (73 tests)
- Neovim lazy.nvim integration
- Root monorepo README

### Changed
- Updated VS Code extension to v0.1.1
- Updated READMEs with cross-references
- Improved unit detection heuristics

### Fixed
- `RETRY_DELAY_S` now correctly detects seconds
- Expression hover in VS Code provider

## [0.1.0] - 2025-08-27

### Added
- Initial release
- Duration detection with context clues
- Smart unit inference
- Multiple output formats
- VS Code hover provider
- Neovim bridge
- Core library on npm (`@rifen/timelens-core`)
