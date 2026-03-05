const {
  voterRegistationService,
  getAllVoters,
  voterImageMatch,
} = require('../services/request');
const { controller } = require('../middleware/controller');
module.exports = {
  voterRegistationService: controller(voterRegistationService),
  voterRegistationService: controller(voterRegistationService),
  getAllVoters: controller(getAllVoters),
  voterImageMatch: controller(voterImageMatch),
};
