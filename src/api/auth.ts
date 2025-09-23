interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

export class AuthManager {
  private static readonly ID_TOKEN_KEY = 'id_token';
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(tokens: AuthTokens): void {
    sessionStorage.setItem(this.ID_TOKEN_KEY, tokens.idToken);
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  static getIdToken(): string | null {
    return sessionStorage.getItem(this.ID_TOKEN_KEY);
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static clearTokens(): void {
    sessionStorage.removeItem(this.ID_TOKEN_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getIdToken();
  }
}