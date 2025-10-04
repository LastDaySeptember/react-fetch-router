import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PageNotFound.module.css";
import imgNotFound from "../assets/404.svg";

export const PageNotFound = () => {
  const navigate = useNavigate();
  function returnToMain() {
    navigate("/");
  }

  return (
    <>
      <Button onClick={returnToMain} className={styles.backButton}>
        {" "}
        Back to main page
      </Button>
      <h1 className={styles.headline}>Page does not exist</h1>

      <div>
        <img alt="page not found" src={imgNotFound}></img>
      </div>
    </>
  );
};
