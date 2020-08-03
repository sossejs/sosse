import { createContext } from "react";
import { valueRef } from "sosse/preact";

export const ColorContext = createContext("yellow");

export const colorRef = valueRef("");
