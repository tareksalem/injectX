"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiInit = void 0;
const injectx_1 = require("injectx");
const db_1 = require("./db");
const getUser_repository_1 = require("./getUser.repository");
const DiInit = () => {
    (0, injectx_1.GetContainer)('default').Bind(db_1.db, { name: 'db' }).Bind(getUser_repository_1.GetUserRepository);
};
exports.DiInit = DiInit;
