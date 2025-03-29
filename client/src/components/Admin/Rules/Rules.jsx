import React, { useState, useEffect } from "react";
import "./Rules.css";

const Rules = () => {
  const [rules, setRules] = useState([]); // Stores the list of rules
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [selectedRule, setSelectedRule] = useState(null); // Stores the rule being edited
  const [formData, setFormData] = useState({
    ruleName: "",
    ruleType: "",
    applicableCategories: [],
    declaredValueLimits: {},
    maxWeightLimits: {},
    maxQuantityLimits: {},
    restrictedCountries: [],
    restrictedItems: [],
    specialClearanceRequired: false,
    notes: "",
  });
  const [error, setError] = useState(""); // Stores error messages
  const [tempCountry, setTempCountry] = useState(""); // Temporary state for country input
  const [tempCategory, setTempCategory] = useState(""); // Temporary state for category input
  const [tempValue, setTempValue] = useState(""); // Temporary state for value input

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rulesPerPage = 5; // Number of rules to display per page

  // Fetch all rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  // Fetch rules from the API
  const fetchRules = async () => {
    try {
      const response = await fetch("http://localhost:3001/rules/getallrules");
      if (!response.ok) throw new Error("Failed to fetch rules");
      const data = await response.json();
      setRules(data.rules); // Use data.rules to match the API response
    } catch (error) {
      console.error("Error fetching rules:", error);
      setError("Failed to fetch rules. Please try again.");
    }
  };

  // Handle opening the modal for creating or editing a rule
  const handleOpenModal = (rule = null) => {
    setSelectedRule(rule);
    if (rule) {
      // If editing, pre-fill the form with the rule's data
      setFormData(rule);
    } else {
      // If creating, reset the form
      setFormData({
        ruleName: "",
        ruleType: "",
        applicableCategories: [],
        declaredValueLimits: {},
        maxWeightLimits: {},
        maxQuantityLimits: {},
        restrictedCountries: [],
        restrictedItems: [],
        specialClearanceRequired: false,
        notes: "",
      });
    }
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRule(null);
    setError("");
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding a new country-category limit (for Value, Weight, or Quantity Limits)
  const handleAddLimit = (limitType) => {
    if (!tempCountry || !tempCategory || !tempValue) {
      setError("Please fill in all fields (Country, Category, Value).");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [limitType]: {
        ...prevData[limitType],
        [tempCountry]: {
          ...(prevData[limitType][tempCountry] || {}),
          [tempCategory]: parseFloat(tempValue),
        },
      },
    }));

    // Clear temporary inputs
    setTempCountry("");
    setTempCategory("");
    setTempValue("");
    setError("");
  };

  // Handle adding a restricted country or item
  const handleAddRestricted = (type, value) => {
    if (!value) {
      setError(`Please enter a ${type === "restrictedCountries" ? "country" : "item"}.`);
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], value],
    }));
  };

  // Handle form submission for creating or updating a rule
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedRule
        ? "http://localhost:3001/rules/update"
        : "http://localhost:3001/rules/create";
      const method = selectedRule ? "PUT" : "POST";
      const body = JSON.stringify(
        selectedRule
          ? { ruleId: selectedRule._id, ...formData }
          : formData
      );

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save rule");
      }

      fetchRules(); // Refresh the list
      handleCloseModal(); // Close the modal
    } catch (error) {
      console.error("Error saving rule:", error);
      setError(error.message);
    }
  };

  // Handle deleting a rule
  const handleDeleteRule = async (ruleId) => {
    try {
      const response = await fetch("http://localhost:3001/rules/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete rule");
      }

      fetchRules(); // Refresh the list
    } catch (error) {
      console.error("Error deleting rule:", error);
      setError(error.message);
    }
  };

  // Pagination logic
  const indexOfLastRule = currentPage * rulesPerPage;
  const indexOfFirstRule = indexOfLastRule - rulesPerPage;
  const currentRules = rules.slice(indexOfFirstRule, indexOfLastRule);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="rules-container">
      <h1>Compliance Rules Management</h1>
      <button className="button button-primary" onClick={() => handleOpenModal()}>
        Create New Rule
      </button>

      {/* Display error messages */}
      {error && <div className="error-message">{error}</div>}

      {/* Table to display existing rules */}
      <table className="rules-table">
        <thead>
          <tr>
            <th>Rule Name</th>
            <th>Rule Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRules.map((rule) => (
            <tr key={rule._id}>
              <td>{rule.ruleName}</td>
              <td>{rule.ruleType}</td>
              <td>
                <button
                  className="button button-info"
                  onClick={() => handleOpenModal(rule)}
                >
                  Edit
                </button>{" "}
                <button
                  className="button button-danger"
                  onClick={() => handleDeleteRule(rule._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(rules.length / rulesPerPage) }, (_, i) => (
          <button
            key={i + 1}
            className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal for creating/editing rules */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedRule ? "Edit Rule" : "Create New Rule"}</h2>
              <button className="modal-close-button" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rule Name</label>
                <input
                  type="text"
                  name="ruleName"
                  value={formData.ruleName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rule Type</label>
                <select
                  name="ruleType"
                  value={formData.ruleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Rule Type</option>
                  <option value="Value Limit">Value Limit</option>
                  <option value="Weight Limit">Weight Limit</option>
                  <option value="Quantity Limit">Quantity Limit</option>
                  <option value="Restricted Country">Restricted Country</option>
                  <option value="Restricted Item">Restricted Item</option>
                  <option value="Special Clearance">Special Clearance</option>
                </select>
              </div>

              {/* Dynamic Fields Based on Rule Type */}
              {formData.ruleType === "Restricted Country" && (
                <div className="form-group">
                  <label>Restricted Countries</label>
                  <textarea
                    rows={3}
                    placeholder="Enter countries separated by commas (e.g., North Korea, Iran)"
                    value={formData.restrictedCountries.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        restrictedCountries: e.target.value.split(", "),
                      })
                    }
                  />
                </div>
              )}

              {formData.ruleType === "Restricted Item" && (
                <div className="form-group">
                  <label>Restricted Items</label>
                  <textarea
                    rows={3}
                    placeholder="Enter items separated by commas (e.g., Smartphones, Explosives)"
                    value={formData.restrictedItems.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        restrictedItems: e.target.value.split(", "),
                      })
                    }
                  />
                </div>
              )}

              {(formData.ruleType === "Value Limit" ||
                formData.ruleType === "Weight Limit" ||
                formData.ruleType === "Quantity Limit") && (
                <div className="form-group">
                  <label>
                    {formData.ruleType === "Value Limit"
                      ? "Declared Value Limits"
                      : formData.ruleType === "Weight Limit"
                      ? "Max Weight Limits"
                      : "Max Quantity Limits"}
                  </label>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Country"
                      value={tempCountry}
                      onChange={(e) => setTempCountry(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Value"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                    />
                    <button
                      className="button button-primary"
                      onClick={() =>
                        handleAddLimit(
                          formData.ruleType === "Value Limit"
                            ? "declaredValueLimits"
                            : formData.ruleType === "Weight Limit"
                            ? "maxWeightLimits"
                            : "maxQuantityLimits"
                        )
                      }
                    >
                      Add Limit
                    </button>
                  </div>
                  {/* Display added limits */}
                  {Object.entries(
                    formData[
                      formData.ruleType === "Value Limit"
                        ? "declaredValueLimits"
                        : formData.ruleType === "Weight Limit"
                        ? "maxWeightLimits"
                        : "maxQuantityLimits"
                    ]
                  ).map(([country, categories]) =>
                    Object.entries(categories).map(([category, value]) => (
                      <div key={`${country}-${category}`}>
                        {country} - {category}: {value}
                      </div>
                    ))
                  )}
                </div>
              )}

              <button type="submit" className="button button-primary">
                {selectedRule ? "Update Rule" : "Create Rule"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;