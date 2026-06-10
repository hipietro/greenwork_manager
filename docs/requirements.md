# Requirements

## Project Overview

GreenWork Manager is a lightweight management application for small gardening companies.

The application helps organize daily gardening jobs, manage clients and employees, assign equipment, and keep a simple operational history of completed and pending work.

The application does not handle invoices, employee salaries, hourly costs, payments or accounting data.

## Main User

The main user is the owner or operational manager of a small gardening company with around 10 employees.

## Core Principle

The application is designed specifically for gardening companies.

However, the main operational lists must be configurable by the user and must not be hardcoded in the source code.

Configurable lists include:

- job types;
- equipment;
- job statuses.

The application may provide initial default values related to gardening, but the user must be able to add, edit, disable or remove them.

## Employees

The user can:

- create an employee;
- edit employee information;
- deactivate an employee;
- view active and inactive employees.

Each employee has:

- full name;
- phone number;
- active status;
- notes.

The application does not manage employee roles, salaries or hourly costs.

## Clients

The user can:

- create a client;
- edit client information;
- deactivate a client;
- view the job history of a client.

Each client has:

- name;
- phone number;
- optional email;
- address;
- notes;
- active status.

Client notes can include practical information such as gate access, preferred contact time, pets in the garden or specific instructions.

## Gardening Jobs

The user can create and manage gardening jobs.

Each job has:

- client;
- title;
- address;
- scheduled date;
- optional scheduled start time;
- optional scheduled end time;
- job type selected from a configurable list;
- job status selected from a configurable list;
- assigned or used equipment;
- operational notes;
- final notes.

Job examples:

- lawn mowing;
- hedge trimming;
- pruning;
- garden maintenance;
- irrigation check;
- green area cleaning.

## Equipment

The user can manage a configurable list of equipment.

Each equipment item has:

- name;
- active status;
- notes.

Example default equipment:

- van;
- lawn mower;
- brush cutter;
- leaf blower;
- hedge trimmer;
- chainsaw;
- ladder;
- irrigation kit.

## Job Types

The user can manage a configurable list of job types.

Example default job types:

- ordinary garden maintenance;
- lawn mowing;
- pruning;
- hedge trimming;
- green area cleaning;
- irrigation check;
- lawn treatment;
- other.

## Job Statuses

The user can manage a configurable list of job statuses.

Example default statuses:

- scheduled;
- in progress;
- completed;
- to complete;
- postponed;
- cancelled;
- suspended due to rain.

## Dashboard

The dashboard shows a daily overview.

It should display:

- jobs scheduled for the selected day;
- completed jobs;
- postponed jobs;
- jobs without equipment assigned;
- job status summary.

## Reports and History

The user can consult:

- job history by client;
- jobs grouped by status;
- equipment usage history;
- jobs by period.

## CSV Export

The user can export:

- clients;
- employees;
- jobs;
- equipment usage.