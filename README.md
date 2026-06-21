# GreenWork Manager

## Live Demo

The application is currently deployed online and available at:

https://greenwork-manager.onrender.com

The project is deployed as a single-service full-stack application:

* the React frontend is built with Vite
* the Express backend serves the production frontend build
* the API is protected with JWT authentication
* the PostgreSQL database is hosted on Neon
* the web service is hosted on Render

Access is protected by an admin login.


GreenWork Manager is a lightweight management application designed for small gardening companies.

The goal of the project is to help organize daily gardening jobs, manage clients and employees, track equipment usage, and keep an operational history of completed and pending work.

The application is tailored to gardening activities, but keeps the main operational lists configurable, such as job types, equipment and job statuses.

## Project Status

This project is currently in the early development phase.

## Main Features Planned

* Daily job dashboard
* Client management
* Employee management
* Gardening job management
* Equipment assignment to jobs
* Configurable job types
* Configurable equipment list
* Configurable job statuses
* Job history and basic reports
* CSV export

## Tech Stack

Planned stack:

* React
* TypeScript
* Vite
* Node.js
* Express
* PostgreSQL
* Prisma

## Repository Structure

```text
greenwork-manager/
├── backend/
├── frontend/
├── docs/
│   ├── requirements.md
│   └── roadmap.md
└── README.md
```

## Goal

This project is intended as both a practical tool for a small gardening company and a portfolio project to demonstrate full-stack development skills, project organization, database design and clean documentation.
