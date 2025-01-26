class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $option: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    // filter for product category
    const queryCopy = { ...this.queryStr };
    const removeField = ["keyword", "page", "limit"];

    removeField.forEach((key) => delete queryCopy[key]);

    // filter for price
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(
      /\b(gt | gte | lt | lte)\b/g,
      (key) => `$${key}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultsPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skipPage = resultsPerPage * (currentPage - 1);

    this.query = this.query.limit(resultsPerPage).skip(skipPage);
    return this;
  }
}

export { ApiFeatures };
