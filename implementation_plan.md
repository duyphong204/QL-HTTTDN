# Implementation Plan - HTTTDN

## 1) Scope and Target Architecture

- Backend flow: Controller -> Service -> Prisma
- Frontend flow: Types -> API Services -> Zustand Store -> Page/Component
- Rule: Page does not call backend API directly; Page only talks to Store.

## 2) Gap Analysis From Current Database and Code

### ADMIN

Current status:
- User CRUD + role update: available.
- Product/Supplier management: available.
- Time-based reports: available (sales and warehouse report endpoints exist).

Gaps to close:
- Advanced search/filter/sort/pagination for User list: partially missing (implemented in this phase).
- Advanced search/filter/sort/pagination for Supplier list: partially missing (implemented in this phase).
- Product advanced sorting options in API/UI: missing.
- Admin UI truly separated by workspace mode (not only menu filtering): partially missing.

### EMPLOYEE

Current status:
- View/update own profile: available.
- Submit leave requests (sick, annual, maternity, resignation): available.
- View own salaries monthly/yearly + print screen: available.

Gaps to close:
- Printable annual payroll report template (A4 structured): missing.
- Payroll explanation breakdown by formula/policy per month: partial.

### HR MANAGER

Current status:
- Add/remove employee: available.
- Change role/position with timeline (job history): available.
- Salary calculation and updates: available.
- Leave approval workflow: available.
- HR monthly statistics: available.

Gaps to close:
- Yearly and custom range HR analytics endpoint: missing.
- Search/filter/sort/pagination for employee and leave lists at backend level: partial.

### WAREHOUSE MANAGER

Current status:
- Product CRUD: available.
- Stock-in creation: available.
- Supplier CRUD: available.
- Monthly/yearly warehouse report: available.

Gaps to close:
- Quarter-based warehouse report endpoint: missing.
- Full advanced product sorting/filter combinations in UI: partial.

### SALES MANAGER

Current status:
- Export slip (order) creation: available.
- Sales monthly report and period endpoint: available.

Gaps to close:
- Dedicated quarter/year compare dashboard widgets: partial.
- Page still calling API directly in some screens: missing store layer normalization.

## 3) Implemented in This Iteration

### Backend

- User list advanced query:
  - search by email/full name
  - filter by role/isActive
  - sort by createdAt/email/role
  - pagination with metadata

- Supplier list advanced query:
  - search by name/phone/email/address
  - sort by name/email/phone
  - pagination with metadata

### Frontend

- User management integrated with backend pagination/sorting metadata.
- Supplier management integrated with backend pagination/sorting metadata.
- Added sorting and pagination controls on admin screens.

## 4) Next Priority Backlog (Recommended)

### Priority A (must-do)

1. Move API calls out of pages to stores in:
   - warehouse reports/import slips
   - hr statistics/salary management
   - sales export/report
   - admin report

2. Add Product advanced query options:
   - sortBy: name, price, costPrice, stockQuantity, createdAt
   - sortOrder: asc/desc

3. Add Employee and Leave backend query DTOs:
   - search, status/department/role filters
   - sort and pagination metadata

### Priority B (should-do)

1. Add quarterly warehouse report endpoint and page filter.
2. Add yearly printable payroll template for employees.
3. Add admin audit log viewer (from SystemLog model).

### Priority C (nice-to-have)

1. Split role-specific layouts into separate root shells.
2. Add CSV/XLSX export for admin lists and reports.

## 5) Definition of Done

- No direct API imports in pages.
- All list APIs return { data, meta }.
- Store handles loading/error/toast and state sync after CRUD.
- Strict TypeScript without any in business modules.
- UI supports search/filter/sort/pagination consistently.
