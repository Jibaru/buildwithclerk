export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl bg-gray-950 text-gray-50 ring-[0.5px] ring-white/10 ring-inset">
      {label ? (
        <div className="hairline-b flex items-center justify-between px-4 py-2 text-2xs text-gray-400">
          <span className="font-mono">{label}</span>
        </div>
      ) : null}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  )
}
