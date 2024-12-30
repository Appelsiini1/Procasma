import crypto from "crypto";
import { StorageKey } from "../constants";
import { CGEncryptLogin, CodeGradeLogin } from "../types";
import log from "electron-log/node";
import fs from "fs";
import { getCacheDir } from "./osOperations";
import path from "path";
import os from "os";

// Original source: https://stackoverflow.com/questions/49021171/how-to-derive-iv-and-key-to-crypto-createcipheriv-for-decryption

const ALGORITHM_NAME = "aes-256-gcm";
const ALGORITHM_NONCE_SIZE = 12;
const ALGORITHM_TAG_SIZE = 16;
const ALGORITHM_KEY_SIZE = 32;
const PBKDF2_NAME = "sha256";
const PBKDF2_SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 32767;

export function encryptString(plaintext: string) {
  // Generate a 128-bit salt using a CSPRNG.
  let salt = crypto.randomBytes(PBKDF2_SALT_SIZE);

  const keyHash = getKeyHash();
  // Derive a key using PBKDF2.
  let key = crypto.pbkdf2Sync(
    keyHash,
    salt,
    PBKDF2_ITERATIONS,
    ALGORITHM_KEY_SIZE,
    PBKDF2_NAME
  );

  // Encrypt and prepend salt.
  let ciphertextAndNonceAndSalt = Buffer.concat([
    salt,
    encrypt(Buffer.from(plaintext, "utf8"), key),
  ]);

  // Return as base64 string.
  return ciphertextAndNonceAndSalt.toString("base64");
}

export function decryptString(
  base64CiphertextAndNonceAndSalt: string
): string | null {
  try {
    // Decode the base64.
    let ciphertextAndNonceAndSalt = Buffer.from(
      base64CiphertextAndNonceAndSalt,
      "base64"
    );

    // Create buffers of salt and ciphertextAndNonce.
    let salt = ciphertextAndNonceAndSalt.subarray(0, PBKDF2_SALT_SIZE);
    let ciphertextAndNonce =
      ciphertextAndNonceAndSalt.subarray(PBKDF2_SALT_SIZE);

    const keyBytes = getKeyHash();
    // Derive the key using PBKDF2.
    let key = crypto.pbkdf2Sync(
      keyBytes,
      salt,
      PBKDF2_ITERATIONS,
      ALGORITHM_KEY_SIZE,
      PBKDF2_NAME
    );

    // Decrypt and return result.
    return decrypt(ciphertextAndNonce, key).toString("utf8");
  } catch (err) {
    log.error("Error in decryptString():");
    log.error(err.message);
    return null;
  }
}

function encrypt(plaintext: string | Buffer, key: Buffer) {
  // Generate a 96-bit nonce using a CSPRNG.
  let nonce = crypto.randomBytes(ALGORITHM_NONCE_SIZE);

  // Create the cipher instance.
  let cipher = crypto.createCipheriv(ALGORITHM_NAME, key, nonce);

  // Encrypt and prepend nonce.
  let ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);
}

function decrypt(ciphertextAndNonce: Buffer, key: Buffer) {
  // Create buffers of nonce, ciphertext and tag.
  let nonce = ciphertextAndNonce.subarray(0, ALGORITHM_NONCE_SIZE);
  let ciphertext = ciphertextAndNonce.subarray(
    ALGORITHM_NONCE_SIZE,
    ciphertextAndNonce.length - ALGORITHM_TAG_SIZE
  );
  let tag = ciphertextAndNonce.subarray(
    ciphertext.length + ALGORITHM_NONCE_SIZE
  );

  // Create the cipher instance.
  let cipher = crypto.createDecipheriv(ALGORITHM_NAME, key, nonce);

  // Decrypt and return result.
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(ciphertext), cipher.final()]);
}

function getKeyHash() {
  const keyHash = crypto
    .createHash("sha256")
    .update(String(StorageKey))
    .digest("base64");
  const key_in_bytes = Buffer.from(keyHash, "base64");
  return key_in_bytes;
}

export function saveCredentials(loginDetails: CodeGradeLogin) {
  const currentUser = os.userInfo().username;

  try {
    const cacheDir = getCacheDir();
    const filePath = path.join(cacheDir, "credentials");
    if (!fs.existsSync(filePath)) {
      const encryptedData = encryptString(
        JSON.stringify([{ OSUser: currentUser, ...loginDetails }])
      );
      fs.writeFileSync(filePath, encryptedData, "base64");
      return "ok";
    } else {
      const existingData = fs.readFileSync(filePath, "base64");
      const decryptedData: CGEncryptLogin[] = JSON.parse(
        decryptString(existingData)
      );
      const otherUsers = [];
      for (const dataObject of decryptedData) {
        if (currentUser !== dataObject.OSUser) {
          otherUsers.push(dataObject);
        }
      }
      otherUsers.push({ OSUser: currentUser, ...loginDetails });
      const encryptedData = encryptString(JSON.stringify(otherUsers));
      fs.writeFileSync(filePath, encryptedData, "base64");
      return "ok";
    }
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}

export function getCredentials() {
  let data: string;
  const currentUser = os.userInfo().username;
  try {
    const filePath = path.join(getCacheDir(), "credentials");
    if (!fs.existsSync(filePath)) {
      return null;
    }
    data = fs.readFileSync(filePath, "base64");
    //log.debug(data);

    const decryptedData: CGEncryptLogin[] = JSON.parse(decryptString(data));
    for (const dataObject of decryptedData) {
      if (currentUser === dataObject.OSUser) {
        const loginDetails: CodeGradeLogin = {
          username: dataObject.username,
          password: dataObject.password,
          hostname: dataObject.hostname,
          tenantId: dataObject.tenantId,
        };
        return loginDetails;
      }
    }
    return null;
  } catch (err) {
    log.error("Error in getCredentials(): ");
    log.error(err.message);
    throw err;
  }
}

export function checkCredentialExistance() {
  const credentialResult = getCredentials();
  if (credentialResult) {
    return true;
  }
  return false;
}
