"use client";
import Palette from "./components/Palette";
import ActionPannel from "./components/ActionPannel";
import { useSelector } from "react-redux";
import { ConfigState } from "./redux/configSlice";

export default function Home() {
  const paletteSize = useSelector(
    (state: { config: ConfigState }) => state.config.paletteSize
  );

  return (
    <main>
      <div className="flex">
        <div className="flex-initial" 
        style={{ width: paletteSize.width + 10, height: paletteSize.height }}
        >
          <Palette />
        </div>
        <div className="flex-1">
          <ActionPannel />
        </div>
      </div>
    </main>
  );
}
