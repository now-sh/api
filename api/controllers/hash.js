const crypto = require('crypto');


const SUPPORTED_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512'];

/**
 * Hash text with various algorithms
 */
const hashText = (text, algorithm = 'sha256') => {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm.toLowerCase())) {
    throw new Error(`Unsupported algorithm. Supported: ${SUPPORTED_ALGORITHMS.join(', ')}`);
  }
  
  const hash = crypto.createHash(algorithm.toLowerCase());
  hash.update(text);
  const hashValue = hash.digest('hex');
  
  return {
    algorithm: algorithm.toLowerCase(),
    hash: hashValue,
    input: text,
    length: hashValue.length
  };
};

/**
 * Get supported algorithms
 */
const getSupportedAlgorithms = () => {
  return SUPPORTED_ALGORITHMS;
};

module.exports = {
  hashText,
  getSupportedAlgorithms
};