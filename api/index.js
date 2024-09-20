const baseURL = "https://quiz-backend.infotrek24.tech";
let api;
export default api = {
  login: `${baseURL}/api/users/login`,
  signup: `${baseURL}/api/users/signup`,
  forgotPassword: `${baseURL}/api/users/forgotPassword`,
  passwordReset: `${baseURL}/api/users/resetPassword`,
  quizzesURL: `${baseURL}/api/quiz`,
  myQuizzesURL: `${baseURL}/api/quiz/my-quizzes`,
  createQuiz: `${baseURL}/api/quiz`,
  listQuestions: `${baseURL}/api/question/list`,
  questions: `${baseURL}/api/question`,
  options: `${baseURL}/api/options/all`,
  option: `${baseURL}/api/options`,
  answer: `${baseURL}/api/answer`,
}
