import axios from "axios";

const API = "http://localhost:8000"; 

export async function login(utorid, password) {
  return axios.post(`${API}/auth/tokens`, {
    utorid,
    password,
  });
}
