(function () {
  var storedTheme = window.localStorage.getItem('theme');
  if (
    storedTheme === 'dark' ||
    (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  }
})();
