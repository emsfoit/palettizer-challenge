import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Palette size: 800mm x 1200mm
// Box size: 200mm x 300m

export interface ConfigState {
  boxSize: { width: number; height: number };
  paletteSize: { width: number; height: number };
}

const initialState: ConfigState = {
  boxSize: { width: 200, height: 300 },
  paletteSize: { width: 800, height: 1200 },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setBoxSize: (
      state: ConfigState,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.boxSize = action.payload;
    },
    setPaletteSize: (
      state: ConfigState,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.paletteSize = action.payload;
    },
  },
});

export const { setBoxSize, setPaletteSize } = configSlice.actions;
export const configReducer = configSlice.reducer;
