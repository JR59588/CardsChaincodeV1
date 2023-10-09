import React from "react";
import '../App.css'
import image from '../assets/logo3.png'
const Footer = () => {
  return (
    <div className="bg mt-4" style={{ width:'auto', height: "70px", backgroundColor: "#10005d" }}>
      <h4 style={{ textAlign: "center", lineHeight: "70px" ,color:'white',marginLeft:'185px' }}>
        Developed by Blockchain Labs@Zensar
        <img style={{width:"120px", height:"70px", float:"right"}}  src={image} alt="no Img"/>
      </h4>
    </div>
  );
};


export default Footer;

