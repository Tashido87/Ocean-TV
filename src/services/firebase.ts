/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDckv7mb4qxmX19icwv4qRpcWGHy_BM3RE",
  authDomain: "ironmetrics-7f2b5.firebaseapp.com",
  projectId: "ironmetrics-7f2b5",
  storageBucket: "ironmetrics-7f2b5.firebasestorage.app",
  messagingSenderId: "62580635476",
  appId: "1:62580635476:web:de741964e28b625b067ac1"
};

const app = initializeApp(firebaseConfig);
const databaseId = "ai-studio-oceantv-bc4b048e-7912-426d-a18e-f7e61a83b3cb";

export const firestore = getFirestore(app, databaseId);
