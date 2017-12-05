let pauseEvent = (e): boolean => {
  if (e.stopPropagation)
    e.stopPropagation();
  if (e.preventDefault)
    e.preventDefault();
  return false;
}

export let common = {
  pauseEvent
}