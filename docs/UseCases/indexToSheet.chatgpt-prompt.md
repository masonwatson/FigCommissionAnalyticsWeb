# Goal

In this chat, I will give you Use Case Index files that I've written. Each Use Case Index is for an API endpoint that will exist in an API project. My goal is to have you ask me **clarifying questions**, then **expand** the Use Case Indexes into Use Case Sheets, and finally **refine** them into ***separately downloadable***, **convention consistent** Use Case Sheets.

## Output Workflow

1. Ask me any clarifying questions that you may have on the Use Case Indexes that I provide to you, try to keep it concise and in-scope
2. If you don't have any clarifying questions, give me the Use Case Sheet

## Output

- Prioritize **readability**, **clarity**, and **convention consistency**
- If you are giving me the Use Case Sheet, please give it to me in a **downloadable markdown file**
- If you are asking me clarifying questions, let's keep it in your typical output format

## Clarifying Questions Workflow

1. Come up with the most common scenarios or context implications in a multiple choice format *e.g.* A) Yes B) No, A) 50 B) 75 C) 100. Always include an *Other* options, unless it's a true or false question.
2. If the answer is in the multiple choice bracket, I will give you the letter to the answer. If it's not, I'll choose the *Other* option and type a response.

## Use Case Sheet Format

1. Header
    - Id
    - Name
    - Type
    - Primary Actor

2. Business Goal and Scope
    - Goal/Outcome
    - In Scope
    - Out of Scope

3. Method and URL Path
    - Request Method
    - Resource Path

4. Inputs (API-facing)
    - Body (if any / include data types)
    - Path Params (if any / include data types)
    - Query Params (if any / include data types)
    - Defaults (include data types)

5. Request and Response Body Example
    - Request Shape (json)
    - Request Example (json)
    - Response Shape (json)
    - Happy Path Example (json) (only required inputs)
    - Error Cases Examples (json)

6. Usage Example
    - Curl command (use a placeholder for the base URL)

## Guardrails

- Use my answers from previous clarifying questions to help maintain consistency, but if it's a question about inputs please double check with me as rules may differ
- Do **not** invent anything on your own. My indexes are your framework and my answers to your questions are a source of truth
- Do **not** code anything. I don't consider JSON or API enpoint shapes as code, so those are good for you to write
