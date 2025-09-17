const Cards = ({
  activeMembers,
  monthlyRevenue,
  newMembersMonthly,
  mostPopularClass,
}) => {
  return (
    <div className="row g-4">
      {}
      <div className="col-md-3">
        <div className="card-stat h-100">
          <div className="icon-wrapper">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="content">
            <h3>{activeMembers}</h3>
            <p>الأعضاء النشطين</p>
          </div>
        </div>
      </div>

      {}
      <div className="col-md-3">
        <div className="card-stat h-100">
          <div className="icon-wrapper">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="content">
            <h3>{monthlyRevenue.toLocaleString()} ل.س</h3>
            <p>الإيراد الشهري</p>
          </div>
        </div>
      </div>

      {}
      <div className="col-md-3">
        <div className="card-stat h-100">
          <div className="icon-wrapper">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="content">
            <h3>{newMembersMonthly}</h3>
            <p>أشتراكات هذا الشهر</p>
          </div>
        </div>
      </div>

      {}
      <div className="col-md-3">
        <div className="card-stat h-100">
          <div className="icon-wrapper">
            <i className="fas fa-star"></i>
          </div>
          <div className="content">
            <h3>{mostPopularClass || "غير محدد"}</h3>
            <p>الصف الأكثر شعبية</p>
          </div>
        </div>
      </div>

      <style>{`
        .card-stat {
          background: var(--karate-card);
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          border: 1px solid var(--karate-border);
        }

        .card-stat:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(var(--karate-primary-rgb), 0.1);
        }

        .icon-wrapper {
          width: 60px;
          height: 60px;
          background: rgba(var(--karate-primary-rgb), 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          flex-shrink: 0;
        }

        .icon-wrapper i {
          font-size: 24px;
          color: var(--karate-primary);
        }

        .content {
          flex-grow: 1;
          text-align: right;
        }

        .content h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
          color: var(--karate-primary-dark);
        }

        .content p {
          font-size: 14px;
          color: var(--karate-text-light);
          margin: 0;
        }

        @media (max-width: 768px) {
          .card-stat {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .icon-wrapper {
            margin-left: 0;
            margin-bottom: 15px;
          }

          .content {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Cards;
