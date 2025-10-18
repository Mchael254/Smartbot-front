# PDF Upload Interface - SmartAcademy Chatbot

This document provides instructions for using the PDF upload interface that has been integrated into the SmartAcademy admin dashboard.

## Features

### ✅ Backend API (Already Working)
- **PDF Upload**: Upload PDF files up to 10MB
- **File Management**: List, view, and delete uploaded PDFs
- **File Validation**: Automatic validation of file type and size
- **Supabase Storage**: Files are stored securely in Supabase storage bucket

### ✅ Frontend Interface (Newly Created)
- **Drag & Drop Upload**: Intuitive drag-and-drop interface for uploading PDFs
- **Progress Tracking**: Real-time upload progress with visual indicators
- **File Management**: View, download, and delete uploaded files
- **Theme Consistency**: Matches the existing app design with green accent color (#00963f)
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### 1. Access PDF Management
1. Log in to the admin dashboard
2. Navigate to the **"PDF Management"** tab in the sidebar
3. You'll see two sub-tabs: "Upload Files" and "Manage Files"

### 2. Upload PDF Files
1. Click on the **"Upload Files"** tab
2. Either:
   - **Drag and drop** PDF files into the upload area
   - **Click "Choose Files"** to browse and select files
3. Watch the upload progress in real-time
4. Successfully uploaded files will automatically appear in the "Manage Files" tab

### 3. Manage Uploaded Files
1. Click on the **"Manage Files"** tab
2. View all uploaded PDFs with:
   - File name and size
   - Upload date and time
   - File path in storage
3. Actions available for each file:
   - **👁️ View**: Open PDF in a new browser tab
   - **⬇️ Download**: Download the PDF file
   - **🗑️ Delete**: Remove the file from storage (with confirmation)

### 4. File Statistics
At the bottom of the interface, you'll see:
- **Total Files**: Number of uploaded PDFs
- **Total Size**: Combined size of all files
- **Last Updated**: Date of the most recent upload

## Technical Details

### Frontend Components Created
- `pdfUpload.tsx` - Drag & drop upload component
- `pdfList.tsx` - File listing and management component  
- `pdfManagement.tsx` - Main PDF management interface
- `pdfService.ts` - API service for backend communication
- `pdf.ts` - TypeScript interfaces and types

### Backend Integration
- Uses existing FastAPI backend with `/pdf` routes
- Integrates with Supabase storage bucket
- Validates file types (.pdf only) and size (max 10MB)
- Provides secure file URLs for viewing/downloading

### Theme Integration
- Uses the same green color (#00963f) as existing buttons
- Consistent typography and spacing with the dashboard
- Tailwind CSS classes for responsive design
- Lucide React icons for consistency

## Configuration

### Environment Variables (Frontend)
Create a `.env` file in the smartacademy directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_PDF_MAX_FILE_SIZE=10485760
VITE_PDF_ALLOWED_EXTENSIONS=.pdf
```

### Backend Configuration
The backend should already be configured with:
- Supabase storage bucket settings
- CORS enabled for frontend domain
- PDF upload routes at `/pdf/upload`, `/pdf/list`, etc.

## File Validation Rules

- **File Type**: Only PDF files (.pdf extension)
- **File Size**: Maximum 10MB per file
- **Multiple Files**: Can upload multiple PDFs simultaneously
- **File Names**: Automatically generates unique filenames to prevent conflicts

## Error Handling

The interface includes comprehensive error handling for:
- Invalid file types (non-PDF files)
- Files exceeding size limits
- Network connection issues
- Backend server errors
- File upload failures

## Next Steps

To start using the PDF upload interface:

1. **Start the Backend**: Ensure the FastAPI backend is running on port 8000
2. **Start the Frontend**: Run the React development server
3. **Access Admin Dashboard**: Log in with admin credentials
4. **Navigate to PDF Management**: Click the new "PDF Management" tab
5. **Upload Your First PDF**: Use the drag & drop interface to upload a PDF file

The interface is now fully integrated and ready for use! The PDF upload functionality works with the existing backend API and maintains the app's design theme throughout.