<template>
  <AppBar></AppBar>
  <v-container v-if="requests.length === 0">
    <div class="no_req">
      <h3>
        New Requests will appear here
      </h3>
    </div>
  </v-container>
  <v-container v-if="requests.length === 0">
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
        <th class="text-left">
          Reject
        </th>

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
        <td>
          <v-btn color="red" variant="flat" @click="rejectRequest(req.user_id)">Reject</v-btn>
        </td>
      </tr>
      </tbody>
    </v-table>
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
const accepted = ref([]);

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

async function getAcceptedRequestList() {

}

onMounted(async () => {
  await getPendingRequestList();
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
