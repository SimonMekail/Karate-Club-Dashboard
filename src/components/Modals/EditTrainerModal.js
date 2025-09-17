import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { AuthData } from "../../auth/AuthWrapper";
import { API_CONFIG } from "../../config";
import toast from "react-hot-toast";

export const EditTrainerModal = ({
  show,
  onHide,
  refreshData,
  trainerData,
}) => {
  const { user } = AuthData();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    number: "",
    imagePath: "",
    isActive: true,
    imageFile: "",
    personID: "",
    trainerID: "",
    startDate: "",
  });

  useEffect(() => {
    if (trainerData) {
      setFormData({
        name: trainerData.name || "",
        address: trainerData.address || "",
        number: trainerData.number || "",
        imagePath: trainerData.imagePath || "",
        isActive: trainerData.isActive || true,
        personID: trainerData.personID || null,
        trainerID: trainerData.trainerID || null,
        imageFile: null,
        startDate: trainerData.startDate,
      });

      
      if (trainerData.imagePath) {
        setImagePreview(trainerData.imagePath);
      } else {
        setImagePreview(null);
      }
    }
  }, [trainerData]);
  console.log(formData);
  console.log(trainerData);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    }

    if (!formData.number.trim()) {
      newErrors.number = "رقم الهاتف مطلوب";
    } else if (!/^[\d\s+-]+$/.test(formData.number)) {
      newErrors.number = "رقم الهاتف غير صالح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "يجب أن يكون الملف صورة (JPEG, PNG, GIF, WebP)",
        }));
        return;
      }

      
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "يجب أن يكون حجم الصورة أقل من 2MB",
        }));
        return;
      }

      
      setErrors((prev) => ({ ...prev, image: "" }));

      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePath: "",
    }));
    document.getElementById("edit-trainer-image").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("جاري تحديث بيانات المدرب...");

    try {
      let imagePath = formData.imagePath;

      
      if (formData.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("imageFile", formData.imageFile);

        const uploadResponse = await axios.post(
          "/api/People/Upload",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",

              ...API_CONFIG.AUTH_HEADERS(user.token),
            },
          }
        );

        if (uploadResponse.status === 200 || uploadResponse.status === 201) {
          imagePath = uploadResponse.data.imageUrl || uploadResponse.data.path;
        } else {
          throw new Error("فشل في رفع الصورة");
        }
      }

      
      const personResponse = await axios.put(
        `/api/People/${formData.personID}`,
        {
          personID: 0,
          name: formData.name,
          address: formData.address,
          number: formData.number,
          startDate: formData.startDate,
          imagePath: imagePath,
        },
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        }
      );

      if (personResponse.status !== 200 && personResponse.status !== 204) {
        throw new Error("فشل في تحديث سجل الشخص");
      }

      
      const trainerResponse = await axios.put(
        `/api/Trainers/${formData.trainerID}`,
        {
          personID: formData.personID,
          isActive: formData.isActive,
        },
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        }
      );

      if (trainerResponse.status === 200 || trainerResponse.status === 204) {
        toast.success(
          trainerResponse.data?.message || "تم تحديث بيانات المدرب بنجاح",
          { id: toastId }
        );

        onHide();
        if (refreshData) refreshData();
      } else {
        throw new Error("فشل في تحديث سجل المدرب");
      }
    } catch (error) {
      console.error(error);
      let errorMessage = "حدث خطأ أثناء تحديث بيانات المدرب";

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.errors) {
            const apiErrors = {};
            Object.entries(error.response.data.errors).forEach(
              ([field, messages]) => {
                apiErrors[field.toLowerCase()] = messages.join(", ");
              }
            );
            setErrors(apiErrors);
            errorMessage = "البيانات المدخلة غير صالحة";
          } else {
            errorMessage = error.response.data?.message || errorMessage;
          }
        } else if (error.response.status === 401) {
          errorMessage = "غير مصرح لك بهذا الإجراء";
        } else if (error.response.status === 404) {
          errorMessage = "لم يتم العثور على المدرب";
        } else if (error.response.status === 500) {
          errorMessage = "خطأ في الخادم الداخلي";
        }
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const commonField = (label, fieldName) => (
    <>
      <Form.Label className="fw-medium" style={{ color: "var(--karate-text)" }}>
        {label}
        <span className="text-danger ms-1">*</span>
      </Form.Label>
      <Form.Control.Feedback type="invalid" className="d-block small">
        {errors[fieldName]}
      </Form.Control.Feedback>
    </>
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="EditTrainerModalLabel"
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
              className="fas fa-user-edit"
              style={{ color: "var(--karate-primary)" }}
            ></i>
          </div>
          <div>
            <Modal.Title className="fw-bold mb-0" style={{ color: "white" }}>
              تعديل بيانات المدرب
            </Modal.Title>
            <p className="small mb-0 opacity-75" style={{ color: "white" }}>
              قم بتعديل الحقول التالية لتحديث بيانات المدرب
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
            <Row className="g-3">
              {}
              <Col xs={12}>
                <Form.Group controlId="edit-trainer-image" className="mb-3">
                  <Form.Label
                    className="fw-medium"
                    style={{ color: "var(--karate-text)" }}
                  >
                    صورة المدرب
                  </Form.Label>
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-block small"
                  >
                    {errors.image}
                  </Form.Control.Feedback>

                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {imagePreview ? (
                        <div className="position-relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="rounded-circle"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 start-0 rounded-circle"
                            style={{
                              width: "24px",
                              height: "24px",
                              padding: 0,
                            }}
                            onClick={removeImage}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "80px",
                            height: "80px",
                            backgroundColor: "var(--karate-card)",
                            border: "2px dashed var(--karate-border)",
                          }}
                        >
                          <i className="fas fa-user text-muted"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border-2 rounded-3"
                        style={{
                          borderColor: "var(--karate-border)",
                          backgroundColor: "var(--karate-card)",
                          color: "var(--karate-text)",
                        }}
                      />
                      <Form.Text
                        className="small d-block"
                        style={{ color: "var(--karate-text-muted)" }}
                      >
                        الصور المسموحة: JPG, PNG, GIF, WebP (بحد أقصى 2MB)
                      </Form.Text>
                    </div>
                  </div>
                </Form.Group>
              </Col>

              {}
              <Col xs={12}>
                <Form.Group controlId="edit-trainer-name" className="mb-3">
                  {commonField("الاسم", "name")}
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-2 rounded-3"
                    style={{
                      borderColor: "var(--karate-border)",
                      backgroundColor: "var(--karate-card)",
                      color: "var(--karate-text)",
                    }}
                    isInvalid={!!errors.name}
                  />
                </Form.Group>
              </Col>

              {}
              <Col md={6}>
                <Form.Group controlId="edit-trainer-address" className="mb-3">
                  {commonField("العنوان", "address")}
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="border-2 rounded-3"
                    style={{
                      borderColor: "var(--karate-border)",
                      backgroundColor: "var(--karate-card)",
                      color: "var(--karate-text)",
                    }}
                    isInvalid={!!errors.address}
                  />
                </Form.Group>
              </Col>

              {}
              <Col md={6}>
                <Form.Group controlId="edit-trainer-number" className="mb-3">
                  {commonField("رقم الهاتف", "number")}
                  <Form.Control
                    type="tel"
                    value={formData.number}
                    onChange={(e) =>
                      handleInputChange("number", e.target.value)
                    }
                    className="border-2 rounded-3"
                    style={{
                      borderColor: "var(--karate-border)",
                      backgroundColor: "var(--karate-card)",
                      color: "var(--karate-text)",
                    }}
                    isInvalid={!!errors.number}
                    placeholder="مثال: 0512345678"
                  />
                  <Form.Text
                    className="small"
                    style={{ color: "var(--karate-text)" }}
                  >
                    مثال: 0512345678
                  </Form.Text>
                </Form.Group>
              </Col>

              {}
              <Col xs={12}>
                <Form.Group controlId="edit-trainer-active" className="mb-3">
                  <Form.Check
                    type="switch"
                    label={
                      <span
                        className="fw-medium"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {formData.isActive ? "نشط" : "غير نشط"}
                      </span>
                    }
                    id="active-switch"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div
              className="d-flex justify-content-between mt-4 pt-3 border-top"
              style={{ borderColor: "var(--karate-border)" }}
            >
              <Button
                variant="outline"
                onClick={onHide}
                disabled={isUpdating}
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
                disabled={isUpdating}
                className="px-4 rounded-3"
                style={{
                  backgroundColor: "var(--karate-primary)",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(var(--karate-primary-rgb), 0.2)",
                  color: "white",
                }}
              >
                {isUpdating ? (
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
                    حفظ التغييرات
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
