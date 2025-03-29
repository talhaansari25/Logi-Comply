import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterCustomer from "./components/Customer/Authentication/Register.jsx";
import LoginCustomer from "./components/Customer/Authentication/Login.jsx";
import RegisterAdmin from "./components/Admin/Authentication/Register.jsx";
import LoginAdmin from "./components/Admin/Authentication/Login.jsx";
import WelcomePage from "./components/Welcome/Welcome.jsx";

// Customer Layout
import Customer from "./components/Customer/Home/Customer.jsx";
import Dashboard from "./components/Customer/Dashboard/Dashboard.jsx";
import AddShipment from "./components/Customer/Shipments/AddShipment.jsx";
import UploadShipments from "./components/Customer/Shipments/UploadShipments.jsx";
import ShipmentHistory from "./components/Customer/Shipments/ShipmentHistory.jsx";
import Profile from "./components/Customer/Profile/Profile.jsx";
import Notifications from "./components/Customer/Notification/Notification.jsx";
import Admin from "./components/Admin/Home/Admin.jsx";
import AProfile from "./components/Admin/Profile/AProfile.jsx";
import Shipments from "./components/Admin/Shipments/Shipments.jsx"
import Rules from './components/Admin/Rules/Rules.jsx'
import Customers from './components/Admin/Customers/Customers.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        {/* Customer Authentication */}
        <Route path="/customer/register" element={<RegisterCustomer />} />
        <Route path="/customer/login" element={<LoginCustomer />} />

        {/* Admin Authentication */}
        <Route path="/admin/register" element={<RegisterAdmin />} />
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* Customer Dashboard Layout */}
        <Route path="/customer/*" element={<Customer />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="addshipment" element={<AddShipment />} />
          <Route path="uploadshipments" element={<UploadShipments />} />
          <Route path="shipmenthistory" element={<ShipmentHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Admin Dashboard Layout */}
        <Route path="/admin/*" element={<Admin />}>
          <Route path="dashboard" element={<AProfile />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="rules" element={<Rules />} />
          <Route path="customers" element={<Customers />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
