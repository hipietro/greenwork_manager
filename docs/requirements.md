# Requirements

## Project Goal

GreenWork Manager is designed for small gardening companies that need a lightweight tool to organize daily work, employees, equipment and attendance.

The application focuses on practical daily operations rather than accounting, invoicing or complex customer relationship management.

## Functional Requirements

### Dashboard

The application must provide a daily dashboard showing the jobs scheduled for a selected day.

The dashboard should display:

* total jobs for the selected day
* job status summary
* jobs without assigned equipment
* list of scheduled jobs

Multi-day jobs must be visible on every day between their start date and end date.

### Jobs

The application must allow the user to create, view, edit and delete gardening jobs.

Each job can include:

* title
* customer or location name
* address
* scheduled start date
* optional scheduled end date
* scheduled start time
* scheduled end time
* work type
* job status
* assigned equipment
* operational notes
* final notes

The customer is intentionally stored as free text inside the job. The project does not currently include a separate customer registry.

### Employees

The application must allow the user to manage employees.

Each employee can include:

* full name
* phone number
* notes
* active or inactive status

Inactive employees must remain available in the historical data but should not be used by default in new daily operations.

### Attendance

The application must allow the user to register daily attendance records for employees.

Each attendance record must include:

* date
* employee
* present or absent status
* check-in time
* check-out time
* notes

The system must prevent duplicate attendance records for the same employee on the same date.

### Equipment

The application must allow the user to manage gardening equipment.

Each equipment item can include:

* name
* notes
* active or inactive status

Equipment can be assigned to jobs.

### Work Types

The application must allow the user to configure the list of available work types.

Examples:

* lawn mowing
* hedge trimming
* pruning
* garden maintenance
* irrigation check

Work types must be editable and can be activated or deactivated.

### Job Statuses

The application must allow the user to configure job statuses.

Examples:

* scheduled
* in progress
* completed
* to be completed
* postponed
* cancelled
* suspended due to rain

Job statuses must be editable and can be activated or deactivated.

## Non-Functional Requirements

### Simplicity

The application should remain simple and practical for a small company.

### Configurability

Operational lists such as equipment, work types and job statuses should be configurable by the user.

### Data Persistence

Data must be stored in PostgreSQL.

### Maintainability

The project should use a clear folder structure, typed frontend and backend code, and a database schema managed through Prisma.

### Portfolio Quality

The repository should show a clean development history, readable documentation and a realistic full-stack architecture.

## Out of Scope for the Current Version

The current version does not include:

* invoicing
* estimates
* accounting
* complex customer management
* user authentication
* role-based permissions
* payroll calculations
* mobile app
* deployment configuration
