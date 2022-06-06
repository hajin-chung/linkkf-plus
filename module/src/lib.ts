import axios from "axios";
import { GET_HEADER } from "const";

export async function getProtected(url: string) {
  return await axios.get(url, { headers: GET_HEADER });
}
