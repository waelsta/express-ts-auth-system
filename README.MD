# ts project setup :

- enforce types using typescript 💪
- find ,fix bugs and make codebase look clean using linting rules with eslint 🧹 ✨
- using prettier with custom rules to write code with style 💅
- using husky to create git hook to prevent bad commits 🚫 🐶

---

setting up husky 🐶 :

1- _install :_

`pnpm add -D husky`

2- _initialize: _
this command is required before running the command in step 3

`pnpm husky install`

3- _add hooks:_

`pnpm husky add .husky/pre-commit "pnpm run prettier-format && npm run lint"`

> lint and format code before any commit
> if there was no linting errors the commit will be accomplished

`pnpm husky add .husky/commit-msg 'npx commitlint --edit $1'`

> create a commit message hook that will check if the commit message
> meets the conventional commits specifications
