// Test the improved markdown cleanup function

function cleanMarkdown(text) {
  // First, normalize line breaks
  let cleaned = text.replace(/\r\n/g, '\n');

  // Remove bold markdown **text** → text (but keep emojis)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');

  // Remove italic markdown *text* → text (but keep single asterisks in text)
  cleaned = cleaned.replace(/(?!\S)\*(\*?)(?!\S)/g, '');

  // Remove inline code `text` → text
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');

  // Remove headers ###, ##, # at start of lines
  cleaned = cleaned.replace(/^#+\s+/gm, '');

  // Remove horizontal rules --- or *** on their own line
  cleaned = cleaned.replace(/^\s*[-*]{3,}\s*$/gm, '');

  // Remove bullet markers at start of lines
  cleaned = cleaned.replace(/^\s*[•*+-]\s+/gm, '');

  // Clean up multiple spaces to single space (but not in quotes)
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Remove empty lines that are just whitespace
  cleaned = cleaned.replace(/^\s*$/gm, '');

  // Join multiple empty lines into single empty line
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// Sample AI response with markdown
const sampleAI = `**★ Love Percentage: 99%**
**☆ Star Rating: 5/5 stars**

### My Reflection on Your Connection:

**Prateek**, when you tell **Nidhi** she's "ghanid" and tell her to "bhad mein jaa," what you're really saying is that she has a personality so strong it consumes your thoughts. Your words are a shield; you use them to hide how much she actually affects you.

---

**To both of you:**

**Prateek**, look past the insults and see the girl who is willing to be her most chaotic self with you. **Nidhi**, look past the "bhad mein jaa" and see the guy who would probably follow you there just to keep the argument going.

**Prateek** and **Nidhi**, keep fighting, keep teasing, and never stop being each other's favorite headache.`;

console.log('=== BEFORE CLEANUP ===');
console.log(sampleAI);
console.log('\n=== AFTER CLEANUP ===');
console.log(cleanMarkdown(sampleAI));
