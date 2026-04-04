import axios from 'axios';

import { API_BASE_URL } from '../config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/* Note: `thsti-web` is public facing, so it usually doesn't need an interceptor for a token
   unless there are authenticated user actions. For now, it just fetches public data. */

export default api;
