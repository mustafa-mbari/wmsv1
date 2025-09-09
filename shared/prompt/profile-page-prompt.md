# Professional AI Prompt: Frontend Profile Page Development

## Context & Role
You are an expert senior frontend engineer with extensive experience in React/Next.js applications. I need your assistance in developing and fixing issues with an existing user Profile Page component for our web application.

## Technical Stack
- **Frontend**: Next.js (React-based)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions

## Project Overview
**Feature**: Comprehensive User Profile Management Page
**Objective**: Create a secure, accessible, and intuitive interface for authenticated users to view and update their personal profile information including personal details, preferences, and security settings.

## Key Performance Indicators (KPIs)
**Primary Metrics:**
- Profile update success rate
- First-time profile setup completion rate  
- Profile completeness percentage

**Secondary Metrics:**
- Time-to-save performance
- Form validation error rate
- Avatar upload success rate

## Core Requirements

### User Stories
1. **Profile Viewing**: As a user, I can view all my current profile information in a clear, organized layout
2. **Profile Editing**: As a user, I can update my name, username, avatar, email, and phone number
3. **Security Management**: As a user, I can change my password securely with proper validation
4. **Personalization**: As a user, I can set my preferred language and time zone

### Profile Data Schema
| Field | Type | Constraints | Editable | Notes |
|-------|------|-------------|----------|-------|
| language | string | ISO 639-1 codes | Yes | Browser default fallback |
| timeZone | string | IANA timezone format | Yes | Browser detection fallback |
| name | string | 2-50 chars | Yes | Display name |
| username | string | 3-20 chars, alphanumeric | Yes | Unique identifier |
| email | string | Valid email format | Yes | Primary contact |
| phone | string | E.164 format | Yes | Optional field |
| avatar | string | Image URL | Yes | Profile picture |

### Core Functionality Flows

**1. Profile View Flow**
- GET request to `/api/profile` 
- Render read-only profile information
- Provide "Edit Profile" mode toggle

**2. Profile Update Flow**
- Client-side form validation
- Optimistic UI updates
- PATCH request to `/api/profile`
- Error handling with rollback capability

**3. Avatar Upload Flow**
- Request signed upload URL from `/api/profile/avatar/upload-url`
- Client-side image preview and basic compression
- Upload to cloud storage (S3/Cloudinary)
- Server-side validation and processing
- Update profile with new avatar URL

**4. Password Change Flow**
- Require current password verification
- Validate new password strength
- POST to `/api/profile/password`
- Rate limiting protection
- Optional session invalidation

## UI/UX Requirements

### Page Structure
1. **Profile Header Section**
   - Large avatar display with upload overlay
   - Display name and username
   - Verification badges (if applicable)

2. **Personal Information Section**  
   - Email address (with verification status)
   - Phone number (optional)
   - Display name
   - Username (with availability check)

3. **Preferences Section**
   - Language selection dropdown
   - Time zone selection with search
   - Theme preference (if implemented)

4. **Security Section**
   - Password change form
   - Last password change timestamp
   - Session management (future enhancement)

5. **Action Controls**
   - Save Changes button (primary)
   - Cancel/Reset button (secondary)
   - Loading states and success feedback

### Design Standards
- **Responsive Design**: Mobile-first approach, works on all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance, proper ARIA labels, keyboard navigation
- **Visual Hierarchy**: Clear section divisions, consistent spacing, proper typography
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Skeleton loaders, progress indicators, disabled states

## Security & Validation Requirements

### Frontend Validation
- Email format validation
- Password strength requirements (min 8 chars, mixed case, numbers, symbols)
- Username format and length validation
- Image file type and size validation (max 5MB, jpg/png only)
- Phone number format validation

### Security Measures
- CSRF token validation for form submissions
- Input sanitization before API calls
- Secure file upload handling
- Rate limiting awareness in UI (disable buttons, show cooldown)

## API Integration Points
```javascript
// Expected API endpoints
GET    /api/profile                   // Fetch user profile
PATCH  /api/profile                   // Update profile fields  
POST   /api/profile/avatar/upload-url // Get signed upload URL
POST   /api/profile/password          // Change password
```

### API Response Handling
- Handle 200 (success), 400 (validation errors), 401 (unauthorized), 409 (conflicts), 429 (rate limited)
- Implement proper error boundaries and fallback UI
- Show meaningful error messages to users
- Handle network failures gracefully

## Error Scenarios & Edge Cases
1. **Username Conflicts**: Handle 409 responses with immediate feedback
2. **Image Upload Failures**: Show upload progress, handle timeouts
3. **Stale Data**: Implement ETag/version checking for concurrent updates  
4. **Network Issues**: Offline detection, retry mechanisms
5. **Large Image Files**: Client-side compression before upload

## Development Phases
**Phase 1**: Read-only profile display with proper styling
**Phase 2**: Basic profile editing (name, username, email)
**Phase 3**: Avatar upload functionality
**Phase 4**: Password change and security features
**Phase 5**: Advanced preferences and settings

## Specific Frontend Tasks Needed
Please help me with the following specific areas:
1. **Component Architecture**: Proper component breakdown and state management
2. **Form Handling**: Robust form validation and submission logic
3. **Image Upload**: Client-side image handling, preview, and upload flow
4. **Error Handling**: Comprehensive error states and user feedback
5. **Performance**: Optimization for loading states and image handling
6. **Accessibility**: WCAG compliance and keyboard navigation
7. **Testing**: Unit tests for validation logic and user interactions

## Code Quality Expectations
- TypeScript for type safety
- Clean, modular component structure
- Proper error boundaries
- Comprehensive form validation
- Responsive CSS/styled-components
- Performance optimizations (lazy loading, memoization)
- Accessibility best practices

Please provide detailed implementation guidance, code examples, and best practices for building this professional-grade profile management interface.