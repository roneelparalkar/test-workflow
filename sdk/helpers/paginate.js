"use strict";
const paginate = (totalItems, currentPage = 1, pageSize = 10, loadMoreCount, maxPages = 5) => {
  totalItems = +totalItems;
  currentPage = +currentPage;
  pageSize = +pageSize;
  loadMoreCount = +loadMoreCount;
  maxPages = +maxPages;
  let totalPages = Math.ceil((totalItems - pageSize) / loadMoreCount) + 1;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  let startPage, endPage;
  if (totalPages <= maxPages) {
    startPage = 1;
    endPage = totalPages;
  } else {
    let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
    let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      startPage = 1;
      endPage = maxPages;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      startPage = totalPages - maxPages + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  let pages = Array.from(Array(endPage + 1 - +startPage).keys()).map(i => +startPage + i);
  let paginatedData = {
    totalItems: totalItems,
    currentPage: currentPage,
    pageSize: pageSize,
    totalPages: totalPages,
    startPage: startPage,
    endPage: endPage,
    startIndex: startIndex,
    endIndex: endIndex,
    pages: pages,
    isFirstPage: false,
    isLastPage: false,
    showStarPaginationDots: false,
    showEndPaginationDots: false,
    firstPageIndex: 1,
    lastPageIndex: totalPages,
    showFirstPage: false,
    showLastPage: false
  };

  if (currentPage === 1) {
    paginatedData.isFirstPage = true;
  } else if (currentPage === totalPages) {
    paginatedData.isLastPage = true;
  }

  if (paginatedData.pages[0] !== 1) {
    paginatedData.showStarPaginationDots = true;
  }
  if (paginatedData.pages[paginatedData.pages.length - 1] !== paginatedData.totalPages) {
    paginatedData.showEndPaginationDots = true;
  }
  return paginatedData;
};
module.exports = paginate;
