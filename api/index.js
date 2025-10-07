// const baseURL = "https://quiz-backend.infotrek24.tech";
const baseURL = "http://localhost:8000";
let api;
export default api = {
  "baseURL": baseURL,
  login: `${baseURL}/api/users/login`,
  signup: `${baseURL}/api/users/signup`,
  forgotPassword: `${baseURL}/api/users/forgotPassword`,
  passwordReset: `${baseURL}/api/users/resetPassword`,
  quizzesURL: `${baseURL}/api/quiz`,
  myQuizzesURL: `${baseURL}/api/quiz/my-quizzes`,
  createQuiz: `${baseURL}/api/quiz`,
  listQuestions: `${baseURL}/api/question/list`,
  listOptions: `${baseURL}/api/options/all`,
  questions: `${baseURL}/api/question`,
  options: `${baseURL}/api/options/all`,
  option: `${baseURL}/api/options`,
  answer: `${baseURL}/api/answer`,
  response: `${baseURL}/api/response`,
  result: `${baseURL}/api/result`,
  join_game: `${baseURL}/api/game/join-req`,
  pending_req: `${baseURL}/api/game/pending-request`,
  accept_join_req: `${baseURL}/api/admin/admit-user`,
  reject_join_req: `${baseURL}/api/admin/reject-user`,
  join_request_sent: `${baseURL}/api/game/join-req-sent`,
  start_quiz: `${baseURL}/api/game/start-quiz`,
}
