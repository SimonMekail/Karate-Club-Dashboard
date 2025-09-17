import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import EditModal from "../Modals/EditModal";
import { useState } from "react";

const AttendancesList = ({ attendances, fetchAttendances }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span
        className="badge rounded-pill"
        style={{
          backgroundColor: "var(--karate-card)",
          color: "var(--karate-primary)",
          padding: "0.35em 0.65em",
          border: "1px solid var(--karate-primary)",
        }}
      >
        حاضر
      </span>
    ) : (
      <span
        className="badge rounded-pill"
        style={{
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          color: "var(--karate-accent)",
          padding: "0.35em 0.65em",
          border: "1px solid var(--karate-accent)",
        }}
      >
        غائب
      </span>
    );
  };

  const getBeltColor = (beltName) => {
    const beltColors = {
      "الحزام الأبيض": "beltWhite",
      "الحزام الأصفر": "beltYellow",
      "الحزام البرتقالي": "beltOrange",
      "الحزام الأخضر": "beltGreen",
      "الحزام الأزرق": "beltBlue",
      "الحزام البنفسجي": "beltPurple",
      "الحزام البني": "beltBrown",
      "الحزام الأسود": "beltBlack",
    };

    return beltColors[beltName] || "bg-secondary";
  };

  const handleEditClick = (attendance) => {
    setSelectedAttendance({
      attendanceID: attendance.attendanceID,
      memberID: attendance.memberID,
      sessionID: attendance.sessionID,
      memberName: attendance.memberName,
      date: attendance.date.split("T")[0],
      status: attendance.status,
      lastBeltName: attendance.lastBeltName,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete({
      id: attendance.attendanceID,
      name: ` ${attendance.memberName} بتاريخ ${formatDate(attendance.date)}`,
    });
    setShowDeleteModal(true);
  };

  return (
    <>
      {attendances.length ? (
        <div className="table-responsive">
          <table
            className="table table-hover"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <thead
              style={{
                backgroundColor: "var(--karate-primary)",
                color: "white",
              }}
            >
              <tr>
                <th style={{ padding: "1rem", fontWeight: "500" }}>
                  اسم العضو
                </th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>الحزام</th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>التاريخ</th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>الحالة</th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((attendance, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={attendance.attendanceID}
                  style={{
                    backgroundColor: "var(--karate-card)",
                    borderBottom: "1px solid var(--karate-border)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <td style={{ padding: "1rem", color: "var(--karate-text)" }}>
                    {attendance.memberName}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="d-flex align-items-center">
                      <span
                        className={`belt-circle ${getBeltColor(
                          attendance.lastBeltName
                        )} me-2`}
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      ></span>
                      {attendance.lastBeltName}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "var(--karate-text-light)",
                    }}
                  >
                    {formatDate(attendance.date)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getStatusBadge(attendance.status)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="d-flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        onClick={() => handleEditClick(attendance)}
                        style={{
                          backgroundColor: "rgba(13, 71, 161, 0.1)",
                          color: "var(--karate-primary)",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          border: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        style={{
                          backgroundColor: "rgba(220, 53, 69, 0.1)",
                          color: "var(--karate-error)",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          border: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                        title="Delete"
                        onClick={() => handleDeleteClick(attendance)}
                      >
                        <i className="fas fa-trash"></i>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5">
          <i
            className="fas fa-user-clock fa-3x mb-3"
            style={{
              color: "var(--karate-text-light)",
            }}
          ></i>
          <h4
            style={{
              color: "var(--karate-text)",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            لا يوجد سجلات حضور متطابقة مع بحثك
          </h4>
          <p
            style={{
              color: "var(--karate-text-light)",
              fontSize: "0.9rem",
            }}
          >
            حاول تغيير فلتر البحث أو تسجيل حضور جديد
          </p>
        </div>
      )}

      {}
      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        itemId={selectedAttendance?.attendanceID}
        itemType="سجل الحضور"
        initialData={selectedAttendance || {}}
        apiEndpoint="/api/Attendances/"
        refreshData={fetchAttendances}
        formFields={[
          {
            name: "status",
            label: "الحضور",
            type: "checkbox",
            colClassName: "col-12",
          },
        ]}
        additionalData={{
          memberID: selectedAttendance?.memberID || 0,
          sessionID: selectedAttendance?.sessionID,
          date: selectedAttendance?.date
            ? `${selectedAttendance.date}T00:00:00.000Z`
            : new Date().toISOString(),
        }}
        successMessage="تم تحديث سجل الحضور بنجاح"
        errorMessage="فشل في تحديث سجل الحضور"
      />

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={attendanceToDelete?.id}
        itemName={attendanceToDelete?.name}
        itemType="سجل حضور"
        deleteEndpoint={`/api/Attendances/${attendanceToDelete?.id}`}
        successMessage="تم حذف سجل الحضور بنجاح"
        errorMessage="فشل في حذف سجل الحضور"
        refreshData={fetchAttendances}
      />
    </>
  );
};

export default AttendancesList;
