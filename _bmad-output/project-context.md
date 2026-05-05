---
project_name: 'Rental House Management System'
user_name: 'ASUS'
date: '2026-04-17'
sections_completed: ['technology_stack', 'critical_rules']
existing_patterns_found: 8
---

# Project Context for AI Agents

_This file captures the critical project rules discovered from the current documentation. The implementation stack is not finalized yet, so AI agents must prioritize business-domain correctness and avoid inventing framework-specific assumptions._

---

## Technology Stack & Versions

- Project stage: business analysis and documentation
- Available sources: requirements document, BPMN workflow, ER data model
- Implementation stack: TBD by the team
- Important constraint: do not assume a specific framework, database engine, or deployment model unless it is explicitly chosen later

## Critical Implementation Rules

### Domain Model Rules

- One landlord can own multiple rental properties.
- Each rental property belongs to exactly one landlord.
- A contract links one tenant to one rental property.
- A property must be in Available status before a new contract can be created.
- When a contract becomes active, the property status must change to Occupied.
- When a contract ends or a tenant checks out, the property status must change back to Available.
- An invoice belongs to one contract and is generated on a monthly cycle.
- Invoice totals must include rent, electricity, and water charges.

### Business Workflow Rules

- Login is required before any management operation.
- Only available properties should be shown during tenant assignment and contract creation.
- Monthly billing flow must follow: meter input → calculation → invoice generation → notification → payment status update.
- Payment confirmation is recorded manually according to the documented workflow.
- The system should support reminders and debt tracking for unpaid invoices.
- Exception paths must account for early checkout and multi-period unpaid bills.

### Data Integrity Rules

- Use stable unique identifiers for Landlord, Property, Tenant, Contract, and Invoice.
- Prevent overlapping active contracts for the same property.
- Keep property status and contract status synchronized at all times.
- Preserve historical contract and invoice data for reporting and audit needs.
- Validate tenant and landlord identity/contact data before saving records.

### Search, Reporting, and Roles

- Search should support property, tenant, and contract lookup.
- Reporting should cover occupancy status, property counts, and payment or billing summaries.
- Admin has full permissions and must be protected by authorization checks.

### UX and Product Rules

- Prefer a simple, task-oriented interface for landlords or administrators.
- Prioritize fast search and correct financial calculations over decorative UI complexity.
- Use business terms consistently with the documentation: landlord, rental property, tenant, contract, invoice, payment status.

### Critical Don’t-Miss Rules

- Do not allow selection of an already occupied property for a new contract.
- Do not create an invoice unless a valid contract exists.
- Do not mark invoices as paid automatically without an explicit payment record.
- Do not change property status without a matching contract lifecycle update.
- Do not interpret the BPMN simplification about skipping occupancy checks as permission to skip backend validation; property availability must still be enforced in system logic.
