# Implementation Plan: Admin Dashboard Features

## Overview

This implementation plan breaks down the admin dashboard features into discrete, incremental tasks. The approach follows a vertical slice pattern, implementing complete features one at a time (backend + frontend + tests) to enable early validation. Each task builds on previous work, with checkpoints to ensure quality.

The implementation order prioritizes:
1. **Foundation**: API library extensions and shared components
2. **Category Management**: Complete CRUD with hierarchical display
3. **Order Management**: Viewing and status updates
4. **User Management**: Role management and account operations
5. **Integration**: Search, filters, and polish

## Tasks

- [x] 1. Set up testing infrastructure and API library foundation
  - Install fast-check for property-based testing
  - Configure Jest for frontend tests
  - Extend `frontend/lib/api.ts` with AdminAPI class structure
  - Create shared TypeScript interfaces for Category, Order, User types
  - Set up test database configuration for integration tests
  - _Requirements: 4.1, 4.2_

- [ ] 2. Implement Category Management backend
  - [x] 2.1 Create category list endpoint
    - Implement `backend/api/api/categories/list.php`
    - Include subcategories in response with hierarchical structure
    - Add authentication and admin role validation
    - _Requirements: 1.6, 5.4_
  
  - [ ] 2.2 Write property test for category list hierarchical structure
    - **Property 5: Category list hierarchical structure**
    - **Validates: Requirements 1.6**
  
  - [x] 2.3 Create category create endpoint
    - Implement `backend/api/api/categories/create.php`
    - Validate name, slug, description, image_url
    - Check for duplicate slug
    - Return created category with ID
    - _Requirements: 1.1, 1.7_
  
  - [x] 2.4 Write property test for category creation persistence
    - **Property 1: Category creation persistence**
    - **Validates: Requirements 1.1**
  
  - [ ] 2.5 Write property test for invalid category data rejection
    - **Property 6: Invalid category data rejection**
    - **Validates: Requirements 1.7**
  
  - [x] 2.6 Create category update endpoint
    - Implement `backend/api/api/categories/update.php`
    - Validate all fields including duplicate slug check (excluding current category)
    - Return updated category
    - _Requirements: 1.2, 1.7_
  
  - [x] 2.7 Write property test for category update persistence
    - **Property 2: Category update persistence**
    - **Validates: Requirements 1.2**
  
  - [x] 2.8 Create category delete and check-products endpoints
    - Implement `backend/api/api/categories/delete.php`
    - Implement `backend/api/api/categories/check-products.php`
    - Check for associated products before deletion
    - _Requirements: 1.3, 1.4_
  
  - [x] 2.9 Write property test for category deletion
    - **Property 3: Category deletion removes from database**
    - **Validates: Requirements 1.4**
  
  - [x] 2.10 Create subcategory CRUD endpoints
    - Implement `backend/api/api/subcategories/create.php`
    - Implement `backend/api/api/subcategories/update.php`
    - Implement `backend/api/api/subcategories/delete.php`
    - Validate parent category exists
    - _Requirements: 1.5_
  
  - [x] 2.11 Write property test for subcategory creation with parent relationship
    - **Property 4: Subcategory creation with parent relationship**
    - **Validates: Requirements 1.5**

- [ ] 3. Implement Category Management frontend
  - [x] 3.1 Create CategoryManager component structure
    - Create component file with state management
    - Implement tab layout integration
    - Add loading states
    - _Requirements: 6.1, 6.2_
  
  - [x] 3.2 Implement category list view
    - Display categories in table with subcategories
    - Show hierarchical structure
    - Add search input
    - Add create/edit/delete action buttons
    - _Requirements: 1.6, 6.1_
  
  - [x] 3.3 Implement category create/edit modal
    - Create modal component with form
    - Add fields: name, slug, description, image_url
    - Implement form validation
    - Handle create and edit modes
    - Display validation errors
    - _Requirements: 1.1, 1.2, 6.5, 8.1_
  
  - [x] 3.4 Implement category delete confirmation
    - Create confirmation dialog component
    - Check for products before showing dialog
    - Display warning if products exist
    - Handle delete action
    - _Requirements: 1.3, 1.4, 6.6_
  
  - [x] 3.5 Implement subcategory management UI
    - Add subcategory create/edit forms within category rows
    - Implement inline editing or modal for subcategories
    - Handle subcategory delete
    - _Requirements: 1.5_
  
  - [x] 3.6 Add API integration to CategoryManager
    - Connect all UI actions to API library methods
    - Implement error handling and notifications
    - Add success/error toast notifications
    - Refresh list after operations
    - _Requirements: 4.1, 6.3, 6.4_
  
  - [x] 3.7 Write unit tests for CategoryManager component
    - Test modal open/close behavior
    - Test delete confirmation with products warning
    - Test form validation display
    - Test error notification display
    - _Requirements: 1.3, 8.1_

