import { useState } from "react";
import { generateSubscriptionReceipt } from "../../utils/generateSubscriptionReceipt";
import styles from "./SubscriptionsList.module.css";
import { motion } from "framer-motion";
import DeleteModal from "../Modals/DeleteModal";
import EditModal from "../Modals/EditModal";

const SubscriptionsList = ({
  subscriptions,
  karateClasses,
  fetchSubscriptions,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SY").format(amount) + " ليرة سورية";
  };

  const getStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    return end > today ? "نشط" : "منتهي";
  };

  const getStatusColor = (status) => {
    return status === "نشط"
      ? "var(--karate-secondary)"
      : "var(--karate-accent)";
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

  const handleEdit = (subscription) => {
    setSelectedSubscription({
      subscriptionID: subscription.subscriptionID,
      memberID: subscription.memberID,
      classID: subscription.classID,
      beltName: subscription.beltName,
      startDate: subscription.startDate.split("T")[0],
      endDate: subscription.endDate.split("T")[0],
      paymentID: subscription.paymentID,
      memberName: subscription.memberName,
      className: subscription.className,
      classPrice: subscription.classPrice,
    });
    setShowEditModal(true);
  };

  const handleDelete = (subscription) => {
    setSubscriptionToDelete({
      id: subscription.subscriptionID,
      name: `${subscription.memberName} - ${subscription.className}`,
    });
    setShowDeleteModal(true);
  };

  const subscriptionFormFields = [
    {
      name: "startDate",
      label: "تاريخ البدء",
      type: "date",
      required: true,
    },
    {
      name: "endDate",
      label: "تاريخ الانتهاء",
      type: "date",
      required: true,
    },
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
      <div className={styles.gridContainer}>
        {subscriptions.length > 0 ? (
          subscriptions.map((sub, index) => {
            const status = getStatus(sub.endDate);
            const statusColor = getStatusColor(status);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                key={sub.subscriptionID}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.memberName}>{sub.memberName}</div>
                  <div
                    className={styles.statusBadge}
                    style={{ backgroundColor: statusColor }}
                  >
                    {status}
                  </div>
                </div>

                <div className={styles.classInfo}>
                  <span className={styles.className}>{sub.className}</span>
                  <div className={styles.beltInfo}>
                    <span
                      className={`${styles.beltDot} ${getBeltColor(
                        sub.beltName
                      )}`}
                    ></span>
                    <span className={styles.beltName}>{sub.beltName}</span>
                  </div>
                </div>

                <div className={styles.datesContainer}>
                  <div className={styles.dateItem}>
                    <div className={styles.dateLabel}>تاريخ البدء</div>
                    <div className={styles.dateValue}>
                      {formatDate(sub.startDate)}
                    </div>
                  </div>
                  <div className={styles.dateItem}>
                    <div className={styles.dateLabel}>تاريخ الانتهاء</div>
                    <div className={styles.dateValue}>
                      {formatDate(sub.endDate)}
                    </div>
                  </div>
                </div>

                {}
                <div className={styles.priceContainer}>
                  <div className={styles.priceLabel}>سعر الاشتراك</div>
                  <div className={styles.priceValue}>
                    {formatCurrency(sub.classPrice)}
                  </div>
                </div>

                <div className={styles.actions}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.actionBtn}
                    onClick={() =>
                      generateSubscriptionReceipt(
                        {
                          name: sub.memberName,
                          memberId: sub.subscriptionID,
                        },
                        {
                          type: "اشتراك شهري",
                          duration: "1 شهر",
                          startDate: formatDate(sub.startDate),
                          endDate: formatDate(sub.endDate),
                        },
                        {
                          amount: sub.classPrice,
                          currency: " ليرة سورية",
                          reference: sub.paymentID,
                        },
                        `${sub.memberName}_receipt.pdf`
                      )
                    }
                  >
                    <i className="fas fa-receipt"></i>
                    <span>فاتورة</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEdit(sub)}
                  >
                    <i className="fas fa-edit"></i>
                    <span>تعديل</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(sub)}
                  >
                    <i className="fas fa-trash-alt"></i>
                    <span>حذف</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-id-card"></i>
            </div>
            <h3 className={styles.emptyTitle}>لا توجد اشتراكات متطابقة</h3>
            <p className={styles.emptyText}>
              حاول تغيير عوامل التصفية أو إضافة اشتراك جديد
            </p>
          </div>
        )}
      </div>

      {}
      {selectedSubscription && (
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          itemId={selectedSubscription.subscriptionID}
          itemType="الاشتراك"
          initialData={{
            classID: selectedSubscription.classID,
            startDate: `${selectedSubscription.startDate}`,
            endDate: `${selectedSubscription.endDate}`,
          }}
          additionalData={{
            memberID: selectedSubscription.memberID,
            paymentID: selectedSubscription.paymentID,
          }}
          formFields={subscriptionFormFields}
          apiEndpoint="/api/Subscriptions/"
          refreshData={fetchSubscriptions}
          successMessage={`تم تعديل اشتراك ${selectedSubscription.memberName} بنجاح`}
        />
      )}

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={subscriptionToDelete?.id}
        itemName={subscriptionToDelete?.name}
        itemType="الاشتراك"
        deleteEndpoint={`/api/Subscriptions/${subscriptionToDelete?.id}`}
        successMessage="تم حذف الاشتراك بنجاح"
        errorMessage="فشل في حذف الاشتراك"
        refreshData={fetchSubscriptions}
      />
    </>
  );
};

export default SubscriptionsList;
