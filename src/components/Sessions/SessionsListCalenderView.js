import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

import "../../styles/Calender.css";
import { API_CONFIG } from "../../config";

export default function SessionsListCalenderView({
  sessions,
  karateClasses,
  fetchSessions,
}) {
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    classID: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const formattedEvents = sessions.map((session) => ({
      id: session.sessionID,
      title: session.classInfo.name,
      start: session.date,
      extendedProps: {
        trainer: session.classInfo.trainerName,
        currentEnrollment: session.classInfo.currentEnrollment,
      },
    }));
    setEvents(formattedEvents);
  }, [sessions]);

  const handleDateClick = (arg) => {
    const clickedDate = arg.date;

    
    const localDate = new Date(
      clickedDate.getUTCFullYear(),
      clickedDate.getUTCMonth(),
      clickedDate.getUTCDate()
    );

    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    setSelectedDate(formattedDate);
    setFormData((prev) => ({
      ...prev,
      date: formattedDate,
    }));
    setShowAddModal(true);
  };

  const handleEventClick = (arg) => {
    setSelectedEvent(arg.event);
    setShowDetailsModal(true);
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      classID: "",
      date: selectedDate || "",
      startTime: "",
      endTime: "",
    });
    setError("");
    setSuccess("");
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveModal = () => {
    
    if (!formData.date || isNaN(new Date(formData.date).getTime())) {
      setError("تاريخ غير صحيح");
      return;
    }

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);

    if (selectedDate < today) {
      setError("لا يمكن إضافة جلسة لتاريخ مضى");
      return;
    }

    
    if (!formData.startTime || !formData.endTime) {
      setError("يجب تحديد وقت البدء ووقت الانتهاء");
      return;
    }

    const toastId = toast.loading(`جاري إضافة الجلسة...`);
    setIsAdding(true);
    setError("");
    setSuccess("");

    
    const formatTime = (time) => {
      if (!time) return "";
      const parts = time.split(":");
      if (parts.length === 2) return `${time}:00`;
      if (parts.length === 3) return time;
      return `${time.slice(0, 2)}:${time.slice(2)}:00`;
    };

    const sessionData = {
      classID: formData.classID,
      date: formData.date,
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime),
    };

    axios
      .post("/api/sessions", sessionData, {
        headers: API_CONFIG.DEFAULT_HEADERS,
      })
      .then((response) => {
        if ([200, 201].includes(response.status)) {
          const msg = response.data.message || "تم إضافة الجلسة بنجاح";
          toast.success(msg, { id: toastId });
          setSuccess(msg);
          if (fetchSessions) fetchSessions();
          handleCloseAddModal();
        } else {
          throw new Error(response.statusText);
        }
      })
      .catch((error) => {
        console.error("Full error:", {
          message: error.message,
          response: error.response?.data,
          config: error.config,
        });

        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء إضافة الجلسة";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    const toastId = toast.loading(`جاري حذف الجلسة...`);

    axios
      .delete(`/api/sessions/${selectedEvent.id}`, {
        headers: API_CONFIG.DEFAULT_HEADERS,
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("تم حذف الجلسة بنجاح", { id: toastId });
          setEvents(events.filter((event) => event.id !== selectedEvent.id));
          if (fetchSessions) fetchSessions();
        }
      })
      .catch((error) => {
        console.error("Delete error:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء حذف الجلسة";
        toast.error(errorMsg, { id: toastId });
      })
      .finally(() => {
        setShowDetailsModal(false);
        setSelectedEvent(null);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        buttonText={{
          today: "اليوم",
        }}
        height="80vh"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        eventColor="#364f8b"
        eventTextColor="#ffffff"
        eventDisplay="block"
        dayMaxEvents={1}
        locale="ar"
        timeZone="UTC" 
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
          hour12: false,
        }}
        eventContent={(arg) => {
          return {
            html: `
              <div class="fc-event-content">
                <div class="fc-event-title">${arg.event.title}</div>
                ${
                  arg.event.extendedProps.trainer
                    ? `<div class="fc-event-trainer">${arg.event.extendedProps.trainer}</div>`
                    : ""
                }
              </div>
            `,
          };
        }}
      />

      {}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة جلسة جديدة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>الصف</Form.Label>
              <Form.Select
                name="classID"
                value={formData.classID}
                onChange={handleInputChange}
                required
              >
                <option value="">اختر صف</option>
                {karateClasses.map((cls) => (
                  <option key={cls.classID} value={cls.classID}>
                    {cls.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>التاريخ</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>وقت البدء</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                step="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>وقت الانتهاء</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                step="1"
              />
            </Form.Group>
          </Form>
          {error && <div className="text-danger mt-2">{error}</div>}
          {success && <div className="text-success mt-2">{success}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              backgroundColor: "var(--karate-secondary)",
              color: "white",
              borderColor: "var(--karate-secondary)",
            }}
            onClick={handleCloseAddModal}
          >
            إلغاء
          </Button>
          <Button
            style={{
              backgroundColor: "var(--karate-primary)",
              color: "white",
            }}
            onClick={handleSaveModal}
            disabled={
              !formData.classID ||
              !formData.date ||
              !formData.startTime ||
              !formData.endTime ||
              isAdding
            }
          >
            {isAdding ? "جاري الحفظ..." : "حفظ الجلسة"}
          </Button>
        </Modal.Footer>
      </Modal>

      {}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>معلومات الجلسة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h5>{selectedEvent.title}</h5>
              <p>
                <strong>التاريخ:</strong>{" "}
                {formatDisplayDate(selectedEvent.start)}
              </p>
              {selectedEvent.extendedProps && (
                <div className="event-details">
                  <p>
                    <strong>المدرب:</strong>{" "}
                    {selectedEvent.extendedProps.trainer}
                  </p>
                  <p>
                    <strong>عدد المشتركين:</strong>{" "}
                    {selectedEvent.extendedProps.currentEnrollment}
                  </p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              backgroundColor: "var(--karate-secondary)",
              color: "white",
              borderColor: "var(--karate-secondary)",
            }}
            onClick={handleCloseDetailsModal}
          >
            إغلاق
          </Button>
          <Button
            style={{
              backgroundColor: "var(--karate-primary)",
              color: "white",
            }}
            onClick={handleDeleteEvent}
            disabled={isAdding}
          >
            حذف الجلسة
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}
