<script setup>
import {ref} from "vue";
import axios from 'axios';
import apiRoute from '../../api/index'
import {useRoute, useRouter} from 'vue-router'

const router = useRouter()
const route = useRoute()


let email = ref('');
let password = ref('');
let validEmail = ref(false);
let validPassword = ref(false);
let notification = ref(false);
let notificationColor = ref('blue');
let notificationText = ref('HELLO');
let loading = ref(false);

const showPassword = ref(false);
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function strongPassword(pass) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass)
}

const emailRules = [
  value => {
    if (value) {
      return true
    }

    return 'You must enter your email id.'
  },
  value => {
    if (emailIsValid(value)) {
      validEmail.value = true
      return true
    }
    return "Please enter a valid email."
  }
];
const passwordRules = [
  value => {
    if (value.length >= 8) {
      return true
    } else {
      // validEmail.value = false;
      return 'Password must have at least 8 characters.'
    }
  },
  value => {
    if (strongPassword(value)) {
      validPassword.value = true;
      return true
    } else {
      // validPassword.value = false;
      return "Password must contain Uppercase,Lowercase,Number,Special Character(Only use @$!%*?&)"
    }
  }
];

async function signIn() {
  loading.value = true;
  const postData = {
    email: email.value.toLowerCase(),
    password: password.value
  };

  try {
    const response = await axios.post(apiRoute.login, postData);
    notificationText.value = "Login Success";
    notificationColor.value = "green";

    if (response.status === 200) {
      notification.value = true;
      loading.value = false;
      console.log(response.data)

      localStorage.setItem("email", email.value.toLowerCase());
      localStorage.setItem("authorized", 'true');
      localStorage.setItem("name", response.data.data.name);
      localStorage.setItem("userId", response.data.data.id);
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('role', response.data.data.role);

      setTimeout(async () => {
        await router.push('/');
      }, 500);
    }
    console.log({response})
  } catch (err) {
    console.log("IM HERE")
    console.log(err)
    notification.value = true;
    notificationText.value = "Incorrect Email or Password";
    notificationColor.value = "red";
    loading.value = false;
    setTimeout(async () => {
      console.log(err);
    }, 2000);

  }

}
</script>


<template>
  <div class="text-center ma-2">

    <v-snackbar
      v-model="notification"
      :color="notificationColor"
    > {{ notificationText }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="notification = false"
        > Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>

  <v-sheet width="450" height="600" class="mx-auto mt-10 pa-10 " style="border-radius: 1rem" elevation="3" rounded>
    <div style="text-align: center;">
      <v-card-title class="mb-5">
        <b>
          Sign in
        </b>
      </v-card-title>
    </div>
    <v-form @submit.prevent>
      <v-text-field
        v-model="email"
        label="Email"
        density="compact"
        type="email"
        variant="outlined"
        color="blue"
        validate-on="input"
        :rules="emailRules"
        class="mb-5 mt-10"
      >
      </v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        density="compact"
        variant="outlined"
        color="blue"
        class="mb-5"
        validate-on="input"
        append-inner-icon="mdi-eye"
        :rules="passwordRules"
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="togglePasswordVisibility"
      ></v-text-field>
<!--      <router-link-->
      <!--        to="/forgot-password"-->
      <!--        style="text-decoration: none;color: #3178ec"-->
      <!--      >-->
      <!--        <b> Forgot Password? </b>-->
      <!--      </router-link>-->
      <v-btn
        type="submit"
        block="true"
        :disabled="(!validEmail||!validPassword)"
        :loading="loading"
        @click="signIn"
        rounded
        class="mt-7 mb-10"
        color="blue"
      >
        Sign In
      </v-btn>

<!--      <p class="mb-4"> Don't have an account yet?</p>-->
      <!--      <router-link to="/signup" style="text-decoration: none;color: #3178ec">-->
      <!--        <b>Sign up</b>-->
      <!--      </router-link>-->
    </v-form>

  </v-sheet>

</template>

<style scoped>

</style>
