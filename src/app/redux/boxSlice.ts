import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Box } from "../types";
import { v4 as uuidv4 } from 'uuid';

// const boxes = [
//     {
//       id: "1",  
//       "x": 100,
//       "y": 150,
//       "r": 0
//     },
//     {
//       id: "2",
//       "x": 100,
//       "y": 1050,
//       "r": 0
//     },
//     {
//       id: "3",
//       "x": 100,
//       "y": 745,
//       "r": 0
//     },
//     {
//       id: "4",
//       "x": 715,
//       "y": 1050,
//       "r": 0
//     },
//     {
//       id: "5",
//       "x": 355,
//       "y": 795,
//       "r": 90
//     },
//     {
//       id: "6",
//       "x": 355,
//       "y": 590,
//       "r": 90
//     },
//     {
//       id: "7",
//       "x": 402,
//       "y": 335,
//       "r": 0
//     },
//     {
//       id: "8",
//       "x": 305,
//       "y": 1050,
//       "r": 180
//     },
//     {
//       id: "9",
//       "x": 496,
//       "y": 768,
//       "r": 0
//     },
//     {
//       id: "10",
//       "x": 610,
//       "y": 440,
//       "r": 0
//     },
//     {
//       id: "11",
//       "x": 510,
//       "y": 1050,
//       "r": 0
//     }
//   ]
const boxes = [
  {
    id: "1",  
    "x": 100,
    "y": 150,
    "r": 0
  },
      {
      id: "2",
      "x": 100,
      "y": 1050,
      "r": 0
    },
]
export interface BoxState {
    boxes: Box[];
  }
  

const initialState = {
    boxes: boxes
}

export const boxSlice = createSlice({
    name: "box",
    initialState,
    reducers: {
        addBox: (state: BoxState) => {
            const id = uuidv4();
            // TODO: calc x and y
            state.boxes.push({
                id,
                x: 0,
                y: 0,
                r: 0
            });
        },
        removeBox: (state: BoxState, action: PayloadAction<string>) => {
            state.boxes = state.boxes.filter((box) => box.id !== action.payload);
        },
        editBox: (state: BoxState, action: PayloadAction<Box>) => {
            const index = state.boxes.findIndex((box) => box.id === action.payload.id);
            state.boxes[index] = action.payload;
        }
    },
});

export const { addBox, removeBox, editBox } = boxSlice.actions;
export const boxReducer = boxSlice.reducer;