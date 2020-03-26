import express from "express";
import routes from "../routes";
import {
  postRegisterView,
  postAddComment,
  getAddComment,
  postDeleteComment
} from "../controllers/videoController";
import { onlyPrivate } from "../middlewares";

const apiRouter = express.Router();

apiRouter.post(routes.registerView, postRegisterView);
apiRouter.post(routes.addComment, onlyPrivate, postAddComment);
apiRouter.put(routes.deleteComment, onlyPrivate, postDeleteComment);
apiRouter.get(routes.addComment, getAddComment);

export default apiRouter;
