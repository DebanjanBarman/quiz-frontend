<template>
  <AppBar></AppBar>
  <div class="text-center pa-4">

    <v-container>
      <v-row class="mx-4 my-3" style="border: 1px solid #fdf;border-radius: 1rem;">
        <v-col>
          <v-btn
            :loading="loading"
            @click="submit"
            variant="outlined"
            color="success"
            prepend-icon="mdi-floppy"
            style="float: right;"
          >
            Create Quiz
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
  <v-container>
    <v-row>
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

        </v-form>
      </v-col>
    </v-row>

  </v-container>
</template>
<script setup>
import AppBar from "@/components/AppBar.vue";
import {ref} from 'vue'
import axios from "axios";
import apiRoute from "../../api";
import {useRouter} from "vue-router";

const router = useRouter()

const booleans = [true, false]
const statues = ["WAITING", "LIVE", "COMPLETED"]

const title = ref("")
const description = ref("")
const thumbnail = ref("")
const status = ref("WAITING")
const visible = ref(true)
const started = ref(false)
const finished = ref(false)

const loading = ref(false);

async function back() {
  await router.push("/admin")
}

async function submit() {
  loading.value = true
  const createData = {
    title: title.value,
    description: description.value,
    thumbnail: thumbnail.value,
    status: status.value,
    visible: visible.value,
    started: started.value,
    finished: finished.value
  };

  console.log(createData)

  try {
    const response = await axios.post(apiRoute.createQuiz, createData, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
    });
    console.log(response.data);
    await router.push("/admin")

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

</script>

<style scoped>

</style>
