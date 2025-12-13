import useGameStore from "@/store/gameStore";

export default function SpellBookUI() {
  const { player, equipSpell, inputMethod } = useGameStore();

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 font-pixel">
      <div className="bg-gray-900 border-4 border-purple-600 p-6 w-full max-w-2xl shadow-2xl relative">
        <h2 className="text-2xl text-purple-400 mb-6 text-center border-b border-purple-800 pb-4">
          GRIMOIRE DES SORTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/50 p-4 border border-gray-700 h-96 overflow-y-auto">
            <h3 className="text-white mb-2 text-sm">Sorts Connus</h3>
            <div className="space-y-2">
              {player.spells.map((spell) => (
                <div
                  key={spell.id}
                  className="flex flex-col bg-gray-800 p-2 border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <span style={{ color: spell.color }} className="font-bold">
                      {spell.name}
                    </span>
                    <span className="text-blue-300 text-xs">
                      {spell.cost} MP
                    </span>
                  </div>
                  <p className="text-gray-400 text-[10px] italic my-1">
                    {spell.description}
                  </p>

                  <div className="flex gap-1 mt-2">
                    <span className="text-gray-500 text-[10px] mr-2">
                      Équiper en:
                    </span>
                    {[0, 1, 2].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => equipSpell(spell.id, slot)}
                        className={`px-2 py-1 text-[10px] border ${
                          player.equippedSpells[slot] === spell.id
                            ? "bg-green-600 border-green-400 text-white"
                            : "bg-gray-700 border-gray-500 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        Slot {slot + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {player.spells.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  Aucun sort appris. Trouvez des grimoires !
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 bg-black/50 p-4 border border-gray-700">
            <h3 className="text-white text-sm mb-4">Sorts Actifs</h3>
            <div className="flex flex-col gap-4 w-full">
              {[0, 1, 2].map((slot) => {
                const spellId = player.equippedSpells[slot];
                const spell = player.spells.find((s) => s.id === spellId);
                return (
                  <div
                    key={slot}
                    className="flex items-center gap-4 bg-gray-800 p-3 border border-gray-600"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-black border border-gray-500 text-white font-bold">
                      {slot + 1}
                    </div>
                    {spell ? (
                      <div className="flex-1">
                        <p
                          style={{ color: spell.color }}
                          className="font-bold text-sm"
                        >
                          {spell.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Dégâts: {spell.damage || 0} | Portée: {spell.range}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 italic text-sm">Vide</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => useGameStore.setState({ gameState: "playing" })}
          className="mt-6 w-full py-3 bg-red-600 text-white hover:bg-red-500 border-2 border-red-800 font-bold flex items-center justify-center gap-2"
        >
          FERMER LE GRIMOIRE{" "}
          {inputMethod === "gamepad" && (
            <span className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center text-[10px] border border-red-400">
              B
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
