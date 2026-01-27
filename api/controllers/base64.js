
/**
 * Base64 encode text
 */
const encode = (text) => {
  const encoded = Buffer.from(text).toString('base64');
  return {
    input: text,
    result: encoded,
    length: {
      input: text.length,
      output: encoded.length
    }
  };
};

/**
 * Base64 decode text
 */
const decode = (text) => {
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    return {
      input: text,
      result: decoded,
      length: {
        input: text.length,
        output: decoded.length
      }
    };
  } catch (_error) {
    throw new Error('Invalid base64 string');
  }
};

module.exports = {
  encode,
  decode
};