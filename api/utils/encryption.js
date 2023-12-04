const crypto = require("crypto");

const encrypt = (id, iv) => {
  const key = Buffer.from(process.env.CRYPTO_KEY, "base64");
  const bufferIV = Buffer.from(iv, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, bufferIV);
  let encrypted = cipher.update(id.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (id, iv) => {
  const key = Buffer.from(process.env.CRYPTO_KEY, "base64");
  const bufferIV = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, bufferIV);
  let decrypted = decipher.update(id, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
