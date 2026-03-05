const {
  getElectionActiveData,
  createElectionService,
  casteVote

} = require('../services/electiondata');
const { controller } = require('../middleware/controller');
module.exports = {
  getElectionActiveData: controller(getElectionActiveData),
  createElectionService: controller(createElectionService),
  casteVote: controller(casteVote),
};
