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
  let euclideanDistance= Math.sqrt(xDistance*xDistance+yDistance*yDistance);
  return euclideanDistance;
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
let shoulderMin= 50
let shoulderMax=60
let hipMin= 160

//indicators:
let count = 0
let direction = 0
let form = 0
let feedback = "Begin"
let specificFeedbackPU= {
  elbow: false,
  shoulder:false,
  hip:false
};

let shoulderAngle=0;
let hipAngle=0;
let elbowAngle=0;

let shoulder=null;
let elbow=null;
let wrist=null;
let hip=null;
let knee= null;
let ear= null;
let ankle= null

export function drawSkeletonPushUps(keypoints, minConfidence, ctx, scale = 1) {
  shoulder= keypoints[5].score>minConfidence?keypoints[5]:null;
  elbow= keypoints[7].score>minConfidence?keypoints[7]:null;
  wrist= keypoints[9].score>minConfidence?keypoints[9]:null;
  hip= keypoints[11].score>minConfidence?keypoints[11]:null;
  knee= keypoints[13].score>minConfidence?keypoints[13]:null;
  if (wrist && elbow && shoulder){
    drawSegment([wrist.y, wrist.x],[elbow.y, elbow.x],color,scale,ctx);
    drawSegment([elbow.y, elbow.x],[shoulder.y, shoulder.x],color,scale,ctx);
    elbowAngle= findAngle(wrist,elbow,shoulder);
  }
  if (shoulder && hip && elbow ){
    shoulderAngle= findAngle(elbow,shoulder,hip);
  }
  if (shoulder && hip && knee){
    drawSegment([hip.y, hip.x],[knee.y, knee.x],color,scale,ctx);
    drawSegment([hip.y, hip.x],[shoulder.y, shoulder.x],color,scale,ctx);
    hipAngle= findAngle(shoulder,hip,knee);
  }
  //Check to ensure right form before starting the program
  if (form==0){
    specificFeedbackPU.shoulder= shoulderAngle<shoulderMax?false:true;
    specificFeedbackPU.hip= hipAngle<hipMin?false:true;
    specificFeedbackPU.elbow= elbowAngle<elbowMax?false:true;
    if (specificFeedbackPU.shoulder && specificFeedbackPU.elbow && specificFeedbackPU.hip){
        form=1;
        feedback = "Start";
      }
    }
  if (shoulder && elbow && wrist && hip && knee){
    if (form == 1){
      if (direction==0){
        feedback = "Down";
        specificFeedbackPU.shoulder= shoulderAngle>shoulderMin?false:true;
        specificFeedbackPU.hip= hipAngle<hipMin?false:true;
        specificFeedbackPU.elbow= elbowAngle>elbowMin?false:true;
        if (specificFeedbackPU.shoulder && specificFeedbackPU.elbow && specificFeedbackPU.hip){
          count += 0.5;
          direction = 1;
        }
      }
      if (direction==1){
        feedback = "Up";
        specificFeedbackPU.shoulder= shoulderAngle<shoulderMax?false:true;
        specificFeedbackPU.hip= hipAngle<hipMin?false:true;
        specificFeedbackPU.elbow= elbowAngle<elbowMax?false:true;
        if (specificFeedbackPU.shoulder && specificFeedbackPU.elbow && specificFeedbackPU.hip){
          count += 0.5;
          direction = 0;
        }
      }
    }
  }
  console.log(elbowAngle,shoulderAngle,hipAngle);
  console.log("feedback is %s", feedback);
  console.log("elbow is %s, Shoulder is %s and hip is %s", specificFeedbackPU.elbow, specificFeedbackPU.shoulder, specificFeedbackPU.hip);
  console.log("count is %d", count);
  return [count, feedback, specificFeedbackPU];
}


//Data for situps
// shoulderBlade angle - 3,5,15 
// butt angle- 5,11,13
// knee angle- 11,13,15
// earcup distance- 3,9
// touchKnee distance- 7,13
form=0;
// Conditions:
let shoulderBladeMin= 150
let buttStart=165
let buttEnd= 80
let kneeMin= 120
let earCupMin= 50 //need to recalibrate as using euclidean distance
let touchKneeMin=40 //need to recalibrate as using euclidean distance

