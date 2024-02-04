import { addBox } from "@/app/redux/boxSlice";
import { Box } from "@/app/types";
import { useDispatch, useSelector } from "react-redux";

export default function ActionPannel() {
  const boxes: Box[] = useSelector((state: any) => state.boxes);
  const boxesString = JSON.stringify(boxes, null, 2);
  const dispatch = useDispatch();
  return (
    <div>
      <button
        onClick={() => dispatch(addBox())}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        WEITERES PAKET
      </button>
      <pre>{boxesString}</pre>
    </div>
  );
}
