let currentData;
if (typeof document != "undefined") {
  const els = document.getElementsByClassName("sosse-html-data");
  if (els.length > 0) {
    currentData = JSON.parse(els[0].innerHTML);
  }
}

export const htmlData = function (newData?) {
  if (newData !== undefined) {
    currentData = newData;
  }

  return currentData;
};
