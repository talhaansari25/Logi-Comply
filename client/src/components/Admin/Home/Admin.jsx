
import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./admin.css";
import logo from "../../../assets/logisys.png";


const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem("profileRole"); // Remove role from local storage
    localStorage.removeItem("token"); // Remove auth token
    navigate("/"); // Redirect to welcome page
  };

  useEffect(() => {
    // Remove background image when Customer component mounts
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#f4f4f4"; // Optional: Set a default background color

    return () => {
      // Reset background image when unmounting (optional)
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="customer-dashboard">
     
      <nav className="navbar navbarhome">
        <div className="flexLogoS">
          <img src={logo} alt="" />
          <h1>Logi-Comply</h1>
        </div>

        <div className="logoSide">
          <i onClick={() => navigate("/admin/dashboard")} className="fas fa-user"></i>
          <i onClick={handleSignOut} className="fas fa-power-off"></i>
        </div>
      </nav>

      <div className="dashboard-container dbbhai">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li className={location.pathname === "/customer/profile" ? "active" : ""}>
              <NavLink to="/admin/dashboard">
              <i className="fas fa-pie-chart"></i> Dashboard
              </NavLink>
            </li>
          
            <li className={location.pathname === "/customer/addshipment" ? "active" : ""}>
              <NavLink to="/admin/shipments">
                <i className="fas fa-ship"></i> Shipments
              </NavLink>
            </li>
            <li className={location.pathname === "/customer/uploadshipments" ? "active" : ""}>
              <NavLink to="/admin/rules">
                <i className="fas fa-boxes-stacked"></i> Rules
              </NavLink>
            </li>

            <hr />
            <li className={location.pathname === "/customer/shipmenthistory" ? "active" : ""}>
              <NavLink to="/admin/customers">
                <i className="fas fa-user"></i> Customers
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Dynamic Content (Customer Pages) */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
