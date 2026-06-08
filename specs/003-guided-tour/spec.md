# Feature Specification: Guided Tour

## Description
An interactive Guided Product Tour for new users to showcase the Smart City Dashboard's features. It will automatically run for first-time visitors (tracked via localStorage), cannot be skipped, and highlights all major features except practicing Edit and Delete. It includes a 'Tutorial' button in the Header to allow manual re-triggering.

## Functional Requirements
- The app must track if a user is new using `localStorage` (e.g., `hasCompletedTour`).
- If the user is new, a `react-joyride` guided tour must start automatically on the dashboard.
- The tour must not be skippable (`disableCloseOnEsc`, `disableOverlayClose`).
- The tour steps must highlight: Dashboard overview, Sidebar navigation, Global search, Table filtering/pagination, Add Asset button, and Spatial panel.
- The Add Asset step must explicitly mention that "Edit" and "Delete" actions are available in the table rows, without forcing the user to practice them.
- A "Tutorial" button must be present in the `Header` next to the Logout button. Clicking it must reset the `localStorage` flag and restart the tour.

## User Scenarios
- **Scenario 1**: A new user visits the dashboard. The tour starts automatically, forcing them to learn the UI steps sequentially.
- **Scenario 2**: A returning user visits the dashboard. No tour is shown. They click the "Tutorial" button in the header, and the tour restarts from step 1.

## Success Criteria
- Tour correctly identifies new vs. returning users.
- Tour cannot be skipped or closed arbitrarily by clicking outside.
- Tour correctly points to the intended UI elements.
- "Tutorial" button correctly restarts the tour.
