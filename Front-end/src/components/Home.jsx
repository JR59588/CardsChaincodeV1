import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "./Home.css";
import Footer from "./Footer";
import { Navigation } from "swiper";

export default function Home() {
  const navigate = useNavigate();
  const [radioButton, setRadioButton] = useState();
  const [via, setVia] = useState();
  const [radioButton2, setRadioButton2] = useState();

  //Handling the onchange values of merchants.
  const handleChange = (event) => {
    setRadioButton(event.target.value);
  };
  //Handling the onchange values of organisations other than merchants.
  const handleChange2 = (event) => {
    setRadioButton2(event.target.value);
  };
  //Handeling the onchange values of the aggregator button.
  const handleChangeVia = (event) => {
    setVia(event.target.value);
  };
  //  resetting radio button(merchant and organisation options).
  const ResetView = () => {
    setRadioButton("");
    setVia("");
    setRadioButton2("");

    const hidediv = document.getElementById("div1");
    hidediv.style.display = "inline";
  };
  //handling proceed button(proceed to the next view page).
  const ProceedView = (event) => {
    event.preventDefault();
    console.log(radioButton);
    console.log(via);
    console.log(radioButton2);

    if (radioButton === "merc1" && via === "agg1") {
      navigate("/Merchant");
    }
    if (radioButton === "merc3" && via === "agg1") {
      navigate("/Merchant");
    }
    if (radioButton === "merc4" && via === "agg1") {
      navigate("/Merchant");
    }
    if (radioButton === "merc5" && via === "agg1") {
      navigate("/Merchant");
    }
    if (radioButton === "merc6" && via === "agg1") {
      navigate("/Merchant");
    }
    if (radioButton === "merc1" && via === "agg2") {
      navigate("/FileComponent");
    }
    if (radioButton === "merc3" && via === "agg2") {
      navigate("/FileComponent");
    }
    if (radioButton === "merc4" && via === "agg2") {
      navigate("/FileComponent");
    }
    if (radioButton === "merc5" && via === "agg2") {
      navigate("/FileComponent");
    }
    if (radioButton === "merc6" && via === "agg2") {
      navigate("/FileComponent");
    }
    if (radioButton2 === "merc2") {
      navigate("/ViewTx");
    }
    if (radioButton2 === "merc7") {
      navigate("/ViewTx");
    }
    if (radioButton2 === "merc8") {
      navigate("/ViewTx");
    }
    if (radioButton2 === "merc9") {
      navigate("/ViewTx");
    }
    if (radioButton2 === "merc10") {
      navigate("/ViewTx");
    }
    if (radioButton2 === "merc11") {
      navigate("/FileComponent");
    }
  };

  const handleClick = () => {
    const hidediv = document.getElementById("div1");
    hidediv.style.display = "none";
  };

  const handle2click = () => {
    const hidediv = document.getElementById("div1");
    hidediv.style.display = "inline";
  };

  return (
    <div>
      <div className="container">
        <br />
        <br />
        <h5>Please choose the organisation you represent to proceed:</h5>
        <>
          <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
            <SwiperSlide>
              <form>
                <div className="row">
                  <div className="radio">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd1"
                        className="radiogroup"
                        value="merc1"
                        checked={radioButton === "merc1"}
                        onClick={handle2click}
                        onChange={handleChange}
                      />
                      <label className="k1" style={{ fontSize: "20px" }}>
                        Merchant 1
                      </label>
                      <br />
                      <br />
                      <br />
                      <div className="captions">Orange Electronics</div>
                    </label>
                  </div>

                  <div className="radio">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd1"
                        className="radiogroup"
                        value="merc3"
                        checked={radioButton === "merc3"}
                        onClick={handle2click}
                        onChange={handleChange}
                      />
                      <label className="k1" style={{ fontSize: "20px" }}>
                        Merchant 2
                      </label>
                      <br />
                      <br />
                      <br />
                      <div className="captions">
                        Banana
                        <br /> Oil and Gas
                      </div>
                    </label>
                  </div>
                  <br />
                  <div className="radio">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd1"
                        className="radiogroup"
                        value="merc4"
                        checked={radioButton === "merc4"}
                        onClick={handle2click}
                        onChange={handleChange}
                      />
                      <label className="k1" style={{ fontSize: "20px" }}>
                        Merchant 3
                      </label>
                      <br />
                      <br />
                      <br />
                      <div className="captions">Grapes Retailer</div>
                    </label>
                  </div>
                  <br />
                  <div className="radio">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd1"
                        className="radiogroup"
                        value="merc5"
                        checked={radioButton === "merc5"}
                        onClick={handle2click}
                        onChange={handleChange}
                      />
                      <label className="k1" style={{ fontSize: "20px" }}>
                        Merchant 4
                      </label>
                      <br />
                      <br />
                      <br />
                      <div className="captions">
                        Mango
                        <br />
                        Travel and leisure
                      </div>
                    </label>
                  </div>
                  <br />
                  <div className="radio">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd1"
                        className="radiogroup"
                        value="merc6"
                        checked={radioButton === "merc6"}
                        onClick={handle2click}
                        onChange={handleChange}
                      />
                      <label className="k1" style={{ fontSize: "20px" }}>
                        Merchant 5
                      </label>
                      <br />
                      <br />
                      <br />
                      <div className="captions">
                        Kiwi
                        <br />
                        Luxury Brand
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </SwiperSlide>
            <br />
            <br />
            <br />
            <br />
            <div id="div1">
              <h6>Please choose your settlement mode:</h6>
              <input
                type="radio"
                name="agg"
                value="agg1"
                width="10px"
                checked={via === "agg1"}
                onChange={handleChangeVia}
              />
              &nbsp; Direct (Without aggregator)
              <input
                type="radio"
                name="agg"
                value="agg2"
                style={{ marginLeft: "60px" }}
                checked={via === "agg2"}
                onChange={handleChangeVia}
              />
              &nbsp; Via Aggregator
            </div>

            <SwiperSlide>
              <form>
                <div className="row">
                  <div className="radio1">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup"
                        value="merc11"
                        checked={radioButton2 === "merc11"}
                        onClick={handleClick}
                        onChange={handleChange2}
                        style={{ position: "relative", left: "-45px" }}
                      />
                      <span style={{ position: "relative", left: "-15px" }}>
                        Aggregator
                      </span>
                      <br />
                      <br /> <br />
                      <div className="captions">Aggregator</div>
                    </label>
                  </div>
                  <div className="radio1">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup"
                        value="merc2"
                        checked={radioButton2 === "merc2"}
                        onClick={handleClick}
                        onChange={handleChange2}
                      />
                      Servicing Org
                      <br />
                      <br /> <br />
                      <div className="captions">SA</div>
                    </label>
                  </div>
                  <br />
                  <div className="radio2">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup2"
                        value="merc7"
                        checked={radioButton2 === "merc7"}
                        onClick={handleClick}
                        onChange={handleChange2}
                      />
                      <span style={{ position: "relative", left: "-15px" }}>
                        {" "}
                        Accounts
                      </span>{" "}
                      <span style={{ position: "relative", left: "-9px" }}>
                        {" "}
                        Payable
                      </span>
                      <br />
                      <br />
                      <div className="captions">AP</div>
                    </label>
                  </div>
                  <br />
                  <div className="radio2">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup2"
                        value="merc8"
                        checked={radioButton2 === "merc8"}
                        onClick={handleClick}
                        onChange={handleChange2}
                      />
                      <span style={{ position: "relative", left: "-10px" }}>
                        Customer
                      </span>{" "}
                      <span style={{ position: "relative", left: "1px" }}>
                        accounting
                      </span>
                      <br />
                      <br />
                      <div className="captions">CAcct</div>
                    </label>
                  </div>
                  <br />
                  <div className="radio2">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup"
                        value="merc9"
                        checked={radioButton2 === "merc9"}
                        onClick={handleClick}
                        onChange={handleChange2}
                      />
                      <span style={{ position: "relative", left: "-5px" }}>
                        Clearing/EDI
                      </span>
                      <br />

                      <br />
                      <br />
                      <div className="captions">EDI</div>
                    </label>
                  </div>

                  <div className="radio2">
                    <label>
                      <br />
                      <input
                        type="radio"
                        name="rd2"
                        className="radiogroup1"
                        value="merc10"
                        checked={radioButton2 === "merc10"}
                        onClick={handleClick}
                        onChange={handleChange2}
                      />
                      <span style={{ position: "relative", left: "-15px" }}>
                        TBD
                      </span>
                      <br />
                      <br />
                      <br />
                      <div className="captions">TBD</div>
                    </label>
                  </div>
                </div>
              </form>
            </SwiperSlide>
          </Swiper>
        </>
      </div>

      <div className="container" style={{'marginTop':'46px'}}>
        <div className="row">
          <div className="col-md-12">
          <div className="bts">
        <div>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={ResetView}
            style={{ width: "120px" }}
          >
            Reset
          </button>
        </div>
        <div>
          {" "}
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={ProceedView}
            style={{ width: "120px" }}
          >
            Proceed
          </button>
        </div>
      </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
