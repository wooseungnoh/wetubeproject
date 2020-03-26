const recorderContainer = document.getElementById("jsRecordContainer");
const recordBtn = document.getElementById("jsRecordBtn");
const videoPreview = document.getElementById("jsVideoPreview");

let streamObject;
let videoRecorder;

const handleVideoData = event => {
  const { data: videoFile } = event; //데이터를 가져옴 blob
  const link = document.createElement("a");
  link.href = URL.createObjectURL(videoFile);
  link.download = "recorded.webm";
  document.body.appendChild(link);
  link.click(); //다운로드하게 만드는 과정.
};

const stopRecording = () => {
  videoRecorder.stop(); //레코딩을 멈춤
  recordBtn.removeEventListener("click", stopRecording);
  recordBtn.addEventListener("click", getVideo); // 다시녹화
  recordBtn.innerHTML = "Start recording";
  videoPreview.pause(); //프리뷰 멈춤
  videoPreview.srcObject = null;
};

const startRecording = () => {
  videoRecorder = new MediaRecorder(streamObject); //레코딩 영상을 만듦 조건은 스트림 중인 오브젝트가 있어야함.
  videoRecorder.start(); //레코딩 시작
  videoRecorder.addEventListener("dataavailable", handleVideoData); //레코딩이 멈추면 handleVideoData 실행(레코딩이 멈춰야만 데이터가 넘어옴. 초당 으로 받고싶으면 start(1000) 이런식으로 쓸수있슴.)
  recordBtn.addEventListener("click", stopRecording); //레코딩을 멈춤
};

const getVideo = async () => {
  //사용자의 권한 승인을 기다리기위한 어씽크
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      //스트림 영상을 가져옴.
      audio: true,
      video: { width: 1280, height: 720 } //true 로 쓸수도, 레코딩 비디오의 해상도를 지정할수도 있슴.
    });
    console.log(stream);
    videoPreview.srcObject = stream; //src 를 가지고있지 않기때문에 srcObject로 레코딩영상을 프리뷰에 넣음
    videoPreview.muted = true;
    videoPreview.play(); //자동으로 재생
    recordBtn.innerHTML = "Stop Recording";
    streamObject = stream;
    console.log(streamObject);

    startRecording(); //1. 레코딩을 시작합니다.
  } catch (error) {
    recordBtn.innerHTML = "☹️ Cant record"; //만약 권한승인이 떨어지지 않아서 에러가 발생하면 이부분 실행
  } finally {
    recordBtn.removeEventListener("click", getVideo); //try or catch 하나라도 끝나면 이벤트리스너 삭제.
  }
};

function init() {
  recordBtn.addEventListener("click", getVideo);
}

if (recorderContainer) {
  init();
}
