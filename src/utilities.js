import * as poseDetection from '@tensorflow-models/pose-detection';
 const color = "aqua";
 const lineWidth = 2;
 
 export function drawPoint(ctx, y, x, r, color) {
   ctx.beginPath();
   ctx.arc(x, y, r, 0, 2 * Math.PI);
   ctx.fillStyle = color;
   ctx.fill();
 }
 /**
  * Draws a line on a canvas, i.e. a joint
  */
 export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
   ctx.beginPath();
   ctx.moveTo(ax * scale, ay * scale);
   ctx.lineTo(bx * scale, by * scale);
   ctx.lineWidth = lineWidth;
   ctx.strokeStyle = color;
   ctx.stroke();
 }
 
 /**
  * Draws a pose skeleton by looking up all adjacent keypoints/joints
  */
 export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
   const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.MoveNet);
  
    adjacentKeyPoints.forEach(([i,j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      if (score1>=minConfidence && score2>=minConfidence){
        // console.log("adjacentKeyPoints")
        // console.log(keypoints[i],keypoints[j]);
        drawSegment(
        [kp1.y, kp1.x],
        [kp2.y, kp2.x],
          color,
          scale,
          ctx
        );
      }
   });
 }
 
 /**
  * Draw pose keypoints onto a canvas
  */
 export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
   for (let i = 0; i < keypoints.length; i++) {
     const keypoint = keypoints[i];
     
     if (keypoint.score < minConfidence) {
       continue;
     }
     const y= keypoint.y;
     const x= keypoint.x;
    //  console.log(keypoint);
     drawPoint(ctx, y * scale, x * scale, 3, color);
   }
 }

 //  functions to calculate 
function radToDeg(rad) {
  return rad / (Math.PI / 180);
}

export function findAngle(p1,p2,p3){
  const position1= [p1.y,p1.x];
  const position2= [p2.y,p2.x];
  const position3= [p3.y,p3.x];
  let  angle = radToDeg(Math.atan2(position3[0]-position2[0], position3[1]-position2[1]) - 
  Math.atan2(position1[0]-position2[0], position1[1]-position2[1]));
  if (angle < 0){
    angle+=360;
    if (angle>180){
      angle=360-angle;
    }
  }else if (angle>180){
    angle=360-angle;
  }
  return angle;
}

export function findDistance(p1,p2){
  const position1= [p1.y,p1.x];
  const position2= [p2.y,p2.x];
  let xDistance= Math.abs(position1[1]-position2[1]);
  let yDistance= Math.abs(position1[0]-position2[0]);
  return (xDistance, yDistance);
}

//data for pushups
// let shoulder=null;
// let elbow=null;
// let wrist=null;
// let hip=null;
// let knee= null;
// elbow angle - 5,7,9
// shoulder angle- 7,5,11
// hip angle- 5,11,13

//Conditions:
let elbowMin=65
let elbowMax=165
let shoulderMin= 30
let shoulderMax=60
let hipMin= 160

//indicators:
let elbowBool= false
let shoulderBool=false
let hipBool=false

let count = 0
let direction = 0
let form = 0
let feedback = "Begin"

let shoulderAngle=0;
let hipAngle=0;
let elbowAngle=0;

