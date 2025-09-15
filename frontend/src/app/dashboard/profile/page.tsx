"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Save,
  RefreshCw,
  Edit,
  CheckCircle,
  Clock,
  Camera,
  Upload,
  AlertCircle,
  Lock,
  Globe,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useIntl } from "react-intl";

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profilePicture?: string;
  language?: string;
  timeZone?: string;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  last_password_change?: string;
  created_at: string;
  updated_at: string;
  role_names: string[];
  role_slugs: string[];
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileCompleteness {
  percentage: number;
  missing: string[];
}

const getProfileSchema = (intl: any) => z.object({
  name: z.string().min(2, intl.formatMessage({ id: 'forms.validation.minLength', defaultMessage: 'Display name must be at least 2 characters' }, { min: 2 })).max(50, intl.formatMessage({ id: 'forms.validation.maxLength', defaultMessage: 'Display name must be less than 50 characters' }, { max: 50 })),
  username: z.string().min(3, intl.formatMessage({ id: 'forms.validation.minLength', defaultMessage: 'Username must be at least 3 characters' }, { min: 3 })).max(20, intl.formatMessage({ id: 'forms.validation.maxLength', defaultMessage: 'Username must be less than 20 characters' }, { max: 20 })).regex(/^[a-zA-Z0-9_]+$/, intl.formatMessage({ id: 'forms.validation.username', defaultMessage: 'Username can only contain letters, numbers, and underscores' })),
  email: z.string().email(intl.formatMessage({ id: 'profile.validation.emailRequired' })),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, intl.formatMessage({ id: 'forms.validation.invalidPhone' })).optional().or(z.literal("")),
  language: z.string().optional(),
  timeZone: z.string().optional(),
});

const getPasswordSchema = (intl: any) => z.object({
  currentPassword: z.string().min(1, intl.formatMessage({ id: 'profile.validation.currentPasswordRequired' })),
  newPassword: z.string()
    .min(8, intl.formatMessage({ id: 'forms.validation.minLength', defaultMessage: 'Password must be at least 8 characters' }, { min: 8 }))
    .regex(/(?=.*[a-z])/, intl.formatMessage({ id: 'profile.validation.passwordLowercase' }))
    .regex(/(?=.*[A-Z])/, intl.formatMessage({ id: 'profile.validation.passwordUppercase' }))
    .regex(/(?=.*\d)/, intl.formatMessage({ id: 'profile.validation.passwordNumber' }))
    .regex(/(?=.*[^\w\s])/, intl.formatMessage({ id: 'profile.validation.passwordSpecial' })),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: intl.formatMessage({ id: 'profile.validation.passwordMismatch' }),
  path: ["confirmPassword"],
});

const getLanguages = (intl: any) => [
  { code: "en", name: intl.formatMessage({ id: 'profile.languages.en' }) },
  { code: "es", name: intl.formatMessage({ id: 'profile.languages.es' }) },
  { code: "fr", name: intl.formatMessage({ id: 'profile.languages.fr' }) },
  { code: "de", name: intl.formatMessage({ id: 'profile.languages.de' }) },
  { code: "it", name: intl.formatMessage({ id: 'profile.languages.it' }) },
  { code: "pt", name: intl.formatMessage({ id: 'profile.languages.pt' }) },
  { code: "zh", name: intl.formatMessage({ id: 'profile.languages.zh' }) },
  { code: "ja", name: intl.formatMessage({ id: 'profile.languages.ja' }) },
  { code: "ko", name: intl.formatMessage({ id: 'profile.languages.ko' }) },
  { code: "ar", name: intl.formatMessage({ id: 'profile.languages.ar' }) },
];

const commonTimeZones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
];

