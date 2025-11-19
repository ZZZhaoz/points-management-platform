import axios from "axios";

const API = "http://localhost:8000"; 

export async function login(utorid, password) {
  return axios.post(`${API}/auth/tokens`, {
    utorid,
    password,
  });
}

export async function getMe() {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
