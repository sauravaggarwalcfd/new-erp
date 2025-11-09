# Data Storage Guide - Garment ERP Application

## 📊 Overview

Your garment manufacturing web application stores data in **MongoDB**, a NoSQL document database. All data is persistent and managed by the Emergent platform.

---

## 🗄️ Database Information

### Database Details:
- **Database Type:** MongoDB (NoSQL)
- **Database Name:** `test_database`
- **Connection:** `mongodb://localhost:27017`
- **Host:** Running inside your container
- **Persistence:** ✅ Data persists across restarts

---

## 📦 Data Collections (Tables)

Your application currently has **1,417 documents** across **11 collections**:

| Collection Name | Purpose | Document Count |
|-----------------|---------|----------------|
| **users** | User accounts & authentication | 14 |
| **buyers** | Buyer/Customer master data | 0 |
| **suppliers** | Supplier/Vendor master data | 0 |
| **articles** | Article/Style master data | 1 |
| **colors** | Color master data | 1 |
| **sizes** | Size master data | 2 |
| **fabrics** | Fabric master data (with images) | 1,381 |
| **raw_materials** | Raw material master data | 4 |
| **comprehensive_boms** | New BOMs (3-tab structure) | 8 |
| **boms** | Legacy BOMs | 4 |
| **mrps** | Material Requirements Planning | 2 |
| **TOTAL** | | **1,417** |

---

## 📂 File Storage (Images)

### Image Files:
- **Location:** `/app/backend/uploads/`
- **Access URL:** `https://garment-app.preview.emergentagent.com/uploads/{filename}`
- **Used For:** Fabric images, attachments, etc.

---

## 🔍 How to View Your Data

### Option 1: Through Web Application (Recommended)
Access your data through the UI:
- **Login:** https://garment-app.preview.emergentagent.com
- **Sections:**
  - Masters → View/Edit master data
  - BOM Management → View/Edit BOMs
  - MRP Management → View MRP data

### Option 2: Through API Endpoints
Access data via REST API:
```bash
# Get all BOMs
GET /api/boms

# Get specific BOM
GET /api/boms/{id}

# Get all fabrics
GET /api/fabrics

# Get all buyers
GET /api/buyers
```
*Note: Requires JWT authentication token*

### Option 3: MongoDB Shell (Advanced)
Direct database access:
```bash
# Connect to database
mongo test_database

# View collections
show collections

# Count documents
db.comprehensive_boms.count()

# Find recent BOMs
db.comprehensive_boms.find().limit(5)

# Find specific BOM
db.comprehensive_boms.findOne({"header.styleNumber": "STY001"})
```

---

## 📊 Data Structure Examples

### BOM Document Structure:
```json
{
  "id": "562d023a-fc76-49b2-b08e-d0f355ecb5b2",
  "header": {
    "date": "2025-11-01",
    "imageReference": "SUMMER-2026",
    "artNo": "TEST-ART-001",
    "planQty": "750",
    "setNo": "SET-001",
    "buyer": "Test Buyer",
    "styleNumber": "TEST-STY-001",
    "remarks": "Backend API Test BOM"
  },
  "fabricTables": [
    {
      "id": 1,
      "name": "Main Fabric Table",
      "items": [
        {
          "srNo": 1,
          "comboName": "Combo Red",
          "lotNo": "LOT-001",
          "colour": "Red",
          "fabricQuality": "Cotton Premium",
          "orderPcs": "500",
          "planRat": "1.5"
        }
      ]
    }
  ],
  "trimsTables": [
    {
      "id": 1,
      "name": "Trims for Main Fabric",
      "items": [
        {
          "srNo": 1,
          "comboName": "Combo Red",
          "trimType": "Button",
          "itemName": "Plastic Button",
          "quantity": "4",
          "unitPrice": "1.50"
        }
      ]
    }
  ],
  "operations": [
    {
      "srNo": 1,
      "operationName": "Cutting",
      "department": "Cutting",
      "sam": "3.0",
      "workers": "2",
      "costPerPiece": "8.00"
    }
  ],
  "status": "assigned",
  "created_at": "2025-11-09T12:00:00.000Z",
  "created_by": "backend_test_user"
}
```

### User Document Structure:
```json
{
  "id": "user-uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "$2b$12$hashed_password",
  "role": "admin",
  "created_at": "2025-11-01T10:00:00.000Z"
}
```

