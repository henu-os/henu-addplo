import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CataloguePublishPage from '@/app/catalogue/publish/page';
import { api } from '@/lib/api';

describe('Catalogue Publishing Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders publish form and submits summary to trigger revision creation', async () => {
    const publishSpy = jest.spyOn(api, 'publishCatalogueRevision').mockResolvedValueOnce({
      id: 'rev-1',
      revisionNumber: 2,
      contentHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
      applicationCount: 5,
      releaseCount: 12,
      summary: 'Promoted HENU PA v1.0.0',
      isActive: true,
      publishedAt: new Date().toISOString(),
    });

    render(<CataloguePublishPage />);

    expect(screen.getByText('Publish Catalogue Revision')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Published HENU PA v1.0.0/i);
    fireEvent.change(input, {
      target: { value: 'Promoted HENU PA v1.0.0' },
    });

    const submitBtn = screen.getByRole('button', { name: /sign & publish revision/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(publishSpy).toHaveBeenCalledWith('Promoted HENU PA v1.0.0');
      expect(screen.getByText(/Successfully published Catalogue Revision #2/i)).toBeInTheDocument();
    });
  });
});
