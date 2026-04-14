import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken, signUp as apiSignUp, googleLogin as apiGoogleLogin } from "@/api/auth";
import { saveTokens, clearTokens, getUserInfo, getAccessToken, getRefreshToken, isAuthenticated } from "@/lib/token";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "smartrent.session";

/**
 * @typedef {{
 *  id: number,
 *  username: string,
 *  email: string,
 *  fullName: string | null,
 *  tenantId: number | null,
 *  role: string,
 *  avatarUrl: string | null,
 *  permissions: string[]
 * }} UserInfo
 */

/**
 * @typedef {{
 *  user: UserInfo | null,
 *  isAuthenticated: boolean,
 *  isLoading: boolean,
 *  login: (username: string, password: string) => Promise<void>,
 *  signUp: (email: string, password: string, confirmPassword: string, fullName?: string, phone?: string) => Promise<void>,
 *  googleLogin: (idToken: string) => Promise<void>,
 *  logout: () => Promise<void>,
 *  refreshAuth: () => Promise<void>
 * }} AuthValue
 */

/** @type {React.Context<AuthValue | null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userInfo = getUserInfo();
        if (userInfo && isAuthenticated()) {
          setUser(userInfo);
        } else {
          clearTokens();
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user && isAuthenticated(),
      isLoading,
      login: async (username, password) => {
        try {
          setIsLoading(true);
          const response = await apiLogin({ username, password });

          if (response.success && response.data) {
            const { accessToken, refreshToken, user: userInfo } = response.data;
            
            // Save tokens and user info
            saveTokens(accessToken, refreshToken, userInfo);
            setUser(userInfo);

            // Navigate to dashboard
            navigate("/dashboard/home", { replace: true });
          } else {
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          console.error("Login error:", error);
          clearTokens();
          setUser(null);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      signUp: async (email, password, confirmPassword, fullName, phone) => {
        try {
          setIsLoading(true);
          const response = await apiSignUp({ 
            email, 
            password, 
            confirmPassword,
            fullName: fullName || null,
            phone: phone || null
          });

          if (response.success && response.data) {
            // Don't save tokens - user needs to login after signup
            // Navigate to sign-in page with success message
            navigate("/auth/sign-in", { 
              replace: true,
              state: { signupSuccess: true }
            });
          } else {
            throw new Error(response.error?.message || response.message || "Sign up failed");
          }
        } catch (error) {
          console.error("Sign up error:", error);
          clearTokens();
          setUser(null);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      googleLogin: async (idToken) => {
        try {
          setIsLoading(true);
          const response = await apiGoogleLogin({ idToken });

          if (response.success && response.data) {
            const { accessToken, refreshToken, user: userInfo } = response.data;
            
            // Save tokens and user info
            saveTokens(accessToken, refreshToken, userInfo);
            setUser(userInfo);

            // Navigate to dashboard
            navigate("/dashboard/home", { replace: true });
          } else {
            throw new Error(response.error?.message || response.message || "Google login failed");
          }
        } catch (error) {
          console.error("Google login error:", error);
          clearTokens();
          setUser(null);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      logout: async () => {
        try {
          // Call logout API
          await apiLogout();
        } catch (error) {
          console.error("Logout API error:", error);
          // Continue with local logout even if API fails
        } finally {
          // Clear local storage and state
          clearTokens();
          setUser(null);
          navigate("/auth/sign-in", { replace: true });
        }
      },
      refreshAuth: async () => {
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await apiRefreshToken({ refreshToken });

          if (response.success && response.data) {
            const { accessToken, refreshToken: newRefreshToken, user: userInfo } = response.data;
            
            // Save new tokens
            saveTokens(accessToken, newRefreshToken, userInfo);
            setUser(userInfo);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          // If refresh fails, logout user
          clearTokens();
          setUser(null);
          navigate("/auth/sign-in", { replace: true });
        }
      },
    };
  }, [user, isLoading, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
