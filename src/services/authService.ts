import { User } from '../types';
import { DEMO_USER } from '../data/seedData';
import { supabase } from '../lib/supabase/client';

const AUTH_STORAGE_KEY = 'healthvault_auth_user';

export const authService = {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  async getSessionToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If invalid credentials or not found, provide clear user feedback
        throw new Error(error.message || "We couldn't log you in. Check your email and password.");
      }

      if (!data.user) {
        throw new Error('Login failed: user data unavailable.');
      }

      // Fetch profile and consent from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const { data: consent } = await supabase
        .from('health_consents')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const authenticatedUser: User = {
        id: data.user.id,
        name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email || email,
        dateOfBirth: profile?.date_of_birth || '1990-01-01',
        createdAt: data.user.created_at,
        abhaId: profile?.phone ? `91-${profile.phone.slice(-4)}-2026-4491` : '91-8472-1920-4491',
        consentGiven: consent?.consented ?? true,
        consentDate: consent?.consented_at || undefined,
      };

      this.setCurrentUser(authenticatedUser);
      return authenticatedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "We couldn't log you in. Check your email and password and try again.");
    }
  },

  async loginDemo(): Promise<User> {
    const demoEmail = 'demo.rahul@healthvault.local';
    const demoPass = 'HealthVaultDemo2026!';

    try {
      // Try logging into existing demo account
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      // If user doesn't exist yet, sign them up
      if (error && (error.message.includes('Invalid login') || error.message.includes('not found') || error.message.includes('credentials'))) {
        const signUpRes = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              full_name: 'Rahul Sharma',
              date_of_birth: '1985-04-12',
            },
          },
        });

        let activeUser = data?.user;
        let activeSession = data?.session;

        if (signUpRes.data.user) {
          activeUser = signUpRes.data.user;
          activeSession = signUpRes.data.session;
        }

        if (activeSession?.access_token && activeUser) {
          // Trigger server-side demo seeding
          await fetch('/api/demo/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${activeSession.access_token}`,
            },
          }).catch((e) => console.warn('Demo seed call note:', e));

          const demoUser: User = {
            id: activeUser.id,
            name: 'Rahul Sharma',
            email: demoEmail,
            dateOfBirth: '1985-04-12',
            createdAt: new Date().toISOString(),
            abhaId: '91-8472-1920-4491',
            consentGiven: true,
            consentDate: new Date().toISOString(),
          };

          this.setCurrentUser(demoUser);
          return demoUser;
        }
      } else if (data?.session?.access_token && data.user) {
        await fetch('/api/demo/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }).catch((e) => console.warn('Demo seed call note:', e));

        const demoUser: User = {
          id: data.user.id,
          name: 'Rahul Sharma',
          email: demoEmail,
          dateOfBirth: '1985-04-12',
          createdAt: new Date().toISOString(),
          abhaId: '91-8472-1920-4491',
          consentGiven: true,
          consentDate: new Date().toISOString(),
        };

        this.setCurrentUser(demoUser);
      }
    } catch (e) {
      console.warn('Supabase remote demo auth fallback to local demo user:', e);
    }

    // Fallback to DEMO_USER
    this.setCurrentUser(DEMO_USER);
    return DEMO_USER;
  },

  async signup(name: string, email: string, password: string, dateOfBirth: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Registration failed. Please check your details.');
      }

      const userId = data.user?.id || `user_${Date.now()}`;
      const newUser: User = {
        id: userId,
        name,
        email,
        dateOfBirth,
        createdAt: new Date().toISOString(),
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        consentGiven: false, // Must complete consent step!
      };

      this.setCurrentUser(newUser);
      return newUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || 'Registration failed. Please try again.');
    }
  },

  async recordConsent(): Promise<User> {
    const user = this.getCurrentUser() || DEMO_USER;
    const token = await this.getSessionToken();

    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          consented: true,
          version: '1.0',
        }),
      });
    } catch (e) {
      console.warn('Remote consent record note:', e);
    }

    const updated: User = {
      ...user,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };
    this.setCurrentUser(updated);
    return updated;
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return !error;
    } catch {
      return Boolean(email && email.includes('@'));
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out note:', e);
    }
    this.setCurrentUser(null);
  },
};
