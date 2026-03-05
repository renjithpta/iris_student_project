const { irisdatastorecontract: contract } = require('../../config').contracts;
const { Fabric } = require('../../fabric');
const crypto = require('crypto');
const asyncHandler = require("express-async-handler");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require("uuid");
const { getPHashFromBuffer, hammingDistance } = require('../../utils/imageHashUtils');
const SIMILARITY_THRESHOLD = 12;  // Hamming distance threshold
const uploadDir = path.join(process.cwd(), 'uploads');

const isDateAtLeastFiveDaysFuture = (dateString) => {
  // 1. Convert the input string to a Date object
  const inputDate = new Date(dateString);

  // Check for invalid date
  if (isNaN(inputDate.getTime())) {
    console.error("Invalid date string provided");
    return false;
  }

  // 2. Calculate the threshold date (current date + 5 days)
  const currentDate = new Date();
  const thresholdDate = new Date();
  // Set the threshold date to exactly 5 days from now
  thresholdDate.setDate(currentDate.getDate() + 5);

  // 3. Compare the dates
  // JavaScript Date objects are compared by their millisecond values
  // The given date must be greater than or equal to the threshold date
  return inputDate >= thresholdDate;
};

exports.getElectionActiveData = asyncHandler(async ({ user }) => {

  const { username, fabricOrg } = user;

  const result = await Fabric.evaluateTx(username, contract, 'getActiveElectionDashboard', []);


  return {
    status: 200,
    message: 'Query was successfull',
    data: JSON.parse(result.toString()),
  };
});


exports.getCurrentElectionActiveData = asyncHandler(async ({ user }) => {

  const { username, fabricOrg } = user;

  const result = await Fabric.evaluateTx(username, contract, 'getActiveElectionDashboard', []);


  return {
    status: 200,
    message: 'Query was successfull',
    data: JSON.parse(result.toString()),
  };
});

exports.casteVote = asyncHandler(async ({ body, files, user }) => {

  const { username, fabricOrg } = user;
  const { electionId, candidateId, voterId } = body;

  if (!electionId || electionId.length < 0) {
    return { status: 400, message: 'Election Id  is required', data: null };
  }


  if (!candidateId || candidateId.length < 0) {
    return { status: 400, message: 'CandidateId Id  is required', data: null };
  }

  if (!voterId || voterId.length < 0) {
    return { status: 400, message: 'VoterId Id  is required', data: null };
  }
  const result = await Fabric.submitTx(username, contract, 'castVote', [electionId, candidateId, voterId]);
  const resultJSON = JSON.parse(result.toString());
  return {
    status: 201,
    data: {
      resultJSON
    },
    message: `Casted vote successfully with TxID ${resultJSON.txId} `
  };

});

exports.createElectionService = asyncHandler(async ({ body, files, user }) => {

  const { username, fabricOrg } = user;
  const electionId = uuidv4();
  const { title, electionDate } = body;
  const candidates = JSON.parse(body.candidates);
  const electionPayload = {
    title,
    electionDate,
    isActive: "true",
    electionId: electionId

  }
  if (!title || title.length < 0) {
    return { status: 400, message: 'title is required', data: null };
  }

  if (!electionDate || electionDate.length < 0) {
    return { status: 400, message: 'ElectionDate is required', data: null };
  }
  if (!isDateAtLeastFiveDaysFuture(electionDate)) {
    return { status: 400, message: 'ElectionDate must be at least 5 days in the future', data: null };
  }
  let candidateError = "";
  for (let i = 0; i < candidates.length; i++) {
   

    if (!files[i].originalname || files[i].originalname.length <= 0) {
      candidateError = `Image file is required for candidate ${candidates[i].fullName}`;
      break;
    }
    if (!candidates[i].fullName || candidates[i].fullName.length <= 0) {
      candidateError = `Full Name is required for candidate ${i + 1}`;
      break;
    }
    if (!candidates[i].party || candidates[i].party.length <= 0) {
      candidateError = `Party Name is required for candidate ${candidates[i].fullName}`;
      break;
    }

    const newImageBuffer = files[i].buffer;
   
    const pHash = await getPHashFromBuffer(newImageBuffer);
    for (let j = i + 1; j < candidates.length; j++) {
      let imageBuffer = files[j].buffer;
      let pHashNew = await getPHashFromBuffer(imageBuffer);
      const dist = hammingDistance(pHashNew, pHash);
      if (dist < 12) {
       
        candidateError = `Duplicate party symboldetected between candidate ${candidates[i].fullName} and candidate ${candidates[j].fullName}`;
        break;
      }

      if (candidates[i].fullName.toString().toUpperCase().trim() === candidates[j].fullName.toString().toUpperCase().trim()) {
        candidateError = `Duplicate candidate name found: ${candidates[i].fullName}`;
        break;
      }

    }
  }
  if (candidateError && candidateError.length > 0) {
    return { status: 400, message: candidateError, data: null };
  }
  await Fabric.submitTx(username, contract, 'deactivateLastActiveElection', []);

  const result = await Fabric.submitTx(username, contract, 'createElection', [JSON.stringify(electionPayload)]);
  
  const resultJSON = JSON.parse(result.toString());

  const electionTxId = JSON.parse(result.toString()).txId.toString();


  for (let i = 0; i < candidates.length; i++) {
    
    candidates[i].electionId = electionId;
    candidates[i].candidateId = electionId + "-" + (i + 1);
    candidates[i].imagePath = electionId + "-" + files[i].originalname;
    candidates[i].name = candidates[i].fullName.toString().toUpperCase().trim();

  }

  const resultCandidate = await Fabric.submitTx(username, contract, 'createCandidate', [JSON.stringify(candidates)]);
 
  if (resultCandidate.toString().length > 0 && resultCandidate.toString().indexOf("Error") >= 0 && resultCandidate.toString().indexOf("already exist") >= 0) {
    return {
      status: 409,
      message: resultCandidate.message
    };


  }

  for (let i = 0; i < files.length; i++) {
    const imageName = electionId + "-" + files[i].originalname;
    const uplofilepathadDir = path.join(uploadDir, imageName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    await sharp(files[i].buffer)
      .toFile(uplofilepathadDir);
  }
  return {
    status: 201,
    data: {
      electionTxId,
      electionId
    },
    message: `New election with ID ${electionId} saved successfully with TxID ${electionTxId.toString()}`
  };


});



