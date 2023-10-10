import React from "react";
import "./About.css";
import merchantOnboardingV2 from "../assets/MerchantOnboardingV3.svg";
import updatedStateDiagram from "../assets/V5.png";
import Footer from "./Footer";

const About = () => {
  return (
    <div
      id="carouselExampleControlsNoTouching"
      className="carousel slide"
      data-bs-touch="false"
      data-bs-interval="false"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            src={merchantOnboardingV2}
            className="d-block w-100 image1H"
            alt="No merchantOnboarding Image"
          />
          <br />
         
        </div>
        <div className="carousel-item">
          
          <img
            src={updatedStateDiagram}
            className="d-block w-100 image2H"
            alt="No salesReturn Image"
          />
        </div>
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleControlsNoTouching"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleControlsNoTouching"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default About;