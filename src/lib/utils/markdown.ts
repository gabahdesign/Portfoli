export function renderMarkdown(text: string): string {
  if (!text) return "";
  
  return text
    // Replace bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace italic (*text*)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Replace newlines with <br />
    .replace(/\n/g, '<br />');
}
