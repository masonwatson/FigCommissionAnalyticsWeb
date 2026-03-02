# RPT-003

## Name

Insurance Carrier Breakdown

## Type

Read-only reporting endpoint

## Actor

Commissions Analyst

## Purpose

Show how one financial advisor's commissions are distributed across carriers (totals + relative weight), with enough recency context to identify carrier relationships that have recently gone quiet.

## Endpoint

**GET** /report/insuranceCarrierBreakdown

## Path Parameters

- None

## Query Parameters

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
- agentId
- agentName
- agentCarrierBreakdowns[]
  - carrierId
  - carrierName
  - agentCarrierTotalCommission (total commission earnings for carrier in cents) *e.g. 250000*
  - agentCarrierRelativeWeight (percent of financial advisor's commission relative to their total commission) *e.g. 42.3*

### Error Response Shape

Error object with the following properties

- title (human readable error type) *e.g. Bad Request*
- status (HTTP status code)
- detail (human readable explanation of what made this error occur)
