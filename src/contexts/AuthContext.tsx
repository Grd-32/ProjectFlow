import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  tenantId?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: AuthUser; needsVerification: boolean }>;
  signIn: (email: string, password: string, tenantDomain?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  refreshSession: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await handleAuthSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        await handleAuthSession(session);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSession = async (authSession: any) => {
    try {
      // Get user profile from database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const authUser: AuthUser = {
        id: authSession.user.id,
        email: authSession.user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        avatar: profile?.avatar_url,
        emailVerified: authSession.user.email_confirmed_at !== null,
        createdAt: authSession.user.created_at,
        lastLoginAt: new Date().toISOString(),
        tenantId: profile?.tenant_id
      };

      const sessionData: AuthSession = {
        user: authUser,
        accessToken: authSession.access_token,
        refreshToken: authSession.refresh_token,
        expiresAt: new Date(authSession.expires_at * 1000).toISOString()
      };

      setUser(authUser);
      setSession(sessionData);

      // Update last login
      if (profile) {
        await supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authUser.id);
      }
    } catch (error) {
      console.error('Auth session handling failed:', error);
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Failed to load user session',
        userId: authSession.user.id
      });
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            created_at: new Date().toISOString()
          }]);

        if (profileError) {
          console.error('Profile creation failed:', profileError);
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          emailVerified: false,
          createdAt: data.user.created_at!,
          lastLoginAt: new Date().toISOString()
        };

        return {
          user: authUser,
          needsVerification: !data.session
        };
      }

      throw new Error('User creation failed');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Sign Up Failed',
        message: error.message || 'Failed to create account',
        userId: 'system'
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string, tenantDomain?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        await handleAuthSession(data.session);
        return user!;
      }

      throw new Error('Sign in failed');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: error.message || 'Invalid credentials',
        userId: 'system'
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);

      addNotification({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been signed out successfully',
        userId: 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Sign Out Failed',
        message: error.message || 'Failed to sign out',
        userId: 'system'
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Password reset instructions sent to your email',
        userId: 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Failed to send reset email',
        userId: 'system'
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          full_name: updates.fullName,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);

      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        userId: user.id
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update profile',
        userId: user.id
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.session) {
        await handleAuthSession(data.session);
      }
    } catch (error: any) {
      console.error('Session refresh failed:', error);
      await signOut();
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'Email Verified',
        message: 'Your email has been verified successfully',
        userId: user?.id || 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: error.message || 'Failed to verify email',
        userId: 'system'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      refreshSession,
      verifyEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};