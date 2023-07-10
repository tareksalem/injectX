"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReposistory = exports.GetUserRepository = void 0;
const injectx_1 = require("injectx");
const GetUserRepository = ({ db }) => (username) => {
    return db.users.find(user => user.username === username);
};
exports.GetUserRepository = GetUserRepository;
exports.getUserReposistory = (0, injectx_1.InjectIn)(exports.GetUserRepository);
