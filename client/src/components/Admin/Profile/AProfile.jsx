import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import "./profile.css";

const AProfile = () => {
  const [shipmentsData, setShipmentsData] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [sourceCountryCounts, setSourceCountryCounts] = useState({});
  const [destinationCountryCounts, setDestinationCountryCounts] = useState({});

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh data every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const shipmentsRes = await fetch("http://localhost:3001/shipments/getallshipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: JSON.parse(localStorage.getItem("profileData")).id, page: 1, limit: 10000 }),
      });
      const shipmentsData = await shipmentsRes.json();
      setShipmentsData(shipmentsData.shipments || []);

      const customersRes = await fetch("http://localhost:3001/shipments/getallcustomers");
      const customersData = await customersRes.json();
      setCustomerCount(customersData.totalCustomers);

      processGraphData(shipmentsData.shipments);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const processGraphData = (shipments) => {
    const statusCounts = { Pending: 0, Approved: 0, Rejected: 0 };
    const categoryCounts = {};
    const sourceCountryCounts = {};
    const destinationCountryCounts = {};

    shipments.forEach((shipment) => {
      statusCounts[shipment.status] = (statusCounts[shipment.status] || 0) + 1;
      categoryCounts[shipment.category] = (categoryCounts[shipment.category] || 0) + 1;
      sourceCountryCounts[shipment.sourceCountry] = (sourceCountryCounts[shipment.sourceCountry] || 0) + 1;
      destinationCountryCounts[shipment.destinationCountry] = (destinationCountryCounts[shipment.destinationCountry] || 0) + 1;
    });

    setStatusCounts(statusCounts);
    setCategoryCounts(categoryCounts);
    setSourceCountryCounts(sourceCountryCounts);
    setDestinationCountryCounts(destinationCountryCounts);
  };

  return (
    <div className="admin-dashboard">
      {/* <h2>📊 Admin Dashboard</h2> */}

      <div className="stats">
        <div className="stat-box">📦 Total Shipments: {shipmentsData.length}</div>
        <div className="stat-box">👥 Total Customers: {customerCount}</div>
      </div>

      <div className="charts-container">
       

        <div className="chart">
          <h3>📌 Shipment Categories</h3>
          <Chart
            type="pie"
            height={170}
            series={Object.values(categoryCounts)}
            options={{ labels: Object.keys(categoryCounts) }}
          />
        </div>

        <div className="chart">
          <h3>🌍 Source Countries</h3>
          <Chart
            type="donut"
            height={170}
            series={Object.values(sourceCountryCounts)}
            options={{ labels: Object.keys(sourceCountryCounts) }}
          />
        </div>

        <div className="chart">
          <h3>🌏 Destination Countries</h3>
          <Chart
            type="donut"
            height={170}
            series={Object.values(destinationCountryCounts)}
            options={{ labels: Object.keys(destinationCountryCounts) }}
          />
        </div>

        <div className="chart">
          <h3>📌 Shipments Status</h3>
          <Chart
            type="bar"
            height={170}
            series={[{ name: "Shipments", data: Object.values(statusCounts) }]}
            options={{
              xaxis: { categories: Object.keys(statusCounts) },
              chart: { type: "bar", toolbar: { show: false } },
              colors: ["#FF5733", "#28A745", "#FFC107"],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AProfile;
