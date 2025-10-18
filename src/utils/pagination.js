const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

class Pagination {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalDocs = 0;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = Math.min(
      parseInt(this.queryString.limit) || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    
    this.page = page;
    this.limit = limit;
    this.skip = skip;

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // Handle multiple sort fields: ?sort=-createdAt,name
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by creation date (newest first)
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // Handle field selection: ?fields=name,email,phone
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude sensitive fields by default
      this.query = this.query.select('-__v');
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering: ?price[gte]=100&status[ne]=cancelled
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in|nin)\b/g, match => `$${match}`);
    
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchQueries = fields.map(field => ({
        [field]: searchRegex
      }));
      
      this.query = this.query.find({
        $or: searchQueries
      });
    }

    return this;
  }

  async execute() {
    // Get total count for pagination info
    const countQuery = this.query.model.find(this.query.getQuery());
    this.totalDocs = await countQuery.countDocuments();

    // Execute the main query
    const docs = await this.query;

    // Calculate pagination info
    const totalPages = Math.ceil(this.totalDocs / this.limit);
    const hasNextPage = this.page < totalPages;
    const hasPrevPage = this.page > 1;
    const nextPage = hasNextPage ? this.page + 1 : null;
    const prevPage = hasPrevPage ? this.page - 1 : null;

    return {
      docs,
      pagination: {
        page: this.page,
        limit: this.limit,
        totalDocs: this.totalDocs,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        skip: this.skip
      }
    };
  }
}

// Helper function to create pagination response
const createPaginatedResponse = (data, pagination, message = 'Data fetched successfully') => {
  return {
    success: true,
    message,
    data,
    pagination
  };
};

// Helper function for simple pagination
const simplePaginate = async (Model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    sort = '-createdAt',
    populate = '',
    select = ''
  } = options;

  const skip = (page - 1) * limit;

  let queryBuilder = Model.find(query);

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const [docs, totalDocs] = await Promise.all([
    queryBuilder.sort(sort).skip(skip).limit(limit),
    Model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

module.exports = {
  Pagination,
  createPaginatedResponse,
  simplePaginate
};