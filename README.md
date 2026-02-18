# str-test-demo-blazor

A lightweight STR execution demo to validate technician-led serviceability testing workflows prior to full CSAM backend integration.

Minimal Blazor Web App skeleton targeting .NET 8.

## Architecture Note

This demo uses a Blazor Web App (.NET 8) with Interactive Server rendering.

Rationale:
- Minimises client payload for tablet devices
- Keeps workflow logic server-side for auditability
- Simplifies future enterprise authentication integration
- Aligns with planned backend-driven STR automation and reporting

The MVP runs on an in-memory service layer and is intentionally
decoupled from the CSAM data model to allow rapid iteration of the
technician workflow prior to integration.

## Prerequisites

- .NET 8 SDK

## Run locally

```bash
dotnet restore
dotnet run
```
