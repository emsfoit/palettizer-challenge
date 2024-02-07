import { BoxState, addBox } from "@/app/redux/boxSlice";
import { ConfigState } from "@/app/redux/configSlice";
import { Box } from "@/app/types";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react"; // Import useEffect and useState

export default function ActionPannel() {
  const boxes = useSelector((state: { box: BoxState }) => state.box.boxes);
  const { paletteSize, boxSize } = useSelector(
    (state: { config: ConfigState }) => state.config
  );
  const dispatch = useDispatch();
  const [boxesString, setBoxesString] = useState<string>("");

  useEffect(() => {
    let toPrint = boxes.map((b: Box) => {
      return {x: b.x, y: b.y};
    });
    setBoxesString(JSON.stringify(toPrint));
  }, [boxes]);

  const checkCollision = (newX: number, newY: number) => {
    return boxes.filter(
      (b) =>
        newX - boxSize.width / 2 < b.x + boxSize.width / 2 &&
        newX + boxSize.width / 2 > b.x - boxSize.width / 2 &&
        newY - boxSize.height / 2 < b.y + boxSize.height / 2 &&
        newY + boxSize.height / 2 > b.y - boxSize.height / 2
    );
  };

  const checkWheretoAddBox = function () {
    let topLeftY = paletteSize.height - boxSize.height / 2;
    let topLeftX = boxSize.width / 2;

    let newX = topLeftX;
    let newY = topLeftY;
    let collision = checkCollision(newX, newY);
    if (collision.length === 0) {
      dispatch(addBox({ x: newX, y: newY }));
      return;
    }

    let founded = false;
    while (newX <= paletteSize.width - boxSize.width / 2) {
      while (newY >= boxSize.height / 2) {
        collision = checkCollision(newX, newY);
        if (collision.length === 0) {
          dispatch(addBox({ x: newX, y: newY }));
          founded = true;
          break;
        }
        newY = newY - boxSize.height - 5;
      }
      if (founded) {
        break;
      }
      newX = newX + boxSize.width + 5;
      newY = topLeftY;
    }
    if (!founded) alert("No more space for boxes");
  };

  return (
    <div>
      <button
        onClick={checkWheretoAddBox}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        WEITERES PAKET
      </button>
      <div>{boxesString}</div>
    </div>
  );
}
