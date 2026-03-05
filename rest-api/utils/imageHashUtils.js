const { imageHash } = require('image-hash');

function getPHashFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    imageHash({ data: buffer }, 16, true, (err, hash) => {
      if (err) reject(err);
      else resolve(hash); // hex string
    });
  });
}

function hexToBinary(hex) {
  return hex
    .split('')
    .map(c => parseInt(c, 16).toString(2).padStart(4, '0'))
    .join('');
}

function hammingDistance(hash1, hash2) {
  const b1 = hexToBinary(hash1);
  const b2 = hexToBinary(hash2);

  let dist = 0;
  for (let i = 0; i < b1.length; i++) {
    if (b1[i] !== b2[i]) dist++;
  }
  return dist;
}

module.exports = { getPHashFromBuffer, hammingDistance };
