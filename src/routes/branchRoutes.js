const express = require('express');
const {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats
} = require('../controllers/branchController');
const auth = require('../middlewares/auth');
const { authorize, checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const { branchValidator, updateBranchValidator } = require('../validators');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getBranches);  // ✅ Get all branches - Public
router.get('/:id', getBranch); // ✅ Get single branch - Public

// Protected routes (authentication required)
router.post('/', auth, authorize('admin'), validate(branchValidator), createBranch);
router.put('/:id', auth, authorize('admin'), validate(updateBranchValidator), updateBranch);
router.delete('/:id', auth, authorize('admin'), deleteBranch);
router.get('/:id/stats', auth, checkActionPermission('read', 'branch'), getBranchStats);

module.exports = router;