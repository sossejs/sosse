import { createContext } from "preact";
import { valueRef } from "sosse/iso";

export const ColorContext = createContext("yellow");

export const colorRef = valueRef("");
