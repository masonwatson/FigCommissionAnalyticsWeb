# Use Case Sheet

------------------------------------------------------------------------

## 1. Header

-   **Id:** RPT-003\
-   **Name:** Insurance Carrier Breakdown\
-   **Type:** Read-only Reporting Endpoint\
-   **Primary Actor:** Commissions Analyst

------------------------------------------------------------------------

## 2. Business Goal and Scope

### Goal / Outcome

Show how one financial advisor's commissions are distributed across
insurance carriers (totals + relative weight), with enough recency
context to identify carrier relationships that have recently gone quiet.

### In Scope

-   Return carrier-level commission totals for a single agent over a
    selected date range
-   Compute each carrier's relative weight as a percent of the **overall
    aggregated total commission across all agents** for the same date
    range
-   Default agent selection to the "average user" if an agent is not
    provided
-   Default date range window if omitted
-   Provide per-carrier "last statement month with commission \> 0"
    context
-   Sort carrier breakdowns by relative weight (descending)

### Out of Scope

-   Monthly trend charting (handled by RPT-002)
-   Statement-level line items
-   Policy-level details
-   Forecasting or predictive analytics
-   Cross-agent ranking/leaderboards

------------------------------------------------------------------------

## 3. Method and URL Path

-   **Request Method:** GET\
-   **Resource Path:** `/report/insuranceCarrierBreakdown`

------------------------------------------------------------------------

## 4. Inputs (API-Facing)

### Body

None

### Path Params

None

### Query Params

  -----------------------------------------------------------------------
  Name               Type          Required         Description
  ------------------ ------------- ---------------- ---------------------
  agentId            string        No               Target financial
                                                    advisor to analyze.
                                                    If omitted, defaults
                                                    to the "average
                                                    user".

  startDate          string (ISO   No               Start date of
                     8601:                          reporting window
                     YYYY-MM-DD)                    

  endDate            string (ISO   No               End date of reporting
                     8601:                          window
                     YYYY-MM-DD)                    
  -----------------------------------------------------------------------

### Defaults

If not provided:

-   **agentId:** Defaults to the "average user"\
-   **startDate:** First day of the month, 13 months prior to the
    current month\
-   **endDate:** Current date\
-   **Sort:** `agentCarrierRelativeWeight` descending\
-   **Date Bounds:** Agent-specific minimum and maximum selectable dates

------------------------------------------------------------------------

## 5. Request and Response Body Example

### Request Shape (JSON)

None (GET endpoint)

### Request Example

    GET /report/insuranceCarrierBreakdown?agentId=agent_123&startDate=2024-03-01&endDate=2025-03-15

------------------------------------------------------------------------

### Response Shape (JSON)

``` json
{
  "agentId": "string",
  "agentName": "string",
  "minStartDate": "string (YYYY-MM-DD)",
  "maxEndDate": "string (YYYY-MM-DD)",
  "agentCarrierBreakdowns": [
    {
      "carrierId": "string",
      "carrierName": "string",
      "agentCarrierTotalCommission": "number (int)",
      "agentCarrierRelativeWeight": "number (decimal)",
    }
  ]
}
```

------------------------------------------------------------------------

### Happy Path Example (Only Required Inputs)

> Note: Example values are illustrative. Months with no commission for a
> carrier should still allow a `lastStatementMonthWithCommission` value
> to reflect the last month in-range with commission \> 0 (or be
> omitted/null if never \> 0 in-range; see error/edge examples below).

``` json
{
  "agentId": "4",
  "agentName": "Taylor Reynolds",
  "startDate": "2024-03-01",
  "endDate": "2025-03-15",
  "minStartDate": "2019-01-01",
  "maxEndDate": "2025-03-15",
  "agentCarrierBreakdowns": [
    {
      "carrierId": "1",
      "carrierName": "Acme Life",
      "agentCarrierTotalCommission": 4025055,
      "agentCarrierRelativeWeight": 0.185,
    },
    {
      "carrierId": "3",
      "carrierName": "Northwind Insurance",
      "agentCarrierTotalCommission": 2250000,
      "agentCarrierRelativeWeight": 0.104,
    }
  ]
}
```

#### No Carrier Activity In Range (200)

``` json
{
  "agentId": "agent_123",
  "agentName": "Taylor Advisor",
  "startDate": "2024-03-01",
  "endDate": "2025-03-15",
  "minStartDate": "2019-01-01",
  "maxEndDate": "2025-03-15",
  "agentCarrierBreakdowns": []
}
```

------------------------------------------------------------------------

### Error Case Examples

#### Agent Not Found (404)

``` json
{
  "status": 404,
  "error": "AgentNotFound",
  "message": "The requested agent does not exist."
}
```

#### Invalid Date Range (400)

``` json
{
  "status": 400,
  "error": "InvalidDateRange",
  "message": "startDate must be before or equal to endDate."
}
```

------------------------------------------------------------------------

## 6. Usage Example

``` bash
curl -X GET "{{BASE_URL}}/report/insuranceCarrierBreakdown?agentId=agent_123&startDate=2024-03-01&endDate=2025-03-15" \
  -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
  -H "Content-Type: application/json"
```
