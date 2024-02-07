import React, { useState, useRef, useEffect } from "react";
import { Box } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { ConfigState } from "@/app/redux/configSlice";
import { BoxState, editBox, removeBox } from "@/app/redux/boxSlice";

const Palette: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [draggedBoxData, setDraggedBoxData] = useState<{ x: number; y: number; box: Box } | null>(null);

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

      // Set draggedBoxData
      setDraggedBoxData({ x, y, box });
    }
  };
  const checkCollision = (box: Box, newX: number, newY: number) => {
    let coilided = []
    for(let i = 0; i < boxes.length; i++){
      if(boxes[i].id !== box.id){
        if( newX - boxSize.width / 2 < boxes[i].x + boxSize.width / 2 &&
          newX + boxSize.width / 2 > boxes[i].x - boxSize.width / 2 &&
          newY - boxSize.height / 2 < boxes[i].y + boxSize.height / 2 &&
          newY + boxSize.height / 2 > boxes[i].y - boxSize.height / 2)  {
          coilided.push(boxes[i])
        }
      }
    }
    return coilided;
  }
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (canvasBounds && draggedBoxData) {
      const { x, y, box } = draggedBoxData;

      // Calculate the new position based on the center of the box
      let newX = (event.clientX - canvasBounds.left) - x;
      let newY = (event.clientY - canvasBounds.top) - y;
      // IF THE BOX HAS 0 OR 180 DEGREE ROTATION
      if(box.r == 0 || box.r == 180){
        if(newX < boxSize.width / 2){
          newX = boxSize.width / 2
        }
        // check for left boundary
        if(newX > paletteSize.width - boxSize.width / 2){
          newX = paletteSize.width - boxSize.width / 2
        }
        // check for top boundary
        if(newY < boxSize.height / 2){
          newY = boxSize.height / 2
        }
        // check for bottom boundary
        if(newY > paletteSize.height - boxSize.height / 2){
          newY = paletteSize.height - boxSize.height / 2
        }
      } 
      // IF THE BOX HAS 90 OR 270 DEGREE ROTATION
      else if(box.r == 90 || box.r == 270){
        if(newX < boxSize.height / 2){
          newX = boxSize.height / 2
        }
        // check for left boundary
        if(newX > paletteSize.width - boxSize.height / 2){
          newX = paletteSize.width - boxSize.height / 2
        }
        // check for top boundary
        if(newY < boxSize.width / 2){
          newY = boxSize.width / 2
        }
        // check for bottom boundary
        if(newY > paletteSize.height - boxSize.width / 2){
          newY = paletteSize.height - boxSize.width / 2
        }
      } 
      // check for right boundary

      let adjustedY = paletteSize.height - newY;
      // implement snap to grid logic
      // if this box is colliding with any other box, then snap to the grid try right, left, top, bottom if not then place it at the current position
      // if it is not colliding with any other box, then place it at the current position

      // check for collision
      let collidedBoxes = checkCollision(box, newX, adjustedY);
      let collided=false
      if(collidedBoxes.length){
        debugger
        // sort the collidedBoxes array based on the distance from the current box
        collidedBoxes.sort((a, b) => {
          return Math.sqrt(Math.pow(a.x - newX, 2) + Math.pow(a.y - adjustedY, 2)) - Math.sqrt(Math.pow(b.x - newX, 2) + Math.pow(b.y - adjustedY, 2))
        });
        
        // check the bottom, right, top, left
        for(let i = 0; i < collidedBoxes.length; i++){
          // check for bottom
          if(adjustedY < collidedBoxes[i].y){
            adjustedY = collidedBoxes[i].y - boxSize.height - 5;
            collided = checkCollision(box, newX, adjustedY).length > 0;
            if(!collided) break;
          }
          // check for right
          if(newX < collidedBoxes[i].x){
            newX = collidedBoxes[i].x - boxSize.width - 5;
            collided = checkCollision(box, newX, adjustedY).length > 0;
            if(!collided) break;
          }
          // check for top
          if(adjustedY > collidedBoxes[i].y){
            adjustedY = collidedBoxes[i].y + boxSize.height + 5;
            collided = checkCollision(box, newX, adjustedY).length > 0;
            if(!collided) break;
          }
          // check for left
          if(newX > collidedBoxes[i].x){
            newX = collidedBoxes[i].x + boxSize.width + 5;
            collided = checkCollision(box, newX, adjustedY).length > 0;
            if(!collided) break;
          }
        }
      }
      dispatch(editBox({ ...box, x: newX, y: adjustedY, collided: collided }));
    }
    // Reset draggedBoxData after drop
    setDraggedBoxData(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRotationUpdate = (box: Box) => {

    let payload = { ...box, r: (box.r + 90) % 360 };
    // Check if the payload get out of the canvas after rotation and adjust the position

    if(payload.r == 0 || payload.r == 180){
      if(payload.x < boxSize.width / 2){
        payload.x = boxSize.width / 2
      }
      // check for left boundary
      if(payload.x > paletteSize.width - boxSize.width / 2){
        payload.x = paletteSize.width - boxSize.width / 2
      }
      // check for top boundary
      if(payload.y < boxSize.height / 2){
        payload.y = boxSize.height / 2
      }
      // check for bottom boundary
      if(payload.y > paletteSize.height - boxSize.height / 2){
        payload.y = paletteSize.height - boxSize.height / 2
      }
    }
    else if(payload.r == 90 || payload.r == 270){
      if(payload.x < boxSize.height / 2){
        payload.x = boxSize.height / 2
      }
      // check for left boundary
      if(payload.x > paletteSize.width - boxSize.height / 2){
        payload.x = paletteSize.width - boxSize.height / 2
      }
      // check for top boundary
      if(payload.y < boxSize.width / 2){
        payload.y = boxSize.width / 2
      }
      // check for bottom boundary
      if(payload.y > paletteSize.height - boxSize.width / 2){
        payload.y = paletteSize.height - boxSize.width / 2
      }
    }
    dispatch(editBox(payload));
    
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
