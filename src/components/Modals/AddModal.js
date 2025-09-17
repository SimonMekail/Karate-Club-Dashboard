import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { AuthData } from "../../auth/AuthWrapper";
import toast from "react-hot-toast";
import { API_CONFIG } from "../../config";

const AddModal = ({
  itemType = "العنصر",
  initialData = {},
  formFields = [],
  apiEndpoint,
  refreshData,
  buttonIcon = <i className="fas fa-plus"></i>,
  modalSize = "lg",
  show,
  onHide,
  successMessage = `تم إضافة ${itemType} بنجاح`,
  errorMessage = `حدث خطأ أثناء إضافة ${itemType}`,
  additionalData = {},
}) => {
  const { user } = AuthData();
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => {
    const initialFormData = {};
    formFields.forEach((field) => {
      initialFormData[field.name] = field.type === "checkbox" ? false : "";
    });
    return { ...initialFormData, ...initialData };
  });

  const validateForm = () => {
    const newErrors = {};

    formFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];

        if (value === "" || value === null || value === undefined) {
          newErrors[field.name] = `${field.label} مطلوب`;
          return;
        }

        if (field.type === "tel" && !/^[\d\s+-]+$/.test(value)) {
          newErrors[field.name] = "رقم الهاتف غير صالح";
          return;
        }

        if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
          newErrors[field.name] = "البريد الإلكتروني غير صالح";
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (value === "true") value = true;
    if (value === "false") value = false;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const toastId = toast.loading(`جاري إضافة ${itemType}...`);
    setIsAdding(true);
    setErrors({});

    const requestData = {
      ...formData,
      ...additionalData,
    };

    axios
      .post(apiEndpoint, requestData, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (
          response.request.status === 200 ||
          response.request.status === 201
        ) {
          const msg = response.data.message || successMessage;
          toast.success(msg, { id: toastId });

          const resetFormData = {};
          formFields.forEach((field) => {
            resetFormData[field.name] = field.type === "checkbox" ? false : "";
          });
          setFormData(resetFormData);

          if (refreshData) refreshData();
          setTimeout(() => onHide(), 1500);
        }
      })
      .catch((error) => {
        console.error("Add error:", error);
        let errorMsg = error.response?.data || error.message || errorMessage;

        if (error.response?.status === 400 && error.response.data?.errors) {
          const apiErrors = {};
          Object.entries(error.response.data.errors).forEach(
            ([field, messages]) => {
              apiErrors[field.toLowerCase()] = messages.join(", ");
            }
          );
          setErrors(apiErrors);
          errorMsg = "البيانات المدخلة غير صالحة";
        }

        toast.error(errorMsg, { id: toastId });
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  const commonField = (field) => (
    <>
      <Form.Label className="fw-medium" style={{ color: "var(--karate-text)" }}>
        {field.label}
        {field.required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Form.Control.Feedback type="invalid" className="d-block small">
        {errors[field.name]}
      </Form.Control.Feedback>
    </>
  );

  const renderField = (field) => {
    const fieldProps = {
      key: field.name,
      value: formData[field.name] ?? "",
      onChange: (e) =>
        handleInputChange(
          field.name,
          field.type === "checkbox" ? e.target.checked : e.target.value
        ),
      required: field.required,
      isInvalid: !!errors[field.name],
    };

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        return (
          <Col key={field.name} md={6} className={field.colClassName}>
            <Form.Group controlId={`add-${field.name}`} className="mb-3">
              {commonField(field)}
              <Form.Control
                type={field.type}
                {...fieldProps}
                className="border-2 rounded-3"
                style={{
                  borderColor: "var(--karate-border)",
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                }}
              />
              {field.type === "tel" && (
                <Form.Text
                  className="small"
                  style={{ color: "var(--karate-text-muted)" }}
                >
                  مثال: 0512345678
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        );

      case "time":
        return (
          <Col key={field.name} md={6} className={field.colClassName}>
            <Form.Group controlId={`add-${field.name}`} className="mb-3">
              {commonField(field)}
              <Form.Control
                type="time"
                {...fieldProps}
                step={field.step || "1"}
                className="border-2 rounded-3"
                style={{
                  borderColor: "var(--karate-border)",
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                }}
              />
              <Form.Text
                className="small"
                style={{ color: "var(--karate-text-muted)" }}
              >
                HH:MM:SS
              </Form.Text>
            </Form.Group>
          </Col>
        );

      case "textarea":
        return (
          <Col key={field.name} xs={12} className={field.colClassName}>
            <Form.Group controlId={`add-${field.name}`} className="mb-3">
              {commonField(field)}
              <Form.Control
                as="textarea"
                rows={field.rows || 3}
                {...fieldProps}
                className="border-2 rounded-3"
                style={{
                  borderColor: "var(--karate-border)",
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                }}
              />
            </Form.Group>
          </Col>
        );

      case "select":
        return (
          <Col key={field.name} md={6} className={field.colClassName}>
            <Form.Group controlId={`add-${field.name}`} className="mb-3">
              {commonField(field)}
              <Form.Select
                {...fieldProps}
                className="border-2 rounded-3"
                style={{
                  borderColor: "var(--karate-border)",
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                }}
              >
                <option value="">اختر {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        );

      case "checkbox":
        return (
          <Col key={field.name} xs={12} className={field.colClassName}>
            <Form.Group controlId={`add-${field.name}`} className="mb-3">
              <Form.Check
                type="switch"
                label={
                  <span
                    className="fw-medium"
                    style={{ color: "var(--karate-text)" }}
                  >
                    {field.label}
                  </span>
                }
                checked={formData[field.name] || false}
                onChange={(e) =>
                  handleInputChange(field.name, e.target.checked)
                }
              />
            </Form.Group>
          </Col>
        );

      case "custom":
        return (
          <React.Fragment key={field.name}>
            {field.render(formData, handleInputChange, errors[field.name])}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={modalSize}
      aria-labelledby={`AddModalLabel-${itemType}`}
      backdrop="static"
      className="karate-modal"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-3 pt-4"
        style={{
          background:
            "linear-gradient(135deg, var(--karate-primary) 0%, var(--karate-primary-dark) 100%)",
          color: "white",
        }}
      >
        <div className="d-flex align-items-center">
          <div
            className="bg-white p-2 px-3 rounded-circle me-3"
            style={{ width: "40px", height: "40px" }}
          >
            <i
              className="fas fa-plus"
              style={{ color: "var(--karate-primary)" }}
            ></i>
          </div>
          <div>
            <Modal.Title className="fw-bold mb-0" style={{ color: "white" }}>
              إضافة {itemType} جديد
            </Modal.Title>
            <p className="small mb-0 opacity-75" style={{ color: "white" }}>
              املأ النموذج التالي لإضافة {itemType}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: "var(--karate-background)",
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
          color: "var(--karate-text)",
        }}
      >
        <div className="pt-3">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">{formFields.map(renderField)}</Row>

            <div
              className="d-flex justify-content-between mt-4 pt-3 border-top"
              style={{ borderColor: "var(--karate-border)" }}
            >
              <Button
                variant="outline"
                onClick={onHide}
                disabled={isAdding}
                className="px-4 rounded-3"
                style={{
                  borderColor: "var(--karate-border)",
                  color: "var(--karate-text)",
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="px-4 rounded-3"
                style={{
                  backgroundColor: "var(--karate-primary)",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(var(--karate-primary-rgb), 0.2)",
                  color: "white",
                }}
              >
                {isAdding ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    حفظ
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddModal;
