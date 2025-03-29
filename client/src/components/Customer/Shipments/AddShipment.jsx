import React, { useState } from "react";
import "./shipment.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AddShipment = () => {
  const [selectedCategory, setSelectedCategory] = useState("Electronics");
  const [productAttributes, setProductAttributes] = useState({});
  const [generatedShipmentData, setGeneratedShipmentData] = useState(null);

  const categories = [
    "Electronics",
    "Chemical",
    "Clothes",
    "Food",
    "Medicine",
    "Automobile",
    "Jewelry",
  ];

  const countries = [
    "India",
    "Germany",
    "USA",
    "China",
    "UK",
    "Japan",
    "France",
    "Australia",
    "Canada",
    "Brazil",
    "North Korea",
    "Iran",
    "Russia",
    "Sudan",
  ];

  const hsCodeMapping = {
    Electronics: "8517",
    Chemical: "2801",
    Clothes: "6201",
    Food: "1905",
    Medicine: "3004",
    Automobile: "8703",
    Jewelry: "7113",
  };

  const calculateTariff = (hsCode, destinationCountry) => {
    const tariffRates = {
      8517: { USA: 10, India: 5, Germany: 12, China: 15 },
      2801: { USA: 8, India: 4, Germany: 10, China: 13 },
      6201: { USA: 6, India: 3, Germany: 8, China: 11 },
      1905: { USA: 5, India: 2, Germany: 7, China: 9 },
      3004: { USA: 7, India: 3, Germany: 9, China: 12 },
      8703: { USA: 15, India: 8, Germany: 18, China: 20 },
      7113: { USA: 20, India: 10, Germany: 22, China: 25 },
    };

    return tariffRates[hsCode]?.[destinationCountry] || 5; // Default tariff
  };

  const calculatePlatformCharges = (declaredValue) => {
    return declaredValue * 0.02; // 2% Platform Fee
  };

  const showData = () => {
    console.log(productAttributes);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setProductAttributes({});
  };

  // const handleInputChange = (e) => {
  //   const { name, value, type } = e.target;

  //   setProductAttributes((prev) => {
  //     let newValue = value;

  //     // Convert boolean values from dropdowns
  //     if (value.toLowerCase() === "true") newValue = true;
  //     if (value.toLowerCase() === "false") newValue = false;

  //     // Convert numbers properly
  //     if (type === "number") newValue = value ? Number(value) : "";

  //     // Handle nested dimensions object
  //     if (["length", "width", "height"].includes(name)) {
  //       return {
  //         ...prev,
  //         dimensions: {
  //           ...prev.dimensions,
  //           [name]: newValue,
  //         },
  //       };
  //     }

  //     return { ...prev, [name]: newValue };
  //   });
  // };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setProductAttributes((prev) => {
      let newValue = value;

      // Convert boolean values from dropdowns
      if (value.toLowerCase() === "true") newValue = true;
      if (value.toLowerCase() === "false") newValue = false;

      // Convert numbers properly
      if (type === "number") newValue = value ? Number(value) : "";

      let updatedAttributes = { ...prev, [name]: newValue };

      // ✅ Handle nested dimensions properly
      if (["length", "width", "height"].includes(name)) {
        updatedAttributes = {
          ...prev,
          dimensions: {
            ...prev.dimensions, // Preserve existing dimensions
            [name]: newValue, // Update only the changed field
          },
        };
      } else {
        updatedAttributes = { ...prev, [name]: newValue };
      }

      // ✅ Auto-calculate when declaredValue or destinationCountry changes
      if (name === "declaredValue" || name === "destinationCountry") {
        const hsCode = hsCodeMapping[selectedCategory] || "0000"; // Default HS Code
        const declaredValue = Number(updatedAttributes.declaredValue || 0);
        const tariff = calculateTariff(hsCode, updatedAttributes.destinationCountry);
        const additionalCharges = calculatePlatformCharges(declaredValue);
        const totalCost = declaredValue + tariff + additionalCharges;

        updatedAttributes = {
          ...updatedAttributes,
          hsCode,
          tariff,
          additionalCharges,
          totalCost,
        };
      }

      return updatedAttributes;
    });
  };


  const generateTrackingId = () => {
    return "TRACK" + Math.floor(1000 + Math.random() * 9000); // Generates TRACK1234
  };

  // const handleCreateShipment = async () => {
  //   // Retrieve customerId from localStorage
  //   const profileData = JSON.parse(localStorage.getItem("profileData"));
  //   const customerId = profileData?.id;

  //   if (!customerId) {
  //     alert("❌ Customer ID is missing. Please log in again.");
  //     return;
  //   }

  //   // Generate Tracking ID
  //   const trackingId = generateTrackingId();

  //   // Prepare shipment data
  //   const shipmentData = {
  //     ...productAttributes,
  //     category: selectedCategory,
  //     customerId,
  //     trackingId, // Add generated tracking ID
  //   };

  //   console.log("Validating Shipment Data:", shipmentData);

  //   // Required Fields
  //   const requiredFields = [
  //     "customerId",
  //     "name",
  //     "category",
  //     "declaredValue",
  //     "weight",
  //     "quantity",
  //     "destinationCountry",
  //     "sourceCountry",
  //   ];

  //   // Check for missing required fields
  //   for (const field of requiredFields) {
  //     if (!shipmentData[field]) {
  //       alert(`❌ Missing required field: ${field}`);
  //       return;
  //     }
  //   }

  //   // Validate source & destination countries
  //   if (shipmentData.sourceCountry === shipmentData.destinationCountry) {
  //     alert("❌ Source and Destination country cannot be the same!");
  //     return;
  //   }

  //   console.log(shipmentData);

  //   try {
  //     // **Step 1: Validate Shipment Against Compliance Rules**
  //     const complianceResponse = await fetch(
  //       "http://localhost:3001/rules/checkshipmentcompliance",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(shipmentData),
  //       }
  //     );

  //     const complianceResult = await complianceResponse.json();

  //     if (!complianceResponse.ok) {
  //       throw new Error(complianceResult.error || "Compliance validation failed.");
  //     }

  //     console.log("Compliance Check Result:", complianceResult);

  //     // **Step 2: Update Shipment Data Based on Compliance Validation**
  //     if (complianceResult.result.status === "Flagged") {
  //       shipmentData.shipmentFlagged = true;
  //       shipmentData.status = "Pending";
  //       shipmentData.flagMessage = complianceResult.result.violations.join(", ");
  //     } else if (complianceResult.result.status === "Rejected") {
  //       shipmentData.shipmentFlagged = true;
  //       shipmentData.status = "Rejected";
  //       shipmentData.flagMessage = complianceResult.result.violations.join(", ");
  //     } else {
  //       shipmentData.shipmentFlagged = false;
  //       shipmentData.status = "Approved";
  //       shipmentData.flagMessage = "Shipment Approved";
  //     }

  //     console.log("Final Shipment Data:", shipmentData);

  //     let flagM = shipmentData.flagMessage
  //     console.log(flagM);
  //     // **Step 3: Store Shipment Data in Database**
  //     const response = await fetch(
  //       "http://localhost:3001/shipments/createshipment",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ ...shipmentData,
  //           flagMessage: flagM,  }),
  //       }
  //     );

  //     const result = await response.json();

  //     alert("⚠️" + shipmentData.flagMessage);

  //     if (response.ok) {
  //       alert(`✅ Shipment Created Successfully! Tracking ID: ${trackingId}`);
  //     } else {
  //       alert(`❌ Failed to create shipment: ${result.message}`);
  //     }
  //   } catch (error) {
  //     console.error("Error creating shipment:", error);
  //     alert("❌ Something went wrong. Please try again.");
  //   }
  // };

  const generateComplianceReportHTML = (shipmentData) => {
    return `
      <html>
      <head>
        <title>Compliance Report - ${shipmentData.trackingId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .flagged { color: red; font-weight: bold; }
          .approved { color: green; font-weight: bold; }
          .download-buttons { margin-top: 20px; }
          button { padding: 10px; margin: 5px; font-size: 14px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h2>Compliance Report</h2>
        <p><strong>Tracking ID:</strong> ${shipmentData.trackingId}</p>
        <p><strong>Customer ID:</strong> ${shipmentData.customerId}</p>
        <p><strong>Category:</strong> ${shipmentData.category}</p>
        <p><strong>Status:</strong> <span class="${shipmentData.status === "Approved" ? "approved" : "flagged"
      }">${shipmentData.status}</span></p>
        <p><strong>Flag Message:</strong> ${shipmentData.flagMessage || "No Issues"}</p>
  
        <h3>Shipment Details</h3>
        <table>
          <tr><th>Field</th><th>Value</th></tr>
          <tr><td>Name</td><td>${shipmentData.name}</td></tr>
          <tr><td>Declared Value</td><td>${shipmentData.declaredValue}</td></tr>
          <tr><td>Weight</td><td>${shipmentData.weight} kg</td></tr>
          <tr><td>Quantity</td><td>${shipmentData.quantity}</td></tr>
          <tr><td>HS Code</td><td>${shipmentData.hsCode}</td></tr>
          <tr><td>Tariff</td><td>${shipmentData.tariff}</td></tr>
          <tr><td>Additional Charges</td><td>${shipmentData.additionalCharges}</td></tr>
          <tr><td>Total Cost</td><td>${shipmentData.totalCost}</td></tr>
          <tr><td>Source Country</td><td>${shipmentData.sourceCountry}</td></tr>
          <tr><td>Destination Country</td><td>${shipmentData.destinationCountry}</td></tr>
        </table>
  
        <div class="download-buttons">
          <button onclick="downloadHTML()">📜 Download as HTML</button>
          <button onclick="downloadPDF()">📄 Download as PDF</button>
        </div>
  
        <script>
          function downloadHTML() {
            const blob = new Blob([document.documentElement.outerHTML], { type: "text/html" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Compliance_Report_${shipmentData.trackingId}.html";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
  
          function downloadPDF() {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(document.documentElement.outerHTML);
            printWindow.document.close();
            printWindow.print();
          }
        </script>
      </body>
      </html>
    `;
  };


  const downloadPDFReport = (shipmentData) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Compliance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Tracking ID: ${shipmentData.trackingId}`, 20, 30);
    doc.text(`Customer ID: ${shipmentData.customerId}`, 20, 40);
    doc.text(`Category: ${shipmentData.category}`, 20, 50);
    doc.text(`Status: ${shipmentData.status}`, 20, 60);
    doc.text(`Flag Message: ${shipmentData.flagMessage || "No Issues"}`, 20, 70);

    doc.autoTable({
      startY: 80,
      head: [["Field", "Value"]],
      body: Object.entries(shipmentData).map(([key, value]) => [key, value]),
    });

    doc.save(`Compliance_Report_${shipmentData.trackingId}.pdf`);
  };


  // Open HTML report in a new tab
  const downloadHTMLReport = (shipmentData) => {
    const newWindow = window.open();
    newWindow.document.write(generateComplianceReportHTML(shipmentData));
    newWindow.document.close();
  };

  const generateAndOpenComplianceReport = (shipmentData) => {
    const htmlContent = generateComplianceReportHTML(shipmentData);

    // Open in a new tab
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    // Store shipment data for PDF generation
    setGeneratedShipmentData(shipmentData);
  };



  // const handleCreateShipment = async () => {
  //   const profileData = JSON.parse(localStorage.getItem("profileData"));
  //   const customerId = profileData?.id;

  //   if (!customerId) {
  //     alert("❌ Customer ID is missing. Please log in again.");
  //     return;
  //   }

  //   const trackingId = generateTrackingId();
  //   const hsCode = hsCodeMapping[selectedCategory] || "0000"; // Default HS Code
  //   const declaredValue = Number(productAttributes.declaredValue || 0);
  //   const tariff = calculateTariff(
  //     hsCode,
  //     productAttributes.destinationCountry
  //   );
  //   const platformCharges = calculatePlatformCharges(declaredValue);
  //   const totalCost = declaredValue + tariff + platformCharges;

  //   const shipmentData = {
  //     ...productAttributes,
  //     category: selectedCategory,
  //     customerId,
  //     trackingId,
  //     hsCode,
  //     tariff,
  //     platformCharges,
  //     totalCost,
  //   };

  //   console.log("Final Shipment Data:", shipmentData);

  //   try {
  //     const complianceResponse = await fetch(
  //       "http://localhost:3001/rules/checkshipmentcompliance",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(shipmentData),
  //       }
  //     );

  //     const complianceResult = await complianceResponse.json();

  //     if (!complianceResponse.ok) {
  //       throw new Error(
  //         complianceResult.error || "Compliance validation failed."
  //       );
  //     }

  //     shipmentData.shipmentFlagged =
  //       complianceResult.result.status !== "Approved";
  //     shipmentData.status = complianceResult.result.status;
  //     shipmentData.flagMessage =
  //       complianceResult.result.violations.join(", ") || "Shipment Approved";

  //     console.log("Final Shipment Data with Compliance:", shipmentData);

  //     const response = await fetch(
  //       "http://localhost:3001/shipments/createshipment",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(shipmentData),
  //       }
  //     );

  //     const result = await response.json();

  //     alert("⚠️ " + shipmentData.flagMessage);

  //     if (response.ok) {
  //       alert(`✅ Shipment Created Successfully! Tracking ID: ${trackingId}`);
  //     } else {
  //       alert(`❌ Failed to create shipment: ${result.message}`);
  //     }
  //   } catch (error) {
  //     console.error("Error creating shipment:", error);
  //     alert("❌ Something went wrong. Please try again.");
  //   }
  // };

  const handleCreateShipment = async () => {
    const profileData = JSON.parse(localStorage.getItem("profileData"));
    const customerId = profileData?.id;

    if (!customerId) {
      alert("❌ Customer ID is missing. Please log in again.");
      return;
    }

    const trackingId = generateTrackingId();
    const shipmentData = {
      ...productAttributes,
      category: selectedCategory,
      customerId,
      trackingId,
    };

    const requiredFields = [
      "customerId",
      "name",
      "category",
      "declaredValue",
      "weight",
      "quantity",
      "destinationCountry",
      "sourceCountry",
    ];

    for (const field of requiredFields) {
      if (!shipmentData[field]) {
        alert(`❌ Missing required field: ${field}`);
        return;
      }
    }

    if (shipmentData.sourceCountry === shipmentData.destinationCountry) {
      alert("❌ Source and Destination country cannot be the same!");
      return;
    }

    try {
      // Step 1: Compliance Check
      const complianceResponse = await fetch(
        "http://localhost:3001/rules/checkshipmentcompliance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shipmentData),
        }
      );

      const complianceResult = await complianceResponse.json();

      if (!complianceResponse.ok) {
        throw new Error(complianceResult.error || "Compliance validation failed.");
      }

      if (complianceResult.result.status === "Flagged") {
        shipmentData.shipmentFlagged = true;
        shipmentData.status = "Pending";
        shipmentData.flagMessage = complianceResult.result.violations.join(", ");
      } else if (complianceResult.result.status === "Rejected") {
        shipmentData.shipmentFlagged = true;
        shipmentData.status = "Rejected";
        shipmentData.flagMessage = complianceResult.result.violations.join(", ");
      } else {
        //====== AI API LOGIC
        const AiResponse = await fetch(
          "http://localhost:8989/predict",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(shipmentData),
          }
        );

        if (!AiResponse.ok) {
          throw new Error(`AI Server Error: ${AiResponse.status}`);
        }
        const AiResult = await AiResponse.json();

        console.log('Ai Res: ...', AiResult);

        if (AiResult.prediction == 1) {
          shipmentData.shipmentFlagged = true;
          shipmentData.status = "Pending";

          if (AiResult.top_reasons && AiResult.top_reasons.length > 0) {
            shipmentData.flagMessage = `Flagged by AI due to Issue in: ${AiResult.top_reasons[0].feature} - Likelihood: ${Math.round(AiResult.top_reasons[0].impact * 10)}%`;
          } else {
            shipmentData.flagMessage = "Flagged by AI due to unknown reason.";
          }
        }
        else {
          shipmentData.shipmentFlagged = false;
          shipmentData.status = "Approved";
          shipmentData.flagMessage = "Shipment Approved";
        }
      }

      // Step 2: Store Shipment in Database
      const response = await fetch(
        "http://localhost:3001/shipments/createshipment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shipmentData),
        }
      );

      const result = await response.json();

      setGeneratedShipmentData(shipmentData)

      if (response.ok) {
        alert("⚠️ " + shipmentData.flagMessage)
        alert(`✅ Shipment Created Successfully! Tracking ID: ${trackingId}`);

        // Step 3: Auto-Open Compliance Report

        generateAndOpenComplianceReport(shipmentData);


      } else {
        alert(`❌ Failed to create shipment: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      alert("❌ Something went wrong. Please try again.");
    }
  };


  const renderCategoryFields = () => {
    return (
      <>
        <div className="country-selection">
          <div className="source-country">
            <label>Source Country</label>
            <select name="sourceCountry" onChange={handleInputChange}>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="arrow">→</div>

          <div className="destination-country">
            <label>Destination Country</label>
            <select name="destinationCountry" onChange={handleInputChange}>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCategory === "Electronics" && (
          <>
            <label>Battery Included</label>
            <select name="batteryIncluded" onChange={handleInputChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <label>Power Rating</label>
            <input
              type="text"
              name="powerRating"
              onChange={handleInputChange}
              placeholder="e.g., 220V, 50Hz"
            />
          </>
        )}

        {selectedCategory === "Chemical" && (
          <>
            <label>Hazard Class</label>
            <input
              type="text"
              name="hazardClass"
              onChange={handleInputChange}
              placeholder="Enter Hazard Classification"
            />

            <label>Handling Instructions</label>
            <input
              type="text"
              name="handlingInstructions"
              onChange={handleInputChange}
              placeholder="Enter Special Handling Instructions"
            />
          </>
        )}

        {selectedCategory === "Clothes" && (
          <>
            <label>Fabric Type</label>
            <input
              type="text"
              name="fabricType"
              onChange={handleInputChange}
              placeholder="Cotton, Polyester, etc."
            />

            <label>Size</label>
            <input
              type="text"
              name="size"
              onChange={handleInputChange}
              placeholder="S, M, L, XL"
            />
          </>
        )}

        {selectedCategory === "Food" && (
          <>
            <label>Perishable</label>
            <select name="perishable" onChange={handleInputChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <label>Storage Temperature</label>
            <input
              type="text"
              name="storageTemperature"
              onChange={handleInputChange}
              placeholder="Recommended Temperature"
            />
          </>
        )}

        {selectedCategory === "Medicine" && (
          <>
            <label>Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              onChange={handleInputChange}
            />

            <label>Requires Prescription</label>
            <select name="requiresPrescription" onChange={handleInputChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </>
        )}

        {selectedCategory === "Automobile" && (
          <>
            <label>Vehicle Part Number</label>
            <input
              type="text"
              name="vehiclePartNumber"
              onChange={handleInputChange}
              placeholder="Part Number"
            />

            <label>Compatibility</label>
            <input
              type="text"
              name="compatibility"
              onChange={handleInputChange}
              placeholder="Compatible Vehicle Models"
            />
          </>
        )}

        {selectedCategory === "Jewelry" && (
          <>
            <label>Material</label>
            <input
              type="text"
              name="material"
              onChange={handleInputChange}
              placeholder="Gold, Silver, etc."
            />

            <label>Weight in Carats</label>
            <input
              type="number"
              name="weightInCarats"
              onChange={handleInputChange}
              placeholder="Enter Carat Weight"
            />
          </>
        )}

        <label>HS Code</label>
        <input
          type="text"
          name="hsCode"
          value={productAttributes.hsCode || ""}
          readOnly
        />

        <fieldset className="broF">
          <legend>
            <strong>Pricing Attributes</strong>
          </legend>
          <div className="pricing-container">
            <div className="pricing-group">
              <label>Sub Total</label>
              <input
                type="number"
                name="subTotal"
                value={productAttributes.declaredValue || ""}
                readOnly
              />

              <label>Tariff</label>
              <input
                type="number"
                name="tariff"
                value={productAttributes.tariff || ""}
                readOnly
              />
            </div>

            <div className="pricing-group">
              <label>Additional Charges</label>
              <input
                type="number"
                name="additionalCharges"
                value={productAttributes.additionalCharges || ""}
                readOnly
              />

              <label>Total Cost</label>
              <input
                type="number"
                name="totalCost"
                value={productAttributes.totalCost || ""}
                readOnly
              />
            </div>
          </div>
        </fieldset>
      </>
    );
  };

  return (
    <div className="shipment-form-container">
      <div className="category-tabs">
        {categories.map((category) => (
          <div
            key={category}
            className={`tab ${selectedCategory === category ? "active" : ""}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </div>
        ))}
      </div>

      <div className="shipment-form">
        <div className="left-side">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            onChange={handleInputChange}
            placeholder="Enter Product Name"
          />

          <div className="declared-currency-container">
            <div className="declared-value">
              <label>Declared Value</label>
              <input
                type="number"
                name="declaredValue"
                onChange={handleInputChange}
                placeholder="Enter Declared Value"
              />
            </div>

            <div className="currency">
              <label>Currency</label>
              <select name="currency" onChange={handleInputChange}>
                <option value="USD">USD</option>
                {/* <option value="INR">INR</option> */}
                {/* <option value="Other">Other</option> */}
              </select>
            </div>
          </div>

          <label>Regulatory Documents</label>
          <input
            type="url"
            name="regulatoryDocs"
            onChange={handleInputChange}
            placeholder="Enter URL for Regulatory Documents"
          />

          <fieldset className="broF">
            <legend>
              <strong>Product Attributes</strong>
            </legend>
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              onChange={handleInputChange}
              placeholder="Enter Weight"
            />

            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              onChange={handleInputChange}
              placeholder="Enter Quantity"
            />

            <label>Dimensions</label>
            <div className="dimension-fields">
              <input
                type="number"
                name="length"
                onChange={handleInputChange}
                placeholder="Length (cm)"
                className="dimension-input"
              />
              <input
                type="number"
                name="width"
                onChange={handleInputChange}
                placeholder="Width (cm)"
                className="dimension-input"
              />
              <input
                type="number"
                name="height"
                onChange={handleInputChange}
                placeholder="Height (cm)"
                className="dimension-input"
              />
            </div>
          </fieldset>
        </div>

        <div className="right-side">{renderCategoryFields()}</div>
      </div>

      <button
        className="shipBtn"
        onClick={() => {
          handleCreateShipment();
        }}
      >
        Add Shipment
      </button>
      {generatedShipmentData && (
        <div>

        </div>
      )}



    </div>
  );
};

export default AddShipment;
