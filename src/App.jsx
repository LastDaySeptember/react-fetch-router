import { useState, useEffect, useRef } from "react";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Routes, Route, Link, useParams } from "react-router-dom";
import styles from "./App.module.css";

// const taskListURL = "https://jsonplaceholder.typicode.com/todos";
//json-server --watch db.json
// http://localhost:3000
const taskListURL = "http://localhost:3000/tasks";

// components
const TaskLayout = () => {};

const pageNotFound = () => {
  return (
    <>
      <h3>Page does not exist</h3>
      <div>
        <img alt="page not found" src="./assets/404.svg"></img>
      </div>
    </>
  );
};

const AppLayout = () => {
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [isUpdating, setIsUpdating] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSorted, setIsSorted] = useState(false);
  const [isRefreshedTasks, setIsRefreshedTasks] = useState();

  let taskListBase = useRef();

  // utils
  function refreshTasks() {
    setIsRefreshedTasks(!isRefreshedTasks);
  }

  function getId(event) {
    const taskContainer = event.target.closest("li");
    const id = taskContainer.dataset.id;
    console.log("id", id);
    return id;
  }

  function getNewInput(event) {
    const taskContainer = event.target.closest(`.${styles.taskContainer}`);
    const initialValue = taskContainer.querySelector("span").textContent;
    const userValue = prompt("Add updated input: ", initialValue);
    return userValue;
  }

  // working with tasks

  // on INPUT change
  const onInputChange = (event) => {
    const newValue = event.target.value;
    setAddValue(newValue);
  };

  // add task
  const addTask = () => {
    if (addValue.length == 0) {
      alert("Add valid task");
      return false;
    }
    setIsAdding(true);

    fetch(taskListURL, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        title: addValue,
        completed: false,
      }),
    })
      .then((rawResponse) => rawResponse.json())
      .then((resData) =>
        console.log(`Added ${addValue} on server with response: ${resData}`)
      )
      .catch((error) => console.log(error))
      .finally(() => {
        setIsAdding(false);
        refreshTasks();
        setAddValue("");
      });
  };

  // update task
  const updateTask = (event) => {
    setIsUpdating(true);

    const userValue = getNewInput(event);
    const id = getId(event);
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

  // SORTINTG
  function sortingTasks(taskArray) {
    const sorted = [...taskArray].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    console.log(sorted);
    return sorted;
  }

  const sortTasks = () => {
    if (isSorted) {
      setTaskList(taskListBase.current);
      setIsSorted(false);
    } else {
      const sorted = sortingTasks(taskList);
      setTaskList(sorted);
      setIsSorted(true);
    }
  };

  // searching
  const searchTask = (value) => {
    value = value.trim().toLowerCase();
    console.log("value", value);

    const filteredTaskList = taskList.filter((task) => {
      let title = task.title.trim().toLowerCase();
      return title.includes(value);
    });
    return filteredTaskList;
  };

  const onInputSearchChange = (event) => {
    if (event.target.value.length == 0) {
      refreshTasks();
    }
    const newValue = event.target.value;
    setSearchValue(newValue);
    console.log("newValue", newValue);
    const filteredTaskList = searchTask(newValue);
    setTaskList(filteredTaskList);
  };

  // REMOVE
  const removeTask = (event) => {
    setIsRemoving(true);
    const id = getId(event);
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
      });
  };
  //
  // fetch data
  useEffect(() => {
    setIsLoading(true);

    fetch(taskListURL)
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        setTaskList(resData);
        taskListBase.current = resData;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isRefreshedTasks]);

  return (
    <div className={styles.container}>
      <h1>Tasks</h1>

      {isLoading && <div className={styles.loader}></div>}

      {!isLoading && (
        <>
          <div className={styles.inputField}>
            <Input
              name="add"
              placeholder="Add task"
              onChange={onInputChange}
              value={addValue}
            />
            <Button onClick={addTask} disabled={isAdding}>
              Add
            </Button>
          </div>
          <div className={styles.inputField}>
            <Input
              name="search"
              placeholder="Search task"
              onChange={onInputSearchChange}
              value={searchValue}
            />
          </div>
          <div className={styles.sortingBtnContainer}>
            {!isSorted && (
              <Button className={styles.sortingBtn} onClick={sortTasks}>
                Sort ABC
              </Button>
            )}
            {isSorted && (
              <Button className={styles.sortingBtn} onClick={sortTasks}>
                Sort Base
              </Button>
            )}
          </div>
          <ul className={styles.taskList}>
            {taskList.map(({ id, title, completed }) => {
              return (
                <li key={id} data-id={id}>
                  <div
                    className={`${styles.taskContainer} ${
                      completed
                        ? styles.completedTaskItem
                        : styles.unCompletedTaskItem
                    }`}
                  >
                    <div className={styles.taskItem}>
                      <span>{title}</span>
                    </div>

                    <div className={styles.buttonsContainer}>
                      <Button id={id} onClick={updateTask}>
                        Update
                      </Button>
                      <Button id={id} onClick={removeTask}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

// FUNCTION APP
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}></Route>
        <Route path="/task/:id" element={<TaskLayout />}></Route>
        <Route path="*" element={<pageNotFound />}></Route>
      </Routes>
    </>
  );
}

export default App;
