import React from "react";
import { NavLink } from "react-router-dom";
import "../App.css";
import navLinksData from "../assets/navbarOptions.json";

const Header = ({ roleId, setRoleId, orgOptions }) => {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        height: "70px",
        backgroundColor: "#10005d",
        color: "white",
      }}
    >
      <div className="container-fluid" style={{ color: "white" }}>
        <a className="navbar-brand" href="#" style={{ color: "white" }}>
          HLF-CARDS MVP
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        />
        <div className="collapse navbar-collapse" id="navbarText">
          <ul
            style={{ display: "flex", alignItems: "center" }}
            className="navbar-nav me-auto mb-2 mb-lg-0"
          >
            {navLinksData.map((el, i) => {
              if (!el.children) {
                return (
                  <li key={el.id} className="nav-item">
                    <NavLink to={el.url} className="ani">
                      {el.name}
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={el.id} className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    style={{ color: "white" }}
                  >
                    {el.name}
                  </a>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    {el.children.map((ele) => (
                      <NavLink
                        className="dropdown-item"
                        to={ele.url}
                        key={ele.name}
                      >
                        {ele.name}
                      </NavLink>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          <select
            style={{
              width: "210px",
              backgroundColor: "#10005d",
              height: "36px",
              color: "white",
            }}
            className="form-select"
            id="dropdown"
            required
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
          >
            {orgOptions.map((orgOption, index) => (
              <option
                value={orgOption.orgId}
                id={orgOption.orgId}
                key={"org" + index}
                className="dropdown-item"
              >
                {orgOption.orgName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Header;
