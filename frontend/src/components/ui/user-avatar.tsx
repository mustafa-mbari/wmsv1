"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    id?: string | number;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    profilePicture?: string;
    avatar_url?: string;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12"
};

const fallbackTextSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg"
};

export function UserAvatar({ 
  user, 
  size = "md", 
  className, 
  fallbackClassName 
}: UserAvatarProps) {
  const getUserInitials = () => {
    // Try to get initials from display name first
    if (user?.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    // Fallback to first and last name
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    // Fallback to username
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    
    // Final fallback
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'User';
  };

  const getAvatarUrl = () => {
    // Support both profilePicture and avatar_url fields
    const avatarPath = user?.profilePicture || user?.avatar_url;
    
    if (avatarPath) {
      // If it's already a full URL, use it as-is
      if (avatarPath.startsWith('http')) {
        return avatarPath;
      }
      // Otherwise, construct the full URL
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${avatarPath}`;
    }
    
    return undefined;
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={getAvatarUrl()}
        alt={getDisplayName()}
        onError={() => {
          if (getAvatarUrl()) {
            console.warn('Avatar failed to load:', getAvatarUrl());
          }
        }}
      />
      <AvatarFallback 
        className={cn(
          "bg-primary text-primary-foreground font-medium",
          fallbackTextSizes[size],
          fallbackClassName
        )}
      >
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;