- [x] 4. Checkpoint - Category Management complete
  - Ensure all category tests pass
  - Manually test category CRUD operations
  - Verify hierarchical display works correctly
  - Ask the user if questions arise

- [x] 5. Implement Order Management backend
  - [x] 5.1 Create order list endpoint with filters
    - Implement `backend/api/api/orders/list.php`
    - Support status filter query parameter
    - Support search query parameter (customer name/email)
    - Join with users table to get customer details
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 5.2 Write property test for order list completeness
    - **Property 8: Order list completeness**
    - **Validates: Requirements 2.1**
  
  - [x] 5.3 Write property test for order status filtering
    - **Property 9: Order status filtering**
    - **Validates: Requirements 2.2**
  
  - [x] 5.4 Write property test for order search by customer
    - **Property 10: Order search by customer**
    - **Validates: Requirements 2.3**
  
  - [x] 5.5 Write property test for multiple filter AND logic
    - **Property 25: Multiple filter AND logic**
    - **Validates: Requirements 7.2**
  
  - [x] 5.6 Create order details endpoint
    - Implement `backend/api/api/orders/details.php`
    - Join with order_items and products tables
    - Return order with all items including product names
    - _Requirements: 2.5_
  
  - [x] 5.7 Write property test for order details completeness
    - **Property 12: Order details completeness**
    - **Validates: Requirements 2.5**
  
  - [x] 5.8 Create order status update endpoint
    - Implement `backend/api/api/orders/update-status.php`
    - Validate status value
    - Update order status and updated_at timestamp
    - Return updated order
    - _Requirements: 2.4_
  
  - [x] 5.9 Write property test for order status update persistence
    - **Property 11: Order status update persistence**
    - **Validates: Requirements 2.4**
  
  - [x] 5.10 Create user orders endpoint
    - Implement `backend/api/api/orders/by-user.php`
    - Return all orders for a specific user
    - Sort by created_at descending
    - _Requirements: 2.6_
  
  - [x] 5.11 Write property test for customer order history
    - **Property 13: Customer order history completeness and ordering**
    - **Validates: Requirements 2.6**

- [x] 6. Implement Order Management frontend
  - [x] 6.1 Create OrderManager component structure
    - Create component file with state management
    - Implement tab layout integration
    - Add loading states
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.2 Implement order list view
    - Display orders in table
    - Show customer name, email, total, status, date
    - Add status filter dropdown
    - Add search input for customer name/email
    - Add view details button
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 6.3 Implement order status update UI
    - Add status dropdown in each order row
    - Handle status change with confirmation
    - Update order list after status change
    - _Requirements: 2.4_
  
  - [x] 6.4 Implement order details modal
    - Create modal to display order details
    - Show all order items with product names, quantities, prices
    - Calculate and display order total
    - Show customer information
    - _Requirements: 2.5_
  
  - [x] 6.5 Add API integration to OrderManager
    - Connect all UI actions to API library methods
    - Implement error handling and notifications
    - Handle loading states during API calls
    - _Requirements: 4.1, 6.3, 6.4_
  
  - [x] 6.6 Write unit tests for OrderManager component
    - Test filter and search functionality
    - Test status update confirmation
    - Test order details modal display
    - Test error handling
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 7. Checkpoint - Order Management complete
  - Ensure all order tests pass
  - Manually test order viewing and status updates
  - Verify filters and search work correctly
  - Ask the user if questions arise

