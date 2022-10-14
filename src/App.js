import React, { useRef }  from 'react'
import './index.css'

import * as poseDetection from '@tensorflow-models/pose-detection';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";


function App(){
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    
  
    const runMovenet= async()=>{
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        // detect(detector);
        console.log("running");
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
                const pose= poses[0]
                console.log(pose["keypoints"]);
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
  
      drawKeypoints(pose["keypoints"], 0.3, ctx);
      drawSkeleton(pose["keypoints"], 0.6, ctx);
    }
    runMovenet();
    
    return (
      <div className="App">
        <h1>Hello, React!</h1>
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