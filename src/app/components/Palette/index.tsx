import React, { useState, useRef, useEffect } from "react";
import { Box } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { ConfigState } from "@/app/redux/configSlice";
import { BoxState, editBox, removeBox } from "@/app/redux/boxSlice";

const Palette: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const paletteSize = useSelector(
    (state: { config: ConfigState }) => state.config.paletteSize
  );
  const boxes = useSelector((state: { box: BoxState }) => state.box.boxes);
  const boxSize = useSelector(
    (state: { config: ConfigState }) => state.config.boxSize
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      setContext(ctx);
    }
  }, []);

  useEffect(() => {
    if (context) {
      // Clear the canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      // begin drawing
      context.beginPath();

      // Draw the palette background
      context.fillStyle = "#eee";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);

      // Draw each box on the palette
      boxes.forEach((box: Box) => {
        drawBox(context, box);
      });

    }
  }, [context, boxes]);

  const drawBox = (ctx: CanvasRenderingContext2D, box: Box) => {
    ctx.save();

    // Calculate adjusted position based on the center of the box
    const adjustedX = box.x - boxSize.width / 2;
    const adjustedY = box.y - boxSize.height / 2;

    // Calculate the center of the rotated box
    const centerX = adjustedX + boxSize.width / 2;
    const centerY = adjustedY + boxSize.height / 2;

    ctx.translate(centerX, paletteSize.height - centerY);
    ctx.rotate((box.r * Math.PI) / 180);

    ctx.fillStyle = "#3498db";
    ctx.fillRect(-boxSize.width / 2, -boxSize.height / 2, boxSize.width, boxSize.height);

    // Restore context
    ctx.restore();
  };

  const handleDragStart = (
    box: Box,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.dataTransfer.setData("text/plain", "");
    event.dataTransfer.setDragImage(new Image(), 0, 0);
    event.dataTransfer.dropEffect = "move";

    const canvasBounds = canvasRef.current?.getBoundingClientRect();

    if (canvasBounds) {
      // Calculate the offset from the center of the box
      const x = (event.clientX - canvasBounds.left) - box.x;
      const y = (event.clientY - canvasBounds.top) - (paletteSize.height - box.y);
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify({ x, y, box })
      );
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const canvasBounds = canvasRef.current?.getBoundingClientRect();

    if (canvasBounds) {
      const { x, y, box } = JSON.parse(
        event.dataTransfer.getData("application/json")
      );

      // Calculate the new position based on the center of the box
      let newX = (event.clientX - canvasBounds.left) - x;
      let newY = (event.clientY - canvasBounds.top) - y;

      // Ensure the entire box stays within the canvas boundaries
      newX = Math.max(0, Math.min(newX, paletteSize.width - boxSize.width));
      newY = Math.max(0, Math.min(newY, paletteSize.height - boxSize.height));

      // Dispatch action to update box position
      dispatch(editBox({ ...box, x: newX + boxSize.width / 2, y: paletteSize.height - (newY + boxSize.height / 2) }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };


  const handleRotationUpdate = (box: Box) => {
    dispatch(editBox({ ...box, r: (box.r + 90) % 360 }));
  };

  const handleBoxRightClick = (
    event: React.MouseEvent<HTMLDivElement>,
    box: Box
  ) => {
    event.preventDefault();
    dispatch(removeBox(box.id));
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={paletteSize.width}
        height={paletteSize.height}
        style={{ border: "1px solid #ddd", position: "absolute" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      ></canvas>
      <div style={{ position: "absolute" }}>
        {boxes.map((box: Box) => (
          <div
            key={box.id}
            draggable
            onDragStart={(event) => handleDragStart(box, event)}
            onContextMenu={(event) => handleBoxRightClick(event, box)}
            style={{
              width: `${boxSize.width}px`,
              height: `${boxSize.height}px`,
              backgroundColor: "green",
              margin: "5px",
              cursor: "move",
              position: "absolute",
              left: box.x - boxSize.width / 2,
              top: paletteSize.height - (box.y + boxSize.height / 2),
              transform: `rotate(${box.r}deg)`,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {`${box.x.toFixed(2)}, ${box.y.toFixed(2)}`}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleRotationUpdate(box);
                }}
                style={{
                  display: "block",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  padding: "2px",
                  color: "black",
                }}
              >
                Rotate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Palette;
