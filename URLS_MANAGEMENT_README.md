# URLs Management Feature

## Overview
The URLs Management feature allows users to add, manage, and control web URLs that can be used as knowledge sources for the AI system. This integrates with the Smartacademy-Chatbot-Backend API to store and manage web URLs.

## Features

### 1. **Add Web URLs**
- Add title, URL, and optional description
- Set active status to control AI knowledge base inclusion
- URL validation to ensure proper format

### 2. **Manage Existing URLs**
- View all stored URLs with metadata
- Toggle active/inactive status
- See creation dates and descriptions
- Click URLs to open in new tab

### 3. **Integration with Knowledge Base**
- Active URLs are available for AI knowledge processing
- Seamless integration with PDF management system
- Real-time status updates

## API Integration

### Backend Endpoints Used:
- `GET /api/urls/active` - Fetch all active URLs
- `POST /api/urls/upload` - Add new URL
- `POST /api/urls/{id}/toggle-active` - Toggle URL status

### Data Flow:
1. **Frontend Service** (`urlsService.ts`) handles API communication
2. **Backend Controller** (`urlController.py`) processes requests
3. **Supabase RPC Functions** manage database operations

## User Interface

### Navigation
- New "Manage URLs" tab in the main PDF management interface
- Shows URL count in tab label: "Manage URLs (X)"

### URL Form
- Clean, responsive form for adding new URLs
- Real-time validation
- Active status checkbox
- Submit feedback with success/error messages

### URL List
- Card-based layout for each URL
- Visual indicators for active/inactive status
- One-click activation/deactivation
- External link access with proper security attributes

## Technical Implementation

### Frontend Components
- **Main Component**: Integrated into `pdfManagement.tsx`
- **Service Layer**: `urlsService.ts` for API communication
- **State Management**: React hooks for URL data and loading states

### Backend Components
- **Routes**: `urlsRoutes.py` - API endpoint definitions
- **Controller**: `urlController.py` - Business logic
- **Models**: `urls.py` - Data structure definitions

### Error Handling
- Network error handling with user feedback
- Form validation with helpful messages
- Auto-hiding error messages (30-second timeout)
- Graceful degradation for API failures

## Usage Instructions

### Adding a URL:
1. Navigate to "Manage URLs" tab
2. Fill in the form with title and URL (required)
3. Optionally add description and set active status
4. Click "Add URL" to submit

### Managing URLs:
1. View all URLs in the list below the form
2. Click the URL text to open in new tab
3. Use "Activate"/"Deactivate" buttons to control status
4. Active URLs appear with green indicators

### Refreshing Data:
- Click "Refresh" button to reload URL list
- Data auto-loads when switching to URLs tab
- Form submission triggers automatic refresh

## Configuration

### Environment Variables:
- `REACT_APP_BACKEND_URL`: Backend API base URL (defaults to localhost:8000)

### Default Settings:
- New URLs default to inactive status
- URL validation requires proper protocol (http/https)
- Display URLs truncated at 60 characters with ellipsis

## Future Enhancements

### Potential Features:
- Bulk URL import from file
- URL categorization and tagging  
- URL health checking and validation
- Integration with web scraping for content preview
- Advanced filtering and search capabilities
- Export URLs to various formats

### Performance Optimizations:
- Pagination for large URL lists
- Caching for frequently accessed data
- Debounced form validation
- Lazy loading for URL metadata