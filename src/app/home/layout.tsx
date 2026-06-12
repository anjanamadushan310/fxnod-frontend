/**
 * Layout for the `/home` route group.
 *
 * Renders the TopNav once and gives the page a sticky-aware container.
 * The Sidebar + MobileTabBar live inside the page itself so they can share
 * `active` state with the section components (Real/Demo, etc.).
 */
import { TopNav } from "@/components/layout/TopNav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      {children}
    </>
  );
}
