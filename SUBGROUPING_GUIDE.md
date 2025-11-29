# Sub-Grouping Feature - Visual Guide

## 🎯 Where is the "Then By" Control?

### Location
The "Then By" dropdown appears **DYNAMICALLY** on the same row as the grouping controls:

```
┌───────────────────────────────────────────────────────────────┐
│  🔍 Search [.......] [Filters] [Clear All]                   │
├───────────────────────────────────────────────────────────────┤
│  ⬍ Sort By: [dropdown] ↕️  🔲 Group By: [dropdown]            │ ← Row 1
│                                                                │
│  🔲 Then By: [dropdown]  ← APPEARS HERE WHEN GROUP IS SELECTED│ ← Row 2
│                                                                │
│                                      50 records                │
└───────────────────────────────────────────────────────────────┘
```

## 🔍 How to See It:

### Step 1: No Grouping (Initial State)
```
Sort By: [None ▼]  Group By: [None ▼]           0 records
```
**Result:** No "Then By" visible

---

### Step 2: Select Main Group
```
Sort By: [None ▼]  Group By: [Department ▼]     50 records
                   Then By: [None ▼]  ← APPEARS!
```
**Result:** "Then By" dropdown appears on next line

---

### Step 3: Select Sub-Group
```
Sort By: [None ▼]  Group By: [Department ▼]     50 records
                   Then By: [Status ▼]  ← Selected!
```
**Result:** Data now grouped by Department, then by Status

---

## 💡 Why You Might Not See It:

### Reason 1: No Main Group Selected
- ❌ "Group By" is set to "None"
- ✅ **Solution:** Select any field in "Group By" dropdown first

### Reason 2: No Suitable Fields
- ❌ Master has only 1 dropdown/text field
- ✅ **Solution:** Create master with at least 2 dropdown or text fields

### Reason 3: Looking in Wrong Place
- ❌ Looking for it next to "Group By"
- ✅ **Actual Location:** On the line BELOW "Group By"

---

## 🧪 Quick Test:

1. **Go to Master Builder**
2. **Create a test master with these fields:**
   - Field 1: Text (Name)
   - Field 2: Dropdown (Department)
   - Field 3: Dropdown (Status)

3. **Add test data:**
   - Record 1: John, Sales, Active
   - Record 2: Jane, Sales, Inactive
   - Record 3: Bob, IT, Active

4. **Use Grouping:**
   ```
   Group By: Department
   ```
   → "Then By" appears below

5. **Add Sub-Grouping:**
   ```
   Then By: Status
   ```

6. **Result:**
   ```
   📦 Sales
      📦 Active (1)
         - John
      📦 Inactive (1)
         - Jane
   
   📦 IT
      📦 Active (1)
         - Bob
   ```

---

## 📊 Visual Hierarchy When Active:

### Single Group (Group By only):
```
┌─────────────────────────────┐
│ 🔲 Sales Department (10)    │
│ ├─ Record 1                 │
│ ├─ Record 2                 │
│ └─ ...                      │
└─────────────────────────────┘
```

### Nested Group (Group By + Then By):
```
┌─────────────────────────────────┐
│ 🔲 Sales Department             │ ← Main Group (Bold, Dark)
├─────────────────────────────────┤
│   🔲 Active (5)                 │ ← Sub-Group (Indented)
│   ├─ Record 1                   │
│   └─ Record 2                   │
│                                 │
│   🔲 Inactive (5)               │ ← Sub-Group
│   ├─ Record 3                   │
│   └─ Record 4                   │
└─────────────────────────────────┘
```

---

## 🔧 Troubleshooting:

### Issue: "Then By" not appearing

**Check 1: Is main group selected?**
```javascript
// In browser console:
document.querySelector('select[value!=""]') // Should find Group By select
```

**Check 2: Refresh the page**
- Sometimes React state needs refresh
- Click "Clear All" then try again

**Check 3: Check browser console**
- Open DevTools (F12)
- Look for any JavaScript errors

---

## ✅ Verification Steps:

1. **Open any master with 2+ dropdown fields**
2. **Look at controls area (above table)**
3. **See this layout:**
   ```
   Sort By: [____]  Group By: [____]
   ```
4. **Select any option in "Group By"**
5. **Watch for new line to appear:**
   ```
   Sort By: [____]  Group By: [Department]
   
   Then By: [____]  ← THIS APPEARS!
   ```

---

## 📸 Expected Behavior Screenshots:

### Before Selecting Group:
- Sort By dropdown visible
- Group By dropdown visible
- **NO "Then By" visible**

### After Selecting Group:
- Sort By dropdown visible
- Group By dropdown visible with selection
- **"Then By" dropdown APPEARS**
- Data groups by selected field

### After Selecting Sub-Group:
- Sort By dropdown visible
- Group By dropdown visible with selection
- "Then By" dropdown visible with selection
- **Data shows nested groups**

---

## 🎯 Summary

**Location:** Controls card, second line after selecting Group By
**Trigger:** Select any field in "Group By" dropdown
**Requires:** At least 2 groupable fields (dropdown or text type)
**Appears:** Dynamically when main group is active
**Purpose:** Create hierarchical grouping (Group → Sub-Group)

The "Then By" control is **working** - it just appears dynamically based on your Group By selection! 🚀
