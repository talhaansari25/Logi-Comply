import React, { useEffect, useState } from "react";
import "./shipments.css";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [pastComplianceIssues, setPastComplianceIssues] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; // Shipments per page

  const fetchShipments = async (pageNumber) => {
    try {
      const response = await fetch("http://localhost:3001/shipments/getallshipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: "67c592a03c7b6f7535e01b56",
          page: pageNumber,
          limit,
          category: filterCategory,
          destinationCountry: filterCountry,
          status: filterStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch shipments.");

      setShipments(data.shipments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  };

  useEffect(() => {
    fetchShipments(page);
  }, [page, filterCategory, filterCountry, filterStatus]);

  const handleSearch = async () => {
    try {
      const response = await fetch("http://localhost:3001/shipments/searchshipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: "67c592a03c7b6f7535e01b56",
          name: searchQuery,
          page: 1,
          limit,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");

      setShipments(data.shipments);
      setTotalPages(data.totalPages);
      setPage(1);
    } catch (error) {
      console.error("Error searching shipments:", error);
    }
  };

  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setPastComplianceIssues(shipment.pastComplianceIssues);
    setEditMode(true);
  };

  const handleUpdate = async () => {
    if (!selectedShipment) return;

    try {
      const response = await fetch("http://localhost:3001/shipments/updpastcomp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: selectedShipment._id,
          pastComplianceIssues,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed.");

      alert("✅ Shipment updated successfully!");
      fetchShipments(page);
      setEditMode(false);
      setSelectedShipment(null);
    } catch (error) {
      console.error("Error updating shipment:", error);
    }
  };

  return (
    <div className="shipments-container">
      <h2>📦 Shipments Management</h2>

      {/* 🔍 Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by shipment name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 Search</button>
      </div>

      {/* 🔽 Filters */}
      <div className="filters">
        <select onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Filter by Category</option>
          <option value="Medicine">Medicine</option>
          <option value="Electronics">Electronics</option>
          <option value="Food">Food</option>
          <option value="Jewelry">Jewelry</option>
        </select>

        <select onChange={(e) => setFilterCountry(e.target.value)}>
          <option value="">Filter by Country</option>
          <option value="USA">USA</option>
          <option value="India">India</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
        </select>

        <select onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Filter by Status</option>
          <option value="Pending">Pending (Flagged)</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* 📋 Shipments Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Declared Value</th>
            <th>Weight</th>
            <th>Quantity</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment._id}>
              <td>{shipment.name}</td>
              <td>{shipment.category}</td>
              <td>${shipment.declaredValue}</td>
              <td>{shipment.weight} kg</td>
              <td>{shipment.quantity}</td>
              <td>{shipment.destinationCountry}</td>
              <td className={`status ${shipment.status.toLowerCase()}`}>{shipment.status}</td>
              <td>
                <button onClick={() => setSelectedShipment(shipment)}>👁 View</button>
                <button onClick={() => handleEdit(shipment)}>✏ Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⏭ Pagination */}
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          ⬅ Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next ➡
        </button>
      </div>

      {/* 📝 View/Edit Popup */}
      {selectedShipment && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{editMode ? "Edit Shipment" : "Shipment Details"}</h3>
            <p><strong>Name:</strong> {selectedShipment.name}</p>
            <p><strong>Category:</strong> {selectedShipment.category}</p>
            <p><strong>Declared Value:</strong> ${selectedShipment.declaredValue}</p>
            <p><strong>Weight:</strong> {selectedShipment.weight} kg</p>
            <p><strong>Quantity:</strong> {selectedShipment.quantity}</p>
            <p><strong>Destination:</strong> {selectedShipment.destinationCountry}</p>
            <p><strong>Status:</strong> {selectedShipment.status}</p>
            <p><strong>Past Compliance Issues:</strong> {selectedShipment.pastComplianceIssues ? "Yes" : "No"}</p>
            <p><strong>Flagged Message:</strong> {selectedShipment.flagMessage || "N/A"}</p>

            {editMode && (
              <label>
                <input
                  type="checkbox"
                  checked={pastComplianceIssues}
                  onChange={(e) => setPastComplianceIssues(e.target.checked)}
                />
                Past Compliance Issues
              </label>
            )}

            <button onClick={editMode ? handleUpdate : () => setSelectedShipment(null)}>
              {editMode ? "✅ Save Changes" : "❌ Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
