const router = require('express-promise-router')();
const { jwt ,apikey} = require('../services/strategies');
const multer = require('multer');
const storage = multer.memoryStorage();        // or diskStorage()
const upload = multer({ storage });
const {
 getElectionActiveData,
 createElectionService,
 casteVote

} = require('../controllers/ElectionData');


router.get('/getEActiveElectionDetails',jwt, getElectionActiveData);
router.post('/createElection', jwt, upload.array('photos', 10), createElectionService);
router.post('/castVote', jwt, casteVote);


exports.electionDataRouter = router;
