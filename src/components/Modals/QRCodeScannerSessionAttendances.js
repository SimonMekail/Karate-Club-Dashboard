import { useState, useEffect, useRef } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";
import { AuthData } from "../../auth/AuthWrapper";

import toast from "react-hot-toast";
import { API_CONFIG } from "../../config";

export const QRCodeScannerSessionAttendances = ({ sessionID }) => {
  const [data, setData] = useState("No QR code detected");
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const scannerContainerRef = useRef(null);

  const { user } = AuthData();
  

  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          throw new Error("Camera API not supported in this browser");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(
          (device) => device.kind === "videoinput"
        );

        if (!hasVideoInput) {
          throw new Error("No camera device found");
        }

        if (navigator.permissions?.query) {
          try {
            const permission = await navigator.permissions.query({
              name: "camera",
            });
            setHasPermission(permission.state === "granted");
            permission.onchange = () => {
              setHasPermission(permission.state === "granted");
            };
            return;
          } catch (err) {
            console.log("Permission API not fully supported");
          }
        }

        setHasPermission(null);
      } catch (err) {
        console.error("Camera check failed:", err);
        setCameraError(err.message);
        setHasPermission(false);
      }
    };

    checkCamera();
  }, []);

  const handleScan = (result) => {
    if (result) {
      console.log("QR code scanned successfully:", result.text);
      const parsedData = JSON.parse(result.text);
      setData(parsedData);
      
      
      const toastId = toast.loading("تسجيل الحضور ...");

      axios
        .post(
          "/api/Attendances",
          {
            memberID: parsedData.memberID,
            sessionID: sessionID,
            date: new Date().toISOString(),
            status: true,
          },
          {
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              ...API_CONFIG.AUTH_HEADERS(user.token),
            },
          }
        )
        .then((response) => {
          console.log(response);

          if (response.request.status === 201) {
            handleCloseScanner();

            toast.success(response.data.message || `تم تسجيل الحضور  بنجاح`, {
              id: toastId,
            });
          }
        })
        .catch(function (error) {
          console.log(error);

          toast.error(error.response.data || `حدث خطأ أثناء المسح `, {
            id: toastId,
          });
        });

      
    }
  };

  const handleError = (err) => {
    console.error("Scanner error:", err);
    setCameraError(err?.message || "Scanner failed");
    setHasPermission(false);
  };

  const handleOpenScanner = async () => {
    if (hasPermission !== true) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
        setCameraError(null);
      } catch (err) {
        setCameraError("Please enable camera permissions to use the scanner");
        return;
      }
    }

    setShowScannerModal(true);
    setData("No QR code detected");
  };

  const handleCloseScanner = () => {
    setShowScannerModal(false);
  };

  return (
    <>
      {/* {cameraError && (
        <div className="alert alert-danger mt-2">
          {cameraError}
          {hasPermission === false && (
            <div>
              <button className="btn btn-link p-0" onClick={handleOpenScanner}>
                حاول مرة اخرى
              </button>
            </div>
          )}
        </div>
      )} */}
      <button
        className="btn btn-sm d-flex align-items-center"
        style={{
          backgroundColor: "var(--karate-primary)",
          color: "white",
        }}
        onClick={handleOpenScanner}
      >
        <i className="bi bi-qr-code-scan me-2"></i>
        {hasPermission === null
          ? " تسجيل حضور"
          : hasPermission === false
          ? "لا يوجد صلاحية"
          : "تسجيل حضور"}
      </button>
      {/* <button className="btn btn-primary mt-2" onClick={handleOpenScanner}>
        {hasPermission === null
          ? "Open QR Scanner"
          : hasPermission === false
          ? "Camera access denied"
          : "Open QR Scanner"}
      </button> */}
      {showScannerModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                border: "none",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              {}
              <div
                className="modal-header border-0 pb-3 pt-4"
                style={{
                  background:
                    "linear-gradient(135deg, var(--karate-primary) 0%, var(--karate-primary-dark) 100%)",
                  color: "white",
                }}
              >
                <div className="d-flex align-items-center w-100">
                  <div
                    className="bg-white p-2 px-3 rounded-circle me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i
                      className="bi bi-qr-code-scan"
                      style={{ color: "var(--karate-primary)" }}
                    ></i>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="modal-title fw-bold mb-0">QR ماسح</h5>
                    <p className="small mb-0 opacity-75">
                      قم بمسح رمز الاستجابة السريعة لتسجيل الحضور
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseScanner}
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              <div
                className="modal-body"
                style={{
                  backgroundColor: "var(--karate-background)",
                  padding: "1.5rem",
                }}
              >
                {hasPermission ? (
                  <div
                    ref={scannerContainerRef}
                    style={{ width: "100%", position: "relative" }}
                  >
                    <QrScanner
                      key={Date.now()}
                      delay={500}
                      onScan={handleScan}
                      onError={handleError}
                      constraints={{
                        audio: false,
                        video: {
                          facingMode: "environment",
                          width: { ideal: 1280 },
                          height: { ideal: 720 },
                        },
                      }}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p>يجب منح إذن الكاميرا لمسح رموز QR</p>
                    <button
                      className="btn btn-primary"
                      onClick={handleOpenScanner}
                    >
                      السماح بالوصول
                    </button>
                  </div>
                )}
              </div>

              <div
                className="modal-footer border-top-0"
                style={{
                  backgroundColor: "var(--karate-background)",
                  padding: "1rem 1.5rem",
                }}
              >
                <button
                  type="button"
                  className="btn px-4 rounded-3"
                  onClick={handleCloseScanner}
                  style={{
                    borderColor: "var(--karate-border)",
                    color: "var(--karate-text)",
                  }}
                >
                  اغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
