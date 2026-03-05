const { irisdatastorecontract: contract } = require('../../config').contracts;
const { Fabric } = require('../../fabric');

const crypto = require('crypto');
const asyncHandler = require("express-async-handler");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { getPHashFromBuffer, hammingDistance } = require('../../utils/imageHashUtils');
const SIMILARITY_THRESHOLD = 12;  // Hamming distance threshold
const uploadDir = path.join(process.cwd(), 'uploads');


exports.getAllVoters = asyncHandler(async ({ user }) => {

  const { username, fabricOrg } = user;
  const result = await Fabric.evaluateTx(username, contract, 'QueryAllVoters', []);
  return {
    status: 200,
    message: 'Query was successfull',
    data: JSON.parse(result.toString())
  };

});


exports.casteVote = asyncHandler(async ({ body, user }) => {
  let voterId = body.voterId.toString().toUpperCase().trim();
  let candiadteName = body.candidateName.toString().toUpperCase().trim();
  let electionName = body.electionName.toString().toUpperCase().trim();
  const { username, fabricOrg } = user;
  if (!voterId || voterId.length < 0) {
    return { status: 400, message: 'Voter Id required', data: null };
  }

  if (!candidateName || candidateName.length < 0) {
    return { status: 400, message: 'Candidate Name required', data: null };
  }
  if (!electionName || electionName.length < 0) {
    return { status: 400, message: 'Election Name required', data: null };
  }
  const requestModel = {
    voterId,
    candiadteName,
    electionName
  };

  const result = await Fabric.submitTx(username, contract, 'casteVote', [JSON.stringify(requestModel)]);
  if (result.toString().length > 0 && result.toString().indexOf("alredy casted ") >= 0) {

    return {
      status: 409,
      message: result.message
    };


  }

  return {
    status: ((result.toString().length > 0 && result.toString().indexOf('TxId') > 0) ? 201 : 500),
    message: ((result.toString().length == 0) ? result.toString() : result.toString())
  };




});

exports.generateVoterId = (fullName, constituency) => {

  const prefix = constituency.substring(0, 3).toUpperCase();

  const initials = fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();

  return `${prefix}-${initials}-${randomHex}`;
}
exports.voterImageMatch = asyncHandler(async ({ body, file, user }) => {
  console.log("voterImageMatch ==staterd======", body.voterId);
  const uploadedFile = file;     // multer adds this
  const { username, fabricOrg } = user;
  if (!uploadedFile) {
    return { status: 400, message: 'Image required', data: null };
  }
  const base64Image = file.buffer.toString('base64');
  const searchByHashResult = await this.getByImageHash(username, base64Image);


  if (!searchByHashResult.error) {

    const resultVoterId = searchByHashResult.voterId || searchByHashResult.VOTERID;
    console.log(resultVoterId, "======", body.voterId)
    if (body.voterId != resultVoterId) {
      return { status: 404, message: 'Voter Id mismatch for the given image!', data: null };

    }
    console.log("Image hash matched with voterId:", searchByHashResult.voterId || searchByHashResult.VOTERID);
    return {
      status: 200,
      message: "image verified successfully by hash...!",
      data: {
        voterId: searchByHashResult.voterId || searchByHashResult.VOTERID,
        name: searchByHashResult.name || searchByHashResult.NAME,
        address: searchByHashResult.address || searchByHashResult.ADDRESS,
        constituency: searchByHashResult.constituency || searchByHashResult.CONSTITUENCY,
        imageName: searchByHashResult.imageName || searchByHashResult.IMAGENAME
      },

      matchedWith: searchByHashResult.voterId || searchByHashResult.VOTERID

    };


  }
  const voters = await this.getAllData(username);
  const newImageBuffer = file.buffer;
  console.log("===Phash cal=====");
  const pHash = await getPHashFromBuffer(newImageBuffer);
  console.log("===after Phash cal=====");
  for (const v of voters) {
    const oldHash = v.pHash;
    const dist = hammingDistance(oldHash, pHash);
    if (dist < SIMILARITY_THRESHOLD) {
      return {
        status: 200,
        message: "image verified successfully ...!",
        data: {
          voterId: v.voterId,
          name: v.name,
          constituency: v.constituency,
          imageName: v.imageName,
          address: v.address

        },
        matchedWith: v.voterId,
        distance: dist
      };
    }
  }

  return {
    status: 404,
    message: "No match found. Try again with clear image"
  };



});

