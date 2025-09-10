"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AvatarUploadProps {
  size?: "sm" | "md" | "lg" | "xl";
  showUploadButton?: boolean;
  showRemoveButton?: boolean;
  className?: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

const buttonSizeClasses = {
  sm: "h-6 w-6 p-1",
  md: "h-8 w-8 p-1.5",
  lg: "h-10 w-10 p-2",
  xl: "h-12 w-12 p-2.5"
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5", 
  xl: "h-6 w-6"
};

export function AvatarUpload({
  size = "lg",
  showUploadButton = true,
  showRemoveButton = true,
  className,
  onAvatarChange
}: AvatarUploadProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getUserInitials = () => {
    if (user?.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  const getAvatarUrl = () => {
    if (previewUrl) {
      return previewUrl;
    }
    
    if (user?.profilePicture) {
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profilePicture}`;
    }
    
    return undefined;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "Image must be less than 5MB";
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return "Only JPG and PNG files are allowed";
    }
    
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: validationError,
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/api/profile/avatar', formData);

      if (response.data.success) {
        // Clean up preview
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
        
        // Refresh user data
        await refreshUser();
        
        // Notify parent component
        onAvatarChange?.(response.data.data.avatarUrl);
        
        toast({
          title: "Success",
          description: "Avatar updated successfully!",
        });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      
      // Clean up preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload avatar",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user?.profilePicture) return;

    try {
      setIsRemoving(true);
      
      const response = await apiClient.delete('/api/profile/avatar');
      
      if (response.data.success) {
        // Refresh user data
        await refreshUser();
        
        // Notify parent component
        onAvatarChange?.(null);
        
        toast({
          title: "Success",
          description: "Avatar removed successfully!",
        });
      } else {
        throw new Error(response.data.message || 'Remove failed');
      }
    } catch (error: any) {
      console.error("Avatar remove error:", error);
      toast({
        variant: "destructive",
        title: "Remove Failed",
        description: error.response?.data?.message || "Failed to remove avatar",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please drop an image file (JPG or PNG)",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
      />
      
      <div 
        className="relative group cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => showUploadButton && fileInputRef.current?.click()}
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={getAvatarUrl()}
            alt={user?.name || user?.username || 'User'}
            onError={() => {
              console.warn('Avatar failed to load:', getAvatarUrl());
            }}
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Loading overlay */}
        {(isUploading || isRemoving) && (
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/50 flex items-center justify-center`}>
            <RefreshCw className={`${iconSizeClasses[size]} text-white animate-spin`} />
          </div>
        )}
        
        {/* Upload overlay on hover */}
        {showUploadButton && !isUploading && !isRemoving && (
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
            <Camera className={`${iconSizeClasses[size]} text-white`} />
          </div>
        )}
      </div>

      {/* Action buttons for larger sizes */}
      {size === "xl" && showUploadButton && (
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className={`rounded-full ${buttonSizeClasses[size]} shadow-md`}
                disabled={isUploading || isRemoving}
              >
                {isUploading ? (
                  <RefreshCw className={`${iconSizeClasses[size]} animate-spin`} />
                ) : (
                  <Camera className={iconSizeClasses[size]} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </DropdownMenuItem>
              {user?.profilePicture && showRemoveButton && (
                <DropdownMenuItem 
                  onClick={handleRemoveAvatar}
                  className="text-destructive focus:text-destructive"
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Simple button for other sizes */}
      {size !== "xl" && showUploadButton && (
        <Button
          size="sm"
          variant="secondary"
          className={`absolute -bottom-1 -right-1 rounded-full ${buttonSizeClasses[size]} shadow-md`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
        >
          {isUploading ? (
            <RefreshCw className={`${iconSizeClasses[size]} animate-spin`} />
          ) : (
            <Camera className={iconSizeClasses[size]} />
          )}
        </Button>
      )}
    </div>
  );
}

export default AvatarUpload;