import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeScannerSessionAttendances } from "../Modals/QRCodeScannerSessionAttendances";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import EditModal from "../Modals/EditModal";

const SessionsList = ({ sessions, karateClasses, fetchSessions }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const formatTime = (timeString) => {
    return timeString.split(":").slice(0, 2).join(":");
  };

  const getInitials = (name) => {
    return name[0].toUpperCase();
  };

  const getSessionStatus = (date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    return sessionDate > now ? "upcoming" : "past";
  };

  const handleEditClick = (session) => {
    setSelectedSession({
      sessionID: session.sessionID,
      classID: session.classInfo.classID,
      date: session.date.split("T")[0], 
      startTime: session.startTime,
      endTime: session.endTime,
      className: session.classInfo.name,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (session) => {
    setSessionToDelete({
      id: session.sessionID,
      name: `${session.classInfo.name} - ${formatDate(session.date)}`,
    });
    setShowDeleteModal(true);
  };

  
  const sessionFormFields = [
    {
      name: "classID",
      label: "الصف",
      type: "select",
      required: true,
      options: karateClasses.map((cls) => ({
        value: cls.classID,
        label: cls.name,
      })),
    },
    {
      name: "date",
      label: "تاريخ الجلسة",
      type: "date",
      required: true,
    },
    {
      name: "startTime",
      label: "وقت البدء",
      type: "time",
      required: true,
    },
    {
      name: "endTime",
      label: "وقت الانتهاء",
      type: "time",
      required: true,
    },
  ];

  return (
    <>
      {sessions.length ? (
        <div className="row g-4" style={{ marginBottom: "2rem" }}>
          {sessions.map((session, index) => {
            const status = getSessionStatus(session.date);
            const isUpcoming = status === "upcoming";
            const isFull =
              session.classInfo.currentEnrollment ===
              session.classInfo.maxCapacity;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                key={session.sessionID}
                className="col-md-6 col-lg-6 col-xl-3"
              >
                <div
                  className="test-card h-100"
                  style={{
                    background: "var(--karate-card)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid var(--karate-border)",
                  }}
                >
                  <div
                    className="test-card-header"
                    style={{
                      padding: "1.25rem",
                      borderBottom: "1px solid var(--karate-border)",
                      position: "relative",
                    }}
                  >
                    <div
                      className="member-badge"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: "var(--karate-background)",
                        padding: "0.5rem 1rem",
                        borderRadius: "50px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        className="member-avatar me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, var(--karate-primary), var(--karate-primary-dark))",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {getInitials(session.classInfo.name)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "var(--karate-text)",
                          }}
                        >
                          {session.classInfo.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className="result-indicator ms-5"
                      style={{
                        position: "absolute",
                        top: "1.25rem",
                        left: "1.25rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        backgroundColor: isUpcoming
                          ? "rgba(92, 193, 201, 0.1)"
                          : "rgba(252, 81, 133, 0.1)",
                        color: isUpcoming
                          ? "var(--karate-secondary)"
                          : "var(--karate-accent)",
                      }}
                    >
                      <i
                        className={`fas ${
                          isUpcoming ? "fa-clock" : "fa-check"
                        } me-1`}
                      ></i>
                      {isUpcoming ? "قادمة" : "منتهية"}
                    </span>
                  </div>
                  <div
                    className="test-card-body"
                    style={{ padding: "1.25rem" }}
                  >
                    <div
                      className="detail-item"
                      style={{
                        marginBottom: "0.75rem",
                        display: "flex",
                      }}
                    >
                      <div
                        className="detail-icon"
                        style={{
                          width: "24px",
                          color: "var(--karate-text-light)",
                          marginRight: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <i className="fas fa-user-tie"></i>
                      </div>
                      <div className="detail-content" style={{ flex: "1" }}>
                        <div
                          className="detail-label"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--karate-text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          المدرب
                        </div>
                        <div
                          className="detail-value"
                          style={{
                            fontWeight: "500",
                            color: "var(--karate-text)",
                          }}
                        >
                          {session.classInfo.trainerName}
                        </div>
                      </div>
                    </div>

                    <div
                      className="detail-item"
                      style={{
                        marginBottom: "0.75rem",
                        display: "flex",
                      }}
                    >
                      <div
                        className="detail-icon"
                        style={{
                          width: "24px",
                          color: "var(--karate-text-light)",
                          marginRight: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <i className="far fa-calendar-alt"></i>
                      </div>
                      <div className="detail-content" style={{ flex: "1" }}>
                        <div
                          className="detail-label"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--karate-text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          التاريخ
                        </div>
                        <div
                          className="detail-value"
                          style={{
                            fontWeight: "500",
                            color: "var(--karate-text)",
                          }}
                        >
                          {formatDate(session.date)}
                        </div>
                      </div>
                    </div>

                    <div
                      className="detail-item"
                      style={{
                        marginBottom: "0.75rem",
                        display: "flex",
                      }}
                    >
                      <div
                        className="detail-icon"
                        style={{
                          width: "24px",
                          color: "var(--karate-text-light)",
                          marginRight: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="detail-content" style={{ flex: "1" }}>
                        <div
                          className="detail-label"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--karate-text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          الوقت
                        </div>
                        <div
                          className="detail-value"
                          style={{
                            fontWeight: "500",
                            color: "var(--karate-text)",
                          }}
                        >
                          {formatTime(session.startTime)} -{" "}
                          {formatTime(session.endTime)}
                        </div>
                      </div>
                    </div>

                    <div
                      className="detail-item"
                      style={{
                        marginBottom: "0.75rem",
                        display: "flex",
                      }}
                    >
                      <div
                        className="detail-icon"
                        style={{
                          width: "24px",
                          color: "var(--karate-text-light)",
                          marginRight: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="detail-content" style={{ flex: "1" }}>
                        <div
                          className="detail-label"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--karate-text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          الحضور
                        </div>
                        <div className="d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{
                              fontWeight: "500",
                              color: "var(--karate-text)",
                            }}
                          >
                            {session.classInfo.currentEnrollment} /{" "}
                            {session.classInfo.maxCapacity}
                          </span>
                          {isFull && (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "var(--karate-accent)",
                                fontSize: "0.65rem",
                              }}
                            >
                              مكتمل
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className="d-flex justify-content-between mt-3"
                      style={{
                        paddingTop: "0.5rem",
                        borderTop: "1px solid var(--karate-border)",
                      }}
                    >
                      <QRCodeScannerSessionAttendances
                        sessionID={session.sessionID}
                        asButton={true}
                      />

                      <div className="d-flex gap-2">
                        <Link
                          to={`/SessionAttendances/${session.sessionID}`}
                          className="btn btn-sm btn-icon"
                          style={{
                            backgroundColor: "rgba(13, 110, 253, 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="الحضور"
                        >
                          <i className="fas fa-list-check"></i>
                        </Link>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleEditClick(session)}
                          style={{
                            backgroundColor: "rgba(13, 71, 161, 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          }}
                          title="تعديل"
                        >
                          <i className="fas fa-edit"></i>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          style={{
                            backgroundColor: "rgba(220, 53, 69, 0.1)",
                            color: "var(--karate-error)",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            border: "none",
                          }}
                          title="حذف"
                          onClick={() => handleDeleteClick(session)}
                        >
                          <i className="fas fa-trash"></i>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5">
          <i
            className="fas fa-calendar-times fa-3x mb-3 opacity-50"
            style={{ color: "var(--karate-text-light)" }}
          ></i>
          <h4 style={{ color: "var(--karate-text)", marginBottom: "1rem" }}>
            لا يوجد جلسات متطابقة مع بحثك
          </h4>
          <p
            style={{
              color: "var(--karate-text-light)",
              marginBottom: "1.5rem",
            }}
          >
            حاول تغيير فلتر البحث أو إضافة جلسة جديدة
          </p>
        </div>
      )}

      {}
      {selectedSession && (
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          itemId={selectedSession.sessionID}
          itemType="الجلسة"
          initialData={{
            classID: selectedSession.classID,
            date: selectedSession.date,
            startTime: selectedSession.startTime,
            endTime: selectedSession.endTime,
          }}
          formFields={sessionFormFields}
          apiEndpoint="/api/Sessions/"
          refreshData={fetchSessions}
          successMessage={`تم تعديل جلسة ${selectedSession.className} بنجاح`}
        />
      )}

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={sessionToDelete?.id}
        itemName={sessionToDelete?.name}
        itemType="الجلسة"
        deleteEndpoint={`/api/Sessions/${sessionToDelete?.id}`}
        successMessage="تم حذف الجلسة بنجاح"
        errorMessage="فشل في حذف الجلسة"
        refreshData={fetchSessions}
      />
    </>
  );
};

export default SessionsList;
