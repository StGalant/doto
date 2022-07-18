import { defineStore } from 'pinia'

export interface AppMessage {
  id: number
  content: string
  className: string
}

let id = -1
const nextId = () => {
  id++
  return id
}

export const useMessagesStore = defineStore('messages', {
  state() {
    return {
      messages: [] as AppMessage[],
      popTimeout: 5000, // 5s default
    }
  },
  actions: {
    pushMessage(content: string, className = 'theme-success') {
      const id = nextId()
      this.messages.push({ id, content, className })
      setTimeout(() => this.deleteMessage(id), this.popTimeout)
      return id
    },
    pushError(content: string) {
      console.error('error ', content)

      return this.pushMessage(content, 'theme-danger')
    },
    deleteMessage(id: number) {
      const i = this.messages.findIndex(m => m.id === id)
      if (i >= 0)
        this.messages.splice(i, 1)
    },
  },
})
