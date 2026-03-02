# RPT-001

## Name

Financial Advisor Summary

## Type

Read-only reporting endpoint

## Actor

Commissions Analyst

## Purpose

Provide an at-a-glance performance summary for all financial advisors.

## Endpoint

**GET** /report/financialAdvisorSummary

## Path Parameters

- None

## Query Parameters

- sort *e.g. sort=agentName+asc, sort=agentName+desc, etc.*
- startDate *e.g. startDate=2025-12-15*
- endDate *e.g. endDate=2026-02-04*

## Processing Rules

- startDate is normalized to the first day of that month *e.g. 2025-12-15 would be normalized to 2025-12-01*
- endDate is normalized to the first day of the next month *e.g. 2026-02-04 would be normalized to 2026-03-01*

## Responses

### OK Response Shape

Object with the following properties

- minStartDate (the earliest date that can be selected)
- maxEndDate (the last date that can be selected)
- agentSummaries[]
  - agentId
  - agentName
  - averageMonthlyCommission (the financial advisor's average commission earnings in cents) *e.g. 3200000*
  - totalCommission (total commission earnings in cents) *e.g. 3200000*
  - averageMonthlyStatementVolume (the financial advisor's average monthly number of statements) *e.g. 14.7*
  - statementVolume (count of insurance carrier statements) *e.g. 143*
  - bestYearMonth (largest commission month) *e.g. August 2025*
  - topCarrier (insurance carrier that provided the most in commission)
    - carrierId
    - carrierName *e.g. Progressive*

### Error Response Shape

Error object with the following properties

- title (human readable error type) *e.g. Bad Request*
- status (HTTP status code)
- detail (human readable explanation of what made this error occur)
