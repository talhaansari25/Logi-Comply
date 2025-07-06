import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess("Admin account created successfully! Redirecting...");
      alert("✅ Admin Account Created Successfully, Kindly Login");
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="custReg">
      <h2> 🛠️ Admin Signup</h2>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />

        <button type="submit">{loading ? "Registering..." : "Register"}</button>
      </form>

      <p className="lastM">
        Already have an account? <a onClick={() => navigate('/admin/login')}>Login here</a>
      </p>
    </div>
  );
};

export default RegisterAdmin;
