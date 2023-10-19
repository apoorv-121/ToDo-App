// "use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { sendMail } from "../pages/api/mailService/mailService";
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
  return (
    <Modal
      {...props}
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
              value={props.editTask}
              onChange={(e) => {
                props.seteditTask(e.target.value);
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
              value={props.editDesc}
              onChange={(e) => {
                props.seteditDesc(e.target.value);
              }}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => {
            props.updateData();
          }}
        >
          Submit
        </button>
        <Button onClick={props.onHide}>Close</Button>
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

  // console.log(auth);
  // const uid = auth.currentUser.uid;
  const router = useRouter();

  useEffect(() => {
    console.log("auth- ", auth);
    if (
      Object.is(auth.currentUser, null) ||
      Object.is(auth.currentUser, undefined)
    ) {
      router.push("/");
    }
    getData();
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
    console.log("uid - ", uid);
    const docRef = doc(db, "todo", "userData");
    const data = await addDoc(collection(db, "todo", "userData", `${uid}`), {
      uid: uid,
      task: task,
      description: desc,
      date: `${Date.now()}`,
    });
    getData();
  };

  const getData = async () => {
    const uid = auth.currentUser.uid;
    const docRef = doc(db, "todo", "userData");
    const q = query(collection(db, "todo", "userData", `${uid}`));

    const querySnapshot = await getDocs(q);
    // console.log(docSnap);
    let data = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      data.push({ ...doc.data(), id: doc.id });
      // console.log(doc.id, " => ", doc.data());
    });
    console.log(data);
    data.sort((a, b) => {
      return a.date < b.date;
    });
    setTaskList(data);
  };

  const deleteData = async (ObjectId) => {
    const uid = auth.currentUser.uid;

    await deleteDoc(doc(db, "todo", "userData", `${uid}`, ObjectId));
    getData();
  };

  const updateData = async () => {
    const uid = auth.currentUser.uid;
    console.log(Objectid);
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
    getData();
  };

  const submitHandler = (e) => {
    e.preventDefault();
    addData();
    // console.log(task, desc);
    setTaskList([...taskList, { task, desc }]);
    setTask("");
    setDesc("");
  };

  const deleteHandler = (id) => {
    deleteData(id);
    // let copyTask = [...taskList];
    // copyTask.splice(index, 1);
    // setTaskList(copyTask);
  };

  let renderTask = <h2 className="font-semibold">No task available</h2>;

  if (taskList.length > 0) {
    renderTask = taskList.map((task) => {
      return (
        <>
          <li
            key={task.id}
            className="flex items-center justify-between px-2 py-2 m-2 mb-4"
          >
            <div className=" flex justify-between w-2/3">
              <h3 className="text-2xl font-semibold">{task.task}</h3>
              <p className="text-xl">{task.description}</p>
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
                className="bg-red-400 text-white rounded m-2 px-4 py-2 font-bold "
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >
                Edit
              </Button>
              {/* <Modal-----------------------------------------------------------------------------------> */}
              <MyVerticallyCenteredModal
                show={modalShow}
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
      <h1 className="bg-black text-white text-center p-5 text-5xl font-bold">
        {`${auth.currentUser.displayName} Todo List`}
      </h1>
      <button
        className="bg-black text-white m-5 px-4 py-2 font-bold border-4 float-right"
        onClick={signOutFromGoogle}
      >
        SignOut
      </button>
      <button
        className="bg-black text-white m-5 px-4 py-2 font-bold border-4 float-right"
        onClick={signOutFromGoogle}
      >
        Export To Mail
      </button>
      <center>
        <form onSubmit={submitHandler}>
          <input
            type="text"
            required
            className="border-4 border-black rounded-lg px-4 py-2 m-6"
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
          <button className="bg-black text-white m-5 px-4 py-2 font-bold border-4">
            Add Task
          </button>
        </form>
      </center>
      <hr />
      <div className=" p-2 m-2  bg-slate-200">{renderTask}</div>
    </>
  );
};

export default Home;
