export default function SelloExpediente({ codigo, fecha, size = "md" }) {
  const dims = size === "lg" ? "h-28 w-28" : "h-20 w-20";
  const textSize = size === "lg" ? "text-[9px]" : "text-[7px]";
  return (
    <div
      className={`relative ${dims} shrink-0 rounded-full border-[3px] border-sello/70 flex flex-col items-center justify-center text-sello rotate-[-8deg] select-none`}
      style={{
        borderStyle: "double",
      }}
      aria-hidden="true"
    >
      <span className={`${textSize} font-bold tracking-widest uppercase`}>Mesa de Partes</span>
      <span className="font-display text-[10px] font-bold leading-tight mt-0.5">{codigo}</span>
      {fecha && <span className={`${textSize} mt-0.5 opacity-80`}>{fecha}</span>}
    </div>
  );
}
