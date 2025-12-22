# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Industrial Low-Power Sensor Node Network project.

## What is an ADR?

An Architecture Decision Record (ADR) captures important architectural decisions made during the project, along with their context and consequences.

## ADR Index

1. [ADR-001: Technology Stack Selection](./001-technology-stack-selection.md)
2. [ADR-002: Monorepo Structure](./002-monorepo-structure.md)
3. [ADR-003: BLE Protocol Design](./003-ble-protocol-design.md)
4. [ADR-004: Device Twin Schema](./004-device-twin-schema.md)
5. [ADR-005: Backend Framework (NestJS)](./005-backend-framework.md)
6. [ADR-006: Web Bluetooth API Usage](./006-web-bluetooth-api.md)
7. [ADR-007: Infrastructure as Code (Terraform)](./007-infrastructure-as-code.md)
8. [ADR-008: CI/CD with GitHub Actions](./008-cicd-github-actions.md)

## ADR Template

When creating a new ADR, use the following template:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the issue, concern, or problem being addressed]

## Decision
[Describe the decision and rationale]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Neutral
- [Side effect 1]

## Alternatives Considered
1. **[Alternative 1]**: [Why rejected]
2. **[Alternative 2]**: [Why rejected]

## References
- [Link to relevant documentation]
- [Related ADRs]
```

## Versioning

ADRs are immutable once accepted. If a decision needs to be changed, create a new ADR that supersedes the old one.
