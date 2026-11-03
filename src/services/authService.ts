import type { TokenPair, UserProfile } from '@/@types/api';
import { apiRequest, tokenStorage } from '@/services/api';

export const authService = {
  async signup(email: string, password: string): Promise<{ message: string }> {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
  },

  async login(email: string, password: string): Promise<TokenPair> {
    const tokens = await apiRequest<TokenPair>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    tokenStorage.setTokens(tokens);
    return tokens;
  },

  async confirmEmail(token: string): Promise<{ message: string }> {
    return apiRequest('/auth/email-verification/confirm', {
      method: 'POST',
      body: { token },
      skipAuth: true,
    });
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return apiRequest('/auth/email-verification/resend', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    });
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiRequest('/auth/password-reset/request', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    });
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    return apiRequest('/auth/password-reset/confirm', {
      method: 'POST',
      body: { token, new_password: newPassword },
      skipAuth: true,
    });
  },

  async getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refresh_token: refreshToken },
          skipAuth: true,
        });
      }
    } finally {
      tokenStorage.clear();
    }
  },
};

