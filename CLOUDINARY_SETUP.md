# 📸 Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud service for managing images and videos. It allows you to upload, store, and serve images from the cloud instead of storing them locally. This is perfect for POS systems where you need product images, customer avatars, and employee photos.

## Benefits

✅ Centralized image storage
✅ Automatic image optimization
✅ Secure URLs for images
✅ Easy integration with MongoDB (store only URLs, not files)
✅ Free tier available (25GB storage)

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Click "Sign Up For Free"
3. Fill in your details and create account
4. Verify your email

### 2. Get Your Credentials

1. After login, you'll see your **Dashboard**
2. Look for **Cloud Name** at the top - this is your `VITE_CLOUDINARY_CLOUD_NAME`
3. Go to **Settings** (gear icon)
4. Navigate to **Upload** tab
5. Scroll down to **Upload presets**
6. Click **Add upload preset**
7. Set these values:
   - **Preset name**: Choose something like `gopos-unsigned`
   - **Signing mode**: Select **Unsigned** ⚠️ (Important!)
   - Click **Save**
8. Copy this preset name - this is your `VITE_CLOUDINARY_UPLOAD_PRESET`

### 3. Create .env File

In your `Frontend` folder, create a file named `.env` with:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

**Example:**

```env
VITE_CLOUDINARY_CLOUD_NAME=dqxyz12345
VITE_CLOUDINARY_UPLOAD_PRESET=gopos-unsigned
```

### 4. Restart Development Server

```bash
# In Frontend folder
npm run dev
```

## How It Works

### Image Upload Flow

1. **User selects image** in form
2. **Client-side validation**
   - Check file type (must be image)
   - Check file size (max 5MB)
   - Generate preview for user
3. **Upload to Cloudinary**
   - sendImage via HTTP POST to Cloudinary API
   - Cloudinary stores the image
   - Returns `secure_url` (HTTPS link to image)
4. **Save URL to MongoDB**
   - Instead of saving the image file, we save just the URL
   - URL is stored in product, customer, or employee record

### Storage Organization

Images are organized in folders on Cloudinary:

- `gopos/products/` - Product images
- `gopos/customers/` - Customer avatars
- `gopos/employees/` - Employee avatars

## Features Implemented

### ✅ Add Product with Image

1. Click "Thêm sản phẩm mới"
2. Fill in product details
3. Click "Chọn file" under "Ảnh sản phẩm"
4. Select an image
5. See preview after upload
6. Click "Lưu" to save

### ✅ Edit Product Image

1. Click edit button on any product
2. Upload new image or leave blank to keep existing
3. Click "Lưu"

### ✅ Edit Customer Avatar

1. Click edit button on any customer
2. Upload new avatar image
3. Click "Lưu"

### ✅ Edit Employee Avatar

1. Click edit button on any employee
2. Upload new avatar image
3. Click "Lưu"

## Troubleshooting

### Issue: "Cloudinary chưa được cấu hình"

**Solution:**

- Check if `.env` file exists in Frontend folder
- Verify correct variable names (must start with `VITE_`)
- Restart dev server after creating .env

### Issue: Upload fails silently

**Solution:**

- Open browser DevTools (F12) → Console
- Check error messages
- Verify upload preset is set to "Unsigned"
- Verify file size is under 5MB
- Verify file is a valid image format

### Issue: Images not displaying

**Solution:**

- Check if image URL is valid by clicking it
- Verify image was actually uploaded (check Cloudinary dashboard)
- Clear browser cache
- Check MongoDB to see if URL is stored correctly

## Free Tier Limits

- 25 GB storage
- 25 GB bandwidth
- Sufficient for testing and small businesses
- Upgrade to paid plan as needed

## Database Schema

### Product Model (Example)

**Before (with file upload):**

```javascript
{
  _id: "...",
  name: "Coca",
  image: <binary file data> // ❌ Wastes storage
}
```

**After (with Cloudinary):**

```javascript
{
  _id: "...",
  name: "Coca",
  image: "https://res.cloudinary.com/dqxyz/image/upload/v1234/gopos/products/abc123.jpg" // ✅ Just URL
}
```

## Next Steps

1. ✅ Setup Cloudinary account
2. ✅ Create .env file with credentials
3. ✅ Test by uploading a product image
4. ✅ Verify image appears in Products list
5. ✅ Upload customer/employee avatars
6. ✅ Test edit functionality

## Security Notes

⚠️ **Important:**

- `.env` file is NOT committed to Git (see .gitignore)
- Upload preset is set to "Unsigned" = publicly accessible
- Don't use this for sensitive authentication credentials
- Cloudinary handles image security and HTTPS delivery

## Support

- Cloudinary Documentation: https://cloudinary.com/documentation
- API Reference: https://cloudinary.com/documentation/image_upload_api
- Free tier FAQ: https://cloudinary.com/pricing
