<template>
  <AppBar></AppBar>
  <v-container v-if="loading">
    <v-row>
      <v-col cols="4" v-for="n in 2" :key="n">
        <v-skeleton-loader
          class="mx-auto border"
          max-width="300"
          type="image, article, button"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>

  <!--  Display in case of no games-->
  <v-container
    v-if="quizzes.length ===0"
    style="border:1px solid #fdf;border-radius: 1rem ; width: 100%; height: 80vh;">
    <v-row>
      <v-col cols="12">
        <v-card-title
          style="margin-top: 18%;margin-left: 50%;transform: translateX(-50%);width: 300px">
          Quizzes will appear here
        </v-card-title>
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" xxl="4" xl="4" lg="4" md="6" sm="12" xs="12"
             v-if="quizzes.length>0" v-for="(quiz,id) in quizzes" :key="id" variant="elevated"
      >
        <router-link :to="`join/${quiz.id}`" style="text-decoration: none;">

          <!--          :disabled="quiz.status.toUpperCase()==='WAITING' || quiz.status.toUpperCase()==='FINISHED'"-->
          <v-card
            :loading="loading"
            class="mx-auto my-12 ma-16"
            max-width="330"
            elevation="3"
          >

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
              <!--              <v-btn-->
              <!--                text="Reserve"-->
              <!--                block-->
              <!--                border-->

              <!--                @click="reserve"-->
              <!--              ></v-btn>-->
              <!--              <v-btn-->
              <!--                variant="outlined"-->
              <!--                color="deep-purple-lighten-2"-->
              <!--                block-->
              <!--                style="margin-bottom: 1rem"-->
              <!--              >-->
              <!--                Request to join-->
              <!--              </v-btn>-->

            </v-card-actions>
          </v-card>

        </router-link>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import AppBar from "@/components/AppBar.vue";
import {onMounted, ref} from "vue";
import {io} from "socket.io-client";
import axios from 'axios';
import apiRoute from '../../api/index'
import router from "@/router";
import api from "../../api/index";

let quizzes = ref([])
const loading = ref(false);

async function getQuizzes() {
  try {
    const response = await axios.get(
      apiRoute.quizzesURL,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
    console.log(response.data.quiz);
    quizzes.value = response.data.quiz;
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      router.push("/login");

    }
  }
}

const socket = io(api.baseURL);

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("quiz_updated", async (arg) => {
  console.log(arg); // world
  await getQuizzes();

});

// socket.emit("hello", "hello I'm Debanjan");

onMounted(async () => {
  loading.value = true
  await getQuizzes();
  loading.value = false
})
</script>
