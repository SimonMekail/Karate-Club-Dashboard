import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import { API_CONFIG } from "../config";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EditModal from "../components/Modals/EditModal";

export const BeltRanks = () => {
  const { user } = AuthData();

  const [ranks, setRanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState(null);

  const fetchBeltRanks = () => {
    setIsLoading(true);
    axios
      .get("/api/BeltRanks/All", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
        if (response.request.status === 200) {
          setRanks(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchBeltRanks();
  }, [user.token]);

  const handleEditClick = (rank) => {
    setSelectedRank({
      beltRankID: rank.beltRankID,
      name: rank.name,
      testFees: rank.testFees,
    });
    setShowEditModal(true);
  };

  const rankFormFields = [
    {
      name: "testFees",
      label: "رسوم الاختبار",
      type: "text",
      required: true,
    },
  ];

  const getRankDetail = (rank) => {
    switch (rank) {
      case "الحزام الأبيض":
        return "نقطة البداية في رحلة الكاراتيه. التركيز على الأوضاع الأساسية، اللكمات، والدفاعات.";
      case "الحزام الأصفر":
        return "البدء في تطوير التقنيات الأساسية وفهم آداب الدوجو.";
      case "الحزام البرتقالي":
        return "تحسين التقنيات الأساسية والبدء في تعلم التركيبات والكاتا.";
      case "الحزام الأخضر":
        return "تطوير القوة والسرعة في التقنيات مع تعلم أشكال أكثر تعقيدًا.";
      case "الحزام الأزرق":
        return "البدء في فهم المبادئ الأعمق وراء التقنيات وتطبيقاتها.";
      case "الحزام البنفسجي":
        return "تحسين جميع التقنيات إلى درجة قريبة من الكمال وتطوير مهارات التدريس.";
      case "الحزام البني":
        return "التحضير للحزام الأسود من خلال إتقان جميع المواد السابقة وإظهار القيادة.";
      case "الحزام الأسود":
        return "بداية الفهم الحقيقي. يستمر حاملو الأحزمة السوداء في التعلم وإتقان فنهم.";
      default:
        return "معلومات إضافية عن هذا الحزام.";
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case "الحزام الأبيض":
        return "beltWhite";
      case "الحزام الأصفر":
        return "beltYellow";
      case "الحزام البرتقالي":
        return "beltOrange";
      case "الحزام الأخضر":
        return "beltGreen";
      case "الحزام الأزرق":
        return "beltBlue";
      case "الحزام البنفسجي":
        return "beltPurple";
      case "الحزام البني":
        return "beltBrown";
      case "الحزام الأسود":
        return "beltBlack";
      default:
        return "معلومات إضافية عن هذا الحزام.";
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--karate-background)",
        minHeight: "100vh",
      }}
      className="container-fluid"
    >
      <div className="row">
        <div className="col-lg-3 col-xl-2 d-none d-lg-block p-0">
          <SideBar />
        </div>
        <div className="col ps-0">
          <NavBar />

          {isLoading ? (
            <div className="spinner-container">
              <Spinner />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="border-bottom">
                <div className="container py-2">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1
                      className="display-5 fw-bold mb-3"
                      style={{ color: "var(--karate-primary)" }}
                    >
                      أحزمة الكاراتيه
                    </h1>

                    <div className="d-flex justify-content-center mb-3">
                      <div
                        className="mx-2"
                        style={{
                          width: "40px",
                          height: "3px",
                          backgroundColor: "var(--karate-primary)",
                          opacity: 0.7,
                        }}
                      />
                      <div
                        className="mx-2"
                        style={{
                          width: "20px",
                          height: "3px",
                          backgroundColor: "var(--karate-primary)",
                          opacity: 0.4,
                        }}
                      />
                      <div
                        className="mx-2"
                        style={{
                          width: "10px",
                          height: "3px",
                          backgroundColor: "var(--karate-primary)",
                          opacity: 0.2,
                        }}
                      />
                    </div>

                    <p
                      className="fs-5"
                      style={{ color: "var(--karate-text-light)" }}
                    >
                      رحلة التطور من المبتدئ إلى المحترف
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="container py-5">
                <div className="timeline-rtl">
                  <div className="timeline-rtl">
                    {ranks.map((rank, index) => (
                      <div
                        className={`belt-container-rtl ${
                          index % 2 === 0 ? "right" : "left"
                        }`}
                        key={rank.beltRankID}
                      >
                        <div className="belt-content">
                          <span
                            className="badge cost-badge"
                            style={{
                              backgroundColor: "var(--karate-primary)",
                              color: "white",
                            }}
                          >
                            {rank.testFees} ل.س
                          </span>
                          <h3 style={{ color: "var(--karate-text)" }}>
                            {rank.name}
                          </h3>
                          <div
                            className={`belt-stripe ${getRankColor(rank.name)}`}
                            style={{ border: "1px solid var(--karate-border)" }}
                          ></div>
                          <p style={{ color: "var(--karate-text-light)" }}>
                            {getRankDetail(rank.name)}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small
                              style={{ color: "var(--karate-text-light)" }}
                            >
                              3-6 أشهر تدريب
                            </small>
                            <div>
                              <Link
                                to={`/BeltTestsByRank/${rank.beltRankID}`}
                                className="btn btn-sm me-2"
                                style={{
                                  backgroundColor: "rgba(13, 71, 161, 0.1)",
                                  color: "var(--karate-primary)",
                                  borderRadius: "8px",
                                  border: "none",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                  padding: "0.25rem 0.5rem",
                                }}
                              >
                                الاختبارات
                              </Link>
                              {}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "rgba(13, 71, 161, 0.1)",
                                  color: "var(--karate-primary)",
                                  borderRadius: "8px",
                                  border: "none",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                  padding: "0.25rem 0.5rem",
                                }}
                                onClick={() => handleEditClick(rank)}
                              >
                                <i className="fas fa-edit"></i>
                              </motion.button>
                              {}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {}
              {selectedRank && (
                <EditModal
                  show={showEditModal}
                  onHide={() => setShowEditModal(false)}
                  itemId={selectedRank.beltRankID}
                  itemType="حزام الكاراتيه"
                  initialData={{
                    testFees: selectedRank.testFees,
                  }}
                  additionalData={{ name: selectedRank.name }}
                  formFields={rankFormFields}
                  apiEndpoint="/api/BeltRanks/"
                  refreshData={fetchBeltRanks}
                  successMessage={`تم تعديل ${selectedRank.name} بنجاح`}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
