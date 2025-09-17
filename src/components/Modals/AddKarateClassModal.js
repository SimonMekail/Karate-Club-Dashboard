import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { AuthData } from "../../auth/AuthWrapper";
import toast from "react-hot-toast";
import axios from "axios";
import { API_CONFIG } from "../../config";

export const AddKarateClassModal = ({
  show,
  onHide,
  refreshData,
  trainers,
}) => {
  const { user } = AuthData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    className: "",
    startTime: "09:00:00", 
    endTime: "10:00:00", 
    selectedTrainer: "",
    maxCapacity: 20,
    price: 0,
    weeksCount: 1,
    startDate: new Date().toISOString().split("T")[0],
    sessionDays: [],
  });

  const daysOfWeek = [
    { id: 0, name: "الأحد", label: "Sun" },
    { id: 1, name: "الإثنين", label: "Mon" },
    { id: 2, name: "الثلاثاء", label: "Tue" },
    { id: 3, name: "الأربعاء", label: "Wed" },
    { id: 4, name: "الخميس", label: "Thu" },
    { id: 5, name: "الجمعة", label: "Fri" },
    { id: 6, name: "السبت", label: "Sat" },
  ];

  useEffect(() => {
    if (show) {
      setFormData({
        className: "",
        startTime: "09:00:00", 
        endTime: "10:00:00", 
        selectedTrainer: "",
        maxCapacity: 20,
        price: 0,
        weeksCount: 1,
        startDate: new Date().toISOString().split("T")[0],
        sessionDays: [],
      });
      setErrors({});
    }
  }, [show]);

  const toggleDaySelection = (dayId) => {
    setFormData((prev) => {
      const newSessionDays = prev.sessionDays.includes(dayId)
        ? prev.sessionDays.filter((id) => id !== dayId)
        : [...prev.sessionDays, dayId];

      return { ...prev, sessionDays: newSessionDays };
    });

    if (errors.sessionDays) {
      setErrors((prev) => ({ ...prev, sessionDays: "" }));
    }
  };

  
  const formatTimeForAPI = (timeString) => {
    if (!timeString) return "00:00:00";

    
    if (timeString.includes(":") && timeString.split(":").length === 3) {
      return timeString;
    }

    
    if (timeString.includes(":") && timeString.split(":").length === 2) {
      return `${timeString}:00`;
    }

    
    return "00:00:00";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.className.trim()) {
      newErrors.className = "اسم الصف مطلوب";
    }

    if (!formData.selectedTrainer) {
      newErrors.selectedTrainer = "المدرب مطلوب";
    }

    if (formData.maxCapacity <= 0) {
      newErrors.maxCapacity = "السعة يجب أن تكون أكبر من الصفر";
    }

    if (formData.price < 0) {
      newErrors.price = "السعر لا يمكن أن يكون سالباً";
    }

    if (formData.weeksCount <= 0) {
      newErrors.weeksCount = "عدد الأسابيع يجب أن تكون أكبر من الصفر";
    }

    if (formData.sessionDays.length === 0) {
      newErrors.sessionDays = "يجب اختيار يوم واحد على الأقل";
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

  
  const handleTimeChange = (field, value) => {
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("جاري إضافة الحصة...");

    try {
      
      const classData = {
        trainerID: parseInt(formData.selectedTrainer),
        name: formData.className,
        startDate: new Date(formData.startDate).toISOString(),
        maxCapacity: parseInt(formData.maxCapacity),
        price: parseFloat(formData.price),
        sessionDays: formData.sessionDays.sort(),
        startTime: formatTimeForAPI(formData.startTime), 
        endTime: formatTimeForAPI(formData.endTime), 
        weeksCount: parseInt(formData.weeksCount),
      };

      const response = await axios.post(
        "/api/Classes/WithSessions",
        classData,
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || "تم إضافة الحصة بنجاح", {
          id: toastId,
        });

        onHide();
        if (refreshData) refreshData();
      } else {
        throw new Error("فشل في إنشاء الحصة");
      }
    } catch (error) {
      console.error(error);
      let errorMessage = "حدث خطأ أثناء إضافة الحصة";

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data) {
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
        } else if (error.response.status === 500) {
          errorMessage = "خطأ في الخادم الداخلي";
        }
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      className: "",
      startTime: "09:00:00",
      endTime: "10:00:00",
      selectedTrainer: "",
      maxCapacity: 20,
      price: 0,
      weeksCount: 1,
      startDate: new Date().toISOString().split("T")[0],
      sessionDays: [],
    });
    setErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header
        closeButton
        closeVariant="white"
        style={{
          backgroundColor: "var(--karate-primary)",
          color: "white",
        }}
      >
        <Modal.Title>جدولة صف الكاراتيه</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          backgroundColor: "var(--karate-background)",
          color: "var(--karate-text)",
        }}
      >
        <Form onSubmit={handleSubmit}>
          <div className="row">
            {}
            <div className="col-12 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                اسم الصف <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                isInvalid={!!errors.className}
                value={formData.className}
                onChange={(e) => handleInputChange("className", e.target.value)}
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.className}
              </Form.Control.Feedback>
            </div>

            {}
            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                السعة القصوى <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                isInvalid={!!errors.maxCapacity}
                value={formData.maxCapacity}
                onChange={(e) =>
                  handleInputChange("maxCapacity", e.target.value)
                }
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.maxCapacity}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                السعر (اختياري)
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                isInvalid={!!errors.price}
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </div>

            {}
            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                وقت البدء <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="time"
                step="1" 
                isInvalid={!!errors.startTime}
                value={formData.startTime.slice(0, 5)} 
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startTime}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                وقت الانتهاء <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="time"
                step="1" 
                isInvalid={!!errors.endTime}
                value={formData.endTime.slice(0, 5)} 
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.endTime}
              </Form.Control.Feedback>
            </div>

            {}
            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                تاريخ البدء <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                isInvalid={!!errors.startDate}
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startDate}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                عدد الأسابيع <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                isInvalid={!!errors.weeksCount}
                value={formData.weeksCount}
                onChange={(e) =>
                  handleInputChange("weeksCount", e.target.value)
                }
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.weeksCount}
              </Form.Control.Feedback>
            </div>

            {}
            <div className="col-12 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                المدرب <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                isInvalid={!!errors.selectedTrainer}
                value={formData.selectedTrainer}
                onChange={(e) =>
                  handleInputChange("selectedTrainer", e.target.value)
                }
                style={{
                  backgroundColor: "var(--karate-card)",
                  color: "var(--karate-text)",
                  borderColor: "var(--karate-border)",
                }}
              >
                <option value="">اختر المدرب</option>
                {trainers.map((trainer) => (
                  <option key={trainer.trainerID} value={trainer.trainerID}>
                    {trainer.personInfo.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.selectedTrainer}
              </Form.Control.Feedback>
            </div>

            {}
            <div className="col-12 mb-3">
              <Form.Label style={{ color: "var(--karate-text)" }}>
                أيام الأسبوع <span className="text-danger">*</span>
              </Form.Label>
              {errors.sessionDays && (
                <div className="text-danger small mb-2">
                  {errors.sessionDays}
                </div>
              )}
              <div className="d-flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.id}
                    variant={
                      formData.sessionDays.includes(day.id)
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => toggleDaySelection(day.id)}
                    style={{
                      backgroundColor: formData.sessionDays.includes(day.id)
                        ? "var(--karate-primary)"
                        : "transparent",
                      borderColor: "var(--karate-primary)",
                      color: formData.sessionDays.includes(day.id)
                        ? "white"
                        : "var(--karate-primary)",
                    }}
                  >
                    {day.name}
                  </Button>
                ))}
              </div>
            </div>

            {}
            {formData.sessionDays.length > 0 && (
              <div
                className="col-12 mb-3 p-3 rounded"
                style={{
                  backgroundColor: "var(--karate-secondary-light)",
                  color: "var(--karate-text)",
                }}
              >
                <h6>الأيام المختارة:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {formData.sessionDays.sort().map((dayId) => {
                    const day = daysOfWeek.find((d) => d.id === dayId);
                    return (
                      <span
                        key={day.id}
                        className="badge"
                        style={{
                          backgroundColor: "var(--karate-primary)",
                          color: "white",
                        }}
                      >
                        {day.name}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 small">
                  سيتم تكرار هذه الأيام لمدة {formData.weeksCount} أسبوع/أسابيع
                  بدءًا من{" "}
                  {new Date(formData.startDate).toLocaleDateString("ar-EG")}
                </p>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between mt-3">
            {formData.sessionDays.length > 0 && (
              <Button
                variant="danger"
                onClick={() => handleInputChange("sessionDays", [])}
                disabled={isSubmitting}
              >
                مسح الأيام
              </Button>
            )}
            <div className="ms-auto">
              <Button
                variant="secondary"
                className="me-2"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--karate-text-light)",
                  borderColor: "var(--karate-text-light)",
                }}
              >
                إغلاق
              </Button>
              <Button
                type="submit"
                style={{
                  backgroundColor: "var(--karate-primary)",
                  color: "white",
                  border: "none",
                }}
                disabled={isSubmitting || formData.sessionDays.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ الجدول"
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
