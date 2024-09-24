<template>
  <AppBar></AppBar>
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
            <v-btn
              variant="outlined"
              color="green"
              v-bind="activatorProps"
            >
              Start Quiz
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <v-container>
      <v-row>
        <v-col>
          <v-card class="pa-8">
            <v-card-title>Set the Time</v-card-title>

            <v-col style="max-width: 500px; margin: auto" cols="12">
              <v-form @submit.prevent="startQuiz">
                <v-text-field
                  v-model="quiz_time"
                  variant="outlined"
                  density="compact"
                  label="Time in minutes"
                ></v-text-field>
                <v-card-actions>
                  <v-btn @click="dialog = false" variant="outlined" color="warning">Cancel</v-btn>
                  <v-btn :loading="loading" type="submit" variant="outlined" color="success">Start</v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </v-dialog>

  <v-container v-if="requests.length === 0">
    <div class="no_req">
      <h3>
        New Requests will appear here
      </h3>
    </div>
  </v-container>
  <v-container v-if="accepted_users.length === 0">
    <div class="no_req">
      <h3>
        Accepted Requests will appear here
      </h3>
    </div>
  </v-container>

  <v-container>
    <v-table fixed-header height="300px" v-if="requests.length > 0">
      <thead>
      <tr>
        <th class="text-left">
          Name
        </th>
        <th class="text-left">
          Email
        </th>
        <th class="text-left">
          Accept
        </th>
        <!--        <th class="text-left">-->
        <!--          Reject-->
        <!--        </th>-->

      </tr>
      </thead>
      <tbody>
      <tr
        v-for="req in requests"
        :key="req.id"
      >
        <td>{{ req.user_name }}</td>
        <td>{{ req.email }}</td>
        <td>
          <v-btn color="green" variant="flat" @click="acceptRequest(req.user_id)">Accept</v-btn>
        </td>
        <!--        <td>-->
        <!--          <v-btn color="red" variant="flat" @click="rejectRequest(req.user_id)">Reject</v-btn>-->
        <!--        </td>-->
      </tr>
      </tbody>
    </v-table>
  </v-container>
  <v-container v-if="accepted_users.length > 0">
    <h3
      style="max-width: 40rem;
      margin: auto auto 1rem;"
    >Accepted Users</h3>
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
const requests = ref([]);
const accepted_users = ref([])
const dialog = ref(false)
const loading = ref(false)
const quiz_time = ref(5);

async function back() {
  await router.push(`/admin/${quiz_id}`)
}


async function acceptRequest(user_id) {
  try {
    const response = await axios.post(
      `${apiRoute.accept_join_req}`, {user_id, quiz_id},
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    // requests.value = response.data.data;
    // console.log(requests.value)
    await getPendingRequestList();
    await listAcceptedUsers();
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

async function rejectRequest(user_id) {
  console.log(user_id)
}

async function getPendingRequestList() {
  try {
    const response = await axios.get(
      `${apiRoute.pending_req}/${quiz_id}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    requests.value = response.data.data;
    // console.log(requests.value)
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

async function startQuiz() {
  console.log(quiz_time.value, quiz_id)

  try {
    const response = await axios.post(
      `${apiRoute.start_quiz}/${quiz_id}`, {time: quiz_time.value},
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

    // requests.value = response.data.data;
    console.log(requests.data)
    dialog.value = false
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


onMounted(async () => {
  await getPendingRequestList();
  await listAcceptedUsers();
})
</script>


<style scoped>
.no_req {
  border: 2px solid #dfd;
  border-radius: 5px;
  height: 20rem;
  max-width: 30rem;
  margin: auto;
}

.no_req h3 {
  text-align: center;
  margin-top: 25%;
}
</style>
