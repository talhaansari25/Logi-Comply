import React, { useEffect, useState } from "react";
import "./shipment.css";

const ShipmentHistory = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updates, setUpdates] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchShipmentHistory = async (pageNumber) => {
    setLoading(true);
    setError("");

    const customerProfile = localStorage.getItem("profileData");
    if (!customerProfile) {
      setError("Customer data not found. Please log in again.");
      setLoading(false);
      return;
    }

    const customerId = JSON.parse(customerProfile).id;

    try {
      const response = await fetch("http://localhost:3001/shipments/usershipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, page: pageNumber, limit }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch shipment history.");

      setShipments(data.shipments || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentHistory(page);
  }, [page]);

  const openPopup = (shipment) => {
    setSelectedShipment(shipment);
    setUpdates({
      declaredValue: shipment.declaredValue,
      weight: shipment.weight,
      quantity: shipment.quantity,
    });
    setEditMode(false);
  };

  const closePopup = () => {
    setSelectedShipment(null);
    setEditMode(false);
  };

  const handleEditChange = (e) => {
    setUpdates({ ...updates, [e.target.name]: e.target.value });
  };

  const validateShipmentBeforeUpdate = async () => {
    try {
      const updatedShipment = {
        ...selectedShipment,
        declaredValue: updates.declaredValue,
        weight: updates.weight,
        quantity: updates.quantity,
      };

      const complianceResponse = await fetch("http://localhost:3001/rules/checkshipmentcompliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShipment),
      });

      const complianceResult = await complianceResponse.json();

      if (!complianceResponse.ok) {
        throw new Error(complianceResult.error || "Compliance validation failed.");
      }

      return complianceResult.result;
    } catch (error) {
      console.error("Error validating shipment:", error);
      alert("❌ Compliance validation failed.");
      return null;
    }
  };

  const handleUpdateShipment = async () => {
    if (!selectedShipment) return;

    const customerProfile = JSON.parse(localStorage.getItem("profileData"));
    const customerId = customerProfile?.id;

    if (!customerId) {
      alert("❌ Customer ID missing. Please log in again.");
      return;
    }

    // Step 1: Validate shipment against compliance rules
    const complianceResult = await validateShipmentBeforeUpdate();
    if (!complianceResult) return;

    // Step 2: Update shipment status based on validation
    let updatedStatus = "Approved";
    let shipmentFlagged = false;
    let flagMessage = "Shipment Approved";

    if (complianceResult.status === "Flagged") {
      updatedStatus = "Pending";
      shipmentFlagged = true;
      flagMessage = complianceResult.violations.join(", ");
    } else if (complianceResult.status === "Rejected") {
      updatedStatus = "Rejected";
      shipmentFlagged = true;
      flagMessage = complianceResult.violations.join(", ");
    }
    else {
      updatedStatus = "Approved";
      shipmentFlagged = false;
      flagMessage = "";
    }

    try {
      const response = await fetch("http://localhost:3001/shipments/updatependingshipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          shipmentId: selectedShipment._id,
          updates: { ...updates, status: updatedStatus, shipmentFlagged, flagMessage },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed.");

      if (flagMessage != "") {
        alert(`⚠️ ${flagMessage}`);
      }
      alert(`✅ Shipment updated successfully! Status: ${updatedStatus}`);

      // Fetch updated shipment history
      fetchShipmentHistory(page);
      closePopup();
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("❌ Failed to update shipment.");
    }
  };



  const handleAddClearance = async () => {
    // Logic to handle adding clearance
    if (!selectedShipment) return;

    const customerProfile = JSON.parse(localStorage.getItem("profileData"));
    const customerId = customerProfile?.id;

    if (!customerId) {
      alert("❌ Customer ID missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/shipments/updatependingshipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          shipmentId: selectedShipment._id,
          updates: { ...updates, flagMessage: "Shipment Added to Review !" },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed.");


      alert(`✅ Shipment updated successfully! Status: "Waiting for Approval (Documents under Review)"`);

      // Fetch updated shipment history
      fetchShipmentHistory(page);
      closePopup();
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("❌ Failed to update shipment.");
    }
  };

  const handleFileSelection = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return; // If no file is selected, do nothing
  
    // Proceed with the existing logic
    await handleAddClearance();
  };

  return (
    <div>
      <h2 className="shipHH">📦 Shipment History</h2>

      {loading && <div className="loader"></div>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && shipments.length === 0 && (
        <p>No shipments found.</p>
      )}

      {!loading && !error && shipments.length > 0 && (
        <>
          <table className="sumeetBhai">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Destination</th>
                <th>Category</th>
                <th>Name</th>
                <th>Declared Value</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr
                  key={shipment._id}
                  onClick={() => openPopup(shipment)}
                  className="clickable-row"
                >
                  <td className="tracking-id">{shipment.trackingId}</td>
                  <td>{shipment.destinationCountry}</td>
                  <td>{shipment.category}</td>
                  <td>
                    <strong>{shipment.name}</strong>
                  </td>
                  <td>${shipment.declaredValue}</td>
                  <td>{shipment.weight} kg</td>
                  <td>{shipment.quantity}</td>
                  <td>
                    <span
                      className={`status-badge ${shipment.status.toLowerCase() === "rejected"
                        ? "rejected"
                        : shipment.status.toLowerCase() === "pending"
                          ? "flagged"
                          : shipment.status.toLowerCase() === "approved"
                            ? "approved"
                            : "flagged"
                        }`}
                    >
                      
                      {shipment.status === "Rejected"
                        ? "Rejected"
                        : shipment.status === "Flagged"
                          ? "Pending"
                          : shipment.status === "Approved"
                            ? "Approved"
                            : "flagged"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ⬅ Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next ➡
            </button>
          </div>
        </>
      )}

      {/* Popup for Detailed Shipment View */}
      {selectedShipment && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="popup-header">Shipment Details</h2>

            {/* Show flag message if flagged */}
            {selectedShipment.shipmentFlagged && (
              <div className="flag-message">
                <p>
                  ⚠ <strong>Flagged:</strong> {selectedShipment.flagMessage}
                </p>
              </div>
            )}

            <div className="shipment-details-grid">
              {/* Left Section */}
              <div className="details-left">
                <p>
                  <strong>Tracking ID:</strong> {selectedShipment.trackingId}
                </p>
                <p>
                  <strong>Category:</strong> {selectedShipment.category}
                </p>
                <p>
                  <strong>Name:</strong> {selectedShipment.name}
                </p>
                <div className="details-right">
                  <p><strong>Declared Value:</strong>
                    {editMode ? <input type="number" name="declaredValue" value={updates.declaredValue} onChange={handleEditChange} /> : `$${selectedShipment.declaredValue}`}
                  </p>
                  <p><strong>Weight:</strong>
                    {editMode ? <input type="number" name="weight" value={updates.weight} onChange={handleEditChange} /> : `${selectedShipment.weight} kg`}
                  </p>
                  <p><strong>Quantity:</strong>
                    {editMode ? <input type="number" name="quantity" value={updates.quantity} onChange={handleEditChange} /> : selectedShipment.quantity}
                  </p>
                </div>
                <p>
                  <strong>Source Country:</strong>{" "}
                  {selectedShipment.sourceCountry}
                </p>
                <p>
                  <strong>Destination Country:</strong>{" "}
                  {selectedShipment.destinationCountry}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status-badge ${selectedShipment.status.toLowerCase()}`}
                  >
                    {selectedShipment.status}
                  </span>
                </p>
              </div>

              {/* Right Section */}
              <div className="details-right">
                <h3>📏 Dimensions</h3>
                {selectedShipment.dimensions ? (
                  <p>
                    {selectedShipment.dimensions.length} cm ×{" "}
                    {selectedShipment.dimensions.width} cm ×{" "}
                    {selectedShipment.dimensions.height} cm
                  </p>
                ) : (
                  <p>N/A</p>
                )}

                <h3>🚛 Compliance Info</h3>
                <p>
                  <strong>HS Code:</strong> {selectedShipment.hsCode || "N/A"}
                </p>
                <p>
                  <strong>Past Compliance Issues:</strong>{" "}
                  {selectedShipment.pastComplianceIssues ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Restricted Item:</strong>{" "}
                  {selectedShipment.restrictedItem ? "Yes" : "No"}
                </p>

                <h3>💰 Cost Breakdown</h3>
                <p>
                  <strong>Sub Total:</strong> ${selectedShipment.subTotal}
                </p>
                <p>
                  <strong>Tariff:</strong> ${selectedShipment.tariff}
                </p>
                <p>
                  <strong>Additional Charges:</strong> $
                  {selectedShipment.additionalCharges}
                </p>
                <p>
                  <strong>Total Cost:</strong>{" "}
                  <strong>${selectedShipment.totalCost}</strong>
                </p>
              </div>
            </div>
            <input
              type="file"
              id="clearance-file-input"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileSelection}
            />

            {
              (selectedShipment.flagMessage.includes("Quantity") ||
                selectedShipment.flagMessage.includes("prohibited")) && (
                <div className="clearance-button">
                  <button
                    className="add-clearance-btn"
                    onClick={() => document.getElementById("clearance-file-input").click()}
                  >
                    Add Clearance
                  </button>
                </div>
              )
            }

            {selectedShipment.status == "Pending" && (
              <div className="edit-buttons">
                {editMode ? (
                  <>
                    <button className="save-btn" onClick={handleUpdateShipment}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                  </>
                ) : (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Shipment</button>
                )}
              </div>
            )}

            <button className="close-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentHistory;
