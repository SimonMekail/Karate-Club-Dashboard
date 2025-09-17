import React from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { API_CONFIG } from "../../config";
import { AuthData } from "../../auth/AuthWrapper";
import toast from "react-hot-toast";

const DeleteModal = ({
  show,
  onHide,
  itemId,
  itemName,
  itemType = "العنصر",
  deleteEndpoint,
  successMessage,
  errorMessage,
  refreshData,
  additionalWarning = "",
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { user } = AuthData();

  const deleteItem = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    const toastId = toast.loading(`جاري حذف ${itemType}...`);

    try {
      const response = await axios.delete(deleteEndpoint, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      });

      if (response.status === 200) {
        toast.success(
          response.data.message || successMessage || `تم حذف ${itemType} بنجاح`,
          { id: toastId }
        );
        if (refreshData) refreshData();
        onHide(); 
      }
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data ||
        error.message ||
        errorMessage ||
        `حدث خطأ أثناء حذف ${itemType}`;
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header
        closeButton
        closeVariant="white"
        style={{ backgroundColor: "var(--karate-primary)", color: "white" }}
      >
        <Modal.Title>تأكيد الحذف</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          backgroundColor: "var(--karate-background)",
          color: "var(--karate-text)",
        }}
      >
        <div className="text-center mb-4">
          <i
            className="fas fa-exclamation-triangle fa-3x mb-3"
            style={{ color: "var(--karate-accent)" }}
          ></i>
          <h5 style={{ color: "var(--karate-text)" }}>
            هل أنت متأكد أنك تريد حذف {itemType} {itemName}؟
          </h5>
          <p style={{ color: "var(--karate-text)" }}>
            {additionalWarning ||
              `سيتم حذف جميع البيانات المرتبطة   ولا يمكن استرجاعها لاحقاً.`}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "var(--karate-background)" }}>
        <Button
          onClick={onHide}
          disabled={isDeleting}
          style={{
            backgroundColor: "var(--karate-secondary)",
            color: "white",
            border: "none",
          }}
        >
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={deleteItem}
          disabled={isDeleting}
          style={{
            backgroundColor: "var(--karate-primary)",
            border: "none",
            color: "white",
          }}
        >
          {isDeleting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              جاري الحذف...
            </>
          ) : (
            <>
              <i className="fas fa-trash-alt me-1"></i> نعم، احذف
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