let specificFeedbackSU= {
  cupEars: false,//throughout
  butt: false, //throughout
  kneePosition: false,//throughout
  touchKnees: false,///;going up
  flattenShoulder:false //going down
};
let earCupDistance=10000;
let touchKneeDistance=1000;
let shoulderBladeAngle=null;
let buttAngle=null;
let kneeAngle=null;

  export function drawSkeletonSitUps(keypoints, minConfidence, ctx, scale = 1) {
  shoulder= keypoints[5].score>minConfidence?keypoints[5]:null;
  elbow= keypoints[7].score>minConfidence?keypoints[7]:null;
  wrist= keypoints[9].score>minConfidence?keypoints[9]:null;
  hip= keypoints[11].score>minConfidence?keypoints[11]:null;
  knee= keypoints[13].score>minConfidence?keypoints[13]:null;
  ear= keypoints[3].score>minConfidence?keypoints[3]:null;
  ankle= keypoints[15].score>minConfidence?keypoints[15]:null;
  
  if (ear && wrist){
    earCupDistance= findDistance(ear,wrist);
  }
  if (knee && wrist){
    touchKneeDistance= findDistance(ear,wrist);
  }
  if (ear && shoulder && ankle){
    drawSegment([ear.y, ear.x],[shoulder.y, shoulder.x],color,scale,ctx);
    drawSegment([ankle.y, ankle.x],[shoulder.y, shoulder.x],color,scale,ctx);
    shoulderBladeAngle= findAngle(ear,shoulder,ankle);
  }
  if (hip && shoulder && ankle){
    drawSegment([hip.y, hip.x],[shoulder.y, shoulder.x],color,scale,ctx);
    buttAngle= findAngle(shoulder,hip,ankle);
  }
  if (hip && knee && ankle){
    drawSegment([hip.y, hip.x],[knee.y, knee.x],color,scale,ctx);
    drawSegment([knee.y, knee.x],[ankle.y, ankle.x],color,scale,ctx);
    kneeAngle= findAngle(hip,knee,ankle);
  }
  //Check to ensure right form before starting the program
  if (form==0){
    specificFeedbackSU.flattenShoulder= shoulderBladeAngle<shoulderBladeMin?false:true;
    specificFeedbackSU.butt= buttAngle<buttStart?false:true;
    specificFeedbackSU.cupEars= earCupDistance>earCupMin?false:true;
    specificFeedbackSU.kneePosition= kneeAngle<kneeMin?false:true;
    if (specificFeedbackSU.flattenShoulder && specificFeedbackSU.butt && specificFeedbackSU.cupEars && specificFeedbackSU.kneePosition){
      form=1;
      feedback= "Start";
    }
  }
  if (shoulder && elbow && wrist && hip && knee && ankle){
    if (form ==1){
      if (direction==0){
        feedback= "Up";
        specificFeedbackSU.butt= buttAngle>buttEnd?false:true;
        specificFeedbackSU.cupEars= earCupDistance>earCupMin?false:true;
        specificFeedbackSU.touchKnees= touchKneeDistance>touchKneeMin?false:true;
        if (specificFeedbackSU.butt && specificFeedbackSU.cupEars && specificFeedbackSU.touchKnees){
          count += 0.5
          direction = 1
        }
      }
      if (direction==1){
        feedback= "Down";
        specificFeedbackSU.cupEars= earCupDistance>earCupMin?false:true;
        specificFeedbackSU.flattenShoulder= shoulderBladeAngle<shoulderBladeMin?false:true;
        specificFeedbackSU.butt= buttAngle<buttStart?false:true;
        specificFeedbackSU.kneePosition= kneeAngle>kneeMin?false:true;
        if (specificFeedbackSU.cupEars && specificFeedbackSU.flattenShoulder && specificFeedbackSU.butt && specificFeedbackSU.kneePosition){
          count += 0.5;
          direction = 0;
        }
      }
    }
  }
  console.log(earCupDistance,touchKneeDistance,shoulderBladeAngle, buttAngle, kneeAngle);
  console.log("feedback is %s", feedback);
  console.log("cupEars is %s, butt is %s, kneePosition is %s, touchKnees is %s and flattenShoulder is %s", specificFeedbackSU.cupEars, specificFeedbackSU.butt, specificFeedbackSU.kneePosition,specificFeedbackSU.touchKnees,specificFeedbackSU.flattenShoulder);
  console.log("count is %d", count);
  return [count, feedback, specificFeedbackSU];
}

   
