import { render } from 'preact'
import { App } from './web/app.tsx'

document.body.style.visibility = '';
Telegram.WebApp.ready();
Telegram.WebApp.MainButton.setParams({
    text: 'CLOSE WEBVIEW',
    is_visible: true
}).onClick(Telegram.WebApp.close);

render(<App />, document.getElementById('app') as HTMLElement)
