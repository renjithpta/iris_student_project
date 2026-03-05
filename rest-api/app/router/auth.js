const router = require('express-promise-router')();

const { validate } = require('../middleware/validator');

const { loginSchema } = require('../schema/auth/login');
const { registerSchema } = require('../schema/auth/register');

const {
  register,
  login,
} = require('../controllers/Auth');

router.post('/register',  register);
router.post('/login', validate(loginSchema), login);

exports.authRouter = router;
