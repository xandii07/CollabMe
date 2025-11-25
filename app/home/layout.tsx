"use client";

import "../globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="home-wrapper">

      {/* Conteúdo da página */}
      <div className="home-content">{children}</div>

      {/* MENU INFERIOR FIXO */}
      <nav className="bottom-nav">
        <Link href="/home/feed" className={pathname === "/home/feed" ? "active" : ""}>
          <span>🏠</span>
          <p>Feed</p>
        </Link>

        <Link href="/home/explore" className={pathname === "/home/explore" ? "active" : ""}>
          <span>🔍</span>
          <p>Explorar</p>
        </Link>

        <Link href="/home/create" className={pathname === "/home/create" ? "active" : ""}>
          <span>➕</span>
          <p>Criar</p>
        </Link>

        <Link href="/home/chat" className={pathname === "/home/chat" ? "active" : ""}>
          <span>💬</span>
          <p>Chats</p>
        </Link>

        <Link href="/home/profile" className={pathname === "/home/profile" ? "active" : ""}>
          <span>👤</span>
          <p>Perfil</p>
        </Link>
      </nav>
    </div>
  );
}
