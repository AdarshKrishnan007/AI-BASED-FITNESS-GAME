// src/api.js

const BASE_URL = "http://localhost:5001";

const apiFetch = async (
  endpoint,
  { method = "GET", headers = {}, body, isForm = false } = {}
) => {
  const config = {
    method,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    credentials: "include",
    ...(body && { body: isForm ? body : JSON.stringify(body) }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

export default apiFetch;
