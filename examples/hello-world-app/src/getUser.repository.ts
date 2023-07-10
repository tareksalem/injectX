import { InjectIn } from 'injectx'
import { DB } from './db'

export const GetUserRepository = ({ db }: { db: DB }) => (username: string) => {
    return db.users.find(user => user.username === username)
}

export const getUserReposistory = InjectIn(GetUserRepository)

