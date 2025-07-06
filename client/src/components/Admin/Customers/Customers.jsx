import React, { useEffect, useState } from "react";
import "./customers.css"; 

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Number of customers per page

  const fetchCustomers = async (pageNumber) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3001/shipments/getallcustomers?page=${pageNumber}&limit=${limit}`
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch customers");

      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  return (
    <div className="customers-container">
      <h2>📋 Customers List</h2>

      {loading && <div className="loader"></div>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && customers.length === 0 && <p>No customers found.</p>}

      {!loading && !error && customers.length > 0 && (
        <>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.companyName || "N/A"}</td>
                  <td>{customer.address}</td>
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
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Customers;
