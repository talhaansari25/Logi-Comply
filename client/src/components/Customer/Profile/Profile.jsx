import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import "./profile.css";

const Profile = () => {
  const [customerData, setCustomerData] = useState(null);
  const [shipmentStats, setShipmentStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const storedProfile = JSON.parse(localStorage.getItem("profileData"));
        if (!storedProfile) {
          setError("Customer data not found. Please log in again.");
          setLoading(false);
          return;
        }

        setCustomerData(storedProfile);

        // Fetch shipment statistics
        const shipmentRes = await fetch("http://localhost:3001/shipments/usershipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: storedProfile.id }),
        });

        const shipmentData = await shipmentRes.json();
        if (!shipmentRes.ok) {
          throw new Error(shipmentData.error || "Failed to fetch shipment data.");
        }

        // Process shipment counts
        const stats = { pending: 0, approved: 0, rejected: 0, total: shipmentData.shipments.length };
        shipmentData.shipments.forEach((shipment) => {
          if (shipment.status === "Pending") stats.pending++;
          else if (shipment.status === "Approved") stats.approved++;
          else if (shipment.status === "Rejected") stats.rejected++;
        });

        setShipmentStats(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) return <div className="loader"></div>;
  if (error) return <p className="error">{error}</p>;

  const shipmentChartData = {
    options: {
      chart: { id: "shipment-chart" },
      labels: ["Flagged", "Approved", "Rejected"],
      colors : ["#f39c12", "#2ecc71", "#e74c3c"]
    },
    series: [shipmentStats.pending, shipmentStats.approved, shipmentStats.rejected],
  };

  return (
    <div className="profile-container">
      {/* Left Section - Profile Details */}
      <div className="profile-info">
        <img src="https://t4.ftcdn.net/jpg/03/78/43/25/360_F_378432516_6IlKiCLDAqSCGcfc6o8VqWhND51XqfFm.jpg" alt="User" className="profile-image" />
        <h2>{customerData.name}</h2>
        <p><strong>Email:</strong> {customerData.email}</p>
        <p><strong>Phone:</strong> {customerData.phone}</p>
        <p><strong>Company:</strong> {customerData.companyName || "N/A"}</p>
        <p><strong>Address:</strong> {customerData.address}</p>
      </div>

      {/* Right Section - Shipment Analytics */}
      <div className="profile-analytics">
        <h3>📊 Shipment Overview</h3>
        <Chart options={shipmentChartData.options} series={shipmentChartData.series} type="pie" width="370" />

        <h3>📦 Shipment Stats</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <p>🚀 Total Shipments</p>
            <h2>{shipmentStats.total}</h2>
          </div>
          <div className="stat-box">
            <p>✅ Approved</p>
            <h2>{shipmentStats.approved}</h2>
          </div>
          <div className="stat-box">
            <p>⚠️ Flagged</p>
            <h2>{shipmentStats.pending}</h2>
          </div>
          <div className="stat-box">
            <p>❌ Rejected</p>
            <h2>{shipmentStats.rejected}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
