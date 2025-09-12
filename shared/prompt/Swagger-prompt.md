# Swagger Implementation Prompt for wmlab Project

## Context
I'm working on a full-stack project with the following structure:
```
wmlab/
├── backend/
├── frontend/
└── shared/
```

## Requirements

### Backend Integration
- Integrate Swagger/OpenAPI documentation into the backend
- Set up automatic API documentation generation
- Configure Swagger UI for interactive testing
- Ensure proper endpoint documentation with:
  - Request/response schemas
  - Authentication requirements
  - Error handling documentation
  - Example requests/responses

### Frontend Integration  
- Generate TypeScript types from OpenAPI specifications
- Set up API client generation
- Implement proper error handling based on documented responses
- Ensure type safety between frontend and backend

### Development Workflow
- Configure automatic documentation updates during development
- Set up validation for API specifications
- Include proper development and production configurations
- Implement proper versioning for API documentation

### Documentation Standards
- Follow OpenAPI 3.0+ specification
- Include comprehensive descriptions for all endpoints
- Document all data models and schemas
- Add proper tags and categorization
- Include authentication and authorization documentation

## Specific Implementation Requests

1. **Backend Setup:**
   - Show how to integrate Swagger with [specify your backend framework: Express.js]
   - Configure middleware for documentation generation
   - Set up proper routing and endpoint documentation

2. **Frontend Integration:**
   - Generate TypeScript interfaces from OpenAPI specs
   - Set up automated client generation
   - Configure API base URLs for different environments

3. **Development Tools:**
   - Configure hot-reload for documentation changes
   - Set up validation scripts
   - Include proper npm/yarn scripts for documentation tasks

4. **File Structure:**
   - Recommend where to place OpenAPI specifications
   - Show how to organize documentation files
   - Configure proper build and deployment processes

## Additional Considerations
- Code should be in English with LTR formatting
- Explanations should be provided in English and Arabic
- Consider both development and production environments
- Include proper error handling and validation
- Ensure documentation stays synchronized with actual code

## Expected Deliverables
- Complete setup instructions
- Configuration files
- Example endpoint implementations
- Frontend integration examples
- Development workflow guidelines
- Best practices and recommendations