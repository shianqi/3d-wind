import { App, AppEventListener } from '../lib'

const app = document.getElementById('app')

const myapp = new App({ app })
const listener = new AppEventListener(myapp)

myapp.animate()
