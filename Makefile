writ: clean
	@node writ.js writ.js.md

test:
	@node test/test.js

clean:
	@rm -f writ.js

.PHONY: writ clean test publish
