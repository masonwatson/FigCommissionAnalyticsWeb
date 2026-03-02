# Use Case Sheet

------------------------------------------------------------------------

## 1. Header

-   **Id:** RPT-001\
-   **Name:** Get Financial Advisor Summary\
-   **Type:** Read-only Reporting Endpoint\
-   **Primary Actor:** Commissions Analyst

------------------------------------------------------------------------

## 2. Business Goal and Scope

### Goal / Outcome

Provide a high-level financial summary of all financial advisor's
commissions over a selectable date range, including total commission and
supporting context for reporting dashboards.

### In Scope

-   Retrieve total commission for all financial advisor within a date
    range
-   Support optional date filtering (defaults applied if omitted)
-   Provide globally selectable date bounds
-   Support optional sorting of total commission (default: descending)

### Out of Scope

-   Monthly breakdown (handled by RPT-002)
-   Carrier breakdown (handled by RPT-003)
-   Statement-level detail
-   Forecasting or predictive analytics

------------------------------------------------------------------------

## 3. Method and URL Path

-   **Request Method:** GET\
-   **Resource Path:** `/report/financialAdvisorSummary`

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
  startDate          string (ISO   No               Start date of
                     8601:                          reporting window
                     YYYY-MM-DD)                    

  endDate            string (ISO   No               End date of reporting
                     8601:                          window
                     YYYY-MM-DD)                    

  sort               string        No               Sorting direction for
                                                    total commission
                                                    (`asc` or `desc`)
  -----------------------------------------------------------------------

### Defaults

If not provided:

-   **startDate:** Past 12 months from today\
-   **endDate:** Current date\
-   **sort:** `desc` (total commission descending)\
-   **Date Bounds:** Global minimum and maximum selectable dates

------------------------------------------------------------------------

## 5. Request and Response Body Example

### Request Shape (JSON)

None (GET endpoint)

### Request Example

    GET /report/financialAdvisorSummary?startDate=2024-08-01&endDate=2025-08-31

------------------------------------------------------------------------

### Response Shape (JSON)

``` json
{
  "minStartDate": "string (YYYY-MM-DD)",
  "maxEndDate": "string (YYYY-MM-DD)",
  "agentSummaries": [
    {
      "agentId": "string",
      "agentName": "string",
      "averageMonthlyCommission": "number (int)",
      "totalCommission": "number (int)",
      "averageMonthlyStatementVolume": "number (decimal)",
      "statementVolume": "number (int)",
      "bestYearMonth": "string (YYYY-MM-DD)",
      "topCarrier": {
		"carrierId": "number (int)",
		"carrierName": "string"
	  }
    }
  ]
}

```

------------------------------------------------------------------------

### Happy Path Example (Only Required Inputs)

``` json
{
  "minStartDate": "2015-01-01",
  "maxEndDate": "2025-08-31",
  "agentSummaries": [
    {
      "agentId": 1,
      "agentName": "Ava Matthews",
      "averageMonthlyCommission": 253432,
      "totalCommission": 15234055,
      "averageMonthlyStatementVolume": 17.8,
      "statementVolume": 79,
      "bestYearMonth": "2026-01-01",
      "topCarrier": {
        "carrierId": "3",
        "carrierName": "Everlight"
      }
    },
    {
      "agentId": 3,
      "agentName": "Justin Williams",
      "averageMonthlyCommission": 197432,
      "totalCommission": 9834352,
      "averageMonthlyStatementVolume": 15.1,
      "statementVolume": 64,
      "bestYearMonth": "2025-05-01",
      "topCarrier": {
        "carrierId": "2",
        "carrierName": "Dream Scenario"
      }
    }
  ]
}
```

------------------------------------------------------------------------

### Error Case Examples

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
curl -X GET "{BASE_URL}/report/financialAdvisorSummary?startDate=2024-08-01&endDate=2025-08-31" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```
