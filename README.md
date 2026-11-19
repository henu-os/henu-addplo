# HENU Admin Panel (`henu-addplo`)

The authoritative administrative control center for the HENU software ecosystem.

Built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **Tailwind CSS**, designed desktop-first with a professional HENU light theme (clean white surfaces, neutral slate backgrounds, signature HENU blue brand accents, and consistent typography).

---

## Features & Navigation (20 Dedicated Sections)

1. **Login & Multi-Factor Authentication (`/login`):** Operator login with Argon2id-backed session tokens and standard RFC 6238 TOTP MFA verification with single-use recovery code support.
2. **Ecosystem Dashboard (`/`):** Real-time operational metrics showing registered applications, connected repositories, latest releases, pending approvals, failed webhook events, and recent audit activity.
3. **Applications Management (`/apps`):** Dynamic catalog management with search, status filters, and confirmation modals for archiving or deleting applications.
4. **Add Application Workflow (`/apps/new`):** Comprehensive registration form configuring display name, slug, summary, Markdown description, icon/banner URLs, application type (`DESKTOP`, `WEB`, `CLI`, `HYBRID`), GitHub repository linkage, asset matching regex, platform compatibility matrix, and minimum HUB version.
5. **Application Details (`/apps/[id]`):** In-depth application inspector showing configured metadata, connected repositories with live access verification, platform profiles, and ingested releases.
6. **GitHub Repositories (`/repositories`):** Manage upstream GitHub repository connections, asset matching patterns, and trigger verification sync checks.
7. **Releases Management (`/releases`):** Inspect releases with status filters (`VALIDATED`, `APPROVED`, `PUBLISHED`, `REJECTED`, `REVOKED`) and channel filters.
8. **Release Details & Gatekeeper (`/releases/[id]`):** Complete release view displaying SemVer version, tag, commit SHA, changelog, verified binary assets with SHA-256 digests, and action controls for release approval, channel promotion (`STABLE`, `BETA`, `NIGHTLY`), and revocation.
9. **Release Channels (`/channels`):** Overview of ecosystem release tracks (`STABLE`, `BETA`, `NIGHTLY`) and their promotion policies.
10. **Platform Compatibility (`/compatibilities`):** Matrix of supported operating systems (`WINDOWS`, `MACOS`, `LINUX`), CPU architectures (`X86_64`, `ARM64`, `UNIVERSAL`), and installer formats.
11. **Catalogue Live Preview (`/catalogue/preview`):** View the exact public manifest structure delivered to HENU HUB Desktop clients via CDN.
12. **Catalogue Publishing (`/catalogue/publish`):** Sign and publish new immutable catalogue revision snapshots with pre-flight verification checks.
13. **Revision History (`/catalogue/revisions`):** Immutable archive of all published catalogue revisions, cryptographic content hashes, and publication timestamps.
14. **Catalogue Rollback (`/catalogue/rollback`):** Revert the active public catalogue pointer to any previous verified immutable revision without downtime.
15. **Admin Users (`/users`):** Manage administrative users, role assignments, and multi-factor authentication status.
16. **Roles and Permissions (`/roles`):** Backend-enforced RBAC matrix governing permissions for `SUPER_ADMIN`, `ADMINISTRATOR`, `RELEASE_MANAGER`, `OPERATOR`, and `AUDITOR`.
17. **Audit Logs (`/audit`):** Immutable, append-only security log recording every administrative mutation, release approval, and login attempt with JSON payload inspection.
18. **Webhook Events (`/webhooks`):** Ingress delivery history from GitHub, HMAC-SHA256 verification status, and one-click replay for failed events.
19. **Notification Policies (`/notifications`):** Server-Sent Events (SSE) and outbound webhook dispatch rules for client apps and administrators.
20. **System Settings & Health (`/settings`):** Real-time infrastructure diagnostics, health probes (`/health/ready`), and active cryptographic security parameters.

---

## Development Setup

### Prerequisites
- Node.js LTS (v20+ or v24+)
- npm
- Running instance of [`henu-platform-api`](../henu-platform-api) (default: `http://localhost:3000/api/v1`)

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set `NEXT_PUBLIC_API_URL` to point to your running HENU Platform API instance:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Provision Initial Administrator Account
Public administrator self-registration is permanently disabled. Provision the initial super-admin account through the Platform API CLI:
```bash
# Inside the henu-platform-api directory:
npm run seed:admin
```
Use the seeded credentials to log in at `http://localhost:3001/login`.

### 4. Run Development Server
```bash
npm run dev
```
The Admin Panel will be available at [http://localhost:3001](http://localhost:3001).

---

## Production Build & Verification

```bash
# Build optimized production bundle
npm run build

# Start production server on port 3001
npm run start

# Run unit and component test suite (Jest + React Testing Library)
npm test

# Run ESLint (enforcing zero warnings)
npm run lint

# Format code with Prettier
npm run format
```

---

## Architectural Rules Enforced
- **Real API Integration:** All metrics, applications, releases, webhooks, and audit logs are dynamically fetched from the HENU Platform API. No hardcoded or mock production data is used.
- **Security & Authorization:** Never exposes private GitHub credentials or private keys in client-side code. Backend authorization guards (`JwtAuthGuard`, `PermissionsGuard`) strictly govern every operation.
- **Safety Confirmations:** Destructive operations (app deletion, archiving, release revocation, and catalogue rollback) require explicit user confirmation through modal dialogs.
