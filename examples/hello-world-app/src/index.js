"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diInit_1 = require("./diInit");
(0, diInit_1.DiInit)();
const getUser_repository_1 = require("./getUser.repository");
console.log((0, getUser_repository_1.getUserReposistory)("tarek"));
