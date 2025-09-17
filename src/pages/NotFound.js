import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        backgroundColor: "var(--karate-background)",
      }}
    >
      <div
        className="text-center p-4 p-md-5 rounded-4 shadow"
        style={{
          maxWidth: "600px",
          backgroundColor: "var(--karate-card)",
          border: "1px solid var(--karate-border)",
        }}
      >
        <div
          className="fw-bold mb-3"
          style={{
            fontSize: "8rem",
            lineHeight: 1,
            background:
              "linear-gradient(135deg, var(--karate-primary), var(--karate-primary-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "var(--karate-primary)",
          }}
        >
          404
        </div>

        <h1
          className="mb-3"
          style={{
            fontSize: "2rem",
            color: "var(--karate-text)",
          }}
        >
          عذرًا! الصفحة غير موجودة
        </h1>

        <p
          className="mb-4"
          style={{
            fontSize: "1.1rem",
            color: "var(--karate-text-light)",
            lineHeight: 1.6,
          }}
        >
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button
            className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "var(--karate-primary)",
              borderColor: "var(--karate-primary)",
              boxShadow: "0 4px 15px rgba(54, 79, 139, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "var(--karate-primary-dark)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(54, 79, 139, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "var(--karate-primary)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(54, 79, 139, 0.2)";
            }}
          >
            العودة للخلف
          </button>

          <button
            className="btn px-4 py-2 rounded-pill fw-semibold"
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "white",
              color: "var(--karate-primary)",
              border: "2px solid var(--karate-primary)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "var(--karate-background)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 15px rgba(54, 79, 139, 0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </motion.div>
  );
};
