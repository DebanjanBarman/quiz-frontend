<template>
  <AppBar></AppBar>
  <div class="text-center pa-4">

    <v-container>
      <v-row class="mx-4 my-3" style="border: 1px solid #fdf;border-radius: 1rem;">
        <v-col>
          <v-btn
            variant="outlined"
            color="green"
            prepend-icon="mdi-floppy"
            style="float: right;"
            @click="updateQuestion"
            :loading="loading"
          >
            Save Question
          </v-btn>
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
      </v-row>
    </v-container>
  </div>

  <v-container class="pa-4" style="border: 1px solid #fdf;border-radius: 1rem; width: 85%">
    <v-card-title>Question</v-card-title>
    <MdEditor v-model="text" language="en-US"/>
  </v-container>

  <v-container class="pa-4 mt-8" style="border: 1px solid #fdf;border-radius: 1rem; width: 85%">
    <v-card-title>Options</v-card-title>

    <!--    Create New Option-->
    <v-form>
      <v-row style="border:1px solid #ddf; border-radius: 1rem" class="ma-8">

        <v-col cols="9" class="mt-4">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="newOption"

          >
          </v-text-field>
        </v-col>
        <v-col cols="3" class="mt-4">
          <v-btn variant="outlined" color="green" prepend-icon="mdi-floppy" @click="createOption">Add option</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!--    Already Created Options-->
    <v-card
      density="compact"
      variant="outlined"
      color="purple"
      v-for="option in options"
      :key="option.id"
      class="ma-4">
      <v-row>
        <v-col cols="8">

          <v-card-title style="margin-top: .4rem;color: #333">
            {{ option.option_text }}
          </v-card-title>

          <v-card-text style="color: #333">{{ option.id }}</v-card-text>
        </v-col>
        <v-col cols="4">
          <v-card-actions>
            <v-btn
              variant="outlined"
              density="compact"
              prepend-icon="mdi-check"
              color="green"
              @click="markCorrectOption(option.id)"
            >
              Mark as correct
            </v-btn>
            <v-btn
              variant="outlined"
              density="compact"
              color="red"
              prepend-icon="mdi-trash-can-outline"
              @click="deleteOption(option.id)"
            >Delete
            </v-btn>
          </v-card-actions>
        </v-col>

      </v-row>

    </v-card>
  </v-container>

  <v-container class="pa-4 mt-8" style="border: 1px solid #fdf;border-radius: 1rem; width: 85%">
    <v-card-title>Correct Options</v-card-title>
    <v-card
      variant="outlined"
      v-if="correctOptions.length===0"
      max-width="400px"
      max-height="400px"
      style="margin-left: 50%;transform: translateX(-50%)"
    >
      <v-card-title>
        No Options Selected

      </v-card-title>
    </v-card>
    <v-card
      density="compact"
      variant="outlined"
      color="purple"
      v-for="option in correctOptions"
      :key="option.id"
      class="ma-4">
      <v-row>
        <v-col cols="8">

          <v-card-title style="margin-top: .4rem;color: #333">
            {{ option.option_id }}
          </v-card-title>
        </v-col>
        <v-col cols="4">
          <v-card-actions>

            <v-btn
              variant="outlined"
              density="compact"
              color="red"
              prepend-icon="mdi-trash-can-outline"
              @click="deleteCorrectOption(option.id)"
            >Delete Answer
            </v-btn>
          </v-card-actions>
        </v-col>

      </v-row>

    </v-card>

  </v-container>

</template>
<script setup>

import AppBar from "@/components/AppBar.vue";

import {useRouter, useRoute} from "vue-router";
import {ref, onMounted} from "vue";
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import axios from "axios";
import apiRoute from "../../api";

const router = useRouter()
const route = useRoute();

const loading = ref(false);

const quiz_id = route.params.id;
const question_id = route.params.questionId;

const text = ref('# Hello Editor');

const options = ref({})
const correctOptions = ref({})

const newOption = ref("");

async function back() {
  // router.push(`/`);
  console.log(route.params.id)
  const quiz_id = route.params.id;
  await router.push(`/admin/${quiz_id}`);
}

async function updateQuestion() {
  loading.value = true;
  try {
    const response = await axios.patch(`${apiRoute.questions}/${question_id}`,
      {
        quiz_id: quiz_id,
        question: text.value,
      },
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
      });

    console.log(response.data)
    await getQuestion();
    loading.value = false;

  } catch (err) {
    loading.value = false;

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function getQuestion() {
  try {
    const response = await axios.get(`${apiRoute.questions}/${question_id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    text.value = response.data.question.question;
    // console.log(response.data);
    // await back();
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
    const response = await axios.get(`${apiRoute.options}/${question_id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    // console.log(response.data);
    options.value = response.data.data;
    console.log(options.value)
    // await back();
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }

}

async function createOption() {

  // console.log(newOption.value)
  try {
    const response = await axios.post(`${apiRoute.option}/${question_id}`,
      {
        option: newOption.value
      },
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
      });

    console.log(response.data)
    newOption.value = "";
    await getOptions();
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function deleteOption(optionId) {
  console.log(optionId)
  try {
    const response = await axios.delete(`${apiRoute.option}/${optionId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    await getOptions();
    await getCorrectOptions();
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function markCorrectOption(optionId) {
  // console.log(optionId)
  // console.log(question_id)

  try {
    const response = await axios.post(`${apiRoute.answer}/${question_id}`, {
      option_id: optionId,
    }, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    await getOptions();
    await getCorrectOptions();
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function getCorrectOptions() {

  try {
    const response = await axios.get(`${apiRoute.answer}/${question_id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    correctOptions.value = response.data.data;
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

async function deleteCorrectOption(optionID) {
  console.log(optionID)
  try {
    const response = await axios.delete(`${apiRoute.answer}/${optionID}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    await getCorrectOptions();
  } catch (err) {

    console.log(err)
    if (err.status === 401) {
      console.log("NOT LOGGED IN")
      localStorage.clear();
      await router.push("/login");
    }
  }
}

onMounted(async () => {
  await getQuestion()
  await getOptions()
  await getCorrectOptions()
})
</script>

<style scoped>

</style>
