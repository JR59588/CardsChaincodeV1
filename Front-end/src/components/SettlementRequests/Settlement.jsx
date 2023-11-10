import React from "react";
import { Nav, Tab, Tabs } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";
import FileRequest from "./FileRequest";
import FormRequest from "./FormRequest";
import SingleRequest from "./SingleRequest";

const Settlement = () => {
  return (
    <div>
      <Tabs
        defaultActiveKey="form"
        id="settlement-tabs"
        className="mb-3"
        fill
        variant="underline"
      >
        <Tab eventKey="form" title="Submit a Form">
          <FormRequest />
        </Tab>
        <Tab eventKey="single" title="Submit a Settlement Request">
          <SingleRequest />
        </Tab>
        <Tab eventKey="file" title="Submit a File">
          <FileRequest />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Settlement;
