import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { AuthProvider } from '@/context/AuthContext';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/login',
}));

describe('Admin Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with email and password fields', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    expect(screen.getByPlaceholderText('admin@henuos.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to console/i })).toBeInTheDocument();
  });

  it('submits valid credentials and triggers login API', async () => {
    const loginSpy = jest.spyOn(api, 'login').mockResolvedValueOnce({
      user: {
        id: 'user-1',
        email: 'admin@henuos.com',
        fullName: 'Principal Admin',
        role: { id: 'role-1', name: 'SUPER_ADMIN' as any },
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'access-jwt',
        refreshToken: 'refresh-jwt',
      },
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@henuos.com'), {
      target: { value: 'admin@henuos.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'CorrectPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in to console/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('admin@henuos.com', 'CorrectPassword123!');
    });
  });

  it('displays error banner when authentication fails', async () => {
    jest.spyOn(api, 'login').mockRejectedValueOnce(new Error('Invalid email or password'));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@henuos.com'), {
      target: { value: 'bad@henuos.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in to console/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('renders MFA prompt when mfaRequired is true', async () => {
    jest.spyOn(api, 'login').mockResolvedValueOnce({
      mfaRequired: true,
      mfaToken: 'temp-mfa-jwt-token',
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@henuos.com'), {
      target: { value: 'mfa@henuos.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'SecretPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in to console/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify mfa/i })).toBeInTheDocument();
    });
  });
});
