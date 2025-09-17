# Framework Modernization Rubric

This rubric defines the checkpoints used to determine whether the VibeMe application meets an "up-to-date" framework and coding standard. Each category includes objective signals, acceptable thresholds, and guidance for remediation when the standard is not met.

## 1. Runtime & Framework Currency
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Primary runtime/framework is on the latest stable major release or within the most recent minor release cadence; release notes reviewed for breaking changes; no deprecated lifecycle APIs remain in use. |
| ⚠️ Needs Review | Runtime is one minor version behind or still references deprecated APIs slated for removal; upgrade path is understood and tracked. |
| ❌ Non-Compliant | Framework is ≥1 major version behind, depends on unsupported runtimes, or uses APIs removed in current releases. |

**Signals to check**: `package.json` versions, framework migration guides, presence of polyfills/shims for removed APIs.

## 2. Tooling & Build Pipeline
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Build tooling (bundler, transpiler, CSS pipeline) is current, reproducible, and automated via scripts/CI; no manual CDN tooling required. |
| ⚠️ Needs Review | Tooling is within one minor version but relies on manual steps, or key tools are duplicated/partially removed. |
| ❌ Non-Compliant | Toolchain mixes legacy/manual builds, missing scripts, or uses EOL tooling. |

**Signals to check**: Vite/Vitest versions, PostCSS/Tailwind integration, existence of lockfiles, automation coverage.

## 3. Dependency & Security Posture
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Direct dependencies have been audited within the last release cycle, lockfile is clean, and automated audit/test tasks exist. |
| ⚠️ Needs Review | Some dependencies lag behind or contain low severity advisories with mitigation planned. |
| ❌ Non-Compliant | Known high/critical vulnerabilities, missing audit tasks, or unpinned dependencies. |

**Signals to check**: `npm audit`, Dependabot reports, changelog review, presence of security scripts.

## 4. Application Architecture Alignment
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Application uses idiomatic patterns of the chosen framework (component-driven, store-based state, router integration) with minimal legacy shims. |
| ⚠️ Needs Review | Legacy subsystems remain but are isolated; migration plan documented. |
| ❌ Non-Compliant | Core flows rely on legacy DOM scripting or bypass framework conventions. |

**Signals to check**: Legacy scripts, DOM querying, duplicated UI layers, presence of framework-native routing/state.

## 5. Code Quality & Observability
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Linting, type-checking, automated tests, and monitoring hooks exist and run in CI; coverage targets defined. |
| ⚠️ Needs Review | Some automation exists but lacks breadth (e.g., missing linting or integration tests). |
| ❌ Non-Compliant | Manual verification only, no automated tests, or broken scripts. |

**Signals to check**: `npm run` scripts, CI config, vitest coverage, lint configuration, logging/metrics instrumentation.

## 6. Accessibility & Performance Guardrails
| Level | Criteria |
| --- | --- |
| ✅ Compliant | Framework-level features (SSR/SPA) expose accessible markup, Tailwind/theme tokens respect contrast guidelines, and performance budgets monitored. |
| ⚠️ Needs Review | Known gaps documented with remediation plan (e.g., missing focus traps). |
| ❌ Non-Compliant | Reliance on inaccessible legacy markup or uncontrolled asset delivery (e.g., large CDN bundles). |

**Signals to check**: Lighthouse budgets, a11y audits, CSS strategy, fallback markup.

---

# Self-Evaluation (Current State)

| Category | Status | Notes |
| --- | --- | --- |
| Runtime & Framework Currency | ⚠️ Needs Review | Svelte 5/Vite 7 are current, but manual SPA routing duplicates router capabilities; review after consolidating navigation. |
| Tooling & Build Pipeline | ✅ Compliant | Vite + Tailwind/PostCSS run locally; scripts cover build, test, preview. Need CI integration follow-up. |
| Dependency & Security Posture | ⚠️ Needs Review | Direct dependencies patched, but no automated audit script or Dependabot config yet; audit cadence manual. |
| Application Architecture Alignment | ⚠️ Needs Review | Core UI in Svelte but manual history routing and some stores duplicate logic; additional store/component refactors needed. |
| Code Quality & Observability | ⚠️ Needs Review | Type-check and tests exist; linting and coverage reporting absent; no CI workflow committed. |
| Accessibility & Performance Guardrails | ⚠️ Needs Review | Tailwind tokens improve contrast, but formal a11y/perf checks not automated; font loading uses Google CDN without local fallback. |

## Prioritized Follow-Up Tasks
1. Introduce automated linting (`eslint`, `prettier`, `eslint-plugin-svelte`) and wire into scripts/CI.
2. Adopt a router solution or upgrade to SvelteKit to remove manual history management and consolidate navigation.
3. Add security automation (`npm audit`, Dependabot config) and document release cadence.
4. Convert font loading to self-hosted or preloaded assets to reduce third-party reliance and improve performance.
5. Expand testing to include component/integration coverage, and add CI workflow for regression prevention.
6. Schedule accessibility/performance audits (Lighthouse/axe) and integrate findings into the design system.
