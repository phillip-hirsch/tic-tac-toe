import type { Ref } from "react";
import { primaryButton } from "./buttons.ts";
import { defaultName, type Mark, maxNameLength, type Names } from "./game.ts";

type Props = {
  drafts: Names;
  onStart: (names: Names) => void;
  xNameRef: Ref<HTMLInputElement>;
};

export function Setup({ drafts, onStart, xNameRef }: Props) {
  return (
    <form
      className="flex w-full max-w-xs flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = (mark: Mark) => {
          const value = data.get(mark);
          return typeof value === "string" ? value : "";
        };
        onStart({ X: name("X"), O: name("O") });
      }}
    >
      <NameField mark="X" defaultValue={drafts.X} inputRef={xNameRef} />
      <NameField mark="O" defaultValue={drafts.O} />
      <button type="submit" className={`${primaryButton} self-center`}>
        Start
      </button>
    </form>
  );
}

function NameField({
  mark,
  defaultValue,
  inputRef,
}: {
  mark: Mark;
  defaultValue: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const id = `name-${mark}`;
  return (
    <div className="grid grid-cols-[auto_1fr] items-end gap-x-4">
      <span aria-hidden className="row-span-2 font-display text-6xl leading-none">
        {mark}
      </span>
      <label htmlFor={id}>Who plays {mark}?</label>
      <input
        ref={inputRef}
        id={id}
        name={mark}
        defaultValue={defaultValue}
        placeholder={defaultName(mark)}
        maxLength={maxNameLength}
        autoComplete="off"
        className="min-h-11 w-full min-w-0 border-b-2 border-grid bg-transparent text-xl placeholder:text-ink/75"
      />
    </div>
  );
}
