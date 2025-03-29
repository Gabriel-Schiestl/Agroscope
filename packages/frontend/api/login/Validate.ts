import api from "../../shared/http/http.config";

export default async function Validate(cookie?: string) {
  try {
    const response = await api.get("/auth/validate", {
      headers: {
        Authorization: `${cookie}`,
      },
    });
    console.log("BBBBBBBBB", response);
    return response.data;
  } catch (e) {
    console.log("AAAAAAAAAAAA");
    return false;
  }
}
