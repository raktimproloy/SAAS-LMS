import type { MotifId, MotifPack } from "../types";
import { banglaPack } from "./bangla";
import { medicalPack } from "./medical";

const packs: Record<MotifId, MotifPack> = {
  bangla: banglaPack,
  medical: medicalPack,
};

export function getMotifPack(id: MotifId): MotifPack {
  return packs[id] ?? packs.bangla;
}

export { banglaPack, medicalPack };
