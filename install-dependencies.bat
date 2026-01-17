@echo off
echo Installing required dependencies for live preview, rich text editor, and drag-and-drop...
echo.

cd client

echo Installing TipTap rich text editor...
call npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight @tiptap/extension-link @tiptap/extension-image

echo.
echo Installing React Beautiful DnD for drag-and-drop...
call npm install react-beautiful-dnd @hello-pangea/dnd

echo.
echo Installing React Split Pane for live preview...
call npm install react-split-pane

echo.
echo All dependencies installed successfully!
pause
