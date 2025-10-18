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

// Apply auth middleware to all routes
router.use(auth);

// Branch CRUD
router.route('/')
  .get(checkActionPermission('read', 'branch'), getBranches)
  .post(authorize('admin'), validate(branchValidator), createBranch);

router.route('/:id')
  .get(checkActionPermission('read', 'branch'), getBranch)
  .put(authorize('admin'), validate(updateBranchValidator), updateBranch)
  .delete(authorize('admin'), deleteBranch);

// Branch statistics
router.get('/:id/stats', checkActionPermission('read', 'branch'), getBranchStats);

module.exports = router;