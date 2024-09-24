<template>
  <html>
  <div v-if="notEligible" class="not-eligible">
    <div class="text">
      <p>Either This Quiz doesn't exist,</p>
      <p>Or You're not allowed to participate on it</p>
    </div>
  </div>
  <!--  TOP Bar-->
  <div class="container" v-if="!notEligible && question_list.length > 0" id="main-container">
    <div class="top_bar">
      <div class="score">
        Correct Answers:
        {{ score }}
        <br>
        Wrong Answers:
        {{ incorrect }}

      </div>
      <div class="timer">
        <div>
          <h2>
            {{ timer }}
          </h2>
        </div>

      </div>
      <div class="submission">

        <v-btn
          variant="outlined"
          color="#ff0000"
          @mousedown="end_in_between"
        >
          END QUIZ
          <v-tooltip
            activator="parent"
            location="bottom"
          >Click Twice to End the Quiz
          </v-tooltip>
        </v-btn>

      </div>
    </div>
    <!--    Main section-->
    <div class="main_section">
      <div class="left_section">
        <div class="question">
          {{ active_question.question_text }}
        </div>

        <img :src="active_question.question_image" alt="Question Image"></img>
      </div>
      <div class="right_section">
        <div class="options">
          <!--          <p>Selected Button: {{ selected_answer }}</p>-->

          <v-radio-group v-model="selected_answer" color="secondary">
            <p>Select One Answer</p>
            <v-container class="options-container">
              <div class="option-list " v-for="option in active_options" :key="option.id" :id="option.id">
                <v-radio :label="option.option_text" :value="option.id"></v-radio>
              </div>
            </v-container>
          </v-radio-group>
        </div>

        <div class="next-question">
          <v-btn
            variant="flat"
            color="green"
            class="btn-submit"
            :disabled="selected_answer==='' || answer_submitted"
            @mousedown="submitAnswer"
          >Answer
          </v-btn>
          <v-btn
            variant="flat"
            :color="btn_color"
            class="btn-next"
            :disabled="!answer_submitted"
            @mousedown="nextQuestion"
          >{{ btn_text }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
  </html>

</template>

<script setup>

import {onMounted, ref} from "vue";
import axios from "axios";
import apiRoute from "../../api";

import {useRoute, useRouter} from "vue-router"

const router = useRouter();
const routes = useRoute();
const timer = ref("");

const notEligible = ref(false);

const quiz_id = routes.params.id;
const selected_answer = ref("");
const question_list = ref({});
const total_questions = ref(0);
const score = ref(0);
const incorrect = ref(0);
const active_index = ref(0);
const active_question = ref({});
const active_options = ref({})
const end_clicked = ref(0);
const btn_text = ref("next");
const btn_color = ref("secondary");
const answer_submitted = ref(false);
const current_time = ref(1);
const ending_time = ref(1);


function getTimeDifference(timestamp1, timestamp2) {
  // Convert the timestamps to Date objects
  const date1 = new Date(parseInt(timestamp1));
  const date2 = new Date(parseInt(timestamp2));

  // Get the difference in milliseconds
  let diffMs = Math.abs(date2 - date1);

  // Convert milliseconds into hours, minutes, and seconds
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * (1000 * 60);
  const seconds = Math.floor(diffMs / 1000);

  // Return result in the format HH:MM:SS
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


const intervalID = setInterval(async () => {
  current_time.value += 1000;
  timer.value = getTimeDifference(current_time.value, ending_time.value);

  if (current_time.value >= ending_time.value) {
    await finish_test();
  }
}, 1000)


async function getQuestions() {
  try {
    const response = await axios.get(
      `${apiRoute.listQuestions}/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
    // console.log(response.data);
    question_list.value = response.data.data
    active_question.value = question_list.value[active_index.value];
    total_questions.value = question_list.value.length;
    console.log(total_questions.value)
    // quizzes.value = response.data.quiz;
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function getOptions() {
  try {
    const response = await axios.get(
      `${apiRoute.listOptions}/${active_question.value.id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
    active_options.value = response.data.data;
    console.log(response.data.data);
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function submitAnswer() {
  try {
    const response = await axios.post(
      `${apiRoute.response}`, {
        quiz_id: quiz_id,
        question_id: active_question.value.id,
        selected_option_id: selected_answer.value
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
    // active_options.value = response.data.data;
    incorrect.value = (response.data.savedScore.incorrect_answers);
    score.value = (response.data.savedScore.score);

    answer_submitted.value = true;

    // Show Color
    if (response.data.correct_answer === true) {
      document.getElementById(selected_answer.value).classList.add('correct_answer');
      document.getElementById(selected_answer.value).classList.remove('incorrect_answer');
    } else {
      document.getElementById(selected_answer.value).classList.remove('correct_answer');
      document.getElementById(selected_answer.value).classList.add('incorrect_answer');
    }

    // if(response.data.data)

  } catch (err) {
    console.log(err.response.data)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }

}

async function button_text_color() {
  if (active_index.value + 1 === total_questions.value) {
    btn_text.value = "submit";
    btn_color.value = "green"
  }
}

async function finish_test() {
  try {
    const response = await axios.patch(
      `${apiRoute.response}/${quiz_id}`, {}, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    // console.log(response.data.data);
    // alert("Quiz Ended You'll be redirected to the home page")
    await router.push(`/join/${quiz_id}`)

  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function end_in_between() {
  end_clicked.value++

  setTimeout(() => {
    end_clicked.value = 0;
  }, 3000)

  if (end_clicked.value >= 2) {
    await finish_test();
    clearInterval(intervalID);

  }
}

async function nextQuestion() {
  // await submitAnswer();

  if (active_index.value + 1 < total_questions.value) {
    active_index.value = active_index.value + 1;
    active_question.value = question_list.value[active_index.value];

    await getOptions();
    selected_answer.value = "";
    await button_text_color();

  } else {
    await finish_test();
    clearInterval(intervalID);

    // await router.push("/");
  }
  answer_submitted.value = false;
}

async function checkEligibility() {
  try {
    const response = await axios.get(
      `${apiRoute.response}/eligible/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });


    console.log(response.data);

  } catch (err) {
    clearInterval(intervalID);

    console.log(err.status)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    } else if (err.status === 400) {
      notEligible.value = true;
    }
  }
}

async function getEndingTime() {
  try {
    const response = await axios.get(
      `${apiRoute.response}/ending_time/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    current_time.value = Number(response.data.current_time);
    ending_time.value = Number(response.data.response[0].end_time);

  } catch (err) {
    clearInterval(intervalID);

    console.log(err.status)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    } else if (err.status === 400) {
      notEligible.value = true;
    }
  }
}


onMounted(async id => {
  await checkEligibility();
  if (notEligible.value === true) {
    clearInterval(intervalID);
  } else {
    await getEndingTime();
    await getQuestions();
    await getOptions()
    await button_text_color();
  }
})

</script>

<style scoped>
.not-eligible {
  height: 20rem;
  width: 30rem;
  margin: 12% auto auto;
  border-radius: 10px;
  border: 2px solid #81ffff;
}

.not-eligible .text {
  font-size: 1.4rem;
  margin-top: 25%;
  margin-left: 7%;
}

.container {
  display: grid;
  grid-template-rows:  4.5rem auto;
  gap: 1rem;
}

.top_bar {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  gap: 1rem;
  border: 2px solid #dfd;
  justify-content: space-between;
}

.score {
  align-self: center;
  justify-self: flex-start;
  margin-left: 2rem;
  font-weight: bold;
}

.timer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.submission {
  align-self: center;
  justify-self: flex-end;
  margin-right: 2rem;
}

.main_section {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.5fr 1fr;
}

.left_section {
  border: 2px solid #dfd;
  border-radius: 5px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-template-rows: auto auto 3rem;
  padding: 1rem;
  margin-left: 5px;
}


.right_section {
  border: 2px solid #dfd;
  border-radius: 5px;
  display: grid;
  grid-template-rows: 72vh 8vh;
  gap: .5rem;
  padding: 1rem;
  margin-right: 5px;
}

.options {
  height: 100%;
  width: 100%;
}

.options p {
  margin-left: 1rem;
}

.options-container {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  gap: 1.5rem;
}

.option-list {
  padding: .5rem;
  border-radius: 5px;
  border: 2px solid #dfd;
}

.correct_answer {
  background-color: #beffbe;
}

.incorrect_answer {
  background-color: #ff9b9b;
}

.next-question {
  border: 2px solid #dfd;
  border-radius: 5px;
  height: 100%;
  width: 100%;
  display: grid;
  gap: 1rem;
  grid-template-columns:1fr 1fr 1fr 1fr;
  align-content: center;
}

.next-question .btn-submit {
  grid-column-start: 3;
}

.next-question .btn-next {
  grid-column-start: 4;
  margin-right: 1rem;
}

</style>
