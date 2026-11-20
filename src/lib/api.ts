import {
  AdminUser,
  Application,
  AuditLog,
  CatalogueRevision,
  DashboardStats,
  LoginResponse,
  NotificationPolicy,
  PlatformCompatibility,
  Release,
  ReleaseChannel,
  RepositoryConnection,
  WebhookEvent,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail?: string,
    public errors?: Record<string, unknown> | string[],
  ) {
    let msg = detail || title || `HTTP Error ${status}`;
    if (errors) {
      if (Array.isArray(errors) && errors.length > 0) {
        msg = `${msg}: ${errors.join(', ')}`;
      } else if (typeof errors === 'object' && Object.keys(errors).length > 0) {
        const errorVals = Object.values(errors).flat();
        msg = `${msg}: ${errorVals.join(', ')}`;
      }
    }
    super(msg);
    this.name = "ApiError";
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("henu_access_token");
      this.refreshToken = localStorage.getItem("henu_refresh_token");
    }
  }

  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("henu_access_token", tokens.accessToken);
      localStorage.setItem("henu_refresh_token", tokens.refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("henu_access_token");
      localStorage.removeItem("henu_refresh_token");
      localStorage.removeItem("henu_user");
    }
  }

  getStoredUser(): AdminUser | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("henu_user");
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  setStoredUser(user: AdminUser) {
    if (typeof window !== "undefined") {
      localStorage.setItem("henu_user", JSON.stringify(user));
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    headers.set("Content-Type", "application/json");
    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token refresh on 401
    if (
      response.status === 401 &&
      this.refreshToken &&
      !endpoint.includes("/auth/")
    ) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers.set("Authorization", `Bearer ${this.accessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      let problem: any = {};
      try {
        problem = await response.json();
      } catch {
        // Fallback for non-JSON responses
      }
      throw new ApiError(
        response.status,
        problem.title || problem.error || "Request Failed",
        problem.detail || problem.message,
        problem.errors || problem.invalidParams,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const accessToken = data.tokens?.accessToken || data.accessToken;
        const refreshToken = data.tokens?.refreshToken || data.refreshToken;
        if (accessToken && refreshToken) {
          this.setTokens({ accessToken, refreshToken });
          return true;
        }
      }
    } catch {
      // Refresh failed
    }
    this.clearTokens();
    return false;
  }

  // --- Authentication ---
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const accessToken = data.tokens?.accessToken || data.accessToken;
    const refreshToken = data.tokens?.refreshToken || data.refreshToken;

    if (accessToken && refreshToken) {
      this.setTokens({ accessToken, refreshToken });
    }
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return {
      ...data,
      mfaToken: data.tempToken || data.mfaToken,
    };
  }

  async mfaVerify(mfaToken: string, code: string): Promise<LoginResponse> {
    const data = await this.request<any>("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ tempToken: mfaToken, code }),
    });

    const accessToken = data.tokens?.accessToken || data.accessToken;
    const refreshToken = data.tokens?.refreshToken || data.refreshToken;

    if (accessToken && refreshToken) {
      this.setTokens({ accessToken, refreshToken });
    }
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return {
      ...data,
      mfaToken: data.tempToken || data.mfaToken,
    };
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<AdminUser> {
    const user = await this.request<AdminUser>("/auth/me");
    this.setStoredUser(user);
    return user;
  }

  // --- Dashboard Overview ---
  async getDashboardOverview(): Promise<DashboardStats> {
    try {
      const [appsRes, releasesRes, webhooksRes, auditRes] = await Promise.all([
        this.listApplications({ limit: 100 }),
        this.listReleases({ limit: 10 }),
        this.listWebhooks({ status: "FAILED" as any, limit: 10 }),
        this.listAuditLogs({ limit: 8 }),
      ]);

      const pendingApprovals = releasesRes.data.filter(
        (r) => r.status === "VALIDATED",
      );
      const activeApps = appsRes.data.filter(
        (a) => a.status === "ACTIVE",
      ).length;

      let totalRepos = 0;
      try {
        const reposRes = await this.listRepositories({ limit: 1 });
        totalRepos = reposRes.meta.total;
      } catch {
        // Fallback
      }

      return {
        totalApps: appsRes.meta.total,
        activeApps,
        totalRepos,
        latestReleases: releasesRes.data.slice(0, 5),
        pendingApprovals,
        failedWebhooks: webhooksRes.data,
        recentAudit: auditRes.data,
      };
    } catch (err) {
      throw err;
    }
  }

  // --- Applications ---
  async listApplications(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
  ): Promise<{
    data: Application[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    return this.request(`/admin/apps?${query.toString()}`);
  }

  async getApplication(id: string): Promise<Application> {
    return this.request(`/admin/apps/${id}`);
  }

  async createApplication(payload: Partial<Application>): Promise<Application> {
    return this.request("/admin/apps", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateApplication(
    id: string,
    payload: Partial<Application>,
  ): Promise<Application> {
    return this.request(`/admin/apps/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    return this.request(`/admin/apps/${id}`, { method: "DELETE" });
  }

  async archiveApplication(id: string): Promise<Application> {
    return this.request(`/admin/apps/${id}/archive`, { method: "POST" });
  }

  // --- Repositories ---
  async listRepositories(
    params: {
      page?: number;
      limit?: number;
      applicationId?: string;
    } = {},
  ): Promise<{
    data: RepositoryConnection[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.applicationId) query.set("applicationId", params.applicationId);

    return this.request(`/admin/repositories?${query.toString()}`);
  }

  async createRepository(
    payload: Partial<RepositoryConnection>,
  ): Promise<RepositoryConnection> {
    return this.request("/admin/repositories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateRepository(
    id: string,
    payload: Partial<RepositoryConnection>,
  ): Promise<RepositoryConnection> {
    return this.request(`/admin/repositories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deleteRepository(id: string): Promise<void> {
    return this.request(`/admin/repositories/${id}`, { method: "DELETE" });
  }

  async syncRepository(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/repositories/${id}/sync`, { method: "POST" });
  }

  // --- Releases ---
  async listReleases(
    params: {
      page?: number;
      limit?: number;
      applicationId?: string;
      channelId?: string;
      status?: string;
    } = {},
  ): Promise<{
    data: Release[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.applicationId) query.set("applicationId", params.applicationId);
    if (params.channelId) query.set("channelId", params.channelId);
    if (params.status) query.set("status", params.status);

    return this.request(`/admin/releases?${query.toString()}`);
  }

  async getRelease(id: string): Promise<Release> {
    return this.request(`/admin/releases/${id}`);
  }

  async approveRelease(id: string): Promise<Release> {
    return this.request(`/admin/releases/${id}/approve`, { method: "POST" });
  }

  async promoteRelease(id: string, targetChannel: string): Promise<Release> {
    return this.request(`/admin/releases/${id}/promote`, {
      method: "POST",
      body: JSON.stringify({ targetChannel }),
    });
  }

  async revokeRelease(id: string, reason: string): Promise<Release> {
    return this.request(`/admin/releases/${id}/revoke`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // --- Channels ---
  async listChannels(): Promise<ReleaseChannel[]> {
    try {
      return await this.request("/admin/channels");
    } catch {
      // Fallback standard channels
      return [
        {
          id: "ch-stable",
          name: "STABLE",
          description: "Production stable channel",
          isDefault: true,
        },
        {
          id: "ch-beta",
          name: "BETA",
          description: "Preview beta channel",
          isDefault: false,
        },
        {
          id: "ch-nightly",
          name: "NIGHTLY",
          description: "Automated daily nightly builds",
          isDefault: false,
        },
      ];
    }
  }

  // --- Platform Compatibility ---
  async addCompatibility(
    appId: string,
    payload: Partial<PlatformCompatibility>,
  ): Promise<PlatformCompatibility> {
    return this.request(`/admin/apps/${appId}/compatibilities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteCompatibility(appId: string, compatId: string): Promise<void> {
    return this.request(`/admin/apps/${appId}/compatibilities/${compatId}`, {
      method: "DELETE",
    });
  }

  // --- Webhooks ---
  async listWebhooks(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      eventType?: string;
    } = {},
  ): Promise<{
    data: WebhookEvent[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.eventType) query.set("eventType", params.eventType);

    return this.request(`/admin/webhooks?${query.toString()}`);
  }

  async getWebhook(id: string): Promise<WebhookEvent> {
    return this.request(`/admin/webhooks/${id}`);
  }

  async replayWebhook(
    id: string,
  ): Promise<{ success: boolean; event: WebhookEvent }> {
    return this.request(`/admin/webhooks/${id}/replay`, { method: "POST" });
  }

  // --- Audit Logs ---
  async listAuditLogs(
    params: {
      page?: number;
      limit?: number;
      action?: string;
      entityType?: string;
    } = {},
  ): Promise<{
    data: AuditLog[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.action) query.set("action", params.action);
    if (params.entityType) query.set("entityType", params.entityType);

    return this.request(`/admin/audit?${query.toString()}`);
  }

  // --- Catalogue ---
  async getCataloguePreview(): Promise<any> {
    return this.request("/hub/catalogue");
  }

  async listCatalogueRevisions(): Promise<CatalogueRevision[]> {
    try {
      return await this.request("/admin/catalogue/revisions");
    } catch {
      return [];
    }
  }

  async publishCatalogueRevision(summary: string): Promise<CatalogueRevision> {
    return this.request("/admin/catalogue/publish", {
      method: "POST",
      body: JSON.stringify({ summary }),
    });
  }

  async rollbackCatalogue(
    targetRevisionNumber: number,
  ): Promise<{ success: boolean; revision: number }> {
    return this.request("/admin/catalogue/rollback", {
      method: "POST",
      body: JSON.stringify({ targetRevisionNumber }),
    });
  }

  // --- Users & Roles ---
  async listUsers(): Promise<AdminUser[]> {
    try {
      return await this.request("/admin/users");
    } catch {
      const current = this.getStoredUser();
      return current ? [current] : [];
    }
  }

  async listRoles(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
    }>
  > {
    try {
      return await this.request("/admin/roles");
    } catch {
      return [
        {
          id: "1",
          name: "SUPER_ADMIN",
          description: "Full ecosystem root administration",
          permissions: ["*"],
        },
        {
          id: "2",
          name: "ADMINISTRATOR",
          description: "Application and release administrator",
          permissions: ["apps:*", "releases:*", "repos:*"],
        },
        {
          id: "3",
          name: "RELEASE_MANAGER",
          description: "Can approve and promote releases to STABLE",
          permissions: ["releases:approve", "releases:promote"],
        },
        {
          id: "4",
          name: "OPERATOR",
          description: "Operational monitoring and webhook replay",
          permissions: ["webhooks:replay", "repos:sync"],
        },
        {
          id: "5",
          name: "AUDITOR",
          description: "Read-only access to audit trail and states",
          permissions: ["audit:read", "apps:read"],
        },
      ];
    }
  }

  // --- Notifications ---
  async listNotifications(): Promise<NotificationPolicy[]> {
    try {
      return await this.request("/admin/notifications");
    } catch {
      return [];
    }
  }

  async createNotification(
    payload: Partial<NotificationPolicy>,
  ): Promise<NotificationPolicy> {
    return this.request("/admin/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- System Settings & Health ---
  async getSystemHealth(): Promise<any> {
    return this.request("/health/ready");
  }
}

export const api = new ApiClient();
