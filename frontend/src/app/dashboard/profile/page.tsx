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

const profileSchema = z.object({
  name: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number in E.164 format").optional().or(z.literal("")),
  language: z.string().optional(),
  timeZone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[^\w\s])/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
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
      setError(error.response?.data?.message || "Failed to load profile");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data",
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
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      // Rollback optimistic update
      await fetchUserProfile();
      
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
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
        title: "Success",
        description: "Password changed successfully!",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
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
    if (!dateString) return "Not set";
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
      <div className="space-y-6">
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
      <div className="space-y-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your profile information.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile"
        description="Manage your account information and preferences"
        actions={
          <div className="flex space-x-2">
            {!editMode ? (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setEditMode(false);
                  setError(null);
                  form.reset();
                }}>
                  Cancel
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
                  Save Changes
                </Button>
              </>
            )}
          </div>
        }
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Profile Header Section */}
      <Card>
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
                    Verified
                  </Badge>
                )}
                <Badge variant={profileData?.is_active ? "default" : "destructive"}>
                  {profileData?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Profile Completeness</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={completeness.percentage} className="w-20" />
                <span className="text-sm font-medium">{completeness.percentage}%</span>
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Missing: {completeness.missing.slice(0, 2).join(', ')}
                  {completeness.missing.length > 2 && ` +${completeness.missing.length - 2} more`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
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
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your display name" {...field} />
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
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
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
                  <Label>Display Name:</Label>
                  <span className="font-medium">{profileData?.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Username:</Label>
                  <span className="font-medium">@{profileData?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Email:</Label>
                  <span className="flex items-center">
                    <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData?.email}
                    {profileData?.email_verified && (
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Phone:</Label>
                  <span className="flex items-center">
                    <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData?.phone || "Not provided"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Preferences
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
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
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
                        <FormLabel>Time Zone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time zone" />
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
                  <Label>Language:</Label>
                  <span className="font-medium">
                    {languages.find(l => l.code === profileData?.language)?.name || 'English'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Time Zone:</Label>
                  <span className="font-medium">
                    {profileData?.timeZone?.replace('_', ' ') || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Last changed: {profileData?.last_password_change ? 
                    formatDate(profileData.last_password_change) : 'Never'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                Change Password
              </Button>
            </div>
            
            {showPasswordForm && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Change Password</h4>
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
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password"
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
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
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
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
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
                        Cancel
                      </Button>
                      <Button type="submit" disabled={passwordChanging}>
                        {passwordChanging ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Label>Account Status:</Label>
              <Badge variant={profileData?.is_active ? "default" : "destructive"}>
                {profileData?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <Label>Email Verified:</Label>
              <Badge variant={profileData?.email_verified ? "default" : "secondary"}>
                {profileData?.email_verified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            {profileData?.email_verified_at && (
              <div className="flex justify-between items-center">
                <Label>Verified At:</Label>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profileData.email_verified_at)}
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Assigned Roles:</Label>
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
                    <span className="text-sm text-muted-foreground">No roles assigned</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Your roles determine what actions you can perform in the system.
                Contact your administrator to request role changes.
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Activity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Last Login:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.last_login_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>Account Created:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>Last Updated:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData?.updated_at)}
              </span>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              User ID: {profileData?.id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}