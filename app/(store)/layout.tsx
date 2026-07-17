// Storefront layout — header, announcement bar and footer arrive in Phase 1.
export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
