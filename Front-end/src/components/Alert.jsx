import React from "react";

const Alert = ({ msg, closeAlert }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "1px",
        left: "50%",
        transform: "translate(-50% ,10px)",
      }}
      className="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      <strong className="text-capitalize text-dark"> {msg}</strong>
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
        onClick={closeAlert}
      ></button>
    </div>
  );
};

export default Alert;
