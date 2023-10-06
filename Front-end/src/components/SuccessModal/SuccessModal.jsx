import React from "react";

const SuccessModal = ({ getState, message, header, reason }) => {
  const onClickCross = () => {
    getState(false);
  };
  return (
    <div className="blur">
      <div className="modalDemo">
        <span
          className="cross"
          onClick={onClickCross}
          style={{ fontSize: "20px" }}
        >
          ✖
        </span>
        <div className="modalHeader">
          <h4>{header}</h4>
        </div>
        <hr />
        <div className="modalBody">
          <h5>{message}</h5>
          {reason && <p>Reason: {reason}</p>}
        </div>
        <hr />
        <div className="modalFooter">
          <button onClick={onClickCross} className="btn btn-outline-danger">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
