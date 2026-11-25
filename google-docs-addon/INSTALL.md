# Put "✨ Mimi" inside her Google Doc (2 minutes, done once by Omar)

1. Open the mémoire Google Doc (your account, the owner).
2. Menu **Extensions → Apps Script**.
3. In `Code.gs`, delete everything and paste the content of `Code.gs` from this folder.
4. Click **＋** next to "Files" → **HTML** → name it `Sidebar` (exactly) → paste `Sidebar.html`.
5. On the left, **Services ＋** → **Drive API** → Add (so it can read and resolve comments).
6. Click 💾 **Save**, select the function `showSidebar` at the top, click **▶ Run**.
   Google asks for permission → your account → *Advanced* → *Go to project (unsafe)* → Allow.
   (It says "unsafe" only because the script is yours and not published on the store.)
7. Reload the Doc: a **✨ Mimi** menu appears next to "Help".

Mimi sees the menu too (she has edit access). The first time she opens it, Google asks her the same permission once.

## How she uses it
- **Select** a passage → click Améliorer / Corriger / Raccourcir / Ajouter sources… → **Remplacer**.
- **Highlight** with Google's highlighter: yellow = improve, pink/red = check, green = expand, blue = add sources → **Traiter mes surlignages**.
- **Comment** a passage ("trop long", "ajoute un chiffre") → **Traiter mes commentaires** → it edits and resolves the comment.
- Nothing changes in the doc until she clicks **Remplacer** or **Insérer dessous**.
