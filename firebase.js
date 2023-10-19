// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const obj = {
  apiKey: "AIzaSyAVecnV4S9IxkFI9SJOKhkpYqgMZgcOG08",
  authDomain: "to-do-app-8bef7.firebaseapp.com",
  projectId: "to-do-app-8bef7",
  storageBucket: "to-do-app-8bef7.appspot.com",
  messagingSenderId: "243961557448",
  appId: "1:243961557448:web:df4b569e7672bc9ac550fd",
  measurementId: "G-361V687N80",
};
// firebase.initializeApp(firebaseConfig, 'myCustomAppName');
export const app = initializeApp(obj);
export const auth = getAuth(app);
// export const storage = getStorage(App);
export const db = getFirestore(app);