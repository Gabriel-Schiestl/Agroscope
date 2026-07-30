import api from "../../shared/http/http.config";

interface ChangePlanParams {
  planId: string;
}

export default async function ChangePlanAPI(
  params: ChangePlanParams
): Promise<boolean> {
  try {
    await api.patch("/user/plan", params);
    return true;
  } catch (error) {
    console.error("Error changing plan:", error);
    return false;
  }
}
