class APIFilters {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Basic filter method
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort method
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Date range filtering
  dateRange(field = 'createdAt') {
    const { startDate, endDate, dateFrom, dateTo } = this.queryString;
    
    if (startDate || dateFrom) {
      const start = startDate || dateFrom;
      this.query = this.query.find({
        [field]: { $gte: new Date(start) }
      });
    }

    if (endDate || dateTo) {
      const end = endDate || dateTo;
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      
      this.query = this.query.find({
        [field]: { $lte: endOfDay }
      });
    }

    return this;
  }

  // Status filtering
  status(statuses = []) {
    if (this.queryString.status) {
      const statusList = this.queryString.status.split(',');
      const validStatuses = statusList.filter(s => statuses.includes(s));
      
      if (validStatuses.length > 0) {
        this.query = this.query.find({
          status: { $in: validStatuses }
        });
      }
    }

    return this;
  }

  // Branch filtering
  branch() {
    if (this.queryString.branch) {
      this.query = this.query.find({
        branch: this.queryString.branch
      });
    }

    return this;
  }

  // Doctor filtering
  doctor() {
    if (this.queryString.doctor) {
      this.query = this.query.find({
        doctor: this.queryString.doctor
      });
    }

    return this;
  }

  // Customer filtering
  customer() {
    if (this.queryString.customer) {
      this.query = this.query.find({
        customer: this.queryString.customer
      });
    }

    return this;
  }

  // Animal type filtering
  animalType() {
    if (this.queryString.animalType) {
      const types = this.queryString.animalType.split(',');
      this.query = this.query.find({
        'animal.type': { $in: types }
      });
    }

    return this;
  }

  // Price range filtering
  priceRange() {
    const { minPrice, maxPrice } = this.queryString;
    
    if (minPrice) {
      this.query = this.query.find({
        price: { $gte: parseFloat(minPrice) }
      });
    }

    if (maxPrice) {
      this.query = this.query.find({
        price: { $lte: parseFloat(maxPrice) }
      });
    }

    return this;
  }

  // City filtering
  city() {
    if (this.queryString.city) {
      this.query = this.query.find({
        city: new RegExp(this.queryString.city, 'i')
      });
    }

    return this;
  }

  // Active/Inactive filtering
  active() {
    if (this.queryString.hasOwnProperty('isActive')) {
      this.query = this.query.find({
        isActive: this.queryString.isActive === 'true'
      });
    }

    return this;
  }

  // Payment status filtering
  paymentStatus() {
    if (this.queryString.hasOwnProperty('paid')) {
      this.query = this.query.find({
        paid: this.queryString.paid === 'true'
      });
    }

    return this;
  }

  // Priority filtering
  priority() {
    if (this.queryString.priority) {
      const priorities = this.queryString.priority.split(',');
      this.query = this.query.find({
        priority: { $in: priorities }
      });
    }

    return this;
  }

  // Today's records
  today(field = 'createdAt') {
    if (this.queryString.today === 'true') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      this.query = this.query.find({
        [field]: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
    }

    return this;
  }

  // This week's records
  thisWeek(field = 'createdAt') {
    if (this.queryString.thisWeek === 'true') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      this.query = this.query.find({
        [field]: {
          $gte: startOfWeek,
          $lte: endOfWeek
        }
      });
    }

    return this;
  }

  // This month's records
  thisMonth(field = 'createdAt') {
    if (this.queryString.thisMonth === 'true') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      this.query = this.query.find({
        [field]: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
    }

    return this;
  }

  // Apply all common filters for bookings
  applyBookingFilters() {
    return this
      .dateRange('appointmentDate')
      .status(['pending', 'confirmed', 'completed', 'cancelled'])
      .branch()
      .doctor()
      .customer()
      .animalType()
      .priceRange()
      .paymentStatus()
      .today('appointmentDate')
      .thisWeek('appointmentDate')
      .thisMonth('appointmentDate');
  }

  // Apply all common filters for consultations
  applyConsultationFilters() {
    return this
      .dateRange('scheduledDate')
      .status(['scheduled', 'in_progress', 'completed', 'cancelled'])
      .doctor()
      .customer()
      .animalType()
      .priority()
      .paymentStatus()
      .today('scheduledDate')
      .thisWeek('scheduledDate')
      .thisMonth('scheduledDate');
  }

  // Apply all common filters for customers
  applyCustomerFilters() {
    return this
      .dateRange()
      .city()
      .animalType()
      .active()
      .today()
      .thisWeek()
      .thisMonth();
  }
}

module.exports = APIFilters;