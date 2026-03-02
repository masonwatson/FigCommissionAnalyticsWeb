# Use Case Sheet

------------------------------------------------------------------------

## 1. Header

-   **Id:** RPT-002\
-   **Name:** Monthly Trend\
-   **Type:** Read-only Reporting Endpoint\
-   **Primary Actor:** Commissions Analyst

------------------------------------------------------------------------

## 2. Business Goal and Scope

### Goal / Outcome

Provide a normalized month-by-month commission trend for a single
financial advisor across a selected date range, including months with
zero commission activity.

### In Scope

-   Retrieve monthly commission totals for a single agent
-   Normalize results so all months in the requested range are returned
-   Include months with zero commission
-   Agent-specific selectable date bounds
-   Ascending chronological ordering (oldest → newest)

### Out of Scope

-   Carrier-level breakdown
-   Cross-agent comparisons
-   Forecasting or predictive analytics
-   Statement-level detail

------------------------------------------------------------------------

## 3. Method and URL Path

-   **Request Method:** GET\
-   **Resource Path:** `/report/monthlyTrend/{agentId}`

------------------------------------------------------------------------

## 4. Inputs (API-Facing)

### Body

None

### Path Params

  ------------------------------------------------------------------------
  Name              Type          Required          Description
  ----------------- ------------- ----------------- ----------------------
  agentId           string        Yes               Unique identifier of
                                                    the financial advisor

  ------------------------------------------------------------------------

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
  -----------------------------------------------------------------------

### Defaults

If `startDate` and `endDate` are omitted:

-   **startDate:** First day of the month, 13 months prior to current
    month\
-   **endDate:** Current date\
-   **Ordering:** Ascending by `yearMonth` (oldest → newest)\
-   **Date Bounds:** Agent-specific minimum and maximum available dates

------------------------------------------------------------------------

## 5. Request and Response Body Example

### Request Shape (JSON)

None (GET endpoint)

### Request Example

    GET /report/monthlyTrend/1?startDate=2024-08-01&endDate=2025-08-31

------------------------------------------------------------------------

### Response Shape (JSON)

``` json
{
  "agentId": "string",
  "minStartDate": "string (YYYY-MM-DD)",
  "maxEndDate": "string (YYYY-MM-DD)",
  "monthlyCommissions": [
    {
      "yearMonth": "string (MonthName YYYY)",
      "totalCommission": "number (int)"
    }
  ]
}
```

------------------------------------------------------------------------

### Happy Path Example (Only Required Inputs)

``` json
{
  "agentId": "2",
  "startDate": "2024-08-01",
  "endDate": "2025-08-31",
  "minStartDate": "2018-01-01",
  "maxEndDate": "2025-08-31",
  "monthlyCommissions": [
    {
      "yearMonth": "August 2024",
      "totalCommission": 1245075
    },
    {
      "yearMonth": "September 2024",
      "totalCommission": 0
    },
    {
      "yearMonth": "October 2024",
      "totalCommission": 982010
    }
  ]
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
curl -X GET "{BASE_URL}/report/monthlyTrend/1?startDate=2024-08-01&endDate=2025-08-31" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```
