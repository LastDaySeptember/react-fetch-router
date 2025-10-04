import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { PageNotFound } from "./PageNotFound";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./TaskLayout.module.css";

const taskListURL = "http://localhost:3000/tasks";

export const TaskLayout = () => {
  const [title, setTitle] = useState(null);
  const [isCompleted, setIsCompleted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponseNull, setIsResponseNull] = useState(false);

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshedTasks, setIsRefreshedTasks] = useState();

  const params = useParams();
  const id = params.id;

  function returnToMain() {
    navigate(-1);
  }

  function getNewInput() {
    const userValue = prompt("Add updated input: ", title);
    return userValue;
  }

  const removeTask = () => {
    setIsRemoving(true);
    const taskListURLToDelete = taskListURL + "/" + id;
    fetch(taskListURLToDelete, {
      method: "DELETE",
    })
      .then((rawResponse) => rawResponse.json())
      .then((resData) =>
        console.log(`Removed ${id} on server with response: ${resData}`)
      )
      .catch((error) => console.log(error))
      .finally(() => {
        setIsRemoving(false);
        refreshTasks();
        navigate("/");
      });
  };

  const updateTask = () => {
    setIsUpdating(true);
    const userValue = getNewInput();
    const taskListURLToUpdate = taskListURL + "/" + id;
    console.log("taskListURLToUpdate", taskListURLToUpdate);

    if (userValue === null) {
      alert("Add valid task");
      return false;
    }

    fetch(taskListURLToUpdate, {
      method: "PUT",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        title: userValue,
        completed: false,
      }),
    })
      .then((rawResponse) => rawResponse.json())
      .then((resData) =>
        console.log(`Updated ${userValue} on server with response: ${resData}`)
      )
      .catch((error) => console.log(error))
      .finally(() => {
        setIsUpdating(false);
        refreshTasks();
      });
  };

  // utils
  function refreshTasks() {
    setIsRefreshedTasks(!isRefreshedTasks);
  }

  async function getTaskById(id, url) {
    const taskUrl = url + "/" + id;
    // console.log("Task url", taskUrl);
    setIsLoading(true);
    try {
      const response = await fetch(taskUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });
      if (!response.ok) {
        throw new Error("Response error");
      }
      const data = await response.json();
      const { title, isCompleted } = data;
      setTitle(title);
      setIsCompleted(isCompleted);

      return null;
    } catch (error) {
      console.log(error);
      setIsResponseNull(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    getTaskById(id, taskListURL);
  }, [id, isRefreshedTasks]);

  if (isResponseNull) {
    return <PageNotFound />;
  }

  return (
    <>
      {isLoading && <div className={styles.loader}></div>}
      {!isLoading && (
        <div className={styles.container}>
          <Button onClick={returnToMain} className={styles.backButton}>
            {" "}
            Back to main page
          </Button>
          <h1 className={styles.headline}>Task page</h1>
          <div>
            <div className={styles.buttonContainer}>
              <Button id={id} onClick={updateTask} disabled={isUpdating}>
                Update
              </Button>
              <Button id={id} onClick={removeTask} disabled={isRemoving}>
                Delete
              </Button>
            </div>

            <div
              className={`${styles.titleText} ${isCompleted ? styles.completeTask : styles.incompleteTask}`}
            >
              {title}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
