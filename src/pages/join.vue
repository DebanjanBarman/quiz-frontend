<template>
  <AppBar></AppBar>

  <v-snackbar
    v-model="notification"
    :color="notification_color"
    timeout="3000"
  >
    {{ notification_text }}

    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="notification = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>

  <v-container class="main-section"
               v-if="quiz_status.toUpperCase()==='WAITING' || quiz_status.toUpperCase()==='COMPLETED' || quiz_status.toUpperCase()==='LIVE'">
    <v-card>
      <v-img
        height="250"
        :src="quiz.thumbnail"
        cover
      ></v-img>
      <v-card-item>
        <v-card-title> {{ quiz.title }}</v-card-title>
      </v-card-item>
      <v-card-text>
        <div>
          {{ quiz.description }}
        </div>
      </v-card-text>
      <v-divider class="mx-4 mb-1"></v-divider>
      <v-card-title>Status</v-card-title>
      <div class="px-4 mb-8">
        <div v-if="quiz.status.toUpperCase()===`WAITING`">
          <v-chip color="orange">{{ quiz.status.toUpperCase() }}</v-chip>
        </div>
        <div v-if="quiz.status.toUpperCase()===`LIVE`">
          <v-chip color="green">{{ quiz.status.toUpperCase() }}</v-chip>
        </div>
        <div v-if="quiz.status.toUpperCase()===`COMPLETED`">
          <v-chip color="red">{{ quiz.status.toUpperCase() }}</v-chip>
        </div>
      </div>
      <v-card-actions>
        <v-btn
          variant="outlined"
          color="deep-purple-lighten-2"
          block
          style="margin-bottom: 1rem"
          @mousedown="joinRequest"
          v-if="request_not_sent && quiz.status.toUpperCase()===`WAITING`"
        >
          Request to join
        </v-btn>
      </v-card-actions>
    </v-card>

  </v-container>
  <v-container v-if="quiz_status==='completed' || quiz_status==='live'">
    <h3
      style="max-width: 50rem;
      margin: auto auto 1rem;"
    >
      Leaderboard
    </h3>
    <v-data-table
      :items="results"
      style="max-width: 50rem;margin:auto auto 1rem;"
    ></v-data-table>
  </v-container>
  <v-container v-if="quiz_status==='waiting'">
    <h3
      style="max-width: 40rem;
      margin: auto auto 1rem;"
    >Participants</h3>
    <v-data-table
      :items="accepted_users"
      style="max-width: 40rem;margin: auto"
    ></v-data-table>

  </v-container>
</template>

<script setup>

import AppBar from "@/components/AppBar.vue";
import axios from "axios";
import apiRoute from "../../api";
import {useRoute, useRouter} from "vue-router"

const router = useRouter();
const routes = useRoute();

const quiz_id = routes.params.id;

const notification_text = ref("")
const notification_color = ref("primary")
const notification = ref(false)

const results = ref([]);
const accepted_users = ref([]);
const quiz_status = ref("")
const quiz = ref({});
const request_not_sent = ref(true);

async function getResults() {
  try {
    const response = await axios.get(
      `${apiRoute.result}/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    let data = response.data.data;
    let new_data = [];
    for (const dataKey in data) {
      let keyval = {};
      keyval.name = data[dataKey].name;
      keyval.email = data[dataKey].email;
      keyval.score = data[dataKey].score;
      keyval.incorrect_answers = data[dataKey].incorrect_answers;
      keyval.time_taken = (data[dataKey].time_taken / 1000).toFixed(2);
      if (keyval.time_taken < 0) {
        keyval.time_taken = "NA"
      }
      new_data.push(keyval);
    }
    results.value = new_data;
    // console.log(new_data);
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function getQuiz() {
  try {
    const response = await axios.get(
      `${apiRoute.quizzesURL}/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    let data = response.data.quiz;
    quiz.value = data;
    quiz_status.value = data.status.toLowerCase();
    console.log(quiz_status.value)
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    } else {
      alert("Something went wrong, redirecting to home")
      await router.push("/");
    }
  }
}

async function joinRequest() {
  try {
    const data = {
      user_id: localStorage.getItem('userId'),
      quiz_id: quiz_id,
      user_name: localStorage.getItem("name"),
      user_email: localStorage.getItem("email")

    }
    console.log(data)
    const response = await axios.post(
      `${apiRoute.join_game}`, data,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
    console.log(response.data)

    notification.value = true;
    notification_text.value = "Request sent to the admin";
    notification_text.color = "secondary"
    request_not_sent.value = false;
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    } else {
      alert("Something went wrong, redirecting to home")
      await router.push("/");
    }
  }

}

async function listAcceptedUsers() {
  try {
    const response = await axios.get(
      `${apiRoute.result}/accepted-users/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    let data = response.data.data;
    accepted_users.value = data;
    console.log(data)
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function joinReqSent() {
  try {
    const response = await axios.get(
      `${apiRoute.join_request_sent}/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    if (response.status === 200) {
      request_not_sent.value = false;
    }
  } catch (err) {
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

onMounted(async () => {
  await getQuiz();
  await getResults();
  await listAcceptedUsers();
  await joinReqSent();
})
</script>


<style scoped>
.main-section {
  max-width: 30rem;
  margin: auto;
}

</style>
