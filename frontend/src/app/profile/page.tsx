"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Clock
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  role_names: string[];
  role_slugs: string[];
}

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
});

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      birth_date: "",
      gender: "",
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
      const response = await apiClient.get(`/api/users/${currentUser.id}`);
      const userData = response.data.data;
      setProfileData(userData);
      
      // Update form with fetched data
      form.reset({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        address: userData.address || "",
        birth_date: userData.birth_date || "",
        gender: userData.gender || "",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!profileData) return;
    
    try {
      setUpdating(true);
      await apiClient.put(`/api/users/${profileData.id}`, data);
      await fetchUserProfile(); // Refresh the data
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdating(false);
    }
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
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
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
            </div>
          )}
        </div>
      </div>

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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                  <Label>Full Name:</Label>
                  <span className="font-medium">{profileData.first_name} {profileData.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Username:</Label>
                  <span className="font-medium">@{profileData.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Phone:</Label>
                  <span className="flex items-center">
                    <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Address:</Label>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData.address || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Birth Date:</Label>
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                    {profileData.birth_date ? new Date(profileData.birth_date).toLocaleDateString() : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Gender:</Label>
                  <span className="capitalize">{profileData.gender || "Not specified"}</span>
                </div>
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
            <div className="flex justify-between items-center">
              <Label>Email:</Label>
              <span className="flex items-center">
                <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                {profileData.email}
                {profileData.email_verified && (
                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <Label>Account Status:</Label>
              <Badge variant={profileData.is_active ? "default" : "destructive"}>
                {profileData.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <Label>Email Verified:</Label>
              <Badge variant={profileData.email_verified ? "default" : "secondary"}>
                {profileData.email_verified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            {profileData.email_verified_at && (
              <div className="flex justify-between items-center">
                <Label>Verified At:</Label>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profileData.email_verified_at)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Assigned Roles:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.role_names && profileData.role_names.length > 0 ? (
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
              <Separator />
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
                {formatDate(profileData.last_login_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>Account Created:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>Last Updated:</Label>
              <span className="text-sm text-muted-foreground">
                {formatDate(profileData.updated_at)}
              </span>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              User ID: {profileData.id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}