export function drawSkeletonPushUps(keypoints, minConfidence, ctx, scale = 1) {
  let shoulder=null;
  let elbow=null;
  let wrist=null;
  let hip=null;
  let knee= null;

  for (let i = 0; i < keypoints.length; i++) {
    if (keypoints[i].score>=minConfidence){
      switch(keypoints[i].name){
        case("left_shoulder"):
          shoulder= keypoints[i];
          break;
        case("left_elbow"):
          elbow= keypoints[i];
          break;
        case("left_wrist"):
          wrist= keypoints[i];
          break;
        case("left_hip"):
          hip= keypoints[i];
          break;
        case("left_knee"):
          knee= keypoints[i];
          break;
      }
    }
  }
  if (wrist!=null&& elbow!=null &&shoulder!=null){
    drawSegment(
      [wrist.y, wrist.x],
      [elbow.y, elbow.x],
        color,
        scale,
        ctx
      );
    drawSegment(
      [elbow.y, elbow.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    elbowAngle= findAngle(wrist,elbow,shoulder);
    shoulderAngle= findAngle(wrist,elbow,shoulder);
    // console.log("elbow angle is %d, shoulder angle is %d",elbowAngle, shoulderAngle);
  }
  if (shoulder!=null&& hip!=null &&knee!=null){
    drawSegment(
      [hip.y, hip.x],
      [knee.y, knee.x],
        color,
        scale,
        ctx
      );
    drawSegment(
      [hip.y, hip.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    hipAngle= findAngle(shoulder,hip,knee);
    // console.log("hipAngle is %d", hipAngle);
  }
  //Check to ensure right form before starting the program
  if (shoulderAngle<shoulderMax){
    shoulderBool=false;
  }
  else{
    shoulderBool=true;
  }
  if (hipAngle <hipMin){
    hipBool= false;
  }
  else{
    hipBool=true;
  }
  if (elbowAngle<elbowMax){
    elbowBool= false;
  }
  else{
    elbowBool=true;
  }
  if (shoulderBool==true && elbowBool==true && hipBool==true){
    if (form==0){
      form=1;
      feedback = "Start";
    }
  }
  if (shoulder!=null && elbow!=null && wrist!=null && hip!=null && knee!=null){
    if (form == 1){
      if (direction==0){
        feedback = "Down";
        if (shoulderAngle>shoulderMin){
          shoulderBool=false;
        }
        else{
          shoulderBool=true;
        }
        if (hipAngle <hipMin){
          hipBool= false;
        }
        else{
          hipBool=true;
        }
        if (elbowAngle>elbowMin){
          elbowBool= false;
        }
        else{
          elbowBool=true;
        }
        if (shoulderBool==true && elbowBool==true && hipBool==true){
          count += 0.5;
          direction = 1;
        }
      }
      if (direction==1){
        feedback = "Up";
        if (shoulderAngle<shoulderMax){
          shoulderBool=false;
        }
        else{
          shoulderBool=true;
        }
        if (hipAngle<hipMin){
          hipBool= false;
        }
        else{
          hipBool=true;
        }
        if (elbowAngle<elbowMax){
          elbowBool= false;
        }
        else{
          elbowBool=true;
        }
        if (shoulderBool==true && elbowBool==true && hipBool==true){
          count += 0.5;
          direction = 0;
        }
      }
    }
    console.log(elbowAngle,shoulderAngle,hipAngle);
    console.log("feedback is %s", feedback);
    console.log("count is %d", count);
  }
}
  
  
  export function drawSkeletonSitUps(keypoints, minConfidence, ctx, scale = 1) {
  // shoulderBlade angle - 3,5,15 
  // butt angle- 5,11,13
  // knee angle- 11,13,15
  // earcup distance- 3,9
  // touchKnee distance- 7,13
  let ear= null;
  let ankle= null
  let shoulder=null;
  let hip=null;
  let knee= null;
  let elbow=null;
  let wrist=null;
  for (let i = 0; i < keypoints.length; i++) {
    if (keypoints[i].score>=minConfidence){
      switch(keypoints[i].name){
        case("left_ear"):
          ear= keypoints[i];
          break;
        case("left_ankle"):
          ankle= keypoints[i];
          break;
        case("left_shoulder"):
          shoulder= keypoints[i];
          break;
        case("left_elbow"):
          elbow= keypoints[i];
          break;
        case("left_wrist"):
          wrist= keypoints[i];
          break;
        case("left_hip"):
          hip= keypoints[i];
          break;
        case("left_knee"):
          knee= keypoints[i];
          break;
      }
    }
  }
  if (ear!=null && wrist!=null){
    let earCupDistance= findDistance(ear,wrist);
    console.log(earCupDistance);
  }
  if (knee!=null && wrist!=null){
    let touchKneeDistance= findDistance(ear,wrist);
    console.log(touchKneeDistance);
  }
  if (ear!=null && shoulder!=null &&ankle!=null){
    drawSegment(
      [ear.y, ear.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    drawSegment(
      [ankle.y, ankle.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    let shoulderBladeAngle= findAngle(ear,shoulder,ankle);
    console.log(shoulderBladeAngle);
  }
  if (hip!=null&& shoulder!=null &&knee!=null){
    drawSegment(
      [hip.y, hip.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    drawSegment(
      [knee.y, knee.x],
      [shoulder.y, shoulder.x],
        color,
        scale,
        ctx
      );
    let buttAngle= findAngle(shoulder,hip,knee);
    console.log(buttAngle);
  }
  if (hip!=null&& knee!=null &&ankle!=null){
    drawSegment(
      [hip.y, hip.x],
      [knee.y, knee.x],
        color,
        scale,
        ctx
      );
    drawSegment(
      [knee.y, knee.x],
      [ankle.y, ankle.x],
        color,
        scale,
        ctx
      );
    let kneeAngle= findAngle(hip,knee,ankle);
    console.log(kneeAngle);
  }
}
  
  

   
