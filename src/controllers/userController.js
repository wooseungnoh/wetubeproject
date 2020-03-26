import passport from "passport";
import routes from "../routes";
import User from "../models/User";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res, next) => {
  const {
    body: { name, email, password, password2 }
  } = req;

  if (password !== password2) {
    req.flash("error", "입력한 비밀번호가 서로 다릅니다.");
    res.status(400);
    res.render("join", { pageTitle: "Join" });
  } else {
    try {
      const user = await User({
        name,
        email
      });
      await User.register(user, password);
      next();
    } catch (error) {
      console.log(error);
      res.redirect(routes.home);
    }
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Log In" });

export const postLogin = passport.authenticate("local", {
  failureRedirect: routes.login,
  successRedirect: routes.home,
  successFlash: "환영합니다!",
  failureFlash: "아이디 혹은 비밀번호를 다시 확인해 주세요"
});

export const githubLogin = passport.authenticate("github", {
  successFlash: "환영합니다!(깃허브 로그인)",
  failureFlash: "로그인 할 수 없습니다."
});

export const githubLoginCallback = async (_, __, profile, cb) => {
  const {
    _json: { id, avatar_url: avatarUrl, name, email }
  } = profile;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      email,
      name,
      githubId: id,
      avatarUrl
    });

    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};

export const postGithubLogin = (req, res) => {
  console.log(req.user);
  res.redirect(routes.home);
};

export const logout = (req, res) => {
  req.flash("info", "로그아웃 되셨습니다.");
  req.logout();
  res.redirect(routes.home);
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("videos");
    res.render("userDetail", { pageTitle: "User Detail", user });
  } catch (error) {
    res.redirect(routes.home);
  }
};
export const userDetail = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const user = await User.findById(id).populate("videos");
    console.log(user);
    res.render("userDetail", { pageTitle: "User Detail", user });
  } catch (error) {
    req.flash("error", "유저를 찾을 수 없습니다.");
    res.redirect(routes.home);
  }
};
export const getEditProfile = (req, res) =>
  res.render("editProfile", { pageTitle: "Edit Profile" });

export const postEditProfile = async (req, res) => {
  const {
    body: { name, email },
    file
  } = req;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
      avatarUrl: file ? file.location : req.user.avatarUrl
    });
    req.flash("success", "프로필이 성공적으로 업데이트 되었습니다.");
    res.redirect(routes.me);
  } catch (error) {
    req.flash("error", "프로필을 업데이트 할 수 없습니다.");
    res.redirect(routes.editProfile);
  }
};

export const getChangePassword = (req, res) =>
  res.render("changePassword", { pageTitle: "Change Password" });

export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPassword1 }
  } = req;

  try {
    if (newPassword !== newPassword1) {
      req.flash("error", "입력한 비밀번호가 서로 다릅니다.");
      res.status(400);
      res.redirect(`/users/${routes.changePassword}`);
      return;
    } else {
      req.flash("success", "비밀번호를 변경했습니다!");
      await req.user.changePassword(oldPassword, newPassword);
      res.redirect(routes.me);
    }
  } catch (error) {
    req.flash("error", "비밀번호를 변경할 수 없습니다.");
    res.status(400);
    res.redirect(`/users/${routes.changePassword}`);
  }
};
