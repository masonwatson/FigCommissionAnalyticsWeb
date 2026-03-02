# RPT-002

## Name

Monthly Trend

## Type

Read-only reporting endpoint

## Actor

Commissions Analyst

## Purpose

Provide month-by-month commission totals (integer cents) for a single financial advisor within a configurable window.

## Endpoint

**GET** /report/monthlyTrend/{agentId}

## Path Parameters

- agentId

## Query Parameters

- startDate *e.g. startDate=2025-12-15*
- endDate *e.g. endDate=2026-02-04*

## Processing Rules

- startDate is normalized to the first day of that month *e.g. 2025-12-15 would be normalized to 2025-12-01*
- endDate is normalized to the first day of the next month *e.g. 2026-02-04 would be normalized to 2026-03-01*

## Responses

### OK Response Shape

Object with the following properties

- agentId
- agentName
- minStartDate (the earliest date that can be selected)
- maxEndDate (the last date that can be selected)
- monthlyCommissions[]
  - yearMonth *e.g. August 2025*
  - totalCommission (total commission earning for that year's month in cents) *e.g. 250000*

### Error Response Shape

Error object with the following properties

- title (human readable error type) *e.g. Bad Request*
- status (HTTP status code)
- detail (human readable explanation of what made this error occur)
