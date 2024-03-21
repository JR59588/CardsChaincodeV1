import React from "react";
import "../App.css";
import image from "../assets/logo3.png";
const Footer = () => {
  return (
    <div
      className="d-flex justify-space-between align-items-center"
      style={{ backgroundColor: "#10005d" }}
    >
      <div style={{ width: "120px" }}></div>

      <h5
        className="text-center text-white flex-grow-1"
        style={{ fontWeight: "400" }}
      >
        Developed by Blockchain Labs @ Zensar
      </h5>

      <img style={{ width: "120px" }} src={image} alt="Zensar Logo" />
    </div>
  );
};

export default Footer;
