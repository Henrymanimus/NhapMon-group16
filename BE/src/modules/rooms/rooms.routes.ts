import { Router } from "express";
import {
  createRoomHandler,
  deleteRoomHandler,
  getNextRoomCodeHandler,
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
roomRoutes.get("/next-code", getNextRoomCodeHandler);
roomRoutes.get("/code/next", getNextRoomCodeHandler);
roomRoutes.get(
  "/:maNhaTro([A-Z]{2}[0-9]{3})",
  validateParams(roomIdParamSchema),
  getRoomHandler
);
roomRoutes.post("/", validateBody(createRoomBodySchema), createRoomHandler);
roomRoutes.put(
  "/:maNhaTro([A-Z]{2}[0-9]{3})",
  validateParams(roomIdParamSchema),
  validateBody(updateRoomBodySchema),
  updateRoomHandler
);
roomRoutes.delete("/:maNhaTro", validateParams(roomIdParamSchema), deleteRoomHandler);
