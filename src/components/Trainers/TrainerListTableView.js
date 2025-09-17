import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import { EditTrainerModal } from "../Modals/EditTrainerModal";
import { useState } from "react";

const TrainersListTableView = ({ trainers, fetchTrainers }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);

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

  return (
    <>
      {trainers.length ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>الحالة</th>
                <th>العنوان</th>
                <th>الهاتف</th>
                <th>الإجراءات</th>
                <th>الروابط</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  key={trainer.trainerID}
                >
                  <td>
                    {trainer.personInfo.imagePath ? (
                      <img
                        src={trainer.personInfo.imagePath}
                        className="rounded-circle border border-2 border-white shadow-sm"
                        alt={trainer.personInfo.name}
                        style={{
                          width: "75px",
                          height: "75px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="profile-img no-image rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                        style={{ width: "75px", height: "75px" }}
                      >
                        <i className="fas fa-user text-white "></i>
                      </div>
                    )}
                  </td>
                  <td>{trainer.personInfo.name}</td>
                  <td>
                    <span
                      className={`badge rounded-pill ${
                        trainer.isActive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-secondary bg-opacity-10 text-secondary"
                      }`}
                    >
                      {trainer.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i
                        className="fas fa-map-marker-alt me-2"
                        style={{ color: "var(--karate-primary)" }}
                      ></i>
                      {trainer.personInfo.address}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i
                        className="fas fa-phone me-2"
                        style={{ color: "var(--karate-primary)" }}
                      ></i>
                      {trainer.personInfo.number}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        onClick={() => handleEditClick(trainer)}
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
                        onClick={() => handleDeleteClick(trainer)}
                      >
                        <i className="fas fa-trash"></i>
                      </motion.button>
                    </div>
                  </td>
                  <td>
                    <div className="dropdown">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm dropdown-toggle d-flex align-items-center justify-content-center p-2"
                        type="button"
                        id={`dropdownMenuButton-${trainer.trainerID}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                          backgroundColor: "rgba(108, 117, 125, 0.1)",
                          color: "#6c757d",
                          borderRadius: "10px",
                          width: "36px",
                          height: "36px",
                          border: "none",
                        }}
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </motion.button>
                      <ul
                        className="dropdown-menu dropdown-menu-end shadow"
                        aria-labelledby={`dropdownMenuButton-${trainer.trainerID}`}
                        style={{
                          borderRadius: "12px",
                          border: "none",
                          padding: "8px",
                          minWidth: "200px",
                          backgroundColor: "var(--karate-card)",
                        }}
                      >
                        <motion.li whileHover={{ scale: 1.02 }}>
                          <Link
                            to={`/TrainerKarateClasses/${trainer.trainerID}`}
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                            style={{
                              color: "var(--karate-text)",
                            }}
                          >
                            <div
                              className="icon-container bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: "24px",
                                height: "24px",
                              }}
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
                            style={{
                              color: "var(--karate-text)",
                            }}
                          >
                            <div
                              className="icon-container bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: "24px",
                                height: "24px",
                              }}
                            >
                              <i className="fas fa-clipboard-check fs-6"></i>
                            </div>
                            الاختبارات القادمة
                          </Link>
                        </motion.li>

                        <div className="dropdown-divider my-1"></div>
                      </ul>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
          <i
            className="fas fa-user-slash fs-1 mb-3"
            style={{ color: "var(--karate-primary)" }}
          ></i>
          <h4 className="text-muted">لا يوجد مدربين متطابقين مع بحثك</h4>
          <p className="text-muted">حاول تغيير فلتر البحث أو إضافة مدرب جديد</p>
        </div>
      )}

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

export default TrainersListTableView;
