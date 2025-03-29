import React, { useState } from "react";
import "./shipment.css";

const UploadShipments = () => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [flaggedShipments, setFlaggedShipments] = useState([]);
  const [rejectedShipments, setRejectedShipments] = useState([]);

  const customerId = JSON.parse(localStorage.getItem("profileData"))?.id;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
    setSuccess("");

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;

        // Check for missing fields before parsing the CSV
        const missingFieldsObject = handleMissingFields(text);

        if (Object.keys(missingFieldsObject).length === 0) {
          parseCSV(text); // Proceed to parse CSV if no fields are missing
        } else {
          // Alert the user about missing fields
          let alertMessage = `Missing fields:\n`;
          for (const [lineNo, missingFields] of Object.entries(missingFieldsObject)) {
            alertMessage += `Line ${lineNo}: ${missingFields.join(", ")}\n`;
          }
          
          // alert(alertMessage);
          setError(alertMessage);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  // Function to check for missing fields
  const handleMissingFields = (csvText) => {
    const rows = csvText.split("\n");
    const headers = rows[0].split(","); // Extract headers from the first row

    // Define required fields for each category
    const requiredFields = {
      Medicine: ["expirationDate", "requiresPrescription"],
      Chemical: ["hazardClass", "handlingInstructions"],
      Electronics: ["batteryIncluded", "powerRating"],
      Automobile: ["vehiclePartNumber", "compatibility"],
      Food: ["perishable", "storageTemperature"],
      Jewelry: ["material", "weightInCarats"],
      Cloth: ["fabricType", "size"],
    };

    // Common required fields for all categories
    const commonFields = [
      "name",
      "category",
      "declaredValue",
      "weight",
      "quantity",
      "sourceCountry",
      "destinationCountry",
    ];

    const missingFieldsObject = {};

    // Iterate through each row (starting from the second row, as the first row is headers)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue; // Skip empty rows

      const values = row.split(",");
      const category = values[headers.indexOf("category")];

      const missingFields = [];

      // Check if all common fields are present
      for (const field of commonFields) {
        const fieldIndex = headers.indexOf(field);
        if (fieldIndex === -1 || !values[fieldIndex]) {
          missingFields.push(`${field}`);
        }
      }

      // Check if the category is valid
      if (!requiredFields[category]) {
        missingFields.push(`Invalid category: ${category}`);
      } else {
        // Check if all category-specific fields are present
        for (const field of requiredFields[category]) {
          const fieldIndex = headers.indexOf(field);
          if (fieldIndex === -1 || !values[fieldIndex]) {
            missingFields.push(`${category}-${field}`);
          }
        }
      }

      // If there are missing fields for this row, add them to the object
      if (missingFields.length > 0) {
        missingFieldsObject[i + 1] = missingFields; // Line number is i + 1 (since rows start from 0)
      }
    }

    return missingFieldsObject; // Return object with missing fields
  };

  const parseCSV = (csvText) => {
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const headers = lines[0].split(",");

    const data = lines.slice(1).map((row) => {
      const values = row.split(",");
      const shipment = headers.reduce((acc, header, index) => {
        acc[header] = values[index] || "";
        return acc;
      }, {});

      // Default status before validation
      shipment.status = "Pending";
      shipment.flagMessage = "Validating...";
      return shipment;
    });

    setCsvData(data);
  };

  const generateComplianceReportHTML = (validatedShipments) => {
    let reportContent = `
      <html>
      <head>
        <title>Compliance Report</title>
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
    `;

    validatedShipments.forEach((shipment, index) => {
      reportContent += `
        <hr>
        <h3>Shipment ${index + 1}</h3>
        <p><strong>Tracking ID:</strong> ${shipment.trackingId}</p>
        <p><strong>Customer ID:</strong> ${shipment.customerId}</p>
        <p><strong>Category:</strong> ${shipment.category}</p>
        <p><strong>Status:</strong> <span class="${shipment.status === "Approved" ? "approved" : "flagged"
        }">${shipment.status}</span></p>
        <p><strong>Flag Message:</strong> ${shipment.flagMessage || "No Issues"}</p>
  
        <h3>Shipment Details</h3>
        <table>
          <tr><th>Field</th><th>Value</th></tr>
          <tr><td>Name</td><td>${shipment.name}</td></tr>
          <tr><td>Declared Value</td><td>${shipment.declaredValue}</td></tr>
          <tr><td>Weight</td><td>${shipment.weight} kg</td></tr>
          <tr><td>Quantity</td><td>${shipment.quantity}</td></tr>
          <tr><td>HS Code</td><td>${shipment.hsCode}</td></tr>
          <tr><td>Tariff</td><td>${shipment.tariff}</td></tr>
          <tr><td>Additional Charges</td><td>${shipment.additionalCharges}</td></tr>
          <tr><td>Total Cost</td><td>${shipment.totalCost}</td></tr>
          <tr><td>Source Country</td><td>${shipment.sourceCountry}</td></tr>
          <tr><td>Destination Country</td><td>${shipment.destinationCountry}</td></tr>
        </table>
      `;
    });

    reportContent += `
        <div class="download-buttons">
          <button onclick="downloadHTML()">📜 Download as HTML</button>
          <button onclick="downloadPDF()">📄 Download as PDF</button>
        </div>
  
        <script>
          function downloadHTML() {
            const blob = new Blob([document.documentElement.outerHTML], { type: "text/html" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Compliance_Report.html";
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

    return reportContent;
  };


  const generateAndOpenComplianceReport = (shipmentData) => {
    const htmlContent = generateComplianceReportHTML(shipmentData);

    // Open in a new tab
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    // Store shipment data for PDF generation
    // setGeneratedShipmentData(shipmentData);
  };



  const handleUpload = async () => {
    if (!csvData.length) {
      setError("❌ No valid shipments found. Please select a CSV file.");
      return;
    }

    if (!customerId) {
      setError("❌ Customer ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Step 1: Validate Each Shipment
      const validatedShipments = await Promise.all(
        csvData.map(async (shipment) => {
          try {
            const response = await fetch(
              "http://localhost:3001/rules/checkshipmentcompliance",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shipment),
              }
            );

            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error || "Compliance validation failed.");

            // ✅ Update shipment status based on validation
            if (result.result.status == "Flagged") {
              shipment.status = "Pending";
              shipment.flagMessage = result.result.violations.join(", ");
              shipment.shipmentFlagged = true;
            } else if (result.result.status == "Rejected") {
              shipment.status = "Rejected";
              shipment.flagMessage = result.result.violations.join(", ");
              shipment.shipmentFlagged = true;
            } else {
              shipment.status = "Approved";
              shipment.flagMessage = "Shipment Approved";
              shipment.shipmentFlagged = false;
            }

            return shipment;
          } catch (error) {
            return {
              ...shipment,
              status: "Pending",
              flagMessage: "Validation failed",
              shipmentFlagged: true,
            };
          }
        })
      );

      // === Loop / Promise Resolves here------

      // == AI API Logic | First slice (remove form original but store here) out validatedShipments only  for each validatedShipments, ship->status = "Approved";  & then pass this all togethere to api and when we get result, iterate over over slice stored and add res status, flagged msg so on... then append it back to original i.e validatedShipments
      const approvedShipments = validatedShipments.filter((s) => s.status === "Approved");

      if (approvedShipments.length > 0) {
        const aiResponse = await fetch("http://localhost:8989/predictBulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipments: approvedShipments }),
        });

        const aiResults = await aiResponse.json();
        if (!aiResponse.ok) throw new Error(aiResults.error || "AI prediction failed.");

        // ✅ Merge AI Results into Approved Shipments
        approvedShipments.forEach((shipment, index) => {
          const AiResult = aiResults.predictions[index];
          console.log("Ai Res...", AiResult);

          if (AiResult.prediction === 1) {
            shipment.shipmentFlagged = true;
            shipment.status = "Pending";

            if (AiResult.top_reasons && AiResult.top_reasons.length > 0) {
              shipment.flagMessage = `Flagged by AI due to Issue in: ${AiResult.top_reasons[0]} - Likelihood: ${Math.round(AiResult.top_reasons[1] * 10)}%`;
            } else {
              shipment.flagMessage = "Flagged by AI due to unknown reason.";
            }
          }
        });
      }

      console.log("✅ Validated Shipments with AI:", validatedShipments);


      // ✅ Step 2: Send Updated Shipments to Backend for Storage
      const response = await fetch(
        "http://localhost:3001/shipments/uploadcsv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, shipments: validatedShipments }),
        }
      );

      const uploadResult = await response.json();
      if (!response.ok) throw new Error(uploadResult.error || "Upload failed.");

      setSuccess(`✅ Shipments Uploaded! Approved: ${validatedShipments.filter((s) => s.status === "Approved").length
        }, 
      Flagged: ${validatedShipments.filter((s) => s.status === "Pending").length
        }, 
      Rejected: ${validatedShipments.filter((s) => s.status === "Rejected").length
        }`);

      // ✅ Separate Flagged & Rejected Shipments
      const flagged = validatedShipments.filter(
        (s) => s.shipmentFlagged && s.status === "Pending"
      );
      const rejected = validatedShipments.filter(
        (s) => s.shipmentFlagged && s.status === "Rejected"
      );

      setFlaggedShipments(flagged);
      setRejectedShipments(rejected);

      generateAndOpenComplianceReport(validatedShipments);

      setFile(null);
      setCsvData([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const headers = [
      "customerId",
      "sourceCountry",
      "destinationCountry",
      "name",
      "category",
      "declaredValue",
      "currency",
      "weight",
      "quantity",
      "batteryIncluded",
      "powerRating",
      "expirationDate",
      "requiresPrescription",
      "hazardClass",
      "handlingInstructions",
      "vehiclePartNumber",
      "compatibility",
      "perishable",
      "storageTemperature",
      "material",
      "weightInCarats",
      "fabricType",
      "size",
      "hsCode",
      "subTotal",
      "tariff",
      "additionalCharges",
      "totalCost",
      "status",
      "trackingId",
      "length",
      "width",
      "height",
    ];

    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_shipments.csv";
    link.click();
  };

  return (
    <div className="upload-container">
      <h2>📤 Upload Shipments via CSV</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="successn success">{success}</p>}

      <div className="file-input-container">
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      {csvData.length > 0 && (
        <div className="csv-preview">
          <h3>📄 CSV Preview</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="upload-btn" onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Shipments"}
      </button>

      <button className="download-sample-btn" onClick={handleDownloadSampleCSV}>
        📥 Download Sample CSV Format
      </button>

      {/* Flagged Shipments Table */}
      {flaggedShipments.length > 0 && (
        <div className="flagged-table">
          {/* <h3>🚩 Flagged Shipments (Pending)</h3> */}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Declared Value</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Destination</th>
                <th>Flag Message</th>
              </tr>
            </thead>
            <tbody>
              {flaggedShipments.map((shipment, index) => (
                <tr key={index}>
                  <td>{shipment.name}</td>
                  <td>{shipment.category}</td>
                  <td>${shipment.declaredValue}</td>
                  <td>{shipment.weight} kg</td>
                  <td>{shipment.quantity}</td>
                  <td>{shipment.destinationCountry}</td>
                  <td>{shipment.flagMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Rejected Shipments Table */}
      {rejectedShipments.length > 0 && (
        <div className="rejected-table">
          {/* <h3>❌ Rejected Shipments</h3> */}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Declared Value</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Destination</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {rejectedShipments.map((shipment, index) => (
                <tr key={index}>
                  <td>{shipment.name}</td>
                  <td>{shipment.category}</td>
                  <td>${shipment.declaredValue}</td>
                  <td>{shipment.weight} kg</td>
                  <td>{shipment.quantity}</td>
                  <td>{shipment.destinationCountry}</td>
                  <td>{shipment.flagMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default UploadShipments;
