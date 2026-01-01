

(function(){
  // === بررسی و گرفتن المان‌ها ===
  const u = document.querySelector(".mainSVG");
  const cSparkle = document.querySelector(".sparkle");
  const pContainer = document.querySelector(".pContainer");

  if(!u || !cSparkle || !pContainer){
    console.error("mainSVG، pContainer یا sparkle پیدا نشد!");
    return;
  }

  const star = document.querySelector("#star");
  const circ = document.querySelector("#circ");
  const cross = document.querySelector("#cross");
  const heart = document.querySelector("#heart");
  const tree = document.querySelector("#tree");

  // === رنگ‌ها و ذرات ===
  const colors = "#E8F6F8 #ACE8F8 #F6FBFE #A2CBDC #B74551 #5DBA72 #910B28 #910B28 #446D39".split(" ");
  const particleTypes = [star,circ,cross,heart].filter(Boolean); // فقط المان‌های موجود
  const particles = [];
  let particleIndex = 0;
  let animationEnabled = true;

  // === تابع random scale ===
  const m = gsap.utils.random(.5, 3, 0.001, true);

  // === تابع flicker ===
  function flicker(p){
    if(!p) return;
    gsap.killTweensOf(p,{opacity:true});
    gsap.fromTo(p,{opacity:1},{duration:0.07,opacity:Math.random(),repeat:-1});
  }

  // === animate particle ===
  function animateParticle(){
    if(!animationEnabled || particles.length===0) return;
    const p = particles[particleIndex];
    if(!p) return;

    gsap.set(p,{
      x: gsap.getProperty(".pContainer","x"),
      y: gsap.getProperty(".pContainer","y"),
      scale: m()
    });

    gsap.timeline()
      .to(p,{
        duration: gsap.utils.random(.61,6),
        physics2D:{
          velocity: gsap.utils.random(-23,23),
          angle: gsap.utils.random(-180,180),
          gravity: gsap.utils.random(-6,50)
        },
        scale: 0,
        rotation: gsap.utils.random(-123,360),
        ease:"power1",
        onStart: flicker,
        onStartParams:[p],
        onRepeat:function(){ gsap.set(p,{scale:m()}) },
        repeat:-1
      });

    particleIndex++;
    if(particleIndex>=201) particleIndex=0;
  }

  // === MorphSVGPlugin convert ===
  if(window.MorphSVGPlugin){
    MorphSVGPlugin.convertToPath("polygon");
  }

  // === ساخت ذرات ===
  for(let i=0; i<201; i++){
    const base = particleTypes[i % particleTypes.length];
    if(!base) continue;
    const clone = base.cloneNode(true);
    u.appendChild(clone);
    clone.setAttribute("fill", colors[i % colors.length]);
    clone.setAttribute("class","particle");
    gsap.set(clone,{x:-100,y:-100,transformOrigin:"50% 50%"});
    particles.push(clone);
  }

  // === timeline اصلی ذرات و sparkle ===
  const kTimeline = gsap.timeline({onUpdate: animateParticle});

  if(document.querySelector(".treePath") && document.querySelector(".treeBottomPath")){
    const treePathPoints = MotionPathPlugin.getRawPath(".treePath")[0];
    const treeBottomPoints = MotionPathPlugin.getRawPath(".treeBottomPath")[0];

    kTimeline
      .to(".pContainer, .sparkle",{
        duration:6,
        motionPath:{path:".treePath",autoRotate:false},
        ease:"linear"
      })
      .to(".pContainer, .sparkle",{
        duration:1,
        onStart:function(){ animationEnabled=false; },
        x: treeBottomPoints[0],
        y: treeBottomPoints[1]
      })
      .to(".pContainer, .sparkle",{
        duration:2,
        onStart:function(){ animationEnabled=true; },
        motionPath:{path:".treeBottomPath",autoRotate:false},
        ease:"linear"
      },"-=0")
      .from(".treeBottomMask",{duration:2,drawSVG:"0% 0%",stroke:"#FFF",ease:"linear"},"-=2");
  }

  // === timeline اصلی درخت ===
  const mainTimeline = gsap.timeline({delay:0,repeat:0});
  mainTimeline.eventCallback("onComplete", playMusicAfterAnimation);
  if(document.querySelector(".treePathMask") && document.querySelector(".treePotMask")){
    mainTimeline.from([".treePathMask",".treePotMask"],{
      drawSVG:"0% 0%",
      stroke:"#FFF",
      stagger:{each:6},
      duration: gsap.utils.wrap([6,1,2]),
      ease:"linear"
    });
  }

  if(document.querySelector(".treeStar")){
    mainTimeline.from(".treeStar",{
      duration:3,
      scaleY:0,
      scaleX:.15,
      transformOrigin:"50% 50%",
      ease:"elastic(1,0.5)"
    },"-=4");
  }

  mainTimeline.to(".sparkle",{
    duration:3,
    opacity:0,
    ease:"rough({strength:2, points:100, template:linear, taper:both, randomize:true, clamp:false})"
  },"-=0");

  if(document.querySelector(".treeStarOutline")){
    mainTimeline.to(".treeStarOutline",{
      duration:1,
      opacity:1,
      ease:"rough({strength:2, points:16, template:linear, taper:none, randomize:true, clamp:false})"
    },"+=1");
  }

  mainTimeline.add(kTimeline,0);
  gsap.globalTimeline.timeScale(1.5);

  const endMsg = document.querySelector("#endMessage");
  if(endMsg){
    kTimeline.vars.onComplete = function(){
      gsap.to(endMsg,{opacity:1});
    }
  }

})();

///////////فانکشن موزیک//////

function playMusicAfterAnimation() {
  const music = document.getElementById("bgMusic");
  if (music) {
    music.play().catch(() => {});
  }
}


function enableMusicOnUserGesture(music){
  const resume = () => {
    music.play();
    document.removeEventListener("click", resume);
    document.removeEventListener("touchstart", resume);
  };

  document.addEventListener("click", resume, { once:true });
  document.addEventListener("touchstart", resume, { once:true });
}


const unlock = document.getElementById("audioUnlock");
const music = document.getElementById("bgMusic");

if (unlock && music) {
  unlock.addEventListener("click", () => {
    music.play();
    unlock.remove();
  }, { once:true });
}



