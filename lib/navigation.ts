function normalizeHash(hash: string | null | undefined) {
  return (hash ?? "").replace(/^#/, "").trim();
}

function splitHref(href: string) {
  if (href.startsWith("#")) {
    return {
      pathname: "/",
      hash: normalizeHash(href),
    };
  }

  const [pathnamePart, hashPart] = href.split("#");

  return {
    pathname: pathnamePart || "/",
    hash: normalizeHash(hashPart),
  };
}

export function isHrefActive(
  currentPathname: string,
  currentHash: string,
  href: string,
) {
  const target = splitHref(href);

  if (target.hash) {
    return currentPathname === target.pathname && currentHash === target.hash;
  }

  if (target.pathname === "/") {
    return currentPathname === "/";
  }

  return (
    currentPathname === target.pathname ||
    currentPathname.startsWith(`${target.pathname}/`)
  );
}

export function isPathActive(currentPathname: string, pathname: string) {
  if (pathname === "/") {
    return currentPathname === "/";
  }

  return (
    currentPathname === pathname ||
    currentPathname.startsWith(`${pathname}/`)
  );
}

export function readWindowHash() {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeHash(window.location.hash);
}
