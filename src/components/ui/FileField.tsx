"use client";

import { type DragEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type FileFieldProps = {
  id: string;
  name: string;
  label: string;
  accept: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

/**
 * A document upload (e.g. a CV) as a dashed drop area in the site's field style: click to choose
 * a file or drop one on it. Once chosen it shows the file's name and size with a way to remove it.
 * The real input stays in the form, so the file is sent with the rest of the answers.
 */
export function FileField({
  id,
  name,
  label,
  accept,
  required,
  hint,
  error,
  className,
}: FileFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [over, setOver] = useState(false);

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped || !input.current) return;
    const list = new DataTransfer();
    list.items.add(dropped);
    input.current.files = list.files;
    setFile(dropped);
  };

  const clear = () => {
    if (input.current) input.current.value = "";
    setFile(null);
  };

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-2 sm:col-span-2", className)}>
      <span className="text-body-sm text-ink">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </span>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-md border border-dashed bg-white px-4 py-4 transition-colors duration-300",
          error
            ? "border-alert"
            : over
              ? "border-deep bg-turquoise-5"
              : "border-ink/25 hover:border-deep",
        )}
      >
        <Icon
          name={file ? "check" : "download"}
          className={cn("size-5 shrink-0 text-turquoise", !file && "rotate-180")}
        />
        <span className="flex min-w-0 flex-col">
          {file ? (
            <>
              <span className="truncate text-body-md text-ink">{file.name}</span>
              <span className="text-body-xs text-slate">{formatSize(file.size)}</span>
            </>
          ) : (
            <>
              <span className="text-body-md text-ink">
                <span className="font-medium text-turquoise-160">Choose a file</span> or drop it
                here
              </span>
              {hint ? (
                <span id={`${id}-hint`} className="text-body-xs text-slate">
                  {hint}
                </span>
              ) : null}
            </>
          )}
        </span>
        <input
          ref={input}
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
      {file ? (
        <button
          type="button"
          onClick={clear}
          className="w-fit text-body-xs text-slate underline underline-offset-4 hover:text-ink"
        >
          Remove file
        </button>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
