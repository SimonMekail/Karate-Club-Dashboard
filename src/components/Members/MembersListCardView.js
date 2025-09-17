import { Link } from "react-router-dom";
import { generateQRCode } from "../../utils/generateQRCode";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import { EditMemberModal } from "../Modals/EditMemberModal";
import AddModal from "../Modals/AddModal";
import { useState } from "react";

const MembersListCardView = ({
  members,
  fetchMembers,
  beltRanks,
  trainers,
  karateClasses,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] =
    useState(false);
  const [selectedMemberForAdd, setSelectedMemberForAdd] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";

    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditClick = (member) => {
    setSelectedMember({
      memberID: member.memberID,
      isActive: member.isActive,
      lastBeltRank: member.lastBeltRank,
      person: {
        personID: member.personInfo.personID,
        name: member.personInfo.name,
        address: member.personInfo.address,
        number: member.personInfo.number,
        imagePath: member.personInfo.imagePath,
        startDate: member.personInfo.startDate, 
      },
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete({
      id: member.memberID,
      name: member.personInfo.name,
    });
    setShowDeleteModal(true);
  };

  const handleQRCodeClick = (member) => {
    generateQRCode(
      {
        memberID: member.memberID,
        memberName: member.personInfo.name,
      },
      `${member.personInfo.name}_QRCard.pdf`,
      {
        companyName: "نادي الكاراتيه",
        cardTitle: "بطاقة دخول",
        memberName: member.personInfo.name,
        cardColor: "#f5f7fa", 
        textColor: "#2a3f54", 
      }
    );
  };

  const handleCreateTestClick = (member) => {
    setSelectedMemberForAdd(member);
    setShowAddTestModal(true);
  };

  const handleCreateSubscriptionClick = (member) => {
    setSelectedMemberForAdd(member);
    setShowAddSubscriptionModal(true);
  };

  const testFormFields = [
    
    
    
    
    
    
    
    
    
    
    {
      name: "result",
      label: "النتيجة",
      type: "select",
      required: true,
      options: [
        { value: true, label: "ناجح" },
        { value: false, label: "راسب" },
      ],
    },
    {
      name: "testedByTrainerID",
      label: "المدرب",
      type: "select",
      required: true,
      options: trainers.map((trainer) => ({
        value: trainer.trainerID,
        label: trainer.personInfo.name,
      })),
    },
  ];

  const subscriptionFormFields = [
    {
      name: "classID",
      label: " الصف",
      type: "select",
      required: true,
      options: karateClasses.map((cls) => ({
        value: cls.classID,
        label: cls.name,
      })),
    },
  ];

  return (
    <>
      {members.length ? (
        <div className="row g-4">
          {members.map((member, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              key={member.memberID}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                className={`card h-100 ${
                  !member.isActive ? "inactive-member" : ""
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
                        member.isActive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-secondary bg-opacity-10 text-secondary"
                      }`}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {member.isActive ? "نشط" : "غير نشط"}
                    </span>

                    {member.beltRank && (
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`${getBeltColor(member.beltRank)}`}
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        ></span>
                        <span
                          className="small fw-medium"
                          style={{ color: "var(--karate-text)" }}
                        >
                          {member.beltRank}
                        </span>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      {member.personInfo.imagePath ? (
                        <motion.img
                          whileHover={{ scale: 1.03 }}
                          src={member.personInfo.imagePath}
                          className="profile-img rounded-circle border border-3 border-white shadow"
                          alt={member.personInfo.name}
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
                      {member.personInfo.name}
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
                        <span>{member.personInfo.address || "غير محدد"}</span>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center small"
                        style={{ color: "var(--karate-text)" }}
                      >
                        <i
                          className="fas fa-phone me-2"
                          style={{ color: "var(--karate-primary)" }}
                        ></i>
                        <span>{member.personInfo.number || "غير محدد"}</span>
                      </div>
                      {}
                      <div
                        className="d-flex align-items-center justify-content-center small"
                        style={{ color: "var(--karate-text)" }}
                      >
                        <i
                          className="fas fa-calendar-alt me-2"
                          style={{ color: "var(--karate-primary)" }}
                        ></i>
                        <span>{formatDate(member.personInfo.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between">
                      {}
                      <div className="d-flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleQRCodeClick(member)}
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
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm btn-icon"
                          onClick={() => handleEditClick(member)}
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
                          id={`memberActions-${member.memberID}`}
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
                          aria-labelledby={`memberActions-${member.memberID}`}
                          style={{
                            borderRadius: "12px",
                            border: "none",
                            padding: "8px",
                            minWidth: "200px",
                            position: "absolute",
                            zIndex: 1000,
                            maxHeight: "calc(100vh - 100px)",
                            overflowY: "auto",
                            backgroundColor: "var(--karate-card)",
                          }}
                        >
                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() =>
                                handleCreateSubscriptionClick(member)
                              }
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-calendar-plus fs-6"></i>
                              </div>
                              إضافة اشتراك
                            </button>
                          </motion.li>

                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() => handleCreateTestClick(member)}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-tasks fs-6"></i>
                              </div>
                              إضافة اختبار
                            </button>
                          </motion.li>

                          <div className="dropdown-divider my-1"></div>

                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/MemberPayments/${member.memberID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-money-bill-wave fs-6"></i>
                              </div>
                              المدفوعات
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/MemberSubscriptions/${member.memberID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  color: "var(--karate-primary)",
                                }}
                              >
                                <i className="fas fa-calendar-check fs-6"></i>
                              </div>
                              الاشتراكات
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/MemberAttendances/${member.memberID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-clipboard-list fs-6"></i>
                              </div>
                              الحضور
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/MemberBeltTests/${member.memberID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-orange bg-opacity-10 text-orange rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-tasks fs-6"></i>
                              </div>
                              الاختبارات
                            </Link>
                          </motion.li>

                          <div className="dropdown-divider my-1"></div>

                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded text-danger"
                              style={{ color: "var(--karate-text)" }}
                            >
                              <div
                                className="icon-container bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <i className="fas fa-trash fs-6"></i>
                              </div>
                              حذف المشترك
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
            لا يوجد مشتركين متطابقين مع بحثك
          </h4>
          <p className="mb-4" style={{ color: "var(--karate-text)" }}>
            حاول تغيير فلتر البحث أو إضافة مشترك جديد
          </p>
          <button
            className="btn btn-primary px-4"
            style={{ backgroundColor: "var(--karate-primary)", border: "none" }}
          >
            <i className="fas fa-plus me-2"></i> إضافة مشترك جديد
          </button>
        </div>
      )}

      {}
      <EditMemberModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        refreshData={fetchMembers}
        beltRanks={beltRanks}
        memberData={selectedMember}
      />

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={memberToDelete?.id}
        itemName={memberToDelete?.name}
        itemType="المشترك"
        deleteEndpoint={`/api/Members/${memberToDelete?.id}`}
        successMessage="تم حذف المشترك بنجاح"
        errorMessage="فشل في حذف المشترك"
        refreshData={fetchMembers}
      />

      <AddModal
        show={showAddTestModal}
        onHide={() => setShowAddTestModal(false)}
        itemType="اختبار"
        formFields={testFormFields}
        apiEndpoint="/api/BeltTests"
        refreshData={fetchMembers}
        additionalData={{
          memberID: selectedMemberForAdd?.memberID,
          beltRankID: selectedMemberForAdd?.lastBeltRank,
        }}
      />

      <AddModal
        show={showAddSubscriptionModal}
        onHide={() => setShowAddSubscriptionModal(false)}
        itemType="اشتراك"
        formFields={subscriptionFormFields}
        apiEndpoint="/api/Subscriptions"
        refreshData={fetchMembers}
        additionalData={{
          memberID: selectedMemberForAdd?.memberID,
        }}
      />
    </>
  );
};

export default MembersListCardView;
