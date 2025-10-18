const express = require('express');
const {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');
const auth = require('../middlewares/auth');
const { authorize, checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const { offerValidator, updateOfferValidator } = require('../validators');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Offer CRUD
router.route('/')
  .get(checkActionPermission('read', 'offer'), getOffers)
  .post(authorize('admin'), validate(offerValidator), createOffer);

router.route('/:id')
  .get(checkActionPermission('read', 'offer'), getOffer)
  .put(authorize('admin'), validate(updateOfferValidator), updateOffer)
  .delete(authorize('admin'), deleteOffer);

module.exports = router;