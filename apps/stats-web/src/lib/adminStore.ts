import { writable } from "svelte/store";

export const services = writable({} as { [key: string]: Service });