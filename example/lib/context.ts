import { createContext } from "react";
import { valueRef } from "sosse/react";

export const ColorContext = createContext("yellow");

export const colorRef = valueRef("");
