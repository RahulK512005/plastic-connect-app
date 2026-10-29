const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/s3');
const {
  addListing,
  getActiveListings,
  getPreviousListings,
  deleteListing,
  listingValidation,
} = require('../controllers/listingController');

const router = express.Router();

router.use(authenticate);

router.post('/', upload.single('photo'), listingValidation, addListing);
router.get('/active', getActiveListings);
router.get('/previous', getPreviousListings);
router.delete('/:id', deleteListing);

module.exports = router;
