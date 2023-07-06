import express from "express";
import { on } from "./Events.js"

export const server = express()
server.use(express.json());
server.use(express.static("../../web/dist"));

on("load.modules", () => server.listen(8888))