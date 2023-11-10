import React from "react";
import "../App.css";
import image from "../assets/logo3.png";
const Footer = () => {
  return (
    <div
      className="mt-4 d-flex justify-space-between align-items-center"
      style={{ backgroundColor: "#10005d" }}
    >
      <div style={{ width: "120px" }}></div>

      <h4 className="text-center text-white flex-grow-1">
        Developed by Blockchain Labs@Zensar
      </h4>

      <img style={{ width: "120px" }} src={image} alt="Zensar Logo" />
    </div>
  );
};

export default Footer;
