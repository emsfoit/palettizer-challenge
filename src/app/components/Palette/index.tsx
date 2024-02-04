import React, { useState, useRef, useEffect } from 'react';
import { Box } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigState } from '@/app/redux/configSlice';
import { BoxState, editBox, removeBox } from '@/app/redux/boxSlice';

const Palette: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const paletteSize = useSelector((state: { config: ConfigState }) => state.config.paletteSize);
  const boxes = useSelector((state: { box: BoxState }) => state.box.boxes);
  const boxSize = useSelector((state: { config: ConfigState }) => state.config.boxSize);

  const dispatch = useDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      setContext(ctx);
    }
  }, []);

  useEffect(() => {
    if (context) {
      // Clear the canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      // Draw the palette background
      context.fillStyle = '#eee';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);

      // Draw each box on the palette
      boxes.forEach((box: Box) => {
        drawBox(context, box);
      });

      // Highlight overlapping boxes
      highlightOverlappingBoxes(context, boxes);
    }
  }, [context, boxes, zoom, selectedBoxId]);

  const drawBox = (ctx: CanvasRenderingContext2D, box: Box) => {
    ctx.save();

    // Calculate adjusted position based on the center of the box
    const adjustedX = box.x - boxSize.width / 2;
    const adjustedY = box.y - boxSize.height / 2;

    ctx.translate(adjustedX * zoom, (paletteSize.height - adjustedY - boxSize.height) * zoom);
    ctx.rotate((box.r * Math.PI) / 180);

    // Draw box
    ctx.fillStyle = selectedBoxId === box.id ? '#ff0000' : '#3498db';
    ctx.fillRect(0, 0, boxSize.width * zoom, boxSize.height * zoom);

    // Restore context
    ctx.restore();
  };

  const handleDragStart = (box: Box, event: React.DragEvent<HTMLDivElement>) => {
    // Store initial mouse position for better dragging experience
    event.dataTransfer.setData('text/plain', ''); // Needed for dragging to work in some browsers
    event.dataTransfer.setDragImage(new Image(), 0, 0); // Prevent default drag image
    event.dataTransfer.dropEffect = 'move';

    const canvasBounds = canvasRef.current?.getBoundingClientRect();

    if (canvasBounds) {
      const x = (event.clientX - canvasBounds.left) / zoom - box.x;
      const y = (event.clientY - canvasBounds.top) / zoom - box.y;
      event.dataTransfer.setData('application/json', JSON.stringify({ x, y, box }));
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
        event.dataTransfer.getData('application/json')
      );

      // Calculate the new position based on the center of the box
      let newX = (event.clientX - canvasBounds.left) / zoom + boxSize.width / (2 * zoom);
      let newY = paletteSize.height - (event.clientY - canvasBounds.top) / zoom - boxSize.height / (2 * zoom);

      // Ensure the entire box stays within the canvas boundaries
      newX = Math.max(0, Math.min(newX, paletteSize.width - boxSize.width / zoom));
      newY = Math.max(0, Math.min(newY, paletteSize.height - boxSize.height / zoom));

      // Dispatch action to update box position
      dispatch(editBox({ ...box, x: newX, y: newY }));
    }
  };

  const handleZoom = (factor: number) => {
    setZoom((prevZoom) => Math.max(0.1, Math.min(2, prevZoom * factor))); // Adjust zoom limits as needed
  };

  const highlightOverlappingBoxes = (ctx: CanvasRenderingContext2D, boxes: Box[]) => {
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (doBoxesOverlap(boxes[i], boxes[j])) {
          // Highlight overlapping boxes with a red background
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.fillRect(boxes[i].x * zoom, boxes[i].y * zoom, boxSize.width * zoom, boxSize.height * zoom);
          ctx.fillRect(boxes[j].x * zoom, boxes[j].y * zoom, boxSize.width * zoom, boxSize.height * zoom);
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
    // Dispatch action to update box rotation (rotate by 90 degrees)
    dispatch(editBox({ ...box, r: (box.r + 90) % 360 }));
  };

  const handleBoxRightClick = (event: React.MouseEvent<HTMLDivElement>, box: Box) => {
    event.preventDefault();
    // Dispatch action to remove the box
    dispatch(removeBox(box.id));
  };

  return (
    <div style={{ position: 'relative' }}>
      <div>
        <button onClick={() => handleZoom(1.1)}>Zoom In</button>
        <button onClick={() => handleZoom(0.9)}>Zoom Out</button>
      </div>
      <canvas
        ref={canvasRef}
        width={paletteSize.width * zoom}
        height={paletteSize.height * zoom}
        style={{ border: '1px solid #ddd', position: 'absolute' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      ></canvas>
      <div style={{ position: 'absolute' }}>
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
              backgroundColor: selectedBoxId === box.id ? '#ff0000' : 'green',
              margin: '5px',
              cursor: 'move',
              position: 'absolute',
              left: (box.x - boxSize.width / 2) * zoom,
              top: (paletteSize.height - box.y - boxSize.height / 2) * zoom,
            }}
          >
            {`${box.x.toFixed(2)}, ${box.y.toFixed(2)}`}
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleRotationUpdate(box);
              }}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                padding: '2px',
              }}
            >
              Rotate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Palette;
