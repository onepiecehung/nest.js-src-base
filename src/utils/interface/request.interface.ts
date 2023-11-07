// import { USER_ROLE } from "src/users/users.constant";
import { LANG_CODE } from "../constant/constant";

export interface IReqUser {
  userId: number;
  sessionId: number;
  // role: USER_ROLE;
  language: LANG_CODE;
}

export interface IRequest {
  user: IReqUser;
}
