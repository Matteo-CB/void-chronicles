import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import storyData from "@/lib/data/storyData.json";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export const createMapIntroSlice = (set: SetState, get: GetState) => ({
  checkLevelIntro: () => {
    const { dungeonLevel, startCutscene } = get();

    // On convertit en string car les clés JSON sont des strings
    const levelKey = dungeonLevel.toString();
    const events = (storyData as any).levelEvents;

    if (events && events[levelKey]) {
      const event = events[levelKey];
      if (event.introCutsceneId) {
        console.log(
          `[Story] Déclenchement de la cutscene: ${event.introCutsceneId} pour le niveau ${dungeonLevel}`
        );

        // Petit délai pour laisser le temps au fade-in de se terminer
        setTimeout(() => {
          startCutscene(event.introCutsceneId);
        }, 500);
      }
    }
  },
});
