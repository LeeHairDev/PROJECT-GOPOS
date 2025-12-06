# 🚀 Quick Start - Cloudinary Integration

## 5-Minute Setup

### Step 1: Cloudinary Account (2 minutes)

```
1. Visit: https://cloudinary.com
2. Click "Sign Up For Free"
3. Create account and verify email
```

### Step 2: Get Credentials (2 minutes)

```
1. Login to Cloudinary Dashboard
2. Copy "Cloud Name" visible at top
3. Go Settings → Upload
4. Create upload preset:
   - Name: gopos-unsigned
   - Signing: Unsigned ⚠️
   - Save
5. Copy preset name
```

### Step 3: Create .env File (1 minute)

```bash
cd Frontend
copy .env.example .env
```

Edit `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=gopos-unsigned
```

### Step 4: Restart & Test

```bash
npm run dev
```

## Test Upload

1. Go to **Products** → Click add product
2. Select **image file** under "Ảnh sản phẩm"
3. See preview appear
4. Click **Lưu**
5. ✅ Image saved to Cloudinary, URL in MongoDB

## Where Images Are Used

| Feature          | File                              | Folder             |
| ---------------- | --------------------------------- | ------------------ |
| Product Images   | AddProductModal, EditProductModal | `gopos/products/`  |
| Customer Avatars | EditCustomerModal                 | `gopos/customers/` |
| Employee Avatars | EditEmployeeModal                 | `gopos/employees/` |

## Common Issues

| Issue                           | Solution                              |
| ------------------------------- | ------------------------------------- |
| "Cloudinary chưa được cấu hình" | Create .env file, restart server      |
| Upload fails                    | Check file size < 5MB, is valid image |
| Image not showing               | Verify URL is valid, check MongoDB    |
| Can't find Cloud Name           | It's at top of Cloudinary dashboard   |

## Files Modified

```
✅ Created: uploadService.js
✅ Updated: AddProductModal.jsx
✅ Updated: EditProductModal.jsx
✅ Updated: EditCustomerModal.jsx
✅ Updated: EditEmployeeModal.jsx
✅ Created: .env.example
✅ Updated: .gitignore
```

## Next Steps After Setup

1. ✅ Create .env file
2. ✅ Test product upload
3. ✅ Test customer avatar upload
4. ✅ Test employee avatar upload
5. ✅ Verify images display correctly

## Support

📖 Full Guide: `CLOUDINARY_SETUP.md`
📋 Completion Report: `CLOUDINARY_INTEGRATION_COMPLETE.md`
