import React from "react";

const NavbarHeaderContext = React.createContext({
  headerContent: null,
  setHeaderContent: () => {},
});

export function NavbarHeaderProvider({ children }) {
  const [headerContent, setHeaderContent] = React.useState(null);
  return (
    <NavbarHeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </NavbarHeaderContext.Provider>
  );
}

/**
 * Hook for pages to set their header content into the navbar.
 * Call setNavbarHeader(reactNode) in each listing page.
 * Call setNavbarHeader(null) on unmount to reset.
 */
export function useNavbarHeader() {
  const { setHeaderContent } = React.useContext(NavbarHeaderContext);

  const setNavbarHeader = React.useCallback((content) => {
    setHeaderContent(content);
  }, [setHeaderContent]);

  // Auto-cleanup on unmount
  React.useEffect(() => {
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return { setNavbarHeader };
}

/**
 * Hook for DashboardNavbar to read the current header content.
 */
export function useNavbarHeaderContent() {
  const { headerContent } = React.useContext(NavbarHeaderContext);
  return headerContent;
}
