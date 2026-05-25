# Role-based access (School ERP)

Aligned with **SchoolmanagementNewAPI** `AppRoles` and `ModuleControllers` authorization.

## Login roles (JWT `roleID`)

| roleID | App role | Who |
|--------|----------|-----|
| 1 | `superadmin` | Platform / your team |
| 2 | `admin` | School administrator |
| 3 | `teacher` | Teaching staff |
| 4 | `parent` | Guardian |
| 5 | `student` | Student login |

Mapping: `roleFromRoleId()` in `src/constants/rolePermissions.ts`, used on login.

## What each role sees

### Super Admin & School Admin
- Full school operations: students, admission, classes, fees (**add/collect class-wise**), accounts, staff, parents, exams, masters, users, roles, broadcasts, inquiries.
- **Staff attendance register** (API: `TeacherAttendance` — admin only).
- **Push alerts** (`InsertNotification` — admin only).

### Teacher
- **Class attendance** — mark student presence (`InsertStudentAttendance`).
- **Students** — view list & profiles (read).
- **Exams** — schedules, enter marks (`InsertExam`, `InsertResult`).
- **Subjects** — view only (add/edit = admin).
- **Notices** — read + **post class/school notices** (`InsertNotice`).
- **Leave** — apply; view all applications (API allows teacher list).
- **Alerts** — inbox only (cannot send broadcast).
- **No access**: fees collection, money, parents CRUD, teachers CRUD, users, roles, masters, admission, staff attendance register, notification compose.

> **Staff self-attendance:** Backend marks `TeacherAttendance` as **admin-only**. Teachers use **Leave** for absence; admins use **Staff Attend.** screen.

### Parent / Guardian
- Dashboard, **fee statements** (read-only), notices, alerts, **child results**, timetable, leave apply, profile, change password.
- **No access**: student register, attendance marking, admin modules.

### Student
- Dashboard, notices, alerts, own results, fees (read), change password.

## API vs UI (fees example)

| Action | Backend | Admin | Teacher | Parent |
|--------|---------|-------|---------|--------|
| View fees | `GetFeesList` (all auth) | ✓ | ✓ | ✓ |
| Add / collect fees | `InsertFees` / `UpdateFees` (**AdminOnly**) | ✓ | ✗ | ✗ |

## Implementation files

- `src/constants/rolePermissions.ts` — routes, permissions, menus, mobile tabs
- `src/hooks/usePermissions.ts` — `can()`, `canManageFees`, etc.
- `src/components/auth/RouteGuard.tsx` — blocks deep links
- `src/components/auth/AccessDenied.tsx` — admin-only screens

## Regenerate API client

```bash
npm run generate:api
```
