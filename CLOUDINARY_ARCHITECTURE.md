# Cloudinary Integration Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GOPOS SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      FRONTEND (React)                      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Products   │  │  Customers   │  │  Employees   │   │  │
│  │  │   Component  │  │  Component   │  │  Component   │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                 │                 │            │  │
│  │         └────────────────┬┴─────────────────┘            │  │
│  │                          │                              │  │
│  │  ┌──────────────────────▼──────────────────────┐       │  │
│  │  │   Edit/Add Product/Customer/Employee       │       │  │
│  │  │   Modals                                   │       │  │
│  │  │                                            │       │  │
│  │  │  ┌─────────────────────────────────────┐  │       │  │
│  │  │  │ File Input: <input type="file">    │  │       │  │
│  │  │  │ Preview: <img src={imagePreview}>  │  │       │  │
│  │  │  │ Handler: handleImageChange()       │  │       │  │
│  │  │  └──────────────────┬──────────────────┘  │       │  │
│  │  └─────────────────────┼──────────────────────┘       │  │
│  │                        │                              │  │
│  │  ┌─────────────────────▼──────────────────────┐       │  │
│  │  │ uploadService.js                           │       │  │
│  │  │ ✓ File validation (type, size)            │       │  │
│  │  │ ✓ FileReader preview generation            │       │  │
│  │  │ ✓ Cloudinary API call                      │       │  │
│  │  └──────────────────┬──────────────────────────┘       │  │
│  │                     │                                  │  │
│  └─────────────────────┼──────────────────────────────────┘  │
│                        │ HTTPS POST                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
        ┌─────────────────┴──────────────────┐
        │                                    │
        ▼                                    ▼
    ┌──────────────────────────┐   ┌──────────────────────────┐
    │   CLOUDINARY API         │   │   BACKEND (Node.js)      │
    │                          │   │                          │
    │ /v1_1/{cloud}/           │   │ ┌──────────────────────┐ │
    │ image/upload             │   │ │ productService       │ │
    │                          │   │ │ customerService      │ │
    │ Receives file            │   │ │ userService          │ │
    │ Stores in cloud          │   │ │                      │ │
    │ Returns secure_url       │   │ │ Receives URL from    │ │
    │                          │   │ │ frontend             │ │
    │ Response:                │   │ │                      │ │
    │ {                        │   │ │ Saves to MongoDB:    │ │
    │   secure_url: "https://  │   │ │ {                    │ │
    │   res.cloudinary.com/    │   │ │   image: "https://..." │ │
    │   ..."                   │   │ │ }                    │ │
    │ }                        │   │ │                      │ │
    │                          │   │ └──────────────────────┘ │
    └──────────────────────────┘   └──────────────────────────┘
              ▲                                    ▲
              │                                    │
              └────────────────────┬───────────────┘
                                   │
                          ┌────────▼────────┐
                          │   MONGODB       │
                          │                 │
                          │ Products        │
                          │ {               │
                          │   name: "...",  │
                          │   image: "URL" ◄─ URL stored
                          │ }               │
                          │                 │
                          │ Customers       │
                          │ {               │
                          │   name: "...",  │
                          │   avatar: "URL" │
                          │ }               │
                          │                 │
                          │ Users           │
                          │ {               │
                          │   name: "...",  │
                          │   avatar: "URL" │
                          │ }               │
                          │                 │
                          └─────────────────┘
```

## Data Flow Diagram

```
User Action (Select Image)
          ↓
┌─────────────────────────────────┐
│ handleImageChange triggered      │
│ e.target.files[0] has File       │
└────────────┬────────────────────┘
             ↓
    ┌────────────────────┐
    │ Validation Check   │
    │ ✓ file.type       │
    │ ✓ file.size       │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │ FileReader API     │
    │ Generate preview   │
    │ data URL           │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │ Display Preview    │
    │ <img src={preview}> │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │ uploadImage()      │
    │ called             │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │ FormData created   │
    │ append file        │
    │ append preset      │
    │ append folder      │
    └────────┬───────────┘
             ↓
    ┌────────────────────────────────┐
    │ fetch() to Cloudinary          │
    │ POST /image/upload             │
    │ setUploading(true)             │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ Cloudinary Processes           │
    │ • Validates upload             │
    │ • Stores in cloud              │
    │ • Optimizes image              │
    │ • Returns secure_url           │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ Response received              │
    │ data.secure_url extracted      │
    │ setFormData({image: url})       │
    │ setUploading(false)            │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ Form submitted                 │
    │ formData sent to backend       │
    │ (contains image URL)           │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ Backend saves to MongoDB       │
    │ {                              │
    │   name: "Product name",        │
    │   image: "https://res...."     │
    │ }                              │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ Success!                       │
    │ "Thêm sản phẩm thành công"    │
    │ Modal closes                   │
    │ List refreshes with image      │
    └────────────────────────────────┘
