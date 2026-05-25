import { RequestHandler } from "express";
import { ApiError } from "../../errors/api-error";
import {
  createRoom,
  deleteRoom,
  generateNextRoomCode,
  getRoom,
  listRooms,
  updateRoom,
} from "./rooms.service";

function requireOwner(req: Express.Request): string {
  if (!req.authUser) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing authentication context");
  }
  return req.authUser.maChuTro;
}

export const listRoomsHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const items = await listRooms(maChuTro);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

export const getRoomHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maNhaTro } = req.params as { maNhaTro: string };
    const data = await getRoom(maNhaTro, maChuTro);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createRoomHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const item = await createRoom(req.body, maChuTro);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

export const getNextRoomCodeHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const nextCode = await generateNextRoomCode(maChuTro);
    res.json({ nextCode });
  } catch (err) {
    next(err);
  }
};

export const updateRoomHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maNhaTro } = req.params as { maNhaTro: string };
    const item = await updateRoom(maNhaTro, req.body, maChuTro);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

export const deleteRoomHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maNhaTro } = req.params as { maNhaTro: string };
    await deleteRoom(maNhaTro, maChuTro);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
