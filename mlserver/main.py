


from flask import Flask
from flask_cors import CORS
from routes.prediction_routes import prediction_routes

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(prediction_routes)

if __name__ == "__main__":
    app.run(port=8989, debug=True)
