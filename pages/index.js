"use client";
import React from "react";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import "./globals.css";
import Head from "next/head";
import styles from "../styles/Home.module.css";
// import Footer from "next/footer"
function page() {
  const router = useRouter();

  const SignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);

        console.log(result);
        router.push("/frontpage");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        alert(`${errorMessage}`);
        // ...
      });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
          crossOrigin="anonymous"
        />
      </Head>
      <main>
      <div className="row outer  align-items-center text-center d-flex  justify-content-center ">
        <div className="inner text-white py-3">
          <div className="py-5 my-5">
            <span className="text-7xl">Welcome to Todo List</span>
          </div>

          <div className="py-4">
            <span className="text-3xl">
              Turn Dreams into Reality, One Task at a Time
            </span>
          </div>
          <div>
            <button
              type="button"
              className="bg-red-600 text-black rounded-full m-5 px-4 py-2 font-bold border-4 w-64"
              onClick={SignInWithGoogle}
            >
              {/* <FontAwesomeIcon
                icon="fa-brands fa-google-plus"
                style={{ color: "#ce3322" }}
              /> */}
              &nbsp; SignIn with google
            </button>
          </div>
          <div className="py-4 px-4">
            <span className="text-2xl">
              Are you ready to take control of your life and achieve your goals?
              Our to-do list project is designed to be your guiding light,
              helping you stay organized, motivated, and successful. Say goodbye
              to procrastination and hello to a more accomplished you!
            </span>
          </div>
        </div>
      </div>
      <div>
      </div>
      </main>
      <footer className=" p-2 text-center w-full text-light font-semibold tracking-tighter ">
       <p className="text-gray-500">
         Made with{" "}
         <span role="img" aria-label="heart">
           ❤
         </span>{" "}
         by Apoorv Jha
       </p></footer>
      
      
    </div>
  );
}

export default page;