- [x] 8. Implement User Management backend
  - [x] 8.1 Create user list endpoint with filters
    - Implement `backend/api/api/users/list.php`
    - Support role filter query parameter
    - Support search query parameter (name/email)
    - _Requirements: 3.1, 3.2, 3.8_
  
  - [x] 8.2 Write property test for user list completeness
    - **Property 14: User list completeness**
    - **Validates: Requirements 3.1**
  
  - [x] 8.3 Write property test for user role filtering
    - **Property 15: User role filtering**
    - **Validates: Requirements 3.2**
  
  - [x] 8.4 Write property test for user search
    - **Property 19: User search by name or email**
    - **Validates: Requirements 3.8**
  
  - [x] 8.5 Create user details endpoint
    - Implement `backend/api/api/users/details.php`
    - Return user profile
    - Include user's order history
    - _Requirements: 3.3_
  
  - [x] 8.6 Write property test for user details completeness
    - **Property 16: User details completeness**
    - **Validates: Requirements 3.3**
  
  - [x] 8.7 Create user role update endpoint
    - Implement `backend/api/api/users/update-role.php`
    - Validate role value (admin or user)
    - Update user role
    - Return updated user
    - _Requirements: 3.4, 3.5_
  
  - [x] 8.8 Write property test for user role update persistence
    - **Property 17: User role update persistence**
    - **Validates: Requirements 3.4, 3.5**
  
  - [x] 8.9 Create user delete endpoint
    - Implement `backend/api/api/users/delete.php`
    - Delete user from database
    - Handle foreign key constraints (orders)
    - _Requirements: 3.7_
  
  - [x] 8.10 Write property test for user deletion
    - **Property 18: User deletion removes from database**
    - **Validates: Requirements 3.7**

- [x] 9. Implement User Management frontend
  - [x] 9.1 Create UserManager component structure
    - Create component file with state management
    - Implement tab layout integration
    - Add loading states
    - _Requirements: 6.1, 6.2_
  
  - [x] 9.2 Implement user list view
    - Display users in table
    - Show name, email, role, registration date
    - Add role filter dropdown
    - Add search input for name/email
    - Add view details and delete buttons
    - _Requirements: 3.1, 3.2, 3.8_
  
  - [x] 9.3 Implement user role update UI
    - Add role dropdown in each user row
    - Handle role change with confirmation
    - Update user list after role change
    - _Requirements: 3.4, 3.5_
  
  - [x] 9.4 Implement user details modal
    - Create modal to display user details
    - Show complete user profile
    - Display user's order history
    - _Requirements: 3.3_
  
  - [x] 9.5 Implement user delete confirmation
    - Create confirmation dialog
    - Handle delete action
    - Show error if user has orders (foreign key constraint)
    - _Requirements: 3.6, 3.7, 6.6_
  
  - [x] 9.6 Add API integration to UserManager
    - Connect all UI actions to API library methods
    - Implement error handling and notifications
    - Handle loading states during API calls
    - _Requirements: 4.1, 6.3, 6.4_
  
  - [x] 9.7 Write unit tests for UserManager component
    - Test filter and search functionality
    - Test role update confirmation
    - Test user details modal display
    - Test delete confirmation dialog
    - _Requirements: 3.2, 3.4, 3.6_

- [x] 10. Checkpoint - User Management complete
  - Ensure all user tests pass
  - Manually test user management operations
  - Verify role updates and deletion work correctly
  - Ask the user if questions arise

