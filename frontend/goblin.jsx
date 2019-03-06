import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store/store';
import Root from './components/root';
import {fetchNews} from './util/external_api_util';

document.addEventListener("DOMContentLoaded", () => {
    const rootEl = document.getElementById('root');

    // Test
        window.fetchNews = fetchNews;
    // End Test

    let store;
    if (window.currentUser) {
        const preloadedState = {
            entities: {
                users: { 
                    [window.currentUser.id]: window.currentUser
                }
            },
            session: { id: window.currentUser.id }
        };
        store = configureStore(preloadedState);
        delete window.currentUser;
    } else {
        store = configureStore();
    }
    
    ReactDOM.render(<Root store={store} />, rootEl);
});