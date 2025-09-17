import { Link } from "react-router-dom";
import { generateQRCode } from "../../utils/generateQRCode";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import { EditMemberModal } from "../Modals/EditMemberModal";
import AddModal from "../Modals/AddModal";
import { useState } from "react";

const MembersListTableView = ({
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
        cardColor: "#e3f2fd",
        textColor: "#0d47a1",
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
      label: "الصف",
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
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>الحالة</th>
                <th>العنوان</th>
                <th>الهاتف</th>
                <th>الحزام</th>
                <th>تاريخ الانضمام</th> {}
                <th>الإجراءات</th>
                <th>الروابط</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  key={member.memberID}
                >
                  <td>
                    {member.personInfo.imagePath ? (
                      <img
                        src={member.personInfo.imagePath}
                        className="rounded-circle border border-2 border-white shadow-sm"
                        alt={member.personInfo.name}
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
                        <i className="fas fa-user text-white"></i>
                      </div>
                    )}
                  </td>
                  <td>{member.personInfo.name}</td>
                  <td>
                    <span
                      className={`badge rounded-pill ${
                        member.isActive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-secondary bg-opacity-10 text-secondary"
                      }`}
                    >
                      {member.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i
                        className="fas fa-map-marker-alt me-2"
                        style={{ color: "var(--karate-primary)" }}
                      ></i>
                      {member.personInfo.address}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i
                        className="fas fa-phone me-2"
                        style={{ color: "var(--karate-primary)" }}
                      ></i>
                      {member.personInfo.number}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`${getBeltColor(
                          member.beltRank
                        )} rounded-circle`}
                        style={{
                          width: "15px",
                          height: "15px",
                          display: "inline-block",
                        }}
                      ></span>
                      {member.beltRank}
                    </div>
                  </td>
                  <td>
                    {" "}
                    {}
                    <div className="d-flex align-items-center">
                      <i
                        className="fas fa-calendar-alt me-2"
                        style={{ color: "var(--karate-primary)" }}
                      ></i>
                      {formatDate(member.personInfo.startDate)}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQRCodeClick(member)}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        style={{
                          backgroundColor: "rgba(13, 71, 161, 0.1)",
                          color: "var(--karate-primary)",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          border: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                        title="QR Code"
                      >
                        <i className="fas fa-qrcode"></i>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        onClick={() => handleEditClick(member)}
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
                        onClick={() => handleDeleteClick(member)}
                      >
                        <i className="fas fa-trash"></i>
                      </motion.button>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {}
                      <div className="dropdown">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                          type="button"
                          id={`createActions-${member.memberID}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{
                            backgroundColor: "rgba(108, 117, 125, 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            border: "none",
                          }}
                          title="إضافة جديد"
                        >
                          <i className="fas fa-plus"></i>
                        </motion.button>
                        <ul
                          className="dropdown-menu dropdown-menu-end shadow-sm"
                          aria-labelledby={`createActions-${member.memberID}`}
                          style={{
                            border: "none",
                            borderRadius: "12px",
                            padding: "8px",
                            backgroundColor: "var(--karate-card)",
                          }}
                        >
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() =>
                                handleCreateSubscriptionClick(member)
                              }
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded w-100"
                              style={{
                                fontSize: "0.875rem",
                                textAlign: "right",
                                background: "none",
                                border: "none",
                                color: "var(--karate-text)",
                              }}
                            >
                              <div
                                className="icon-container bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                }}
                              >
                                <i className="fas fa-calendar-plus fs-6"></i>
                              </div>
                              إضافة اشتراك جديد
                            </button>
                          </motion.li>
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <button
                              onClick={() => handleCreateTestClick(member)}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded w-100"
                              style={{
                                fontSize: "0.875rem",
                                textAlign: "right",
                                background: "none",
                                border: "none",
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
                                <i className="fas fa-tasks fs-6"></i>
                              </div>
                              إضافة اختبار جديد
                            </button>
                          </motion.li>
                        </ul>
                      </div>

                      {}
                      <div className="dropdown">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                          type="button"
                          id={`dropdownMenuButton-${member.memberID}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{
                            backgroundColor: "rgba(108, 117, 125, 0.1)",
                            color: "var(--karate-primary)",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          }}
                        >
                          <i className="fas fa-ellipsis-h"></i>
                        </motion.button>
                        <ul
                          className="dropdown-menu dropdown-menu-end shadow-sm"
                          aria-labelledby={`dropdownMenuButton-${member.memberID}`}
                          style={{
                            border: "none",
                            borderRadius: "12px",
                            padding: "8px",
                            backgroundColor: "var(--karate-card)",
                          }}
                        >
                          {}
                          <motion.li whileHover={{ scale: 1.02 }}>
                            <Link
                              to={`/MemberPayments/${member.memberID}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--karate-text)",
                              }}
                            >
                              <div
                                className="icon-container bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                }}
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
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--karate-text)",
                              }}
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
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--karate-text)",
                              }}
                            >
                              <div
                                className="icon-container bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                }}
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
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--karate-text)",
                              }}
                            >
                              <div
                                className="icon-container bg-orange bg-opacity-10 text-orange rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                }}
                              >
                                <i className="fas fa-tasks fs-6"></i>
                              </div>
                              الاختبارات
                            </Link>
                          </motion.li>

                          <div className="dropdown-divider my-1"></div>
                        </ul>
                      </div>
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
          <h4 className="text-muted">لا يوجد مشتركين متطابقين مع بحثك</h4>
          <p className="text-muted">حاول تغيير فلتر البحث أو إضافة مدرب جديد</p>
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

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={memberToDelete?.id}
        itemName={memberToDelete?.name}
        itemType="المشترك"
        deleteEndpoint={`/api/Members/${memberToDelete?.id}`}
        successMessage="تم حذف المشترك بنجاح"
        errorMessage="فشل في حذف المشترك"
        additionalWarning="سيتم حذف جميع بيانات المشترك."
        refreshData={fetchMembers}
      />

      {}
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

      {}
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

export default MembersListTableView;
