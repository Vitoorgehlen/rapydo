"use client";  

import { useState } from "react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Pega o caminho atual da URL

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="header">
      <div className="boxTitle">
        <Link href="/" className="title">
          <h1 className="title-name">
            ra<span className="py">PY</span>do
          </h1>
        </Link>

        {/* Menu para desktop */}
        <div className="desktop-menu">
          <Link className="links-header" href={`/posts`}>Posts</Link>
          <Link className="links-header" href={`/categorias`}>Categorias</Link>
        </div>

        {/* Menu hambúrguer para mobile */}
        <div className="hamburger-menu">
            <div onClick={toggleMenu} className="hamburger-icon">
                {menuOpen ? (
                    <FontAwesomeIcon icon={faXmark} />
                ) : (
                    <FontAwesomeIcon icon={faBars} />
                )}
            </div>
          {menuOpen && (
            <div className="menu">
              <Link className="links-header" href={`/posts`}>Posts</Link>
              <Link className="links-header" href={`/categorias`}>Categorias</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
