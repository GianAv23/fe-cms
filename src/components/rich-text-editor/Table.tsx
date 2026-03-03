import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";
import { useEffect, useReducer } from "react";
import { Toggle } from "../ui/toggle";

const Table = ({ editor }: { editor: Editor | null }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      forceUpdate();
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Helper function to get current column count
  const getCurrentColumnCount = () => {
    const { state } = editor;
    const { selection } = state;
    const pos = selection.$anchor;

    for (let i = pos.depth; i > 0; i--) {
      const node = pos.node(i);
      if (node.type.name === "table") {
        const firstRow = node.child(0);
        return firstRow.childCount;
      }
    }
    return 0;
  };

  const currentColumnCount = getCurrentColumnCount();
  const maxColumns = 3;
  const hasMaxColumns = currentColumnCount >= maxColumns;

  const Options = [
    {
      text: "Insert Table",
      onClick: () => {
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
      pressed: false,
    },
    {
      text: "Delete Table",
      onClick: () => {
        editor.chain().focus().deleteTable().run();
      },
      pressed: false,
      disabled: !editor.can().deleteTable(),
    },
    {
      text: "Add Column Before",
      onClick: () => {
        editor.chain().focus().addColumnBefore().run();
      },
      pressed: false,
      disabled: !editor.can().addColumnBefore() || hasMaxColumns,
    },
    {
      text: "Add Column After",
      onClick: () => {
        editor.chain().focus().addColumnAfter().run();
      },
      pressed: false,
      disabled: !editor.can().addColumnAfter() || hasMaxColumns,
    },
    {
      text: "Delete Column",
      onClick: () => {
        editor.chain().focus().deleteColumn().run();
      },
      pressed: false,
      disabled: !editor.can().deleteColumn(),
    },
    {
      text: "Add Row Before",
      onClick: () => {
        editor.chain().focus().addRowBefore().run();
      },
      pressed: false,
      disabled: !editor.can().addRowBefore(),
    },
    {
      text: "Add Row After",
      onClick: () => {
        editor.chain().focus().addRowAfter().run();
      },
      pressed: false,
      disabled: !editor.can().addRowAfter(),
    },
    {
      text: "Delete Row",
      onClick: () => {
        editor.chain().focus().deleteRow().run();
      },
      pressed: false,
      disabled: !editor.can().deleteRow(),
    },
    {
      text: "Merge Cells",
      onClick: () => {
        editor.chain().focus().mergeCells().run();
      },
      pressed: false,
      disabled: !editor.can().mergeCells(),
    },
    {
      text: "Split Cells",
      onClick: () => {
        editor.chain().focus().splitCell().run();
      },
      pressed: false,
      disabled: !editor.can().splitCell(),
    },
  ];

  return (
    <div className="mb-1 flex w-fit flex-col gap-0.5 space-x-2 rounded-md border p-1">
      <span className="text-muted-foreground p-1 text-sm font-medium">
        Table Menu
      </span>
      <div className="flex flex-wrap gap-1">
        {Options.map((option, index) => (
          <Toggle
            key={index}
            disabled={option.disabled}
            variant={"outline"}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            className={cn(
              "cursor-pointer rounded-sm px-4 data-[state=on]:bg-black data-[state=on]:text-white",
            )}
          >
            {option.text}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default Table;
