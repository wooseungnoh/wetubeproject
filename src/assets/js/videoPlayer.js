import getBlobDuration from "get-blob-duration";

const videoContainer = document.getElementById("jsVideoPlayer");
const videoPlayer = document.querySelector("#jsVideoPlayer video");
const videoController = document.querySelector(".videoPlayer__controls");
const playBtn = document.getElementById("jsPlayButton");
const volumeBtn = document.getElementById("volumeRange");
const fullScrnBtn = document.getElementById("jsFullScreen");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("jsVolume");
const playGauge = document.querySelector(".playGauge");
const now = document.querySelector(".now");

const registerView = () => {
  const videoId = window.location.href.split("/videos/")[1];
  fetch(`/api/${videoId}/view`, {
    method: "POST"
  });
};

const formatDate = seconds => {
  const secondsNumber = parseInt(seconds, 10);
  let hours = Math.floor(secondsNumber / 3600);
  let minutes = Math.floor((secondsNumber - hours * 3600) / 60);
  let totalSeconds = secondsNumber - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    totalSeconds = `0${totalSeconds}`;
  }
  return `${hours}:${minutes}:${totalSeconds}`;
};

function getCurrentTime() {
  currentTime.innerHTML = formatDate(Math.floor(videoPlayer.currentTime));
  movePlayGauge();
}

async function setTotalTime() {
  const blob = await fetch(videoPlayer.src).then(response => response.blob());
  const duration = await getBlobDuration(blob);
  const totalTimeString = formatDate(duration);
  totalTime.innerHTML = totalTimeString;
  setInterval(getCurrentTime, 1000);
}

const movePlayGauge = () => {
  const thisTime = (videoPlayer.currentTime / videoPlayer.duration) * 100;
  now.style.width = `${thisTime}%`;
};

let counter = 0,
  state = false,
  leave = false;

function handlePlayClick() {
  if (videoPlayer.paused) {
    videoPlayer.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    videoPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function handleVolumeClick() {
  if (videoPlayer.muted) {
    videoPlayer.muted = false;
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    volumeRange.value = videoPlayer.volume;
  } else {
    volumeRange.value = 0;
    videoPlayer.muted = true;
    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
}

function handleDrag(event) {
  const {
    target: { value }
  } = event;
  videoPlayer.volume = value;
  if (value >= 0.6) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  } else if (value >= 0.2) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
  } else {
    volumeBtn.innerHTML = '<i class="fas fa-volume-off"></i>';
  }
}

const showController = () => {
  state = false;
  videoController.classList.add("active");

  const setCounter = setInterval(() => {
    if (counter > 2 && leave === false) {
      hideController();
      clearInterval(setCounter);
      counter = 0;
    }
    counter++;
  }, 1000);

  if (leave === true) {
    leave = false;
    counter = 0;
    clearInterval(setCounter);
  }
};

const hideController = () => {
  if (state === false && counter > 2) {
    videoController.classList.remove("active");
    videoContainer.style.cursor = "none";
    state = true;
  } else {
    videoController.classList.remove("active");
  }
};

const resetTimer = () => {
  if (state === false) {
    counter = 0;
  } else {
    showController();
  }
};

const changePlayTime = e => {
  const clicklocation = e.offsetX;
  const gaugeTotalW = playGauge.offsetWidth;
  const totalPlayTime = videoPlayer.duration;
  const clickPercent = (clicklocation / gaugeTotalW) * 100;

  const clickSecond = (totalPlayTime / 100) * clickPercent;

  videoPlayer.currentTime = clickSecond;
};

function exitFullScreen() {
  fullScrnBtn.innerHTML = '<i class="fas fa-expand"></i>';
  fullScrnBtn.addEventListener("click", goFullScreen);
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function goFullScreen() {
  if (videoContainer.requestFullscreen) {
    videoContainer.requestFullscreen();
  } else if (videoContainer.mozRequestFullScreen) {
    videoContainer.mozRequestFullScreen();
  } else if (videoContainer.webkitRequestFullscreen) {
    videoContainer.webkitRequestFullscreen();
  } else if (videoContainer.msRequestFullscreen) {
    videoContainer.msRequestFullscreen();
  }
  fullScrnBtn.innerHTML = '<i class="fas fa-compress"></i>';
  fullScrnBtn.removeEventListener("click", goFullScreen);
  fullScrnBtn.addEventListener("click", exitFullScreen);
}

function handleEnded() {
  registerView();
  videoPlayer.currentTime = 0;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function init() {
  videoPlayer.volume = 0.5;
  volumeRange.addEventListener("input", handleDrag);
  fullScrnBtn.addEventListener("click", goFullScreen);
  playBtn.addEventListener("click", handlePlayClick);
  volumeBtn.addEventListener("click", handleVolumeClick);
  videoPlayer.addEventListener("loadedmetadata", setTotalTime);
  videoPlayer.addEventListener("ended", handleEnded);
  playGauge.addEventListener("click", event => {
    changePlayTime(event);
  });
  videoContainer.addEventListener("mouseenter", () => {
    showController();
  });
  videoContainer.addEventListener("mousemove", () => {
    videoContainer.style.cursor = "";
    resetTimer();
  });
  videoContainer.addEventListener("mouseleave", () => {
    leave = true;
    videoController.classList.remove("active");
  });

  document.addEventListener("keydown", e => {
    if (e.keyCode === 32) {
      handlePlayBtn();
    }
  });
}

if (videoContainer) {
  init();
}
