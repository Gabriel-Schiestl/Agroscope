import api from "../../../shared/http/http.config";

export default async function DeleteAccountAPI(): Promise<boolean> {
  try {
    await api.delete("/user");
    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    return false;
  }
}
