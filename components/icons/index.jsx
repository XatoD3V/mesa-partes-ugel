/**
 * Set de íconos propios "Legajo" — trazo tipo pluma/tinta, esquinas suaves,
 * pensado para el sistema de Mesa de Partes UGEL.
 *
 * Misma API que lucide-react: <Icono size={20} className="..." />
 * así que reemplazar un ícono es solo cambiar el import, nada más.
 */

function base(props, children) {
  const { size = 20, strokeWidth = 1.75, className = "", ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function Bell(props) {
  return base(
    props,
    <>
      <path d="M12 4.2c-2.9 0-4.6 2.1-4.6 5v2.9c0 .9-.4 1.8-1.1 2.5L5.5 15.3c-.6.6-.2 1.7.7 1.7h11.6c.9 0 1.3-1.1.7-1.7l-.8-.7c-.7-.7-1.1-1.6-1.1-2.5V9.2c0-2.9-1.7-5-4.6-5Z" />
      <path d="M10.3 19.2a1.9 1.9 0 0 0 3.4 0" />
      <circle cx="12" cy="3.3" r="0.6" fill="currentColor" stroke="none" />
    </>
  );
}

export function Building2(props) {
  return base(
    props,
    <>
      <path d="M4 20.5V6.8c0-.6.4-1.1 1-1.3l6-2c.5-.2 1 .2 1 .8V20.5" />
      <path d="M12 10.5l6.2 1.9c.5.2.8.6.8 1.1v7" />
      <path d="M4 20.5h16" />
      <path d="M7.2 8.5h.01M7.2 11.7h.01M7.2 14.9h.01M9.8 8.5h.01M9.8 11.7h.01M9.8 14.9h.01" />
      <path d="M14.7 15.3h.01M17.3 15.3h.01M14.7 18h.01M17.3 18h.01" />
    </>
  );
}

export function LogIn(props) {
  return base(
    props,
    <>
      <path d="M9.5 4h-3A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h3" />
      <path d="M13 8.3l3.7 3.7-3.7 3.7" />
      <path d="M16.5 12H9.8" />
    </>
  );
}

export function AlertCircle(props) {
  return base(
    props,
    <>
      <path d="M12 3.3c-4.8 0-8.7 3.9-8.7 8.7s3.9 8.7 8.7 8.7 8.7-3.9 8.7-8.7-3.9-8.7-8.7-8.7Z" />
      <path d="M12 7.8v5" />
      <circle cx="12" cy="16.3" r="0.7" fill="currentColor" stroke="none" />
    </>
  );
}

export function Plus(props) {
  return base(
    props,
    <>
      <path d="M12 4.5v15" />
      <path d="M4.5 12h15" />
    </>
  );
}

export function Star(props) {
  return base(
    props,
    <path d="M12 3.5l2.4 5.3 5.7.6-4.3 3.9 1.2 5.7L12 16l-5 3 1.2-5.7-4.3-3.9 5.7-.6L12 3.5Z" />
  );
}

export function Eye(props) {
  return base(
    props,
    <>
      <path d="M2.7 12S6 5.8 12 5.8 21.3 12 21.3 12 18 18.2 12 18.2 2.7 12 2.7 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  );
}

export function EyeOff(props) {
  return base(
    props,
    <>
      <path d="M4 4l16 16" />
      <path d="M10.6 6.1c.5-.1.9-.2 1.4-.2 6 0 9.3 6.1 9.3 6.1a15.4 15.4 0 0 1-3 3.8M6.8 7.5C4.2 9.3 2.7 12 2.7 12s3.3 6.1 9.3 6.1c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.7 10.1a2.6 2.6 0 0 0 3.6 3.7" />
    </>
  );
}

export function Trash2(props) {
  return base(
    props,
    <>
      <path d="M4.5 7h15" />
      <path d="M9 7V5.3c0-.5.4-.8.9-.8h4.2c.5 0 .9.3.9.8V7" />
      <path d="M6.5 7l.7 12c0 .8.7 1.5 1.5 1.5h6.6c.8 0 1.5-.7 1.5-1.5l.7-12" />
      <path d="M10.3 10.8v6M13.7 10.8v6" />
    </>
  );
}

export function Users(props) {
  return base(
    props,
    <>
      <circle cx="9" cy="8.3" r="3" />
      <path d="M3.5 19.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M15.8 5.6c1.4.3 2.4 1.5 2.4 3s-1 2.7-2.4 3" />
      <path d="M18 14.3c2 .4 3.5 2.2 3.5 4.4" />
    </>
  );
}

export function Search(props) {
  return base(
    props,
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M15.6 15.6l4.9 4.9" />
    </>
  );
}

export function FileWarning(props) {
  return base(
    props,
    <>
      <path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.2" />
      <path d="M12 12v3.2" />
      <circle cx="12" cy="17.6" r="0.6" fill="currentColor" stroke="none" />
    </>
  );
}

export function UserPlus(props) {
  return base(
    props,
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3.3 2.5-5.7 5.5-5.7s5.5 2.4 5.5 5.7" />
      <path d="M18 8.3v5M15.6 10.8h4.8" />
    </>
  );
}

export function CheckCircle2(props) {
  return base(
    props,
    <>
      <path d="M12 3.3c-4.8 0-8.7 3.9-8.7 8.7s3.9 8.7 8.7 8.7 8.7-3.9 8.7-8.7-3.9-8.7-8.7-8.7Z" />
      <path d="M8.3 12.2l2.4 2.4 5-5.2" />
    </>
  );
}

export function FileDown(props) {
  return base(
    props,
    <>
      <path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.2" />
      <path d="M12 11v6M9.5 14.7l2.5 2.5 2.5-2.5" />
    </>
  );
}

export function FileText(props) {
  return base(
    props,
    <>
      <path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.2" />
      <path d="M9 12.3h6M9 15.3h6M9 18.3h3.5" />
    </>
  );
}

export function Inbox(props) {
  return base(
    props,
    <>
      <path d="M4 12.5l2.6-7.3A1.5 1.5 0 0 1 8 4.2h8a1.5 1.5 0 0 1 1.4 1L20 12.5" />
      <path d="M4 12.5h4.7l1 2.1h4.6l1-2.1H20v5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-5Z" />
    </>
  );
}

export function ArrowRight(props) {
  return base(
    props,
    <>
      <path d="M4.5 12h14.2" />
      <path d="M13.5 6.5l5.2 5.5-5.2 5.5" />
    </>
  );
}

export function Clock3(props) {
  return base(
    props,
    <>
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 7v5.2l4 2" />
    </>
  );
}

export function Clock(props) {
  return base(
    props,
    <>
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 7.3v4.9l3.4 2" />
    </>
  );
}

export function ShieldCheck(props) {
  return base(
    props,
    <>
      <path d="M12 3.2l7 2.6v6c0 4.6-3 7.9-7 9-4-1.1-7-4.4-7-9v-6l7-2.6Z" />
      <path d="M8.6 12.2l2.4 2.4 4.4-4.6" />
    </>
  );
}

export function Megaphone(props) {
  return base(
    props,
    <>
      <path d="M3.5 10.2v3.6c0 .8.6 1.4 1.4 1.4h1.3l2 4.3c.2.5.7.8 1.2.6l1-.4a1 1 0 0 0 .5-1.3l-1.6-3.4 9.7-3v-.1c0-4.7-3.3-8.6-9-9.5v10Z" />
      <path d="M6.2 15.2v3.4c0 .5.4 1 1 1h.8" />
    </>
  );
}

export function MessageCircle(props) {
  return base(
    props,
    <path d="M21 11.5c0 4.3-4 7.8-9 7.8-1 0-2-.1-2.8-.4L4 20.5l1-3.7A7.5 7.5 0 0 1 3 11.5C3 7.2 7 3.7 12 3.7s9 3.5 9 7.8Z" />
  );
}

export function Menu(props) {
  return base(
    props,
    <>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </>
  );
}

export function X(props) {
  return base(
    props,
    <>
      <path d="M5.5 5.5l13 13" />
      <path d="M18.5 5.5l-13 13" />
    </>
  );
}

export function UploadCloud(props) {
  return base(
    props,
    <>
      <path d="M7.5 17.5h9a3.5 3.5 0 0 0 .8-6.9 5 5 0 0 0-9.5-1.9 4 4 0 0 0-.3 8.8Z" />
      <path d="M12 16v-6M9.3 12.7l2.7-2.7 2.7 2.7" />
    </>
  );
}

export function Send(props) {
  return base(
    props,
    <path d="M4 4.5l16.5 7.5L4 19.5l1.8-7L4 4.5Zm1.8 7h6.4" />
  );
}

export function AlertTriangle(props) {
  return base(
    props,
    <>
      <path d="M12 3.7l9.3 16.1a1 1 0 0 1-.9 1.5H3.6a1 1 0 0 1-.9-1.5L12 3.7Z" />
      <path d="M12 9.5v4.3" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  );
}

export function Archive(props) {
  return base(
    props,
    <>
      <path d="M3.5 5.3A1 1 0 0 1 4.5 4.3h15a1 1 0 0 1 1 1V8h-17V5.3Z" />
      <path d="M4.5 8h15v10.7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V8Z" />
      <path d="M10 12.2h4" />
    </>
  );
}

export function ArrowLeft(props) {
  return base(
    props,
    <>
      <path d="M19.5 12H5.3" />
      <path d="M10.5 6.5L5.3 12l5.2 5.5" />
    </>
  );
}

export function BarChart3(props) {
  return base(
    props,
    <>
      <path d="M4.5 20V9.5" />
      <path d="M11 20V4" />
      <path d="M17.5 20v-7" />
      <path d="M3.5 20.5h17" />
    </>
  );
}

export function FolderClock(props) {
  return base(
    props,
    <>
      <path d="M3.5 7.3c0-.6.5-1 1-1h4.6l1.6 2h8.3c.6 0 1 .5 1 1v9.4c0 .6-.4 1-1 1H4.5c-.5 0-1-.4-1-1V7.3Z" />
      <circle cx="15.3" cy="14.8" r="3.3" fill="var(--icon-bg,#fff)" />
      <path d="M15.3 13.2v1.6l1.1 1" />
    </>
  );
}

export function Hash(props) {
  return base(
    props,
    <>
      <path d="M9.3 3.5L7.5 20.5M16.5 3.5l-1.8 17" />
      <path d="M3.8 8.8h16.4M3.2 15.2h16.4" />
    </>
  );
}

export function ImageIcon(props) {
  return base(
    props,
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="M4 17l5.2-5.2a1.5 1.5 0 0 1 2.1 0L15 15.4M14 14.4l1.5-1.5a1.5 1.5 0 0 1 2.1 0l2.4 2.4" />
    </>
  );
}

export function LayoutDashboard(props) {
  return base(
    props,
    <>
      <rect x="3.5" y="3.5" width="7.5" height="8.5" rx="1.2" />
      <rect x="13" y="3.5" width="7.5" height="5.2" rx="1.2" />
      <rect x="13" y="10.7" width="7.5" height="9.8" rx="1.2" />
      <rect x="3.5" y="14" width="7.5" height="6.5" rx="1.2" />
    </>
  );
}

export function LogOut(props) {
  return base(
    props,
    <>
      <path d="M14.5 4h3A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-3" />
      <path d="M11 8.3l-3.7 3.7 3.7 3.7" />
      <path d="M7.5 12h6.7" />
    </>
  );
}

export function Palette(props) {
  return base(
    props,
    <>
      <path d="M12 3.5c-4.8 0-8.5 3.6-8.5 8 0 3.2 2.3 4.2 3.9 4.2.9 0 1.2-.5 1.2-1 0-.4-.3-.8-.3-1.5 0-1.6 1.4-2.9 3.3-2.9 3 0 5.4-1.9 5.4-4.7 0-1.1-2-2.1-4.9-2.1Z" />
      <circle cx="7.6" cy="10.3" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
    </>
  );
}

export function Paperclip(props) {
  return base(
    props,
    <path d="M17.5 8.3l-8 8a3 3 0 0 1-4.2-4.2l8.4-8.4a2 2 0 0 1 2.8 2.8L8 15a1 1 0 0 1-1.4-1.4l7-7" />
  );
}

export function RotateCcw(props) {
  return base(
    props,
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M3.5 4.5v4.5H8" />
    </>
  );
}

export function Settings(props) {
  return base(
    props,
    <>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 4.3v1.9M12 17.8v1.9M19.7 12h-1.9M6.2 12H4.3M17.4 6.6l-1.3 1.3M7.9 16.1l-1.3 1.3M17.4 17.4l-1.3-1.3M7.9 7.9 6.6 6.6" />
    </>
  );
}
