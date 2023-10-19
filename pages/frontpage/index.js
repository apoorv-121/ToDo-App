// "use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signOut,onAuthStateChanged  } from "firebase/auth";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import "../globals.css";
// import { sendMail } from "../pages/api/mailService/mailService";
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

function MyVerticallyCenteredModal(props) {
  const {
    editTask,
    editDesc,
    seteditDesc,
    seteditTask,
    updateData,
    modalShow,
    setModalShow,
    onHide,
  } = props;
  return (
    <Modal
      show={modalShow}
      onHide={() => setModalShow(false)}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Update Item
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">
              Task
            </label>
            <input
              type="text"
              value={editTask}
              onChange={(e) => {
                seteditTask(e.target.value);
              }}
              class="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
            />
          </div>
          <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label">
              Description
            </label>
            <input
              type="text"
              class="form-control"
              id="exampleInputPassword1"
              value={editDesc}
              onChange={(e) => {
                seteditDesc(e.target.value);
              }}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="submit"
          className="btn  btn-primary text-black"
          onClick={() => {
            updateData();
          }}
        >
          Submit
        </button>
        <Button className="btn btn-danger text-black" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const Home = () => {
  const [task, setTask] = useState("");
  const [desc, setDesc] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [editTask, seteditTask] = useState("");
  const [editDesc, seteditDesc] = useState("");
  const [Objectid, setObjectid] = useState("");
  const [isLoading, setisLoading] = useState(true);
  const loading = (
    <button type="button" class="bg-indigo-500 " disabled>
      <svg class="animate-spin h-5 w-5 mr-3 " viewBox="0 0 24 24"></svg>
      Processing...
    </button>
  );

  const router = useRouter();

  useEffect(() => {
    // console.log("auth- ", auth.currentUser);
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData();
      } else {
        router.push("/");
      }
    });

  }, []);

  const signOutFromGoogle = () => {
    signOut(auth)
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        alert("Signout failed");
      });
  };

  const addData = async () => {
    const uid = auth.currentUser.uid;
    const docRef = doc(db, "todo", "userData");
    const data = await addDoc(collection(db, "todo", "userData", `${uid}`), {
      uid: uid,
      task: task,
      description: desc,
      date: `${Date.now()}`,
    }).then((response) => {
      toast("Task Added Successfully !", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    });
    getData();
  };

  const getData = async () => {
    const uid = auth.currentUser.uid;
    const docRef = doc(db, "todo", "userData");
    const q = query(collection(db, "todo", "userData", `${uid}`));

    const querySnapshot = await getDocs(q);
    let data = [];
    querySnapshot.forEach((doc) => {
      data.push({ ...doc.data(), id: doc.id });
    });

    setTaskList(data);
    setisLoading(false);
  };

  const deleteData = async (ObjectId) => {
    const uid = auth.currentUser.uid;

    await deleteDoc(doc(db, "todo", "userData", `${uid}`, ObjectId)).then(
      (response) => {
        toast.success("Item Deleted  !", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    );
    getData();
  };

  const updateData = async () => {
    const uid = auth.currentUser.uid;
    let obj;
    taskList.forEach((data) => {
      if (data.id === Objectid) {
        obj = { ...data };
      }
    });

    if (editTask !== "") {
      obj.task = editTask;
    }
    if (editDesc !== "") {
      obj.description = editDesc;
    }
    obj.date = Date.now();
    const cityRef = doc(db, "todo", "userData", `${uid}`, Objectid);
    setDoc(cityRef, obj, { merge: true });

    setObjectid("");
    seteditDesc("");
    seteditTask("");
    setModalShow(false);
    toast("Item Updated !", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    getData();
  };

  const submitHandler = (e) => {
    e.preventDefault();
    addData();
    setTaskList([...taskList, { task, desc }]);
    setTask("");
    setDesc("");
  };

  const deleteHandler = (id) => {
    deleteData(id);
  };

  const exportToMail = () => {
    const email = auth.currentUser.email;
    const message1 = `
    <table style="width:100% ; border: 1px solid white;border-collapse: collapse;">
      <thead>
        <tr>
          <th>Task</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${taskList
          .map(
            (task) => `
          <tr>
            <td>${task.task}</td>
            <td>${task.description}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
    const message2 = `<h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Task List</h2>
<ul style="list-style: none; padding: 0; margin: 0;">
  ${taskList
    .map(
      (task) => `
    <li style="border: 1px solid #ccc; border-radius: 4px; padding: 16px; margin-bottom: 16px;">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${task.task}</h3>
      <p style="font-size: 16px; margin-bottom: 0;">${task.desc}</p>
    </li>
  `
    )
    .join("")}
    </ul>`;

    const message3 = `
    <head>
    <style>
    table, th, td {
      border: 1px solid white;
      border-collapse: collapse;
    }
    th, td {
      background-color: #96D4D4;
    }
    </style>
    </head>
    <body>
    <table>
    <thead>
    <tr>
    <th>S.No</th>
      <th>Task</th>
      <th>Description</th>

    </tr>
  </thead>
  <tbody>
    ${taskList
      .map(
        (task, index) => `
      <tr>
      <td>${index + 1}</td>
        <td>${task.task}</td>
        <td>${task.description}</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
  </table>
  </body>`;

    axios
      .post("/api/sendMail", {
        subject: "Your's Todo List",
        toEmail: email,
        message: message3,
      })
      .then((response) => {
        toast("Email Sent Successfully !", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  };
  let renderTask = <h2 className="font-semibold">No task available</h2>;

  if (taskList.length > 0) {
    renderTask = taskList.map((task, index) => {
      return (
        <>
          <li
            key={task.id}
            className="flex items-center justify-between px-2 py-2 m-2 mb-4"
          >
            <div className=" flex justify-between w-2/3">
              <h2 className="text-3xl font-semibold">{`${index + 1})`}</h2>
              <h3 className="text-2xl w-2/5 font-semibold">{task.task}</h3>
              <p className="text-xl w-2/5">{task.description}</p>
            </div>
            <div>
              <button
                onClick={() => {
                  deleteHandler(task.id);
                }}
                className="bg-red-400 text-white rounded m-2 px-4 py-2 font-bold "
              >
                Delete
              </button>

              <Button
                onClick={() => {
                  setObjectid(task.id);
                  setModalShow(true);
                }}
                className="bg-indigo-500  rounded m-2 px-4 py-2 font-bold "
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >
                Edit
              </Button>
              {/* <Modal-----------------------------------------------------------------------------------> */}
              <MyVerticallyCenteredModal
                modalShow={modalShow}
                setModalShow={setModalShow}
                onHide={() => setModalShow(false)}
                editTask={editTask}
                editDesc={editDesc}
                updateData={updateData}
                seteditTask={seteditTask}
                seteditDesc={seteditDesc}
              />
              {/* <-----------------------------------------------------------------------------------> */}
            </div>
          </li>
        </>
      );
    });
  }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
          crossOrigin="anonymous"
        />
      </Head>
      <div>
        <h1 className="bg-dark text-slate-300 text-center p-4 text-4xl font-bold">
          {auth.currentUser &&`${auth.currentUser.displayName} Todo List`}
        </h1>
        <div className="row">
          <div className="col col-lg-2">
          <div>
            <button
              className="bg-rose-800 text-white m-5 px-2 py-2 font-bold border-4 float-right"
              onClick={exportToMail}
            >
              Export To Mail
            </button>
          </div>
          </div>
          <div className="col">
          <center>
            <form onSubmit={submitHandler}>
              <input
                type="text"
                required
                className="border-4 border-black rounded-lg px-2 py-2 m-6"
                placeholder="Enter your task"
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                }}
              />
              <input
                type="text"
                required
                className="border-4 border-black rounded-lg px-4 py-2 m-6"
                placeholder="Enter Description here"
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
              />
              <button className="bg-sky-700	 text-white m-5 px-4 py-2 font-bold border-4">
                Add Task
              </button>
            </form>
          </center>
          </div>
          <div className="col col-lg-2">
          <div>
            <button
              className="bg-teal-600 text-white m-5 px-2 py-2 font-bold border-4 float-right"
              onClick={signOutFromGoogle}
            >
              SignOut
            </button>
        </div>
          </div>
        </div>
        <div>          
        </div>
        <hr />
        {/* { loading} */}
        <div className=" p-2 m-2  bg-slate-200 }">{renderTask}</div>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
      <footer className=" bg-dark p-2 text-center w-full  font-bold ">
        <p className="text-slate-300">
          Made with{" "}
          <span role="img" aria-label="heart">
            ❤
          </span>{" "}
          by Apoorv Jha
        </p>
      </footer>
    </>
  );
};

export default Home;
