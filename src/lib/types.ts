export enum SystemRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMINISTRATOR = "ADMINISTRATOR",
  RELEASE_MANAGER = "RELEASE_MANAGER",
  OPERATOR = "OPERATOR",
  AUDITOR = "AUDITOR",
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role:
    | {
        id: string;
        name: SystemRole;
        description?: string;
      }
    | SystemRole
    | string;
  isActive?: boolean;
  mfaEnabled: boolean;
  permissions?: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  mfaRequired?: boolean;
  mfaToken?: string;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  user?: AdminUser;
  tokens?: AuthTokens;
}

export type ApplicationType = "DESKTOP" | "WEB" | "HYBRID" | "CLI";
export type ApplicationStatus =
  "DRAFT" | "ACTIVE" | "MAINTENANCE" | "DEPRECATED" | "ARCHIVED";

export type OperatingSystem = "WINDOWS" | "MACOS" | "LINUX";
export type CpuArchitecture = "X86_64" | "ARM64" | "UNIVERSAL";
export type PackageFormat =
  "EXE" | "MSI" | "DMG" | "PKG" | "APPIMAGE" | "DEB" | "RPM" | "TAR_GZ" | "ZIP";

export interface PlatformCompatibility {
  id: string;
  applicationId: string;
  os: OperatingSystem;
  arch: CpuArchitecture;
  packageFormat: PackageFormat;
  minOsVersion?: string;
  maxOsVersion?: string;
  executableName?: string;
  installerArgs?: string[];
  isSupported: boolean;
}

export interface RepositoryConnection {
  id: string;
  applicationId: string;
  provider: string;
  repoOwner: string;
  repoName: string;
  githubInstallationId: number;
  targetBranch: string;
  assetPattern: string;
  tagPattern: string;
  autoIngestReleases: boolean;
  autoPublishChannels: string[];
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  application?: {
    slug: string;
    displayName: string;
  };
}

export interface Application {
  id: string;
  slug: string;
  displayName: string;
  appType: ApplicationType;
  category: string;
  summary: string;
  description: string;
  iconUrl: string;
  bannerUrl?: string;
  status: ApplicationStatus;
  visibility: "PUBLIC" | "UNLISTED";
  minHubVersion: string;
  featured: boolean;
  sortOrder: number;
  webAppUrl?: string;
  homepageUrl?: string;
  docsUrl?: string;
  dependencies?: {
    osDependencies?: string[];
    henuDependencies?: Array<{ id: string; minVersion?: string }>;
  };
  compatibilities?: PlatformCompatibility[];
  connections?: RepositoryConnection[];
  releases?: Release[];
  createdAt: string;
  updatedAt: string;
}

export type ReleaseStatus =
  | "DISCOVERED"
  | "VALIDATING"
  | "VALIDATED"
  | "REJECTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REVOKED";

export interface ReleaseAsset {
  id: string;
  releaseId: string;
  platformCompatibilityId?: string;
  fileName: string;
  downloadUrl: string;
  sizeBytes: number;
  contentType: string;
  sha256: string;
  signatureUrl?: string;
  signatureType?: string;
  isSignatureVerified: boolean;
  isInstallable: boolean;
  verificationStatus: string;
  verificationError?: string;
  createdAt: string;
}

export interface Release {
  id: string;
  applicationId: string;
  repositoryConnectionId?: string;
  channelId: string;
  version: string;
  semverMajor: number;
  semverMinor: number;
  semverPatch: number;
  semverPrerelease?: string;
  tagName: string;
  gitCommitSha: string;
  title: string;
  changelog: string;
  githubReleaseId?: number;
  githubPublishedAt?: string;
  publishedAt?: string;
  isPrerelease: boolean;
  status: ReleaseStatus;
  rejectionReason?: string;
  revocationReason?: string;
  application?: {
    slug: string;
    displayName: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  assets?: ReleaseAsset[];
  createdAt: string;
}

export interface ReleaseChannel {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  releasesCount?: number;
}

export type WebhookStatus =
  "RECEIVED" | "PROCESSING" | "PROCESSED" | "IGNORED" | "FAILED";

export interface WebhookEvent {
  id: string;
  deliveryId: string;
  eventType: string;
  repositoryConnectionId?: string;
  status: WebhookStatus;
  attemptCount: number;
  lastError?: string;
  payload: Record<string, unknown>;
  processedAt?: string;
  createdAt: string;
  repositoryConnection?: {
    repoOwner: string;
    repoName: string;
    application?: {
      slug: string;
      displayName: string;
    };
  };
}

export interface AuditLog {
  id: string;
  adminUserId?: string;
  actorEmail: string;
  ipAddress: string;
  userAgent?: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface CatalogueRevision {
  id: string;
  revisionNumber: number;
  contentHash: string;
  applicationCount: number;
  releaseCount: number;
  summary: string;
  isActive: boolean;
  publishedAt: string;
  publishedBy?: {
    fullName: string;
    email: string;
  };
}

export interface NotificationPolicy {
  id: string;
  applicationId?: string;
  eventTrigger: string;
  channel: "SSE_HUB" | "SSE_ADMIN" | "EMAIL" | "WEBHOOK_OUTBOUND";
  targetDestination?: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalApps: number;
  activeApps: number;
  totalRepos: number;
  latestReleases: Release[];
  pendingApprovals: Release[];
  failedWebhooks: WebhookEvent[];
  activeRevision?: CatalogueRevision;
  recentAudit: AuditLog[];
}
