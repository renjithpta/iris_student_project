const { pagination } = require('../config');

exports.Pagination = class Pagination {
  constructor(pageNumber = 1, pageSize = pagination.pageSize) {
    this.pageNumber = +pageNumber;
    this.pageSize = pageSize;
  }

  getOffset() {
    return 0 + (this.pageNumber - 1) * this.pageSize;
  }

  getNumOfPages(count) {
    return Math.ceil(count / this.pageSize);
  }

  getMetaData(count) {
    return {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      totalNumberOfPages: this.getNumOfPages(count),
      totalCount: count,
    };
  }
};
