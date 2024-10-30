import Axios from "axios";

let urls: any = {
    local: process.env.URL_BACKEND_LOCAL,
    development: process.env.URL_BACKEND_DEV,
    production: process.env.URL_BACKEND_PROD,
}
const api = Axios.create({
    baseURL: urls['local'],
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export default api;