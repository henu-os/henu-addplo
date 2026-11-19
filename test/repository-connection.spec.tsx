import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RepositoriesPage from '@/app/repositories/page';
import { api } from '@/lib/api';

describe('GitHub Repositories Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders repository connections and allows triggering verification sync', async () => {
    jest.spyOn(api, 'listRepositories').mockResolvedValueOnce({
      data: [
        {
          id: 'repo-1',
          applicationId: 'app-1',
          provider: 'github',
          repoOwner: 'henu-os',
          repoName: 'henu-pa',
          githubInstallationId: 98765,
          targetBranch: 'main',
          assetPattern: '^henu-pa-.*',
          tagPattern: '^v.*',
          autoIngestReleases: true,
          autoPublishChannels: ['BETA'],
          isActive: true,
          createdAt: new Date().toISOString(),
          application: {
            slug: 'henu-pa',
            displayName: 'HENU Personal Assistant',
          },
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    });

    jest.spyOn(api, 'listApplications').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, page: 1, limit: 10 },
    });

    const syncSpy = jest.spyOn(api, 'syncRepository').mockResolvedValueOnce({
      success: true,
      message: 'Access verified with GitHub',
    });

    render(<RepositoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('henu-os/henu-pa')).toBeInTheDocument();
      expect(screen.getByText('HENU Personal Assistant')).toBeInTheDocument();
    });

    const verifyBtn = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledWith('repo-1');
    });
  });
});
