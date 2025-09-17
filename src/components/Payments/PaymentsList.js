import { exportToPDF } from "../../utils/exportToPDF";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import EditModal from "../Modals/EditModal";
import { useState } from "react";

const PaymentsList = ({ payments, fetchPayments }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

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

  const handleEditClick = (payment) => {
    setSelectedPayment({
      paymentID: payment.paymentID,
      memberID: payment.memberID,
      
      amount: payment.amount,
      date: payment.date.split("T")[0],
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete({
      id: payment.paymentID,
      name: `دفعة ${
        payment.memberName
      } بقيمة ${payment.amount.toLocaleString()} ل.س بتاريخ ${formatDate(
        payment.date
      )}`,
    });
    setShowDeleteModal(true);
  };

  return (
    <>
      {payments.length ? (
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
                <th style={{ padding: "1rem", fontWeight: "500" }}>المبلغ</th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>التاريخ</th>
                <th style={{ padding: "1rem", fontWeight: "500" }}>
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={payment.paymentID}
                  style={{
                    backgroundColor: "var(--karate-card)",
                    borderBottom: "1px solid var(--karate-border)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <td style={{ padding: "1rem", color: "var(--karate-text)" }}>
                    {payment.memberName}
                  </td>
                  <td
                    className="fw-bold"
                    style={{
                      padding: "1rem",
                      color: "var(--karate-primary-dark)",
                      fontWeight: "600",
                    }}
                  >
                    {payment.amount.toLocaleString()} ل.س
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "var(--karate-text-light)",
                    }}
                  >
                    {formatDate(payment.date)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="d-flex gap-2">
                      {}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        onClick={() =>
                          exportToPDF(
                            {
                              date: formatDate(payment.date),
                              amount: payment.amount,
                              name: payment.memberName,
                            },
                            [
                              { key: "date", label: "التاريخ" },
                              { key: "amount", label: "المبلغ" },
                              { key: "name", label: "الاسم" },
                            ],
                            `دفعة المشترك ${payment.memberName}`
                          )
                        }
                        style={{
                          backgroundColor: "rgba(13, 71, 161, 0.1)",
                          color: "var(--karate-primary)",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          border: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                        title="PDF"
                      >
                        <i className="fas fa-file-pdf"></i>
                      </motion.button>

                      {}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm d-flex align-items-center justify-content-center p-2"
                        onClick={() => handleEditClick(payment)}
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

                      {}
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
                        onClick={() => handleDeleteClick(payment)}
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
            className="fas fa-money-bill-wave fa-3x mb-3"
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
            لا يوجد مدفوعات متطابقة مع بحثك
          </h4>
          <p
            style={{
              color: "var(--karate-text-light)",
              fontSize: "0.9rem",
            }}
          >
            حاول تغيير فلتر البحث أو إضافة دفعة جديدة
          </p>
        </div>
      )}

      {}
      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        itemId={selectedPayment?.paymentID}
        itemType="الدفعة"
        initialData={selectedPayment || {}}
        apiEndpoint="/api/Payments/"
        refreshData={fetchPayments}
        formFields={[
          {
            name: "amount",
            label: "المبلغ (ل.س)",
            type: "text",
            colClassName: "col-12",
            required: true,
          },
          {
            name: "date",
            label: "تاريخ الدفع",
            type: "date",
            colClassName: "col-12",
            required: true,
          },
        ]}
        additionalData={{
          memberID: selectedPayment?.memberID || 0,
        }}
        successMessage="تم تحديث الدفعة بنجاح"
        errorMessage="فشل في تحديث الدفعة"
      />

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={paymentToDelete?.id}
        itemName={paymentToDelete?.name}
        itemType="دفعة"
        deleteEndpoint={`/api/Payments/${paymentToDelete?.id}`}
        successMessage="تم حذف الدفعة بنجاح"
        errorMessage="فشل في حذف الدفعة"
        refreshData={fetchPayments}
      />
    </>
  );
};

export default PaymentsList;
