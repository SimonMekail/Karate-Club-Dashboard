import React from "react";
import ReactPaginate from "react-paginate";

const Pagination = ({
  itemPerPage,
  totalItems,
  handlePageClick,
  currentPage = 0,
}) => {
  const pageCount = Math.ceil(totalItems / itemPerPage);

  return (
    <div>
      <ReactPaginate
        previousLabel={"السابق"}
        nextLabel={"التالي"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        containerClassName={"pagination justify-content-center"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
        disableInitialCallback={true}
      />
      <style jsx="true">{`
        .pagination .page-link {
          color: var(--karate-primary);
          background-color: var(--karate-card);
          border: 1px solid var(--karate-border);
          margin: 0 4px;
          border-radius: 6px;
          padding: 8px 14px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        .pagination .page-item:hover .page-link {
          background-color: var(--karate-primary-light);
          color: white;
          border-color: var(--karate-primary-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .pagination .active .page-link {
          background-color: var(--karate-primary);
          border-color: var(--karate-primary);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 8px rgba(var(--karate-primary-rgb), 0.2);
        }
        .pagination .page-item.disabled .page-link {
          color: var(--karate-text-light);
          border-color: var(--karate-border);
          background-color: var(--karate-background);
          box-shadow: none;
        }
        .pagination .break-me .page-link {
          color: var(--karate-text);
          background-color: var(--karate-background);
        }
        .pagination .previous .page-link,
        .pagination .next .page-link {
          background-color: var(--karate-secondary-light);
          border-color: var(--karate-secondary);
          font-weight: 600;
        }
        .pagination .previous:hover .page-link,
        .pagination .next:hover .page-link {
          background-color: var(--karate-secondary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Pagination;
