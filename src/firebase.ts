import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, disableNetwork } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const isDummyConfig = firebaseConfig.projectId === 'remixed-project-id';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, isDummyConfig ? '(default)' : firebaseConfig.firestoreDatabaseId);

if (isDummyConfig) {
  try {
    disableNetwork(db);
  } catch (e) {
    console.error("Failed to disable firestore network", e);
  }
}


