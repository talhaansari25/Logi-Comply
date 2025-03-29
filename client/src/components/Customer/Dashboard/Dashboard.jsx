import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import "./dashboard.css";

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shipmentStats, setShipmentStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    totalDeclaredValue: 0,
    categoryCounts: {},
    pastComplianceTrue: 0,
    pastComplianceFalse: 0,
  });

  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        const storedProfile = localStorage.getItem("profileData");
        if (!storedProfile) {
          setError("Customer data not found. Please log in again.");
          setLoading(false);
          return;
        }

        const { id } = JSON.parse(storedProfile);

        // Fetch user's shipments
        const response = await fetch("http://localhost:3001/shipments/usershipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: id }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch shipment data.");
        }

        // Process Shipment Statistics
        let stats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: data.shipments.length,
          totalDeclaredValue: 0,
          categoryCounts: {},
          pastComplianceTrue: 0,
          pastComplianceFalse: 0,
        };

        data.shipments.forEach((shipment) => {
          stats.totalDeclaredValue += shipment.declaredValue;
          if (shipment.status === "Pending") stats.pending++;
          else if (shipment.status === "Approved") stats.approved++;
          else if (shipment.status === "Rejected") stats.rejected++;

          // Count categories
          stats.categoryCounts[shipment.category] = (stats.categoryCounts[shipment.category] || 0) + 1;

          // Count past compliance issues
          if (shipment.pastComplianceIssues) stats.pastComplianceTrue++;
          else stats.pastComplianceFalse++;
        });

        setShipmentStats(stats);
        setShipments(data.shipments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, []);

  if (loading) return <div className="loader"></div>;
  if (error) return <p className="error">{error}</p>;

  // Category Chart Data
  const categoryChartData = {
    options: { chart: { id: "category-chart" }, labels: Object.keys(shipmentStats.categoryCounts) },
    series: Object.values(shipmentStats.categoryCounts),
  };

  // Status Chart Data (Pending, Approved, Rejected)
  const statusChartData = {
    options: {
      chart: { id: "status-chart" },
      xaxis: { categories: ["Flagged", "Approved", "Rejected"] },
      colors: ["#f39c12", "#2ecc71", "#e74c3c"],
    },
    series: [{ name: "Shipments", data: [shipmentStats.pending, shipmentStats.approved, shipmentStats.rejected] }],
  };

  // Past Compliance Chart Data
  const complianceChartData = {
    options: {
      chart: { id: "compliance-chart" },
      labels: ["With Issues", "No Issues"],
      colors: ["#e74c3c", "#2ecc71"],
    },
    series: [shipmentStats.pastComplianceTrue, shipmentStats.pastComplianceFalse],
  };

  return (
    <div className="dashboard-wrapper">
        <div className="chart-container">
        <div className="chart-box">
          <h3>📦 Shipment Categories Distribution</h3>
          <Chart options={categoryChartData.options} series={categoryChartData.series} type="donut" width="350" />
        </div>

        <div className="chart-box">
          <h3>📊 Shipment Status</h3>
          <Chart options={statusChartData.options} series={statusChartData.series} type="bar" width="340" />
        </div>

        <div className="chart-box">
          <h3>⚠️ Past Compliance Issues</h3>
          <Chart options={complianceChartData.options} series={complianceChartData.series} type="pie" width="350" />
        </div>
      </div>
      {/* Shipment Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <p>🚀 Total Shipments</p>
          <h2>{shipmentStats.total}</h2>
        </div>
        <div className="stat-card approved">
          <p>✅ Approved</p>
          <h2>{shipmentStats.approved}</h2>
        </div>
        <div className="stat-card pending">
          <p>⚠️ Flagged</p>
          <h2>{shipmentStats.pending}</h2>
        </div>
        <div className="stat-card rejected">
          <p>❌ Rejected</p>
          <h2>{shipmentStats.rejected}</h2>
        </div>
        <div className="stat-card total-value">
          <p>💰 Total Declared Value</p>
          <h2 className="value-highlight">${shipmentStats.totalDeclaredValue.toLocaleString()}</h2>
        </div>
      </div>

      {/* Shipment Graphs */}
    
    </div>
  );
};

export default Dashboard;
