import { GetContainer } from "injectx"
import { db } from "./db"
import { GetUserRepository } from "./getUser.repository";

export const DiInit = () => {
  GetContainer('default').Bind(db, { name: 'db' }).Bind(GetUserRepository);
}
