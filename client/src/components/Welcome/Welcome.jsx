import React, {useEffect} from "react";
import { Link } from "react-router-dom";
import './welcome.css'
import slogo from '../../assets/logisys.png'
import { useNavigate } from "react-router-dom";

import ill1 from '../../assets/ill1.png'
import ill2 from '../../assets/ill2.png'
import ill3 from '../../assets/ill3.png'

const Welcome = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("profileRole");

    if (role === "Customer") {
      navigate("/customer");
    } else if (role === "Admin") {
      navigate("/admin");
    }
  }, [navigate]); 

  return (
    <div>
      {/* Navbar */}
      <nav>
        <div>
          <img src={slogo} alt="Logi-Comply Logo" width="50" />
          <h1>Logi-Comply</h1>
        </div>
        <div>
          <Link to="/customer/login">Customer</Link>
          <Link to="/admin/login">Admin</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header>
        <h2>Welcome to Logi-Comply 🚢</h2>
        <p>A Compliance management system for hassle-free cross-border shipments.</p>
      </header>

      {/* Features Section */}
      <section>
        <h3>Why Choose Logi-Comply?</h3>
        <div>
          <div>
            <img src={ill1} alt="Data Processing" width="300" />
            <h4>Automated Compliance</h4>
            <p>Logi-Comply checks your shipments for compliance in real-time, reducing manual errors.</p>
          </div>

          <div>
            <img src={ill2} alt="Security" width="300" />
            <h4>Secure & Reliable</h4>
            <p>Your data is encrypted and protected with industry-standard security measures.</p>
          </div>

          <div>
            <img src={ill3} alt="Logistics" width="300" />
            <h4>Seamless Logistics</h4>
            <p>Manage your shipments effortlessly with our user-friendly dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <footer>
        <h3>Ready to get started?</h3>
        <p>Sign up as a customer or admin and experience hassle-free compliance management.</p>
        <div>
          <a href="/customer/register">Join as Customer</a>
          <a href="/admin/register">Join as Admin</a>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
