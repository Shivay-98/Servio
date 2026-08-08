const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} = require('../controllers/document.controller');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);
router.use(authorize('provider'));

router.route('/')
  .get(getDocuments)
  .post(upload.single('document'), uploadDocument);

router.route('/:id')
  .get(getDocument)
  .delete(deleteDocument);

module.exports = router;
