# Quick Test Guide - Shift Assignment Feature

## Prerequisites

- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173 (or your Vite port)
- Admin account logged in

## Test Scenario 1: Create Shifts

1. Navigate to **Quản lý ca làm** → **Danh sách ca làm**
2. Click **Thêm ca làm**
3. Create three shifts:

   **Shift 1 - Ca sáng**

   - Tên ca làm: Ca sáng
   - Giờ bắt đầu: 06:00
   - Giờ kết thúc: 14:00
   - Mô tả: Ca làm sáng

   **Shift 2 - Ca chiều**

   - Tên ca làm: Ca chiều
   - Giờ bắt đầu: 14:00
   - Giờ kết thúc: 22:00
   - Mô tả: Ca làm chiều

   **Shift 3 - Ca tối**

   - Tên ca làm: Ca tối
   - Giờ bắt đầu: 22:00
   - Giờ kết thúc: 06:00
   - Mô tả: Ca làm tối đêm

4. Verify all shifts appear in table with Edit/Delete buttons ✅

## Test Scenario 2: Assign Shifts to Employees

1. Click **Gán ca làm cho nhân viên** tab
2. The form should show:

   - Date picker (default today)
   - Employee dropdown (showing all staff members)
   - Shift dropdown (showing all created shifts)

3. Assign shifts:

   - **Employee 1** → **Ca sáng** → **Today**
   - **Employee 2** → **Ca chiều** → **Today**
   - **Employee 3** → **Ca tối** → **Today**

4. After each assignment, success message should appear ✅
5. Verify assignments appear in "Ca làm đã gán hôm nay" section ✅

## Test Scenario 3: Edit Shift

1. In shift table, click **Edit** icon on any shift
2. Modify the shift details (e.g., change time)
3. Click **Lưu**
4. Verify update confirmed in alert ✅
5. Table should refresh with new values ✅

## Test Scenario 4: Delete Shift

1. Click **Delete** icon on a shift
2. Confirm deletion in dialog
3. Shift should disappear from table ✅

## Test Scenario 5: View Different Dates

1. In assign form, change the date
2. Click date picker and select another date
3. Shifts for that date should load (if assigned)
4. Assign shift to different date ✅

## Test Scenario 6: API Verification (Optional - DevTools)

Open Browser Console (F12) and check Network tab:

**Expected API Calls:**

```
GET /api/shifts                    ← List shifts
GET /api/users                     ← List employees
GET /api/shifts/by-date?date=...   ← Get assignments
POST /api/shifts                   ← Create shift
PUT /api/shifts/:id                ← Update shift
DELETE /api/shifts/:id             ← Delete shift
POST /api/shifts/assign            ← Assign shift
```

All should return **200 OK** or **201 Created** ✅

## Expected Responses

### GET /api/shifts (Success)

```json
[
  {
    "_id": "...objectId...",
    "name": "Ca sáng",
    "startTime": "06:00",
    "endTime": "14:00",
    "description": "Ca làm sáng",
    "isActive": true
  }
]
```

### POST /api/shifts/assign (Success)

```json
{
  "_id": "...objectId...",
  "employee": "...userId...",
  "shift": "...shiftId...",
  "date": "2024-01-15",
  "status": "scheduled",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/shifts/by-date (Success)

```json
[
  {
    "_id": "...objectId...",
    "employee": {
      "_id": "...userId...",
      "name": "Nguyễn Văn A",
      "email": "..."
    },
    "shift": {
      "_id": "...shiftId...",
      "name": "Ca sáng",
      "startTime": "06:00",
      "endTime": "14:00"
    },
    "date": "2024-01-15",
    "status": "scheduled"
  }
]
```

## Troubleshooting

### Issue: Shifts not loading

- **Check:** Network tab → /api/shifts should show 200
- **Check:** Token in localStorage valid? (F12 → Application → localStorage)
- **Fix:** Re-login and try again

### Issue: Employee dropdown empty

- **Check:** Users with role='staff' exist in database?
- **Command:** In MongoDB: `db.users.find({ role: 'staff' })`
- **Fix:** Create staff user first in Employees component

### Issue: "Lỗi khi gán ca làm" alert

- **Check:** Both employeeId and shiftId selected?
- **Check:** Network response in DevTools (should show 201)
- **Check:** Is logged-in user admin? (Check token role in DevTools)

### Issue: Assignment shows but employee not in list

- **Check:** Employee populate working? See EmployeeShift.js model
- **Fix:** Restart backend server and try again

## Success Criteria ✅

- [x] All 3 shifts can be created
- [x] Shifts display in table with name/time/description
- [x] Employee dropdown shows staff members
- [x] Shift dropdown shows created shifts
- [x] Shifts can be assigned to multiple employees
- [x] Assigned shifts display in the list below form
- [x] Edit shift updates correctly
- [x] Delete shift removes from table
- [x] Date picker allows viewing/assigning shifts for different dates
- [x] All API calls complete successfully (200/201)
- [x] No console errors

## Performance Notes

- Component fetches shifts + employees + assignments on load
- Re-fetches when date changes
- Consider caching employees list to reduce API calls
- Shift list updates after each create/edit/delete

---

**If all tests pass:** ✅ Feature is ready for production use!
