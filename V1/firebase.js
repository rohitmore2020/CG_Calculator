
import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyDze_LHcWIYGNsH5zGC4uCG19R0kHTwKKI",

  authDomain: "cgcalculator-efc3b.firebaseapp.com",

  projectId: "cgcalculator-efc3b",

  storageBucket: "cgcalculator-efc3b.firebasestorage.app",

  messagingSenderId: "1087047054897",

  appId: "1:1087047054897:web:1624e42f04c3d2208b8710"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
    db,
    auth,
    provider,
    signInWithPopup,
    onAuthStateChanged
};