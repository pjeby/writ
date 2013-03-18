writ
====

> Thus, programs must be written for people to read, and only incidentally for
> machines to execute.
>
> -- Hal Abelson, [SICP][sicp]


**Writ** is an attempt to enable a light-weight literate programming workflow.


How it works
------------

You write [Markdown][md] files with your code in normal [Markdown][md] code
blocks (indented or fenced) and then run the **writ** command to compile to
source files your language's compiler or interpreter will understand.

**Writ** expects a one-to-one mapping between [Markdown][md] source files and
source files in the target language, and uses a simple extension-based
convention for generating the target files: a [Markdown][md] file named
`foo.js.md` or `foo.js.markdown` will generate a `foo.js` file.


Installation and Usage
----------------------

**Writ** is available on [npm][npm].

    npm install -g writ

To use it, just run `writ` from the command line, specifying which
[Markdown][md] files you want to compile. By default, it compiles the output in
the same directory, you can pass the `--dir` flag to specify a different
destination directory:

    writ "src/*.md" --dir build


Syntax
------

In the simplest case, if your code is completely straight-line, top-to-bottom,
you don't need to know any syntax: **writ** will generate the target file by
concatenating all the code blocks in the order they appear. This is exactly how
[literate CoffeeScript][litcoffee] works.

For slightly more involved cases, **writ** supports 3 bits of syntax:

1. `//!! .*[ !!//]` for ignoring a code block
2. `//== name[ ==//]` for naming a code block
3. `//:: name[ :://]` for including a code block

The `//` bits are configurable and are defaulted to the single-line comment
token for your language.

The 'closing tags' (`!!//`, `==//`, and `:://`) are optional, but must match
the opening tag if present.


### Ignoring Code Blocks

To keep a code block from being included in the generated output, start the
code block with a line starting with:

    //!! This is an ignored code block


### Naming and Dereferencing Code Blocks

A named code block is any code block in the document that starts with a line of
the form:

    //== name[ ==//]

You can later (or earlier) include that code in another block by dereferencing
it with `//::`.

So the following [Markdown][md]:

    # Main code chunk

    ```js
    //:: requires :://
    ```

    ```js
    //== requires ==//

    var marked = require('marked');
    var fs = require('fs');
    ```

Would compile to:

```js
var marked = require('marked');
var fs = require('fs');
```

A name for sections can have internal whitespace, but it obviously should match
up exactly when dereferencing names.

A few things to note about named sections:

1. Named sections that are never referenced by a 'top-level' code block won't
   show up in the compiled output.

2. If a name is referenced that doesn't exist, that comment line will remain
   as-is in the compiled output.

3. Named sections can refer to other named sections, and **writ** will whine if
   it has to recurse more than 50 times when compiling.

4. If you have multiple named sections with the same name, they'll get
   concatenated together in the order they appear in the source.


Libraries Built With Writ
-------------------------

* This one, of course. See `writ.js.md` for the source.

If you build something using **writ**, send a pull request adding a link to
your library.


[sicp]: http://mitpress.mit.edu/sicp/
[litcoffee]: http://ashkenas.com/literate-coffeescript/
[md]: http://daringfireball.net/projects/markdown/
[shebang]: http://en.wikipedia.org/wiki/Shebang_(Unix)
[npm]: https://npmjs.org/
