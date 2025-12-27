/**
 * Firebase Admin initialization helper
 * File: src/config/firebaseAdmin.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;

const resolveServiceAccountPath = (p) => {
  if (!p) return null;

  const candidates = [];

  if (path.isAbsolute(p)) {
    candidates.push(p);
  } else {
    // 1) Resolve relative to current working directory (common for local dev).
    candidates.push(path.resolve(process.cwd(), p));
    // 2) Resolve relative to server root (more robust for process managers / different cwd).
    const serverRoot = path.resolve(__dirname, '../..');
    candidates.push(path.resolve(serverRoot, p));
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch (_) {
      // ignore
    }
  }

  return candidates[0] || null;
};

const initFirebaseAdmin = () => {
  if (initialized) return;
  if (admin.apps?.length) {
    initialized = true;
    return;
  }

  const serviceAccountPath = resolveServiceAccountPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (serviceAccountPath) {
    try {
      const raw = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
      return;
    } catch (err) {
      const error = new Error(
        `Gagal memuat Firebase service account JSON dari path: ${serviceAccountPath}. ${err?.message || ''}`.trim()
      );
      error.statusCode = 500;
      throw error;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n')
    : null;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      initialized = true;
      return;
    } catch (err) {
      const error = new Error('Gagal menginisialisasi Firebase Admin dari env credentials.');
      error.statusCode = 500;
      throw error;
    }
  }

  const error = new Error(
    'Firebase Admin belum dikonfigurasi. Set FIREBASE_SERVICE_ACCOUNT_PATH atau FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
  );
  error.statusCode = 500;
  throw error;
};

const verifyFirebaseIdToken = async (idToken) => {
  initFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
};

module.exports = {
  verifyFirebaseIdToken
};
