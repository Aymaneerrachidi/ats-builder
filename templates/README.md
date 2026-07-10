# Resume LaTeX templates

Each `.tex` file here is a Handlebars template (compiled with `noEscape: true`
in [`src/lib/latex/render.ts`](../src/lib/latex/render.ts)). All resume data
is escaped for LaTeX and hyperlinks are precomputed as full `\href{}{}`
snippets **before** reaching these templates — see `toLatexContext` in that
file for the exact shape available here (`name`, `title`, `email`,
`emailHref`, `phone`, `location`, `summary`, `experience[]`, `education[]`,
`projects[]`, `skills[]`, `languages[]`, `certifications[]`, `links[]`, plus
`has*` booleans for conditional sections).

## The brace-guard rule (read before editing)

Handlebars treats `{{{` / `}}}` (three braces) as a special "unescaped"
mustache. If a literal LaTeX brace ends up directly touching a `{{`/`}}`
mustache delimiter with no separator, **three things can happen, all bad**:

- `\textbf{{{position}}}` silently compiles to `\textbfEngineer` — both
  literal braces vanish, no error, broken LaTeX.
- `{\LARGE {{name}}}` throws a hard Handlebars **parse error** at build time.
- Either way, this is never what you want.

**Rule:** whenever a mustache sits directly inside a LaTeX brace group
(e.g. as the argument to `\textbf{...}`, `{\LARGE ...}`, `\textit{...}`),
pad both sides with `\relax{}` — a genuine TeX no-op with zero visual effect:

```latex
\textbf{\relax{}{{position}}\relax{}}
{\LARGE \relax{}{{name}}\relax{}}
```

Mustaches that are **not** touching a literal brace need no guard —
`\item {{this}}`, `{{company}} -- {{location}}`, `{{#each skills}}...`, etc.
are all safe as-is.

**Hyperlinks are the one place this guard must never be used**: the `\relax{}`
trick is safe inside a command's *display* argument (typeset normally), but
`\href`'s first argument is the literal URL — inserting `\relax{}` there
would corrupt the link target. That's why links are precomputed as whole
`{{href}}` snippets (e.g. `{{emailHref}}`, `{{this.href}}`) in `render.ts`
instead of being assembled from separate `{{url}}`/`{{label}}` mustaches
inside a template-level `\href{...}{...}`.

## The `\\` line-break rule

A literal `\\` (LaTeX line break) placed with **zero gap** before a mustache
tag gets one of its backslashes silently eaten — Handlebars treats a single
backslash directly before `{{` as "escape this mustache" and `\\` as an
escaped backslash followed by a normal tag, not as two literal backslashes.
`{{location}}\\{{/if}}` renders as `Remote\` (one backslash) instead of
`Remote\\` (a real LaTeX line break).

**Rule:** always put a real newline (or at minimum a space) between a
trailing `\\` and the next `{{` tag:

```latex
{{#if hasLocation}}{{location}}\\
{{/if}}
```

## Design constraints (all templates)

Single-column, no tables, no icons, no text boxes/color blocks behind text —
these are ATS-parser-safe by construction. Visual differentiation between
templates comes from the preamble (fonts, section-title treatment, spacing,
section ordering), not from structural tricks that would confuse a resume
parser.
