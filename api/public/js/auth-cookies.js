// Universal authentication helper using cookies
class AuthCookies {
  // Cookie utilities
  static setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=lax`;
  }
  
  static getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
      if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
  }
  
  static deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  // Authentication methods
  static getToken() {
    return this.getCookie('authToken') || localStorage.getItem('authToken');
  }
  
  static setToken(token) {
    this.setCookie('authToken', token);
    // Also set in localStorage for backward compatibility during transition
    localStorage.setItem('authToken', token);
  }
  
  static removeToken() {
    this.deleteCookie('authToken');
    localStorage.removeItem('authToken');
  }
  
  static isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (_error) {
      return false;
    }
  }
  
  static getUserInfo() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
        expiresAt: new Date(payload.exp * 1000),
        issuedAt: new Date(payload.iat * 1000)
      };
    } catch (_error) {
      return null;
    }
  }
  
  // Fetch helper with automatic token injection
  static async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
      this.removeToken();
      window.location.reload();
    }
    
    return response;
  }
}

// Make it globally available
window.AuthCookies = AuthCookies;