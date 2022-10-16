import React, { useRef}  from 'react'
import './index.css'
import * as poseDetection from '@tensorflow-models/pose-detection';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeletonPushUps, drawSkeletonSitUps } from "./utilities";

/*
  TODO
  - the reset button doesnt reset the counter (there will be 2 counters created)
  - unable to switch the mode midway through (for now need to select mode before starting)
  - process specific feedback onto the screen (refer to utilities for the format)
  - beautifying the layout
*/

const minConfidence= 0.5
const timeLimit= 10000;
function App(){
    const [score, setScore]= React.useState(0);
    const [feedback, setFeedback]= React.useState("begin");
    const [pushups, setPushups]= React.useState(true);
    const [start, setStart]=React.useState(false);
    const [timer, setTimer] = React.useState('00');

    const Ref = useRef(null);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    
    const getTimeRemaining = (e) => {
      const total = Date.parse(e) - Date.parse(new Date());
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / 1000 / 60 / 60) % 24);
      return {
          total, hours, minutes, seconds
      };
    }
    const startTimer = (e) => {
      let { total, hours, minutes, seconds } 
                  = getTimeRemaining(e);
      if (total >= 0) {
          setTimer(
              (seconds > 9 ? seconds : '0' + seconds)
          )
      }
    }
    const clearTimer = (e) => {
      setTimer(timeLimit);
      // If you try to remove this line the 
      // updating of timer Variable will be
      // after 1000ms or 1sec
      if (Ref.current) clearInterval(Ref.current);
      const id = setInterval(() => {
          startTimer(e);
      }, 1000)
      Ref.current = id;
    }

    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + timeLimit);
        return deadline;
    }
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

      if (timer>0){
        let result= pushups?drawSkeletonPushUps(pose["keypoints"], minConfidence, ctx): drawSkeletonSitUps(pose["keypoints"], minConfidence, ctx); 
        //let result= drawSkeletonSitUps(pose["keypoints"], minConfidence, ctx); 
        setScore(Math.floor(result[0]));
        setFeedback(result[1]);
        console.log("started");
        //TODO: process specific feedback
      }else{
        console.log("ended");
        return(
          <div className="App">
            <h1>STOP</h1>
          </div> //why doesnt this break it :<
        )
      }
    }
    runMovenet();
    return (
        <div className="App">
        <h1> THANK YOU react founder MARC CHERN DI YONG </h1>
        <img src={require("./assets/gift.png")} alt=" "/>
        <button onClick={()=>setPushups(!pushups)}>Change</button>
        <h1>Mode: {pushups?"Pushups":"Situps"}</h1>
        <h1>Score: {score}</h1>
        <button onClick={()=>{
          clearTimer(getDeadTime())
          setStart(!start)
        }}>Start/Reset</button>
        <h2>{timer>0?"start":"end"}</h2>
        <h2>{timer}</h2>
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