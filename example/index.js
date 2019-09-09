import { createElement } from '@lwc/engine';
import App from 'my/app';

document.getElementById('main')
    .appendChild(createElement('my-app', { is: App }));
