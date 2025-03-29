# Shipment Compliance Prediction API Documentation

## Overview
The **Shipment Compliance Prediction API** allows users to send shipment details and receive a prediction on whether the shipment is compliant or flagged. It also provides an explanation for the decision made by the model.

---

## Base URL
```
http://localhost:8989/
```

---

## Endpoints

### 1. Predict Single Shipment
#### **POST** `/predict`

#### **Description**
Predicts whether a shipment is compliant based on input shipment details.

#### **Request Headers**
| Header         | Type   | Required | Description          |
|--------------|--------|----------|----------------------|
| Content-Type | string | Yes      | `application/json`   |

#### **Request Body**
```json
{
    "declaredValue": 1000,
    "weight": 5.5,
    "quantity": 2,
    "requiresPrescription": false,
    "hazardClass": 1,
    "handlingInstructions": 1,
    "batteryIncluded": true,
    "perishable": false,
    "weightInCarats": 0,
    "subTotal": 900,
    "tariff": 10,
    "additionalCharges": 50,
    "totalCost": 960,
    "category": "Electronics",
    "fabricType": "NA",
    "size": "NA",
    "length": 10,
    "width": 5,
    "height": 15,
    "storageTemperature": "-10-5",
    "powerRating": "220V 50Hz",
    "regulatoryDocs": ["doc1", "doc2"]
}
```

#### **Response Body**
```json
{
    "prediction": "Flagged",
    "explanation": [
        { "feature": "declaredValue", "impact": 0.45 },
        { "feature": "tariff", "impact": 0.30 },
        { "feature": "totalCost", "impact": 0.25 }
    ]
}
```

#### **Response Codes**
| Code | Description |
|------|-------------|
| 200  | Success    |
| 400  | Bad Request |

---

### 2. Predict Bulk Shipments
#### **POST** `/predictBulk`

#### **Description**
Predicts compliance for multiple shipments in a single request.

#### **Request Body**
```json
{
    "shipments": [
        {
            "declaredValue": 1000,
            "weight": 5.5,
            "quantity": 2,
            "requiresPrescription": false,
            "hazardClass": 1,
            "handlingInstructions": 1,
            "batteryIncluded": true,
            "perishable": false,
            "weightInCarats": 0,
            "subTotal": 900,
            "tariff": 10,
            "additionalCharges": 50,
            "totalCost": 960,
            "category": "Electronics",
            "fabricType": "NA",
            "size": "NA",
            "length": 10,
            "width": 5,
            "height": 15,
            "storageTemperature": "-10-5",
            "powerRating": "220V 50Hz",
            "regulatoryDocs": ["doc1", "doc2"]
        },
        {
            "declaredValue": 500,
            "weight": 2.0,
            "quantity": 1,
            "requiresPrescription": false,
            "hazardClass": 0,
            "handlingInstructions": 0,
            "batteryIncluded": false,
            "perishable": true,
            "weightInCarats": 0,
            "subTotal": 450,
            "tariff": 5,
            "additionalCharges": 20,
            "totalCost": 475,
            "category": "Food",
            "fabricType": "NA",
            "size": "NA",
            "length": 5,
            "width": 5,
            "height": 10,
            "storageTemperature": "0-10",
            "powerRating": "NA",
            "regulatoryDocs": []
        }
    ]
}
```

#### **Response Body**
```json
{
    "predictions": [
        {
            "prediction": "Flagged",
            "explanation": [
                { "feature": "declaredValue", "impact": 0.45 },
                { "feature": "tariff", "impact": 0.30 },
                { "feature": "totalCost", "impact": 0.25 }
            ]
        },
        {
            "prediction": "Compliant",
            "explanation": [
                { "feature": "subTotal", "impact": 0.40 },
                { "feature": "additionalCharges", "impact": 0.30 },
                { "feature": "tariff", "impact": 0.30 }
            ]
        }
    ]
}
```

#### **Response Codes**
| Code | Description |
|------|-------------|
| 200  | Success    |
| 400  | Bad Request |

---

## Error Responses

| Code | Message |
|------|---------|
| 400  | "Invalid input format." |
| 500  | "Internal server error." |

---

## Notes
- The model uses an **XGBoost classifier**.
- The **SHAP** library is used to provide feature importance explanations.
- Ensure all numeric fields are provided as valid numbers.
- Boolean fields should be **true/false** values.
- Ensure `category`, `fabricType`, and `size` fields match the expected values.

