<template>
  <AppBar></AppBar>


  <div class="text-center pa-4">
    <v-dialog
      v-model="dialog"
      max-width="400"
      persistent
    >

      <template v-slot:activator="{ props: activatorProps }">
        <v-container>
          <v-row class="mx-4 my-3" style="border: 1px solid #fdf;border-radius: 1rem;">
            <v-col cols="3">
              <v-btn
                style="float: left"
                prepend-icon="mdi-arrow-left"
                variant="outlined"
                color="purple"
                @click="back"
              >
                Back
              </v-btn>

            </v-col>
            <v-col cols="3">
              <router-link :to="`/admin/${quizId}/join-requests`">
                <v-btn
                  style="float: left"
                  variant="outlined"
                  color="purple"
                >
                  Pending Join Requests
                </v-btn>
              </router-link>
            </v-col>
            <v-col cols="3">
              <v-btn
                variant="outlined"
                color="purple"
                v-bind="activatorProps"
                prepend-icon="mdi-floppy"
              >
                Edit Quiz
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                variant="outlined"
                color="red"
                prepend-icon="mdi-trash-can-outline"
                @click="deleteQuiz"
                style="float: right;">
                Delete Quiz
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <v-container>
        <v-row>
          <v-col>
            <v-card class="pa-8">

              <v-col style="max-width: 500px; margin: auto" cols="12">
                <v-form @submit.prevent="submit">
                  <v-text-field
                    v-model="title"
                    variant="outlined"
                    density="compact"
                    label="Name of the Quiz"
                  ></v-text-field>
                  <v-textarea
                    v-model="description"
                    variant="outlined"
                    density="compact"
                    label="Description of the Quiz"
                  ></v-textarea>
                  <v-text-field
                    v-model="thumbnail"
                    variant="outlined"
                    density="compact"
                    label="Thumbnail image link"
                  ></v-text-field>
                  <v-autocomplete
                    :items="booleans"
                    v-model="visible"
                    variant="outlined"
                    density="compact"
                    label="Visible"
                  ></v-autocomplete>
                  <v-autocomplete
                    :items="statues"
                    v-model="status"
                    variant="outlined"
                    density="compact"
                    label="Status of the game"
                  ></v-autocomplete>
                  <v-autocomplete
                    v-model="started"
                    :items="booleans"
                    variant="outlined"
                    density="compact"
                    label="Is the quiz started"
                  ></v-autocomplete>
                  <v-autocomplete
                    v-model="finished"
                    :items="booleans"
                    label="Is the quiz finished"
                    density="compact"
                    variant="outlined"
                  ></v-autocomplete>

                  <v-card-actions>
                    <v-btn @click="dialog = false" variant="outlined" color="warning">Cancel</v-btn>
                    <v-btn :loading="loading" type="submit" variant="outlined" color="success">Save</v-btn>
                  </v-card-actions>
                </v-form>
              </v-col>
            </v-card>

          </v-col>
        </v-row>
      </v-container>
    </v-dialog>
  </div>

  <v-container class="pa-4" style="border: 1px solid #fdf;border-radius: 1rem; width: 85%">
    <v-row class="mb-6">
      <v-col>
        <v-btn
          density="compact"
          variant="outlined"
          color="purple"
          prepend-icon="mdi-plus"
          style="margin-left: 50%;transform: translateX(-50%)"
          @click="createQuestion"
        >
          Add Question
        </v-btn>
      </v-col>
    </v-row>
    <v-card density="compact" variant="outlined" color="purple" v-for="question in questions" :key="question.id"
            class="ma-4">
      <v-row>
        <v-col cols="9">
          <v-img
            v-if="question.question_type.toLowerCase()==='both' || question.question_type.toLowerCase()==='image'"
            :src="question.question_image"
            width="100%"
            height="100px"
            style="margin-top: 1rem"
          >
          </v-img>
          <v-card-title
            style="margin-top: .4rem;color: #333"

            v-if="question.question_type.toLowerCase()==='both' || question.question_type.toLowerCase()==='text'">
            {{ question.question_text }}
          </v-card-title>
        </v-col>
        <v-col cols="3">
          <v-card-actions>
            <router-link :to="`/admin/${quizId}/${question.id}`" style="text-decoration: none;color: purple">
              <v-btn
                variant="outlined"
                density="compact"
                prepend-icon="mdi-pencil-outline"
              >
                Edit
              </v-btn>
            </router-link>
            <v-btn
              variant="outlined"
              density="compact"
              color="red"
              prepend-icon="mdi-trash-can-outline"
              @click="deleteQuestion(question.id)"
            >Delete
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script setup>

import AppBar from "@/components/AppBar.vue";

import {ref, onMounted} from 'vue'

import axios from "axios";

import apiRoute from "../../api";
import {useRouter, useRoute} from "vue-router";

const router = useRouter()
const route = useRoute();

const quizId = route.params.id;

const booleans = [true, false]

const dialog = ref(false)
const statues = ["WAITING", "LIVE", "COMPLETED"]

const title = ref("")
const description = ref("")
const thumbnail = ref("")
const status = ref("WAITING")
const visible = ref(true)
const started = ref(false)
const finished = ref(false)

const loading = ref(false);

const questions = ref({});

async function submit() {
  loading.value = true
  const updateData = {
    title: title.value,
    description: description.value,
    thumbnail: thumbnail.value,
    status: status.value,
    visible: visible.value,
    started: started.value,
    finished: finished.value
  };

  console.log(updateData)

  try {
    const response = await axios.patch(`${apiRoute.quizzesURL}/${quizId}`, updateData, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    dialog.value = false;
    loading.value = false
  } catch (err) {
    loading.value = false

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function deleteQuiz() {

  try {
    const response = await axios.delete(`${apiRoute.quizzesURL}/${quizId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    await back();
  } catch (err) {
    loading.value = false

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
      `${apiRoute.quizzesURL}/${quizId}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    const quiz = response.data.quiz;

    title.value = quiz.title;
    description.value = quiz.description;
    thumbnail.value = quiz.thumbnail;
    status.value = quiz.status;
    visible.value = quiz.visible;
    started.value = quiz.started || false;
    finished.value = quiz.finished || false;

  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");

    }
  }
}

async function getQuestions() {
  try {
    const response = await axios.get(
      `${apiRoute.listQuestions}/${quizId}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    questions.value = response.data.data;
    console.log(response.data.data)
  } catch (err) {
    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");

    }
  }
}

async function deleteQuestion(question_id) {
  try {
    const response = await axios.delete(`${apiRoute.questions}/${question_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
      });
    await getQuestions();
  } catch (err) {
    loading.value = false

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }

}

async function back() {
  await router.push("/admin")
}

async function createQuestion() {
  try {
    const response = await axios.post(apiRoute.questions,
      {
        quiz_id: quizId,
        "question_type": "BOTH",
        "question_text": "Type Your Question Here",
        "question_image": "Link of the Question Image"
      },
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
      });
    const question_id = response.data.question.id;
    await router.push(`/admin/${quizId}/${question_id}`);
  } catch (err) {
    loading.value = false

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

onMounted(async () => {
  await getQuiz()
  await getQuestions()
})


</script>

<style scoped>

</style>
