import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./home.css";
import logo from "../../../assets/logisys.png";


const Customer = () => {
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
      {/* Navbar (Visible on All Customer Pages) */}
      <nav className="navbar navbarhome">
        <div className="flexLogoS">
          <img src={logo} alt="" />
          <h1>Logi-Comply</h1>
        </div>

        <div className="logoSide">
          <i onClick={() => navigate("/customer/profile")} className="fas fa-user"></i>
          <i onClick={handleSignOut} className="fas fa-power-off"></i>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li className={location.pathname === "/customer/profile" ? "active" : ""}>
              <NavLink to="/customer/profile">
                <i className="fas fa-user"></i> Customer Profile
              </NavLink>
            </li>
            <li className={location.pathname === "/customer/dashboard" ? "active" : ""}>
              <NavLink to="/customer/dashboard">
                <i className="fas fa-pie-chart"></i> Dashboard
              </NavLink>
            </li>
            <li className={location.pathname === "/customer/addshipment" ? "active" : ""}>
              <NavLink to="/customer/addshipment">
                <i className="fas fa-ship"></i> Add Shipment
              </NavLink>
            </li>
            <li className={location.pathname === "/customer/uploadshipments" ? "active" : ""}>
              <NavLink to="/customer/uploadshipments">
                <i className="fas fa-boxes-stacked"></i> Batch Upload
              </NavLink>
            </li>

            <hr />
            <li className={location.pathname === "/customer/shipmenthistory" ? "active" : ""}>
              <NavLink to="/customer/shipmenthistory">
                <i className="fa-solid fa-clock-rotate-left"></i> Shipment History
              </NavLink>
            </li>
            <li className={location.pathname === "/customer/notifications" ? "active" : ""}>
              <NavLink to="/customer/notifications">
                <i className="fa-solid fa-bell"></i> Notifications
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

export default Customer;
