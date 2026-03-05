const { roles, contracts, apiKeys } = require('../../config');
const { hashPassword, verifyPassword, signToken } = require('./strategies/util');
const { Fabric } = require('../../fabric');
const db = require('../../models');



exports.login = async ({ body }) => {
  const { username, password } = body;

  let user = await db.User.scope('withPassword').findOne({
    where: { username },
  });

  if (!user) return { err: 'No such user', status: 404 };
  user = user.toJSON();
  const { id, password: hash, name, fabricOrg, userType } = user;

  const valid = await verifyPassword(password, hash);
  if (!valid) return { err: 'Wrong password', status: 406 };

  const token = signToken({ id, name, username, userType, fabricOrg });

  // enroll fabric user and add to wallet
  const { error: err1 } = await Fabric.enrollUser(username, password, fabricOrg);
  if (err1) return { err: err1, status: 417 };

  // initialize fabric connection for future usage
  const { error: err2 } = await Fabric.connect(username, fabricOrg);
  if (err2) return { err: err2, status: 417 };

  return {
    message: 'User login successfully',
    data: {
      user: {
        id, name, username, userType, fabricOrg,
      },
      token,
    },
  };
};

/**
 * 
 * @role {kmc: 'kmc',
*  pwd: 'pwd',
 *   kwa: 'kwa',} param0 
 * @returns 
 */
exports.register = async ({ body }) => {
  console.log("Registering user:", body);
  const { name, username, userType, password } = body;
  const foundUser = await db.User.findOne({ where: { username }, raw: true });
  if (foundUser) return { err: 'User with this username already exists', status: 409 };


  let fabricOrg = 'org1';
  let apiKey = apiKeys.Org1;
  if (userType === "Org2" || userType == "Org2") { fabricOrg = 'org2'; apiKey = apiKeys.Org2; }
  else if (userType === "Org3" || userType == "Org3") { fabricOrg = 'org3'; apiKey = apiKeys.Org3; }
  else if (userType === "Org4" || userType === "org4") { fabricOrg = 'org4'; apiKey = apiKeys.Org4; }

  else if (userType === "Org5" || userType === "org5") { fabricOrg = 'org5'; apiKey = apiKeys.Org5; }

  console.log("apikeys", apiKey);
  const hash = await hashPassword(password);

  const transaction = await db.sequelize.transaction();

  const user = await db.User.create({
    name, username, userType, password: hash, fabricOrg, apiKey, apiKeySecret: password
  }, { transaction });
  const { id } = user.toJSON();

  // register new fabric identity
  const { error } = await Fabric.registerUser(username, password, fabricOrg);
  if (error) {
    await transaction.rollback();
    return {
      err: 'can\'t register user CA identity',
      status: 500,
    };
  }

  await transaction.commit();

  // enroll fabric user and add to wallet
  await Fabric.enrollUser(username, password, fabricOrg);
  // initialize fabric connection for future usage

  await Fabric.connect(username, fabricOrg);

  const result = await Fabric.evaluateTx(username, contracts.workrequest, 'ClientAccountID', []);

  if (result) {
    await db.User.update({ fabricClientId: result.toString() }, { where: { id } });

  } else {
    return {
      err: 'User registered successfully, but something went wrong! please login to contact support',
      status: 500,
    };
  }

  return {
    message: 'User registered successfully',
    data: {
      user: {
        id, name, username, userType, fabricOrg,
      },
    },
  };
};