- [x] 11. Implement shared components and polish
  - [x] 11.1 Create AdminDashboard container component
    - Implement tab navigation (Categories, Orders, Users)
    - Handle tab switching
    - Verify user authentication and admin role
    - Redirect non-admin users
    - _Requirements: 5.1, 5.2, 6.1_
  
  - [x] 11.2 Create shared notification system
    - Implement toast notification component
    - Support success, error, warning, info types
    - Auto-dismiss after timeout
    - _Requirements: 6.3, 6.4_
  
  - [x] 11.3 Create shared modal component
    - Implement reusable modal wrapper
    - Support different sizes
    - Handle backdrop click to close
    - Add close button
    - _Requirements: 6.5_
  
  - [x] 11.4 Create shared confirmation dialog component
    - Implement reusable confirmation dialog
    - Support custom messages and actions
    - Add cancel and confirm buttons
    - _Requirements: 6.6_
  
  - [x] 11.5 Implement responsive design
    - Add responsive styles for mobile and tablet
    - Test on different screen sizes
    - Ensure tables are scrollable on small screens
    - _Requirements: 6.7_
  
  - [x] 11.6 Add consistent styling
    - Apply consistent colors, fonts, spacing
    - Match existing admin interface design
    - Add hover states and transitions
    - _Requirements: 6.8_

- [x] 12. Implement authorization and error handling
  - [x] 12.1 Create authentication middleware for backend
    - Implement session validation
    - Check user is logged in
    - Check user has admin role
    - Return 401/403 errors appropriately
    - Apply to all admin endpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 12.2 Write property test for admin role validation
    - **Property 23: Admin role validation on API requests**
    - **Validates: Requirements 5.4**
  
  - [x] 12.3 Write property test for unauthorized request rejection
    - **Property 24: Unauthorized request rejection**
    - **Validates: Requirements 5.5**
  
  - [x] 12.4 Implement comprehensive error handling in API library
    - Handle network errors
    - Handle timeout errors
    - Handle authentication errors (redirect to login)
    - Handle validation errors
    - Handle server errors
    - _Requirements: 2.8, 4.5, 8.5, 8.6_
  
  - [x] 12.5 Write property test for API error responses
    - **Property 20: API error responses**
    - **Validates: Requirements 4.5**
  
  - [x] 12.6 Write property test for form validation errors
    - **Property 21: Form validation errors**
    - **Validates: Requirements 8.1**
  
  - [x] 12.7 Write property test for sensitive information protection
    - **Property 22: Sensitive information protection**
    - **Validates: Requirements 8.8**
  
  - [x] 12.8 Add error logging to backend
    - Log all errors to error log file
    - Include timestamp, endpoint, error message
    - Never expose sensitive details to frontend
    - _Requirements: 8.7, 8.8_

- [x] 13. Implement image upload validation
  - [x] 13.1 Add image upload validation to category endpoints
    - Validate file type (jpg, png, gif, webp)
    - Validate file size (max 5MB)
    - Return validation errors if invalid
    - _Requirements: 1.8_
  
  - [x] 13.2 Write property test for image upload validation
    - **Property 7: Image upload validation**
    - **Validates: Requirements 1.8**
  
  - [x] 13.3 Add image upload UI to category form
    - Add file input to category modal
    - Show preview of selected image
    - Display upload progress
    - Handle upload errors
    - _Requirements: 1.8_

- [x] 14. Final integration and testing
  - [x] 14.1 Write integration tests for complete workflows
    - Test complete category CRUD workflow
    - Test complete order management workflow
    - Test complete user management workflow
    - Test authentication and authorization flow
    - _Requirements: All_
  
  - [x] 14.2 Run all property-based tests
    - Ensure all 25 properties pass with 100+ iterations
    - Fix any failures
    - _Requirements: All_
  
  - [x] 14.3 Run all unit tests
    - Ensure all unit tests pass
    - Verify code coverage meets 80% goal
    - _Requirements: All_
  
  - [x] 14.4 Manual testing and bug fixes
    - Test all features manually
    - Test on different browsers
    - Test responsive design on mobile/tablet
    - Fix any bugs found
    - _Requirements: All_

- [x] 15. Final checkpoint - Complete feature
  - Ensure all tests pass
  - Verify all requirements are met
  - Confirm with user that feature is complete
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation with full test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and quality
- Property tests validate universal correctness properties (25 total)
- Unit tests validate specific examples, edge cases, and UI interactions
- Integration tests validate complete user workflows
- The implementation follows a vertical slice pattern: backend → frontend → tests for each feature
- Authentication and authorization are implemented across all endpoints
- Error handling is comprehensive at both frontend and backend layers
