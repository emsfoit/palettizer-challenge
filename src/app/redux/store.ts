import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { boxReducer } from './boxSlice';
import { configReducer } from "./configSlice";


export const makeStore  = () => {
  return configureStore({
    reducer: {
      box: boxReducer,
      config: configReducer,
    },
  })
}

// Infer the type of store
export type AppStore = ReturnType<typeof makeStore >
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']