### Fabric Document Structure:
```json
{
  "id": "fabric-uuid",
  "sr_no": 1,
  "fabric_name": "Cotton Premium",
  "fabric_type": "Cotton",
  "composition": "100% Cotton",
  "gsm": "180",
  "width": "60 inches",
  "color": "White",
  "supplier": "ABC Fabrics",
  "cost_per_unit": "150.00",
  "unit": "meter",
  "final_item": "T-Shirt Fabric",
  "image_url": "/uploads/fabric_123.jpg"
}
```

---

## 💾 Data Backup Options

### Automatic (Emergent Platform):
- Platform handles automatic backups
- Data persists across container restarts
- No manual intervention needed

### Manual Export (If Needed):
```bash
# Export entire database
mongodump --db test_database --out /tmp/backup

# Export specific collection
mongoexport --db test_database --collection comprehensive_boms --out /tmp/boms.json

# Export as CSV
mongoexport --db test_database --collection fabrics --type=csv --fields sr_no,fabric_name,cost_per_unit --out /tmp/fabrics.csv
```

---

## 🔐 Data Security

### Access Control:
- ✅ JWT authentication required for all API endpoints
- ✅ Password hashing using Bcrypt
- ✅ Role-based access (admin, production_manager, user)

### Data Privacy:
- ✅ MongoDB `_id` excluded from API responses
- ✅ Sensitive fields (passwords) never exposed
- ✅ User context tracked for audit

---

## 🚀 Data in Production

### When You Deploy:
1. **Data Migration:** 
   - Current data can be exported and imported to production database
   - Or start fresh in production

2. **Connection Update:**
   - Production MongoDB connection string will be different
   - Update `MONGO_URL` in production environment variables

3. **Scaling:**
   - MongoDB can handle large datasets
   - Consider indexing for performance:
     ```javascript
     db.comprehensive_boms.createIndex({ "id": 1 })
     db.comprehensive_boms.createIndex({ "header.styleNumber": 1 })
     db.comprehensive_boms.createIndex({ "created_at": -1 })
     ```

---

## 📈 Current Data Statistics

### As of Last Check:
- **Total Documents:** 1,417
- **Total Collections:** 11
- **Largest Collection:** fabrics (1,381 documents)
- **Recent BOMs:** 8 comprehensive BOMs
- **Active Users:** 14

### Recent BOMs:
1. Style: TEST-STY-001, Art: TEST-ART-001, Created: 2025-11-09
2. Style: STY002, Art: ART002, Created: 2025-11-01
3. Style: STY001, Art: ART001, Created: 2025-11-01

---

## 🛠️ Data Maintenance Commands

### Check Database Status:
```bash
# Check MongoDB is running
sudo supervisorctl status mongodb

# View MongoDB logs
tail -f /var/log/supervisor/mongodb.log
```

### View Data Summary:
```bash
# Run data summary script
python3 /tmp/check_data.py
```

### Clean Up Test Data (If Needed):
```bash
# Remove test users
mongo test_database --eval "db.users.deleteMany({username: /test/})"

# Remove test BOMs
mongo test_database --eval "db.comprehensive_boms.deleteMany({created_by: 'backend_test_user'})"
```

---

## 🔄 Data Lifecycle

### Create:
```
User creates BOM in UI
    ↓
POST /api/boms/comprehensive
    ↓
Data validated by Pydantic
    ↓
Stored in MongoDB (comprehensive_boms collection)
    ↓
UUID generated as document ID
```

### Read:
```
User views BOM list
    ↓
GET /api/boms
    ↓
Backend queries MongoDB
    ↓
Returns all BOMs from both collections
    ↓
Frontend displays in table
```

### Update:
```
User edits BOM
    ↓
PUT /api/boms/{id}
    ↓
Backend finds document
    ↓
Updates with $set operator
    ↓
Adds updated_at timestamp
```

### Delete:
```
User deletes BOM
    ↓
DELETE /api/boms/{id}
    ↓
Backend removes from both collections
    ↓
Returns success message
```

---

## 📞 Support & Questions

### For Data Issues:
- Check backend logs: `tail -f /var/log/supervisor/backend.out.log`
- Check MongoDB status: `sudo supervisorctl status mongodb`
- View data summary: `python3 /tmp/check_data.py`

### For Data Export/Backup:
- Contact Emergent support for backup options
- Use MongoDB export tools for manual backups
- Consider implementing export feature in UI

---

## 🎯 Key Takeaways

✅ **Your data is safe:** Persistent storage managed by Emergent
✅ **Well-structured:** Collections organized by data type
✅ **Accessible:** Via UI, API, or direct database access
✅ **Scalable:** MongoDB can handle growth
✅ **Backed up:** Platform handles backups automatically
✅ **Secure:** JWT auth + password hashing

Your data is stored professionally and ready for production use!
