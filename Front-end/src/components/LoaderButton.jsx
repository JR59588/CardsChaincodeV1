import { Button, Spinner } from "react-bootstrap";

const { useState } = require("react");

const LoaderButton = ({ handlerFunc }) => {
  const [loading, setLoading] = useState(false);
  const handleButtonClick = async () => {
    setLoading(true);
    await handlerFunc();
    setLoading(false);
  };
  return (
    <Button onClick={handleButtonClick} disabled={loading}>
      {loading ? (
        <Spinner animation="border" role="status" size="sm">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : (
        "Execute"
      )}
    </Button>
  );
};

export default LoaderButton;
