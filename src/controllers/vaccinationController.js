const Vaccination = require('../models/Vaccination');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination, createPaginatedResponse } = require('../utils/pagination');
const APIFilters = require('../utils/filters');

// @desc    Get all vaccinations
// @route   GET /api/vaccinations
// @access  Public
const getVaccinations = asyncHandler(async (req, res) => {
  let query = Vaccination.find({ isActive: true });

  // Apply filters
  const filters = new APIFilters(query, req.query)
    .filter()
    .sort()
    .limitFields();

  // Apply pagination and search
  const pagination = new Pagination(filters.query, req.query)
    .search(['name', 'nameAr', 'description', 'descriptionAr'])
    .paginate();

  const result = await pagination.execute();

  sendSuccess(res, { vaccinations: result.docs, pagination: result.pagination }, 'Vaccinations fetched successfully');
});

// @desc    Get single vaccination
// @route   GET /api/vaccinations/:id
// @access  Public
const getVaccination = asyncHandler(async (req, res) => {
  const vaccination = await Vaccination.findById(req.params.id);

  if (!vaccination || !vaccination.isActive) {
    return sendNotFound(res, 'Vaccination');
  }

  sendSuccess(res, vaccination, 'Vaccination fetched successfully');
});

// @desc    Get vaccinations by animal type
// @route   GET /api/vaccinations/animal-type/:type
// @access  Public
const getVaccinationsByAnimalType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { age } = req.query;

  let query = {
    animalTypes: type,
    isActive: true
  };

  // Filter by age if provided
  if (age) {
    query['ageRange.min'] = { $lte: parseInt(age) };
    query['ageRange.max'] = { $gte: parseInt(age) };
  }

  const vaccinations = await Vaccination.find(query).sort({ name: 1 });

  sendSuccess(res, vaccinations, `Vaccinations for ${type} fetched successfully`);
});

// @desc    Create new vaccination
// @route   POST /api/vaccinations
// @access  Private (Admin/Staff)
const createVaccination = asyncHandler(async (req, res) => {
  const vaccination = await Vaccination.create(req.body);

  sendSuccess(res, vaccination, 'Vaccination created successfully', 201);
});

// @desc    Update vaccination
// @route   PUT /api/vaccinations/:id
// @access  Private (Admin/Staff)
const updateVaccination = asyncHandler(async (req, res) => {
  const vaccination = await Vaccination.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!vaccination) {
    return sendNotFound(res, 'Vaccination');
  }

  sendSuccess(res, vaccination, 'Vaccination updated successfully');
});

// @desc    Delete vaccination
// @route   DELETE /api/vaccinations/:id
// @access  Private (Admin)
const deleteVaccination = asyncHandler(async (req, res) => {
  const vaccination = await Vaccination.findById(req.params.id);

  if (!vaccination) {
    return sendNotFound(res, 'Vaccination');
  }

  // Soft delete by setting isActive to false
  vaccination.isActive = false;
  await vaccination.save();

  sendSuccess(res, null, 'Vaccination deleted successfully');
});

// @desc    Get vaccination statistics
// @route   GET /api/vaccinations/stats
// @access  Private
const getVaccinationStats = asyncHandler(async (req, res) => {
  const stats = await Vaccination.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalVaccinations: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        animalTypeDistribution: {
          $push: '$animalTypes'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalVaccinations: 1,
        averagePrice: { $round: ['$averagePrice', 2] },
        minPrice: 1,
        maxPrice: 1,
        animalTypeDistribution: {
          $reduce: {
            input: '$animalTypeDistribution',
            initialValue: [],
            in: { $setUnion: ['$$value', '$$this'] }
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalVaccinations: 0,
    averagePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    animalTypeDistribution: []
  };

  sendSuccess(res, result, 'Vaccination statistics fetched successfully');
});

module.exports = {
  getVaccinations,
  getVaccination,
  getVaccinationsByAnimalType,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getVaccinationStats
};