export default function ProfilePage() {
  const { user: currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const intl = useIntl();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completeness, setCompleteness] = useState<ProfileCompleteness>({ percentage: 0, missing: [] });
  const [error, setError] = useState<string | null>(null);

  const profileSchema = getProfileSchema(intl);
  const passwordSchema = getPasswordSchema(intl);
  const languages = getLanguages(intl);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      language: "",
      timeZone: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);


  const fetchUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/profile`);
      const userData = response.data.data || response.data;
      setProfileData(userData);
      
      // Update form with fetched data
      form.reset({
        name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        language: userData.language || navigator.language.split('-')[0],
        timeZone: userData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      
      calculateCompleteness(userData);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      setError(error.response?.data?.message || intl.formatMessage({ id: 'profile.failedToLoadProfile' }));
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'profile.loadProfileError' }),
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateCompleteness = (userData: UserProfileData) => {
    const fields = [
      { key: 'name', label: 'Display Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'profilePicture', label: 'Profile Picture' },
      { key: 'language', label: 'Language' },
      { key: 'timeZone', label: 'Time Zone' },
    ];
    
    const completed = fields.filter(field => {
      const value = userData[field.key as keyof UserProfileData];
      return value && value !== '';
    });
    
    const missing = fields.filter(field => {
      const value = userData[field.key as keyof UserProfileData];
      return !value || value === '';
    }).map(field => field.label);
    
    setCompleteness({
      percentage: Math.round((completed.length / fields.length) * 100),
      missing
    });
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!profileData) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      // Optimistic update
      const optimisticData = { ...profileData, ...data };
      setProfileData(optimisticData);
      
      await apiClient.patch(`/api/profile`, data);
      
      await fetchUserProfile(); // Refresh to get server state
      setEditMode(false);
      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'profile.updateProfileSuccess' }),
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      // Rollback optimistic update
      await fetchUserProfile();
      
      const errorMessage = error.response?.data?.message || intl.formatMessage({ id: 'profile.failedToUpdateProfile' });
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: 'common.error' }),
        description: errorMessage,
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setPasswordChanging(true);
      setError(null);
      
      await apiClient.post('/api/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      passwordForm.reset();
      setShowPasswordForm(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      await fetchUserProfile(); // Refresh to update last password change
      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'profile.changePasswordSuccess' }),
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || intl.formatMessage({ id: 'profile.failedToChangePassword' });
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: 'common.error' }),
        description: errorMessage,
      });
    } finally {
      setPasswordChanging(false);
    }
  };
  
  const handleAvatarChange = async (avatarUrl: string | null) => {
    // Refresh profile data when avatar changes
    await fetchUserProfile();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return intl.formatMessage({ id: 'profile.notSet' });
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return 'destructive';
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'supervisor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 min-h-screen -m-24">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="space-y-6 px-4 py-6 min-h-screen -m-24">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'profile.title' })} {intl.formatMessage({ id: 'pages.notFound.title' })}</CardTitle>
            <CardDescription>
              {intl.formatMessage({ id: 'profile.loadProfileError' })}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-12 py-6 bg-muted/30 min-h-screen -m-6">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-muted-foreground">
          Profile / Account Settings
        </h1>
      </div>
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: 'profile.editProfile' })}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setError(null);
                form.reset();
              }}>
                {intl.formatMessage({ id: 'common.cancel' })}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updating}
              >
                {updating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {intl.formatMessage({ id: 'common.update' })}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Profile Header Section */}
      <Card className="bg-background/95 backdrop-blur shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <AvatarUpload 
              size="xl"
              onAvatarChange={handleAvatarChange}
            />
            
            <div className="space-y-2 flex-1">
              <div>
                <h2 className="text-2xl font-bold">{profileData?.name || `${profileData?.first_name} ${profileData?.last_name}`.trim()}</h2>
                <p className="text-muted-foreground">@{profileData?.username}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {profileData?.email_verified && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {intl.formatMessage({ id: 'profile.verified' })}
                  </Badge>
                )}
                <Badge variant={profileData?.is_active ? "default" : "destructive"}>
                  {profileData?.is_active ? intl.formatMessage({ id: 'common.active' }) : intl.formatMessage({ id: 'common.inactive' })}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'profile.profileCompleteness' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={completeness.percentage} className="w-20" />
                <span className="text-sm font-medium">{completeness.percentage}%</span>
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {intl.formatMessage({ id: 'profile.missing' })}: {completeness.missing.slice(0, 2).join(', ')}
                  {completeness.missing.length > 2 && ` +${completeness.missing.length - 2} more`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: 'profile.personalInfo' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.displayName' })}</FormLabel>
                        <FormControl>
                          <Input placeholder={intl.formatMessage({ id: 'profile.enterDisplayName' })} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.username' })}</FormLabel>
                        <FormControl>
                          <Input placeholder={intl.formatMessage({ id: 'profile.username', defaultMessage: 'Enter your username' })} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.email' })}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={intl.formatMessage({ id: 'profile.email', defaultMessage: 'Enter your email' })} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.phoneNumber' })}</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>{intl.formatMessage({ id: 'profile.displayName' })}:</Label>
                  <span className="font-medium">{profileData?.name || intl.formatMessage({ id: 'profile.notSet' })}</span>
                </div>
                <div className="flex justify-between">
                  <Label>{intl.formatMessage({ id: 'profile.username' })}:</Label>
                  <span className="font-medium">@{profileData?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>{intl.formatMessage({ id: 'profile.email' })}:</Label>
                  <span className="flex items-center">
                    <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData?.email}
                    {profileData?.email_verified && (
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>{intl.formatMessage({ id: 'profile.phoneNumber' })}:</Label>
                  <span className="flex items-center">
                    <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData?.phone || intl.formatMessage({ id: 'profile.notProvided' })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: 'profile.preferences' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.language' })}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={intl.formatMessage({ id: 'profile.selectLanguage' })} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{intl.formatMessage({ id: 'profile.timeZone' })}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={intl.formatMessage({ id: 'profile.selectTimeZone' })} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonTimeZones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>{intl.formatMessage({ id: 'profile.language' })}:</Label>
                  <span className="font-medium">
                    {languages.find(l => l.code === profileData?.language)?.name || intl.formatMessage({ id: 'profile.languages.en' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>{intl.formatMessage({ id: 'profile.timeZone' })}:</Label>
                  <span className="font-medium">
                    {profileData?.timeZone?.replace('_', ' ') || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: 'profile.security' })}
            </CardTitle>
            <CardDescription>
              {intl.formatMessage({ id: 'profile.security' })} {intl.formatMessage({ id: 'profile.description', defaultMessage: 'settings' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>{intl.formatMessage({ id: 'profile.newPassword' })}</Label>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'profile.lastPasswordChange' })}: {profileData?.last_password_change ? 
                    formatDate(profileData.last_password_change) : intl.formatMessage({ id: 'profile.never' })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {intl.formatMessage({ id: 'profile.changePassword' })}
              </Button>
            </div>
            
            {showPasswordForm && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{intl.formatMessage({ id: 'profile.changePassword' })}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      passwordForm.reset();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{intl.formatMessage({ id: 'profile.currentPassword' })}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.enterCurrentPassword' })}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{intl.formatMessage({ id: 'profile.newPassword' })}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.enterNewPassword' })}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{intl.formatMessage({ id: 'profile.confirmPassword' })}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.confirmNewPassword' })}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          passwordForm.reset();
                        }}
                      >
                        {intl.formatMessage({ id: 'common.cancel' })}
                      </Button>
                      <Button type="submit" disabled={passwordChanging}>
                        {passwordChanging ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        {intl.formatMessage({ id: 'profile.updatePassword' })}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: 'profile.accountInfo' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Label>{intl.formatMessage({ id: 'common.status' })}:</Label>
              <Badge variant={profileData?.is_active ? "default" : "destructive"}>
                {profileData?.is_active ? intl.formatMessage({ id: 'common.active' }) : intl.formatMessage({ id: 'common.inactive' })}
              </Badge>
            </div>
            <div className="flex justify-between">
              <Label>{intl.formatMessage({ id: 'profile.emailVerified' })}:</Label>
              <Badge variant={profileData?.email_verified ? "default" : "secondary"}>
                {profileData?.email_verified ? intl.formatMessage({ id: 'profile.verified' }) : intl.formatMessage({ id: 'profile.notVerified' })}
              </Badge>
            </div>
            {profileData?.email_verified_at && (
              <div className="flex justify-between items-center">
                <Label>{intl.formatMessage({ id: 'profile.verifiedAt' })}:</Label>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profileData.email_verified_at)}
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">{intl.formatMessage({ id: 'profile.assignedRoles' })}:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData?.role_names && profileData.role_names.length > 0 ? (
                    profileData.role_names.map((role, index) => (
                      <Badge 
                        key={index} 
                        variant={getRoleBadgeVariant(role)}
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'profile.noRoles' })}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {intl.formatMessage({ id: 'profile.roleInfo' })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Information */}
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: 'profile.activityInfo' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>{intl.formatMessage({ id: 'profile.lastLogin' })}:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.last_login_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>{intl.formatMessage({ id: 'profile.accountCreated' })}:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>{intl.formatMessage({ id: 'profile.lastUpdated' })}:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.updated_at)}
              </span>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'profile.userId' })}: {profileData?.id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}