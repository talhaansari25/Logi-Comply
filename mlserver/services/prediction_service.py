import pandas as pd
import numpy as np
import joblib
import shap  

# ✅ Load trained XGBoost model and scaler
model = joblib.load("models/xgboost.pkl")
scaler = joblib.load("models/combine_scaler.pkl")  # Ensure using the same scaler as during training

# ✅ Expected features (must match model training)
FEATURES = [
    "declaredValue", "weight", "quantity", "requiresPrescription",
    "hazardClass", "handlingInstructions", "batteryIncluded",
    "perishable", "weightInCarats", "subTotal", "tariff",
    "additionalCharges", "totalCost",
    "category_Automobile", "category_Chemical", "category_Cloth",
    "category_Electronics", "category_Food", "category_Jewelry",
    "category_Medicine", "fabricType_Cotton", "fabricType_NA",
    "fabricType_Polyester", "fabricType_Silk", "size_L", "size_M",
    "size_NA", "size_S", "size_XL", "length", "width", "height",
    "min_temp", "max_temp", "voltage", "frequency", "regulatoryDocs_count"
]

# ✅ SHAP Explanation Function
def explain_prediction(input_df):
    explainer = shap.Explainer(model)
    shap_values = explainer(input_df)
    
    # Get absolute impact of features on prediction
    importance = np.abs(shap_values.values[0])
    
    # Sort features by impact
    top_indices = np.argsort(importance)[-3:][::-1]  # Get 3 most important features
    top_features = [(FEATURES[i], float(importance[i])) for i in top_indices]  # Convert to float

    return top_features

# ✅ Preprocessing Function
def preprocess_input(user_data):
    processed_data = {}
    numeric_fields = [
        "declaredValue", "weight", "quantity", "weightInCarats", "subTotal",
        "tariff", "additionalCharges", "totalCost", "length", "width",
        "height", "min_temp", "max_temp", "voltage", "frequency",
        "regulatoryDocs_count"
    ]
    for field in numeric_fields:
        try:
            processed_data[field] = float(user_data.get(field, 0))
        except ValueError:
            processed_data[field] = 0  # Default to 0 if conversion fails
    
    boolean_fields = ["requiresPrescription", "batteryIncluded", "perishable"]
    for field in boolean_fields:
        processed_data[field] = bool(user_data.get(field, False))
    
    CATEGORIES = ["Automobile", "Chemical", "Cloth", "Electronics", "Food", "Jewelry", "Medicine"]
    FABRIC_TYPES = ["Cotton", "NA", "Polyester", "Silk"]
    SIZES = ["L", "M", "NA", "S", "XL"]
    
    for cat in CATEGORIES:
        processed_data[f"category_{cat}"] = 1 if user_data.get("category") == cat else 0
    
    if user_data.get("category") == "Cloth":
        fabric_type = user_data.get("fabricType", "NA")
        for fab in FABRIC_TYPES:
            processed_data[f"fabricType_{fab}"] = 1 if fabric_type == fab else 0
        size = user_data.get("size", "NA")
        for sz in SIZES:
            processed_data[f"size_{sz}"] = 1 if size == sz else 0
    else:
        for fab in FABRIC_TYPES:
            processed_data[f"fabricType_{fab}"] = 0
        for sz in SIZES:
            processed_data[f"size_{sz}"] = 0
    
    processed_data["hazardClass"] = 1 if "hazardClass" in user_data else 0
    processed_data["handlingInstructions"] = 1 if "handlingInstructions" in user_data else 0
    
    if user_data.get("category") == "Food":
        try:
            min_temp, max_temp = map(float, user_data.get("storageTemperature", "0-0").split('-'))
        except ValueError:
            min_temp, max_temp = 0, 0
    else:
        min_temp, max_temp = 0, 0
    processed_data["min_temp"] = min_temp
    processed_data["max_temp"] = max_temp
    
    if user_data.get("category") == "Electronics":
        try:
            voltage, frequency = map(float, user_data.get("powerRating", "0V 0Hz").split("V"))
        except ValueError:
            voltage, frequency = 0, 0
    else:
        voltage, frequency = 0, 0
    processed_data["voltage"] = voltage
    processed_data["frequency"] = frequency
    
    processed_data["regulatoryDocs_count"] = len(user_data.get("regulatoryDocs", []))
    return processed_data
