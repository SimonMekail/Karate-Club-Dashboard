import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import { EditTrainerModal } from "../Modals/EditTrainerModal";
import { Link } from "react-router-dom";
import { useState } from "react";
import { generateQRCode } from "../../utils/generateQRCode";

const TrainersListCardView = ({ trainers, fetchTrainers }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);

  const getBeltColor = (beltRank) => {
    const beltColorMap = {
      "الحزام الأبيض": "beltWhite",
      "الحزام الأصفر": "beltYellow",
      "الحزام البرتقالي": "beltOrange",
      "الحزام الأخضر": "beltGreen",
      "الحزام الأزرق": "beltBlue",
      "الحزام البنفسجي": "beltPurple",
      "الحزام البني": "beltBrown",
      "الحزام الأسود": "beltBlack",
    };

    return beltColorMap[beltRank] || "beltWhite";
  };

  const handleEditClick = (trainer) => {
    setSelectedTrainer({
      ...trainer.personInfo,
      trainerID: trainer.trainerID,
      isActive: trainer.isActive,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (trainer) => {
    setTrainerToDelete({
      id: trainer.trainerID,
      name: trainer.personInfo.name,
    });
    setShowDeleteModal(true);
  };

  const handleQRCodeClick = (trainer) => {
    generateQRCode(
      {
        trainerID: trainer.trainerID,
        trainerName: trainer.personInfo.name,
      },
      `${trainer.personInfo.name}_QRCard.pdf`,
      {
        companyName: "نادي الكاراتيه",
        cardTitle: "بطاقة المدرب",
        memberName: trainer.personInfo.name,
        cardColor: "#f5f7fa",
        textColor: "#2a3f54",
      }
    );
  };

  return (
    <>
      {trainers.length ? (
        <div className="row g-4">
          {trainers.map((trainer, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              key={trainer.trainerID}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                className={`card h-100 ${
                  !trainer.isActive ? "inactive-member" : ""
                } shadow-sm`}
                style={{
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: "var(--karate-card)",
                }}
              >
                <div className="card-body p-4 d-flex flex-column">
                  {}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className={`badge rounded-pill ${
                        trainer.isActive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-secondary bg-opacity-10 text-secondary"
                      }`}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {trainer.isActive ? "نشط" : "غير نشط"}
                    </span>

                    {/* {trainer.beltRank && (
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`${getBeltColor(trainer.beltRank)}`}
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        ></span>
                        <span className="small fw-medium" style={{color: "var(--karate-text)"}}>
                          {trainer.beltRank}
                        </span>
                      </div>
                    )} */}
                  </div>

                  {}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      {trainer.personInfo.imagePath ? (
                        <motion.img
                          whileHover={{ scale: 1.03 }}
                          src={trainer.personInfo.imagePath}
                          className="profile-img rounded-circle border border-3 border-white shadow "
                          alt={trainer.personInfo.name}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          className="profile-img no-image rounded-circle bg-light d-flex align-items-center justify-content-center"
                          style={{
                            width: "100px",
                            height: "100px",
                            border: "3px solid white",
                          }}
                        >
                          <i className="fas fa-user text-secondary fs-3 text-white"></i>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="text-center mb-4">
                    <h5
                      className="card-title mb-2 fw-semibold"
                      style={{ color: "var(--karate-text)" }}
                    >
                      {trainer.personInfo.name}
                    </h5>

                    <div className="d-flex flex-column gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center small"
                        style={{ color: "var(--karate-text)" }}
                      >
                        <i
                          className="fas fa-map-marker-alt me-2"
                          style={{ color: "var(--karate-primary)" }}
                        ></i>
                        <span>{trainer.personInfo.address || "غير محدد"}</span>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center small"
                        style={{ color: "var(--karate-text)" }}
                      >
                        <i
                          className="fas fa-phone me-2"
                          style={{ color: "var(--karate-primary)" }}
                        ></i>
                        <span>{trainer.personInfo.number || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between">
                      {}
                      <div className="d-flex gap-2">
                        {/* <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleQRCodeClick(trainer)}
                          style={{
                            backgroundColor:
                              "rgba(var(--karate-primary-rgb), 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "10px",
                            width: "36px",
                            height: "36px",
                          }}
                          title="كود QR"
                        >
                          <i className="fas fa-qrcode"></i>
                        </motion.button> */}

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleEditClick(trainer)}
                          style={{
                            backgroundColor:
                              "rgba(var(--karate-primary-rgb), 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "10px",
                            width: "36px",
                            height: "36px",
                          }}
                          title="تعديل"
                        >
                          <i className="fas fa-edit"></i>
                        </motion.button>
                      </div>

                      {}
                      <div className="dropdown">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon dropdown-toggle"
                          type="button"
                          id={`trainerActions-${trainer.trainerID}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{
                            backgroundColor: "rgba(108, 117, 125, 0.1)",
                            color: "#6c757d",
                            borderRadius: "10px",
                            width: "36px",
                            height: "36px",
                          }}
                          title="خيارات"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </motion.button>

                        <ul
                          className="dropdown-menu dropdown-menu-end shadow"
                          aria-labelledby={`trainerActions-${trainer.trainerID}`}
                          style={{
                            borderRadius: "12px",
                            border: "none",
                            padding: "8px",
                            minWidth: "200px",
                            backgroundColor: "var(--karate-card)",
                          }}
                        >
                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/TrainerKarateClasses/${trainer.trainerID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-people-group fs-6"></i>
                              </div>
                              حصص الكاراتيه
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/TrainerBeltTests/${trainer.trainerID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-clipboard-check fs-6"></i>
                              </div>
                              الاختبارات القادمة
                            </Link>
                          </motion.li>

                          <div className="dropdown-divider my-1"></div>

                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() => handleDeleteClick(trainer)}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded text-danger"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-trash fs-6"></i>
                              </div>
                              حذف المدرب
                            </button>
                          </motion.li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
          <i className="fas fa-user-slash fs-1 text-muted mb-3 opacity-75"></i>
          <h4 className="mb-2" style={{ color: "var(--karate-text)" }}>
            لا يوجد مدربين متطابقين مع بحثك
          </h4>
          <p className="mb-4" style={{ color: "var(--karate-text)" }}>
            حاول تغيير فلتر البحث أو إضافة مدرب جديد
          </p>
          <button
            className="btn btn-primary px-4"
            style={{ backgroundColor: "var(--karate-primary)", border: "none" }}
          >
            <i className="fas fa-plus me-2"></i> إضافة مدرب جديد
          </button>
        </div>
      )}

      {}
      <EditTrainerModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        refreshData={fetchTrainers}
        trainerData={selectedTrainer}
      />

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={trainerToDelete?.id}
        itemName={trainerToDelete?.name}
        itemType="المدرب"
        deleteEndpoint={`/api/Trainers/${trainerToDelete?.id}`}
        successMessage="تم حذف المدرب بنجاح"
        errorMessage="فشل في حذف المدرب"
        additionalWarning="سيتم حذف جميع بيانات المدرب."
        refreshData={fetchTrainers}
      />
    </>
  );
};

export default TrainersListCardView;
