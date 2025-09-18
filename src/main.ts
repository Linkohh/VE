import { mount } from 'svelte'
import './app.css'
import Root from './Root.svelte'

const app = mount(Root, {
  target: document.getElementById('app')!,
})

export default app
