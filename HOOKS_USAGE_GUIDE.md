# Custom Hooks Usage Guide

## Overview

Two custom hooks have been implemented to improve the application:

### 1. **useTabSwitcher** Hook

**Location:** `Frontend/src/hooks/useTabSwitcher.js`

**Purpose:** Manages tab navigation and history tracking

**Usage:**

```javascript
import { useTabSwitcher } from "./hooks/useTabSwitcher";

function MyComponent() {
  const { activeTab, tabHistory, switchTab, goBack, reset, canGoBack } =
    useTabSwitcher("dashboard");

  return (
    <>
      <button onClick={() => switchTab("products")}>Go to Products</button>
      <button onClick={goBack} disabled={!canGoBack}>
        Back
      </button>
      <button onClick={reset}>Reset</button>
      <p>Current: {activeTab}</p>
      <p>History: {tabHistory.join(" > ")}</p>
    </>
  );
}
```

**Available Methods:**

- `switchTab(tabName)` - Switch to a specific tab
- `goBack()` - Go back to previous tab
- `reset()` - Reset to default tab
- `canGoBack` - Boolean indicating if navigation back is possible

**Current Usage in App.tsx:**

- Could replace the `useState('dashboard')` for `activeTab`
- Enables better navigation tracking

---

### 2. **useNotification** Hook

**Location:** `Frontend/src/hooks/useNotification.js`

**Purpose:** Centralized notification management

**Usage:**

```javascript
import { useNotification } from "./hooks/useNotification";

function MyComponent() {
  const { notifications, success, error, warning, info, removeNotification } =
    useNotification();

  return (
    <>
      <button onClick={() => success("Operation successful!")}>
        Show Success
      </button>
      <button onClick={() => error("Something went wrong!")}>Show Error</button>
      <button onClick={() => warning("Be careful!")}>Show Warning</button>
      <button onClick={() => info("FYI: New info")}>Show Info</button>

      {/* Render notifications */}
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification ${notif.type}`}>
          {notif.message}
          <button onClick={() => removeNotification(notif.id)}>×</button>
        </div>
      ))}
    </>
  );
}
```

**Available Methods:**

- `success(message, duration)` - Show success notification
- `error(message, duration)` - Show error notification
- `warning(message, duration)` - Show warning notification
- `info(message, duration)` - Show info notification
- `addNotification(message, type, duration)` - Add custom notification
- `removeNotification(id)` - Manually remove a notification
- `notifications` - Array of current notifications

**Default Duration:** 3000ms (3 seconds)

**Current Usage in App.tsx:**

- App is already using `useToast()` for notifications
- `useNotification()` could be integrated as an alternative or complement

---

## Where These Hooks Are Intended to Be Used

### useTabSwitcher

✅ **Recommended for:**

- Main App.tsx component for activeTab management
- Multi-step forms (onboarding, product creation)
- Modal navigation flows
- Any component with multiple view states

❌ **Current Status in App.tsx:**

- Currently using: `const [activeTab, setActiveTab] = useState('dashboard')`
- Could be replaced with `useTabSwitcher('dashboard')`

### useNotification

✅ **Recommended for:**

- Displaying toast notifications from API calls
- Form submission feedback
- Error messages from operations
- Success confirmations for CRUD operations
- Warning messages for destructive actions

✅ **Currently Used In App.tsx:**

- Uses `useToast()` for: addProduct, importModal, exportModal, processOrder
- Could complement or replace with `useNotification()`

✅ **Existing Usage in Components:**

- Reports.jsx - Shows alerts for export and details
- All modal components - Show alerts on success/error
- Dashboard - Shows alerts (could use notifications)

---

## Integration Examples

### Example 1: Using useNotification in a Form Component

```javascript
import { useNotification } from "../hooks/useNotification";

function ProductForm() {
  const { success, error } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await productService.createProduct(formData);
      success("Sản phẩm đã được thêm thành công!");
      // Reset form, etc.
    } catch (err) {
      error("Lỗi khi thêm sản phẩm: " + err.message);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Example 2: Using useTabSwitcher in Multi-Step Wizard

```javascript
import { useTabSwitcher } from "../hooks/useTabSwitcher";

function OrderWizard() {
  const { activeTab, switchTab, goBack, canGoBack } = useTabSwitcher("step1");

  return (
    <div>
      {activeTab === "step1" && <Step1 onNext={() => switchTab("step2")} />}
      {activeTab === "step2" && <Step2 onNext={() => switchTab("step3")} />}
      {activeTab === "step3" && <Step3 />}

      <button onClick={goBack} disabled={!canGoBack}>
        Back
      </button>
    </div>
  );
}
```

---

## Summary

| Hook            | Purpose                  | Status         | Location                   |
| --------------- | ------------------------ | -------------- | -------------------------- |
| useTabSwitcher  | Tab navigation & history | ✅ Implemented | `hooks/useTabSwitcher.js`  |
| useNotification | Notification management  | ✅ Implemented | `hooks/useNotification.js` |

Both hooks are ready to use! Import them in any component that needs tab management or notification handling.
