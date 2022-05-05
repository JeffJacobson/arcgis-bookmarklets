(() => {
  // Get the current URL.
  let url = new URL(location.href);
  // Get the names of params that are not empty or otherwise should not be removed.
  const params = Array.from(url.searchParams.entries()).filter(([key, value]) => {
    return value !== "" && value !== "false" && value !== "esriDefault"
  });

  // Create a new URLSearchParams object and
  // populate with only the filtered list
  // of params.
  const newSearchParams = new URLSearchParams();
  for (const [k, v] of params) {
    newSearchParams.append(k, v);
  }

  // Create the new URL and set its search to
  // the filtered list of parameters.
  url = new URL(url.href.replace(/\?.+$/, ""));
  url.search = newSearchParams
  history.replaceState(null, "", url);
})();