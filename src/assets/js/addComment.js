import axios from "axios";

const addCommentForm = document.getElementById("jsAddComment");
const commentList = document.getElementById("jsCommentList");
const commentNumber = document.getElementById("jsCommentNumber");
const delbtn = document.querySelectorAll("#delBtn");

const sendComment = async comment => {
  let userName = "";
  const videoId = window.location.href.split("/videos/")[1];
  const response = await axios({
    url: `/api/${videoId}/comment`,
    method: "POST",
    data: {
      comment
    }
  });
  if (response.status === 200) {
    const getUserName = async () => {
      const response = await fetch(`/api/${videoId}/comment`);
      if (response.ok) {
        userName = await response.json();
      }
      let name = userName.name;
      addComment(comment, name);
    };
    getUserName();
  }
};

const deleteCom = e => {
  e.preventDefault();
  const commentId = e.target.getAttribute("name");
  console.log(e.target);
  const deleteComment = async comment => {
    const videoId = window.location.href.split("/videos/")[1];
    const response = await axios({
      url: `/api/${videoId}/delcoment`,
      method: "PUT",
      data: {
        commentId
      }
    });
    const reload = await location.reload();
  };
  deleteComment();
};

const increaseNumber = () => {
  commentNumber.innerHTML = parseInt(commentNumber.innerHTML, 10) + 1;
};

const addComment = (comment, userName) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  const button = document.createElement("button");
  button.innerHTML = "삭제";
  const span = document.createElement("span");
  const name = document.createElement("span");
  span.innerHTML = comment;
  name.innerHTML = userName;
  div.appendChild(name);
  div.appendChild(span);
  li.appendChild(div);
  li.appendChild(button);
  commentList.prepend(li);

  increaseNumber();
  const reload = location.reload();
};

const handleSubmit = event => {
  event.preventDefault();
  const commentInput = addCommentForm.querySelector("input");
  const comment = commentInput.value;
  sendComment(comment);
  commentInput.value = "";
};

const init = () => {
  addCommentForm.addEventListener("submit", handleSubmit);
  delbtn.forEach(element => {
    element.addEventListener("click", deleteCom);
  });
};

if (addCommentForm) {
  init();
}
