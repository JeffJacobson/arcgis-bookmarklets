(() => {
  let url = new URL(location.href);
  // Get the names of params that are empty.
  const params = Array.from(url.searchParams.entries()).filter(([key, value]) => {
    return value !== "" && value !== "false" && value !== "esriDefault"
  });

  const newSearchParams = new URLSearchParams();
  for (const [k, v] of params) {
    newSearchParams.append(k, v);
  }

  url = new URL(url.href.replace(/\?.+$/, ""));
  url.search = newSearchParams
  console.log(url);
})();