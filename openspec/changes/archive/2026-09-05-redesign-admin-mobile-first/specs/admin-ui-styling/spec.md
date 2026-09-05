## ADDED Requirements

### Requirement: Button prominence reflects intent
The system SHALL assign each control's visual prominence according to its role on the screen —
primary, secondary, or destructive — independently of the markup used to implement it. A
control's prominence SHALL NOT be a side effect of whether it submits a form.

#### Scenario: Primary action is the most prominent control
- **WHEN** an admin views a screen with one primary action and one or more supporting actions
- **THEN** the primary action is the most visually prominent control on that screen, and supporting actions are visibly subordinate to it

#### Scenario: Supporting action does not dominate
- **WHEN** a screen offers a supporting action alongside its main content, such as searching a list
- **THEN** that supporting action is not the most visually prominent element on the screen

### Requirement: Destructive actions are visually distinct and not the default
The system SHALL style destructive actions distinctly from constructive ones, and SHALL
present the safe choice as the visually dominant option wherever a destructive action is
confirmed.

#### Scenario: Delete is distinguishable from save
- **WHEN** an admin views a screen offering both a save action and a delete action
- **THEN** the delete action is visually distinguished as destructive and is not styled identically to the save action

#### Scenario: Cancel dominates in a destructive confirmation
- **WHEN** an admin is asked to confirm deleting a restaurant
- **THEN** the cancelling option is the visually dominant choice and the confirming destructive option is visually subordinate to it

### Requirement: Notices are differentiated by severity
The system SHALL visually distinguish error notices, advisory notices, and confirmation
prompts from one another, so that an advisory notice is not presented with the same urgency as
a failure.

#### Scenario: Duplicate warning reads as advisory
- **WHEN** the add or edit form displays a possible-duplicate warning
- **THEN** the warning is presented as advisory and is visually distinct from an error notice

#### Scenario: Failure reads as an error
- **WHEN** a submission fails or a device location cannot be obtained
- **THEN** the notice is presented as an error, visually distinct from advisory notices

### Requirement: Error notices are announced assistively
The system SHALL announce error notices to assistive technology when they appear, and SHALL
reserve that announcement for errors rather than applying it to advisory text or static
confirmation prompts.

#### Scenario: Error is announced
- **WHEN** an error notice appears after a failed submission
- **THEN** the notice is announced to assistive technology as an alert

#### Scenario: Advisory text is not announced as an alert
- **WHEN** an advisory notice or a static confirmation prompt is displayed
- **THEN** it is not announced to assistive technology as an alert

### Requirement: Destructive confirmation is presented as a modal dialog
The system SHALL present confirmation of a destructive action in a modal dialog that takes
focus and must be resolved or dismissed, rather than as inline text appended to the page.

#### Scenario: Confirmation takes focus
- **WHEN** an admin initiates deleting a restaurant
- **THEN** a modal confirmation dialog is presented and receives focus

#### Scenario: Dismissing the dialog cancels the action
- **WHEN** an admin dismisses the confirmation dialog without confirming
- **THEN** the restaurant is not deleted and the admin is returned to the page unchanged
