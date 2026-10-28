/*
  Copies text to the clipboard. Used by the Copy buttons
  (CopyEmail.tsx and CopyCode.tsx). Returns true if it worked.
*/
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or no permission: copy from a hidden text box instead
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    box.remove();
    return ok;
  }
}
