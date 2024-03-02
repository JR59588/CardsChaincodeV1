import React, { useState } from "react";
import "./FileRequest.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import Loader from "../ViewOnboardingStatic/Loader/Loader";

const FileRequest = (props) => {
    const iso8583filerequesturl =
        "http://localhost:3001/api/v1/uploadCSVWithType"; //"http://localhost:3001/api/v1/uploadCSV"
    const { roleId } = props;

    const [show, setShow] = useState(false);

    const [popupData, setPopupData] = useState({ header: "", content: "" });
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const handleClose = () => setShow(false);

    const ISO8583Schema = Yup.object().shape({
        file: Yup.mixed().required("A CSV file is required"),
        fileType: Yup.string().required("File type is required"),
        roleId: Yup.string().required("A role id is required"),
        executionMode: Yup.string().required("An execution mode is required"),
    });

    return (
        <div>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{popupData.header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{popupData.content}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={isFormSubmitting}
                backdrop="static"
                keyboard={false}
                centered
                animation={false}
            >
                <Modal.Body className="bg-transparent">
                    <Loader message={"Please wait as your form is being submitted"} />
                </Modal.Body>
            </Modal>
            <div className="container mt-3 mb-3">
                <div className="row justify-content-center">
                    <div className="col col-md-6 p-5 form-section border border-1 rounded">
                        <Formik
                            initialValues={{
                                file: null,
                                roleId,
                                executionMode: "",
                                fileType: "",
                            }}
                            validationSchema={ISO8583Schema}
                            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                                console.log("Inside onsubmit", values);
                                if (values.file == null) {
                                    setFieldError("file", "Required");
                                } else {
                                    try {
                                        console.log("Inside form onsubmit");
                                        setSubmitting(true);
                                        setIsFormSubmitting(true);
                                        const formData = new FormData();
                                        formData.append("file", values.file);
                                        formData.append("roleId", values.roleId);
                                        formData.append("executionMode", values.executionMode);
                                        formData.append("fileType", values.fileType);
                                        const response = await axios.post(
                                            iso8583filerequesturl,
                                            formData,
                                            {
                                                headers: { "Content-Type": "multipart/form-data" },
                                            }
                                        );
                                        console.log(response);
                                        setShow(true);
                                        setPopupData({
                                            header: "Success",
                                            content: "Form submitted successfully",
                                        });
                                    } catch (error) {
                                        console.log(error);
                                        setShow(true);
                                        setPopupData({
                                            header: "Failed",
                                            content: "Form submission failed",
                                        });
                                    }
                                    setSubmitting(false);
                                    setIsFormSubmitting(false);
                                }
                            }}
                        >
                            {({
                                errors,
                                touched,
                                handleChange,
                                values,
                                handleBlur,
                                handleSubmit,
                                isSubmitting,
                                setFieldValue,
                                getFieldMeta,
                            }) => (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group controlId="file" className="mb-3">
                                        <Form.Label>Upload file:</Form.Label>
                                        <Form.Control
                                            type="file"
                                            name="file"
                                            accept=".csv"
                                            onChange={(event) => {
                                                setFieldValue("file", event.target.files[0]);
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {touched.file && errors.file ? (
                                            <div className="error-message">{errors.file}</div>
                                        ) : null}
                                    </Form.Group>
                                    <Form.Group controlId="fileType" className="mb-3">
                                        <Form.Label>File type:</Form.Label>
                                        <Form.Select
                                            aria-label="Default select example"
                                            onChange={(event) => {
                                                setFieldValue("fileType", event.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            style={{ height: "100%" }}
                                        >
                                            <option value="">Select file type</option>
                                            <option value="authorizationRequest">
                                                Authorization Request
                                            </option>
                                            <option value="authorizationResponse">
                                                Authorization Response
                                            </option>
                                            <option value="settlementRequest">
                                                Settlement Request
                                            </option>
                                        </Form.Select>
                                        {touched.fileType && errors.fileType ? (
                                            <div className="error-message">{errors.fileType}</div>
                                        ) : null}
                                    </Form.Group>
                                    {values.fileType === "settlementRequest" && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Execution Mode</Form.Label>
                                            <div className="row pe-2 ps-2">
                                                <Form.Check
                                                    className="col-6"
                                                    type="radio"
                                                    label="Auto"
                                                    name="executionMode"
                                                    id="executionModeAuto"
                                                    value="auto"
                                                    checked={values.executionMode === "auto"}
                                                    onChange={(event) => {
                                                        setFieldValue("executionMode", event.target.value);
                                                    }}
                                                />
                                                <Form.Check
                                                    className="col-6"
                                                    type="radio"
                                                    label="Manual"
                                                    name="executionMode"
                                                    id="manualModeAuto"
                                                    value="manual"
                                                    checked={values.executionMode === "manual"}
                                                    onChange={(event) => {
                                                        setFieldValue("executionMode", event.target.value);
                                                    }}
                                                />
                                            </div>
                                            {touched.fileType && errors.fileType ? (
                                                <div className="error-message">{errors.fileType}</div>
                                            ) : null}
                                        </Form.Group>
                                    )}
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-100"
                                    >
                                        {isSubmitting ? "Please wait..." : "Submit"}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileRequest;
