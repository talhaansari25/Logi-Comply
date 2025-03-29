from flask import Blueprint, request, jsonify
from services.prediction_service import preprocess_input, explain_prediction, model, scaler, FEATURES
import pandas as pd

prediction_routes = Blueprint('prediction_routes', __name__)

@prediction_routes.route('/predict', methods=['POST'])
def predict():
    try:
        user_data = request.get_json()
        processed_data = preprocess_input(user_data)
        ordered_data = [processed_data[feature] for feature in FEATURES]
        input_df = pd.DataFrame([ordered_data], columns=FEATURES)
        input_scaled = scaler.transform(input_df)
        prediction = model.predict(input_scaled)[0]

        # ✅ Get SHAP explanation for prediction
        top_reasons = explain_prediction(input_scaled)

        return jsonify({
            "prediction": int(prediction),
            "top_reasons": [{"feature": f, "impact": round(v, 4)} for f, v in top_reasons]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@prediction_routes.route('/predictBulk', methods=['POST'])
def predict_bulk():
    try:
        request_data = request.get_json()
        all_shipments = request_data.get("shipments", [])

        if not all_shipments:
            return jsonify({"error": "No shipments provided"}), 400

        batch_size = 100  # Adjust batch size as needed
        total_batches = (len(all_shipments) + batch_size - 1) // batch_size

        all_predictions = []

        for i in range(total_batches):
            batch_shipments = all_shipments[i * batch_size : (i + 1) * batch_size]
            processed_batch = [preprocess_input(s) for s in batch_shipments]
            input_df = pd.DataFrame(processed_batch, columns=FEATURES)
            input_scaled = scaler.transform(input_df)

            predictions = model.predict(input_scaled)
            top_reasons = explain_prediction(input_scaled)

            batch_results = [
                {"prediction": int(pred), "top_reasons": reasons}
                for pred, reasons in zip(predictions, top_reasons)
            ]

            all_predictions.extend(batch_results)

        return jsonify({"predictions": all_predictions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
