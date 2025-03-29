import React from "react";
import "./notification.css";
import welcomeImage from "../../../assets/logisys.png"; // Replace with your image path

const notifications = [
  {
    id: 1,
    heading: "Welcome to Logi-Comply 🎉",
    description: "Logi-Comply simplifies cross-border shipping compliance with automated checks and seamless logistics management.",
    image: welcomeImage,
  },
];  

const Notification = () => {
  return (
    <div className="notification-container">
      <h2>🔔 Notifications</h2>
      {notifications.map((notification) => (
        <div key={notification.id} className="notification-card">
          <img src={notification.image} alt="Notification" className="notification-image" />
          <div className="notification-content">
            <h3>{notification.heading}</h3>
            <p>{notification.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
