
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Robust Firebase Admin initializer.
 * Supports env styles:
 * 1) FIREBASE_SERVICE_ACCOUNT (JSON string or base64 JSON)
 * 2) Individual vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (with \n)
 * 3) Multi-line PRIVATE KEY pasted directly (works on some hosts)
 */
import { readFileSync } from 'node:fs';
function readServiceAccount(){
  const filePath = process.env.FIREBASE_CREDENTIALS_FILE;
  if (filePath) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed as any;
    } catch (e) {
      console.error('Failed to read FIREBASE_CREDENTIALS_FILE:', e);
    }
  }
  const jsonOrB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonOrB64) {
    try {
      const raw = jsonOrB64.trim().startsWith('{')
        ? jsonOrB64
        : Buffer.from(jsonOrB64, 'base64').toString('utf8');
      const parsed = JSON.parse(raw);
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed as any;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  // Strip surrounding quotes if accidentally added
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  // Convert escaped newlines \n -> 

  privateKey = privateKey.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey } as any;
  }
  throw new Error('Missing Firebase credentials. Provide FIREBASE_SERVICE_ACCOUNT or individual FIREBASE_* envs.');
}

let app: App;
if (!getApps().length) {
  const sa = readServiceAccount();
  app = initializeApp({
    credential: cert({
      projectId: (sa.project_id || sa.projectId),
      clientEmail: sa.client_email || sa.clientEmail,
      privateKey: sa.private_key || sa.privateKey,
    } as any),
  });
} else {
  app = getApps()[0]!;
}

export const db = getFirestore(app);
