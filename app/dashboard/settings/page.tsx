"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { updateCurrentUser, changePassword } from "@/lib/api/users";
import { DashboardHeader } from "@/components/dashboard-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter")
      .refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter")
      .refine((v) => /[0-9]/.test(v), "Must contain a digit"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        full_name: user.full_name,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const updateData: { full_name?: string; email?: string } = {};
      if (data.full_name !== user?.full_name) updateData.full_name = data.full_name;
      if (data.email !== user?.email) updateData.email = data.email;

      if (Object.keys(updateData).length === 0) {
        setProfileError(t("settings.profile.noChanges"));
        setProfileLoading(false);
        return;
      }

      await updateCurrentUser(updateData);
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setProfileError(error.response?.data?.detail || error.message || t("errors.saveFailed"));
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setPasswordError(error.response?.data?.detail || error.message || t("errors.saveFailed"));
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full backdrop-blur-md backdrop-filter bg-[rgba(248,250,252,0.72)] overflow-hidden">
      <DashboardHeader
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("settings.title") },
        ]}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16 rounded-full">
              <AvatarFallback className="rounded-full bg-gradient-to-br from-[#1c398e] to-[#27c840] text-white text-lg font-medium">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-[#27272a]">
                {t("settings.title")}
              </h1>
              <p className="text-sm text-[#94a3b8]">
                {t("settings.subtitle")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="profile" className="flex-1">
                {t("settings.profile.tab")}
              </TabsTrigger>
              <TabsTrigger value="password" className="flex-1">
                {t("settings.password.tab")}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-[#27272a]">
                    {t("settings.profile.title")}
                  </h2>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {t("settings.profile.description")}
                  </p>
                </div>

                {profileError && (
                  <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t("settings.profile.success")}
                  </div>
                )}

                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="flex flex-col gap-5"
                >
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="full_name"
                      className="text-sm font-medium text-[#27272a]"
                    >
                      {t("settings.profile.fullName")}
                    </label>
                    <Input
                      id="full_name"
                      type="text"
                      {...profileForm.register("full_name")}
                      className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8]"
                    />
                    {profileForm.formState.errors.full_name && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-[#27272a]"
                    >
                      {t("settings.profile.email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                      className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8]"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Member Since */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#27272a]">
                      {t("settings.profile.memberSince")}
                    </label>
                    <p className="text-sm text-[#94a3b8]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-[#1c398e] hover:bg-[#152d73] text-white font-medium px-6"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("settings.saving")}
                        </>
                      ) : (
                        t("settings.saveChanges")
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-[#27272a]">
                    {t("settings.password.title")}
                  </h2>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {t("settings.password.description")}
                  </p>
                </div>

                {passwordError && (
                  <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t("settings.password.success")}
                  </div>
                )}

                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="flex flex-col gap-5"
                >
                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="current_password"
                      className="text-sm font-medium text-[#27272a]"
                    >
                      {t("settings.password.currentPassword")}
                    </label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        {...passwordForm.register("current_password")}
                        className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9]"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.current_password && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new_password"
                      className="text-sm font-medium text-[#27272a]"
                    >
                      {t("settings.password.newPassword")}
                    </label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        {...passwordForm.register("new_password")}
                        className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.new_password && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.new_password.message}
                      </p>
                    )}
                    <p className="text-xs text-[#94a3b8]">
                      {t("settings.password.requirements")}
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirm_password"
                      className="text-sm font-medium text-[#27272a]"
                    >
                      {t("settings.password.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        {...passwordForm.register("confirm_password")}
                        className="bg-white border-[#cbd5e1] text-[#27272a] placeholder:text-[#94a3b8] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirm_password && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-[#1c398e] hover:bg-[#152d73] text-white font-medium px-6"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("settings.saving")}
                        </>
                      ) : (
                        t("settings.password.updatePassword")
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
