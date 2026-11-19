import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewApplicationPage from '@/app/apps/new/page';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Application Registration Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders application registration form with all required sections', () => {
    render(<NewApplicationPage />);

    expect(screen.getByText('1. Basic Information')).toBeInTheDocument();
    expect(screen.getByText('2. GitHub Repository Integration')).toBeInTheDocument();
    expect(screen.getByText('3. Supported Platform Matrix')).toBeInTheDocument();
    expect(screen.getByText('4. Status & Publication Policy')).toBeInTheDocument();
  });

  it('submits application creation and repository connection to Platform API', async () => {
    const createAppSpy = jest.spyOn(api, 'createApplication').mockResolvedValueOnce({
      id: 'new-app-123',
      slug: 'henu-record-management',
      displayName: 'HENU Record Management',
      appType: 'WEB',
      category: 'Data & Records',
      summary: 'Enterprise document tracking',
      description: 'Full markdown description',
      iconUrl: 'https://cdn.henuos.com/icons/records.svg',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      minHubVersion: '1.0.0',
      featured: false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const createRepoSpy = jest.spyOn(api, 'createRepository').mockResolvedValueOnce({
      id: 'repo-conn-1',
      applicationId: 'new-app-123',
      provider: 'github',
      repoOwner: 'henu-os',
      repoName: 'henu-record-management',
      githubInstallationId: 123456,
      targetBranch: 'main',
      assetPattern: '^henu-.*',
      tagPattern: '^v.*',
      autoIngestReleases: true,
      autoPublishChannels: ['BETA'],
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    const syncSpy = jest.spyOn(api, 'syncRepository').mockResolvedValueOnce({
      success: true,
      message: 'Access verified',
    });

    render(<NewApplicationPage />);

    fireEvent.change(screen.getByPlaceholderText('e.g. HENU Personal Assistant'), {
      target: { value: 'HENU Record Management' },
    });
    fireEvent.change(screen.getByPlaceholderText('One-line overview displayed in store listings'), {
      target: { value: 'Enterprise document tracking' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Detailed Markdown overview/i), {
      target: { value: 'Full markdown description' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://cdn.henuos.com/assets/icons/app.svg'), {
      target: { value: 'https://cdn.henuos.com/icons/records.svg' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /register application & connect repository/i }),
    );

    await waitFor(() => {
      expect(createAppSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'henu-record-management',
          displayName: 'HENU Record Management',
          summary: 'Enterprise document tracking',
        }),
      );
      expect(createRepoSpy).toHaveBeenCalled();
    });
  });
});
