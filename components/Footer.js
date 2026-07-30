export default function Footer() {
  return (
    <footer className="border-t border-line/80 mt-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-px bg-gradient-to-r from-transparent via-cobalt to-transparent shadow-glow-sm" />
      <div className="max-w-5xl mx-auto px-5 py-8 text-center">
        <p className="font-display text-xs uppercase tracking-widest text-muted">
          All Rights Reserved by JK Reserves
        </p>
      </div>
    </footer>
  );
}