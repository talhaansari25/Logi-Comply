### **📌 Rapid Compliance Checker API Documentation**  
📍 **Base URL:** `http://localhost:3001`  

This API enables customers and admins to manage **shipments**, enforce **compliance rules**, and **validate shipments** dynamically.  

---

## **📌 Authentication APIs**  

### **✅ Customer Signup**  
**`POST /auth/customer/signup`**  
Registers a new customer account.  

#### **📌 Request Body:**  
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "companyName": "TechCorp",
  "address": "123 Business St, NY"
}
```

### **✅ Customer Login**  
**`POST /auth/customer/login`**  
Logs in a customer and returns an authentication token.  

#### **📌 Request Body:**  
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### **✅ Admin Signup**  
**`POST /auth/admin/signup`**  
Registers a new admin account.  

#### **📌 Request Body:**  
```json
{
  "name": "Admin",    
  "email": "admin@example.com",
  "password": "password123",
  "phone": "+917382734858"
}
```

### **✅ Admin Login**  
**`POST /auth/admin/login`**  
Logs in an admin and returns an authentication token.  

#### **📌 Request Body:**  
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### **✅ Fetch Customer & Admin Data By ID**  
**`POST /auth/customer/fetch`**  
Fetches customer details by ID.  

#### **📌 Request Body:**  
```json
{
  "id": "67c58c82e9af0f135afad7ba"
}
```

**`POST /auth/admin/fetch`**  
Fetches admin details by ID.  

#### **📌 Request Body:**  
```json
{
  "id": "67c592a03c7b6f7535e01b56"
}
```

---

## **📌 Shipment Management APIs**  

### **✅ Create a Shipment**  
**`POST /shipments/createshipment`**  
Creates a new shipment entry.  

#### **📌 Request Body:**  
```json
{
  "customerId": "67c58c82e9af0f135afad7ba",
  "name": "Laptop Charger",
  "category": "Electronics",
  "declaredValue": 100,
  "currency": "USD",
  "weight": 0.5,
  "quantity": 10,
  "dimensions": { "length": 10, "width": 5, "height": 3 },
  "destinationCountry": "Germany",
  "restrictedItem": false,
  "pastComplianceIssues": false,
  "shipmentFlagged": false,
  "batteryIncluded": true,
  "powerRating": "220V",
  "hsCode": "123.12.xx",
  "subTotal": 1000,
  "tariff": 50,
  "additionalCharges": 20,
  "totalCost": 1070,
  "status": "Pending",
  "trackingId": "TRACK12345"
}
```

### **✅ Bulk Shipment Upload via CSV**  
**`POST /shipments/uploadcsv`**  
Uploads multiple shipments using a CSV file.  

#### **📌 Form Data:**  
- **file** → Upload CSV file  
- **customerId** → `"67c58c82e9af0f135afad7ba"`

🔗 **Sample CSV Format:**  
```
customerId,sourceCountry,destinationCountry,name,category,declaredValue,currency,weight,quantity,length,width,height
65d9c1f8b9a1f2c8a6e7d9c1,India,USA,Paracetamol,Medicine,50,USD,0.1,100,34,20,50
65d9c1f8b9a1f2c8a6e7d9c1,China,India,Chemical A,Chemical,200,USD,1.5,20,30,18,30
65d9c1f8b9a1f2c8a6e7d9c1,India,France,Smartphone,Electronics,500,USD,0.3,5,17,10,34
```

### **✅ Retrieve All Shipments (Paginated) - Admin**  
**`POST /shipments/getallshipments`**  

#### **📌 Request Body:**  
```json
{
  "adminId": "67c592a03c7b6f7535e01b56",
  "category": "Electronics",
  "sortBy": "declaredValue",
  "sortOrder": "desc",
  "page": 1,
  "limit": 5
}
```

### **✅ Search Shipments by Name**  
**`POST /shipments/searchshipment`**  

#### **📌 Request Body:**  
```json
{
  "adminId": "65d9c1f8b9a1f2c8a6e7d9c1",
  "name": "Phone",
  "page": 1,
  "limit": 5
}
```

### **✅ Get All Shipments for a Customer**  
**`POST /shipments/usershipments`**  

#### **📌 Request Body:**  
```json
{
  "customerId": "65d9c1f8b9a1f2c8a6e7d9c1",
  "page": 1,
  "limit": 5
}
```

---

## **📌 Compliance Rule Management APIs**  

### **✅ Create a New Compliance Rule**  
**`POST /rules/create`**  

#### **📌 Request Body:**  
```json
{
  "ruleName": "Global Shipment Limits",
  "ruleType": "Value Limit",
  "applicableCategories": ["Electronics", "Jewelry", "Medicine"],
  "declaredValueLimits": {
    "USA": { "Electronics": 5000, "Jewelry": 10000, "Medicine": 2000 },
    "India": { "Electronics": 3000, "Jewelry": 8000, "Medicine": 1500 }
  },
  "maxWeightLimits": {
    "USA": { "Electronics": 50, "Food": 30 },
    "India": { "Electronics": 40, "Food": 25 }
  },
  "maxQuantityLimits": {
    "USA": { "Medicine": 5, "Clothing": 20 },
    "Germany": { "Electronics": 10, "Automobile": 2 }
  },
  "restrictedCountries": ["North Korea", "Iran"],
  "restrictedItems": ["Explosives", "Firearms"],
  "specialClearanceRequired": false
}
```

### **✅ Retrieve All Compliance Rules**  
**`GET /getallrules`**  

### **✅ Update a Compliance Rule**  
**`PUT /rules/update`**  

#### **📌 Request Body:**  
```json
{
  "ruleId": "65da12345b9a1f2c8a6e7d9c1",
  "maxWeight": 100
}
```

### **✅ Delete a Compliance Rule**  
**`DELETE /rules/delete`**  

#### **📌 Request Body:**  
```json
{
  "ruleId": "65da12345b9a1f2c8a6e7d9c1"
}
```

---

## **📌 Shipment Compliance Validation API**  

### **✅ Check Shipment Compliance**  
**`POST /rules/checkshipmentcompliance`**  

#### **📌 Request Body:**  
```json
{
  "category": "Jewelry",
  "declaredValue": 12000,
  "weight": 10,
  "quantity": 2,
  "name" : "Gold"
  "destinationCountry": "USA"
}
```
### **✅ Update Flagged Shipments**  
PUT /shipments/updatependingshipment  

#### **📌 Request Body:**  
```json
{
  "customerId": "67c58c82e9af0f135afad7ba",
  "shipmentId": "67c5cdd14890a0bcff9137dc",
  "updates": {
    "declaredValue": 150,
    "weight": 2.5,
    "quantity": 5,
    "destinationCountry": "Germany"
  }
}
```
### **✅ Get ALL Customer with Pagination**   
GET /admin/customers

---
