import { generateBeltCertificate } from "../../utils/generateBeltCertificate";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import EditModal from "../Modals/EditModal";
import { useState } from "react";

const BeltTestsList = ({ beltTests, fetchBeltTests, trainers, beltRanks }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

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

  const getInitials = (name) => {
    return name[0].toUpperCase();
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

  const handleEditClick = (test) => {
    setSelectedTest({
      beltTestID: test.beltTestID,
      memberID: test.memberID,
      memberName: test.memberName,
      testedByTrainerID: test.testedByTrainerID,
      beltRankID: test.beltRankID,
      date: test.date,
      result: test.result,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (test) => {
    setTestToDelete({
      id: test.beltTestID,
      name: `${test.memberName} - ${test.beltName}`,
    });
    setShowDeleteModal(true);
  };

  const testFormFields = [
    {
      name: "testedByTrainerID",
      label: "اسم المدرب",
      type: "select",
      required: true,
      options: trainers.map((trainer) => ({
        value: trainer.trainerID,
        label: trainer.personInfo.name,
      })),
    },
    {
      name: "beltRankID",
      label: "الحزام",
      type: "select",
      required: true,
      options: beltRanks.map((rank) => ({
        value: rank.beltRankID,
        label: rank.name,
      })),
    },
    {
      name: "result",
      label: "النتيجة",
      type: "select",
      required: true,
      options: [
        { value: true, label: "ناجح" },
        { value: false, label: "رسوب" },
      ],
    },
  ];

  return (
    <>
      {beltTests.length ? (
        <div className="row g-4" style={{ marginBottom: "2rem" }}>
          {beltTests.map((test, index) => {
            const isPassed = test.result;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                key={test.beltTestID}
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
                        {getInitials(test.memberName)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "var(--karate-text)",
                          }}
                        >
                          {test.memberName}
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
                        backgroundColor: isPassed
                          ? "rgba(92, 193, 201, 0.1)"
                          : "rgba(252, 81, 133, 0.1)",
                        color: isPassed
                          ? "var(--karate-secondary)"
                          : "var(--karate-accent)",
                      }}
                    >
                      <i
                        className={`fas ${
                          isPassed ? "fa-check" : "fa-times"
                        } me-1`}
                      ></i>
                      {isPassed ? "ناجح" : "رسوب"}
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
                          {test.trainerName}
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
                          {formatDate(test.date)}
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
                        <i className="fas fa-award"></i>
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
                          الحزام
                        </div>
                        <div className="d-flex align-items-center">
                          <span
                            className={`belt-circle ${getBeltColor(
                              test.beltName
                            )} me-2`}
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              display: "inline-block",
                            }}
                          ></span>
                          {test.beltName}
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
                      {isPassed && (
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            generateBeltCertificate(
                              {
                                name: test.memberName,
                                testDate: formatDate(test.date),
                                location: "نادي  الكاراتية",
                                certificateNumber: test.beltTestID,
                              },
                              {
                                color: test.beltName,
                              },
                              `${test.memberName}_certificate.pdf`
                            )
                          }
                          style={{
                            background:
                              "linear-gradient(135deg, var(--karate-primary), var(--karate-primary-dark))",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.375rem 0.75rem",
                          }}
                        >
                          <i className="fas fa-certificate me-2"></i>
                          الشهادة
                        </button>
                      )}
                      <div className="d-flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleEditClick(test)}
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
                          onClick={() => handleDeleteClick(test)}
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
            className="fas fa-award fa-3x mb-3 opacity-50"
            style={{ color: "var(--karate-text-light)" }}
          ></i>
          <h4 style={{ color: "var(--karate-text)", marginBottom: "1rem" }}>
            لا يوجد اختبارات متطابقة مع بحثك
          </h4>
          <p
            style={{
              color: "var(--karate-text-light)",
              marginBottom: "1.5rem",
            }}
          >
            حاول تغيير فلتر البحث أو إضافة اختبار جديد
          </p>
        </div>
      )}

      {}
      {selectedTest && (
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          itemId={selectedTest.beltTestID}
          itemType="اختبار الحزام"
          initialData={{
            testedByTrainerID: selectedTest.testedByTrainerID,
            beltRankID: selectedTest.beltRankID,
            result: selectedTest.result,
          }}
          formFields={testFormFields}
          additionalData={{
            memberID: selectedTest?.memberID || 0,
            date: selectedTest?.date
              ? `${selectedTest.date}`
              : new Date().toISOString(),
          }}
          apiEndpoint={"/api/BeltTests/"}
          refreshData={fetchBeltTests}
          successMessage={`تم تعديل اختبار ${selectedTest.memberName} بنجاح`}
        />
      )}

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={testToDelete?.id}
        itemName={testToDelete?.name}
        itemType="اختبار الحزام"
        deleteEndpoint={`/api/BeltTests/${testToDelete?.id}`}
        successMessage="تم حذف الاختبار بنجاح"
        errorMessage="فشل في حذف الاختبار"
        refreshData={fetchBeltTests}
      />
    </>
  );
};

export default BeltTestsList;
