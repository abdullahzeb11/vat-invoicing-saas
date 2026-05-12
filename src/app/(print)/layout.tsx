// The print route inherits the root <html>/<body> layout. Force a light, LTR canvas
// regardless of the user's locale or theme so the printed PDF is consistent.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white text-black light">{children}</div>;
}
