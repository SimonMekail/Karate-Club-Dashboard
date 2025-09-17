import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

import "../../styles/Calender.css";
import { API_CONFIG } from "../../config";

export default function BeltTestsCalendar({ beltTests, fetchBeltTests }) {
  const [events, setEvents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const formattedEvents = beltTests.map((beltTest) => ({
      id: beltTest.beltTestID,
      title: beltTest.memberName,
      start: beltTest.date,
      extendedProps: {
        trainer: beltTest.trainerName,
        belt: beltTest.beltName,
        result: beltTest.result ? "Passed" : "Failed",
        notes: beltTest.notes || "",
      },
    }));
    setEvents(formattedEvents);
  }, [beltTests]);

  const handleEventClick = (arg) => {
    setSelectedEvent(arg.event);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    const toastId = toast.loading(`جاري حذف اختبار الحزام...`);

    axios
      .delete(`/api/BeltTests/${selectedEvent.id}`, {
        headers: API_CONFIG.DEFAULT_HEADERS,
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("تم حذف اختبار الحزام بنجاح", { id: toastId });
          setEvents(events.filter((event) => event.id !== selectedEvent.id));
          if (fetchBeltTests) fetchBeltTests();
        }
      })
      .catch((error) => {
        console.error("Delete error:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء حذف اختبار الحزام";
        toast.error(errorMsg, { id: toastId });
      })
      .finally(() => {
        setShowDetailsModal(false);
        setSelectedEvent(null);
      });
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
                  arg.event.extendedProps.belt
                    ? `<div class="fc-event-belt">${arg.event.extendedProps.belt}</div>`
                    : ""
                }
              </div>
            `,
          };
        }}
      />

      {}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>معلومات اختبار الحزام</Modal.Title>
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
                    <strong>الحزام:</strong> {selectedEvent.extendedProps.belt}
                  </p>
                  <p>
                    <strong>النتيجة:</strong>{" "}
                    {selectedEvent.extendedProps.result === "Passed"
                      ? "ناجح"
                      : "راسب"}
                  </p>
                  <p>
                    <strong>المدرب:</strong>{" "}
                    {selectedEvent.extendedProps.trainer}
                  </p>
                  {selectedEvent.extendedProps.notes && (
                    <p>
                      <strong>ملاحظات:</strong>{" "}
                      {selectedEvent.extendedProps.notes}
                    </p>
                  )}
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
            disabled={isProcessing}
          >
            حذف الاختبار
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}
