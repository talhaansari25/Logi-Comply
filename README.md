

# **📌 LogiComply – Project Setup & Running Guide**  

LogiComply is an **AI-powered compliance management system** that automates shipment validation using **machine learning** and **rule-based compliance checks**.

## **📌 Running the Project**  

## **📌 Running the ML Server**  
🚀 The **ML Server** is responsible for handling **AI-based anomaly detection and compliance validation**.

### **Steps to Run:**  
```bash
cd mlserver         # Navigate to the ML Server directory
pip install -r requirements.txt  # Install dependencies
python main.py      # Start the ML Server
```
📍 **Runs on:** `http://localhost:8989/`

---

## **📌 Running the Backend Server**  
🚀 The **Backend Server** is built using **Node.js + Express** and handles **user authentication, shipment validation, and database operations**.

## Enter MONGODB_URL to `index.js`

### **Steps to Run:**  
```bash
cd server         # Navigate to the Backend folder
npm install       # Install required dependencies
nodemon index.js  # Start the backend server
```
📍 **Runs on:** `http://localhost:3001/`

---

## **📌 Running the Client (Frontend)**  
🚀 The **Frontend** is built with **React.js + Vite** for a fast and interactive user experience.

### **Steps to Run:**  
```bash
cd client         # Navigate to the Client folder
npm install       # Install required dependencies
npm run dev       # Start the React frontend
```
📍 **Runs on:** `http://localhost:5173/`

---

## **📌 Summary of Ports & Services**
| Component      | Technology Used       | Port   |
|---------------|-----------------------|--------|
| **ML Server** | Python (Flask)         | 8989   |
| **Backend**   | Node.js + Express.js   | 3001   |
| **Frontend**  | React.js + Vite        | 5173   |

---

contact : talhaansari2026@gmail.com
