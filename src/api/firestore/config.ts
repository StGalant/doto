import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAAwEEeLam8M-bcgIQm_gV5L_2k2bQYuUg',
  authDomain: 'doto-afa16.firebaseapp.com',
  projectId: 'doto-afa16',
  storageBucket: 'doto-afa16.appspot.com',
  messagingSenderId: '829415098203',
  appId: '1:829415098203:web:84d6ee0d98e03b9b6e7c7e',
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
export { db, auth }
