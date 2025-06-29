/**
 * Secure Authentication System with Enhanced Security
 * Implements secure login with blockchain integration
 */

import { supabase } from "./supabaseClient";
import { initializeBlockchainSystem } from "./blockchainMemorySystem";
import { isAdmin, getAdminSubscriptionStatus } from "./adminConfig";

/**
 * Enhanced Authentication Manager
 */
class SecureAuthManager {
  constructor() {
    this.authState = {
      user: null,
      isAuthenticated: false,
      sessionToken: null,
      lastActivity: null,
      securityLevel: 'standard'
    };
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.securityChecks = new Map();
  }

  async authenticateUser(email, password) {
    const startTime = performance.now();
    
    try {
      // Enhanced security validation
      const securityCheck = await this.performSecurityCheck(email);
      if (!securityCheck.passed) {
        throw new Error(securityCheck.reason);
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) throw error;

      // Initialize user session
      await this.initializeSecureSession(data.user);
      
      // Initialize blockchain system
      await initializeBlockchainSystem();

      const authTime = performance.now() - startTime;
      
      return {
        success: true,
        user: data.user,
        sessionToken: data.session?.access_token,
        authenticationTime: authTime,
        securityLevel: this.determineSecurityLevel(data.user),
        isAdmin: isAdmin(data.user.email)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        authenticationTime: performance.now() - startTime
      };
    }
  }

  async registerUser(email, password, additionalData = {}) {
    const startTime = performance.now();
    
    try {
      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: additionalData
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, additionalData);
      }

      return {
        success: true,
        user: data.user,
        needsEmailConfirmation: !data.user?.email_confirmed_at,
        registrationTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        registrationTime: performance.now() - startTime
      };
    }
  }

  async initializeSecureSession(user) {
    this.authState = {
      user,
      isAuthenticated: true,
      sessionToken: crypto.randomUUID(),
      lastActivity: Date.now(),
      securityLevel: this.determineSecurityLevel(user)
    };

    // Set up session monitoring
    this.startSessionMonitoring();
    
    // Log security event
    await this.logSecurityEvent('session_initialized', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });
  }

  async performSecurityCheck(email) {
    const checks = {
      rateLimiting: this.checkRateLimit(email),
      suspiciousActivity: this.checkSuspiciousActivity(email),
      accountStatus: await this.checkAccountStatus(email)
    };

    const failedChecks = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    return {
      passed: failedChecks.length === 0,
      reason: failedChecks.length > 0 ? `Security check failed: ${failedChecks.join(', ')}` : null,
      checks
    };
  }

  checkRateLimit(email) {
    const key = `rate_limit_${email}`;
    const attempts = this.securityChecks.get(key) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000); // 15 minutes

    if (recentAttempts.length >= 5) {
      return false;
    }

    recentAttempts.push(now);
    this.securityChecks.set(key, recentAttempts);
    return true;
  }

  checkSuspiciousActivity(email) {
    // Implement suspicious activity detection
    // For now, always return true
    return true;
  }

  async checkAccountStatus(email) {
    try {
      // Check if account exists and is active
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      return !error; // Account exists if no error
    } catch {
      return true; // Allow if profile doesn't exist yet
    }
  }

  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!hasNumbers) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true, message: 'Password meets security requirements' };
  }

  determineSecurityLevel(user) {
    if (isAdmin(user.email)) {
      return 'admin';
    }
    
    // Determine based on user activity, subscription, etc.
    return 'standard';
  }

  async createUserProfile(user, additionalData) {
    try {
      const profileData = {
        user_id: user.id,
        email: user.email,
        username: additionalData.username || user.email.split('@')[0],
        full_name: additionalData.full_name || '',
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        settings: {
          security_level: 'standard',
          two_factor_enabled: false
        },
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .insert([profileData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  startSessionMonitoring() {
    // Monitor session activity
    setInterval(() => {
      if (this.authState.isAuthenticated) {
        const timeSinceActivity = Date.now() - this.authState.lastActivity;
        
        if (timeSinceActivity > this.sessionTimeout) {
          this.expireSession('timeout');
        }
      }
    }, 60000); // Check every minute
  }

  updateActivity() {
    if (this.authState.isAuthenticated) {
      this.authState.lastActivity = Date.now();
    }
  }

  async expireSession(reason = 'manual') {
    await this.logSecurityEvent('session_expired', {
      userId: this.authState.user?.id,
      reason,
      timestamp: new Date().toISOString()
    });

    this.authState = {
      user: null,
      isAuthenticated: false,
      sessionToken: null,
      lastActivity: null,
      securityLevel: 'standard'
    };
  }

  async logSecurityEvent(event, data) {
    try {
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: data.userId,
          action: event,
          details: data,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  getAuthState() {
    return { ...this.authState };
  }

  async signOut() {
    try {
      await this.logSecurityEvent('user_signout', {
        userId: this.authState.user?.id,
        timestamp: new Date().toISOString()
      });

      await supabase.auth.signOut();
      await this.expireSession('signout');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Global auth manager instance
export const secureAuthManager = new SecureAuthManager();

// Enhanced authentication functions
export const authenticateUser = async (email, password) => {
  return await secureAuthManager.authenticateUser(email, password);
};

export const registerUser = async (email, password, additionalData) => {
  return await secureAuthManager.registerUser(email, password, additionalData);
};

export const signOutUser = async () => {
  return await secureAuthManager.signOut();
};

export const getAuthenticationState = () => {
  return secureAuthManager.getAuthState();
};

export const updateUserActivity = () => {
  secureAuthManager.updateActivity();
};

// Session management
export const isSessionValid = () => {
  const authState = secureAuthManager.getAuthState();
  if (!authState.isAuthenticated) return false;
  
  const timeSinceActivity = Date.now() - authState.lastActivity;
  return timeSinceActivity < secureAuthManager.sessionTimeout;
};

export const getSessionInfo = () => {
  const authState = secureAuthManager.getAuthState();
  return {
    isValid: isSessionValid(),
    timeRemaining: authState.lastActivity 
      ? Math.max(0, secureAuthManager.sessionTimeout - (Date.now() - authState.lastActivity))
      : 0,
    securityLevel: authState.securityLevel,
    isAdmin: authState.user ? isAdmin(authState.user.email) : false
  };
};