# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page, client-side web app using plain HTML, CSS, and Vanilla JavaScript. The implementation follows an MVC-lite pattern: a `transactions` array as the model, pure render functions as the view, and form/list event listeners as the controller. Chart.js is loaded via CDN. All data persists in Local Storage.

## Tasks

- [x] 1. Scaffold project files and HTML structure
  - Create `index.html` with semantic markup: balance display (`#balance`), input form (`#expense-form`), transaction list (`#transaction-list`), and chart canvas (`#chart`)
  - Add Chart.js CDN `<script>` tag and link `css/style.css` and `js/app.js`
  - Create `css/style.css` with mobile-first base styles, readable typography, and layout for all components
  - Create `js/app.js` as an empty module-level script with a `transactions` array and `chartInstance` variable
  - _Requirements: TC-1, TC-4, NFR-1, NFR-3_

- [ ] 2. Implement the Storage layer
  - [x] 2.1 Implement `loadTransactions()`, `saveTransactions()`, `addTransaction()`, and `deleteTransaction()` in `js/app.js`
    - `loadTransactions` reads `localStorage["transactions"]`, wraps JSON.parse in try/catch, returns `[]` on error or absence, and shows a non-blocking warning banner on failure
    - `addTransaction` generates an id via `crypto.randomUUID()` with fallback to `Date.now().toString() + Math.random()`, sets `createdAt` to `Date.now()`, pushes to the array, and calls `saveTransactions`
    - `deleteTransaction` filters the array by id and calls `saveTransactions`
    - _Requirements: 2.4, 5.1, 5.2, 5.3, TC-2_

  - [ ]* 2.2 Write property test for storage round-trip (Property 9)
    - **Property 9: Storage round-trip preserves transactions**
    - **Validates: Requirements 5.1**

  - [ ]* 2.3 Write property test for loadTransactions on parse error (Property 10)
    - **Property 10: loadTransactions returns empty array on parse error**
    - **Validates: Requirements 5.3**

  - [ ]* 2.4 Write unit tests for Storage layer
    - `loadTransactions` with valid JSON → returns correct array
    - `loadTransactions` with corrupted JSON → returns `[]`
    - `loadTransactions` with missing key → returns `[]`
    - _Requirements: 5.1, 5.3_

- [ ] 3. Implement the Validator
  - [x] 3.1 Implement `validate(formData)` as a pure function returning `{ valid, errors }`
    - `itemName`: non-empty after trim
    - `amount`: parses to a finite number > 0
    - `category`: one of `["Food", "Transport", "Fun"]`
    - _Requirements: 1.3, 1.4_

  - [ ]* 3.2 Write property test for validator rejecting invalid inputs (Property 2)
    - **Property 2: Validator rejects all invalid inputs**
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 3.3 Write unit tests for Validator
    - All valid fields → `{ valid: true }`
    - Empty item name → error on `itemName`
    - Amount = 0 → error on `amount`
    - Amount = -5 → error on `amount`
    - No category selected → error on `category`
    - _Requirements: 1.3, 1.4_

- [ ] 4. Implement the Balance Display and Transaction List views
  - [x] 4.1 Implement `renderBalance(transactions)` in `js/app.js`
    - Sums all `amount` fields and sets `#balance` text content formatted as currency (e.g. `$0.00`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for balance equals sum of amounts (Property 7)
    - **Property 7: Balance equals the sum of all transaction amounts**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 4.3 Implement `renderList(transactions)` in `js/app.js`
    - Sorts by `createdAt` descending, replaces children of `#transaction-list`
    - Each row shows item name, currency-formatted amount, category, and a delete button with a `data-id` attribute
    - Empty state: single `<li>` with "No transactions recorded."
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 4.4 Write property test for reverse-chronological ordering (Property 4)
    - **Property 4: Transaction list is always in reverse-chronological order**
    - **Validates: Requirements 2.1**

  - [ ]* 4.5 Write property test for rendered row containing required fields (Property 5)
    - **Property 5: Each rendered transaction row contains required fields**
    - **Validates: Requirements 2.2**

  - [ ]* 4.6 Write unit tests for renderList
    - Empty array → empty-state message present in DOM
    - One transaction → item name, formatted amount, and category appear
    - _Requirements: 2.2, 2.5_

- [ ] 5. Implement the Pie Chart view
  - [x] 5.1 Implement `renderChart(transactions)` in `js/app.js`
    - Groups transactions by category, sums amounts, excludes zero-total categories
    - Destroys previous `chartInstance` before creating a new Chart.js pie chart on `#chart`
    - Uses colors: Food `#FF6384`, Transport `#36A2EB`, Fun `#FFCE56`
    - Falls back to a text message inside the canvas area if `window.Chart` is absent
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Write property test for chart data aggregation (Property 8)
    - **Property 8: Chart data aggregates by category and excludes zero-total categories**
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 5.3 Write unit tests for chart data logic
    - All three categories present → three entries
    - One category with zero total → that category excluded
    - _Requirements: 4.1, 4.3_

- [ ] 6. Implement the Input Form controller
  - [x] 6.1 Wire the form submit event listener in `js/app.js`
    - On submit: call `validate()`, display inline errors beneath offending fields if invalid, do not add transaction
    - If valid: call `addTransaction()`, reset all form fields, clear any displayed errors
    - After a successful add: call `renderBalance`, `renderList`, and `renderChart` with the updated array
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 6.2 Write property test for valid transaction add reflected in list and storage (Property 1)
    - **Property 1: Valid transaction add is reflected in list and storage**
    - **Validates: Requirements 1.2, 5.2**

  - [ ]* 6.3 Write property test for form reset after successful submission (Property 3)
    - **Property 3: Form resets after successful submission**
    - **Validates: Requirements 1.5**

- [ ] 7. Implement the delete controller and app initialization
  - [ ] 7.1 Wire the delete button click event on `#transaction-list` (event delegation)
    - On click of a delete button: call `deleteTransaction(id)`, then re-render balance, list, and chart
    - _Requirements: 2.4, 3.3, 4.2_

  - [ ]* 7.2 Write property test for delete removes transaction from list and storage (Property 6)
    - **Property 6: Delete removes transaction from list and storage**
    - **Validates: Requirements 2.4, 5.2**

  - [ ] 7.3 Implement app initialization on `DOMContentLoaded`
    - Call `loadTransactions()` to populate the in-memory array
    - Call `renderBalance`, `renderList`, and `renderChart` with the loaded data
    - _Requirements: 5.1, 5.3_

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Apply responsive mobile styles
  - Style the balance display, form fields, transaction list rows, and chart canvas for small screens
  - Ensure the transaction list is scrollable when content overflows
  - Apply visual hierarchy: balance prominent at top, form below, list and chart beneath
  - _Requirements: NFR-2, NFR-3, 2.3_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** (loaded via CDN or npm in a test environment), minimum 100 iterations each
- Each property test must include a comment: `// Feature: expense-budget-visualizer, Property N: <property text>`
- All state mutations must immediately persist to Local Storage and trigger a full re-render of balance, list, and chart
