import { Vue, Component } from 'vue-property-decorator';

import SipDemo from './components/SipDemo.js';

import './index.less';

@Component
class App extends Vue {
  render(h) {
    return (
      <div id="app">
        <SipDemo />
      </div>
    )
  }
}

export default App;
