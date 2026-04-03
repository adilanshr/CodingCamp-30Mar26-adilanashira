# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that helps users track daily spending. It provides a real-time view of total balance, a scrollable transaction history, and a pie chart visualizing spending by category. The app runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with data persisted via the browser's Local Storage API. No backend or build tooling is required.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single spending record consisting of an item name, a monetary amount, and a category.
- **Category**: A classification label for a transaction. Valid values are: Food, Transport, Fun.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Balance_Display**: The UI component at the top of the page that shows the computed total balance.
- **Chart**: The pie chart UI component that visualizes spending distribution by category.
- **Input_Form**: The UI form component used to enter new transactions.
- **Storage**: The browser's Local Storage API used to persist transaction data client-side.
- **Validator**: The client-side logic responsible for validating Input_Form field values before submission.

---

## Technical Constraints

### TC-1: Technology Stack

1. THE App SHALL be built using only HTML, CSS, and Vanilla JavaScript (no frameworks such as React or Vue).
2. THE App SHALL require no backend server.

### TC-2: Data Storage

1. THE Storage SHALL persist all transaction data client-side using the browser's Local Storage API.
2. THE App SHALL store no data on any remote server.

### TC-3: Browser Compatibility

1. THE App SHALL function correctly in modern versions of Chrome, Firefox, Edge, and Safari.
2. THE App SHALL be usable as a standalone web page or as a browser extension.

### TC-4: File Structure

1. THE App SHALL contain exactly one CSS file located inside the `css/` directory.
2. THE App SHALL contain exactly one JavaScript file located inside the `js/` directory.

---

## Non-Functional Requirements

### NFR-1: Simplicity

1. THE App SHALL present a clean, minimal interface that requires no complex setup to use.

### NFR-2: Performance

1. THE App SHALL load and render all UI components without noticeable lag on a modern mobile device.
2. WHEN a transaction is added or deleted, THE App SHALL update the Balance_Display, Transaction_List, and Chart within 100ms.

### NFR-3: Visual Design

1. THE App SHALL apply a clear visual hierarchy with readable typography suitable for mobile screen sizes.

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to enter a transaction using a form, so that I can record my spending quickly.

#### Acceptance Criteria

1. THE Input_Form SHALL include a text field for item name, a numeric field for amount, and a dropdown selector for category (Food, Transport, Fun).
2. WHEN the user submits the Input_Form with all fields filled and a valid positive amount, THE App SHALL add the transaction to the Transaction_List and persist it via Storage.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name is non-empty, the amount is a positive number, and a category is selected.
4. IF the Validator detects that any required field is empty or the amount is not a positive number, THEN THE Input_Form SHALL display an inline error message identifying the invalid field(s) and SHALL NOT add the transaction.
5. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty/unselected state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded transactions in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored transactions in reverse-chronological order (most recent first).
2. THE Transaction_List SHALL display the item name, amount (formatted as currency), and category for each transaction.
3. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
4. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List and from Storage.
5. WHEN Storage contains no transactions, THE Transaction_List SHALL display an empty-state message indicating no transactions have been recorded.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts formatted as currency.
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
4. WHEN Storage contains no transactions, THE Balance_Display SHALL display a value of zero formatted as currency.

---

### Requirement 4: Visual Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Chart SHALL render as a pie chart displaying the proportional spending for each category (Food, Transport, Fun).
2. WHEN a transaction is added or deleted, THE Chart SHALL update automatically to reflect the current category totals without requiring a page reload.
3. WHERE a category has no transactions, THE Chart SHALL exclude that category from the pie chart display.
4. THE Chart SHALL include a legend or labels identifying each category and its corresponding color.
5. THE Chart SHALL be rendered using Chart.js or an equivalent lightweight chart library loaded via CDN.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I do not lose my spending history when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the App initializes, THE Storage SHALL load all previously saved transactions and render them in the Transaction_List, Balance_Display, and Chart.
2. WHEN a transaction is added or deleted, THE Storage SHALL immediately write the updated transaction list to Local Storage.
3. IF Local Storage is unavailable or returns a parse error, THEN THE App SHALL initialize with an empty transaction list and display a non-blocking warning message to the user.
