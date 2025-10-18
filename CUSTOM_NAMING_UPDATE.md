# PDF Upload with Custom Naming - Update Guide

## 🎯 **New Feature: Custom PDF Naming**

The PDF upload interface now allows users to either keep the original filename or provide a custom name during upload!

## ✨ **What's New**

### **Backend Enhancements**
1. **Custom Name Parameter**: The upload endpoint now accepts an optional `custom_name` field
2. **Smart Filename Generation**: 
   - If custom name provided → Uses custom name with safe URL formatting
   - If no custom name → Uses original filename with safe URL formatting
   - Storage filename includes UUID to prevent conflicts
   - Display filename shows the user's preferred name

### **Frontend Enhancements**  
1. **Interactive Naming**: During upload, users can edit the filename in real-time
2. **Original Name Preservation**: Shows original filename as placeholder/fallback
3. **Visual Feedback**: Clear indication of what the file will be saved as
4. **Auto-populate**: Custom name field starts with original filename (without extension)

## 🔧 **How It Works**

### **Upload Process**
1. **File Selection**: User drops or selects PDF files
2. **Name Editing**: For each file, user can:
   - Keep the original name (default)
   - Edit the name in the input field
   - See real-time preview of final filename
3. **Upload**: Files upload with chosen names
4. **Storage**: Backend stores with safe, unique filenames while preserving display names

### **Backend Logic**
```python
# Original filename: "My Document.pdf"
# Custom name: "Project Report"

# Display filename: "Project Report.pdf"  
# Storage filename: "pdfs/Project_Report_a1b2c3d4.pdf"
```

### **Frontend Interface**
```tsx
// During upload, user sees:
┌─────────────────────────────────────┐
│ 📄 My Document.pdf (1.2 MB)        │
│ ┌─────────────────────────────────┐ │
│ │ Project Report              │ │ │
│ └─────────────────────────────────┘ │
│ Leave empty to use: My Document     │
└─────────────────────────────────────┘
```

## 📝 **API Changes**

### **Upload Endpoint**
```bash
POST /pdf/upload
Content-Type: multipart/form-data

# Fields:
- file: PDF file (required)
- custom_name: Custom filename (optional)
```

### **Response Format**  
```json
{
  "id": "uuid-string",
  "filename": "Project Report.pdf",  // Display name
  "file_size": 147098,
  "file_path": "pdfs/Project_Report_a1b2c3d4.pdf",  // Storage path
  "upload_url": "https://...",
  "created_at": "2025-10-17T10:34:36.642Z",
  "message": "PDF uploaded successfully"
}
```

## 🎨 **User Experience**

### **Default Behavior**
- Files upload with original names by default
- No additional user input required
- Maintains backward compatibility

### **Custom Naming**
- Optional input field appears during upload
- Real-time preview of final filename
- Clear indication of what will be saved
- Validation prevents empty/invalid names

### **Visual Indicators**
- **Uploading**: Shows editable name field
- **Completed**: Shows "Saved as: CustomName.pdf"
- **Error**: Clear error messages for validation failures

## 🧪 **Testing Instructions**

### **Test 1: Default Upload (Original Names)**
1. Upload a PDF without changing the name field
2. Verify it saves with the original filename
3. Check that display name matches original

### **Test 2: Custom Name Upload**
1. Upload a PDF and change the name in the input field
2. Verify it saves with the custom name
3. Check that "Saved as:" shows the custom name

### **Test 3: Mixed Upload**
1. Upload multiple PDFs
2. Customize some names, leave others default
3. Verify each file saves with correct naming

### **Test 4: Edge Cases**
1. Try special characters in custom names
2. Try very long custom names
3. Try empty custom names
4. Verify proper sanitization and fallbacks

## 🔍 **Backend Testing**

Use the test script to verify the backend:
```bash
cd /home/venum/Personal/Smartbot/Smartacademy-Chatbot-Backend
python3 test_list_endpoint.py
```

## 📋 **Benefits**

1. **User Control**: Users can organize files with meaningful names
2. **Flexibility**: Option to keep original or customize
3. **Safety**: Backend ensures unique storage names prevent conflicts
4. **Clarity**: Clear visual feedback on what's being saved
5. **Consistency**: Works seamlessly with existing file management features

## 🚀 **Next Steps**

To test the new functionality:

1. **Start Backend**: Ensure FastAPI server is running
2. **Start Frontend**: Run React development server  
3. **Upload Test**: Try uploading PDFs with custom names
4. **Verify Storage**: Check that files appear with correct names in file list
5. **Download Test**: Verify downloaded files have correct names

The custom naming feature is now fully integrated and ready for use! Users can now have full control over how their PDF files are named and organized in the system.

---

## 🛠️ **Technical Details**

### **Security Considerations**
- Custom names are sanitized for URL safety
- Storage filenames include UUIDs to prevent conflicts
- File validation remains strict (PDF only, size limits)

### **Performance Impact**
- Minimal overhead for custom naming
- Same upload speed and progress tracking
- No additional storage requirements

### **Backward Compatibility**
- Existing files unaffected
- API changes are additive (optional parameter)
- Frontend gracefully handles missing custom names