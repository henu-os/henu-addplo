import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReleaseDetailPage from '@/app/releases/[id]/page';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'rel-123' }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Release Management & Approval Gatekeeper', () => {
  const mockRelease: any = {
    id: 'rel-123',
    applicationId: 'app-1',
    channelId: 'ch-1',
    version: '1.0.0',
    semverMajor: 1,
    semverMinor: 0,
    semverPatch: 0,
    tagName: 'v1.0.0',
    gitCommitSha: 'abcdef1234567890',
    title: 'Initial Release',
    changelog: 'Changelog details',
    status: 'VALIDATED',
    isPrerelease: false,
    createdAt: new Date().toISOString(),
    application: {
      slug: 'henu-pa',
      displayName: 'HENU Personal Assistant',
    },
    channel: {
      id: 'ch-1',
      name: 'STABLE',
    },
    assets: [
      {
        id: 'asset-1',
        releaseId: 'rel-123',
        fileName: 'henu-pa-windows-x64.exe',
        downloadUrl: 'https://cdn.henuos.com/releases/henu-pa-windows-x64.exe',
        sizeBytes: 85400000,
        contentType: 'application/octet-stream',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        isInstallable: true,
        verificationStatus: 'VERIFIED',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders release details and allows approving validated release', async () => {
    jest.spyOn(api, 'getRelease').mockResolvedValue(mockRelease);
    const approveSpy = jest.spyOn(api, 'approveRelease').mockResolvedValueOnce({
      ...mockRelease,
      status: 'APPROVED',
    });

    render(<ReleaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/HENU Personal Assistant v1.0.0/i)).toBeInTheDocument();
      expect(screen.getByText('henu-pa-windows-x64.exe')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /approve release/i });
    fireEvent.click(approveBtn);

    // Confirmation modal should open
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to approve v1.0.0/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getAllByRole('button', { name: /approve release/i })[1];
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(approveSpy).toHaveBeenCalledWith('rel-123');
    });
  });

  it('allows promoting release to target channel', async () => {
    jest.spyOn(api, 'getRelease').mockResolvedValue({
      ...mockRelease,
      status: 'APPROVED',
    });

    const promoteSpy = jest.spyOn(api, 'promoteRelease').mockResolvedValueOnce({
      ...mockRelease,
      status: 'PUBLISHED',
    });

    render(<ReleaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /promote channel/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /promote channel/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /promote & publish/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /promote & publish/i }));

    await waitFor(() => {
      expect(promoteSpy).toHaveBeenCalledWith('rel-123', 'STABLE');
    });
  });
});
