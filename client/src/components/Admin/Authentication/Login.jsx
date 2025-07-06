import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log(data);

      localStorage.setItem('profileData', JSON.stringify(data.profile))
      localStorage.setItem('profileRole', 'Admin')

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token); // Store JWT token
      alert("✅ Admin Login Successful! Redirecting to dashboard...");
      navigate("/admin/dashboard"); // Redirect to admin dashboard
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="custReg">
      <h2> 🔐 Admin Login</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <button type="submit">{loading ? "Logging in..." : "Login"}</button>
      </form>

      <p className="lastM">
        Don't have an account? <a onClick={() => navigate('/admin/register')}>Register here</a>
      </p>
    </div>
  );
};

export default LoginAdmin;
