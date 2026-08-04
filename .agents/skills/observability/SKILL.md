---
name: observability
description: "Use when adding, reviewing, or debugging logs, metrics, traces, audit events, correlation IDs, lifecycle status, timestamps, retries, or error metadata in applications, services, workers, and shared clients. Make important operations traceable across process and service boundaries while preserving privacy, bounded payloads, stable event semantics, useful cardinality, and actionable failure context."
---

# Observability

Make important behavior understandable in development and diagnosable in production.

## Event Design

- Define stable event names and structured fields before adding log statements.
- Include correlation or request identifiers so a single operation can be followed across boundaries.
- Record lifecycle transitions, outcome, duration, retry count, and relevant dependency context when
  they are needed to explain behavior.
- Prefer structured events over concatenated strings and bounded values over arbitrary payload dumps.
- Keep event schemas versionable when consumers, dashboards, alerts, or audit records depend on them.

## Signals

- Use logs for contextual events and failures.
- Use metrics for count, rate, duration, saturation, and bounded categorical dimensions.
- Use traces for causality across service, database, queue, and external-client boundaries.
- Use audit events for significant user, permission, configuration, or data changes that require an
  accountable history.
- Add alerts only for actionable conditions with an understood response.

## Privacy and Reliability

- Never log passwords, tokens, credentials, private keys, raw authorization headers, or unnecessary
  sensitive payloads.
- Redact or hash identifiers when full values are not required for diagnosis.
- Bound message size, collection cardinality, and retry-related event volume.
- Preserve useful error type, operation, dependency, and safe failure context without exposing stack
  traces or internal details to end users.
- Do not let telemetry failures break the primary operation unless the event is an explicitly required
  audit record.

## Verification

- Test event names, required fields, redaction, correlation propagation, and failure behavior where
  observability is part of the contract.
- Confirm retries do not create unbounded duplicate noise.
- Verify timestamps and durations use a consistent representation.
- Review dashboards or alert queries affected by event changes before finalizing.
