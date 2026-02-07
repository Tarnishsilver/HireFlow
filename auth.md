# Authentication & Dynamic Permissions

This document explains the authentication architecture and how Google Workspace permissions are managed on demand.

## Architecture Overview

The application uses a two-tier authentication and authorization strategy:

1.  **Identity Authentication (Firebase Auth)**: Users sign in using their Google account to establish their identity. This step requests minimal permissions (profile and email) to keep the login process fast and low-friction.
2.  **Resource Authorization (Google Workspace)**: Specific permissions for Gmail and Calendar are requested only when needed (e.g., when an HR user wants to connect their workspace).

## Login Routes

| Route         | Description                                      | Auto-Role  | Redirect        |
|---------------|--------------------------------------------------|------------|-----------------|
| `/login`      | Generic login with manual role selection.        | -          | Based on role   |
| `/hrlogin`    | Dedicated login for HR professionals.            | `HR`       | `/dashboard`    |
| `/userlogin`  | Dedicated login for job seekers (candidates).    | `CANDIDATE`| `/jobopening`   |

## Authentication Flow

### 1. Initial Login
- **File**: `app/login/page.tsx`, `app/firebase.ts`
- **Scope**: Basic profile and email only.
- **Provider**: `googleProvider` initialized in `firebase.ts` without extra scopes.

### 2. Connect Google Workspace (On-Demand)
- **File**: `app/dashboard/page.tsx`
- **Action**: Triggered by "Connect Google Workspace" button.
- **Logic**: Creates a dynamic `workspaceProvider` with the following scopes:
    - `https://www.googleapis.com/auth/gmail.readonly`
    - `https://www.googleapis.com/auth/gmail.send`
    - `https://www.googleapis.com/auth/calendar`
- **Consent**: Uses `prompt: 'consent'` and `access_type: 'offline'` to ensure a refresh token is obtained for server-side operations.

## Data Caching

To ensure a smooth user experience and high performance, dashboard data is cached in the database.

### Implementation Details
- **Schema**: `User` model in `prisma/schema.prisma` includes a `cached_dashboard_data` JSON field.
- **Cache Strategy**:
    - **Initial Load**: The dashboard checks for cached data on mount using `getDashboardCache`.
    - **Fresh Fetch**: Fresh data is fetched from Google APIs while the cached data is displayed.
    - **Background Update**: Once fresh data is retrieved, `updateDashboardCache` is called to update the persistent storage.
- **UI Persistence**: By using cached data, the Calendar and Email panels are populated immediately, even before the user re-authenticates or before the fresh API calls complete.

## Security Considerations

- **Firebase Tokens**: Used for identity verification on the backend.
- **Google Access Tokens**: Handled securely in server actions (`app/actions.ts`).
- **Scopes**: Restricted to the minimum necessary for the specific functionality to comply with Google's security best practices.
