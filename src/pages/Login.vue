<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import VButton from '~/components/VButton.vue'
import VInput from '~/components/VInput.vue'
import { useUserStore } from '~/store/user'
import { useMessagesStore } from '~/store/messages'

const { t } = useI18n()
const router = useRouter()

const msgStore = useMessagesStore()
let prevErrorId: null | number = null

const user = useUserStore()
const email = ref('')
const password = ref('')

watchEffect(() => {
  if (user.loggedIn)
    router.push({ name: 'Home' })
})

const pending = ref(false)
const onSubmit = async () => {
  pending.value = true
  try {
    await user.login(email.value, password.value)
  }
  catch (err: any) {
    if (prevErrorId)
      msgStore.deleteMessage(prevErrorId)
    prevErrorId = msgStore.pushError(t(err.message))
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="Login">
    <h1 class="text-2xl">
      Необходима авторизация
    </h1>
    <div class="Login__form-wrapper">
      <form
        data-test-id="login-form"
        class="Login__form lg:max-w-sm px-12 py-8 flex flex-col mt-4 gap-4"
        relative
        @submit.prevent="onSubmit"
      >
        <VInput v-model="email" name="email" type="email" :label="t('form.input.email')">
          <template #left>
            <div i="carbon-user" class="ml-1 mr-2 mb-1 w-7 h-7 self-end" />
          </template>
        </VInput>
        <VInput
          v-model="password"
          name="password"
          :label="t('form.input.password')"
          type="password"
        >
          <template #left>
            <div i="carbon-password" m="l-1 r-2 b-1" w="7" h="7" self="end" />
          </template>
        </VInput>
        <VButton :disabled="!email || pending" m="x-auto t-4" w="min-content">
          {{ t('form.button.login') }} <div i="carbon-login" />
        </VButton>
      </form>
    </div>
  </div>
</template>

<style>
.Login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5vh;
}

.Login__form{
  background-color: var(--color-background);
}

.Login__form .VInput input {
  border: none;
  border-bottom: 2px solid var(--color-input-border);
}

.Login__form .VInput input:focus {
  border: none;
  border-bottom: 2px solid var(--color-input-focus-border);
}

.Login__form VInput:focus-within .VInput__label {
  color: var(--color-input-focus-border);
}

.Login__form::before {
  content: '';
  position: absolute;
  width: 40%;
  height: 40%;
  border-top: 3px solid;
  border-left: 3px solid;
  border-color: var(--color-brand-0);
  top: 0;
  left: 0;
}

.Login__form::after {
  content: '';
  position: absolute;
  width: 40%;
  height: 40%;
  border-bottom: 3px solid;
  border-right: 3px solid;
  border-color: var(--color-brand-0);
  bottom: 0;
  right: 0;
}

.Login__error {
  background-color: var(--color-background);
  color: var(--color-action-0);
}
</style>
