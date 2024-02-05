import React, { useState, useRef, useEffect } from "react";
import { Box } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { ConfigState } from "@/app/redux/configSlice";
import { BoxState, editBox, removeBox } from "@/app/redux/boxSlice";

const Palette: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

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

      // Draw the palette background
      context.fillStyle = "#eee";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);

      // Draw each box on the palette
      boxes.forEach((box: Box) => {
        drawBox(context, box);
      });

      // Highlight overlapping boxes
      highlightOverlappingBoxes(context, boxes);
    }
  }, [context, boxes, selectedBoxId]);

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

    // Draw box
    ctx.fillStyle = selectedBoxId === box.id ? "#ff0000" : "#3498db";
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
      const x = (event.clientX - canvasBounds.left) / 1 - box.x;
      const y = (event.clientY - canvasBounds.top) / 1 - box.y;
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify({ x, y, box })
      );
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const canvasBounds = canvasRef.current?.getBoundingClientRect();

    if (canvasBounds) {
      const { x, y, box } = JSON.parse(
        event.dataTransfer.getData("application/json")
      );

      let newX = (event.clientX - canvasBounds.left) + boxSize.width / 2;
      let newY = paletteSize.height - (event.clientY - canvasBounds.top) - boxSize.height / 2;

      newX = Math.max(0, Math.min(newX, paletteSize.width - boxSize.width));
      newY = Math.max(0, Math.min(newY, paletteSize.height - boxSize.height));

      dispatch(editBox({ ...box, x: newX, y: newY }));
    }
  };

  const highlightOverlappingBoxes = (
    ctx: CanvasRenderingContext2D,
    boxes: Box[]
  ) => {
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (doBoxesOverlap(boxes[i], boxes[j])) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(
            boxes[i].x,
            boxes[i].y,
            boxSize.width,
            boxSize.height
          );
          ctx.fillRect(
            boxes[j].x,
            boxes[j].y,
            boxSize.width,
            boxSize.height
          );
        }
      }
    }
  };

  const doBoxesOverlap = (box1: Box, box2: Box) => {
    return (
      box1.x < box2.x + boxSize.width &&
      box1.x + boxSize.width > box2.x &&
      box1.y < box2.y + boxSize.height &&
      box1.y + boxSize.height > box2.y
    );
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
            onClick={() => setSelectedBoxId(box.id)}
            onContextMenu={(event) => handleBoxRightClick(event, box)}
            style={{
              width: `${boxSize.width}px`,
              height: `${boxSize.height}px`,
              backgroundColor: selectedBoxId === box.id ? "#ff0000" : "green",
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