exports.getByImageHash = asyncHandler(async (username, imageBas64) => {
  console.log("asyncHandler ==staterd getByImageHash");
  const result = await Fabric.evaluateTx(username, contract, 'verifyByImage', [imageBas64]);


  return JSON.parse(result.toString());
});


exports.getAllData = asyncHandler(async (username) => {
  console.log("asyncHandler ==staterd getAllData", username);
  const result = await Fabric.evaluateTx(username, contract, 'QueryAllVoters', []);
  console.log("asyncHandler ==staterd getAlladata", result);
  return JSON.parse(result.toString());
});





exports.voterRegistationService = asyncHandler(async ({ body, file, user }) => {

  console.log(user);
  const { name, address, constituency } = body;
  const voterId = this.generateVoterId(name, constituency);
  const uploadedFile = file;     // multer adds this
  if (!uploadedFile) {
    return { status: 400, message: 'Image required', data: null };
  }
  if (!voterId || voterId.length < 0) {
    return { status: 400, message: 'Voter Id required', data: null };
  }

  if (!name || name.length < 0) {
    return { status: 400, message: 'Name required', data: null };
  }

  if (!constituency || constituency.length < 0) {
    return { status: 400, message: 'Constituency required', data: null };
  }
  const { username, fabricOrg } = user;
  const newImageBuffer = file.buffer;
  console.log("===Phash cal=====");
  const pHash = await getPHashFromBuffer(newImageBuffer);
  console.log("===after Phash cal=====");
  const voters = await this.getAllData(username);
  console.log("length--", voters.length);
  /*for (const v of voters) {
    const oldHash = v.pHash;
    const dist = hammingDistance(oldHash, pHash);
    if (dist < SIMILARITY_THRESHOLD) {
      console.log('Duplicate message');
      return {
        status: 401,
        message: "Duplicate face / image detected",
        matchedWith: v.voterId,
        distance: dist
      };
    }
  }*/
  const base64Image = file.buffer.toString('base64');
  const imageName = file.originalname;
  try {
    const requestModel = {
      voterId,
      name,
      constituency,
      imageName,
      address,
      pHash
    };
    console.log("=== Invoking blockchain function voterRegistationService========= ", JSON.stringify(requestModel), user.username);
    console.log("====================================================");
    const result = await Fabric.submitTx(username, contract, 'registerVoter', [JSON.stringify(requestModel), base64Image]);
    console.log("=== Finished blockchain function voterRegistationService========= ", result);
    if (result.toString().length > 0 && result.toString().indexOf("Error") >= 0 && result.toString().indexOf("already exist") >= 0) {
      return {
        status: 409,
        message: result.message
      };


    }

    const uplofilepathadDir = path.join(uploadDir, voterId + "-" + imageName);

    await sharp(file.buffer)
      .toFile(uplofilepathadDir);

    return {
      status: ((result.toString().length > 0 && result.toString().indexOf('TxId') > 0) ? 201 : 500),
      voterId: voterId,
      data: {
        voterId,
        txid: result.toString()
      },
      message: ((result.toString().length == 0) ? 'Data  saved successfully with TxID' : result.toString())
    };

  } catch (ex) {


    console.log("error", ex, ex.message);

    return {
      status: 500,
      message: 'Error in executing chaincode' + ex.toString()
    };
  }

  return {
    status: 200,
    message: 'No error',
    data: {
      name,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      filename: uploadedFile.originalname,
      // fileBuffer: uploadedFile.buffer (if memory upload)
    }
  };
});
