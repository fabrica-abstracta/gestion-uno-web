import type { ReactNode } from "react";

export const icons: Record<string, ReactNode> = {
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
  ),
  enterprise: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff"><path d="M480-340q33 0 56.5-23.5T560-420q0-33-23.5-56.5T480-500q-33 0-56.5 23.5T400-420q0 33 23.5 56.5T480-340ZM160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z" /></svg>
  ),
  locationOn: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
  ),
  postman: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#FF6C37"><path d="M13.527.099C6.955-.744.942 3.9.099 10.473c-.843 6.572 3.8 12.584 10.373 13.428 6.573.843 12.587-3.801 13.428-10.374C24.744 6.955 20.101.943 13.527.099zm2.471 7.485a.855.855 0 0 0-.593.25l-4.453 4.453-.307-.307-.643-.643c4.389-4.376 5.18-4.418 5.996-3.753zm-4.863 4.861l4.44-4.44a.62.62 0 1 1 .847.903l-4.699 4.125-.588-.588zm.33.694l-1.1.238a.06.06 0 0 1-.067-.032.06.06 0 0 1 .01-.073l.645-.645.512.512zm-2.803-.459l1.172-1.172.879.878-1.979.426a.074.074 0 0 1-.085-.039.072.072 0 0 1 .013-.093zm-3.646 6.058a.076.076 0 0 1-.069-.083.077.077 0 0 1 .022-.046h.002l.946-.946 1.222 1.222-2.123-.147zm2.425-1.256a.228.228 0 0 0-.117.256l.203.865a.125.125 0 0 1-.211.117h-.003l-.934-.934-.294-.295 3.762-3.758 1.82-.393.874.874c-1.255 1.102-2.971 2.201-5.1 3.268zm5.279-3.428h-.002l-.839-.839 4.699-4.125a.952.952 0 0 0 .119-.127c-.148 1.345-2.029 3.245-3.977 5.091zm3.657-6.46l-.003-.002a1.822 1.822 0 0 1 2.459-2.684l-1.61 1.613a.119.119 0 0 0 0 .169l1.247 1.247a1.817 1.817 0 0 1-2.093-.343zm2.578 0a1.714 1.714 0 0 1-.271.218h-.001l-1.207-1.207 1.533-1.533c.661.72.637 1.832-.054 2.522zM18.855 6.05a.143.143 0 0 0-.053.157.416.416 0 0 1-.053.45.14.14 0 0 0 .023.197.141.141 0 0 0 .084.03.14.14 0 0 0 .106-.05.691.691 0 0 0 .087-.751.138.138 0 0 0-.194-.033z" /></svg>
  ),
  copy: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b7280" > <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
  ),
  more: (
    <>➕</>
  ),
  menu: (
    <>🟰</>
    // <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg>
  ),
  less: (
    <>➖</>
  ),
  close: (
    <>❌</>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" > <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg >
  ),
  delete: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
  ),
  version: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>
  ),
  box: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  fileText: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 3v5h5M16 13H8M16 17H8M10 9H8" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M12 5v14M5 12h14" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  minus: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M5 12h14" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  eye: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth={2} stroke="currentColor" fill="none" /><circle cx="12" cy="12" r="3" strokeWidth={2} stroke="currentColor" fill="none" /></svg>
  ),
  checkCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  arrowLeft: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 12H5M12 19l-7-7 7-7" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  package: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="22.08" x2="12" y2="12" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  tag: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  folder: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  ruler: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  arrows: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><polyline points="17 1 21 5 17 9" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 11V9a4 4 0 0 1 4-4h14" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><polyline points="7 23 3 19 7 15" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 13v2a4 4 0 0 1-4 4H3" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
}