```

## Folder Organization in Cloudinary

```
Cloudinary Cloud Storage
your_cloud_name/
│
└── gopos/
    │
    ├── products/
    │   ├── abc123def456.jpg
    │   ├── xyz789uvw012.jpg
    │   └── ... (all product images)
    │
    ├── customers/
    │   ├── cust001_avatar.jpg
    │   ├── cust002_avatar.jpg
    │   └── ... (all customer avatars)
    │
    └── employees/
        ├── emp001_avatar.jpg
        ├── emp002_avatar.jpg
        └── ... (all employee avatars)
```

## Component Integration Map

```
┌─────────────────────────────────────────┐
│        Frontend Application              │
├─────────────────────────────────────────┤
│                                          │
│  Products.jsx                           │
│  ├─ AddProductModal.jsx ──────┐        │
│  │   ├─ file input             │        │
│  │   ├─ preview display        │        │
│  │   └─ uploadService call     │        │
│  │                             │        │
│  └─ EditProductModal.jsx ─────┤        │
│      ├─ file input             │        │
│      ├─ preview display        │        │
│      └─ uploadService call     │        │
│                                │        │
│  Customers.jsx                 │        │
│  └─ EditCustomerModal.jsx ────┤        │
│      ├─ file input             │        │
│      ├─ preview display        │        │
│      └─ uploadService call     │        │
│                                │        │
│  Employees.jsx                 │        │
│  └─ EditEmployeeModal.jsx ────┤        │
│      ├─ file input             │        │
│      ├─ preview display        │        │
│      └─ uploadService call     │        │
│                                │        │
│                                ▼        │
│                      uploadService.js   │
│                      • uploadImage()    │
│                      • deleteImage()    │
│                                          │
└─────────────────────────────────────────┘
                    │
                    │ import.meta.env
                    │ VITE_CLOUDINARY_*
                    │
                    ▼
         ┌────────────────────┐
         │   .env file        │
         ├────────────────────┤
         │ VITE_CLOUDINARY_   │
         │ CLOUD_NAME=xyz     │
         │ VITE_CLOUDINARY_   │
         │ UPLOAD_PRESET=abc  │
         └────────────────────┘
```

## Environment Variable Flow

```
.env (local - NOT committed)
    │
    ├─ VITE_CLOUDINARY_CLOUD_NAME
    └─ VITE_CLOUDINARY_UPLOAD_PRESET
            │
            ▼
    import.meta.env (Vite)
            │
            ▼
    uploadService.js
            │
            ├─ CLOUDINARY_CLOUD_NAME
            └─ CLOUDINARY_UPLOAD_PRESET
            │
            ▼
    Cloudinary API URL
    https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload
```

## State Management in Upload

```
Modal Component State:
├─ formData
│  ├─ name
│  ├─ price
│  ├─ image: "" ──────────────┐
│  └─ ...                     │ After upload:
│                             │ image: "https://res.cloudinary.com/..."
├─ uploading: false ──────────┼─ Becomes true during upload
│                             │ Becomes false after response
├─ imagePreview: null ────────┼─ Generated by FileReader
│                             │ Displayed in UI
└─ loading: false             Becomes true during form submit
   (for save button)
```

## Security Flow

```
Frontend (.env NOT committed)
    │
    ├─ VITE_CLOUDINARY_* variables
    │  (in environment only, not in code)
    │
    ▼
uploadService.js
    │
    ├─ Reads from import.meta.env
    │ (variables substituted by Vite at build time)
    │
    ├─ Warning if missing config
    │
    ▼
FormData preparation
    │
    ├─ file + upload_preset + folder
    │ (NO cloud secret key needed - unsigned upload)
    │
    ▼
HTTPS POST to Cloudinary
    │
    ├─ Cloudinary validates preset
    ├─ Stores image
    ├─ Returns secure_url
    │
    ▼
Response handling
    │
    ├─ Extract secure_url
    ├─ Save to formData
    └─ Submit with URL to backend

Backend
    │
    ├─ Receives URL (not file)
    ├─ Validates URL format
    ├─ Stores in MongoDB
    │
    ▼
Result: Image in Cloudinary, URL in DB
```

## File Upload Size/Type Validation

```
User selects file
        ↓
Check: file.type.startsWith('image/')
    ├─ YES → Continue
    └─ NO → Alert "File phải là ảnh"
        ↓
Check: file.size ≤ 5MB (5242880 bytes)
    ├─ YES → Continue
    └─ NO → Alert "Ảnh quá lớn (max 5MB)"
        ↓
All validations passed
    ↓
Upload to Cloudinary
```

## Display Flow

```
MongoDB stores URL:
{ product: { image: "https://res.cloudinary.com/..." } }
        ↓
Frontend fetches from API
        ↓
React renders:
<img src={product.image} />
        ↓
Browser requests image from Cloudinary URL
        ↓
Cloudinary CDN delivers optimized image
        ↓
Image displays with optimal performance
```
