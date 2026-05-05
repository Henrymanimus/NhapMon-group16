import { Router } from "express";
import {
  createRoomHandler,
  deleteRoomHandler,
  getRoomHandler,
  listRoomsHandler,
  updateRoomHandler,
} from "./rooms.controller";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  createRoomBodySchema,
  roomIdParamSchema,
  updateRoomBodySchema,
} from "./rooms.schemas";

export const roomRoutes = Router();

roomRoutes.get("/", listRoomsHandler);
roomRoutes.get("/:maNhaTro", validateParams(roomIdParamSchema), getRoomHandler);
roomRoutes.post("/", validateBody(createRoomBodySchema), createRoomHandler);
roomRoutes.put(
  "/:maNhaTro",
  validateParams(roomIdParamSchema),
  validateBody(updateRoomBodySchema),
  updateRoomHandler
);
roomRoutes.delete("/:maNhaTro", validateParams(roomIdParamSchema), deleteRoomHandler);
