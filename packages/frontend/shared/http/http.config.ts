import axios from "axios";
import { createMockAdapter } from "../../src/mocks/presentation-mocks";

const isMockMode = process.env.NEXT_PUBLIC_MOCK === "true";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 60000,
});

if (isMockMode) {
  api.defaults.adapter = createMockAdapter(api.defaults.adapter as any);
}

export default api;
