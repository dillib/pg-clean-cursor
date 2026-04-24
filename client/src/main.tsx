import { createRoot } from "react-dom/client";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;
root.className = `${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`;

createRoot(root).render(<App />);
