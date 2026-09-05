## Purpose

Defines how every admin form behaves while a submission is in flight and once it resolves, so
that no successful write is silent and no form can be submitted twice by accident.

## ADDED Requirements

### Requirement: Submission shows a pending state
The system SHALL indicate that a submission is in progress from the moment a form is submitted
until the outcome is known, for every admin form action including creating, editing, and
deleting a restaurant, triggering a publish, and signing in.

#### Scenario: Pending state shown during submission
- **WHEN** an admin submits any admin form
- **THEN** the form indicates that the submission is in progress until the result is known

### Requirement: Submit controls are disabled while in flight
The system SHALL disable a form's submit controls while its submission is in progress, so that
repeated activation cannot produce duplicate writes or duplicate publish triggers.

#### Scenario: Repeated activation does not resubmit
- **WHEN** an admin activates a submit control repeatedly while a submission is already in progress
- **THEN** no additional submission is sent and only one write occurs

#### Scenario: Controls re-enabled after failure
- **WHEN** a submission fails
- **THEN** the form's controls are re-enabled and the admin's entered values are preserved so the submission can be corrected and retried

### Requirement: Successful writes are explicitly confirmed
The system SHALL confirm every successful write to the admin, rather than completing silently
or relying on the admin to navigate elsewhere to verify the outcome. Creating a restaurant
SHALL be confirmed in a modal dialog that takes focus and must be resolved before the admin
continues, so the outcome cannot be missed.

#### Scenario: Creating a restaurant is confirmed
- **WHEN** an admin successfully creates a restaurant
- **THEN** a modal confirmation dialog is presented, takes focus, and identifies the saved restaurant by name

#### Scenario: Editing a restaurant is confirmed
- **WHEN** an admin successfully saves changes to an existing restaurant
- **THEN** the admin is shown confirmation that the changes were saved

### Requirement: Creating a restaurant offers to add another
The system SHALL offer, within the confirmation dialog shown after a restaurant is
successfully created, a direct way to add another restaurant and a direct way to return to the
restaurant list, so that dismissing the confirmation does not strand the admin.

#### Scenario: Consecutive additions
- **WHEN** an admin chooses to add another restaurant from the creation confirmation dialog
- **THEN** the dialog closes and an empty add form is presented, retaining no values from the previous submission

#### Scenario: Returning to the list
- **WHEN** an admin chooses to return to the list from the creation confirmation dialog
- **THEN** the dialog closes and the restaurant list is shown, including the newly added restaurant

### Requirement: Forms function without client-side scripting
The system SHALL keep every admin form submittable when client-side scripting is unavailable,
with the enhanced pending and confirmation behaviour treated as an enhancement rather than a
requirement for the form to work.

#### Scenario: Submission without scripting
- **WHEN** an admin submits a form in an environment where client-side scripting is unavailable
- **THEN** the submission is processed and the resulting page reflects the outcome
