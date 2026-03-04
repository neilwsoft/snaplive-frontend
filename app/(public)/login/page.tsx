'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, Eye, EyeOff, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  keepLoggedIn: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginRegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <LoginRegisterContent />
    </Suspense>
  );
}

function LoginRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, login, register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const returnUrl = searchParams.get('returnUrl');
  const tabParam = searchParams.get('tab');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      keepLoggedIn: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const keepLoggedIn = loginForm.watch('keepLoggedIn');

  useEffect(() => {
    if (tabParam === 'register') {
      setActiveTab('register');
    }
  }, [tabParam]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard');
    }
  }, [isAuthenticated, loading, router, returnUrl]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password, data.keepLoggedIn ?? false);
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser(data.email, data.password, data.full_name);
      router.push('/dashboard');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-10 px-6 py-4">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-2xl font-semibold text-[#27272a] tracking-[-0.6px]">
            Login/Register
          </h1>
          <span className="text-2xl font-semibold text-[#b3bad1]">
            登录 / 注册
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Tabs and Form Card */}
        <div className="flex flex-col gap-2 w-full max-w-[400px]">
          {/* Tabs */}
          <div className="flex gap-2 p-2 rounded-md overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={cn(
                'flex items-center justify-center h-8 px-3 rounded-[7px] text-sm font-medium transition-all',
                activeTab === 'login'
                  ? 'bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-[#27272a]'
                  : 'text-[#27272a] hover:bg-white/50'
              )}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={cn(
                'flex items-center justify-center h-8 px-3 rounded-[7px] text-sm font-medium transition-all',
                activeTab === 'register'
                  ? 'bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-[#27272a]'
                  : 'text-[#27272a] hover:bg-white/50'
              )}
            >
              Register
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-md p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-center h-8">
              <p className="text-sm text-[#27272a] text-center">
                {activeTab === 'login'
                  ? 'Enter your account email and password to login.'
                  : 'Create your account to get started.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-8">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-[#27272a]">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="li.jing@gmail.com"
                    {...loginForm.register('email')}
                    className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8]"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-[#27272a]">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        {...loginForm.register('password')}
                        className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Sub Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => loginForm.setValue('keepLoggedIn', checked as boolean)}
                        className="border-[#b3bad1] data-[state=checked]:bg-[#1c398e] data-[state=checked]:border-[#1c398e]"
                      />
                      <label
                        htmlFor="keepLoggedIn"
                        className="text-sm font-medium text-[#27272a] cursor-pointer"
                      >
                        Keep me logged-in
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#27272a] underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <div className="flex flex-col items-center justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1c398e] hover:bg-[#152d73] text-white font-medium px-4 py-1 rounded-md"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoading ? 'Logging in...' : 'Log-in'}
                  </Button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-6">
                {/* Full Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="full_name" className="text-sm font-medium text-[#27272a]">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Li Jing"
                    {...registerForm.register('full_name')}
                    className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8]"
                  />
                  {registerForm.formState.errors.full_name && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.full_name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg_email" className="text-sm font-medium text-[#27272a]">
                    Email
                  </label>
                  <Input
                    id="reg_email"
                    type="email"
                    placeholder="li.jing@gmail.com"
                    {...registerForm.register('email')}
                    className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8]"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg_password" className="text-sm font-medium text-[#27272a]">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reg_password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      {...registerForm.register('password')}
                      className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                  <p className="text-xs text-[#94a3b8]">
                    Password must be at least 8 characters
                  </p>
                </div>

                {/* Register Button */}
                <div className="flex flex-col items-center justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1c398e] hover:bg-[#152d73] text-white font-medium px-4 py-1 rounded-md"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
