const router = require('express-promise-router')();
const { jwt, apikey } = require('../services/strategies');
const multer = require('multer');
const storage = multer.memoryStorage();        // or diskStorage()
const upload = multer({ storage });
const {
  voterRegistationService,
  getAllVoters,
  voterImageMatch
} = require('../controllers/Request');


router.post('/register', jwt, upload.single('file'), voterRegistationService);
router.get('/getAllVoters', jwt, getAllVoters);
router.post('/verifyVoter', jwt, upload.single('file'), voterImageMatch);
exports.requestRouter = router;
