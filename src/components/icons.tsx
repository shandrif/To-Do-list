// Lucide icons (ISC licence, https://lucide.dev) inlined so the app has no icon dependency.
import { createElement, type JSX, type SVGProps } from "react";

type Node = [string, Record<string, string>];
export type IconProps = SVGProps<SVGSVGElement>;
export type Icon = (props: IconProps) => JSX.Element;

function make(nodes: Node[]): Icon {
  const C = (props: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {nodes.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
  return C;
}

export const Plus = make([["path",{"d":"M5 12h14"}],["path",{"d":"M12 5v14"}]]);
export const Search = make([["circle",{"cx":"11","cy":"11","r":"8"}],["path",{"d":"m21 21-4.3-4.3"}]]);
export const LogOut = make([["path",{"d":"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{"points":"16 17 21 12 16 7"}],["line",{"x1":"21","x2":"9","y1":"12","y2":"12"}]]);
export const Layers = make([["path",{"d":"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"}],["path",{"d":"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"}],["path",{"d":"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"}]]);
export const Hourglass = make([["path",{"d":"M5 22h14"}],["path",{"d":"M5 2h14"}],["path",{"d":"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"}],["path",{"d":"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"}]]);
export const Zap = make([["path",{"d":"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]]);
export const CheckCircle2 = make([["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m9 12 2 2 4-4"}]]);
export const ShieldAlert = make([["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{"d":"M12 8v4"}],["path",{"d":"M12 16h.01"}]]);
export const Inbox = make([["polyline",{"points":"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{"d":"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]]);
export const Radio = make([["path",{"d":"M4.9 19.1C1 15.2 1 8.8 4.9 4.9"}],["path",{"d":"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"}],["circle",{"cx":"12","cy":"12","r":"2"}],["path",{"d":"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"}],["path",{"d":"M19.1 4.9C23 8.8 23 15.1 19.1 19"}]]);
export const ListChecks = make([["path",{"d":"m3 17 2 2 4-4"}],["path",{"d":"m3 7 2 2 4-4"}],["path",{"d":"M13 6h8"}],["path",{"d":"M13 12h8"}],["path",{"d":"M13 18h8"}]]);
export const Radar = make([["path",{"d":"M19.07 4.93A10 10 0 0 0 6.99 3.34"}],["path",{"d":"M4 6h.01"}],["path",{"d":"M2.29 9.62A10 10 0 1 0 21.31 8.35"}],["path",{"d":"M16.24 7.76A6 6 0 1 0 8.23 16.67"}],["path",{"d":"M12 18h.01"}],["path",{"d":"M17.99 11.66A6 6 0 0 1 15.77 16.67"}],["circle",{"cx":"12","cy":"12","r":"2"}],["path",{"d":"m13.41 10.59 5.66-5.66"}]]);
export const ChevronRight = make([["path",{"d":"m9 18 6-6-6-6"}]]);
export const ScanLine = make([["path",{"d":"M3 7V5a2 2 0 0 1 2-2h2"}],["path",{"d":"M17 3h2a2 2 0 0 1 2 2v2"}],["path",{"d":"M21 17v2a2 2 0 0 1-2 2h-2"}],["path",{"d":"M7 21H5a2 2 0 0 1-2-2v-2"}],["path",{"d":"M7 12h10"}]]);
export const Fingerprint = make([["path",{"d":"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"}],["path",{"d":"M14 13.12c0 2.38 0 6.38-1 8.88"}],["path",{"d":"M17.29 21.02c.12-.6.43-2.3.5-3.02"}],["path",{"d":"M2 12a10 10 0 0 1 18-6"}],["path",{"d":"M2 16h.01"}],["path",{"d":"M21.8 16c.2-2 .131-5.354 0-6"}],["path",{"d":"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"}],["path",{"d":"M8.65 22c.21-.66.45-1.32.57-2"}],["path",{"d":"M9 6.8a6 6 0 0 1 9 5.2v2"}]]);
export const Play = make([["polygon",{"points":"6 3 20 12 6 21 6 3"}]]);
export const RotateCcw = make([["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]]);
export const Pencil = make([["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{"d":"m15 5 4 4"}]]);
export const Trash2 = make([["path",{"d":"M3 6h18"}],["path",{"d":"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{"d":"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{"x1":"10","x2":"10","y1":"11","y2":"17"}],["line",{"x1":"14","x2":"14","y1":"11","y2":"17"}]]);
export const Clock = make([["circle",{"cx":"12","cy":"12","r":"10"}],["polyline",{"points":"12 6 12 12 16 14"}]]);
export const User = make([["path",{"d":"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"}],["circle",{"cx":"12","cy":"7","r":"4"}]]);
export const Tag = make([["path",{"d":"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{"cx":"7.5","cy":"7.5","r":".5","fill":"currentColor"}]]);
export const AlarmClock = make([["circle",{"cx":"12","cy":"13","r":"8"}],["path",{"d":"M12 9v4l2 2"}],["path",{"d":"M5 3 2 6"}],["path",{"d":"m22 6-3-3"}],["path",{"d":"M6.38 18.7 4 21"}],["path",{"d":"M17.64 18.67 20 21"}]]);
export const X = make([["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]]);
export const Rocket = make([["path",{"d":"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"}],["path",{"d":"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"}],["path",{"d":"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"}],["path",{"d":"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"}]]);
export const CalendarClock = make([["path",{"d":"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{"d":"M16 2v4"}],["path",{"d":"M8 2v4"}],["path",{"d":"M3 10h5"}],["path",{"d":"M17.5 17.5 16 16.3V14"}],["circle",{"cx":"16","cy":"16","r":"6"}]]);
export const WifiOff = make([["path",{"d":"M12 20h.01"}],["path",{"d":"M8.5 16.429a5 5 0 0 1 7 0"}],["path",{"d":"M5 12.859a10 10 0 0 1 5.17-2.69"}],["path",{"d":"M19 12.859a10 10 0 0 0-2.007-1.523"}],["path",{"d":"M2 8.82a15 15 0 0 1 4.177-2.643"}],["path",{"d":"M22 8.82a15 15 0 0 0-11.288-3.764"}],["path",{"d":"m2 2 20 20"}]]);
