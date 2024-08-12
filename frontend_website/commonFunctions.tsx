export function regenerateResponse(setRegenerateFlag, setIsContentLoadedHook, setWebContentHook, message) {
  setRegenerateFlag(true);
  setIsContentLoadedHook(false);
  setWebContentHook(message);
}

export function handleChangeToContent(e, setEditedContentHook) {
  setEditedContentHook(e.target.value); // Update the edited content state
}
export function handleSaving(setIsEditingHook, setWebContentHook, editedContent) {
  setIsEditingHook(false);
  setWebContentHook(editedContent)
}

export function formatHTML(html:string):string {
    // Regular expression to match HTML tags and format it nicely when editing
  const tagRegex = /(<\/\w+[^>]*>)/g;
  // Replace matches with newline after the tag
  return html.replace(tagRegex, '$1\n').replace(/\n\s*\n/g, '\n').trim();
}

export function _convertResponseIntoHtml(response) {
    const final_string = "<p>" + response.replace(/`/g, "</p><p>") + "</p>";
    return final_string;
}