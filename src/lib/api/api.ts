import Axios from "axios";

let urls: any = {
    local: process.env.NODE_URL_BACKEND_LOCAL,
    development: process.env.NODE_URL_BACKEND_DEV,
    production: process.env.NODE_URL_BACKEND_PROD,
}
const api = Axios.create({
    baseURL: urls[process.env.NODE_ENV],
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export default api;