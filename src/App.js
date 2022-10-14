import React, { useRef }  from 'react'
import './index.css'
import * as poseDetection from '@tensorflow-models/pose-detection';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeletonPushUps, drawSkeletonSitUps } from "./utilities";

/*
  TODO
  - timer function- use it to change state of start
  - start and change button quite wonky
  - process specific feedback onto the screen (refer to utilities for the format)
  - situp model tuning
*/

const minConfidence= 0.5
const timeLimit= 60;
function App(){
    const [score, setScore]= React.useState(0);
    const [feedback, setFeedback]= React.useState("begin");
    const [pushups, setPushups]= React.useState(true);
    const [timer, setTimer]=React.useState(0); 
    const [start, setStart]=React.useState(false);

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const runMovenet= async()=>{
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        setInterval(() => {
          detect(detector);
        }, 100);
    }
    const detect= async(detector)=>{
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
          ) {
            const video = webcamRef.current.video;
            if (video !==null){
                const videoWidth = webcamRef.current.video.videoWidth;
                const videoHeight = webcamRef.current.video.videoHeight;
                webcamRef.current.video.width = videoWidth;
                webcamRef.current.video.height = videoHeight;
                const poses = await detector.estimatePoses(video);
                const pose= poses[0];
                if (pose !==null){
                    drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
                }
            }
          }
        }
    const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
      const ctx = canvas.current.getContext("2d");
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;
      drawKeypoints(pose["keypoints"], minConfidence, ctx);

      if (start){
        let result= pushups?drawSkeletonPushUps(pose["keypoints"], minConfidence, ctx): drawSkeletonSitUps(pose["keypoints"], minConfidence, ctx); 
        setScore(Math.floor(result[0]));
        setFeedback(result[1]);
        //TODO: process specific feedback
      }else{
        return(
          <div className="App">STOP </div> //why doesnt this break it :<
        )
      }
    }
    runMovenet();
    return (
      <div className="App">
        <h1> THANK YOU react founder MARC CHERN DI YONG </h1>
        <img src={require("./assets/gift.png")} alt=" "/>
        <button onClick={()=>setStart(!start)}>Start</button>
        <h1>Status: {start?"Start":"Stop"}</h1>
        <button onClick={()=>setPushups(!pushups)}>Change</button>
        <h1>Mode: {pushups?"Pushups":"Situps"}</h1>
        <h1>Score: {score}</h1>
        <h1>feedback: {feedback}</h1>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </div>
    )
  }
export default App;